from rest_framework import serializers

from campaigns.models import Campaign
from campaigns.serializers import CampaignSerializer

from .models import Donation


class DonationSerializer(serializers.ModelSerializer):
    campaign = CampaignSerializer(read_only=True)
    campaign_id = serializers.PrimaryKeyRelatedField(
        source="campaign",
        queryset=Campaign.objects.all(),
        write_only=True,
    )
    donor_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            "id",
            "donor_name",
            "campaign",
            "campaign_id",
            "amount",
            "message",
            "is_anonymous",
            "created_at",
        ]
        read_only_fields = ["id", "donor_name", "created_at"]

    def get_donor_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.donor.get_full_name() or obj.donor.username

    def validate_campaign_id(self, campaign):
        if campaign.status != Campaign.Status.APPROVED:
            raise serializers.ValidationError(
                "Only approved campaigns can receive donations."
            )
        return campaign
