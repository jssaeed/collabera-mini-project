# Collabera Mini Project — Simple Bank

## Backend setup

```bash
cd backend
conda env create -f environment.yml   # or: pip install -r requirements.txt
```

### Database

The API is backed by Postgres.

1. Create a database named `collabera_mini_project` (any owner works — the
   project was built against a local Postgres instance managed with
   pgAdmin, owner `postgres`).
2. Copy `backend/.env.local` to `.env` if you don't already have one, and set `DATABASE_URL`
   to point at the Postgres DB
3. Apply migrations:
   ```bash
   python manage.py migrate
   ```
4. (Optional) Load sample users/accounts to try the API out immediately:
   ```bash
   python manage.py loaddata seed_data
   ```
   This creates 3 users (Alice, Bob, Carla) and 2 accounts (`account_id` 1
   and 2, both belonging to Alice) with a starting balance. Skip this step to
   start from an empty database.

### Run

```bash
python manage.py runserver 0.0.0.0:8000
```
