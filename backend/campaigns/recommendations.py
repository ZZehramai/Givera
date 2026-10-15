from collections import Counter
from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from .models import Campaign
from .services import complete_due_campaigns


def recommend_campaigns(user, saved_campaign_ids=None, limit=6):
    """Return explainable, content-based recommendations for one donor."""
    saved_campaign_ids = set(saved_campaign_ids or [])
    complete_due_campaigns()

    donation_signals = list(
        user.donations.values_list("campaign_id", "campaign__category")
    )
    supported_ids = {campaign_id for campaign_id, _ in donation_signals}
    donated_categories = Counter(category for _, category in donation_signals)

    saved_signals = list(
        Campaign.objects.filter(pk__in=saved_campaign_ids).values_list("id", "category")
    )
    saved_ids = {campaign_id for campaign_id, _ in saved_signals}
    saved_categories = Counter(category for _, category in saved_signals)

    candidates = list(
        Campaign.objects.filter(status=Campaign.Status.APPROVED)
        .exclude(owner=user)
        .select_related("owner")
        .prefetch_related("media_items")
        .annotate(recommendation_donor_count=Count("donations__donor", distinct=True))
    )

    unseen = [
        campaign for campaign in candidates
        if campaign.pk not in supported_ids and campaign.pk not in saved_ids
    ]
    pool = unseen if unseen else candidates
    today = timezone.localdate()
    recent_cutoff = timezone.now() - timedelta(days=30)

    ranked = []
    for campaign in pool:
        score = 0
        reason_code = "popular"

        if donated_categories[campaign.category]:
            score += 20 + donated_categories[campaign.category] * 5
            reason_code = "donated_category"
        elif saved_categories[campaign.category]:
            score += 15 + saved_categories[campaign.category] * 4
            reason_code = "saved_category"

        days_remaining = (campaign.deadline - today).days
        if 0 <= days_remaining <= 14:
            score += 6
            if reason_code == "popular":
                reason_code = "ending_soon"

        if campaign.approved_at and campaign.approved_at >= recent_cutoff:
            score += 4
            if reason_code == "popular":
                reason_code = "new_campaign"

        donor_count = getattr(campaign, "recommendation_donor_count", 0)
        score += min(donor_count, 5)
        if not donor_count and reason_code == "popular":
            reason_code = "active_campaign"

        ranked.append((score, days_remaining, -donor_count, campaign, reason_code))

    ranked.sort(key=lambda item: (-item[0], item[1], item[2], str(item[3].pk)))
    return [
        {
            "campaign": campaign,
            "reason_code": reason_code,
            "reason_category": campaign.category,
        }
        for _, _, _, campaign, reason_code in ranked[:limit]
    ]
