import shutil
import tempfile
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Campaign, CampaignMedia, FundUtilization
from accounts.models import Notification
from ai.models import CampaignTrustAssessment
from donations.models import Donation

User = get_user_model()


class CampaignApiTests(APITestCase):
    def setUp(self):
        self.media_root = tempfile.mkdtemp()
        self.media_override = override_settings(MEDIA_ROOT=self.media_root)
        self.media_override.enable()
        self.addCleanup(self.media_override.disable)
        self.addCleanup(shutil.rmtree, self.media_root, True)
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
        assessment = CampaignTrustAssessment.objects.get(campaign=campaign)
        self.assertIn(assessment.risk_level, CampaignTrustAssessment.RiskLevel.values)
        self.assertEqual(assessment.provider, "demo")

    def test_admin_created_campaign_is_published_immediately(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(reverse("campaign-list"), self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        campaign = Campaign.objects.get()
        self.assertEqual(campaign.owner, self.admin)
        self.assertEqual(campaign.status, Campaign.Status.APPROVED)
        self.assertIsNotNone(campaign.approved_at)
        self.assertEqual(response.data["status"], Campaign.Status.APPROVED)

    def test_campaign_request_accepts_multiple_cover_images(self):
        self.client.force_authenticate(self.owner)
        payload = {
            **self.payload,
            "cover_images": [
                SimpleUploadedFile("need.jpg", b"image-data", content_type="image/jpeg"),
                SimpleUploadedFile("community.png", b"image-data", content_type="image/png"),
            ],
        }

        response = self.client.post(reverse("campaign-list"), payload, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        campaign = Campaign.objects.get()
        self.assertEqual(campaign.status, Campaign.Status.PENDING)
        self.assertEqual(len(response.data["cover_media"]), 2)
        self.assertEqual(response.data["gallery_media"], [])
        self.assertEqual(CampaignMedia.objects.filter(campaign=campaign, purpose=CampaignMedia.Purpose.COVER).count(), 2)

    def test_rejected_campaign_can_add_more_cover_images_when_resubmitted(self):
        campaign = Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.REJECTED,
            rejection_reason="Add clearer supporting evidence.",
            **self.payload,
        )
        self.client.force_authenticate(self.owner)

        response = self.client.patch(
            reverse("campaign-detail", kwargs={"pk": campaign.pk}),
            {
                "story": "Updated story with clearer supporting evidence.",
                "cover_images": [SimpleUploadedFile("evidence.webp", b"image-data", content_type="image/webp")],
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, Campaign.Status.PENDING)
        self.assertEqual(len(response.data["cover_media"]), 1)
        self.assertEqual(response.data["gallery_media"], [])

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

    def test_campaign_completes_automatically_when_deadline_is_reached(self):
        campaign = Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.APPROVED,
            **{
                **self.payload,
                "title": "Deadline campaign",
                "deadline": timezone.localdate() - timedelta(days=1),
            },
        )

        response = self.client.get(reverse("campaign-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, Campaign.Status.COMPLETED)
        returned = next(item for item in response.data if item["id"] == str(campaign.id))
        self.assertEqual(returned["status"], Campaign.Status.COMPLETED)

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

    def test_recommendations_prioritize_categories_the_donor_supported(self):
        supported = Campaign.objects.create(
            owner=self.admin,
            status=Campaign.Status.COMPLETED,
            **{**self.payload, "title": "Past medical campaign", "category": Campaign.Category.MEDICAL},
        )
        Donation.objects.create(donor=self.owner, campaign=supported, amount=Decimal("1000.00"))
        medical = Campaign.objects.create(
            owner=self.admin,
            status=Campaign.Status.APPROVED,
            **{**self.payload, "title": "New medical campaign", "category": Campaign.Category.MEDICAL},
        )
        Campaign.objects.create(
            owner=self.admin,
            status=Campaign.Status.APPROVED,
            **{**self.payload, "title": "Education campaign", "category": Campaign.Category.EDUCATION},
        )
        self.client.force_authenticate(self.owner)

        response = self.client.post(
            reverse("campaign-recommendations"),
            {"saved_campaign_ids": []},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["id"], str(medical.pk))
        self.assertEqual(response.data["results"][0]["recommendation_reason"], "donated_category")
        self.assertNotIn(str(supported.pk), [item["id"] for item in response.data["results"]])

    def test_recommendations_use_locally_saved_campaign_categories(self):
        saved = Campaign.objects.create(
            owner=self.admin,
            status=Campaign.Status.APPROVED,
            **{**self.payload, "title": "Saved environment campaign", "category": Campaign.Category.ENVIRONMENT},
        )
        similar = Campaign.objects.create(
            owner=self.admin,
            status=Campaign.Status.APPROVED,
            **{**self.payload, "title": "Similar environment campaign", "category": Campaign.Category.ENVIRONMENT},
        )
        self.client.force_authenticate(self.owner)

        response = self.client.post(
            reverse("campaign-recommendations"),
            {"saved_campaign_ids": [str(saved.pk)]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["id"], str(similar.pk))
        self.assertEqual(response.data["results"][0]["recommendation_reason"], "saved_category")
        self.assertNotIn(str(saved.pk), [item["id"] for item in response.data["results"]])

    def test_recommendations_only_include_active_campaigns_not_owned_by_donor(self):
        own_campaign = Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.APPROVED,
            **{**self.payload, "title": "My own campaign"},
        )
        completed = Campaign.objects.create(
            owner=self.admin,
            status=Campaign.Status.COMPLETED,
            **{**self.payload, "title": "Completed campaign"},
        )
        active = Campaign.objects.create(
            owner=self.admin,
            status=Campaign.Status.APPROVED,
            **{**self.payload, "title": "Active campaign"},
        )
        self.client.force_authenticate(self.owner)

        response = self.client.post(reverse("campaign-recommendations"), {}, format="json")

        returned_ids = [item["id"] for item in response.data["results"]]
        self.assertIn(str(active.pk), returned_ids)
        self.assertNotIn(str(own_campaign.pk), returned_ids)
        self.assertNotIn(str(completed.pk), returned_ids)

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

    def test_admin_can_manage_approved_campaign_lifecycle(self):
        campaign = Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.APPROVED,
            approved_at=timezone.now(),
            **self.payload,
        )
        self.client.force_authenticate(self.admin)

        unpublished = self.client.patch(
            reverse("campaign-management", kwargs={"pk": campaign.pk}),
            {"action": "unpublish"},
            format="json",
        )
        self.assertEqual(unpublished.status_code, status.HTTP_200_OK)
        self.assertEqual(unpublished.data["status"], Campaign.Status.UNPUBLISHED)

        hidden = self.client.get(reverse("campaign-list"))
        self.assertNotIn(str(campaign.pk), [item["id"] for item in hidden.data])

        republished = self.client.patch(
            reverse("campaign-management", kwargs={"pk": campaign.pk}),
            {"action": "republish"},
            format="json",
        )
        self.assertEqual(republished.data["status"], Campaign.Status.APPROVED)

        closed = self.client.patch(
            reverse("campaign-management", kwargs={"pk": campaign.pk}),
            {"action": "close"},
            format="json",
        )
        self.assertEqual(closed.data["status"], Campaign.Status.COMPLETED)

        archived = self.client.patch(
            reverse("campaign-management", kwargs={"pk": campaign.pk}),
            {"action": "archive"},
            format="json",
        )
        self.assertEqual(archived.data["status"], Campaign.Status.ARCHIVED)

    def test_admin_can_edit_an_approved_campaign_without_changing_status(self):
        campaign = Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.APPROVED,
            approved_at=timezone.now(),
            **self.payload,
        )
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            reverse("campaign-detail", kwargs={"pk": campaign.pk}),
            {"summary": "Updated by an administrator."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        campaign.refresh_from_db()
        self.assertEqual(campaign.summary, "Updated by an administrator.")
        self.assertEqual(campaign.status, Campaign.Status.APPROVED)

    def test_regular_user_cannot_manage_campaign_lifecycle(self):
        campaign = Campaign.objects.create(
            owner=self.owner,
            status=Campaign.Status.APPROVED,
            **self.payload,
        )
        self.client.force_authenticate(self.owner)

        response = self.client.patch(
            reverse("campaign-management", kwargs={"pk": campaign.pk}),
            {"action": "archive"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        campaign.refresh_from_db()
        self.assertEqual(campaign.status, Campaign.Status.APPROVED)

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
        self.assertEqual(notification.link, f"/campaigns/{campaign.pk}#latest-updates")

    def test_organizer_update_respects_donor_notification_preference(self):
        donor = User.objects.create_user(
            email="quiet-donor@example.com",
            username="quiet-donor",
            password="StrongPassword123!",
            campaign_notifications_enabled=False,
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
        self.assertFalse(Notification.objects.filter(recipient=donor).exists())

    def test_organizer_can_upload_multiple_gallery_items(self):
        campaign = Campaign.objects.create(owner=self.owner, status=Campaign.Status.APPROVED, **self.payload)
        self.client.force_authenticate(self.owner)
        photo = SimpleUploadedFile("progress.jpg", b"image-data", content_type="image/jpeg")
        video = SimpleUploadedFile("walkthrough.mp4", b"video-data", content_type="video/mp4")

        response = self.client.post(
            reverse("campaign-media", kwargs={"pk": campaign.pk}),
            {"files": [photo, video], "caption": "Library construction progress"},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(CampaignMedia.objects.filter(campaign=campaign, update__isnull=True).count(), 2)
        self.assertCountEqual(
            [item["media_type"] for item in response.data],
            [CampaignMedia.MediaType.IMAGE, CampaignMedia.MediaType.VIDEO],
        )
        detail = self.client.get(reverse("campaign-detail", kwargs={"pk": campaign.pk}))
        self.assertEqual(len(detail.data["gallery_media"]), 2)

    def test_non_organizer_cannot_upload_gallery_media(self):
        campaign = Campaign.objects.create(owner=self.owner, status=Campaign.Status.APPROVED, **self.payload)
        donor = User.objects.create_user(email="viewer@example.com", username="viewer", password="StrongPassword123!")
        self.client.force_authenticate(donor)

        response = self.client.post(
            reverse("campaign-media", kwargs={"pk": campaign.pk}),
            {"files": [SimpleUploadedFile("photo.png", b"image-data", content_type="image/png")]},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(CampaignMedia.objects.exists())

    def test_organizer_update_accepts_multiple_media_attachments(self):
        campaign = Campaign.objects.create(owner=self.owner, status=Campaign.Status.APPROVED, **self.payload)
        self.client.force_authenticate(self.owner)

        response = self.client.post(
            reverse("campaign-updates", kwargs={"pk": campaign.pk}),
            {
                "title": "Construction started",
                "body": "The shelves and reading area are taking shape.",
                "media": [
                    SimpleUploadedFile("shelves.webp", b"image-data", content_type="image/webp"),
                    SimpleUploadedFile("tour.webm", b"video-data", content_type="video/webm"),
                ],
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["media"]), 2)
        self.assertEqual(CampaignMedia.objects.filter(update_id=response.data["id"]).count(), 2)

    def test_campaign_media_rejects_unsupported_files(self):
        campaign = Campaign.objects.create(owner=self.owner, status=Campaign.Status.APPROVED, **self.payload)
        self.client.force_authenticate(self.owner)

        response = self.client.post(
            reverse("campaign-media", kwargs={"pk": campaign.pk}),
            {"files": [SimpleUploadedFile("notes.pdf", b"pdf-data", content_type="application/pdf")]},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(CampaignMedia.objects.exists())

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
        self.assertIn("receipt", created.data["evidence"])
        self.assertTrue(created.data["evidence"].endswith(".pdf"))

        self.client.force_authenticate(user=None)
        public = self.client.get(reverse("fund-utilization", kwargs={"pk": campaign.pk}))
        self.assertEqual(len(public.data), 1)
        self.assertEqual(public.data[0]["title"], "Bought books")

    def test_admin_spending_report_notifies_each_campaign_donor_once(self):
        donor = User.objects.create_user(
            email="report-donor@example.com",
            username="report-donor",
            password="StrongPassword123!",
        )
        opted_out = User.objects.create_user(
            email="quiet-report-donor@example.com",
            username="quiet-report-donor",
            password="StrongPassword123!",
            campaign_notifications_enabled=False,
        )
        campaign = Campaign.objects.create(owner=self.owner, status=Campaign.Status.APPROVED, **self.payload)
        Donation.objects.create(donor=donor, campaign=campaign, amount="25.00")
        Donation.objects.create(donor=donor, campaign=campaign, amount="40.00")
        Donation.objects.create(donor=opted_out, campaign=campaign, amount="15.00")
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            reverse("fund-utilization", kwargs={"pk": campaign.pk}),
            {
                "title": "Bought books",
                "description": "Books for the library shelves.",
                "amount_spent": "2000.00",
                "spent_on": str(timezone.localdate()),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        notification = Notification.objects.get(recipient=donor)
        self.assertEqual(notification.type, Notification.Type.FUND_UTILIZATION)
        self.assertEqual(notification.link, f"/campaigns/{campaign.pk}#fund-utilization")
        self.assertFalse(Notification.objects.filter(recipient=opted_out).exists())
