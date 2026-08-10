from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import User
from campaigns.models import Campaign

from .models import Donation


class DonationApiTests(APITestCase):
    def setUp(self):
        self.donor = User.objects.create_user(
            username="donor",
            email="donor@example.com",
            password="test-password",
        )
        self.owner = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="test-password",
        )
        self.campaign = Campaign.objects.create(
            owner=self.owner,
            title="Community library",
            summary="Books for a neighborhood reading room.",
            story="A community-led library project.",
            category=Campaign.Category.EDUCATION,
            beneficiary="Local students",
            location="Yangon",
            goal_amount=Decimal("1000.00"),
            deadline=timezone.localdate() + timedelta(days=30),
            status=Campaign.Status.APPROVED,
        )
        self.client.force_authenticate(self.donor)

    def test_authenticated_user_can_donate_to_approved_campaign(self):
        response = self.client.post(
            "/api/donations/",
            {"campaign_id": self.campaign.id, "amount": "25.00"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Donation.objects.count(), 1)
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.amount_raised, Decimal("25.00"))

    def test_my_donations_only_returns_current_users_donations(self):
        Donation.objects.create(
            donor=self.donor,
            campaign=self.campaign,
            amount=Decimal("10.00"),
        )
        response = self.client.get("/api/donations/mine/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["campaign"]["id"], str(self.campaign.id))

    def test_demo_checkout_only_records_donation_after_confirmation(self):
        checkout = self.client.post(
            "/api/donations/demo-checkout/",
            {
                "campaign_id": self.campaign.id,
                "provider": "kbzpay",
                "amount": "25.00",
                "message": "Demo support",
            },
            format="json",
        )

        self.assertEqual(checkout.status_code, 201)
        self.assertEqual(checkout.data["status"], "pending")
        self.assertTrue(checkout.data["transaction_reference"].startswith("GIV-"))
        self.assertIsNotNone(checkout.data["expires_at"])
        self.assertEqual(Donation.objects.count(), 0)

        response = self.client.post(
            f'/api/donations/demo-checkout/{checkout.data["id"]}/simulate/',
            {"outcome": "success"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "paid")
        self.assertEqual(Donation.objects.count(), 1)
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.amount_raised, Decimal("25.00"))

    def test_failed_demo_payment_does_not_create_a_donation(self):
        checkout = self.client.post(
            "/api/donations/demo-checkout/",
            {"campaign_id": self.campaign.id, "provider": "wave", "amount": "5000.00"},
            format="json",
        )

        response = self.client.post(
            f'/api/donations/demo-checkout/{checkout.data["id"]}/simulate/',
            {"outcome": "failed"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "failed")
        self.assertEqual(Donation.objects.count(), 0)
