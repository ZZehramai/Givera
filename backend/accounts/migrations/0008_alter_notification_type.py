from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0007_alter_notification_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notification",
            name="type",
            field=models.CharField(
                choices=[
                    ("campaign_update", "Campaign update"),
                    ("fund_utilization", "Fund utilization report"),
                    ("campaign_approved", "Campaign approved"),
                    ("campaign_rejected", "Campaign rejected"),
                    ("payment_verified", "Payment verified"),
                    ("payment_rejected", "Payment rejected"),
                    ("campaign_pending_review", "Campaign pending review"),
                    ("payment_pending_review", "Payment pending review"),
                ],
                max_length=32,
            ),
        ),
    ]
