"""Service layer: business logic and orchestration. No HTTP, no data access —
only talks to repositories."""

from .exceptions import AccountNotFound, CustomerNotFound, InsufficientFunds, InvalidAmount
from .repositories import AccountRepository, CustomerRepository


class CustomerService:
    def __init__(self, repository=None):
        self.repository = repository or CustomerRepository()

    def list_customers(self):
        return self.repository.get_all()

    def get_customer(self, customer_id):
        return self.repository.get_by_id(customer_id)


class AccountService:
    def __init__(self, account_repository=None, customer_repository=None):
        self.accounts = account_repository or AccountRepository()
        self.customers = customer_repository or CustomerRepository()

    def create_account(self, customer_id, initial_deposit=0):
        if self.customers.get_by_id(customer_id) is None:
            raise CustomerNotFound(f'customer {customer_id} does not exist')
        if initial_deposit < 0:
            raise InvalidAmount('initial deposit cannot be negative')
        return self.accounts.create(customer_id, initial_deposit)

    def get_account(self, account_id):
        account = self.accounts.get_by_id(account_id)
        if account is None:
            raise AccountNotFound(f'account {account_id} does not exist')
        return account

    def deposit(self, account_id, amount):
        if amount <= 0:
            raise InvalidAmount('deposit amount must be positive')
        account = self.get_account(account_id)
        return self.accounts.update_balance(account_id, account['balance'] + amount)

    def withdraw(self, account_id, amount):
        if amount <= 0:
            raise InvalidAmount('withdrawal amount must be positive')
        account = self.get_account(account_id)
        if account['balance'] < amount:
            raise InsufficientFunds('balance is lower than the withdrawal amount')
        return self.accounts.update_balance(account_id, account['balance'] - amount)
