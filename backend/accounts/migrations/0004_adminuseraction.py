import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_sync_staff_admin_role"),
    ]

    operations = [
        migrations.CreateModel(
            name="AdminUserAction",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("action", models.CharField(choices=[("role_changed", "Role changed"), ("activated", "Account activated"), ("suspended", "Account suspended")], max_length=24)),
                ("previous_value", models.CharField(blank=True, max_length=50)),
                ("new_value", models.CharField(blank=True, max_length=50)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("actor", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="admin_actions_performed", to="accounts.user")),
                ("target", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="admin_actions_received", to="accounts.user")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
