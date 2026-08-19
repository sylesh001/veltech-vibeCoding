import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

User = get_user_model()


# ---------------------------------------------------------------------------
# Registration Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestRegisterView:
    """Tests for POST /api/auth/register/"""

    url = reverse('users:register')

    def test_register_success(self, api_client, user_data):
        """Test successful registration returns 201 with tokens."""
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert 'tokens' in response.data
        assert 'access' in response.data['tokens']
        assert 'refresh' in response.data['tokens']
        assert response.data['user']['email'] == user_data['email'].lower()
        assert User.objects.filter(email=user_data['email'].lower()).exists()

    def test_register_duplicate_email(self, api_client, user, user_data):
        """Test registration with existing email returns 400."""
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data

    def test_register_password_mismatch(self, api_client, user_data):
        """Test registration with mismatched passwords returns 400."""
        user_data['password_confirm'] = 'DifferentPass123!'
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password_confirm' in response.data

    def test_register_missing_name(self, api_client, user_data):
        """Test registration without name returns 400."""
        del user_data['name']
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'name' in response.data

    def test_register_missing_email(self, api_client, user_data):
        """Test registration without email returns 400."""
        del user_data['email']
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data

    def test_register_missing_password(self, api_client, user_data):
        """Test registration without password returns 400."""
        del user_data['password']
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data

    def test_register_weak_password(self, api_client, user_data):
        """Test registration with a weak password returns 400."""
        user_data['password'] = '123'
        user_data['password_confirm'] = '123'
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_invalid_email(self, api_client, user_data):
        """Test registration with invalid email format returns 400."""
        user_data['email'] = 'not-an-email'
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data

    def test_register_with_mobile_number(self, api_client, user_data):
        """Test registration includes mobile number."""
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        user = User.objects.get(email=user_data['email'].lower())
        assert user.mobile_number == user_data['mobile_number']

    def test_register_without_mobile_number(self, api_client, user_data):
        """Test registration works without mobile number."""
        del user_data['mobile_number']
        response = api_client.post(self.url, user_data, format='json')
        assert response.status_code == status.HTTP_201_CREATED


# ---------------------------------------------------------------------------
# Login Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLoginView:
    """Tests for POST /api/auth/login/"""

    url = reverse('users:login')

    def test_login_success(self, api_client, user):
        """Test successful login returns access and refresh tokens."""
        response = api_client.post(
            self.url,
            {'email': 'testuser@example.com', 'password': 'StrongPass123!'},
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == 'testuser@example.com'

    def test_login_wrong_password(self, api_client, user):
        """Test login with wrong password returns 401."""
        response = api_client.post(
            self.url,
            {'email': 'testuser@example.com', 'password': 'WrongPassword!'},
            format='json',
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_email(self, api_client):
        """Test login with non-existent email returns 401."""
        response = api_client.post(
            self.url,
            {'email': 'nobody@example.com', 'password': 'SomePass123!'},
            format='json',
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_fields(self, api_client):
        """Test login without required fields returns 400."""
        response = api_client.post(self.url, {}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# Logout Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogoutView:
    """Tests for POST /api/auth/logout/"""

    url = reverse('users:logout')

    def test_logout_success(self, api_client, user, auth_tokens):
        """Test successful logout blacklists the refresh token."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_tokens["access"]}')
        response = api_client.post(
            self.url,
            {'refresh': auth_tokens['refresh']},
            format='json',
        )
        assert response.status_code == status.HTTP_205_RESET_CONTENT

        # Verify the refresh token is now blacklisted
        refresh_response = api_client.post(
            reverse('users:token-refresh'),
            {'refresh': auth_tokens['refresh']},
            format='json',
        )
        assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_without_refresh_token(self, authenticated_client):
        """Test logout without refresh token returns 400."""
        response = authenticated_client.post(self.url, {}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_logout_unauthenticated(self, api_client):
        """Test logout without authentication returns 401."""
        response = api_client.post(
            self.url,
            {'refresh': 'some-token'},
            format='json',
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Token Refresh Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestTokenRefresh:
    """Tests for POST /api/auth/token/refresh/"""

    url = reverse('users:token-refresh')

    def test_refresh_success(self, api_client, auth_tokens):
        """Test refreshing a valid token returns a new access token."""
        response = api_client.post(
            self.url,
            {'refresh': auth_tokens['refresh']},
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_refresh_invalid_token(self, api_client):
        """Test refreshing an invalid token returns 401."""
        response = api_client.post(
            self.url,
            {'refresh': 'invalid-token'},
            format='json',
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Profile Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestUserProfileView:
    """Tests for GET/PUT /api/auth/profile/"""

    url = reverse('users:profile')

    def test_get_profile_authenticated(self, authenticated_client, user):
        """Test authenticated user can retrieve their profile."""
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email
        assert response.data['name'] == user.name
        assert response.data['mobile_number'] == user.mobile_number
        assert response.data['currency'] == user.currency

    def test_get_profile_unauthenticated(self, api_client):
        """Test unauthenticated user cannot access profile."""
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile(self, authenticated_client, user):
        """Test updating profile fields."""
        response = authenticated_client.put(
            self.url,
            {
                'name': 'Updated Name',
                'mobile_number': '+911234567890',
                'currency': 'USD',
            },
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Name'
        assert response.data['mobile_number'] == '+911234567890'
        assert response.data['currency'] == 'USD'

    def test_update_profile_email_readonly(self, authenticated_client, user):
        """Test that email cannot be changed via profile update."""
        response = authenticated_client.put(
            self.url,
            {
                'name': user.name,
                'email': 'newemail@example.com',
                'mobile_number': user.mobile_number,
                'currency': user.currency,
            },
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email  # Unchanged

    def test_authenticated_access_with_jwt(self, api_client, auth_tokens):
        """Test accessing a protected endpoint with a JWT token."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_tokens["access"]}')
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

    def test_expired_token_denied(self, api_client):
        """Test that an invalid/expired JWT token is rejected."""
        api_client.credentials(HTTP_AUTHORIZATION='Bearer invalid-token-here')
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
