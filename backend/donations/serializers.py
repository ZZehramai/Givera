from rest_framework import serializers

from campaigns.models import Campaign
from campaigns.serializers import CampaignSerializer
from campaigns.services import complete_campaign_if_due

from .models import DemoPayment, Donation


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
        complete_campaign_if_due(campaign)
        if campaign.status != Campaign.Status.APPROVED:
            raise serializers.ValidationError(
                "Only approved campaigns can receive donations."
            )
        return campaign


class AdminDonationSerializer(DonationSerializer):
    donor_email = serializers.EmailField(source="donor.email", read_only=True)
    donor_phone_number = serializers.CharField(source="donor.phone_number", read_only=True)
    campaign_title = serializers.CharField(source="campaign.title", read_only=True)
    campaign_owner_name = serializers.SerializerMethodField()
    payment_reference = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    payment_status_label = serializers.SerializerMethodField()

    class Meta(DonationSerializer.Meta):
        fields = DonationSerializer.Meta.fields + [
            "donor_email", "donor_phone_number", "campaign_title", "campaign_owner_name",
            "payment_reference", "payment_method", "payment_status", "payment_status_label",
        ]

    def get_campaign_owner_name(self, obj):
        return obj.campaign.owner.get_full_name() or obj.campaign.owner.username

    def get_payment_reference(self, obj):
        return getattr(getattr(obj, "demo_payment", None), "transaction_reference", "—")

    def get_payment_method(self, obj):
        payment = getattr(obj, "demo_payment", None)
        return payment.get_provider_display() if payment else "Manual record"

    def get_payment_status(self, obj):
        payment = getattr(obj, "demo_payment", None)
        return payment.status if payment else "recorded"

    def get_payment_status_label(self, obj):
        payment = getattr(obj, "demo_payment", None)
        return payment.get_status_display() if payment else "Recorded"


class DemoPaymentCreateSerializer(serializers.ModelSerializer):
    campaign_id = serializers.PrimaryKeyRelatedField(
        source="campaign", queryset=Campaign.objects.all(), write_only=True
    )

    class Meta:
        model = DemoPayment
        fields = ["id", "campaign_id", "provider", "amount", "message", "is_anonymous", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    def validate_campaign_id(self, campaign):
        complete_campaign_if_due(campaign)
        if campaign.status != Campaign.Status.APPROVED:
            raise serializers.ValidationError("Only approved campaigns can receive donations.")
        return campaign


class DemoPaymentSerializer(serializers.ModelSerializer):
    provider_label = serializers.CharField(source="get_provider_display", read_only=True)
    campaign_id = serializers.UUIDField(source="campaign.id", read_only=True)
    campaign_title = serializers.CharField(source="campaign.title", read_only=True)
    donation = DonationSerializer(read_only=True)
    receipt_url = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = DemoPayment
        fields = ["id", "campaign_id", "campaign_title", "provider", "provider_label", "amount", "status", "transaction_reference", "wallet_transaction_id", "receipt_url", "qr_code_url", "failure_reason", "donation", "created_at", "proof_submitted_at", "completed_at", "reviewed_at", "expires_at"]
        read_only_fields = fields

    def get_receipt_url(self, obj):
        if not obj.receipt:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.receipt.url) if request else obj.receipt.url

    def get_qr_code_url(self, obj):
        request = self.context.get("request")
        path = f"/payment-qr/{'kbzpay' if obj.provider == DemoPayment.Provider.KBZPAY else 'wavepay'}-qr.png"
        return request.build_absolute_uri(path) if request else path


class AdminPaymentSerializer(DemoPaymentSerializer):
    donor_name = serializers.SerializerMethodField()
    donor_email = serializers.EmailField(source="donor.email", read_only=True)
    donor_phone_number = serializers.CharField(source="donor.phone_number", read_only=True)
    campaign_owner_name = serializers.SerializerMethodField()
    payment_method = serializers.CharField(source="get_provider_display", read_only=True)
    payment_reference = serializers.CharField(source="transaction_reference", read_only=True)
    payment_status = serializers.CharField(source="status", read_only=True)
    payment_status_label = serializers.CharField(source="get_status_display", read_only=True)
    reviewer_name = serializers.SerializerMethodField()

    class Meta(DemoPaymentSerializer.Meta):
        fields = DemoPaymentSerializer.Meta.fields + [
            "donor_name", "donor_email", "donor_phone_number", "campaign_owner_name",
            "payment_method", "payment_reference", "payment_status", "payment_status_label",
            "reviewer_name",
        ]

    def get_donor_name(self, obj):
        return obj.donor.get_full_name() or obj.donor.username

    def get_campaign_owner_name(self, obj):
        return obj.campaign.owner.get_full_name() or obj.campaign.owner.username

    def get_reviewer_name(self, obj):
        if not obj.reviewed_by:
            return None
        return obj.reviewed_by.get_full_name() or obj.reviewed_by.username
