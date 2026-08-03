from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from campaigns.models import Campaign
from donations.models import Donation


class AdminDashboardReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        monthly = Donation.objects.annotate(month=TruncMonth("created_at")).values("month").annotate(total=Sum("amount"), donors=Count("donor", distinct=True)).order_by("month")
        return Response({
            "total_raised": Donation.objects.aggregate(total=Sum("amount"))["total"] or 0,
            "active_campaigns": Campaign.objects.filter(status=Campaign.Status.APPROVED).count(),
            "pending_requests": Campaign.objects.filter(status=Campaign.Status.PENDING).count(),
            "total_donors": Donation.objects.values("donor").distinct().count(),
            "campaigns_by_status": list(Campaign.objects.values("status").annotate(count=Count("id")).order_by("status")),
            "donations_by_month": list(monthly),
        })
