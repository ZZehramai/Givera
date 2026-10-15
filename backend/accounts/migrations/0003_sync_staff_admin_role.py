from django.db import migrations


def sync_staff_roles(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(is_staff=True).exclude(role="admin").update(role="admin")
    User.objects.filter(is_superuser=True).exclude(role="admin").update(role="admin")


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_notification"),
    ]

    operations = [
        migrations.RunPython(sync_staff_roles, migrations.RunPython.noop),
    ]
