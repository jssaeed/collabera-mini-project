"""Repository layer: the only layer allowed to talk to the data source.

Right now that source is the in-memory lists in data.py. When a real database
is introduced, only this file changes (e.g. swap to User.objects.all()) —
services and controllers stay untouched.
"""

from datetime import datetime, timezone
from decimal import Decimal

from .data import ACCOUNTS, TRANSACTIONS, USERS, AccountDict, TransactionDict, UserDict


class UserRepository:
    def get_all(self) -> list[UserDict]:
        return list(USERS)

    def get_by_id(self, user_id: int) -> UserDict | None:
        return next((u for u in USERS if u['user_id'] == user_id), None)


class AccountRepository:
    def get_by_id(self, account_id: int) -> AccountDict | None:
        return next((a for a in ACCOUNTS if a['account_id'] == account_id), None)

    def create(self, user_id: int, balance: Decimal, account_type: str) -> AccountDict:
        new_id = max((a['account_id'] for a in ACCOUNTS), default=0) + 1
        account: AccountDict = {
            'account_id': new_id,
            'user_id': user_id,
            'balance': balance,
            'account_type': account_type,
            'created_at': datetime.now(timezone.utc),
        }
        ACCOUNTS.append(account)
        return account

    def update_balance(self, account_id: int, new_balance: Decimal) -> AccountDict:
        account = self.get_by_id(account_id)
        assert account is not None
        account['balance'] = new_balance
        return account


class TransactionRepository:
    def get_by_account(self, account_id: int) -> list[TransactionDict]:
        return [t for t in TRANSACTIONS if t['account_id'] == account_id]

    def create(self, account_id: int, txn_type: str, amount: Decimal) -> TransactionDict:
        new_id = max((t['txn_id'] for t in TRANSACTIONS), default=0) + 1    # autoincrement
        txn: TransactionDict = {
            'txn_id': new_id,
            'account_id': account_id,
            'txn_type': txn_type,
            'amount': amount,
            'created_at': datetime.now(timezone.utc),
        }
        TRANSACTIONS.append(txn)
        return txn
