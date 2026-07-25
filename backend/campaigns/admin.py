from django.contrib import admin

from .models import Campaign


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
