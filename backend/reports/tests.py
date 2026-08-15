from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from campaigns.models import Campaign
from donations.models import DemoPayment, Donation


User = get_user_model()


class AdminDashboardReportTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="StrongPassword123!",
            role=User.Role.ADMIN,
        )
        self.donor = User.objects.create_user(
            email="donor@example.com",
            username="donor",
            password="StrongPassword123!",
        )
        self.campaign = Campaign.objects.create(
            owner=self.donor,
            title="Community library",
            summary="A library for local children.",
            story="We are creating a safe place for children to learn.",
            category=Campaign.Category.EDUCATION,
            beneficiary="Local children",
            location="Yangon",
            goal_amount=Decimal("100000.00"),
            amount_raised=Decimal("30000.00"),
            deadline=timezone.localdate() + timedelta(days=30),
            status=Campaign.Status.APPROVED,
        )

    def make_donation(self, amount, reference, anonymous=False):
        donation = Donation.objects.create(
            donor=self.donor,
            campaign=self.campaign,
            amount=Decimal(amount),
            is_anonymous=anonymous,
        )
        DemoPayment.objects.create(
            donor=self.donor,
            campaign=self.campaign,
            provider=DemoPayment.Provider.KBZPAY,
            amount=Decimal(amount),
            status=DemoPayment.Status.PAID,
            transaction_reference=reference,
            donation=donation,
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        return donation

    def test_admin_report_includes_extended_insights(self):
        self.make_donation("10000.00", "DEMO-REPORT-001")
        self.make_donation("20000.00", "DEMO-REPORT-002", anonymous=True)
        self.client.force_authenticate(self.admin)

        response = self.client.get(reverse("admin-dashboard-report"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_donations"], 2)
        self.assertEqual(Decimal(response.data["average_donation"]), Decimal("15000.00"))
        self.assertEqual(response.data["anonymous_donations"], 1)
        self.assertEqual(response.data["repeat_donors"], 1)
        self.assertEqual(response.data["donations_by_category"][0]["label"], "Education")
        self.assertEqual(response.data["payment_methods"][0]["label"], "KBZPay")
        self.assertEqual(response.data["top_campaigns"][0]["donation_count"], 2)

    def test_regular_user_cannot_view_admin_report(self):
        self.client.force_authenticate(self.donor)

        response = self.client.get(reverse("admin-dashboard-report"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
