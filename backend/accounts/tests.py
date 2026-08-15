from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class GoogleLoginApiTests(APITestCase):
    @patch("accounts.views.send_welcome_email")
    @patch("accounts.views.verify_google_token")
    def test_google_login_creates_session_for_new_user(
        self, verify_google_token, send_welcome_email
    ):
        verify_google_token.return_value = {
            "sub": "google-user-123",
            "email": "new-google-user@example.com",
            "given_name": "New",
            "family_name": "User",
            "picture": "https://example.com/avatar.png",
            "email_verified": True,
        }

        response = self.client.post(
            reverse("google-login"),
            {"id_token": "valid-google-credential"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "new-google-user@example.com")
        self.assertTrue(User.objects.filter(email="new-google-user@example.com").exists())
        send_welcome_email.assert_called_once()

    @patch("accounts.views.verify_google_token")
    def test_google_login_links_existing_email_account(self, verify_google_token):
        existing_user = User.objects.create_user(
            email="existing@example.com",
            username="existing",
            password="StrongPassword123!",
        )
        verify_google_token.return_value = {
            "sub": "google-existing-123",
            "email": "existing@example.com",
            "picture": "https://example.com/avatar.png",
            "email_verified": True,
        }

        response = self.client.post(
            reverse("google-login"),
            {"id_token": "valid-google-credential"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        existing_user.refresh_from_db()
        self.assertEqual(existing_user.google_id, "google-existing-123")


class ProfileApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="StrongPassword123!",
            role=User.Role.ADMIN,
        )
        self.client.force_authenticate(self.admin)

    def test_admin_can_edit_profile_details(self):
        response = self.client.patch(
            reverse("profile"),
            {
                "first_name": "Mya",
                "last_name": "Admin",
                "phone_number": "+95 9 123 456 789",
                "country": "Myanmar",
                "bio": "Givera platform administrator.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.first_name, "Mya")
        self.assertEqual(self.admin.phone_number, "+95 9 123 456 789")
        self.assertEqual(self.admin.bio, "Givera platform administrator.")

    def test_profile_edit_cannot_change_admin_permissions(self):
        response = self.client.patch(
            reverse("profile"),
            {"role": User.Role.DONOR, "is_staff": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.role, User.Role.ADMIN)
        self.assertFalse(self.admin.is_staff)
