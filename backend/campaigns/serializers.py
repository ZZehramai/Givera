from django.utils import timezone
from rest_framework import serializers

from .models import Campaign, CampaignUpdate, FundUtilization


class CampaignSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

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

    class Meta:
        model = CampaignUpdate
        fields = ["id", "campaign", "author", "author_name", "title", "body", "created_at", "updated_at"]
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
            raise serializers.ValidationError("Evidence image must be 5 MB or smaller.")
        return value


class FundUtilizationReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[FundUtilization.Status.APPROVED, FundUtilization.Status.REJECTED])
    review_note = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs["status"] == FundUtilization.Status.REJECTED and not attrs.get("review_note", "").strip():
            raise serializers.ValidationError({"review_note": "Explain what needs to be changed."})
        return attrs
