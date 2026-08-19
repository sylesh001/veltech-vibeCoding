from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal

class Expense(models.Model):
    PAYMENT_METHODS = (
        ('Cash', 'Cash'),
        ('Card', 'Card'),
        ('UPI', 'UPI'),
        ('Bank', 'Bank'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    account = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    category = models.ForeignKey('categories.Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    date = models.DateField()
    note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.category} - {self.amount}"

class DataSyncHistory(models.Model):
    ACTION_CHOICES = (
        ('import', 'Import'),
        ('export', 'Export'),
        ('reset', 'Reset'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sync_history')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    details = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email} - {self.action} at {self.timestamp}"
