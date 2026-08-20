from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncMonth
from django.http import Http404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from campaigns.models import Campaign
from donations.models import DemoPayment, Donation
from campaigns.services import complete_due_campaigns
from .exports import build_dataset, csv_response, pdf_response


class AdminDashboardReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        complete_due_campaigns()
        monthly = list(
            Donation.objects.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"), donors=Count("donor", distinct=True), donations=Count("id"))
            .order_by("month")
        )
        donation_summary = Donation.objects.aggregate(
            total=Sum("amount"),
            average=Avg("amount"),
            count=Count("id"),
            anonymous=Count("id", filter=Q(is_anonymous=True)),
        )
        repeat_donors = (
            Donation.objects.values("donor")
            .annotate(donation_count=Count("id"))
            .filter(donation_count__gt=1)
            .count()
        )
        categories = list(
            Donation.objects.values("campaign__category")
            .annotate(total=Sum("amount"), donations=Count("id"))
            .order_by("-total")
        )
        category_labels = dict(Campaign.Category.choices)
        for category in categories:
            category["category"] = category.pop("campaign__category")
            category["label"] = category_labels.get(category["category"], category["category"].title())

        payment_methods = list(
            Donation.objects.filter(demo_payment__isnull=False)
            .values("demo_payment__provider")
            .annotate(total=Sum("amount"), donations=Count("id"))
            .order_by("-donations")
        )
        provider_labels = dict(DemoPayment.Provider.choices)
        for method in payment_methods:
            method["provider"] = method.pop("demo_payment__provider")
            method["label"] = provider_labels.get(method["provider"], method["provider"].upper())

        top_campaigns = list(
            Campaign.objects.annotate(
                donated_total=Sum("donations__amount"),
                donation_count=Count("donations"),
                donor_count=Count("donations__donor", distinct=True),
            )
            .filter(donated_total__isnull=False)
            .values("id", "title", "goal_amount", "donated_total", "donation_count", "donor_count")
            .order_by("-donated_total")[:5]
        )

        growth = None
        if len(monthly) > 1:
            previous = float(monthly[-2]["total"] or 0)
            current = float(monthly[-1]["total"] or 0)
            growth = round(((current - previous) / previous) * 100, 1) if previous else None

        return Response({
            "total_raised": donation_summary["total"] or 0,
            "total_donations": donation_summary["count"],
            "average_donation": donation_summary["average"] or 0,
            "anonymous_donations": donation_summary["anonymous"],
            "repeat_donors": repeat_donors,
            "monthly_growth": growth,
            "active_campaigns": Campaign.objects.filter(status=Campaign.Status.APPROVED).count(),
            "pending_requests": Campaign.objects.filter(status=Campaign.Status.PENDING).count(),
            "total_donors": Donation.objects.values("donor").distinct().count(),
            "campaigns_by_status": list(Campaign.objects.values("status").annotate(count=Count("id")).order_by("status")),
            "donations_by_month": monthly,
            "donations_by_category": categories,
            "payment_methods": payment_methods,
            "top_campaigns": top_campaigns,
        })


class AdminDataExportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request, resource):
        dataset = build_dataset(resource, request.query_params)
        if dataset is None:
            raise Http404("Unknown export dataset.")

        export_format = request.query_params.get("file_format", "csv").lower()
        if export_format not in {"csv", "pdf"}:
            return Response(
                {"detail": "Choose csv or pdf as the export format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        filename = f"givera-{resource}-{timezone.localdate():%Y-%m-%d}"
        if export_format == "pdf":
            return pdf_response(dataset, filename)
        return csv_response(dataset, filename)
