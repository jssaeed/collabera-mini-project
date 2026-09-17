"""Controller layer: translates HTTP <-> service calls. No business logic,
no data access."""

import json
from decimal import Decimal, InvalidOperation
from typing import Any

from django.http import HttpRequest, HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request
from rest_framework_simplejwt.views import TokenObtainPairView

from .exceptions import AccountNotFound, InsufficientFunds, InvalidAmount, UserNotFound
from .services import AccountService, UserService
from .types import AccountDict, UserDict


class LoginView(TokenObtainPairView):
    throttle_scope = 'login'


def _profile(request: Request) -> UserDict:
    profile = UserService().get_user_for_auth(request.user.pk)
    if profile is None:
        raise PermissionDenied('No banking profile is linked to this login.')
    return profile


def _authorize_account(
    request: Request,
    account_id: int,
    *,
    write: bool = False,
) -> AccountDict:
    if request.user.is_staff:
        if write:
            raise PermissionDenied('Administrator access is read-only.')
        return AccountService().get_account(account_id)

    profile = _profile(request)
    account = AccountService().get_account(account_id)
    if account['user_id'] != profile['user_id']:
        raise NotFound('Account not found.')
    return account


@api_view(['GET'])
def auth_me(request: Request) -> JsonResponse:
    if request.user.is_staff:
        return JsonResponse({'kind': 'admin'})
    return JsonResponse({'kind': 'user', **_profile(request)})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_list(request: Request) -> JsonResponse:
    users = UserService().list_users()
    return JsonResponse({'users': users})


@api_view(['GET'])
def user_detail(request: Request, user_id: int) -> JsonResponse:
    if not request.user.is_staff and _profile(request)['user_id'] != user_id:
        raise NotFound('User not found.')
    user = UserService().get_user(user_id)
    if user is None:
        return JsonResponse({'error': 'not found'}, status=404)
    return JsonResponse(user)


def _parse_json_body(request: HttpRequest) -> dict[str, Any] | None:
    if not request.body:
        return {}
    try:
        body = json.loads(request.body)
        return body if isinstance(body, dict) else None
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def _parse_amount(raw: Any) -> Decimal | None:
    try:
        amount = Decimal(str(raw))
        return amount if amount.is_finite() else None
    except (InvalidOperation, ValueError, TypeError):
        return None


@api_view(['POST'])
def account_create(request: Request, user_id: int) -> JsonResponse:
    if request.user.is_staff:
        raise PermissionDenied('Administrator access is read-only.')

    profile = _profile(request)
    if profile['user_id'] != user_id:
        raise NotFound('User not found.')

    body = _parse_json_body(request)
    if body is None:
        return JsonResponse({'error': 'invalid JSON body'}, status=400)

    initial_deposit = _parse_amount(body.get('initial_deposit', 0))
    if initial_deposit is None:
        return JsonResponse({'error': 'initial_deposit must be a number'}, status=400)

    try:
        account = AccountService().create_account(
            profile['user_id'],
            initial_deposit=initial_deposit,
            account_type=body.get('account_type', 'checking'),
        )
    except UserNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    except InvalidAmount as exc:
        return JsonResponse({'error': str(exc)}, status=400)

    return JsonResponse(account, status=201)


@api_view(['GET'])
def account_list(request: Request) -> JsonResponse:
    service = AccountService()
    accounts = (
        service.list_accounts()
        if request.user.is_staff
        else service.list_accounts_for_user(_profile(request)['user_id'])
    )
    return JsonResponse({'accounts': accounts})


@api_view(['GET', 'DELETE'])
def account_detail(request: Request, account_id: int) -> HttpResponse:
    service = AccountService()
    try:
        account = _authorize_account(
            request, account_id, write=request.method == 'DELETE',
        )
        if request.method == 'DELETE':
            service.delete_account(account_id)
            return HttpResponse(status=204)
    except AccountNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    return JsonResponse(account)


@api_view(['POST'])
def account_deposit(request: Request, account_id: int) -> JsonResponse:
    body = _parse_json_body(request)
    if body is None or 'amount' not in body:
        return JsonResponse({'error': 'expected JSON body with an "amount" field'}, status=400)

    amount = _parse_amount(body['amount'])
    if amount is None:
        return JsonResponse({'error': 'amount must be a number'}, status=400)

    try:
        _authorize_account(request, account_id, write=True)
        account = AccountService().deposit(account_id, amount)
    except AccountNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    except InvalidAmount as exc:
        return JsonResponse({'error': str(exc)}, status=400)

    return JsonResponse(account)


@api_view(['POST'])
def account_withdraw(request: Request, account_id: int) -> JsonResponse:
    body = _parse_json_body(request)
    if body is None or 'amount' not in body:
        return JsonResponse({'error': 'expected JSON body with an "amount" field'}, status=400)

    amount = _parse_amount(body['amount'])
    if amount is None:
        return JsonResponse({'error': 'amount must be a number'}, status=400)

    try:
        _authorize_account(request, account_id, write=True)
        account = AccountService().withdraw(account_id, amount)
    except AccountNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    except (InvalidAmount, InsufficientFunds) as exc:
        return JsonResponse({'error': str(exc)}, status=400)

    return JsonResponse(account)


@api_view(['GET'])
def account_transactions(request: Request, account_id: int) -> JsonResponse:
    try:
        _authorize_account(request, account_id)
        transactions = AccountService().list_transactions(account_id)
    except AccountNotFound as exc:
        return JsonResponse({'error': str(exc)}, status=404)
    return JsonResponse({'transactions': transactions})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def transaction_list(request: Request) -> JsonResponse:
    transactions = AccountService().list_all_transactions()
    return JsonResponse({'transactions': transactions})
