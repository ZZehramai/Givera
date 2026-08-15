import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for Givera.
    Supports traditional email/password login and Google OAuth login.
    """

    class Role(models.TextChoices):
        DONOR = 'donor', 'Donor'
        ADMIN = 'admin', 'Admin'

    class AuthProvider(models.TextChoices):
        EMAIL = 'email', 'Email'
        GOOGLE = 'google', 'Google'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.DONOR)
    auth_provider = models.CharField(max_length=10, choices=AuthProvider.choices, default=AuthProvider.EMAIL)
    google_id = models.CharField(max_length=255, null=True, blank=True, unique=True)

    phone_number = models.CharField(max_length=20, blank=True)
    profile_picture = models.URLField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    

    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        # Staff users can access the Givera admin workspace, so their public
        # application role must always describe the same level of access.
        if (self.is_staff or self.is_superuser) and self.role != self.Role.ADMIN:
            self.role = self.Role.ADMIN
            if kwargs.get('update_fields') is not None:
                kwargs['update_fields'] = set(kwargs['update_fields']) | {'role'}
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.email} ({self.role})'

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN


class PasswordResetOTP(models.Model):
    """Stores one-time codes used for the Forgot Password flow."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_otps')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        from django.utils import timezone
        expiry_minutes = 15
        return (not self.is_used) and (timezone.now() - self.created_at).total_seconds() < expiry_minutes * 60

    def __str__(self):
        return f'OTP for {self.user.email}'


class Notification(models.Model):
    class Type(models.TextChoices):
        CAMPAIGN_UPDATE = "campaign_update", "Campaign update"
        CAMPAIGN_APPROVED = "campaign_approved", "Campaign approved"
        CAMPAIGN_REJECTED = "campaign_rejected", "Campaign rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=32, choices=Type.choices)
    title = models.CharField(max_length=160)
    message = models.CharField(max_length=280)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient.email}: {self.title}"
