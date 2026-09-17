from django.urls import URLPattern, path

from . import views
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView

urlpatterns: list[URLPattern] = [
    path('users/', views.user_list, name='user-list'),                                              #
    path('users/<int:user_id>/', views.user_detail, name='user-detail'),
    path('users/<int:user_id>/accounts/', views.account_create, name='account-create'),             #
    path('accounts/', views.account_list, name='account-list'),
    path('accounts/<int:account_id>/', views.account_detail, name='account-detail'),                #
    path('accounts/<int:account_id>/deposit/', views.account_deposit, name='account-deposit'),      #
    path('accounts/<int:account_id>/withdraw/', views.account_withdraw, name='account-withdraw'),   #
    path(                                                                                           #
        'accounts/<int:account_id>/transactions/',
        views.account_transactions,
        name='account-transactions',
    ),
    path('transactions/', views.transaction_list, name='transaction-list'),
    path('auth/login/', views.LoginView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/logout/', TokenBlacklistView.as_view(), name='auth-logout'),
    path('auth/me/', views.auth_me, name='auth-me'),
]
