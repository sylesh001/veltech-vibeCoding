from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Category
from .serializers import CategorySerializer
import django_filters
from django_filters.rest_framework import DjangoFilterBackend

class CategoryFilter(django_filters.FilterSet):
    class Meta:
        model = Category
        fields = ['type']

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = CategoryFilter
    
    # Disable pagination for categories so frontend can easily load all for dropdowns
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        return Category.objects.filter(
            Q(user=user) | Q(is_default=True)
        )

    def perform_destroy(self, instance):
        if instance.is_default:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot delete a default category.")
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own categories.")
        instance.delete()

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.is_default:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot modify a default category.")
        if instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only modify your own categories.")
        serializer.save()
