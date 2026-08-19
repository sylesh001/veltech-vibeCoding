from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='budgets')
    month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    year = models.IntegerField()
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')
        ordering = ['-year', '-month']

    def __str__(self):
        cat = self.category.name if self.category else "Overall"
        return f"{self.user.email} - {cat} - {self.month}/{self.year} - {self.amount}"
