from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import AdminUserAction, User, PasswordResetOTP, Notification


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'username', 'role', 'auth_provider', 'is_active', 'created_at']
    list_filter = ['role', 'auth_provider', 'is_active']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    fieldsets = UserAdmin.fieldsets + (
        ('Givera Profile', {
            'fields': ('role', 'auth_provider', 'google_id', 'phone_number',
                       'profile_picture', 'country', 'bio', 'is_email_verified')
        }),
    )


@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'is_used', 'created_at']
    list_filter = ['is_used']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["recipient", "type", "title", "is_read", "created_at"]
    list_filter = ["type", "is_read", "created_at"]
    search_fields = ["recipient__email", "title", "message"]


@admin.register(AdminUserAction)
class AdminUserActionAdmin(admin.ModelAdmin):
    list_display = ["actor", "target", "action", "previous_value", "new_value", "created_at"]
    list_filter = ["action", "created_at"]
    search_fields = ["actor__email", "target__email"]
    readonly_fields = ["actor", "target", "action", "previous_value", "new_value", "created_at"]
