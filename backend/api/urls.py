from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_admin

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('templates', views.BingoTemplateViewSet, basename='template')
router.register('boards', views.BingoBoardViewSet, basename='board')
router.register('reviews', views.ReviewViewSet, basename='review')

# Admin router
admin_router = DefaultRouter()
admin_router.register('restaurants', views_admin.AdminRestaurantViewSet, basename='admin-restaurant')
admin_router.register('templates', views_admin.AdminTemplateViewSet, basename='admin-template')
admin_router.register('categories', views_admin.AdminCategoryViewSet, basename='admin-category')
admin_router.register('users', views_admin.AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
    path('admin/kakao/search/', views_admin.kakao_search_view, name='admin-kakao-search'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.me_view, name='me'),
    path('auth/profile/', views.profile_view, name='profile'),
]
