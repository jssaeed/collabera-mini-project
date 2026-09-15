"""Root URLconf: everything lives under /api/, routed to api/urls.py."""
from django.urls import include, path

urlpatterns = [
    path('api/', include('api.urls')),
]
