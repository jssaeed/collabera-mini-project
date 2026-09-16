"""Repository layer: the only layer allowed to talk to the data source.

Queries go through the Django ORM, but methods return plain dicts (see
types.py) so services.py and views.py stay unchanged regardless of how the
data is stored.
"""

from decimal import Decimal

from .models import Account, Transaction, User
from .types import AccountDict, TransactionDict, UserDict


def _user_to_dict(user: User) -> UserDict:
    return {
        'user_id': user.id,
        'name': user.name,
        'email': user.email,
        'created_at': user.created_at,
    }


def _account_to_dict(account: Account) -> AccountDict:
    return {
        'account_id': account.id,
        'user_id': account.user_id,
        'balance': account.balance,
        'account_type': account.account_type,
        'created_at': account.created_at,
    }


def _transaction_to_dict(txn: Transaction) -> TransactionDict:
    return {
        'txn_id': txn.id,
        'account_id': txn.account_id,
        'txn_type': txn.txn_type,
        'amount': txn.amount,
        'created_at': txn.created_at,
    }


class UserRepository:
    def get_all(self) -> list[UserDict]:
        return [_user_to_dict(u) for u in User.objects.all()]

    def get_by_id(self, user_id: int) -> UserDict | None:
        user = User.objects.filter(pk=user_id).first()
        return _user_to_dict(user) if user else None


class AccountRepository:
    def get_all(self) -> list[AccountDict]:
        return [_account_to_dict(a) for a in Account.objects.all()]

    def get_by_id(self, account_id: int) -> AccountDict | None:
        account = Account.objects.filter(pk=account_id).first()
        return _account_to_dict(account) if account else None

    def create(self, user_id: int, balance: Decimal, account_type: str) -> AccountDict:
        account = Account.objects.create(user_id=user_id, balance=balance, account_type=account_type)
        return _account_to_dict(account)

    def update_balance(self, account_id: int, new_balance: Decimal) -> AccountDict:
        account = Account.objects.get(pk=account_id)
        account.balance = new_balance
        account.save(update_fields=['balance'])
        return _account_to_dict(account)


class TransactionRepository:
    def get_all(self) -> list[TransactionDict]:
        return [_transaction_to_dict(t) for t in Transaction.objects.all()]

    def get_by_account(self, account_id: int) -> list[TransactionDict]:
        txns = Transaction.objects.filter(account_id=account_id)
        return [_transaction_to_dict(t) for t in txns]

    def create(self, account_id: int, txn_type: str, amount: Decimal) -> TransactionDict:
        txn = Transaction.objects.create(account_id=account_id, txn_type=txn_type, amount=amount)
        return _transaction_to_dict(txn)
