"""Dict shapes returned by the repository layer. These mirror the ORM models
in models.py but keep services.py and views.py decoupled from Django's ORM."""

from datetime import datetime
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
