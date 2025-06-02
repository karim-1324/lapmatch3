from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LaptopViewSet, LoginView, SignupView, ProfileView, GoogleLoginView, GoogleCallbackView, FavoriteViewSet
from .model_views import LaptopFinderView
from .chatbot_views import ChatbotView
from django.urls import path
from . import views

router = DefaultRouter()
router.register(r'laptops', LaptopViewSet)
router.register(r'favorites', FavoriteViewSet, basename='favorites')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/profile/<int:pk>/', ProfileView.as_view(), name='profile'),  
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('auth/google/callback/', GoogleCallbackView.as_view(), name='google_callback'),
    path('chatbot/', ChatbotView.as_view(), name='chatbot'),
    path('laptop-finder/', LaptopFinderView.as_view(), name='laptop-finder'),
]