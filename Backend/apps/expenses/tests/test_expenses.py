import pytest
from rest_framework import status
from rest_framework.test import APIClient
from decimal import Decimal
from django.urls import reverse
from apps.expenses.models import Expense
from apps.categories.models import Category

pytestmark = pytest.mark.django_db

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def category(user):
    return Category.objects.create(name='Test Category', type='expense', user=user)

@pytest.fixture
def expense(user, category):
    return Expense.objects.create(
        user=user,
        amount=Decimal('100.00'),
        category=category,
        payment_method='Card',
        date='2023-10-01',
        note='Weekly groceries'
    )

@pytest.fixture
def other_user():
    from django.contrib.auth import get_user_model
    User = get_user_model()
    return User.objects.create_user(
        email='other@example.com',
        name='Other User',
        password='StrongPass123!'
    )

def test_create_expense(authenticated_client, user, category):
    url = reverse('expenses:expense-list')
    data = {
        'amount': '50.00',
        'category': category.id,
        'payment_method': 'UPI',
        'date': '2023-10-02',
        'note': 'Uber ride'
    }
    response = authenticated_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Expense.objects.filter(user=user).count() == 1

def test_list_expenses(authenticated_client, expense):
    url = reverse('expenses:expense-list')
    response = authenticated_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
    assert len(results) == 1
    assert results[0]['amount'] == '100.00'

def test_retrieve_expense(authenticated_client, expense):
    url = reverse('expenses:expense-detail', kwargs={'pk': expense.id})
    response = authenticated_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == expense.id

def test_update_expense(authenticated_client, expense, category):
    url = reverse('expenses:expense-detail', kwargs={'pk': expense.id})
    data = {
        'amount': '150.00',
        'category': category.id,
        'payment_method': 'Card',
        'date': '2023-10-01',
        'note': 'Updated note'
    }
    response = authenticated_client.put(url, data)
    assert response.status_code == status.HTTP_200_OK
    expense.refresh_from_db()
    assert expense.amount == Decimal('150.00')

def test_delete_expense(authenticated_client, expense):
    url = reverse('expenses:expense-detail', kwargs={'pk': expense.id})
    response = authenticated_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Expense.objects.count() == 0

def test_other_user_cannot_access_expense(api_client, expense, other_user):
    api_client.force_authenticate(user=other_user)
    url = reverse('expenses:expense-detail', kwargs={'pk': expense.id})
    response = api_client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_invalid_amount_validation(authenticated_client, category):
    url = reverse('expenses:expense-list')
    data = {
        'amount': '-10.00',
        'category': category.id,
        'payment_method': 'UPI',
        'date': '2023-10-02'
    }
    response = authenticated_client.post(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'amount' in response.data

def test_filter_expenses(authenticated_client, user, category):
    cat2 = Category.objects.create(name='Transport', type='expense', user=user)
    Expense.objects.create(user=user, amount=Decimal('10.00'), category=category, payment_method='Cash', date='2023-10-01')
    Expense.objects.create(user=user, amount=Decimal('20.00'), category=cat2, payment_method='Card', date='2023-10-02')
    
    url = reverse('expenses:expense-list')
    response = authenticated_client.get(url, {'category': category.id})
    assert response.status_code == status.HTTP_200_OK
    results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
    assert len(results) == 1
    assert results[0]['category'] == category.id

def test_search_expenses(authenticated_client, user, category):
    Expense.objects.create(user=user, amount=Decimal('10.00'), category=category, payment_method='Cash', date='2023-10-01', note='Lunch with friend')
    Expense.objects.create(user=user, amount=Decimal('20.00'), category=category, payment_method='Card', date='2023-10-02', note='Bus ride')
    
    url = reverse('expenses:expense-list')
    response = authenticated_client.get(url, {'search': 'Lunch'})
    assert response.status_code == status.HTTP_200_OK
    results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
    assert len(results) == 1
    assert results[0]['note'] == 'Lunch with friend'
