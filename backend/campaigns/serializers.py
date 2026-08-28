from pathlib import Path

from django.utils import timezone
from rest_framework import serializers

from .models import Campaign, CampaignMedia, CampaignUpdate, FundUtilization, Comment


MAX_CAMPAIGN_MEDIA_SIZE = 25 * 1024 * 1024
MAX_CAMPAIGN_MEDIA_FILES = 6
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v"}


def validate_campaign_media_upload(upload):
    if upload.size > MAX_CAMPAIGN_MEDIA_SIZE:
        raise serializers.ValidationError(f"{upload.name} must be 25 MB or smaller.")

    extension = Path(upload.name).suffix.lower()
    content_type = (getattr(upload, "content_type", "") or "").lower()
    if extension in IMAGE_EXTENSIONS and content_type.startswith("image/"):
        return CampaignMedia.MediaType.IMAGE
    if extension in VIDEO_EXTENSIONS and content_type.startswith("video/"):
        return CampaignMedia.MediaType.VIDEO
    raise serializers.ValidationError(
        f"{upload.name} is not supported. Upload JPG, PNG, GIF, WebP, MP4, WebM, MOV, or M4V files."
    )


def validate_campaign_cover_upload(upload):
    if upload.size > 5 * 1024 * 1024:
        raise serializers.ValidationError(f"{upload.name} must be 5 MB or smaller.")
    extension = Path(upload.name).suffix.lower()
    content_type = (getattr(upload, "content_type", "") or "").lower()
    if extension in IMAGE_EXTENSIONS and content_type.startswith("image/"):
        return CampaignMedia.MediaType.IMAGE
    raise serializers.ValidationError(f"{upload.name} is not a supported cover image.")


class CampaignMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignMedia
        fields = ["id", "campaign", "update", "file", "media_type", "purpose", "caption", "created_at"]
        read_only_fields = ["id", "campaign", "update", "file", "media_type", "purpose", "created_at"]


class CampaignSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    gallery_media = serializers.SerializerMethodField()
    cover_media = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            "id",
            "owner",
            "owner_name",
            "owner_email",
            "title",
            "summary",
            "story",
            "category",
            "category_label",
            "beneficiary",
            "location",
            "goal_amount",
            "amount_raised",
            "progress_percentage",
            "cover_image",
            "gallery_media",
            "cover_media",
            "deadline",
            "status",
            "status_label",
            "rejection_reason",
            "approved_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "amount_raised",
            "status",
            "rejection_reason",
            "approved_at",
            "created_at",
            "updated_at",
        ]

    def get_owner_name(self, obj):
        return obj.owner.get_full_name() or obj.owner.username

    def get_gallery_media(self, obj):
        items = obj.media_items.filter(update__isnull=True, purpose=CampaignMedia.Purpose.GALLERY)
        return CampaignMediaSerializer(items, many=True, context=self.context).data

    def get_cover_media(self, obj):
        items = obj.media_items.filter(update__isnull=True, purpose=CampaignMedia.Purpose.COVER)
        return CampaignMediaSerializer(items, many=True, context=self.context).data

    def validate_cover_image(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Cover image must be 5 MB or smaller.")
        return value

    def validate_deadline(self, value):
        if value <= timezone.localdate():
            raise serializers.ValidationError("The deadline must be in the future.")
        return value


class CampaignReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[Campaign.Status.APPROVED, Campaign.Status.REJECTED]
    )
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if (
            attrs["status"] == Campaign.Status.REJECTED
            and not attrs.get("rejection_reason", "").strip()
        ):
            raise serializers.ValidationError(
                {"rejection_reason": "Give the organizer a reason for rejection."}
            )
        return attrs


class CampaignManagementSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=["unpublish", "republish", "close", "archive"]
    )

    def validate(self, attrs):
        campaign = self.context["campaign"]
        allowed_statuses = {
            "unpublish": {Campaign.Status.APPROVED},
            "republish": {Campaign.Status.UNPUBLISHED},
            "close": {Campaign.Status.APPROVED, Campaign.Status.UNPUBLISHED},
            "archive": {
                Campaign.Status.DRAFT,
                Campaign.Status.PENDING,
                Campaign.Status.APPROVED,
                Campaign.Status.REJECTED,
                Campaign.Status.COMPLETED,
                Campaign.Status.UNPUBLISHED,
            },
        }
        action = attrs["action"]
        if campaign.status not in allowed_statuses[action]:
            raise serializers.ValidationError(
                {"action": "This action is not available for the campaign's current status."}
            )
        return attrs


class CampaignRecommendationRequestSerializer(serializers.Serializer):
    saved_campaign_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list,
        max_length=100,
    )


class AdminCampaignSerializer(CampaignSerializer):
    owner_phone_number = serializers.CharField(source="owner.phone_number", read_only=True)
    owner_country = serializers.CharField(source="owner.country", read_only=True)
    owner_bio = serializers.CharField(source="owner.bio", read_only=True)
    owner_joined_at = serializers.DateTimeField(source="owner.created_at", read_only=True)

    class Meta(CampaignSerializer.Meta):
        fields = CampaignSerializer.Meta.fields + [
            "owner_phone_number",
            "owner_country",
            "owner_bio",
            "owner_joined_at",
        ]


class CampaignUpdateSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    media = CampaignMediaSerializer(many=True, read_only=True)

    class Meta:
        model = CampaignUpdate
        fields = ["id", "campaign", "author", "author_name", "title", "body", "media", "created_at", "updated_at"]
        read_only_fields = ["id", "campaign", "author", "author_name", "created_at", "updated_at"]

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username


class FundUtilizationSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = FundUtilization
        fields = ["id", "campaign", "submitted_by", "title", "description", "amount_spent", "spent_on", "evidence", "status", "status_label", "review_note", "reviewed_at", "created_at", "updated_at"]
        read_only_fields = ["id", "campaign", "submitted_by", "status", "status_label", "review_note", "reviewed_at", "created_at", "updated_at"]

    def validate_evidence(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("The attachment must be 5 MB or smaller.")
        return value


class FundUtilizationReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[FundUtilization.Status.APPROVED, FundUtilization.Status.REJECTED])
    review_note = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs["status"] == FundUtilization.Status.REJECTED and not attrs.get("review_note", "").strip():
            raise serializers.ValidationError({"review_note": "Explain what needs to be changed."})
        return attrs

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(
        source='user.username',
        read_only=True
    )
    content = serializers.CharField(
        source='comment_text'
    )

    class Meta:
        model = Comment
        fields = [
            'id',
            'campaign',
            'author',
            'content',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'campaign',
            'author',
            'created_at',
        ]