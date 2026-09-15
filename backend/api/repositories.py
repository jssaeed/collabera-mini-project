"""Repository layer: the only layer allowed to talk to the data source.

Right now that source is the in-memory list in data.py. When a real database
is introduced, only this file changes (e.g. swap to Customer.objects.all()) —
services and controllers stay untouched.
"""

from .data import ACCOUNTS, CUSTOMERS, AccountDict, CustomerDict


class CustomerRepository:
    def get_all(self) -> list[CustomerDict]:
        return list(CUSTOMERS)

    def get_by_id(self, customer_id: int) -> CustomerDict | None:
        return next((c for c in CUSTOMERS if c['id'] == customer_id), None)


class AccountRepository:
    def get_by_id(self, account_id: int) -> AccountDict | None:
        return next((a for a in ACCOUNTS if a['id'] == account_id), None)

    def create(self, customer_id: int, balance: float = 0) -> AccountDict:
        new_id = max((a['id'] for a in ACCOUNTS), default=0) + 1
        account: AccountDict = {'id': new_id, 'customer_id': customer_id, 'balance': balance}
        ACCOUNTS.append(account)
        return account

    def update_balance(self, account_id: int, new_balance: float) -> AccountDict:
        account = self.get_by_id(account_id)
        assert account is not None
        account['balance'] = new_balance
        return account
