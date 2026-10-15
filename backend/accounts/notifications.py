from django.db.models import Q

from .models import Notification, User


def notify_active_admins(*, notification_type, title, message, link):
    """Create the same operational notification for every active administrator."""
    admin_ids = User.objects.filter(is_active=True).filter(
        Q(role=User.Role.ADMIN) | Q(is_staff=True) | Q(is_superuser=True)
    ).values_list("id", flat=True).distinct()
    Notification.objects.bulk_create([
        Notification(
            recipient_id=admin_id,
            type=notification_type,
            title=title,
            message=message,
            link=link,
        )
        for admin_id in admin_ids
    ])
