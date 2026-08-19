from django.db import models
from django.conf import settings

class Account(models.Model):
    ACCOUNT_TYPES = [
        ('cash', 'Cash'),
        ('bank', 'Bank'),
        ('card', 'Card'),
        ('wallet', 'Wallet')
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='accounts')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
