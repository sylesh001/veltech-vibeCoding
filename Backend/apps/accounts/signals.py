from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from apps.expenses.models import Expense
from apps.incomes.models import Income

@receiver(pre_save, sender=Expense)
def expense_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Expense.objects.get(pk=instance.pk)
            instance._old_amount = old_instance.amount
            instance._old_account = old_instance.account
        except Expense.DoesNotExist:
            pass

@receiver(post_save, sender=Expense)
def expense_post_save(sender, instance, created, **kwargs):
    if created:
        if instance.account:
            instance.account.balance -= instance.amount
            instance.account.save(update_fields=['balance'])
    else:
        old_amount = getattr(instance, '_old_amount', 0)
        old_account = getattr(instance, '_old_account', None)
        
        if old_account == instance.account:
            if instance.account:
                instance.account.balance += old_amount # revert old
                instance.account.balance -= instance.amount # apply new
                instance.account.save(update_fields=['balance'])
        else:
            if old_account:
                old_account.balance += old_amount
                old_account.save(update_fields=['balance'])
            if instance.account:
                instance.account.balance -= instance.amount
                instance.account.save(update_fields=['balance'])

@receiver(post_delete, sender=Expense)
def expense_post_delete(sender, instance, **kwargs):
    if instance.account:
        instance.account.balance += instance.amount
        instance.account.save(update_fields=['balance'])

@receiver(pre_save, sender=Income)
def income_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Income.objects.get(pk=instance.pk)
            instance._old_amount = old_instance.amount
            instance._old_account = old_instance.account
        except Income.DoesNotExist:
            pass

@receiver(post_save, sender=Income)
def income_post_save(sender, instance, created, **kwargs):
    if created:
        if instance.account:
            instance.account.balance += instance.amount
            instance.account.save(update_fields=['balance'])
    else:
        old_amount = getattr(instance, '_old_amount', 0)
        old_account = getattr(instance, '_old_account', None)
        
        if old_account == instance.account:
            if instance.account:
                instance.account.balance -= old_amount # revert old
                instance.account.balance += instance.amount # apply new
                instance.account.save(update_fields=['balance'])
        else:
            if old_account:
                old_account.balance -= old_amount
                old_account.save(update_fields=['balance'])
            if instance.account:
                instance.account.balance += instance.amount
                instance.account.save(update_fields=['balance'])

@receiver(post_delete, sender=Income)
def income_post_delete(sender, instance, **kwargs):
    if instance.account:
        instance.account.balance -= instance.amount
        instance.account.save(update_fields=['balance'])
