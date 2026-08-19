import pytest
from rest_framework import status
from decimal import Decimal
from apps.incomes.models import Income
from apps.categories.models import Category

pytestmark = pytest.mark.django_db

@pytest.fixture
def category(user):
    return Category.objects.create(name='Salary', type='income', user=user)

@pytest.fixture
def other_category(user):
    return Category.objects.create(name='Bonus', type='income', user=user)

@pytest.fixture
def income(user, category):
    return Income.objects.create(
        user=user,
        amount=Decimal('5000.00'),
        category=category,
        date='2024-01-01',
        note='Monthly salary'
    )

@pytest.fixture
def other_user(django_user_model):
    return django_user_model.objects.create_user(
        email='other@example.com',
        password='password123',
        name='Other User'
    )

class TestIncomeModel:
    def test_create_income(self, user, category):
        income = Income.objects.create(
            user=user,
            amount=Decimal('100.50'),
            category=category,
            date='2024-02-15'
        )
        assert income.amount == Decimal('100.50')
        assert income.category == category
        assert str(income) == f"{user.email} - Salary - 100.50"

class TestIncomeAPI:
    def test_list_incomes(self, authenticated_client, income):
        response = authenticated_client.get('/api/incomes/')
        assert response.status_code == status.HTTP_200_OK
        data = response.data['results'] if 'results' in response.data else response.data
        assert len(data) == 1
        assert data[0]['category'] == income.category.id

    def test_create_income(self, authenticated_client, category):
        data = {
            'amount': '1500.00',
            'category': category.id,
            'date': '2024-03-01',
            'note': 'Yearly bonus'
        }
        response = authenticated_client.post('/api/incomes/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Income.objects.count() == 1
        assert Income.objects.first().category == category

    def test_create_income_invalid_amount(self, authenticated_client, category):
        data = {
            'amount': '-100.00',
            'category': category.id,
            'date': '2024-03-01'
        }
        response = authenticated_client.post('/api/incomes/', data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'amount' in response.data

    def test_retrieve_income(self, authenticated_client, income):
        response = authenticated_client.get(f'/api/incomes/{income.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['amount'] == '5000.00'

    def test_update_income(self, authenticated_client, income, other_category):
        data = {'category': other_category.id}
        response = authenticated_client.patch(f'/api/incomes/{income.id}/', data)
        assert response.status_code == status.HTTP_200_OK
        income.refresh_from_db()
        assert income.category == other_category

    def test_delete_income(self, authenticated_client, income):
        response = authenticated_client.delete(f'/api/incomes/{income.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Income.objects.count() == 0

    def test_unauthorized_access(self, api_client, income):
        response = api_client.get('/api/incomes/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_other_user_cannot_access_income(self, api_client, other_user, income):
        api_client.force_authenticate(user=other_user)
        response = api_client.get(f'/api/incomes/{income.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_filter_by_category(self, authenticated_client, user, category, other_category):
        Income.objects.create(user=user, amount=100, category=category, date='2024-01-01')
        Income.objects.create(user=user, amount=200, category=other_category, date='2024-01-02')
        response = authenticated_client.get(f'/api/incomes/?category={category.id}')
        assert response.status_code == status.HTTP_200_OK
        data = response.data['results'] if 'results' in response.data else response.data
        assert len(data) == 1
        assert data[0]['category'] == category.id

    def test_search_by_note(self, authenticated_client, user, category):
        Income.objects.create(user=user, amount=100, category=category, date='2024-01-01', note='findme')
        Income.objects.create(user=user, amount=200, category=category, date='2024-01-02', note='ignore')
        response = authenticated_client.get('/api/incomes/?search=findme')
        assert response.status_code == status.HTTP_200_OK
        data = response.data['results'] if 'results' in response.data else response.data
        assert len(data) == 1
        assert data[0]['note'] == 'findme'
