from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView  # Add this import

urlpatterns = [
    path('admin/', admin.site.urls),
    path('server/api/', include('api.urls')),
    path('accounts/', include('allauth.urls')),
    
    path('', RedirectView.as_view(url='server/api/')),  # Redirect root to your API
]