from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('templates', views.BingoTemplateViewSet, basename='template')
router.register('boards', views.BingoBoardViewSet, basename='board')
router.register('reviews', views.ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),
    path('auth/profile/', views.profile_view, name='profile'),
]
