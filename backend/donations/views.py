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
from .serializers import AdminDonationSerializer, DemoPaymentCreateSerializer, DemoPaymentSerializer, DonationSerializer


class DonationCreateView(generics.CreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

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
    """Starts a visual-only local-wallet checkout. No money leaves a wallet."""

    serializer_class = DemoPaymentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(
            donor=self.request.user,
            transaction_reference=f"GIV-{timezone.now():%Y%m%d}-{uuid4().hex[:6].upper()}",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        return Response(DemoPaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


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
