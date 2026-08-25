from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Notification
from accounts.permissions import IsAdmin

from .models import Campaign, CampaignMedia, CampaignUpdate, FundUtilization, Comment
from .serializers import AdminCampaignSerializer, CampaignManagementSerializer, CampaignMediaSerializer, CampaignRecommendationRequestSerializer, CampaignReviewSerializer, CampaignSerializer, CampaignUpdateSerializer, FundUtilizationReviewSerializer, FundUtilizationSerializer, MAX_CAMPAIGN_MEDIA_FILES, validate_campaign_cover_upload, validate_campaign_media_upload, CommentSerializer
from .recommendations import recommend_campaigns
from .services import complete_campaign_if_due, complete_due_campaigns


class CampaignListCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        complete_due_campaigns()
        queryset = Campaign.objects.filter(status__in=[Campaign.Status.APPROVED, Campaign.Status.COMPLETED]).select_related("owner").prefetch_related("media_items")
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
        is_admin = self.request.user.is_admin_role or self.request.user.is_staff
        serializer.save(
            owner=self.request.user,
            status=Campaign.Status.APPROVED if is_admin else Campaign.Status.PENDING,
            approved_at=timezone.now() if is_admin else None,
        )

    def create(self, request, *args, **kwargs):
        files = request.FILES.getlist("cover_images")
        if len(files) > MAX_CAMPAIGN_MEDIA_FILES:
            raise ValidationError({"media": f"Upload no more than {MAX_CAMPAIGN_MEDIA_FILES} supporting files."})
        media_types = [validate_campaign_cover_upload(upload) for upload in files]
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            self.perform_create(serializer)
            campaign = serializer.instance
            CampaignMedia.objects.bulk_create([
                CampaignMedia(
                    campaign=campaign,
                    uploaded_by=request.user,
                    file=upload,
                    media_type=media_type,
                    purpose=CampaignMedia.Purpose.COVER,
                )
                for upload, media_type in zip(files, media_types)
            ])
        return Response(self.get_serializer(campaign).data, status=status.HTTP_201_CREATED)


class CampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CampaignSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        complete_due_campaigns()
        queryset = Campaign.objects.select_related("owner").prefetch_related("media_items")
        user = self.request.user
        if user.is_authenticated:
            if user.is_admin_role or user.is_staff:
                return queryset
            return queryset.filter(
                Q(status__in=[Campaign.Status.APPROVED, Campaign.Status.COMPLETED]) | Q(owner=user)
            ).distinct()
        return queryset.filter(status__in=[Campaign.Status.APPROVED, Campaign.Status.COMPLETED])

    def perform_update(self, serializer):
        campaign = self.get_object()
        is_admin = self.request.user.is_admin_role or self.request.user.is_staff
        if campaign.owner != self.request.user and not is_admin:
            raise PermissionDenied("Only the campaign owner can edit this campaign.")
        if is_admin:
            serializer.save()
            return
        if campaign.status not in {Campaign.Status.DRAFT, Campaign.Status.PENDING, Campaign.Status.REJECTED}:
            raise ValidationError("Approved or completed campaigns cannot be edited.")
        serializer.save(status=Campaign.Status.PENDING, rejection_reason="")

    def update(self, request, *args, **kwargs):
        files = request.FILES.getlist("cover_images")
        if len(files) > MAX_CAMPAIGN_MEDIA_FILES:
            raise ValidationError({"media": f"Upload no more than {MAX_CAMPAIGN_MEDIA_FILES} supporting files."})
        media_types = [validate_campaign_cover_upload(upload) for upload in files]
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            self.perform_update(serializer)
            CampaignMedia.objects.bulk_create([
                CampaignMedia(
                    campaign=instance,
                    uploaded_by=request.user,
                    file=upload,
                    media_type=media_type,
                    purpose=CampaignMedia.Purpose.COVER,
                )
                for upload, media_type in zip(files, media_types)
            ])
        return Response(self.get_serializer(instance).data)

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
        complete_due_campaigns(Campaign.objects.filter(owner=self.request.user))
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
        complete_due_campaigns()
        return Campaign.objects.select_related("owner")


class CampaignRecommendationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CampaignRecommendationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recommendations = recommend_campaigns(
            request.user,
            serializer.validated_data["saved_campaign_ids"],
        )
        campaign_data = CampaignSerializer(
            [item["campaign"] for item in recommendations],
            many=True,
            context={"request": request},
        ).data
        results = []
        for data, recommendation in zip(campaign_data, recommendations):
            results.append({
                **data,
                "recommendation_reason": recommendation["reason_code"],
                "recommendation_category": recommendation["reason_category"],
            })
        return Response({"results": results})


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
            complete_campaign_if_due(campaign)
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


class CampaignManagementView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        campaign = get_object_or_404(Campaign, pk=pk)
        serializer = CampaignManagementSerializer(
            data=request.data,
            context={"campaign": campaign},
        )
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        next_status = {
            "unpublish": Campaign.Status.UNPUBLISHED,
            "republish": Campaign.Status.APPROVED,
            "close": Campaign.Status.COMPLETED,
            "archive": Campaign.Status.ARCHIVED,
        }[action]
        campaign.status = next_status
        if action == "republish":
            campaign.approved_at = timezone.now()
        campaign.save(update_fields=["status", "approved_at", "updated_at"])

        if campaign.owner != request.user:
            action_labels = {
                "unpublish": "unpublished",
                "republish": "republished",
                "close": "closed",
                "archive": "archived",
            }
            Notification.objects.create(
                recipient=campaign.owner,
                type=Notification.Type.CAMPAIGN_UPDATE,
                title=f"Campaign {action_labels[action]}",
                message=f'“{campaign.title}” was {action_labels[action]} by a Givera administrator.',
                link=f"/campaigns/{campaign.pk}",
            )

        return Response(AdminCampaignSerializer(campaign).data, status=status.HTTP_200_OK)


class CampaignUpdateListCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignUpdateSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_campaign(self):
        complete_due_campaigns(Campaign.objects.filter(pk=self.kwargs["pk"]))
        campaign = get_object_or_404(Campaign.objects.select_related("owner"), pk=self.kwargs["pk"])
        user = self.request.user
        can_view = campaign.status in {Campaign.Status.APPROVED, Campaign.Status.COMPLETED} or (
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
        recipient_ids = campaign.donations.filter(
            donor__campaign_notifications_enabled=True,
        ).exclude(
            donor_id=campaign.owner_id,
        ).order_by().values_list("donor_id", flat=True).distinct()
        notifications = [
            Notification(
                recipient_id=recipient_id,
                type=Notification.Type.CAMPAIGN_UPDATE,
                title=f"New update: {campaign.title}",
                message=update.title,
                link=f"/campaigns/{campaign.pk}#latest-updates",
            )
            for recipient_id in recipient_ids
        ]
        Notification.objects.bulk_create(notifications)

    def create(self, request, *args, **kwargs):
        files = request.FILES.getlist("media")
        if len(files) > MAX_CAMPAIGN_MEDIA_FILES:
            raise ValidationError({"media": f"Upload no more than {MAX_CAMPAIGN_MEDIA_FILES} files per update."})
        media_types = [validate_campaign_media_upload(upload) for upload in files]
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            self.perform_create(serializer)
            update = serializer.instance
            CampaignMedia.objects.bulk_create([
                CampaignMedia(
                    campaign=update.campaign,
                    update=update,
                    uploaded_by=request.user,
                    file=upload,
                    media_type=media_type,
                )
                for upload, media_type in zip(files, media_types)
            ])
        return Response(self.get_serializer(update).data, status=status.HTTP_201_CREATED)


class CampaignMediaListCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignMediaSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_campaign(self):
        complete_due_campaigns(Campaign.objects.filter(pk=self.kwargs["pk"]))
        campaign = get_object_or_404(Campaign.objects.select_related("owner"), pk=self.kwargs["pk"])
        user = self.request.user
        can_view = campaign.status in {Campaign.Status.APPROVED, Campaign.Status.COMPLETED} or (
            user.is_authenticated and (campaign.owner == user or user.is_admin_role or user.is_staff)
        )
        if not can_view:
            raise PermissionDenied("This campaign is not available.")
        return campaign

    def get_queryset(self):
        return CampaignMedia.objects.filter(
            campaign=self.get_campaign(),
            update__isnull=True,
            purpose=CampaignMedia.Purpose.GALLERY,
        )

    def create(self, request, *args, **kwargs):
        campaign = self.get_campaign()
        if campaign.owner != request.user:
            raise PermissionDenied("Only the campaign organizer can manage gallery media.")
        files = request.FILES.getlist("files")
        if not files:
            raise ValidationError({"files": "Choose at least one image or video."})
        if len(files) > MAX_CAMPAIGN_MEDIA_FILES:
            raise ValidationError({"files": f"Upload no more than {MAX_CAMPAIGN_MEDIA_FILES} files at once."})
        media_types = [validate_campaign_media_upload(upload) for upload in files]
        caption = request.data.get("caption", "").strip()[:200]
        with transaction.atomic():
            items = CampaignMedia.objects.bulk_create([
                CampaignMedia(
                    campaign=campaign,
                    uploaded_by=request.user,
                    file=upload,
                    media_type=media_type,
                    purpose=CampaignMedia.Purpose.GALLERY,
                    caption=caption,
                )
                for upload, media_type in zip(files, media_types)
            ])
        return Response(self.get_serializer(items, many=True).data, status=status.HTTP_201_CREATED)


class CampaignMediaDetailView(generics.DestroyAPIView):
    serializer_class = CampaignMediaSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = "media_pk"

    def get_queryset(self):
        return CampaignMedia.objects.filter(campaign_id=self.kwargs["pk"], update__isnull=True)

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.campaign.owner != user and not user.is_admin_role and not user.is_staff:
            raise PermissionDenied("Only the campaign organizer or an administrator can remove this media.")
        stored_file = instance.file
        instance.delete()
        stored_file.delete(save=False)


class CampaignDonorListView(generics.ListAPIView):
    """Public supporter list. Anonymous donors remain anonymous by design."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        complete_due_campaigns(Campaign.objects.filter(pk=kwargs["pk"]))
        campaign = get_object_or_404(Campaign, pk=kwargs["pk"], status__in=[Campaign.Status.APPROVED, Campaign.Status.COMPLETED])
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
        complete_due_campaigns(Campaign.objects.filter(pk=self.kwargs["pk"]))
        campaign = get_object_or_404(Campaign.objects.select_related("owner"), pk=self.kwargs["pk"])
        user = self.request.user
        can_view = campaign.status in {Campaign.Status.APPROVED, Campaign.Status.COMPLETED} or (user.is_authenticated and (campaign.owner == user or user.is_admin_role or user.is_staff))
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
        report = serializer.save(
            campaign=campaign,
            submitted_by=self.request.user,
            status=FundUtilization.Status.APPROVED,
            reviewed_at=timezone.now(),
        )
        recipient_ids = campaign.donations.filter(
            donor__campaign_notifications_enabled=True,
        ).order_by().values_list("donor_id", flat=True).distinct()
        Notification.objects.bulk_create([
            Notification(
                recipient_id=recipient_id,
                type=Notification.Type.FUND_UTILIZATION,
                title=f"New spending report: {campaign.title}",
                message=report.title,
                link=f"/campaigns/{campaign.pk}#fund-utilization",
            )
            for recipient_id in recipient_ids
        ])


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

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        campaign_id = self.kwargs['campaign_id']
        return Comment.objects.filter(campaign_id=campaign_id)

    def perform_create(self, serializer):
        campaign_id = self.kwargs['campaign_id']
        serializer.save(author=self.request.user, campaign_id=campaign_id)
