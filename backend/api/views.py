"""Controller layer: translates HTTP <-> service calls. No business logic,
no data access."""

import json
from typing import Any

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .exceptions import AccountNotFound, CustomerNotFound, InsufficientFunds, InvalidAmount
from .services import AccountService, CustomerService


def customer_list(request: HttpRequest) -> JsonResponse:
    customers = CustomerService().list_customers()
    return JsonResponse({'customers': customers})


def customer_detail(request: HttpRequest, customer_id: int) -> JsonResponse:
    customer = CustomerService().get_customer(customer_id)
    if customer is None:
        return JsonResponse({'error': 'not found'}, status=404)
    return JsonResponse(customer)


def _parse_json_body(request: HttpRequest) -> dict[str, Any] | None:
    if not request.body:
        return {}
    try:
        return json.loads(request.body)
    except json.JSONDecodeError:
        return None


@csrf_exempt
@require_http_methods(['POST'])
def account_create(request: HttpRequest, customer_id: int) -> JsonResponse:
    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'error': 'invalid JSON body'}, status=400)

    try:
        account = AccountService().create_account(
            customer_id, initial_deposit=body.get('initial_deposit', 0)
        )
    except CustomerNotFound as exc:
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

    try:
        account = AccountService().deposit(account_id, body['amount'])
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

    try:
        account = AccountService().withdraw(account_id, body['amount'])
    except AccountNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    except (InvalidAmount, InsufficientFunds) as exc:
        return JsonResponse({'error': str(exc)}, status=400)

    return JsonResponse(account)
