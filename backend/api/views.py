import logging
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.utils import timezone

logger = logging.getLogger(__name__)
from django.db import models
from django.db.models import Count, F, ExpressionWrapper, DurationField
from django.contrib.auth import get_user_model, authenticate
from .models import Category, BingoTemplate, BingoBoard, Review

User = get_user_model()
from .serializers import (
    CategorySerializer,
    BingoTemplateListSerializer,
    BingoTemplateDetailSerializer,
    BingoBoardSerializer,
    BingoBoardCreateSerializer,
    ReviewSerializer,
    ReviewCreateSerializer,
)
from .services import BingoService
from .services_oauth import KakaoOAuthService


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """카테고리 조회 API (읽기 전용)"""
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class BingoTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """빙고 템플릿 조회 API (읽기 전용, 활성 템플릿만)"""
    permission_classes = [AllowAny]

    def get_queryset(self):
        return BingoTemplate.objects.filter(is_active=True).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BingoTemplateDetailSerializer
        return BingoTemplateListSerializer


# =============================================================================
# Phase 2: BingoBoard & Review ViewSets
# =============================================================================

class BingoBoardViewSet(viewsets.ModelViewSet):
    """빙고 보드 API (인증 필요)"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """사용자 본인의 보드만 조회"""
        return BingoBoard.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return BingoBoardCreateSerializer
        return BingoBoardSerializer

    def perform_create(self, serializer):
        """보드 생성 시 사용자 자동 설정"""
        serializer.save(user=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):
    """리뷰 API (인증 필요)"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """사용자 본인의 리뷰만 조회"""
        return Review.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer

    def create(self, request, *args, **kwargs):
        """리뷰 생성 후 빙고 완료 체크"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save(user=request.user)

        # 빙고 완료 체크
        board = review.bingo_board
        bingo_completed = False
        goal_achieved = False

        if not board.is_completed:
            activated = BingoService.get_activated_positions(board)
            completed_lines = BingoService.count_completed_lines(activated)
            if completed_lines >= board.target_line_count:
                board.is_completed = True
                board.completed_at = timezone.now()
                board.save()
                bingo_completed = True
                goal_achieved = True
            elif completed_lines > 0:
                # 새 라인이 완성되었지만 목표 미달성
                bingo_completed = True

        response_data = serializer.data
        response_data['bingo_completed'] = bingo_completed
        response_data['goal_achieved'] = goal_achieved

        return Response(response_data, status=status.HTTP_201_CREATED)


# =============================================================================
# Phase 7: Leaderboard API
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    """
    리더보드 API
    - 최단 시간 클리어 순위
    - 총 완료 횟수 순위
    """
    # 최단 시간 클리어 순위 (완료된 보드만)
    fastest_completions = (
        BingoBoard.objects
        .filter(is_completed=True, completed_at__isnull=False)
        .annotate(
            completion_time=ExpressionWrapper(
                F('completed_at') - F('created_at'),
                output_field=DurationField()
            )
        )
        .select_related('user', 'template')
        .order_by('completion_time')[:10]
    )

    fastest_list = []
    for board in fastest_completions:
        duration = board.completion_time
        total_seconds = int(duration.total_seconds())
        days = total_seconds // 86400
        hours = (total_seconds % 86400) // 3600
        minutes = (total_seconds % 3600) // 60

        if days > 0:
            time_str = f"{days}일 {hours}시간"
        elif hours > 0:
            time_str = f"{hours}시간 {minutes}분"
        else:
            time_str = f"{minutes}분"

        fastest_list.append({
            'rank': len(fastest_list) + 1,
            'username': board.user.username,
            'template_title': board.template.title,
            'completion_time': time_str,
            'completed_at': board.completed_at.isoformat(),
        })

    # 총 완료 횟수 순위
    completion_counts = (
        User.objects
        .annotate(completed_count=Count('bingo_boards', filter=models.Q(bingo_boards__is_completed=True)))
        .filter(completed_count__gt=0)
        .order_by('-completed_count')[:10]
    )

    most_completions = [
        {
            'rank': idx + 1,
            'username': user.username,
            'completed_count': user.completed_count,
        }
        for idx, user in enumerate(completion_counts)
    ]

    return Response({
        'fastest_completions': fastest_list,
        'most_completions': most_completions,
    })


# =============================================================================
# Auth APIs
# =============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """회원가입 API - 사용자 생성 및 토큰 발급"""
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    password_confirm = request.data.get('password_confirm', '')

    errors = {}

    # 유효성 검사
    if not username:
        errors['username'] = '사용자명을 입력해주세요.'
    elif len(username) < 3:
        errors['username'] = '사용자명은 3자 이상이어야 합니다.'
    elif len(username) > 20:
        errors['username'] = '사용자명은 20자 이하여야 합니다.'
    elif User.objects.filter(username=username).exists():
        errors['username'] = '이미 사용 중인 사용자명입니다.'

    if not email:
        errors['email'] = '이메일을 입력해주세요.'
    elif User.objects.filter(email=email).exists():
        errors['email'] = '이미 사용 중인 이메일입니다.'

    if not password:
        errors['password'] = '비밀번호를 입력해주세요.'
    elif len(password) < 6:
        errors['password'] = '비밀번호는 6자 이상이어야 합니다.'

    if password != password_confirm:
        errors['password_confirm'] = '비밀번호가 일치하지 않습니다.'

    if errors:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    # 사용자 생성
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    # 토큰 발급
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'display_name': user.username,  # 일반 회원가입은 username이 display_name
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """로그인 API - 토큰 발급"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': '사용자명과 비밀번호를 입력해주세요.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'error': '사용자명 또는 비밀번호가 올바르지 않습니다.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token, _ = Token.objects.get_or_create(user=user)

    # UserProfile에서 닉네임 확인
    from .models import UserProfile
    display_name = user.username
    try:
        profile = user.profile
        if profile.nickname:
            display_name = profile.nickname
    except UserProfile.DoesNotExist:
        pass

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'display_name': display_name,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """로그아웃 API - 토큰 삭제"""
    request.user.auth_token.delete()
    return Response({'message': '로그아웃되었습니다.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def kakao_authorize_view(request):
    """카카오 OAuth 인증 URL 생성 API"""
    from django.core import signing
    import os

    client_id = os.environ.get('KAKAO_REST_API_KEY', '')
    if not client_id:
        return Response(
            {'error': '카카오 API 키가 설정되지 않았습니다.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # redirect_uri는 Frontend에서 전달받음
    redirect_uri = request.query_params.get('redirect_uri')
    if not redirect_uri:
        return Response(
            {'error': 'redirect_uri가 필요합니다.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # CSRF 보호를 위한 state 생성 (서명된 토큰)
    state_data = {
        'redirect_uri': redirect_uri,
    }
    state = signing.dumps(state_data, salt='kakao-oauth')

    # 카카오 OAuth URL 생성 (파라미터 URL 인코딩 필수)
    from urllib.parse import urlencode
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'state': state,
    }
    kakao_auth_url = f'https://kauth.kakao.com/oauth/authorize?{urlencode(params)}'

    return Response({'url': kakao_auth_url})


@api_view(['POST'])
@permission_classes([AllowAny])
def kakao_login_view(request):
    """카카오 OAuth 로그인/회원가입 API"""
    from django.core import signing

    code = request.data.get('code')
    state = request.data.get('state')

    if not code:
        return Response(
            {'error': '인증 코드가 필요합니다.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not state:
        return Response(
            {'error': 'state가 필요합니다.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # state 검증 및 redirect_uri 추출 (5분 유효)
        state_data = signing.loads(state, salt='kakao-oauth', max_age=300)
        redirect_uri = state_data.get('redirect_uri')
    except signing.BadSignature:
        return Response(
            {'error': '유효하지 않은 인증 상태입니다.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except signing.SignatureExpired:
        return Response(
            {'error': '인증 시간이 만료되었습니다. 다시 시도해주세요.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # 1. 카카오 액세스 토큰 발급
        kakao_token = KakaoOAuthService.get_kakao_token(code, redirect_uri)
        access_token = kakao_token.get('access_token')

        if not access_token:
            return Response(
                {'error': '카카오 토큰 발급에 실패했습니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. 카카오 사용자 정보 조회
        kakao_user = KakaoOAuthService.get_kakao_user_info(access_token)

        # 3. 사용자 생성 또는 조회
        user, is_new_user, social_account = KakaoOAuthService.get_or_create_user(kakao_user)

        # 4. 계정 활성화 상태 확인
        if not user.is_active:
            return Response(
                {'error': '비활성화된 계정입니다. 관리자에게 문의하세요.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 5. DRF 토큰 발급
        token, _ = Token.objects.get_or_create(user=user)

        # display_name: UserProfile.nickname 우선, 없으면 username
        # (UserProfile은 services_oauth.get_or_create_user에서 이미 생성됨)
        from .models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        display_name = profile.nickname or user.username

        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'display_name': display_name,
            },
            'is_new_user': is_new_user,
        })

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f'Kakao login unexpected error: {e}')
        return Response(
            {'error': '카카오 로그인 처리 중 오류가 발생했습니다.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """현재 사용자 정보 조회"""
    from .models import UserProfile

    user = request.user

    # UserProfile에서 닉네임 가져오기
    display_name = user.username
    try:
        profile = user.profile
        if profile.nickname:
            display_name = profile.nickname
    except UserProfile.DoesNotExist:
        pass

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'display_name': display_name,
    })


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    사용자 프로필 조회 및 수정 API
    GET: 프로필 정보, 통계, 최근 활동 조회 (소셜 계정 포함)
    PATCH: 프로필 정보 수정 (닉네임)
    """
    from django.db import models
    from .serializers import UserProfileUpdateSerializer
    from .models import UserProfile, SocialAccount

    user = request.user

    # 프로필 가져오거나 생성
    profile, _ = UserProfile.objects.get_or_create(user=user)

    if request.method == 'PATCH':
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            profile.refresh_from_db()
            return Response({
                'nickname': profile.nickname,
                'display_name': profile.nickname or user.username,
            })
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # GET method - 전체 프로필 데이터 반환
    # 소셜 계정 조회
    social_accounts = SocialAccount.objects.filter(user=user).order_by('-connected_at')

    # 통계 계산
    total_boards = BingoBoard.objects.filter(user=user).count()
    completed_boards = BingoBoard.objects.filter(user=user, is_completed=True).count()
    total_reviews = Review.objects.filter(user=user).count()

    avg_rating = Review.objects.filter(user=user).aggregate(
        avg=models.Avg('rating')
    )['avg']
    if avg_rating:
        avg_rating = round(avg_rating, 1)

    # 최근 활동
    recent_completed = (
        BingoBoard.objects
        .filter(user=user, is_completed=True)
        .select_related('template')
        .order_by('-completed_at')[:5]
    )

    recent_reviews = (
        Review.objects
        .filter(user=user)
        .select_related('restaurant')
        .order_by('-created_at')[:5]
    )

    return Response({
        'user': {
            'id': user.id,
            'nickname': profile.nickname,
            'display_name': profile.nickname or user.username,
            'date_joined': user.date_joined.isoformat(),
            'social_accounts': [
                {
                    'provider': account.provider,
                    'provider_display': account.get_provider_display(),
                    'connected_at': account.connected_at.isoformat(),
                }
                for account in social_accounts
            ],
        },
        'statistics': {
            'total_boards': total_boards,
            'completed_boards': completed_boards,
            'total_reviews': total_reviews,
            'average_rating': avg_rating,
        },
        'recent_activity': {
            'completed_boards': [
                {
                    'id': board.id,
                    'template_title': board.template.title,
                    'completed_at': board.completed_at.isoformat(),
                    'target_line_count': board.target_line_count,
                }
                for board in recent_completed
            ],
            'recent_reviews': [
                {
                    'id': review.id,
                    'restaurant_name': review.restaurant.name,
                    'rating': review.rating,
                    'visited_date': review.visited_date.isoformat(),
                    'created_at': review.created_at.isoformat(),
                }
                for review in recent_reviews
            ],
        },
    })
