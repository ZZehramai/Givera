from django.contrib import admin

from .models import CampaignTrustAssessment


@admin.register(CampaignTrustAssessment)
class CampaignTrustAssessmentAdmin(admin.ModelAdmin):
    list_display = ("campaign", "risk_level", "provider", "analyzed_at")
    list_filter = ("risk_level", "provider")
    search_fields = ("campaign__title", "campaign__owner__email")
