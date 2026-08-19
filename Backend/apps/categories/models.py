from django.db import models
from django.conf import settings

class Category(models.Model):
    TYPE_CHOICES = (
        ('expense', 'Expense'),
        ('income', 'Income'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories', null=True, blank=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ['user', 'name', 'type']

    def __str__(self):
        return f"{self.name} ({self.type})"
