from rest_framework import serializers


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
        if attrs["field"] != "fund_usage" and not attrs["content"].strip():
            raise serializers.ValidationError(
                {"content": "Add some text before asking for an improvement."}
            )
        if attrs["field"] == "fund_usage" and not any(
            str(attrs.get(key, "")).strip()
            for key in ["content", "title", "summary", "beneficiary"]
        ):
            raise serializers.ValidationError(
                {"content": "Add campaign details before drafting fund usage."}
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
