from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from uuid import uuid4
from rest_framework import generics, permissions, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from campaigns.models import Campaign
from campaigns.services import campaign_is_due, complete_campaign_if_due

from .models import DemoPayment, Donation
from .serializers import AdminDonationSerializer, AdminPaymentSerializer, DemoPaymentCreateSerializer, DemoPaymentSerializer, DonationSerializer
from .certificates import donation_certificate_response


class DonationCreateView(generics.CreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [IsAdmin]

    @transaction.atomic
    def perform_create(self, serializer):
        campaign = Campaign.objects.select_for_update().get(
            pk=serializer.validated_data["campaign"].pk
        )
        if complete_campaign_if_due(campaign) or campaign.status != Campaign.Status.APPROVED:
            raise serializers.ValidationError("This campaign can no longer receive donations.")
        donation = serializer.save(donor=self.request.user, campaign=campaign)
        campaign.amount_raised += donation.amount
        if campaign_is_due(campaign):
            campaign.status = Campaign.Status.COMPLETED
        campaign.save(update_fields=["amount_raised", "status", "updated_at"])


class MyDonationListView(generics.ListAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Donation.objects.filter(donor=self.request.user).select_related(
            "donor", "campaign", "campaign__owner"
        )


class AdminDonationPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class AdminDonationListView(generics.ListAPIView):
    serializer_class = AdminDonationSerializer
    permission_classes = [IsAdmin]
    pagination_class = AdminDonationPagination

    def get_queryset(self):
        queryset = Donation.objects.select_related("donor", "campaign", "campaign__owner").select_related("demo_payment")
        query = self.request.query_params.get("q", "").strip()
        if query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(donor__email__icontains=query)
                | Q(donor__username__icontains=query)
                | Q(donor__first_name__icontains=query)
                | Q(donor__last_name__icontains=query)
                | Q(campaign__title__icontains=query)
                | Q(demo_payment__transaction_reference__icontains=query)
            )
        return queryset


class DemoPaymentCreateView(generics.CreateAPIView):
    """Creates a wallet transfer reference before the donor scans the QR."""

    serializer_class = DemoPaymentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(
            donor=self.request.user,
            transaction_reference=f"GIV-{timezone.now():%Y%m%d}-{uuid4().hex[:6].upper()}",
            expires_at=timezone.now() + timedelta(hours=24),
        )
        return Response(DemoPaymentSerializer(payment, context={"request": request}).data, status=status.HTTP_201_CREATED)


class DemoPaymentProofView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        payment = get_object_or_404(DemoPayment, pk=pk, donor=request.user)
        if payment.status not in {DemoPayment.Status.PENDING, DemoPayment.Status.FAILED}:
            return Response({"detail": "This transfer can no longer accept payment proof."}, status=status.HTTP_400_BAD_REQUEST)
        receipt = request.FILES.get("receipt")
        wallet_transaction_id = request.data.get("wallet_transaction_id", "").strip()
        if not receipt and not wallet_transaction_id:
            return Response({"detail": "Upload a receipt or enter the wallet transaction number."}, status=status.HTTP_400_BAD_REQUEST)
        if receipt:
            if not getattr(receipt, "content_type", "").startswith("image/"):
                return Response({"detail": "The receipt must be an image."}, status=status.HTTP_400_BAD_REQUEST)
            if receipt.size > 5 * 1024 * 1024:
                return Response({"detail": "The receipt image must be 5 MB or smaller."}, status=status.HTTP_400_BAD_REQUEST)
        if wallet_transaction_id and DemoPayment.objects.exclude(pk=payment.pk).filter(wallet_transaction_id__iexact=wallet_transaction_id).exists():
            return Response({"detail": "This wallet transaction number has already been submitted."}, status=status.HTTP_400_BAD_REQUEST)
        if receipt:
            payment.receipt = receipt
        payment.wallet_transaction_id = wallet_transaction_id or None
        payment.status = DemoPayment.Status.SUBMITTED
        payment.proof_submitted_at = timezone.now()
        payment.failure_reason = ""
        payment.reviewed_by = None
        payment.reviewed_at = None
        payment.save(update_fields=["receipt", "wallet_transaction_id", "status", "proof_submitted_at", "failure_reason", "reviewed_by", "reviewed_at"])
        return Response(DemoPaymentSerializer(payment, context={"request": request}).data)


class AdminPaymentListView(generics.ListAPIView):
    serializer_class = AdminPaymentSerializer
    permission_classes = [IsAdmin]
    pagination_class = AdminDonationPagination

    def get_queryset(self):
        queryset = DemoPayment.objects.select_related("donor", "campaign", "campaign__owner", "donation", "reviewed_by")
        query = self.request.query_params.get("q", "").strip()
        if query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(donor__email__icontains=query)
                | Q(donor__username__icontains=query)
                | Q(campaign__title__icontains=query)
                | Q(transaction_reference__icontains=query)
                | Q(wallet_transaction_id__icontains=query)
            )
        return queryset


class AdminPaymentReviewView(APIView):
    permission_classes = [IsAdmin]

    @transaction.atomic
    def post(self, request, pk):
        payment = get_object_or_404(
            DemoPayment.objects.select_for_update().select_related("campaign", "donation"),
            pk=pk,
        )
        decision = request.data.get("decision")
        reason = request.data.get("reason", "").strip()
        if decision not in {"verify", "reject"}:
            return Response({"detail": "Choose verify or reject."}, status=status.HTTP_400_BAD_REQUEST)
        if payment.status != DemoPayment.Status.SUBMITTED:
            return Response({"detail": "Only transfers pending verification can be reviewed."}, status=status.HTTP_400_BAD_REQUEST)
        if decision == "reject":
            if not reason:
                return Response({"detail": "Add a rejection reason."}, status=status.HTTP_400_BAD_REQUEST)
            payment.status = DemoPayment.Status.FAILED
            payment.failure_reason = reason
            payment.reviewed_by = request.user
            payment.reviewed_at = timezone.now()
            payment.save(update_fields=["status", "failure_reason", "reviewed_by", "reviewed_at"])
            return Response(AdminPaymentSerializer(payment, context={"request": request}).data)

        campaign = Campaign.objects.select_for_update().get(pk=payment.campaign_id)
        donation = Donation.objects.create(
            donor=payment.donor,
            campaign=campaign,
            amount=payment.amount,
            message=payment.message,
            is_anonymous=payment.is_anonymous,
        )
        campaign.amount_raised += payment.amount
        if campaign_is_due(campaign):
            campaign.status = Campaign.Status.COMPLETED
        campaign.save(update_fields=["amount_raised", "status", "updated_at"])
        payment.status = DemoPayment.Status.PAID
        payment.donation = donation
        payment.completed_at = timezone.now()
        payment.reviewed_by = request.user
        payment.reviewed_at = timezone.now()
        payment.failure_reason = ""
        payment.save(update_fields=["status", "donation", "completed_at", "reviewed_by", "reviewed_at", "failure_reason"])
        return Response(AdminPaymentSerializer(payment, context={"request": request}).data)


class DemoPaymentConfirmView(APIView):
    """Completes a demo checkout and creates the donation exactly once."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        payment = get_object_or_404(
            DemoPayment.objects.select_for_update().select_related("campaign", "donation"),
            pk=pk,
            donor=request.user,
        )
        if payment.status == DemoPayment.Status.PAID:
            return Response(DemoPaymentSerializer(payment).data)
        if payment.status != DemoPayment.Status.PENDING:
            return Response({"detail": "This demo checkout is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)
        if payment.expires_at <= timezone.now():
            payment.status = DemoPayment.Status.EXPIRED
            payment.save(update_fields=["status"])
            return Response({"detail": "This demo checkout has expired."}, status=status.HTTP_400_BAD_REQUEST)
        campaign = Campaign.objects.select_for_update().get(pk=payment.campaign_id)
        if complete_campaign_if_due(campaign) or campaign.status != Campaign.Status.APPROVED:
            return Response({"detail": "This campaign can no longer receive donations."}, status=status.HTTP_400_BAD_REQUEST)

        donation = Donation.objects.create(
            donor=request.user,
            campaign=campaign,
            amount=payment.amount,
            message=payment.message,
            is_anonymous=payment.is_anonymous,
        )
        campaign.amount_raised += payment.amount
        if campaign_is_due(campaign):
            campaign.status = Campaign.Status.COMPLETED
        campaign.save(update_fields=["amount_raised", "status", "updated_at"])
        payment.status = DemoPayment.Status.PAID
        payment.donation = donation
        payment.completed_at = timezone.now()
        payment.save(update_fields=["status", "donation", "completed_at"])
        return Response(DemoPaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class DemoPaymentSimulateView(APIView):
    """Acts like a provider webhook in demo mode; it never contacts a wallet."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        outcome = request.data.get("outcome")
        if outcome not in {"success", "failed", "cancelled"}:
            return Response({"outcome": "Choose success, failed, or cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        payment = get_object_or_404(
            DemoPayment.objects.select_for_update().select_related("campaign", "donation"),
            pk=pk,
            donor=request.user,
        )
        if outcome == "success":
            # Reuse the exact confirmation logic used by the successful callback path.
            return DemoPaymentConfirmView().post(request, pk)
        if payment.status != DemoPayment.Status.PENDING:
            return Response({"detail": "This demo checkout is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)
        payment.status = DemoPayment.Status.FAILED if outcome == "failed" else DemoPayment.Status.CANCELLED
        payment.failure_reason = "Insufficient demo wallet balance." if outcome == "failed" else "Cancelled by donor."
        payment.save(update_fields=["status", "failure_reason"])
        return Response(DemoPaymentSerializer(payment).data)


class MyDemoPaymentListView(generics.ListAPIView):
    serializer_class = DemoPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DemoPayment.objects.filter(donor=self.request.user).select_related("donation", "campaign")


class DemoPaymentCertificateView(APIView):
    """Downloads a certificate for the authenticated donor's verified transfer."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        payment = get_object_or_404(
            DemoPayment.objects.select_related("donor", "campaign", "donation"),
            pk=pk,
            donor=request.user,
        )
        if payment.status != DemoPayment.Status.PAID or not payment.donation_id:
            return Response(
                {"detail": "A certificate is available only after an administrator verifies the transfer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return donation_certificate_response(payment)
