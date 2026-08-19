import pytest
from rest_framework import status
from apps.budgets.models import Budget
from apps.expenses.models import Expense
from apps.categories.models import Category
from decimal import Decimal
from django.db.utils import IntegrityError

@pytest.fixture
def other_user(django_user_model):
    return django_user_model.objects.create_user(
        email='other@example.com',
        password='password123',
        name='Other User'
    )

@pytest.fixture
def category(user):
    return Category.objects.create(name='Food', type='expense', user=user)

@pytest.fixture
def category2(user):
    return Category.objects.create(name='Transport', type='expense', user=user)

@pytest.fixture
def other_category(other_user):
    return Category.objects.create(name='Transport', type='expense', user=other_user)

@pytest.mark.django_db
class TestBudgetModels:
    def test_create_budget(self, user, category):
        budget = Budget.objects.create(
            user=user,
            category=category,
            month=8,
            year=2026,
            amount=Decimal('500.00')
        )
        assert budget.user == user
        assert budget.category == category
        assert budget.amount == Decimal('500.00')
        assert str(budget) == f"{user.email} - Food - 8/2026 - 500.00"
        
    def test_unique_together_constraint(self, user, category):
        Budget.objects.create(user=user, category=category, month=8, year=2026, amount=Decimal('500.00'))
        with pytest.raises(IntegrityError):
            Budget.objects.create(user=user, category=category, month=8, year=2026, amount=Decimal('600.00'))

@pytest.mark.django_db
class TestBudgetAPI:
    def test_create_budget_api(self, authenticated_client, user, category):
        response = authenticated_client.post('/api/budgets/', {
            'category': category.id,
            'month': 9,
            'year': 2026,
            'amount': '1500.00'
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['category'] == category.id
        assert Budget.objects.count() == 1

    def test_list_budgets_permissions(self, authenticated_client, user, other_user, category, other_category):
        Budget.objects.create(user=user, category=category, month=8, year=2026, amount=Decimal('500.00'))
        Budget.objects.create(user=other_user, category=other_category, month=8, year=2026, amount=Decimal('200.00'))
        
        response = authenticated_client.get('/api/budgets/')
        assert response.status_code == status.HTTP_200_OK
        data = response.data['results'] if 'results' in response.data else response.data
        assert len(data) == 1
        assert data[0]['category'] == category.id

    def test_filter_budgets(self, authenticated_client, user, category, category2):
        Budget.objects.create(user=user, category=category, month=8, year=2026, amount=Decimal('500.00'))
        Budget.objects.create(user=user, category=category2, month=8, year=2026, amount=Decimal('200.00'))
        
        response = authenticated_client.get(f'/api/budgets/?category={category.id}')
        assert response.status_code == status.HTTP_200_OK
        data = response.data['results'] if 'results' in response.data else response.data
        assert len(data) == 1
        assert data[0]['category'] == category.id

    def test_utilization_and_status(self, authenticated_client, user, category):
        budget = Budget.objects.create(user=user, category=category, month=8, year=2026, amount=Decimal('100.00'))
        
        # Test "Within Budget"
        Expense.objects.create(user=user, amount=Decimal('50.00'), category=category, payment_method='Cash', date='2026-08-15', note='Lunch')
        response = authenticated_client.get(f'/api/budgets/{budget.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['actual_expense'] == 50.0
        assert response.data['utilization_percentage'] == 50.0
        assert response.data['status'] == 'Within Budget'
        
        # Test "Near Budget Limit"
        Expense.objects.create(user=user, amount=Decimal('35.00'), category=category, payment_method='Cash', date='2026-08-16', note='Dinner')
        response = authenticated_client.get(f'/api/budgets/{budget.id}/')
        assert response.data['actual_expense'] == 85.0
        assert response.data['utilization_percentage'] == 85.0
        assert response.data['status'] == 'Near Budget Limit'

        # Test "Budget Exceeded"
        Expense.objects.create(user=user, amount=Decimal('20.00'), category=category, payment_method='Cash', date='2026-08-17', note='Snack')
        response = authenticated_client.get(f'/api/budgets/{budget.id}/')
        assert response.data['actual_expense'] == 105.0
        assert response.data['utilization_percentage'] == 105.0
        assert response.data['status'] == 'Budget Exceeded'

    def test_update_budget(self, authenticated_client, user, category):
        budget = Budget.objects.create(user=user, category=category, month=8, year=2026, amount=Decimal('100.00'))
        response = authenticated_client.patch(f'/api/budgets/{budget.id}/', {'amount': '150.00'})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['amount'] == '150.00'

    def test_delete_budget(self, authenticated_client, user, category):
        budget = Budget.objects.create(user=user, category=category, month=8, year=2026, amount=Decimal('100.00'))
        response = authenticated_client.delete(f'/api/budgets/{budget.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Budget.objects.count() == 0
