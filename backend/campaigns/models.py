import uuid
from decimal import Decimal

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
        UNPUBLISHED = "unpublished", "Unpublished"
        ARCHIVED = "archived", "Archived"

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


class CampaignUpdate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name="updates")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="campaign_updates")
    title = models.CharField(max_length=160)
    body = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.campaign.title}: {self.title}"


class CampaignMedia(models.Model):
    """An organizer-uploaded gallery item or campaign-update attachment."""

    class MediaType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"

    class Purpose(models.TextChoices):
        GALLERY = "gallery", "Campaign gallery"
        COVER = "cover", "Additional cover"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name="media_items")
    update = models.ForeignKey(
        CampaignUpdate,
        on_delete=models.CASCADE,
        related_name="media",
        null=True,
        blank=True,
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="campaign_media",
    )
    file = models.FileField(upload_to="campaign-media/")
    media_type = models.CharField(max_length=10, choices=MediaType.choices)
    purpose = models.CharField(max_length=10, choices=Purpose.choices, default=Purpose.GALLERY)
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.campaign.title}: {self.file.name}"


class FundUtilization(models.Model):
    """An administrator-published, evidence-backed record of campaign spending."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending review"
        APPROVED = "approved", "Published"
        REJECTED = "rejected", "Needs changes"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name="fund_utilizations")
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fund_utilizations")
    title = models.CharField(max_length=160)
    description = models.TextField(max_length=2000)
    amount_spent = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("1.00"))])
    spent_on = models.DateField()
    evidence = models.FileField(upload_to="fund-utilization/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    review_note = models.CharField(max_length=500, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-spent_on", "-created_at"]

    def __str__(self):
        return f"{self.campaign.title}: {self.title}"

class Comment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    campaign = models.ForeignKey(
        'Campaign', 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user} on {self.campaign}"