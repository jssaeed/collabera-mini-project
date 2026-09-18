# Collabera Bank — Simple Bank

A small banking training app: users sign up, open accounts, and
deposit/withdraw/view transactions; admins can view every user, account, and
transaction across the system.

## Tech stack

**Backend**
- [Django](https://www.djangoproject.com/) + [Django REST Framework](https://www.django-rest-framework.org/) — HTTP API, layered as views → services → repositories → models
- [`djangorestframework-simplejwt`](https://django-rest-framework-simplejwt.readthedocs.io/) — JWT authentication (access + refresh tokens, refresh-token rotation and blacklisting)
- [`django-cors-headers`](https://github.com/adamchainz/django-cors-headers) — CORS for the separately-hosted frontend
- [Gunicorn](https://gunicorn.org/) — WSGI server, run inside Lambda via the [AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter)

**Frontend**
- [React](https://react.dev/) + [Vite](https://vite.dev/) + TypeScript
- [Ant Design](https://ant.design/) — component library
- [React Router](https://reactrouter.com/) — client-side routing
- [Axios](https://axios-http.com/) — API client, with a request interceptor for Bearer token auth

**Data**
- [PostgreSQL](https://www.postgresql.org/), hosted on [Supabase](https://supabase.com/)

**Infrastructure (AWS, serverless)**
- **AWS Lambda** — runs the Django app (via the Lambda Web Adapter, unmodified WSGI)
- **API Gateway (HTTP API)** — routes all traffic to the Lambda through a single `ANY /{proxy+}` route, letting Django's own `urls.py` handle the real routing
- **S3 + CloudFront** — hosts the built frontend, served over HTTPS with an Origin Access Control policy (the bucket itself stays private)
- **[Terraform](https://www.terraform.io/)** — provisions the CloudFront distribution, S3 bucket policy, and the Lambda's dependency layer (see `infra/`)

## API reference

All routes are prefixed with `/api/`. Authenticated routes expect
`Authorization: Bearer <access token>`.

### Auth

| Method | Path                | Auth      | Description |
|--------|---------------------|-----------|--------------|
| POST   | `/auth/login/`      | none      | Exchange `username` (email) + `password` for an access/refresh token pair. Throttled to 10/min. |
| POST   | `/auth/refresh/`    | none      | Exchange a refresh token for a new access token. Refresh tokens rotate on use and the old one is blacklisted. |
| POST   | `/auth/logout/`     | none      | Blacklist a refresh token. |
| GET    | `/auth/me/`         | required  | Returns `{"kind": "admin"}` or `{"kind": "user", ...profile}` for the caller. |

### Users

| Method | Path                          | Auth              | Description |
|--------|-------------------------------|-------------------|--------------|
| POST   | `/users/`                     | none (signup)     | Create a new user login + banking profile. Body: `name`, `email`, `password`. New users start with **no accounts**. 409 if the email is already in use. |
| GET    | `/users/`                     | admin only        | List every user. |
| GET    | `/users/<user_id>/`           | self or admin     | Get one user's profile. |
| POST   | `/users/<user_id>/accounts/`  | self only         | Open a new account for that user. Body: `initial_deposit` (optional, default `0`), `account_type` (optional, default `"checking"`). |

### Accounts

| Method | Path                                   | Auth               | Description |
|--------|-----------------------------------------|--------------------|--------------|
| GET    | `/accounts/`                            | required           | List accounts — own accounts for a regular user, every account for an admin. |
| GET    | `/accounts/<account_id>/`               | owner or admin     | Get one account. |
| DELETE | `/accounts/<account_id>/`               | owner only         | Delete an account (admins have read-only access). |
| POST   | `/accounts/<account_id>/deposit/`       | owner only         | Deposit. Body: `amount`. |
| POST   | `/accounts/<account_id>/withdraw/`      | owner only         | Withdraw. Body: `amount`. 400 if it exceeds the balance. |
| GET    | `/accounts/<account_id>/transactions/`  | owner or admin     | List an account's transaction history. |

### Transactions

| Method | Path             | Auth        | Description |
|--------|------------------|-------------|--------------|
| GET    | `/transactions/` | admin only  | List every transaction across every account. |

## Testing

A ready-to-import Postman collection covering every endpoint above (including
authorization checks, e.g. confirming a non-admin user is rejected from
admin-only routes) lives in `postman/collabera-bank.postman_collection.json`,
with its companion environment file `postman/collabera-bank.postman_environment.json`.

## Infrastructure

Deployment is defined in `infra/` (Terraform) and `infra/scripts/` (build +
deploy helpers for the Lambda). See those directories for the actual
resource definitions; secrets (`SECRET_KEY`, `DATABASE_URL`) are read from
`backend/.env` at deploy time rather than being stored in Terraform state.
