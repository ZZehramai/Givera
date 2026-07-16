from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    RegisterSerializer, LoginSerializer, GoogleLoginSerializer,
    UserSerializer, ChangePasswordSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, tokens_for_user,
)
from .models import PasswordResetOTP
from .google_auth import verify_google_token
from .utils import generate_otp, send_password_reset_email, send_welcome_email

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
    """Step 1: request an OTP code sent to the user's email."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Don't reveal whether the email exists
            return Response({'detail': 'If that email exists, a reset code has been sent.'})

        code = generate_otp()
        PasswordResetOTP.objects.create(user=user, code=code)
        send_password_reset_email(user, code)
        return Response({'detail': 'If that email exists, a reset code has been sent.'})


class ResetPasswordView(APIView):
    """Step 2: verify OTP and set a new password."""
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = User.objects.get(email__iexact=data['email'])
            otp = user.reset_otps.filter(code=data['code']).latest('created_at')
        except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
            return Response({'detail': 'Invalid code.'}, status=status.HTTP_400_BAD_REQUEST)

        if not otp.is_valid():
            return Response({'detail': 'This code has expired or was already used.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data['new_password'])
        user.save()
        otp.is_used = True
        otp.save(update_fields=['is_used'])
        return Response({'detail': 'Password reset successfully. You can now log in.'})
