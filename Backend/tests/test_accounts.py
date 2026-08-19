import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.accounts.models import Account

User = get_user_model()

@pytest.fixture
def user():
    return User.objects.create_user(email='test@example.com', password='testpassword123', name='Test User', currency='USD')

@pytest.fixture
def other_user():
    return User.objects.create_user(email='other@example.com', password='otherpassword123', name='Other User')

@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()

@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def account(user):
    return Account.objects.create(
        user=user,
        name='Main Bank',
        type='bank',
        balance=1000.50
    )

@pytest.mark.django_db
class TestAccountAPI:
    def test_create_account(self, auth_client, user):
        url = reverse('account-list')
        data = {
            'name': 'Wallet',
            'type': 'wallet',
            'balance': '50.00'
        }
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == data['name']
        assert Account.objects.count() == 1
        assert Account.objects.first().user == user

    def test_get_accounts(self, auth_client, account, other_user):
        Account.objects.create(user=other_user, name='Other', type='cash')
        
        url = reverse('account-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data['results'] if 'results' in response.data else response.data
        assert len(data) == 1
        assert data[0]['name'] == account.name

    def test_get_account_detail(self, auth_client, account):
        url = reverse('account-detail', args=[account.id])
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == account.name

    def test_update_account(self, auth_client, account):
        url = reverse('account-detail', args=[account.id])
        data = {
            'name': 'Updated Bank',
            'type': 'bank',
            'balance': '1500.00'
        }
        response = auth_client.put(url, data)
        assert response.status_code == status.HTTP_200_OK
        account.refresh_from_db()
        assert account.name == 'Updated Bank'
        assert float(account.balance) == 1500.00

    def test_delete_account(self, auth_client, account):
        url = reverse('account-detail', args=[account.id])
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Account.objects.count() == 0

    def test_unauthorized_access(self, api_client):
        url = reverse('account-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
