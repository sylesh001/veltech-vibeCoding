from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'mobile_number', 'password', 'password_confirm']
        extra_kwargs = {
            'name': {'required': True},
            'email': {'required': True},
        }

    def validate_email(self, value):
        """Normalize and validate email uniqueness."""
        return value.lower().strip()

    def validate(self, attrs):
        """Ensure passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': 'Passwords do not match.'}
            )
        return attrs

    def create(self, validated_data):
        """Create and return a new user."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            mobile_number=validated_data.get('mobile_number', ''),
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that returns user info along with tokens."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'name': self.user.name,
        }
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing and updating user profile."""

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'mobile_number', 'currency', 'profile_photo', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value
