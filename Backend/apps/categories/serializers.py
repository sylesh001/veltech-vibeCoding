from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'is_default']
        read_only_fields = ['is_default']

    def validate(self, data):
        # Ensure the user doesn't create a duplicate category
        user = self.context['request'].user
        name = data.get('name', getattr(self.instance, 'name', None))
        type = data.get('type', getattr(self.instance, 'type', None))
        
        if Category.objects.filter(user=user, name=name, type=type).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError("A category with this name and type already exists.")
        
        return data

    def create(self, validated_data):
        # Always set user to current user and is_default to False for API-created categories
        validated_data['user'] = self.context['request'].user
        validated_data['is_default'] = False
        return super().create(validated_data)
