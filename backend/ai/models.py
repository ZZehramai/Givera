from django.db import models


class CampaignTrustAssessment(models.Model):
    class RiskLevel(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    campaign = models.OneToOneField(
        "campaigns.Campaign",
        on_delete=models.CASCADE,
        related_name="trust_assessment",
    )
    risk_level = models.CharField(max_length=10, choices=RiskLevel.choices)
    summary = models.CharField(max_length=500)
    flags = models.JSONField(default=list)
    missing_information = models.JSONField(default=list)
    suggested_checks = models.JSONField(default=list)
    provider = models.CharField(max_length=20, default="demo")
    analyzed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.campaign.title}: {self.risk_level} risk"
