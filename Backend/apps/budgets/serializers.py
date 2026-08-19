from rest_framework import serializers
from .models import Budget
from apps.expenses.models import Expense
from django.db.models import Sum

class BudgetSerializer(serializers.ModelSerializer):
    actual_expense = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'category', 'category_name', 'month', 'year', 'amount', 'actual_expense', 'utilization_percentage', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'actual_expense', 'utilization_percentage', 'status', 'created_at', 'updated_at']

    def get_actual_expense(self, obj):
        qs = Expense.objects.filter(user=obj.user, date__month=obj.month, date__year=obj.year)
        if obj.category:
            qs = qs.filter(category=obj.category)
        
        total = qs.aggregate(Sum('amount'))['amount__sum']
        return total if total else 0.0

    def get_utilization_percentage(self, obj):
        actual = self.get_actual_expense(obj)
        if obj.amount > 0:
            return round((float(actual) / float(obj.amount)) * 100, 2)
        return 0.0

    def get_status(self, obj):
        percentage = self.get_utilization_percentage(obj)
        if percentage >= 100:
            return "Budget Exceeded"
        elif percentage >= 80:
            return "Near Budget Limit"
        else:
            return "Within Budget"

    def validate(self, data):
        if data['amount'] <= 0:
            raise serializers.ValidationError({"amount": "Amount must be greater than 0."})
        return data
