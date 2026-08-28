from unittest.mock import Mock, patch
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from campaigns.models import Campaign

from .models import CampaignTrustAssessment


User = get_user_model()


class CampaignWritingAssistantTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="writer@example.com",
            username="writer",
            password="StrongPassword123!",
        )
        self.payload = {
            "field": "summary",
            "content": "We want to build a reading room for children.",
            "title": "Community reading room",
            "beneficiary": "local children",
            "location": "Yangon",
            "language": "en",
        }

    @override_settings(GROQ_API_KEY="")
    def test_authenticated_user_can_review_demo_suggestion(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(reverse("campaign-writing"), self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["provider"], "demo")
        self.assertIn("local children", response.data["suggestion"])

    def test_writing_assistant_requires_authentication(self):
        response = self.client.post(reverse("campaign-writing"), self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(GROQ_API_KEY="test-groq-key", GROQ_WRITING_MODEL="openai/gpt-oss-20b")
    @patch("ai.services.requests.post")
    def test_configured_groq_provider_returns_a_suggestion(self, mock_post):
        provider_response = Mock()
        provider_response.json.return_value = {
            "output": [{"content": [{"type": "output_text", "text": "A clearer campaign summary."}]}]
        }
        provider_response.raise_for_status.return_value = None
        mock_post.return_value = provider_response
        self.client.force_authenticate(self.user)

        response = self.client.post(reverse("campaign-writing"), self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["provider"], "groq")
        self.assertEqual(response.data["suggestion"], "A clearer campaign summary.")
        request_url = mock_post.call_args.args[0]
        request_options = mock_post.call_args.kwargs
        self.assertEqual(request_url, "https://api.groq.com/openai/v1/responses")
        self.assertEqual(request_options["json"]["model"], "openai/gpt-oss-20b")
        self.assertEqual(request_options["headers"]["Authorization"], "Bearer test-groq-key")

    @override_settings(GROQ_API_KEY="")
    def test_empty_title_can_be_drafted_from_campaign_context(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("campaign-writing"),
            {**self.payload, "field": "title", "content": ""},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["suggestion"])

    @override_settings(GROQ_API_KEY="")
    def test_empty_field_without_campaign_context_is_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("campaign-writing"),
            {"field": "title", "content": "", "language": "en"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class GiveraHelpTests(APITestCase):
    @override_settings(GROQ_API_KEY="")
    def test_public_visitor_can_ask_about_wallet_payments(self):
        response = self.client.post(
            reverse("givera-help"),
            {"message": "Are the KBZPay payments real?", "language": "en", "history": []},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["provider"], "demo")
        self.assertIn("real KBZPay or WavePay", response.data["answer"])
        self.assertIn("administrator must verify", response.data["answer"])

    @override_settings(GROQ_API_KEY="")
    def test_unrelated_question_is_kept_inside_givera_scope(self):
        response = self.client.post(
            reverse("givera-help"),
            {"message": "What will the weather be tomorrow?", "language": "en"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Givera campaign creation", response.data["answer"])

    @override_settings(GROQ_API_KEY="")
    def test_myanmar_help_response_uses_myanmar_content(self):
        response = self.client.post(
            reverse("givera-help"),
            {"message": "အသုံးစရိတ်အစီရင်ခံစာကို ဘယ်သူထုတ်ပြန်သလဲ", "language": "my"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("စီမံခန့်ခွဲသူ", response.data["answer"])


class CampaignTrustAssessmentTests(APITestCase):
    def setUp(self):
        self.organizer = User.objects.create_user(
            email="organizer@example.com",
            username="organizer",
            password="StrongPassword123!",
        )
        self.admin = User.objects.create_user(
            email="reviewer@example.com",
            username="reviewer",
            password="StrongPassword123!",
            role=User.Role.ADMIN,
        )
        self.campaign = Campaign.objects.create(
            owner=self.organizer,
            title="Community reading room",
            summary="Help local children access a safe place to read and study after school.",
            story=(
                "Children in our neighborhood need a safe reading space. We will use the funds to purchase "
                "books, shelves, study tables, and basic learning supplies. Progress and major expenses will "
                "be documented for supporters throughout the campaign."
            ),
            category=Campaign.Category.EDUCATION,
            beneficiary="Local children",
            location="Yangon",
            goal_amount="5000000.00",
            deadline=timezone.localdate() + timedelta(days=30),
            status=Campaign.Status.PENDING,
        )

    @override_settings(GROQ_API_KEY="")
    def test_admin_can_generate_advisory_assessment(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get(reverse("campaign-trust", kwargs={"pk": self.campaign.pk}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(response.data["risk_level"], ["low", "medium", "high"])
        self.assertEqual(response.data["provider"], "demo")
        self.assertTrue(response.data["suggested_checks"])
        self.assertTrue(CampaignTrustAssessment.objects.filter(campaign=self.campaign).exists())

    @override_settings(GROQ_API_KEY="")
    def test_regular_donor_cannot_access_admin_assessment(self):
        self.client.force_authenticate(self.organizer)

        response = self.client.get(reverse("campaign-trust", kwargs={"pk": self.campaign.pk}))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @override_settings(GROQ_API_KEY="test-groq-key", GROQ_WRITING_MODEL="openai/gpt-oss-20b")
    @patch("ai.services.requests.post")
    def test_admin_can_refresh_assessment_with_groq(self, mock_post):
        provider_response = Mock()
        provider_response.json.return_value = {
            "output": [{
                "content": [{
                    "type": "output_text",
                    "text": '{"risk_level":"medium","summary":"Verify the cost plan.","flags":[],"missing_information":["Detailed budget"],"suggested_checks":["Confirm supplier estimates"]}',
                }],
            }],
        }
        provider_response.raise_for_status.return_value = None
        mock_post.return_value = provider_response
        self.client.force_authenticate(self.admin)

        response = self.client.post(reverse("campaign-trust", kwargs={"pk": self.campaign.pk}), {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["provider"], "groq")
        self.assertEqual(response.data["risk_level"], "medium")
        self.assertEqual(response.data["missing_information"], ["Detailed budget"])
