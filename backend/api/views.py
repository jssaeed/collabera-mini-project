"""Controller layer: translates HTTP <-> service calls. No business logic,
no data access."""

import json
from decimal import Decimal, InvalidOperation
from typing import Any

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .exceptions import AccountNotFound, InsufficientFunds, InvalidAmount, UserNotFound
from .services import AccountService, UserService


def user_list(request: HttpRequest) -> JsonResponse:
    users = UserService().list_users()
    return JsonResponse({'users': users})


def user_detail(request: HttpRequest, user_id: int) -> JsonResponse:
    user = UserService().get_user(user_id)
    if user is None:
        return JsonResponse({'error': 'not found'}, status=404)
    return JsonResponse(user)


def _parse_json_body(request: HttpRequest) -> dict[str, Any] | None:
    if not request.body:
        return {}
    try:
        return json.loads(request.body)
    except json.JSONDecodeError:
        return None


def _parse_amount(raw: Any) -> Decimal | None:
    try:
        return Decimal(str(raw))
    except (InvalidOperation, ValueError, TypeError):
        return None


@csrf_exempt
@require_http_methods(['POST'])
def account_create(request: HttpRequest, user_id: int) -> JsonResponse:
    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'error': 'invalid JSON body'}, status=400)

    initial_deposit = _parse_amount(body.get('initial_deposit', 0))
    if initial_deposit is None:
        return JsonResponse({'error': 'initial_deposit must be a number'}, status=400)

    try:
        account = AccountService().create_account(
            user_id,
            initial_deposit=initial_deposit,
            account_type=body.get('account_type', 'checking'),
        )
    except UserNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    except InvalidAmount as exc:
        return JsonResponse({'error': str(exc)}, status=400)

    return JsonResponse(account, status=201)


def account_detail(request: HttpRequest, account_id: int) -> JsonResponse:
    try:
        account = AccountService().get_account(account_id)
    except AccountNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    return JsonResponse(account)


@csrf_exempt
@require_http_methods(['POST'])
def account_deposit(request: HttpRequest, account_id: int) -> JsonResponse:
    body = _parse_json_body(request)
    if body is None or 'amount' not in body:
        return JsonResponse({'error': 'expected JSON body with an "amount" field'}, status=400)

    amount = _parse_amount(body['amount'])
    if amount is None:
        return JsonResponse({'error': 'amount must be a number'}, status=400)

    try:
        account = AccountService().deposit(account_id, amount)
    except AccountNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    except InvalidAmount as exc:
        return JsonResponse({'error': str(exc)}, status=400)

    return JsonResponse(account)


@csrf_exempt
@require_http_methods(['POST'])
def account_withdraw(request: HttpRequest, account_id: int) -> JsonResponse:
    body = _parse_json_body(request)
    if body is None or 'amount' not in body:
        return JsonResponse({'error': 'expected JSON body with an "amount" field'}, status=400)

    amount = _parse_amount(body['amount'])
    if amount is None:
        return JsonResponse({'error': 'amount must be a number'}, status=400)

    try:
        account = AccountService().withdraw(account_id, amount)
    except AccountNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    except (InvalidAmount, InsufficientFunds) as exc:
        return JsonResponse({'error': str(exc)}, status=400)

    return JsonResponse(account)


def account_transactions(request: HttpRequest, account_id: int) -> JsonResponse:
    try:
        transactions = AccountService().list_transactions(account_id)
    except AccountNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    return JsonResponse({'transactions': transactions})
