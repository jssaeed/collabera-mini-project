"""In-memory dummy data. This is the current stand-in for the database —
only the repository layer is allowed to import from this module."""

CUSTOMERS = [
    {'id': 1, 'name': 'Alice Johnson', 'email': 'alice@example.com'},
    {'id': 2, 'name': 'Bob Smith', 'email': 'bob@example.com'},
    {'id': 3, 'name': 'Carla Diaz', 'email': 'carla@example.com'},
]

ACCOUNTS = [
    {'id': 1, 'customer_id': 1, 'balance': 100.0},
]
