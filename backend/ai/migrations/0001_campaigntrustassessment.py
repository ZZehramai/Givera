import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("campaigns", "0009_comment"),
    ]

    operations = [
        migrations.CreateModel(
            name="CampaignTrustAssessment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("risk_level", models.CharField(choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")], max_length=10)),
                ("summary", models.CharField(max_length=500)),
                ("flags", models.JSONField(default=list)),
                ("missing_information", models.JSONField(default=list)),
                ("suggested_checks", models.JSONField(default=list)),
                ("provider", models.CharField(default="demo", max_length=20)),
                ("analyzed_at", models.DateTimeField(auto_now=True)),
                ("campaign", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="trust_assessment", to="campaigns.campaign")),
            ],
        ),
    ]
