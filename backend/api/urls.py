from django.urls import path

from . import views

urlpatterns = [
    path('customers/', views.customer_list, name='customer-list'),
    path('customers/<int:customer_id>/', views.customer_detail, name='customer-detail'),
    path('customers/<int:customer_id>/accounts/', views.account_create, name='account-create'),
    path('accounts/<int:account_id>/', views.account_detail, name='account-detail'),
    path('accounts/<int:account_id>/deposit/', views.account_deposit, name='account-deposit'),
    path('accounts/<int:account_id>/withdraw/', views.account_withdraw, name='account-withdraw'),
]
