from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0004_adminuseraction"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="campaign_notifications_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name="notification",
            name="type",
            field=models.CharField(
                choices=[
                    ("campaign_update", "Campaign update"),
                    ("fund_utilization", "Fund utilization report"),
                    ("campaign_approved", "Campaign approved"),
                    ("campaign_rejected", "Campaign rejected"),
                ],
                max_length=32,
            ),
        ),
    ]
