import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture
def api_client():
    """Return an unauthenticated API client."""
    return APIClient()


@pytest.fixture
def user_data():
    """Return valid user registration data."""
    return {
        'name': 'Test User',
        'email': 'testuser@example.com',
        'mobile_number': '+919876543210',
        'password': 'StrongPass123!',
        'password_confirm': 'StrongPass123!',
    }


@pytest.fixture
def user(db):
    """Create and return a test user."""
    return User.objects.create_user(
        email='testuser@example.com',
        name='Test User',
        password='StrongPass123!',
        mobile_number='+919876543210',
        currency='USD',
    )


@pytest.fixture
def auth_tokens(user):
    """Generate JWT tokens for the test user."""
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


@pytest.fixture
def authenticated_client(api_client, user):
    """Return an API client authenticated as the test user."""
    api_client.force_authenticate(user=user)
    return api_client
