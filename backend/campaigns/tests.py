from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Campaign, FundUtilization
from accounts.models import Notification
from donations.models import Donation

User = get_user_model()


class CampaignApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com",
            username="owner",
            password="StrongPassword123!",
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="StrongPassword123!",
            role=User.Role.ADMIN,
        )
        self.payload = {
            "title": "A community library",
            "summary": "Help us create a free library for local children.",
            "story": "Our neighborhood needs a safe place where children can read and learn.",
            "category": Campaign.Category.EDUCATION,
            "beneficiary": "Local children",
            "location": "Yangon",
            "goal_amount": "5000.00",
            "deadline": str(timezone.localdate() + timedelta(days=30)),
        }

    def test_authenticated_user_can_submit_campaign(self):
        self.client.force_authenticate(self.owner)
        response = self.client.post(reverse("campaign-list"), self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        campaign = Campaign.objects.get()
        self.assertEqual(campaign.owner, self.owner)
        self.assertEqual(campaign.status, Campaign.Status.PENDING)

    def test_public_list_only_shows_approved_campaigns(self):
        Campaign.objects.create(owner=self.owner, status=Campaign.Status.PENDING, **self.payload)
        approved_payload = {**self.payload, "title": "Approved campaign"}
        Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.APPROVED,
            amount_raised=Decimal("125.00"),
            **approved_payload,
        )

        response = self.client.get(reverse("campaign-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Approved campaign")

    def test_authenticated_user_sees_approved_campaigns_from_all_owners(self):
        other_owner = User.objects.create_user(
            email="other-owner@example.com",
            username="other-owner",
            password="StrongPassword123!",
        )
        Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.APPROVED,
            **{**self.payload, "title": "Owner campaign"},
        )
        Campaign.objects.create(
            owner=other_owner,
            status=Campaign.Status.APPROVED,
            **{**self.payload, "title": "Community campaign"},
        )
        self.client.force_authenticate(self.owner)

        response = self.client.get(reverse("campaign-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertCountEqual(
            [campaign["title"] for campaign in response.data],
            ["Owner campaign", "Community campaign"],
        )

    def test_admin_can_approve_pending_campaign(self):
        campaign = Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.PENDING,
            **self.payload,
        )
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            reverse("campaign-review", kwargs={"pk": campaign.pk}),
            {"status": Campaign.Status.APPROVED},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, Campaign.Status.APPROVED)
        self.assertIsNotNone(campaign.approved_at)
        notification = Notification.objects.get(recipient=self.owner)
        self.assertEqual(notification.type, Notification.Type.CAMPAIGN_APPROVED)

    def test_owner_can_fix_and_resubmit_rejected_campaign(self):
        campaign = Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.REJECTED,
            rejection_reason="Explain how the campaign funds will be used.",
            **self.payload,
        )
        self.client.force_authenticate(self.owner)

        response = self.client.patch(
            reverse("campaign-detail", kwargs={"pk": campaign.pk}),
            {
                "story": "Our neighborhood needs a safe place to read. Funds will purchase books, shelves, and study tables.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, Campaign.Status.PENDING)
        self.assertEqual(campaign.rejection_reason, "")
        self.assertIn("Funds will purchase books", campaign.story)

    def test_organizer_update_notifies_campaign_donors(self):
        donor = User.objects.create_user(
            email="donor@example.com",
            username="donor",
            password="StrongPassword123!",
        )
        campaign = Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.APPROVED,
            **self.payload,
        )
        Donation.objects.create(donor=donor, campaign=campaign, amount="25.00")
        self.client.force_authenticate(self.owner)

        response = self.client.post(
            reverse("campaign-updates", kwargs={"pk": campaign.pk}),
            {"title": "Books have arrived", "body": "The first set of books is now in the library."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        notification = Notification.objects.get(recipient=donor)
        self.assertEqual(notification.type, Notification.Type.CAMPAIGN_UPDATE)
        self.assertEqual(notification.link, f"/campaigns/{campaign.pk}")

    def test_public_donor_list_hides_anonymous_donor_identity(self):
        donor = User.objects.create_user(email="donor@example.com", username="donor", password="StrongPassword123!")
        campaign = Campaign.objects.create(owner=self.owner, status=Campaign.Status.APPROVED, **self.payload)
        Donation.objects.create(donor=donor, campaign=campaign, amount="2500.00", is_anonymous=True)

        response = self.client.get(reverse("campaign-donors", kwargs={"pk": campaign.pk}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["donor_name"], "Anonymous")
        self.assertEqual(str(response.data[0]["amount"]), "2500.00")

    def test_only_admin_can_publish_utilization(self):
        campaign = Campaign.objects.create(owner=self.owner, status=Campaign.Status.APPROVED, **self.payload)
        self.client.force_authenticate(self.owner)
        denied = self.client.post(
            reverse("fund-utilization", kwargs={"pk": campaign.pk}),
            {"title": "Bought books", "description": "Books for the library shelves.", "amount_spent": "2000.00", "spent_on": str(timezone.localdate())},
            format="json",
        )
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin)
        attachment = SimpleUploadedFile(
            "receipt.pdf",
            b"%PDF-1.4 supporting receipt",
            content_type="application/pdf",
        )
        created = self.client.post(
            reverse("fund-utilization", kwargs={"pk": campaign.pk}),
            {"title": "Bought books", "description": "Books for the library shelves.", "amount_spent": "2000.00", "spent_on": str(timezone.localdate()), "evidence": attachment},
            format="multipart",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data["status"], FundUtilization.Status.APPROVED)
        self.assertTrue(created.data["evidence"].endswith("receipt.pdf"))

        self.client.force_authenticate(user=None)
        public = self.client.get(reverse("fund-utilization", kwargs={"pk": campaign.pk}))
        self.assertEqual(len(public.data), 1)
        self.assertEqual(public.data[0]["title"], "Bought books")
