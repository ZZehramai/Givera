import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Donation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="donations",
    )
    campaign = models.ForeignKey(
        "campaigns.Campaign",
        on_delete=models.CASCADE,
        related_name="donations",
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("1.00"))],
    )
    message = models.CharField(max_length=280, blank=True)
    is_anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.donor.email} donated {self.amount} to {self.campaign.title}"


class DemoPayment(models.Model):
    """A non-monetary checkout record used to demonstrate the wallet flow.

    This model deliberately contains no provider credentials, QR payloads, or
    card/wallet information.  It can later be replaced by a real provider
    transaction once Givera has a merchant account and webhook integration.
    """

    class Provider(models.TextChoices):
        KBZPAY = "kbzpay", "KBZPay"
        WAVE = "wave", "Wave Money"
        MMQR = "mmqr", "MMQR (any supported wallet)"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Demo payment completed"
        CANCELLED = "cancelled", "Cancelled"
        FAILED = "failed", "Failed"
        EXPIRED = "expired", "Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="demo_payments")
    campaign = models.ForeignKey("campaigns.Campaign", on_delete=models.CASCADE, related_name="demo_payments")
    provider = models.CharField(max_length=20, choices=Provider.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("1.00"))])
    message = models.CharField(max_length=280, blank=True)
    is_anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    transaction_reference = models.CharField(max_length=32, unique=True)
    failure_reason = models.CharField(max_length=160, blank=True)
    donation = models.OneToOneField(Donation, on_delete=models.SET_NULL, null=True, blank=True, related_name="demo_payment")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Demo {self.provider} payment {self.id}"
