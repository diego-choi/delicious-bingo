from rest_framework import serializers
from .models import Category, Restaurant, BingoTemplate, BingoTemplateItem, BingoBoard, Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class RestaurantSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'address', 'latitude', 'longitude',
            'kakao_place_id', 'place_url', 'category', 'category_name'
        ]


class BingoTemplateItemSerializer(serializers.ModelSerializer):
    restaurant = RestaurantSerializer(read_only=True)

    class Meta:
        model = BingoTemplateItem
        fields = ['id', 'position', 'restaurant']


class BingoTemplateListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = BingoTemplate
        fields = [
            'id', 'title', 'description', 'category',
            'category_name', 'item_count', 'created_at'
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class BingoTemplateDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    items = BingoTemplateItemSerializer(many=True, read_only=True)

    class Meta:
        model = BingoTemplate
        fields = [
            'id', 'title', 'description', 'category',
            'category_name', 'items', 'created_at'
        ]


# =============================================================================
# Phase 2: Review & BingoBoard Serializers
# =============================================================================

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id', 'restaurant', 'image', 'content',
            'rating', 'visited_date', 'is_public', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    # 테스트 환경에서 image 필드를 optional로 설정
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Review
        fields = [
            'bingo_board', 'restaurant', 'image', 'content',
            'rating', 'visited_date', 'is_public'
        ]

    def validate(self, data):
        """레스토랑이 보드의 템플릿에 포함되어 있는지 검증"""
        bingo_board = data.get('bingo_board')
        restaurant = data.get('restaurant')

        if not bingo_board.template.items.filter(restaurant=restaurant).exists():
            raise serializers.ValidationError({
                'restaurant': '이 레스토랑은 빙고 템플릿에 포함되어 있지 않습니다.'
            })

        return data


class BingoBoardSerializer(serializers.ModelSerializer):
    template_title = serializers.CharField(source='template.title', read_only=True)
    cells = serializers.SerializerMethodField()
    completed_lines = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = BingoBoard
        fields = [
            'id', 'template', 'template_title', 'target_line_count',
            'is_completed', 'created_at', 'completed_at',
            'cells', 'completed_lines', 'progress'
        ]
        read_only_fields = ['id', 'is_completed', 'created_at', 'completed_at']

    def get_cells(self, obj):
        """25개 셀 데이터를 반환 (활성화 상태 포함)"""
        template_items = obj.template.items.select_related('restaurant').all()
        reviews_by_restaurant = {
            r.restaurant_id: r for r in obj.reviews.all()
        }

        cells = []
        for item in template_items:
            review = reviews_by_restaurant.get(item.restaurant_id)
            cells.append({
                'position': item.position,
                'restaurant': RestaurantSerializer(item.restaurant).data,
                'is_activated': review is not None,
                'review': ReviewSerializer(review).data if review else None,
            })
        return sorted(cells, key=lambda x: x['position'])

    def get_completed_lines(self, obj):
        """완성된 빙고 라인 수"""
        from .services import BingoService
        activated = BingoService.get_activated_positions(obj)
        return BingoService.count_completed_lines(activated)

    def get_progress(self, obj):
        """진행률 정보"""
        activated_count = obj.reviews.count()
        return {
            'activated_count': activated_count,
            'total_cells': 25,
            'percentage': round(activated_count / 25 * 100, 1)
        }


class BingoBoardCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BingoBoard
        fields = ['template', 'target_line_count']
