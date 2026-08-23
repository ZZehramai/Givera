from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


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
    def test_empty_title_is_rejected_without_modifying_campaign_data(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("campaign-writing"),
            {**self.payload, "field": "title", "content": ""},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class GiveraHelpTests(APITestCase):
    @override_settings(GROQ_API_KEY="")
    def test_public_visitor_can_ask_about_demo_payments(self):
        response = self.client.post(
            reverse("givera-help"),
            {"message": "Are the KBZPay payments real?", "language": "en", "history": []},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["provider"], "demo")
        self.assertIn("demo flow", response.data["answer"])
        self.assertIn("No real money", response.data["answer"])

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
