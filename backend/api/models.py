"""Defines the schema for the Django ORM models"""

from django.db import models
from django.conf import settings


class User(models.Model):
    auth_user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='banking_profile',
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'


class Account(models.Model):
    CHECKING = 'checking'
    SAVINGS = 'savings'
    ACCOUNT_TYPES = [(CHECKING, 'Checking'), (SAVINGS, 'Savings')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES, default=CHECKING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts'


class Transaction(models.Model):
    DEPOSIT = 'deposit'
    WITHDRAWAL = 'withdrawal'
    TXN_TYPES = [(DEPOSIT, 'Deposit'), (WITHDRAWAL, 'Withdrawal')]

    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    txn_type = models.CharField(max_length=20, choices=TXN_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transactions'
