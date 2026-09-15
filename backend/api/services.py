"""Service layer: business logic and orchestration. No HTTP, no data access —
only talks to repositories."""

from decimal import Decimal

from .data import AccountDict, TransactionDict, UserDict
from .exceptions import AccountNotFound, InsufficientFunds, InvalidAmount, UserNotFound
from .repositories import AccountRepository, TransactionRepository, UserRepository


class UserService:
    def __init__(self, repository: UserRepository | None = None) -> None:
        self.repository = repository or UserRepository()

    def list_users(self) -> list[UserDict]:
        return self.repository.get_all()

    def get_user(self, user_id: int) -> UserDict | None:
        return self.repository.get_by_id(user_id)


class AccountService:
    def __init__(
        self,
        account_repository: AccountRepository | None = None,
        user_repository: UserRepository | None = None,
        transaction_repository: TransactionRepository | None = None,
    ) -> None:
        self.accounts = account_repository or AccountRepository()
        self.users = user_repository or UserRepository()
        self.transactions = transaction_repository or TransactionRepository()

    def create_account(
        self,
        user_id: int,
        initial_deposit: Decimal = Decimal('0'),
        account_type: str = 'checking',
    ) -> AccountDict:
        if self.users.get_by_id(user_id) is None:
            raise UserNotFound(f'user {user_id} does not exist')
        if initial_deposit < 0:
            raise InvalidAmount('initial deposit cannot be negative')

        account = self.accounts.create(user_id, initial_deposit, account_type)
        if initial_deposit > 0:
            self.transactions.create(account['account_id'], 'deposit', initial_deposit)
        return account

    def get_account(self, account_id: int) -> AccountDict:
        account = self.accounts.get_by_id(account_id)
        if account is None:
            raise AccountNotFound(f'account {account_id} does not exist')
        return account

    def deposit(self, account_id: int, amount: Decimal) -> AccountDict:
        if amount <= 0:
            raise InvalidAmount('deposit amount must be positive')
        account = self.get_account(account_id)
        updated = self.accounts.update_balance(account_id, account['balance'] + amount)
        self.transactions.create(account_id, 'deposit', amount)
        return updated

    def withdraw(self, account_id: int, amount: Decimal) -> AccountDict:
        if amount <= 0:
            raise InvalidAmount('withdrawal amount must be positive')
        account = self.get_account(account_id)
        if account['balance'] < amount:
            raise InsufficientFunds('balance is lower than the withdrawal amount')
        updated = self.accounts.update_balance(account_id, account['balance'] - amount)
        self.transactions.create(account_id, 'withdrawal', amount)
        return updated

    def list_transactions(self, account_id: int) -> list[TransactionDict]:
        self.get_account(account_id)
        return self.transactions.get_by_account(account_id)
