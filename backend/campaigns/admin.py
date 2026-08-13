from django.contrib import admin

from .models import Campaign, CampaignUpdate, FundUtilization


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "owner",
        "category",
        "goal_amount",
        "status",
        "deadline",
        "created_at",
    )
    list_filter = ("status", "category", "created_at")
    search_fields = ("title", "summary", "owner__email", "beneficiary")
    readonly_fields = ("amount_raised", "approved_at", "created_at", "updated_at")


@admin.register(CampaignUpdate)
class CampaignUpdateAdmin(admin.ModelAdmin):
    list_display = ("title", "campaign", "author", "created_at")
    search_fields = ("title", "body", "campaign__title", "author__email")


@admin.register(FundUtilization)
class FundUtilizationAdmin(admin.ModelAdmin):
    list_display = ("title", "campaign", "amount_spent", "spent_on", "status", "submitted_by")
    list_filter = ("status", "spent_on")
    search_fields = ("title", "description", "campaign__title", "submitted_by__email")
    readonly_fields = ("submitted_by", "created_at", "updated_at")
