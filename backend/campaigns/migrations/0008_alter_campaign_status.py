from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("campaigns", "0007_campaignmedia_purpose"),
    ]

    operations = [
        migrations.AlterField(
            model_name="campaign",
            name="status",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    ("pending", "Pending review"),
                    ("approved", "Approved"),
                    ("rejected", "Rejected"),
                    ("completed", "Completed"),
                    ("unpublished", "Unpublished"),
                    ("archived", "Archived"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
    ]
