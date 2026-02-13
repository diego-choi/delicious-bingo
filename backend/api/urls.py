from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_auth
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
    path('health/', views.health_check, name='health-check'),
    path('reviews/feed/', views.review_feed, name='review-feed'),
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
    path('admin/kakao/search/', views_admin.kakao_search_view, name='admin-kakao-search'),
    path('reviews/<int:review_id>/like/', views.review_like_toggle, name='review-like-toggle'),
    path('reviews/<int:review_id>/comments/', views.review_comments, name='review-comments'),
    path('reviews/<int:review_id>/comments/<int:comment_id>/', views.review_comment_delete, name='review-comment-delete'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('auth/register/', views_auth.register_view, name='register'),
    path('auth/login/', views_auth.login_view, name='login'),
    path('auth/logout/', views_auth.logout_view, name='logout'),
    path('auth/me/', views_auth.me_view, name='me'),
    path('auth/profile/', views_auth.profile_view, name='profile'),
    path('auth/kakao/authorize/', views_auth.kakao_authorize_view, name='kakao-authorize'),
    path('auth/kakao/login/', views_auth.kakao_login_view, name='kakao-login'),
]
