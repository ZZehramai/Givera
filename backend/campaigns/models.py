import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Campaign(models.Model):
    class Category(models.TextChoices):
        EDUCATION = "education", "Education"
        MEDICAL = "medical", "Medical"
        EMERGENCY = "emergency", "Emergency relief"
        COMMUNITY = "community", "Community"
        ENVIRONMENT = "environment", "Environment"
        ANIMALS = "animals", "Animals"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        COMPLETED = "completed", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="campaigns",
    )
    title = models.CharField(max_length=160)
    summary = models.CharField(max_length=280)
    story = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )
    beneficiary = models.CharField(max_length=160)
    location = models.CharField(max_length=160)
    goal_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(1)],
    )
    amount_raised = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    cover_image = models.ImageField(
        upload_to="campaigns/",
        blank=True,
        null=True,
    )
    deadline = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    rejection_reason = models.TextField(blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def progress_percentage(self):
        if not self.goal_amount:
            return 0
        return min(round(float(self.amount_raised / self.goal_amount * 100), 1), 100)

    def approve(self):
        self.status = self.Status.APPROVED
        self.rejection_reason = ""
        self.approved_at = timezone.now()
        self.save(update_fields=["status", "rejection_reason", "approved_at", "updated_at"])
