from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.db.models import Count, DecimalField, IntegerField, OuterRef, Subquery, Sum, Value
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    RegisterSerializer, LoginSerializer, GoogleLoginSerializer,
    NotificationSerializer, UserSerializer, ChangePasswordSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, AdminUserDetailSerializer, AdminUserSerializer,
    AdminUserUpdateSerializer, tokens_for_user,
)
from .models import AdminUserAction, Notification
from .permissions import IsAdmin
from .google_auth import verify_google_token
from .utils import send_password_reset_email, send_welcome_email

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Traditional email/password registration."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_welcome_email(user)
        tokens = tokens_for_user(user)
        return Response(
            {
               "message": "Registration successful",
               'user': UserSerializer(user).data, **tokens
          },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Traditional email/password login."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = tokens_for_user(user)
        return Response({'user': UserSerializer(user).data, **tokens})


class GoogleLoginView(APIView):
    """
    Login/registration via Google Sign-In.
    Frontend sends the Google `id_token` obtained from Google Identity Services.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        idinfo = verify_google_token(serializer.validated_data['id_token'])

        email = idinfo['email']
        google_id = idinfo['sub']

        existing = User.objects.filter(email__iexact=email).first()
        if existing:
            user, created = existing, False
            if not user.google_id:
                # Link an existing email/password account to Google
                user.google_id = google_id
                user.profile_picture = user.profile_picture or idinfo.get('picture', '')
                user.save(update_fields=['google_id', 'profile_picture'])
        else:
            user = User.objects.create(
                email=email,
                username=email.split('@')[0],
                first_name=idinfo.get('given_name', ''),
                last_name=idinfo.get('family_name', ''),
                google_id=google_id,
                auth_provider=User.AuthProvider.GOOGLE,
                profile_picture=idinfo.get('picture', ''),
                is_email_verified=idinfo.get('email_verified', False),
            )
            user.set_unusable_password()
            user.save(update_fields=['password'])
            created = True

        if created:
            send_welcome_email(user)

        tokens = tokens_for_user(user)
        return Response({'user': UserSerializer(user).data, **tokens})


class LogoutView(APIView):
    """Blacklists the refresh token to invalidate the session."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except (KeyError, TokenError):
            return Response({'detail': 'Invalid or missing refresh token.'}, status=status.HTTP_400_BAD_REQUEST)


class TokenRefreshView(BaseTokenRefreshView):
    """Thin wrapper kept for a consistent /api/auth/ namespace."""
    pass


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the logged-in user's profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


def admin_user_queryset():
    from campaigns.models import Campaign
    from donations.models import Donation

    campaign_counts = (
        Campaign.objects.filter(owner=OuterRef("pk"))
        .values("owner")
        .annotate(total=Count("id"))
        .values("total")
    )
    donation_stats = (
        Donation.objects.filter(donor=OuterRef("pk"))
        .values("donor")
        .annotate(total_count=Count("id"), total_amount=Sum("amount"))
    )
    return User.objects.annotate(
        campaign_count=Coalesce(Subquery(campaign_counts, output_field=IntegerField()), Value(0)),
        donation_count=Coalesce(Subquery(donation_stats.values("total_count"), output_field=IntegerField()), Value(0)),
        total_donated=Coalesce(
            Subquery(donation_stats.values("total_amount"), output_field=DecimalField(max_digits=14, decimal_places=2)),
            Value(Decimal("0.00")),
            output_field=DecimalField(max_digits=14, decimal_places=2),
        ),
    ).order_by("-created_at")


class AdminUserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    pagination_class = AdminUserPagination

    def get_queryset(self):
        queryset = admin_user_queryset()
        query = self.request.query_params.get("q", "").strip()
        role = self.request.query_params.get("role", "").strip()
        account_status = self.request.query_params.get("status", "").strip()
        if query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(email__icontains=query)
                | Q(username__icontains=query)
                | Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
            )
        if role in {User.Role.ADMIN, User.Role.DONOR}:
            queryset = queryset.filter(role=role)
        if account_status == "active":
            queryset = queryset.filter(is_active=True)
        elif account_status == "suspended":
            queryset = queryset.filter(is_active=False)
        return queryset


class AdminUserDetailView(APIView):
    permission_classes = [IsAdmin]

    def get_user(self, pk):
        return get_object_or_404(admin_user_queryset(), pk=pk)

    def get(self, request, pk):
        return Response(AdminUserDetailSerializer(self.get_user(pk)).data)

    def patch(self, request, pk):
        target = self.get_user(pk)
        serializer = AdminUserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        changes = serializer.validated_data

        if target == request.user and (
            changes.get("role") == User.Role.DONOR
            or changes.get("is_active") is False
        ):
            return Response(
                {"detail": "You cannot demote or suspend your own administrator account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if target.is_staff and changes.get("role") == User.Role.DONOR:
            return Response(
                {"detail": "Django staff access must be removed before changing this account to Donor."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        active_admins = User.objects.filter(role=User.Role.ADMIN, is_active=True).count()
        removing_admin = (
            target.role == User.Role.ADMIN
            and target.is_active
            and (changes.get("role") == User.Role.DONOR or changes.get("is_active") is False)
        )
        if removing_admin and active_admins <= 1:
            return Response(
                {"detail": "At least one active administrator must remain."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        update_fields = []
        actions = []
        if "role" in changes and changes["role"] != target.role:
            previous = target.role
            target.role = changes["role"]
            update_fields.append("role")
            actions.append(AdminUserAction(actor=request.user, target=target, action=AdminUserAction.Action.ROLE_CHANGED, previous_value=previous, new_value=target.role))
        if "is_active" in changes and changes["is_active"] != target.is_active:
            previous = str(target.is_active)
            target.is_active = changes["is_active"]
            update_fields.append("is_active")
            action = AdminUserAction.Action.ACTIVATED if target.is_active else AdminUserAction.Action.SUSPENDED
            actions.append(AdminUserAction(actor=request.user, target=target, action=action, previous_value=previous, new_value=str(target.is_active)))

        if update_fields:
            target.save(update_fields=update_fields)
            AdminUserAction.objects.bulk_create(actions)
        target = self.get_user(pk)
        return Response(AdminUserDetailSerializer(target).data)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)[:30]


class NotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user

        if user.auth_provider == User.AuthProvider.GOOGLE and not user.has_usable_password():
            return Response(
                {'detail': 'This account uses Google Sign-In and has no password to change.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Password updated successfully.'})


class ForgotPasswordView(APIView):
    """Email a secure reset link without revealing whether an account exists."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        # Google-created accounts start without a local password. They should
        # still be able to use account recovery to create one and then sign in
        # with either Google or their verified email address.
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?uid={uid}&token={token}"
            send_password_reset_email(user, reset_url)

        return Response({'detail': 'If that email exists, a password reset link has been sent.'})


class ResetPasswordView(APIView):
    """Validate the emailed reset token and set a new password."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user_id = force_str(urlsafe_base64_decode(data['uid']))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, ValidationError, User.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, data['token']):
            return Response(
                {'detail': 'This password reset link is invalid or has expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(data['new_password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Password reset successfully. You can now log in.'})
