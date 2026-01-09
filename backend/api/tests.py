from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Category, Restaurant, BingoTemplate, BingoTemplateItem, BingoBoard, Review


class CategorySerializerTest(TestCase):
    """Phase 1: CategorySerializer 테스트"""

    def setUp(self):
        self.category = Category.objects.create(
            name="평양냉면",
            description="평양 스타일 냉면 맛집"
        )

    def test_category_serializer_contains_expected_fields(self):
        """Serializer가 id, name, description 필드를 포함해야 한다"""
        from .serializers import CategorySerializer
        serializer = CategorySerializer(instance=self.category)
        self.assertEqual(
            set(serializer.data.keys()),
            {'id', 'name', 'description'}
        )

    def test_category_serializer_field_content(self):
        """Serializer가 올바른 데이터를 반환해야 한다"""
        from .serializers import CategorySerializer
        serializer = CategorySerializer(instance=self.category)
        self.assertEqual(serializer.data['name'], "평양냉면")
        self.assertEqual(serializer.data['description'], "평양 스타일 냉면 맛집")


class RestaurantSerializerTest(TestCase):
    """Phase 1: RestaurantSerializer 테스트"""

    def setUp(self):
        self.user = User.objects.create_user('testuser', password='testpass')
        self.category = Category.objects.create(name="평양냉면")
        self.restaurant = Restaurant.objects.create(
            category=self.category,
            name="을밀대",
            address="서울시 중구 을지로",
            latitude=37.5665,
            longitude=126.9780,
            kakao_place_id="12345",
            place_url="https://place.map.kakao.com/12345",
            is_approved=True,
            created_by=self.user
        )

    def test_restaurant_serializer_contains_expected_fields(self):
        """Serializer가 필수 필드들을 포함해야 한다"""
        from .serializers import RestaurantSerializer
        serializer = RestaurantSerializer(instance=self.restaurant)
        expected_fields = {
            'id', 'name', 'address', 'latitude', 'longitude',
            'kakao_place_id', 'place_url', 'category', 'category_name'
        }
        self.assertEqual(set(serializer.data.keys()), expected_fields)

    def test_restaurant_serializer_category_name(self):
        """category_name이 올바르게 반환되어야 한다"""
        from .serializers import RestaurantSerializer
        serializer = RestaurantSerializer(instance=self.restaurant)
        self.assertEqual(serializer.data['category_name'], "평양냉면")


class BingoTemplateSerializerTest(TestCase):
    """Phase 1: BingoTemplate Serializer 테스트"""

    def setUp(self):
        self.user = User.objects.create_user('testuser', password='testpass')
        self.category = Category.objects.create(name="평양냉면")
        self.template = BingoTemplate.objects.create(
            category=self.category,
            title="평양냉면 빙고",
            description="서울 평양냉면 맛집 투어"
        )
        # 5개 레스토랑과 템플릿 아이템 생성
        for i in range(5):
            restaurant = Restaurant.objects.create(
                category=self.category,
                name=f"맛집{i}",
                address=f"주소{i}",
                latitude=37.0 + i * 0.01,
                longitude=127.0 + i * 0.01,
                is_approved=True,
                created_by=self.user
            )
            BingoTemplateItem.objects.create(
                template=self.template,
                restaurant=restaurant,
                position=i
            )

    def test_template_list_serializer_contains_expected_fields(self):
        """List Serializer가 요약 정보를 포함해야 한다"""
        from .serializers import BingoTemplateListSerializer
        serializer = BingoTemplateListSerializer(instance=self.template)
        expected_fields = {
            'id', 'title', 'description', 'category',
            'category_name', 'item_count', 'created_at'
        }
        self.assertEqual(set(serializer.data.keys()), expected_fields)

    def test_template_list_serializer_item_count(self):
        """item_count가 올바르게 계산되어야 한다"""
        from .serializers import BingoTemplateListSerializer
        serializer = BingoTemplateListSerializer(instance=self.template)
        self.assertEqual(serializer.data['item_count'], 5)

    def test_template_detail_serializer_includes_items(self):
        """Detail Serializer가 items를 포함해야 한다"""
        from .serializers import BingoTemplateDetailSerializer
        serializer = BingoTemplateDetailSerializer(instance=self.template)
        self.assertIn('items', serializer.data)
        self.assertEqual(len(serializer.data['items']), 5)

    def test_template_detail_item_contains_restaurant(self):
        """각 item이 restaurant 정보를 포함해야 한다"""
        from .serializers import BingoTemplateDetailSerializer
        serializer = BingoTemplateDetailSerializer(instance=self.template)
        first_item = serializer.data['items'][0]
        self.assertIn('restaurant', first_item)
        self.assertIn('position', first_item)


class CategoryAPITest(APITestCase):
    """Phase 1: Category API 엔드포인트 테스트"""

    def setUp(self):
        self.category1 = Category.objects.create(name="평양냉면")
        self.category2 = Category.objects.create(name="함흥냉면")

    def test_get_categories_list(self):
        """GET /api/categories/ 가 카테고리 목록을 반환해야 한다"""
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # pagination 형태: {'count': N, 'results': [...]}
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_get_category_detail(self):
        """GET /api/categories/:id/ 가 카테고리 상세를 반환해야 한다"""
        response = self.client.get(f'/api/categories/{self.category1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "평양냉면")


class BingoTemplateAPITest(APITestCase):
    """Phase 1: BingoTemplate API 엔드포인트 테스트"""

    def setUp(self):
        self.user = User.objects.create_user('testuser', password='testpass')
        self.category = Category.objects.create(name="평양냉면")
        self.active_template = BingoTemplate.objects.create(
            category=self.category,
            title="활성 템플릿",
            is_active=True
        )
        self.inactive_template = BingoTemplate.objects.create(
            category=self.category,
            title="비활성 템플릿",
            is_active=False
        )
        # 활성 템플릿에 아이템 추가
        for i in range(3):
            restaurant = Restaurant.objects.create(
                category=self.category,
                name=f"맛집{i}",
                address=f"주소{i}",
                latitude=37.0,
                longitude=127.0,
                is_approved=True,
                created_by=self.user
            )
            BingoTemplateItem.objects.create(
                template=self.active_template,
                restaurant=restaurant,
                position=i
            )

    def test_get_templates_list_only_active(self):
        """GET /api/templates/ 는 활성 템플릿만 반환해야 한다"""
        response = self.client.get('/api/templates/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # pagination 형태: {'count': N, 'results': [...]}
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], "활성 템플릿")

    def test_get_template_detail_includes_items(self):
        """GET /api/templates/:id/ 는 items를 포함해야 한다"""
        response = self.client.get(f'/api/templates/{self.active_template.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('items', response.data)
        self.assertEqual(len(response.data['items']), 3)

    def test_templates_api_allows_unauthenticated(self):
        """인증 없이도 템플릿 조회가 가능해야 한다"""
        response = self.client.get('/api/templates/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# =============================================================================
# Phase 2: BingoService 테스트
# =============================================================================

class BingoServiceTest(TestCase):
    """Phase 2: BingoService 빙고 라인 감지 테스트"""

    def setUp(self):
        self.user = User.objects.create_user('testuser', password='testpass')
        self.category = Category.objects.create(name="평양냉면")
        self.template = BingoTemplate.objects.create(
            category=self.category,
            title="테스트 빙고"
        )
        # 25개 레스토랑과 템플릿 아이템 생성 (5x5 그리드)
        self.restaurants = []
        for i in range(25):
            restaurant = Restaurant.objects.create(
                category=self.category,
                name=f"맛집{i}",
                address=f"주소{i}",
                latitude=37.0,
                longitude=127.0,
                is_approved=True,
                created_by=self.user
            )
            self.restaurants.append(restaurant)
            BingoTemplateItem.objects.create(
                template=self.template,
                restaurant=restaurant,
                position=i
            )
        self.board = BingoBoard.objects.create(
            user=self.user,
            template=self.template,
            target_line_count=1
        )

    def _create_review(self, position):
        """특정 position의 레스토랑에 리뷰 생성"""
        return Review.objects.create(
            user=self.user,
            bingo_board=self.board,
            restaurant=self.restaurants[position],
            image='test.jpg',
            content='테스트 리뷰입니다 10자 이상',
            rating=5,
            visited_date='2025-01-01'
        )

    def test_no_activated_positions_initially(self):
        """초기 상태에서 활성화된 포지션이 없어야 한다"""
        from .services import BingoService
        activated = BingoService.get_activated_positions(self.board)
        self.assertEqual(activated, set())

    def test_activated_positions_after_review(self):
        """리뷰 작성 후 해당 포지션이 활성화되어야 한다"""
        from .services import BingoService
        self._create_review(0)
        self._create_review(5)
        activated = BingoService.get_activated_positions(self.board)
        self.assertEqual(activated, {0, 5})

    def test_horizontal_line_detection(self):
        """가로 라인 (첫 번째 줄: 0,1,2,3,4) 감지"""
        from .services import BingoService
        for pos in [0, 1, 2, 3, 4]:
            self._create_review(pos)
        activated = BingoService.get_activated_positions(self.board)
        completed = BingoService.count_completed_lines(activated)
        self.assertEqual(completed, 1)

    def test_vertical_line_detection(self):
        """세로 라인 (첫 번째 열: 0,5,10,15,20) 감지"""
        from .services import BingoService
        for pos in [0, 5, 10, 15, 20]:
            self._create_review(pos)
        activated = BingoService.get_activated_positions(self.board)
        completed = BingoService.count_completed_lines(activated)
        self.assertEqual(completed, 1)

    def test_diagonal_line_detection(self):
        """대각선 라인 (0,6,12,18,24) 감지"""
        from .services import BingoService
        for pos in [0, 6, 12, 18, 24]:
            self._create_review(pos)
        activated = BingoService.get_activated_positions(self.board)
        completed = BingoService.count_completed_lines(activated)
        self.assertEqual(completed, 1)

    def test_anti_diagonal_line_detection(self):
        """역대각선 라인 (4,8,12,16,20) 감지"""
        from .services import BingoService
        for pos in [4, 8, 12, 16, 20]:
            self._create_review(pos)
        activated = BingoService.get_activated_positions(self.board)
        completed = BingoService.count_completed_lines(activated)
        self.assertEqual(completed, 1)

    def test_multiple_lines_detection(self):
        """여러 라인 동시 완성 (가로1 + 세로1 = 2줄)"""
        from .services import BingoService
        # 첫 번째 가로줄: 0,1,2,3,4
        # 첫 번째 세로줄: 0,5,10,15,20
        for pos in [0, 1, 2, 3, 4, 5, 10, 15, 20]:
            self._create_review(pos)
        activated = BingoService.get_activated_positions(self.board)
        completed = BingoService.count_completed_lines(activated)
        self.assertEqual(completed, 2)

    def test_incomplete_line_not_counted(self):
        """불완전한 라인은 카운트되지 않아야 한다"""
        from .services import BingoService
        for pos in [0, 1, 2, 3]:  # 4번 빠짐
            self._create_review(pos)
        activated = BingoService.get_activated_positions(self.board)
        completed = BingoService.count_completed_lines(activated)
        self.assertEqual(completed, 0)

    def test_board_completion_check_target_1(self):
        """목표 1줄일 때 완료 체크"""
        from .services import BingoService
        self.board.target_line_count = 1
        self.board.save()
        # 1줄 완성 전
        for pos in [0, 1, 2, 3]:
            self._create_review(pos)
        self.assertFalse(BingoService.check_board_completion(self.board))
        # 1줄 완성
        self._create_review(4)
        self.assertTrue(BingoService.check_board_completion(self.board))

    def test_board_completion_check_target_3(self):
        """목표 3줄일 때 완료 체크"""
        from .services import BingoService
        self.board.target_line_count = 3
        self.board.save()
        # 2줄만 완성 (가로1, 세로1)
        for pos in [0, 1, 2, 3, 4, 5, 10, 15, 20]:
            self._create_review(pos)
        self.assertFalse(BingoService.check_board_completion(self.board))
        # 3줄 완성 (가로2 추가)
        for pos in [6, 7, 8, 9]:
            self._create_review(pos)
        self.assertTrue(BingoService.check_board_completion(self.board))


class BingoBoardSerializerTest(TestCase):
    """Phase 2: BingoBoard Serializer 테스트"""

    def setUp(self):
        self.user = User.objects.create_user('testuser', password='testpass')
        self.category = Category.objects.create(name="평양냉면")
        self.template = BingoTemplate.objects.create(
            category=self.category,
            title="테스트 빙고"
        )
        self.restaurants = []
        for i in range(25):
            restaurant = Restaurant.objects.create(
                category=self.category,
                name=f"맛집{i}",
                address=f"주소{i}",
                latitude=37.0,
                longitude=127.0,
                is_approved=True,
                created_by=self.user
            )
            self.restaurants.append(restaurant)
            BingoTemplateItem.objects.create(
                template=self.template,
                restaurant=restaurant,
                position=i
            )
        self.board = BingoBoard.objects.create(
            user=self.user,
            template=self.template,
            target_line_count=1
        )

    def test_board_serializer_contains_cells(self):
        """BingoBoardSerializer가 25개 cells를 포함해야 한다"""
        from .serializers import BingoBoardSerializer
        serializer = BingoBoardSerializer(instance=self.board)
        self.assertIn('cells', serializer.data)
        self.assertEqual(len(serializer.data['cells']), 25)

    def test_board_serializer_cell_structure(self):
        """각 cell이 position, restaurant, is_activated, review를 포함해야 한다"""
        from .serializers import BingoBoardSerializer
        serializer = BingoBoardSerializer(instance=self.board)
        cell = serializer.data['cells'][0]
        self.assertIn('position', cell)
        self.assertIn('restaurant', cell)
        self.assertIn('is_activated', cell)
        self.assertIn('review', cell)

    def test_board_serializer_completed_lines(self):
        """completed_lines 필드가 있어야 한다"""
        from .serializers import BingoBoardSerializer
        serializer = BingoBoardSerializer(instance=self.board)
        self.assertIn('completed_lines', serializer.data)
        self.assertEqual(serializer.data['completed_lines'], 0)

    def test_board_serializer_progress(self):
        """progress 필드가 있어야 한다"""
        from .serializers import BingoBoardSerializer
        serializer = BingoBoardSerializer(instance=self.board)
        self.assertIn('progress', serializer.data)
        self.assertEqual(serializer.data['progress']['activated_count'], 0)
        self.assertEqual(serializer.data['progress']['total_cells'], 25)

    def test_board_serializer_cell_activation(self):
        """리뷰가 있는 셀은 is_activated가 True여야 한다"""
        from .serializers import BingoBoardSerializer
        Review.objects.create(
            user=self.user,
            bingo_board=self.board,
            restaurant=self.restaurants[0],
            image='test.jpg',
            content='테스트 리뷰입니다 10자 이상',
            rating=5,
            visited_date='2025-01-01'
        )
        serializer = BingoBoardSerializer(instance=self.board)
        # position 0인 셀 찾기
        cell_0 = next(c for c in serializer.data['cells'] if c['position'] == 0)
        self.assertTrue(cell_0['is_activated'])
        self.assertIsNotNone(cell_0['review'])


class BingoBoardAPITest(APITestCase):
    """Phase 2: BingoBoard API 엔드포인트 테스트"""

    def setUp(self):
        self.user = User.objects.create_user('testuser', password='testpass')
        self.other_user = User.objects.create_user('other', password='testpass')
        self.category = Category.objects.create(name="평양냉면")
        self.template = BingoTemplate.objects.create(
            category=self.category,
            title="테스트 빙고",
            is_active=True
        )
        self.restaurants = []
        for i in range(25):
            restaurant = Restaurant.objects.create(
                category=self.category,
                name=f"맛집{i}",
                address=f"주소{i}",
                latitude=37.0,
                longitude=127.0,
                is_approved=True,
                created_by=self.user
            )
            self.restaurants.append(restaurant)
            BingoTemplateItem.objects.create(
                template=self.template,
                restaurant=restaurant,
                position=i
            )

    def test_create_board_requires_auth(self):
        """POST /api/boards/ 는 인증이 필요하다"""
        response = self.client.post('/api/boards/', {
            'template': self.template.id,
            'target_line_count': 1
        })
        # DRF의 IsAuthenticated는 인증 안된 요청에 403 반환
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_create_board_authenticated(self):
        """인증된 사용자는 보드를 생성할 수 있다"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/boards/', {
            'template': self.template.id,
            'target_line_count': 1
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BingoBoard.objects.count(), 1)
        self.assertEqual(BingoBoard.objects.first().user, self.user)

    def test_create_board_response_includes_id(self):
        """보드 생성 응답에 id가 포함되어야 한다 (프론트엔드 리다이렉트용)"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/boards/', {
            'template': self.template.id,
            'target_line_count': 1
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertIsNotNone(response.data['id'])
        # 생성된 보드의 ID와 일치하는지 확인
        created_board = BingoBoard.objects.first()
        self.assertEqual(response.data['id'], created_board.id)

    def test_get_board_detail_includes_cells(self):
        """GET /api/boards/:id/ 는 cells를 포함해야 한다"""
        board = BingoBoard.objects.create(
            user=self.user,
            template=self.template,
            target_line_count=1
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/boards/{board.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('cells', response.data)
        self.assertEqual(len(response.data['cells']), 25)

    def test_user_can_only_see_own_boards(self):
        """사용자는 자신의 보드만 볼 수 있다"""
        board = BingoBoard.objects.create(
            user=self.user,
            template=self.template,
            target_line_count=1
        )
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f'/api/boards/{board.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ReviewAPITest(APITestCase):
    """Phase 2: Review API 엔드포인트 테스트"""

    def setUp(self):
        self.user = User.objects.create_user('testuser', password='testpass')
        self.category = Category.objects.create(name="평양냉면")
        self.template = BingoTemplate.objects.create(
            category=self.category,
            title="테스트 빙고"
        )
        self.restaurants = []
        for i in range(25):
            restaurant = Restaurant.objects.create(
                category=self.category,
                name=f"맛집{i}",
                address=f"주소{i}",
                latitude=37.0,
                longitude=127.0,
                is_approved=True,
                created_by=self.user
            )
            self.restaurants.append(restaurant)
            BingoTemplateItem.objects.create(
                template=self.template,
                restaurant=restaurant,
                position=i
            )
        self.board = BingoBoard.objects.create(
            user=self.user,
            template=self.template,
            target_line_count=1
        )

    def test_create_review_requires_auth(self):
        """POST /api/reviews/ 는 인증이 필요하다"""
        response = self.client.post('/api/reviews/', {
            'bingo_board': self.board.id,
            'restaurant': self.restaurants[0].id,
            'content': '맛있었습니다 강력 추천합니다',
            'rating': 5,
            'visited_date': '2025-01-01'
        })
        # DRF의 IsAuthenticated는 인증 안된 요청에 403 반환
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_create_review_activates_cell(self):
        """리뷰 생성 후 해당 셀이 활성화되어야 한다"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/reviews/', {
            'bingo_board': self.board.id,
            'restaurant': self.restaurants[0].id,
            'content': '맛있었습니다 강력 추천합니다',
            'rating': 5,
            'visited_date': '2025-01-01'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 보드 조회하여 셀 활성화 확인
        board_response = self.client.get(f'/api/boards/{self.board.id}/')
        cell_0 = next(c for c in board_response.data['cells'] if c['position'] == 0)
        self.assertTrue(cell_0['is_activated'])

    def test_create_review_restaurant_must_be_in_template(self):
        """템플릿에 없는 레스토랑으로 리뷰 생성 시 에러"""
        other_restaurant = Restaurant.objects.create(
            category=self.category,
            name="다른 맛집",
            address="다른 주소",
            latitude=37.0,
            longitude=127.0,
            is_approved=True,
            created_by=self.user
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/reviews/', {
            'bingo_board': self.board.id,
            'restaurant': other_restaurant.id,
            'content': '맛있었습니다 강력 추천합니다',
            'rating': 5,
            'visited_date': '2025-01-01'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bingo_completion_updates_board(self):
        """빙고 완료 시 보드가 완료 상태로 업데이트되어야 한다"""
        self.client.force_authenticate(user=self.user)
        # 첫 번째 가로줄 완성 (0,1,2,3,4)
        for i in range(5):
            self.client.post('/api/reviews/', {
                'bingo_board': self.board.id,
                'restaurant': self.restaurants[i].id,
                'content': f'맛있었습니다 강력 추천합니다 {i}',
                'rating': 5,
                'visited_date': '2025-01-01'
            }, format='json')

        self.board.refresh_from_db()
        self.assertTrue(self.board.is_completed)
        self.assertIsNotNone(self.board.completed_at)


# =============================================================================
# Phase 7: Leaderboard API 테스트
# =============================================================================

class LeaderboardAPITest(APITestCase):
    """Phase 7: Leaderboard API 엔드포인트 테스트"""

    def setUp(self):
        self.user1 = User.objects.create_user('user1', password='testpass')
        self.user2 = User.objects.create_user('user2', password='testpass')
        self.category = Category.objects.create(name="평양냉면")
        self.template = BingoTemplate.objects.create(
            category=self.category,
            title="테스트 빙고"
        )
        self.restaurants = []
        for i in range(25):
            restaurant = Restaurant.objects.create(
                category=self.category,
                name=f"맛집{i}",
                address=f"주소{i}",
                latitude=37.0,
                longitude=127.0,
                is_approved=True,
                created_by=self.user1
            )
            self.restaurants.append(restaurant)
            BingoTemplateItem.objects.create(
                template=self.template,
                restaurant=restaurant,
                position=i
            )

    def test_leaderboard_returns_empty_when_no_completions(self):
        """완료된 빙고가 없을 때 빈 리스트 반환"""
        response = self.client.get('/api/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['fastest_completions'], [])
        self.assertEqual(response.data['most_completions'], [])

    def test_leaderboard_allows_unauthenticated(self):
        """인증 없이도 리더보드 조회가 가능해야 한다"""
        response = self.client.get('/api/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_leaderboard_shows_completed_boards(self):
        """완료된 보드가 리더보드에 표시되어야 한다"""
        from django.utils import timezone
        board = BingoBoard.objects.create(
            user=self.user1,
            template=self.template,
            target_line_count=1,
            is_completed=True,
            completed_at=timezone.now()
        )

        response = self.client.get('/api/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['fastest_completions']), 1)
        self.assertEqual(response.data['fastest_completions'][0]['username'], 'user1')

    def test_leaderboard_most_completions(self):
        """가장 많이 완료한 사용자가 표시되어야 한다"""
        from django.utils import timezone
        # user1: 2개 완료
        for _ in range(2):
            BingoBoard.objects.create(
                user=self.user1,
                template=self.template,
                target_line_count=1,
                is_completed=True,
                completed_at=timezone.now()
            )
        # user2: 1개 완료
        BingoBoard.objects.create(
            user=self.user2,
            template=self.template,
            target_line_count=1,
            is_completed=True,
            completed_at=timezone.now()
        )

        response = self.client.get('/api/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['most_completions']), 2)
        self.assertEqual(response.data['most_completions'][0]['username'], 'user1')
        self.assertEqual(response.data['most_completions'][0]['completed_count'], 2)
        self.assertEqual(response.data['most_completions'][1]['username'], 'user2')
        self.assertEqual(response.data['most_completions'][1]['completed_count'], 1)


# =============================================================================
# Auth API 테스트
# =============================================================================

class RegisterAPITest(APITestCase):
    """회원가입 API 테스트"""

    def test_register_success(self):
        """정상적인 회원가입"""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertEqual(response.data['user']['email'], 'newuser@test.com')

    def test_register_creates_user(self):
        """회원가입 시 사용자가 생성되어야 한다"""
        self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_returns_valid_token(self):
        """회원가입 후 반환된 토큰으로 인증이 가능해야 한다"""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        token = response.data['token']

        # 토큰으로 /api/auth/me/ 요청
        me_response = self.client.get(
            '/api/auth/me/',
            HTTP_AUTHORIZATION=f'Token {token}'
        )
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['username'], 'newuser')

    def test_register_username_required(self):
        """사용자명은 필수"""
        response = self.client.post('/api/auth/register/', {
            'username': '',
            'email': 'test@test.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data['errors'])

    def test_register_username_min_length(self):
        """사용자명은 3자 이상이어야 한다"""
        response = self.client.post('/api/auth/register/', {
            'username': 'ab',
            'email': 'test@test.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data['errors'])

    def test_register_username_max_length(self):
        """사용자명은 20자 이하여야 한다"""
        response = self.client.post('/api/auth/register/', {
            'username': 'a' * 21,
            'email': 'test@test.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data['errors'])

    def test_register_username_unique(self):
        """사용자명은 중복될 수 없다"""
        User.objects.create_user('existinguser', password='testpass')
        response = self.client.post('/api/auth/register/', {
            'username': 'existinguser',
            'email': 'new@test.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data['errors'])

    def test_register_email_required(self):
        """이메일은 필수"""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': '',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_register_email_unique(self):
        """이메일은 중복될 수 없다"""
        User.objects.create_user('existinguser', email='existing@test.com', password='testpass')
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'existing@test.com',
            'password': 'password123',
            'password_confirm': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_register_password_required(self):
        """비밀번호는 필수"""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'test@test.com',
            'password': '',
            'password_confirm': ''
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data['errors'])

    def test_register_password_min_length(self):
        """비밀번호는 6자 이상이어야 한다"""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'test@test.com',
            'password': '12345',
            'password_confirm': '12345'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data['errors'])

    def test_register_password_confirm_must_match(self):
        """비밀번호 확인이 일치해야 한다"""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'test@test.com',
            'password': 'password123',
            'password_confirm': 'different123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password_confirm', response.data['errors'])

    def test_register_multiple_errors(self):
        """여러 에러가 동시에 반환될 수 있다"""
        response = self.client.post('/api/auth/register/', {
            'username': 'ab',
            'email': '',
            'password': '123',
            'password_confirm': '456'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        errors = response.data['errors']
        self.assertIn('username', errors)
        self.assertIn('email', errors)
        self.assertIn('password', errors)
        self.assertIn('password_confirm', errors)


# =============================================================================
# 이미지 URL 테스트 (Cloudinary 연동)
# =============================================================================

class ReviewImageURLTest(APITestCase):
    """리뷰 이미지 URL 테스트 - 프로덕션에서 절대 경로 반환 확인"""

    def setUp(self):
        self.user = User.objects.create_user('testuser', password='testpass')
        self.category = Category.objects.create(name="테스트")
        self.template = BingoTemplate.objects.create(
            category=self.category,
            title="테스트 빙고"
        )
        self.restaurant = Restaurant.objects.create(
            category=self.category,
            name="테스트 맛집",
            address="테스트 주소",
            latitude=37.0,
            longitude=127.0,
            is_approved=True,
            created_by=self.user
        )
        BingoTemplateItem.objects.create(
            template=self.template,
            restaurant=self.restaurant,
            position=0
        )
        self.board = BingoBoard.objects.create(
            user=self.user,
            template=self.template,
            target_line_count=1
        )

    def test_review_image_url_in_board_response(self):
        """빙고 보드 응답에서 리뷰 이미지 URL이 포함되어야 한다"""
        # 리뷰 생성 (이미지 포함)
        Review.objects.create(
            user=self.user,
            bingo_board=self.board,
            restaurant=self.restaurant,
            image='reviews/test.jpg',
            content='테스트 리뷰입니다 10자 이상',
            rating=5,
            visited_date='2025-01-01'
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/boards/{self.board.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 활성화된 셀의 리뷰 찾기
        activated_cell = next(
            (c for c in response.data['cells'] if c['is_activated']),
            None
        )
        self.assertIsNotNone(activated_cell)
        self.assertIsNotNone(activated_cell['review'])
        self.assertIsNotNone(activated_cell['review']['image'])

        # 이미지 URL이 존재하고 비어있지 않아야 함
        image_url = activated_cell['review']['image']
        self.assertTrue(len(image_url) > 0)
