"""In-memory dummy data mirroring the eventual users/accounts/transactions
schema. Only the repository layer is allowed to import from this module."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import TypedDict


class UserDict(TypedDict):
    user_id: int
    name: str
    email: str
    created_at: datetime


class AccountDict(TypedDict):
    account_id: int
    user_id: int
    balance: Decimal
    account_type: str
    created_at: datetime


class TransactionDict(TypedDict):
    txn_id: int
    account_id: int
    txn_type: str
    amount: Decimal
    created_at: datetime


_SEEDED_AT = datetime.now(timezone.utc)

USERS: list[UserDict] = [
    {'user_id': 1, 'name': 'Alice Johnson', 'email': 'alice@example.com', 'created_at': _SEEDED_AT},
    {'user_id': 2, 'name': 'Bob Smith', 'email': 'bob@example.com', 'created_at': _SEEDED_AT},
    {'user_id': 3, 'name': 'Carla Diaz', 'email': 'carla@example.com', 'created_at': _SEEDED_AT},
]

ACCOUNTS: list[AccountDict] = [
    {
        'account_id': 1,
        'user_id': 1,
        'balance': Decimal('100.00'),
        'account_type': 'checking',
        'created_at': _SEEDED_AT,
    },
    {
        'account_id': 2,
        'user_id': 1,
        'balance': Decimal('5000.00'),
        'account_type': 'savings',
        'created_at': _SEEDED_AT,
    },
]

TRANSACTIONS: list[TransactionDict] = []
