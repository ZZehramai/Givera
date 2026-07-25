from django.utils import timezone
from rest_framework import serializers

from .models import Campaign


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
