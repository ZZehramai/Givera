from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Notification
from accounts.permissions import IsAdmin

from .models import Campaign, CampaignUpdate, FundUtilization
from .serializers import AdminCampaignSerializer, CampaignReviewSerializer, CampaignSerializer, CampaignUpdateSerializer, FundUtilizationReviewSerializer, FundUtilizationSerializer


class CampaignListCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Campaign.objects.filter(status=Campaign.Status.APPROVED).select_related("owner")
        query = self.request.query_params.get("q", "").strip()
        category = self.request.query_params.get("category", "").strip()
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(summary__icontains=query)
                | Q(story__icontains=query)
                | Q(location__icontains=query)
            )
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status=Campaign.Status.PENDING)


class CampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CampaignSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Campaign.objects.select_related("owner")
        user = self.request.user
        if user.is_authenticated:
            if user.is_admin_role or user.is_staff:
                return queryset
            return queryset.filter(
                Q(status=Campaign.Status.APPROVED) | Q(owner=user)
            ).distinct()
        return queryset.filter(status=Campaign.Status.APPROVED)

    def perform_update(self, serializer):
        campaign = self.get_object()
        if campaign.owner != self.request.user:
            raise PermissionDenied("Only the campaign owner can edit this campaign.")
        if campaign.status not in {Campaign.Status.DRAFT, Campaign.Status.PENDING, Campaign.Status.REJECTED}:
            raise ValidationError("Approved or completed campaigns cannot be edited.")
        serializer.save(status=Campaign.Status.PENDING, rejection_reason="")

    def perform_destroy(self, instance):
        if (
            instance.owner != self.request.user
            and not self.request.user.is_admin_role
            and not self.request.user.is_staff
        ):
            raise PermissionDenied("Only the campaign owner can delete this campaign.")
        if (
            not self.request.user.is_admin_role
            and not self.request.user.is_staff
            and instance.status not in {
            Campaign.Status.DRAFT,
            Campaign.Status.PENDING,
            Campaign.Status.REJECTED,
            }
        ):
            raise ValidationError("Approved or completed campaigns cannot be deleted.")
        instance.delete()


class MyCampaignListView(generics.ListAPIView):
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Campaign.objects.filter(owner=self.request.user).select_related("owner")


class PendingCampaignListView(generics.ListAPIView):
    serializer_class = CampaignSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Campaign.objects.filter(status=Campaign.Status.PENDING).select_related("owner")


class AdminCampaignListView(generics.ListAPIView):
    serializer_class = AdminCampaignSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Campaign.objects.select_related("owner")


class CampaignReviewView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        campaign = get_object_or_404(Campaign, pk=pk)
        serializer = CampaignReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        decision = serializer.validated_data["status"]

        if decision == Campaign.Status.APPROVED:
            campaign.status = Campaign.Status.APPROVED
            campaign.rejection_reason = ""
            campaign.approved_at = timezone.now()
        else:
            campaign.status = Campaign.Status.REJECTED
            campaign.rejection_reason = serializer.validated_data["rejection_reason"]
            campaign.approved_at = None

        campaign.save(
            update_fields=["status", "rejection_reason", "approved_at", "updated_at"]
        )
        if decision == Campaign.Status.APPROVED:
            Notification.objects.create(
                recipient=campaign.owner,
                type=Notification.Type.CAMPAIGN_APPROVED,
                title="Campaign approved",
                message=f'“{campaign.title}” is live and ready to receive support.',
                link=f"/campaigns/{campaign.pk}",
            )
        else:
            Notification.objects.create(
                recipient=campaign.owner,
                type=Notification.Type.CAMPAIGN_REJECTED,
                title="Campaign needs changes",
                message=f'“{campaign.title}” was not approved. Review the feedback and resubmit when ready.',
                link=f"/campaigns/{campaign.pk}",
            )
        return Response(CampaignSerializer(campaign).data, status=status.HTTP_200_OK)


class CampaignUpdateListCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignUpdateSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_campaign(self):
        campaign = get_object_or_404(Campaign.objects.select_related("owner"), pk=self.kwargs["pk"])
        user = self.request.user
        can_view = campaign.status == Campaign.Status.APPROVED or (
            user.is_authenticated and (campaign.owner == user or user.is_admin_role or user.is_staff)
        )
        if not can_view:
            raise PermissionDenied("This campaign is not available.")
        return campaign

    def get_queryset(self):
        return CampaignUpdate.objects.filter(campaign=self.get_campaign()).select_related("author")

    def perform_create(self, serializer):
        campaign = self.get_campaign()
        if campaign.owner != self.request.user:
            raise PermissionDenied("Only the campaign organizer can publish updates.")
        if campaign.status not in {Campaign.Status.APPROVED, Campaign.Status.COMPLETED}:
            raise ValidationError("Updates can only be published for approved or completed campaigns.")

        update = serializer.save(campaign=campaign, author=self.request.user)
        recipient_ids = campaign.donations.values_list("donor_id", flat=True).distinct()
        notifications = [
            Notification(
                recipient_id=recipient_id,
                type=Notification.Type.CAMPAIGN_UPDATE,
                title=f"New update: {campaign.title}",
                message=update.title,
                link=f"/campaigns/{campaign.pk}",
            )
            for recipient_id in recipient_ids
            if recipient_id != campaign.owner_id
        ]
        Notification.objects.bulk_create(notifications)


class CampaignDonorListView(generics.ListAPIView):
    """Public supporter list. Anonymous donors remain anonymous by design."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        campaign = get_object_or_404(Campaign, pk=kwargs["pk"], status=Campaign.Status.APPROVED)
        from donations.models import Donation

        donations = Donation.objects.filter(campaign=campaign).select_related("donor")
        supporters = [
            {
                "id": str(donation.id),
                "donor_name": "Anonymous" if donation.is_anonymous else (donation.donor.get_full_name() or donation.donor.username),
                "amount": donation.amount,
                "created_at": donation.created_at,
            }
            for donation in donations
        ]
        return Response(supporters)


class FundUtilizationListCreateView(generics.ListCreateAPIView):
    serializer_class = FundUtilizationSerializer

    def get_permissions(self):
        return [IsAdmin()] if self.request.method == "POST" else [permissions.AllowAny()]

    def get_campaign(self):
        campaign = get_object_or_404(Campaign.objects.select_related("owner"), pk=self.kwargs["pk"])
        user = self.request.user
        can_view = campaign.status == Campaign.Status.APPROVED or (user.is_authenticated and (campaign.owner == user or user.is_admin_role or user.is_staff))
        if not can_view:
            raise PermissionDenied("This campaign is not available.")
        return campaign

    def get_queryset(self):
        campaign = self.get_campaign()
        user = self.request.user
        queryset = FundUtilization.objects.filter(campaign=campaign)
        if not (user.is_authenticated and (campaign.owner == user or user.is_admin_role or user.is_staff)):
            queryset = queryset.filter(status=FundUtilization.Status.APPROVED)
        return queryset

    def perform_create(self, serializer):
        campaign = self.get_campaign()
        if campaign.status not in {Campaign.Status.APPROVED, Campaign.Status.COMPLETED}:
            raise ValidationError("Spending reports can only be added to an approved or completed campaign.")
        serializer.save(
            campaign=campaign,
            submitted_by=self.request.user,
            status=FundUtilization.Status.APPROVED,
            reviewed_at=timezone.now(),
        )


class FundUtilizationReviewView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk, utilization_pk):
        utilization = get_object_or_404(FundUtilization, pk=utilization_pk, campaign_id=pk)
        serializer = FundUtilizationReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilization.status = serializer.validated_data["status"]
        utilization.review_note = serializer.validated_data.get("review_note", "")
        utilization.reviewed_at = timezone.now()
        utilization.save(update_fields=["status", "review_note", "reviewed_at", "updated_at"])
        return Response(FundUtilizationSerializer(utilization).data)
