from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from django.db.models import Count, F, ExpressionWrapper, DurationField
from django.contrib.auth import get_user_model
from .models import Category, BingoTemplate, BingoBoard, Review, ReviewLike, ReviewComment

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
# Review Feed API
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def review_feed(request):
    """공개 리뷰 피드 - 최신순, 페이지네이션"""
    from rest_framework.pagination import PageNumberPagination
    from .serializers import ReviewFeedSerializer

    reviews = Review.objects.filter(is_public=True).select_related(
        'restaurant', 'user', 'user__profile'
    ).order_by('-created_at')
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(reviews, request)
    serializer = ReviewFeedSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


# =============================================================================
# Review Social (Like/Comment) APIs
# =============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_like_toggle(request, review_id):
    """리뷰 좋아요 토글 (생성/삭제)"""
    try:
        review = Review.objects.get(id=review_id, is_public=True)
    except Review.DoesNotExist:
        return Response({'error': '리뷰를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

    like, created = ReviewLike.objects.get_or_create(user=request.user, review=review)
    if not created:
        like.delete()

    return Response({
        'is_liked': created,
        'like_count': review.likes.count(),
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def review_comments(request, review_id):
    """리뷰 댓글 목록 조회 (AllowAny) / 작성 (인증 필요)"""
    try:
        review = Review.objects.get(id=review_id, is_public=True)
    except Review.DoesNotExist:
        return Response({'error': '리뷰를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        from .serializers import ReviewCommentSerializer
        comments = review.comments.select_related('user').all()
        serializer = ReviewCommentSerializer(comments, many=True)
        return Response(serializer.data)

    # POST - 인증 필요
    if not request.user or not request.user.is_authenticated:
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    from .serializers import ReviewCommentCreateSerializer
    serializer = ReviewCommentCreateSerializer(data=request.data)
    if serializer.is_valid():
        comment = serializer.save(user=request.user, review=review)
        from .serializers import ReviewCommentSerializer
        return Response(
            ReviewCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health Check 엔드포인트"""
    return Response({'status': 'ok'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def review_comment_delete(request, review_id, comment_id):
    """리뷰 댓글 삭제 (본인만 가능)"""
    try:
        comment = ReviewComment.objects.get(id=comment_id, review_id=review_id)
    except ReviewComment.DoesNotExist:
        return Response({'error': '댓글을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if comment.user != request.user:
        return Response({'error': '본인의 댓글만 삭제할 수 있습니다.'}, status=status.HTTP_403_FORBIDDEN)

    comment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
