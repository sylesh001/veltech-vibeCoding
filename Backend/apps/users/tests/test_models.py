import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    """Tests for the custom User model."""

    def test_create_user_with_email(self):
        """Test creating a user with email as the identifier."""
        user = User.objects.create_user(
            email='user@example.com',
            name='Test User',
            password='testpass123',
        )
        assert user.email == 'user@example.com'
        assert user.name == 'Test User'
        assert user.check_password('testpass123')
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_create_user_normalizes_email(self):
        """Test that email is normalized on creation."""
        user = User.objects.create_user(
            email='User@EXAMPLE.COM',
            name='Test',
            password='testpass123',
        )
        assert user.email == 'User@example.com'

    def test_create_user_without_email_raises(self):
        """Test that creating a user without email raises ValueError."""
        with pytest.raises(ValueError, match='The Email field is required'):
            User.objects.create_user(email='', name='Test', password='testpass123')

    def test_create_superuser(self):
        """Test creating a superuser."""
        user = User.objects.create_superuser(
            email='admin@example.com',
            name='Admin User',
            password='adminpass123',
        )
        assert user.is_staff is True
        assert user.is_superuser is True

    def test_create_superuser_without_is_staff_raises(self):
        """Test superuser must have is_staff=True."""
        with pytest.raises(ValueError, match='is_staff=True'):
            User.objects.create_superuser(
                email='admin@example.com',
                name='Admin',
                password='adminpass123',
                is_staff=False,
            )

    def test_create_superuser_without_is_superuser_raises(self):
        """Test superuser must have is_superuser=True."""
        with pytest.raises(ValueError, match='is_superuser=True'):
            User.objects.create_superuser(
                email='admin@example.com',
                name='Admin',
                password='adminpass123',
                is_superuser=False,
            )

    def test_duplicate_email_raises_integrity_error(self):
        """Test that duplicate emails are rejected."""
        User.objects.create_user(
            email='dup@example.com',
            name='User 1',
            password='testpass123',
        )
        with pytest.raises(IntegrityError):
            User.objects.create_user(
                email='dup@example.com',
                name='User 2',
                password='testpass123',
            )

    def test_user_str_returns_email(self):
        """Test the string representation of the user."""
        user = User.objects.create_user(
            email='str@example.com',
            name='Test',
            password='testpass123',
        )
        assert str(user) == 'str@example.com'

    def test_default_currency_is_inr(self):
        """Test that default currency is INR."""
        user = User.objects.create_user(
            email='curr@example.com',
            name='Test',
            password='testpass123',
        )
        assert user.currency == 'INR'

    def test_mobile_number_field(self):
        """Test mobile number can be set."""
        user = User.objects.create_user(
            email='mobile@example.com',
            name='Test',
            password='testpass123',
            mobile_number='+919876543210',
        )
        assert user.mobile_number == '+919876543210'

    def test_invalid_mobile_number_fails_validation(self):
        """Test that invalid mobile numbers fail validation."""
        user = User(
            email='invalid@example.com',
            name='Test',
            mobile_number='not-a-number',
        )
        with pytest.raises(ValidationError):
            user.full_clean()

    def test_username_field_is_email(self):
        """Test that USERNAME_FIELD is set to email."""
        assert User.USERNAME_FIELD == 'email'

    def test_required_fields(self):
        """Test that REQUIRED_FIELDS contains name."""
        assert 'name' in User.REQUIRED_FIELDS
        assert 'email' not in User.REQUIRED_FIELDS  # USERNAME_FIELD is excluded
