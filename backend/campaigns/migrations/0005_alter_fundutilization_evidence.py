from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("campaigns", "0004_fundutilization"),
    ]

    operations = [
        migrations.AlterField(
            model_name="fundutilization",
            name="evidence",
            field=models.FileField(blank=True, null=True, upload_to="fund-utilization/"),
        ),
    ]
