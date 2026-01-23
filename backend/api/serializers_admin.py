from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Category, Restaurant, BingoTemplate, BingoTemplateItem

User = get_user_model()


class AdminCategorySerializer(serializers.ModelSerializer):
    """Admin 카테고리 Serializer"""
    restaurant_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'restaurant_count']

    def get_restaurant_count(self, obj):
        return obj.restaurants.count()


class AdminRestaurantSerializer(serializers.ModelSerializer):
    """Admin 식당 Serializer"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id', 'category', 'category_name', 'name', 'address',
            'latitude', 'longitude', 'kakao_place_id', 'place_url',
            'is_approved', 'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_by_username', 'created_at']


class AdminTemplateItemSerializer(serializers.ModelSerializer):
    """Admin 템플릿 아이템 Serializer"""
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = BingoTemplateItem
        fields = ['id', 'position', 'restaurant', 'restaurant_name']


class AdminTemplateItemWriteSerializer(serializers.Serializer):
    """템플릿 아이템 생성/수정용 Serializer"""
    position = serializers.IntegerField(min_value=0, max_value=24)
    restaurant = serializers.PrimaryKeyRelatedField(queryset=Restaurant.objects.all())


class AdminTemplateListSerializer(serializers.ModelSerializer):
    """Admin 템플릿 목록 Serializer"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = BingoTemplate
        fields = [
            'id', 'category', 'category_name', 'title', 'description',
            'is_active', 'item_count', 'created_at'
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class AdminTemplateDetailSerializer(serializers.ModelSerializer):
    """Admin 템플릿 상세 Serializer"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    items = AdminTemplateItemSerializer(many=True, read_only=True)

    class Meta:
        model = BingoTemplate
        fields = [
            'id', 'category', 'category_name', 'title', 'description',
            'is_active', 'items', 'created_at'
        ]


class AdminTemplateCreateUpdateSerializer(serializers.ModelSerializer):
    """Admin 템플릿 생성/수정 Serializer"""
    items = AdminTemplateItemWriteSerializer(many=True, required=False)

    class Meta:
        model = BingoTemplate
        fields = ['id', 'category', 'title', 'description', 'is_active', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        template = BingoTemplate.objects.create(**validated_data)

        for item_data in items_data:
            BingoTemplateItem.objects.create(
                template=template,
                position=item_data['position'],
                restaurant=item_data['restaurant']
            )

        return template

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # 기본 필드 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # items가 제공된 경우에만 업데이트
        if items_data is not None:
            # 기존 아이템 삭제
            instance.items.all().delete()

            # 새 아이템 생성
            for item_data in items_data:
                BingoTemplateItem.objects.create(
                    template=instance,
                    position=item_data['position'],
                    restaurant=item_data['restaurant']
                )

        return instance


class AdminUserSerializer(serializers.ModelSerializer):
    """Admin 사용자 관리 Serializer"""
    board_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'is_staff', 'is_active',
            'date_joined', 'board_count'
        ]
        read_only_fields = ['id', 'username', 'email', 'date_joined', 'board_count']

    def get_board_count(self, obj):
        return obj.bingo_boards.count()
