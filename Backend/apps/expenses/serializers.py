from rest_framework import serializers
from .models import Expense, DataSyncHistory
from apps.accounts.models import Account
from apps.users.utils import CurrencyConverter

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'amount', 'category', 'category_name', 'account', 'payment_method', 'date', 'note', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            data['amount'] = str(CurrencyConverter.from_base(instance.amount, request.user.currency))
        return data

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated and 'amount' in internal_value:
            internal_value['amount'] = CurrencyConverter.to_base(internal_value['amount'], request.user.currency)
        return internal_value

class DataSyncHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSyncHistory
        fields = ['id', 'action', 'details', 'timestamp']
        read_only_fields = ['id', 'timestamp']
