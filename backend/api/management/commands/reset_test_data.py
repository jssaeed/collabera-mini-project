from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import Account, Transaction, User

AuthUser = get_user_model()

# Edit this list to match your real test data (name, email, starting balance).
TEST_PROFILES = [
    {"name": "Alice Johnson", "email": "alice@example.com", "balance": Decimal("500.00")},
    {"name": "Bob Smith", "email": "bob@example.com", "balance": Decimal("1200.00")},
    {"name": "Carla Diaz", "email": "carla@example.com", "balance": Decimal("100.00")},
]


class Command(BaseCommand):
    help = "Wipes existing users/accounts/transactions and recreates test data with auth credentials."

    @transaction.atomic
    def handle(self, *args, **options):
        Transaction.objects.all().delete()
        Account.objects.all().delete()
        User.objects.all().delete()
        # Only remove non-superuser auth accounts tied to this reset, to avoid
        # deleting unrelated Django admin accounts you may have created manually.
        AuthUser.objects.filter(username__in=[p["email"] for p in TEST_PROFILES]).delete()
        AuthUser.objects.filter(username="admin@example.com").delete()

        # Username matches the email since the frontend logs in with email,
        # sent as the "username" field.
        admin = AuthUser.objects.create_user(username="admin@example.com", password="admin")
        admin.is_staff = True
        admin.save(update_fields=["is_staff"])
        self.stdout.write(
            self.style.SUCCESS("Created admin (username=admin@example.com, password=admin).")
        )

        for profile in TEST_PROFILES:
            local_part = profile["email"].split("@", 1)[0]
            auth_user = AuthUser.objects.create_user(
                username=profile["email"],
                password=local_part,
            )
            banking_user = User.objects.create(
                auth_user=auth_user,
                name=profile["name"],
                email=profile["email"],
            )
            if profile["balance"] > 0:
                account = Account.objects.create(
                    user=banking_user,
                    balance=profile["balance"],
                    account_type=Account.CHECKING,
                )
                Transaction.objects.create(
                    account=account,
                    txn_type=Transaction.DEPOSIT,
                    amount=profile["balance"],
                )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created {profile['email']} (password={local_part})"
                )
            )
