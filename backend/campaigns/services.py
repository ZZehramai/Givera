from django.db.models import F, Q
from django.utils import timezone

from .models import Campaign


def complete_due_campaigns(queryset=None):
    """Complete approved campaigns whose goal or deadline has been reached."""
    campaigns = queryset if queryset is not None else Campaign.objects.all()
    return campaigns.filter(status=Campaign.Status.APPROVED).filter(
        Q(amount_raised__gte=F("goal_amount"))
        | Q(deadline__lte=timezone.localdate())
    ).update(status=Campaign.Status.COMPLETED, updated_at=timezone.now())


def campaign_is_due(campaign):
    return (
        campaign.amount_raised >= campaign.goal_amount
        or campaign.deadline <= timezone.localdate()
    )


def complete_campaign_if_due(campaign):
    if campaign.status == Campaign.Status.APPROVED and campaign_is_due(campaign):
        campaign.status = Campaign.Status.COMPLETED
        campaign.save(update_fields=["status", "updated_at"])
        return True
    return False
