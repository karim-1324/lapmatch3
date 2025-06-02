from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Laptop, Favorite
from .serializers import LaptopSerializer, FavoriteSerializer
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, NumberFilter
from rest_framework import filters
from rest_framework.views import APIView
import numpy as np
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import check_password
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse
from django.http import JsonResponse
import random
import math
from .model_views import LaptopFinderView

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class LaptopFilter(FilterSet):
    brand = CharFilter(lookup_expr='icontains')
    processor = CharFilter(lookup_expr='icontains')
    min_price = NumberFilter(field_name='price', lookup_expr='gte')
    max_price = NumberFilter(field_name='price', lookup_expr='lte')
    
    class Meta:
        model = Laptop
        fields = ['brand', 'processor', 'condition', 'category']

class LaptopViewSet(viewsets.ModelViewSet):
    queryset = Laptop.objects.all()
    serializer_class = LaptopSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'brand'] 
    filterset_class = LaptopFilter
    
    def get_queryset(self):
        queryset = Laptop.objects.all()
        

        ordering = self.request.query_params.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)
        

        brand = self.request.query_params.get('brand')
        if brand:
            brands = brand.split(',')
            queryset = queryset.filter(brand__in=brands)
            

        category = self.request.query_params.get('category')
        if category:
            categories = category.split(',')
            queryset = queryset.filter(category__in=categories)
            

        storage = self.request.query_params.get('storage')
        if storage:
            storage_values = storage.split(',')
            q_objects = Q()
            
            for value in storage_values:
                if value == "2048":
                    q_objects |= Q(storage__startswith="2048")
                    q_objects |= Q(storage__startswith="2000")
                    q_objects |= Q(storage__startswith="2TB")
                elif value == "4096":  
                    q_objects |= Q(storage__startswith="4096")
                    q_objects |= Q(storage__startswith="4000")
                    q_objects |= Q(storage__startswith="4TB")
                elif value == "8192": 
                    q_objects |= Q(storage__startswith="8192")
                    q_objects |= Q(storage__startswith="8000")
                    q_objects |= Q(storage__startswith="8TB")
                else:
                    q_objects |= Q(storage__startswith=f"{value}")
                    q_objects |= Q(storage__startswith=f"{value}.")

                    q_objects |= Q(storage__contains=f"{value}GB")
                    q_objects |= Q(storage__contains=f"{value} GB")
                    
                    if value == "1024":
                        q_objects |= Q(storage__contains="1TB")
                        q_objects |= Q(storage__contains="1 TB")
            
            queryset = queryset.filter(q_objects)
            
        screen_size = self.request.query_params.get('screen_size')
        if screen_size:
            screen_size_values = screen_size.split(',')
            q_objects = Q()
            for value in screen_size_values:
                q_objects |= Q(display_size__startswith=value)
            queryset = queryset.filter(q_objects)
            
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            try:

                min_price_float = float(min_price)
                queryset = queryset.filter(price__gte=min_price_float)
            except (ValueError, TypeError):

                print(f"Invalid min_price value: {min_price}")
                
        if max_price:
            try:
                max_price_float = float(max_price)
                queryset = queryset.filter(price__lte=max_price_float)
            except (ValueError, TypeError):

                print(f"Invalid max_price value: {max_price}")
            

        condition = self.request.query_params.get('condition')
        if condition:
            queryset = queryset.filter(condition=condition)
            

        performance = self.request.query_params.get('performance')
        if performance:
            performance_levels = performance.split(',')
            q_objects = Q()
            
            for level in performance_levels:
                if level == 'high':
                    q_objects |= (
                        Q(processor__icontains='i7') | 
                        Q(processor__icontains='i9') | 
                        Q(processor__icontains='ryzen 7') | 
                        Q(processor__icontains='ryzen 9') |
                        Q(processor__icontains='m1') |
                        Q(processor__icontains='m2') |
                        Q(processor__icontains='m3')
                    ) & (
                        Q(graphics__icontains='rtx') |
                        Q(graphics__icontains='gtx') |
                        Q(graphics__icontains='m1') |
                        Q(graphics__icontains='m2') |
                        Q(graphics__icontains='m3')
                    )
                elif level == 'moderate':
                    q_objects |= (
                        Q(processor__icontains='i5') | 
                        Q(processor__icontains='ryzen 5')
                    )
                elif level == 'basic':
                    q_objects |= (
                        Q(processor__icontains='i3') | 
                        Q(processor__icontains='celeron') | 
                        Q(processor__icontains='pentium') | 
                        Q(processor__icontains='athlon')
                    )
            
            queryset = queryset.filter(q_objects)
            
        return queryset

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = None
        if username:
            user = authenticate(username=username, password=password)
        
        if user is None and email:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
                
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                },
                "token": token.key  # Return the actual token
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid Email or Passoword"}, status=status.HTTP_401_UNAUTHORIZED)

class SignupView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        backend = request.data.get('backend', 'django.contrib.auth.backends.ModelBackend')
        
        if not username or not email or not password:
            return Response({"error": "Please provide username, email and password"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.backend = backend
            login(request, user)
            
            token, _ = Token.objects.get_or_create(user=user)
            
            return Response({
                "message": "Signup successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                },
                "token": token.key
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    def get(self, request, pk=None):
        if pk != request.user.id and not request.user.is_staff:
            return Response({"error": "You don't have permission to view this profile"}, 
                        status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(pk=pk)
            return Response({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk=None):
        
        try:
            user = User.objects.get(pk=pk)
            
            username = request.data.get('username')
            if username and username != user.username:
                if User.objects.filter(username=username).exclude(pk=user.pk).exists():
                    return Response({"error": "Username already exists"}, 
                                status=status.HTTP_400_BAD_REQUEST)
                user.username = username
            
            email = request.data.get('email')
            if email and email != user.email:
                if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                    return Response({"error": "Email already exists"}, 
                                status=status.HTTP_400_BAD_REQUEST)
                user.email = email
            
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')
            
            if current_password and new_password:
                if not check_password(current_password, user.password):
                    return Response({"error": "Current password is incorrect"}, 
                                status=status.HTTP_400_BAD_REQUEST)
                
                user.set_password(new_password)
            
            user.save()
            
            return Response({
                "message": "Profile updated successfully",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginView(APIView):
    def get(self, request):
        redirect_uri = "http://localhost:8000/server/api/auth/google/callback/"
        
        print(f"Using redirect URI: {redirect_uri}")
        
        auth_url = (f'https://accounts.google.com/o/oauth2/auth?'
                f'client_id={settings.SOCIALACCOUNT_PROVIDERS["google"]["APP"]["client_id"]}'
                f'&redirect_uri={redirect_uri}'
                f'&scope=profile email'
                f'&response_type=code'
                f'&prompt=select_account')
        
        return redirect(auth_url)

class GoogleCallbackView(APIView):
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({'error': 'No authorization code provided'}, status=400)
        
        try:
            client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
            client_secret = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['secret']
            
            redirect_uri = "http://localhost:8000/server/api/auth/google/callback/"
            
            import requests
            token_url = 'https://oauth2.googleapis.com/token'
            
            print(f"Exchanging code for token with redirect URI: {redirect_uri}")
            
            token_data = requests.post(
                token_url,
                data={
                    'code': code,
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'redirect_uri': redirect_uri,
                    'grant_type': 'authorization_code'
                }
            ).json()
            
            if 'error' in token_data:
                print(f"Google token error details: {token_data}")
                return Response({'error': f"Google token error: {token_data['error']}"}, status=400)
            
            access_token = token_data.get('access_token')
            user_info_response = requests.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            ).json()
            
            from django.contrib.auth.models import User
            
            email = user_info_response.get('email')
            if not email:
                return Response({'error': 'Email not provided by Google'}, status=400)
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                username = email.split('@')[0]
                if User.objects.filter(username=username).exists():
                    username = f"{username}{User.objects.count()}"
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=None
                )
                user.save()
            
            token, _ = Token.objects.get_or_create(user=user)
            
            frontend_url = 'http://localhost:5173'
            redirect_url = f"{frontend_url}/auth/google/callback?token={token.key}&user_id={user.id}&email={email}&username={user.username}"
            
            return redirect(redirect_url)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=400)

# Add this new view class
class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def laptop_ids(self, request):
        """Return just the IDs of favorited laptops for the current user"""
        favorite_ids = self.get_queryset().values_list('laptop_id', flat=True)
        return Response(favorite_ids)
    
    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """Toggle a laptop as favorite/unfavorite"""
        laptop_id = request.data.get('laptop_id')
        if not laptop_id:
            return Response({"error": "laptop_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            laptop = Laptop.objects.get(id=laptop_id)
            favorite = Favorite.objects.filter(user=request.user, laptop=laptop)
            
            if favorite.exists():
                # Remove from favorites
                favorite.delete()
                return Response({"status": "removed", "laptop_id": laptop_id}, status=status.HTTP_200_OK)
            else:
                # Add to favorites
                Favorite.objects.create(user=request.user, laptop=laptop)
                return Response({"status": "added", "laptop_id": laptop_id}, status=status.HTTP_201_CREATED)
                
        except Laptop.DoesNotExist:
            return Response({"error": "Laptop not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
