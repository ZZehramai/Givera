from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Grants access only to users with role == admin."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


class IsDonor(BasePermission):
    """Grants access only to users with role == donor."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'donor')


class IsAdminOrReadOnly(BasePermission):
    """Anyone authenticated can read; only admins can write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


class IsOwnerOrAdmin(BasePermission):
    """Object-level permission: owner of the object or an admin."""

    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, 'user', None) or getattr(obj, 'donor', None) or getattr(obj, 'created_by', None)
        return request.user.is_admin_role or owner == request.user
