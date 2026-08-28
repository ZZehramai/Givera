from rest_framework import serializers

from .models import CampaignTrustAssessment


class CampaignWritingRequestSerializer(serializers.Serializer):
    field = serializers.ChoiceField(
        choices=["title", "summary", "story", "fund_usage"]
    )
    content = serializers.CharField(max_length=6000, allow_blank=True)
    title = serializers.CharField(max_length=160, required=False, allow_blank=True)
    summary = serializers.CharField(max_length=280, required=False, allow_blank=True)
    beneficiary = serializers.CharField(max_length=160, required=False, allow_blank=True)
    location = serializers.CharField(max_length=160, required=False, allow_blank=True)
    goal_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        allow_null=True,
    )
    language = serializers.ChoiceField(choices=["en", "my"], default="en")

    def validate(self, attrs):
        if not attrs["content"].strip() and not any(
            str(attrs.get(key, "")).strip()
            for key in ["title", "summary", "beneficiary", "location"]
        ):
            raise serializers.ValidationError(
                {"content": "Add some campaign details before asking for a draft."}
            )
        return attrs


class ChatMessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["user", "assistant"])
    content = serializers.CharField(max_length=1200, trim_whitespace=True)


class GiveraHelpRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=800, trim_whitespace=True)
    language = serializers.ChoiceField(choices=["en", "my"], default="en")
    history = ChatMessageSerializer(many=True, required=False, default=list)

    def validate_history(self, value):
        return value[-8:]


class CampaignTrustAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignTrustAssessment
        fields = [
            "risk_level",
            "summary",
            "flags",
            "missing_information",
            "suggested_checks",
            "provider",
            "analyzed_at",
        ]
        read_only_fields = fields
