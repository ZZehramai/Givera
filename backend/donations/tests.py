from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import User
from accounts.models import Notification
from campaigns.models import Campaign

from .models import DemoPayment, Donation


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
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="test-password",
            role=User.Role.ADMIN,
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

    def test_donor_cannot_bypass_wallet_verification_with_direct_donation(self):
        response = self.client.post(
            "/api/donations/",
            {"campaign_id": self.campaign.id, "amount": "25.00"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(Donation.objects.count(), 0)
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.amount_raised, Decimal("0.00"))

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

    def create_and_submit_transfer(self, amount="25.00", provider="kbzpay", wallet_id="KBZ-12345"):
        checkout = self.client.post(
            "/api/donations/demo-checkout/",
            {
                "campaign_id": self.campaign.id,
                "provider": provider,
                "amount": amount,
                "message": "Wallet support",
            },
            format="json",
        )
        self.assertEqual(checkout.status_code, 201)
        self.assertEqual(checkout.data["status"], "pending")
        self.assertTrue(checkout.data["transaction_reference"].startswith("GIV-"))
        submitted = self.client.post(
            f'/api/donations/demo-checkout/{checkout.data["id"]}/proof/',
            {"wallet_transaction_id": wallet_id},
            format="json",
        )
        self.assertEqual(submitted.status_code, 200)
        self.assertEqual(submitted.data["status"], "submitted")
        return submitted.data

    def test_wallet_transfer_only_records_donation_after_admin_verification(self):
        transfer = self.create_and_submit_transfer()
        self.assertEqual(Donation.objects.count(), 0)
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            f'/api/donations/admin/payments/{transfer["id"]}/review/',
            {"decision": "verify"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "paid")
        self.assertEqual(Donation.objects.count(), 1)
        notification = Notification.objects.get(
            recipient=self.donor,
            type=Notification.Type.PAYMENT_VERIFIED,
        )
        self.assertIn("certificate is ready", notification.message)
        self.assertEqual(notification.link, "/dashboard?section=history")
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.amount_raised, Decimal("25.00"))

    def test_verified_wallet_transfer_completes_campaign_at_goal(self):
        transfer = self.create_and_submit_transfer(amount="1000.00", wallet_id="KBZ-GOAL")
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            f'/api/donations/admin/payments/{transfer["id"]}/review/',
            {"decision": "verify"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.campaign.refresh_from_db()
        self.assertEqual(self.campaign.status, Campaign.Status.COMPLETED)

    def test_rejected_wallet_transfer_does_not_create_a_donation(self):
        transfer = self.create_and_submit_transfer(amount="5000.00", provider="wave", wallet_id="WAVE-REJECT")
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            f'/api/donations/admin/payments/{transfer["id"]}/review/',
            {"decision": "reject", "reason": "Transfer was not found in the receiving wallet."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "failed")
        self.assertEqual(Donation.objects.count(), 0)
        notification = Notification.objects.get(
            recipient=self.donor,
            type=Notification.Type.PAYMENT_REJECTED,
        )
        self.assertIn("Transfer was not found", notification.message)
        self.assertEqual(notification.link, "/dashboard?section=history")

    def test_verified_transfer_certificate_is_private_pdf(self):
        transfer = self.create_and_submit_transfer(amount="25000.00", wallet_id="KBZ-CERT")
        payment_id = transfer["id"]
        pending = self.client.get(
            f"/api/donations/demo-checkout/{payment_id}/certificate/"
        )
        self.assertEqual(pending.status_code, 400)
        self.client.force_authenticate(self.admin)
        self.client.post(
            f"/api/donations/admin/payments/{payment_id}/review/",
            {"decision": "verify"},
            format="json",
        )
        self.client.force_authenticate(self.donor)
        certificate = self.client.get(
            f"/api/donations/demo-checkout/{payment_id}/certificate/"
        )
        self.assertEqual(certificate.status_code, 200)
        self.assertEqual(certificate["Content-Type"], "application/pdf")
        self.assertIn("givera-certificate-GIV-", certificate["Content-Disposition"])
        self.assertTrue(certificate.content.startswith(b"%PDF"))

        another_donor = User.objects.create_user(
            username="another-donor",
            email="another@example.com",
            password="test-password",
        )
        self.client.force_authenticate(another_donor)
        private = self.client.get(
            f"/api/donations/demo-checkout/{payment_id}/certificate/"
        )
        self.assertEqual(private.status_code, 404)

    def test_admin_donation_list_is_paginated_and_contains_transaction_details(self):
        donation = Donation.objects.create(donor=self.donor, campaign=self.campaign, amount=Decimal("1000.00"))
        self.client.force_authenticate(self.admin)

        response = self.client.get("/api/donations/admin/all/?page=1&page_size=10")

        self.assertEqual(response.status_code, 200)
        self.assertIn("results", response.data)
        record = next(item for item in response.data["results"] if item["id"] == str(donation.id))
        self.assertEqual(record["donor_email"], self.donor.email)
        self.assertEqual(record["campaign_title"], self.campaign.title)
        self.assertEqual(record["payment_status"], "recorded")

    def test_admin_payment_list_contains_pending_transfer_proof(self):
        transfer = self.create_and_submit_transfer(wallet_id="KBZ-ADMIN-LIST")
        self.client.force_authenticate(self.admin)
        response = self.client.get("/api/donations/admin/payments/?page=1&page_size=10")
        self.assertEqual(response.status_code, 200)
        record = next(item for item in response.data["results"] if item["id"] == transfer["id"])
        self.assertEqual(record["wallet_transaction_id"], "KBZ-ADMIN-LIST")
        self.assertEqual(record["payment_status"], DemoPayment.Status.SUBMITTED)
