from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import AdminUserAction, Notification, User


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'role',
            'auth_provider', 'phone_number', 'profile_picture', 'country',
            'bio', 'is_email_verified', 'is_staff', 'created_at'
        ]
        read_only_fields = [
            'id', 'role', 'auth_provider', 'is_email_verified', 'is_staff', 'created_at'
        ]


class AdminUserActionSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.username", read_only=True)
    action_label = serializers.CharField(source="get_action_display", read_only=True)

    class Meta:
        model = AdminUserAction
        fields = ["id", "actor_name", "action", "action_label", "previous_value", "new_value", "created_at"]
        read_only_fields = fields


class AdminUserSerializer(UserSerializer):
    campaign_count = serializers.IntegerField(read_only=True)
    donation_count = serializers.IntegerField(read_only=True)
    total_donated = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ["is_active", "campaign_count", "donation_count", "total_donated"]
        read_only_fields = fields


class AdminUserDetailSerializer(AdminUserSerializer):
    recent_admin_actions = serializers.SerializerMethodField()

    class Meta(AdminUserSerializer.Meta):
        fields = AdminUserSerializer.Meta.fields + ["recent_admin_actions"]

    def get_recent_admin_actions(self, obj):
        return AdminUserActionSerializer(obj.admin_actions_received.select_related("actor")[:8], many=True).data


class AdminUserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=User.Role.choices, required=False)
    is_active = serializers.BooleanField(required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Choose a role or account-status change.")
        return attrs


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "type", "title", "message", "link", "is_read", "created_at"]
        read_only_fields = fields
        read_only_fields = [
            'id', 'role', 'auth_provider', 'is_email_verified', 'is_staff', 'created_at'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': "Passwords don't match."})
        if User.objects.filter(email__iexact=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'An account with this email already exists.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data, auth_provider=User.AuthProvider.EMAIL)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(email=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')
        attrs['user'] = user
        return attrs


class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(validators=[validate_password])
