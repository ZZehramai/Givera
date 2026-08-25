from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

from django.core import mail
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import AdminUserAction, User


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_URL="http://localhost:5173",
    PASSWORD_RESET_TIMEOUT=1800,
)
class PasswordResetApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="donor@example.com",
            username="donor",
            password="OriginalPassword123!",
        )

    def request_reset_link(self):
        response = self.client.post(
            reverse("forgot-password"),
            {"email": self.user.email},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        reset_url = next(
            line.split("Reset your password: ", 1)[1]
            for line in mail.outbox[0].body.splitlines()
            if line.startswith("Reset your password: ")
        )
        query = parse_qs(urlparse(reset_url).query)
        return query["uid"][0], query["token"][0]

    def test_request_does_not_reveal_unknown_email(self):
        response = self.client.post(
            reverse("forgot-password"),
            {"email": "unknown@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)
        self.assertIn("If that email exists", response.data["detail"])

    def test_valid_link_resets_password_and_cannot_be_reused(self):
        uid, token = self.request_reset_link()
        payload = {
            "uid": uid,
            "token": token,
            "new_password": "NewStrongPassword456!",
            "new_password2": "NewStrongPassword456!",
        }

        response = self.client.post(reverse("reset-password"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewStrongPassword456!"))

        reused = self.client.post(reverse("reset-password"), payload, format="json")
        self.assertEqual(reused.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_token_is_rejected(self):
        uid, _ = self.request_reset_link()
        response = self.client.post(
            reverse("reset-password"),
            {
                "uid": uid,
                "token": "invalid-token",
                "new_password": "NewStrongPassword456!",
                "new_password2": "NewStrongPassword456!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_google_account_can_create_password_from_reset_link(self):
        google_user = User.objects.create(
            email="google-user@example.com",
            username="google-user",
            auth_provider=User.AuthProvider.GOOGLE,
            google_id="google-reset-123",
            is_active=True,
            is_email_verified=True,
        )
        google_user.set_unusable_password()
        google_user.save(update_fields=["password"])

        response = self.client.post(
            reverse("forgot-password"),
            {"email": google_user.email},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        reset_url = next(
            line.split("Reset your password: ", 1)[1]
            for line in mail.outbox[0].body.splitlines()
            if line.startswith("Reset your password: ")
        )
        query = parse_qs(urlparse(reset_url).query)
        reset_response = self.client.post(
            reverse("reset-password"),
            {
                "uid": query["uid"][0],
                "token": query["token"][0],
                "new_password": "NewGooglePassword456!",
                "new_password2": "NewGooglePassword456!",
            },
            format="json",
        )

        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)
        google_user.refresh_from_db()
        self.assertTrue(google_user.check_password("NewGooglePassword456!"))


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

    def test_staff_account_is_automatically_given_admin_role(self):
        staff_user = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password="StrongPassword123!",
            is_staff=True,
        )

        self.assertEqual(staff_user.role, User.Role.ADMIN)


class DonorChangePasswordApiTests(APITestCase):
    def setUp(self):
        self.donor = User.objects.create_user(
            email="password-donor@example.com",
            username="password-donor",
            password="OriginalPassword123!",
        )
        self.client.force_authenticate(self.donor)

    def test_donor_can_change_password(self):
        response = self.client.post(
            reverse("change-password"),
            {
                "old_password": "OriginalPassword123!",
                "new_password": "NewStrongPassword456!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.donor.refresh_from_db()
        self.assertTrue(self.donor.check_password("NewStrongPassword456!"))

    def test_donor_cannot_change_password_with_wrong_current_password(self):
        response = self.client.post(
            reverse("change-password"),
            {
                "old_password": "WrongPassword123!",
                "new_password": "NewStrongPassword456!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.donor.refresh_from_db()
        self.assertTrue(self.donor.check_password("OriginalPassword123!"))


class AdminUserManagementApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="manager@example.com",
            username="manager",
            password="StrongPassword123!",
            role=User.Role.ADMIN,
        )
        self.donor = User.objects.create_user(
            email="member@example.com",
            username="member",
            password="StrongPassword123!",
        )
        self.client.force_authenticate(self.admin)

    def test_admin_can_search_paginated_user_directory(self):
        response = self.client.get(reverse("admin-user-list"), {"q": "member", "role": "donor"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["email"], self.donor.email)
        self.assertIn("campaign_count", response.data["results"][0])
        self.assertIn("total_donated", response.data["results"][0])

    def test_admin_can_change_role_and_suspend_user_with_audit_log(self):
        role_response = self.client.patch(
            reverse("admin-user-detail", kwargs={"pk": self.donor.pk}),
            {"role": User.Role.ADMIN},
            format="json",
        )
        suspend_response = self.client.patch(
            reverse("admin-user-detail", kwargs={"pk": self.donor.pk}),
            {"is_active": False},
            format="json",
        )

        self.assertEqual(role_response.status_code, status.HTTP_200_OK)
        self.assertEqual(suspend_response.status_code, status.HTTP_200_OK)
        self.donor.refresh_from_db()
        self.assertEqual(self.donor.role, User.Role.ADMIN)
        self.assertFalse(self.donor.is_active)
        self.assertEqual(AdminUserAction.objects.filter(target=self.donor).count(), 2)

    def test_admin_cannot_suspend_self(self):
        response = self.client.patch(
            reverse("admin-user-detail", kwargs={"pk": self.admin.pk}),
            {"is_active": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.is_active)

    def test_donor_cannot_access_user_management(self):
        self.client.force_authenticate(self.donor)

        response = self.client.get(reverse("admin-user-list"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
