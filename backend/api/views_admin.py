import os
import requests

from django.conf import settings
from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Restaurant, BingoTemplate
from .permissions import IsAdminUser
from .serializers_admin import (
    AdminCategorySerializer,
    AdminRestaurantSerializer,
    AdminTemplateListSerializer,
    AdminTemplateDetailSerializer,
    AdminTemplateCreateUpdateSerializer,
)


class AdminPagination(PageNumberPagination):
    """Admin API 페이지네이션"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AdminCategoryViewSet(viewsets.ModelViewSet):
    """Admin 카테고리 관리 ViewSet"""
    queryset = Category.objects.all().order_by('id')
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminUser]
    pagination_class = None  # 카테고리는 페이지네이션 불필요


class AdminRestaurantViewSet(viewsets.ModelViewSet):
    """Admin 식당 관리 ViewSet"""
    queryset = Restaurant.objects.all().order_by('-created_at')
    serializer_class = AdminRestaurantSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_approved']
    search_fields = ['name', 'address']

    def perform_create(self, serializer):
        """생성 시 created_by 자동 설정"""
        serializer.save(created_by=self.request.user)


class AdminTemplateViewSet(viewsets.ModelViewSet):
    """Admin 템플릿 관리 ViewSet"""
    queryset = BingoTemplate.objects.all().order_by('-created_at')
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminTemplateListSerializer
        elif self.action == 'retrieve':
            return AdminTemplateDetailSerializer
        return AdminTemplateCreateUpdateSerializer


@api_view(['GET'])
@permission_classes([IsAdminUser])
def kakao_search_view(request):
    """카카오 로컬 검색 프록시 API"""
    query = request.GET.get('query', '')
    x = request.GET.get('x', '')  # 경도 (longitude)
    y = request.GET.get('y', '')  # 위도 (latitude)

    if not query:
        return Response(
            {'error': '검색어를 입력해주세요.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    kakao_api_key = os.environ.get('KAKAO_REST_API_KEY', '')
    if not kakao_api_key:
        return Response(
            {'error': '카카오 API 키가 설정되지 않았습니다.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # 카카오 로컬 검색 API 호출
    headers = {
        'Authorization': f'KakaoAK {kakao_api_key}'
    }
    params = {
        'query': query,
        'category_group_code': 'FD6',  # 음식점
        'size': 15,
    }
    if x and y:
        params['x'] = x
        params['y'] = y
        params['sort'] = 'distance'

    try:
        response = requests.get(
            'https://dapi.kakao.com/v2/local/search/keyword.json',
            headers=headers,
            params=params,
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        # 응답 형식 변환
        results = []
        for place in data.get('documents', []):
            results.append({
                'id': place.get('id'),
                'name': place.get('place_name'),
                'category': place.get('category_name'),
                'address': place.get('address_name'),
                'road_address': place.get('road_address_name'),
                'phone': place.get('phone'),
                'latitude': float(place.get('y', 0)),
                'longitude': float(place.get('x', 0)),
                'place_url': place.get('place_url'),
                'distance': place.get('distance'),
            })

        return Response({
            'results': results,
            'total': data.get('meta', {}).get('total_count', 0),
        })

    except requests.exceptions.Timeout:
        return Response(
            {'error': '카카오 API 요청 시간이 초과되었습니다.'},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.exceptions.RequestException as e:
        return Response(
            {'error': f'카카오 API 요청 실패: {str(e)}'},
            status=status.HTTP_502_BAD_GATEWAY
        )
