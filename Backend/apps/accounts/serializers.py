from rest_framework import serializers
from .models import Account
from apps.users.utils import CurrencyConverter

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'user', 'name', 'type', 'balance', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            data['balance'] = str(CurrencyConverter.from_base(instance.balance, request.user.currency))
        return data

    def to_internal_value(self, data):
        internal_value = super().to_internal_value(data)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated and 'balance' in internal_value:
            internal_value['balance'] = CurrencyConverter.to_base(internal_value['balance'], request.user.currency)
        return internal_value
