import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0005_campaign_notification_preferences"),
    ]

    operations = [
        migrations.CreateModel(
            name="NewsletterSubscriber",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("language", models.CharField(choices=[("en", "English"), ("my", "Myanmar")], default="en", max_length=2)),
                ("is_active", models.BooleanField(default=True)),
                ("subscribed_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-subscribed_at"]},
        ),
    ]
