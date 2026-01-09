from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Category, Restaurant, BingoTemplate, BingoTemplateItem


class Command(BaseCommand):
    help = '테스트용 샘플 데이터를 생성합니다'

    def handle(self, *args, **options):
        self.stdout.write('샘플 데이터 생성 시작...')

        # 테스트 유저 생성
        test_user, created = User.objects.get_or_create(
            username='testuser',
            defaults={'email': 'test@example.com'}
        )
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            self.stdout.write(self.style.SUCCESS('테스트 유저 생성: testuser / testpass123'))
        else:
            self.stdout.write('테스트 유저가 이미 존재합니다')

        # 카테고리 생성
        categories_data = [
            {
                'name': '강남 맛집 투어',
                'description': '강남역 주변 인기 맛집 25곳을 정복하세요!',
            },
            {
                'name': '홍대 카페 투어',
                'description': '홍대 감성 카페 25곳을 방문해보세요!',
            },
            {
                'name': '을지로 노포 탐방',
                'description': '을지로 골목 숨은 노포 맛집을 찾아서',
            },
        ]

        categories = []
        for data in categories_data:
            category, created = Category.objects.get_or_create(
                name=data['name'],
                defaults={'description': data['description']}
            )
            categories.append(category)
            status = '생성' if created else '존재'
            self.stdout.write(f'카테고리 {status}: {category.name}')

        # 강남 맛집 데이터 (25개)
        gangnam_restaurants = [
            {'name': '본죽&비빔밥 강남점', 'address': '서울 강남구 강남대로 328', 'lat': 37.4979, 'lng': 127.0276},
            {'name': '하남돼지집 강남본점', 'address': '서울 강남구 강남대로94길 21', 'lat': 37.5012, 'lng': 127.0263},
            {'name': '육회자매 강남점', 'address': '서울 강남구 테헤란로 123', 'lat': 37.5001, 'lng': 127.0365},
            {'name': '명동교자 강남점', 'address': '서울 강남구 강남대로 396', 'lat': 37.4998, 'lng': 127.0282},
            {'name': '본가 강남점', 'address': '서울 강남구 봉은사로 120', 'lat': 37.5045, 'lng': 127.0289},
            {'name': '청기와타운 강남점', 'address': '서울 강남구 역삼로 180', 'lat': 37.4967, 'lng': 127.0342},
            {'name': '마포갈매기 강남직영점', 'address': '서울 강남구 강남대로 358', 'lat': 37.4991, 'lng': 127.0279},
            {'name': '원조쌈밥집', 'address': '서울 강남구 테헤란로 156', 'lat': 37.5003, 'lng': 127.0378},
            {'name': '황소곱창 강남점', 'address': '서울 강남구 역삼로 175', 'lat': 37.4962, 'lng': 127.0339},
            {'name': '신사동 그 곱창', 'address': '서울 강남구 강남대로 160길 25', 'lat': 37.5178, 'lng': 127.0198},
            {'name': '온기정 강남점', 'address': '서울 강남구 테헤란로 129', 'lat': 37.5006, 'lng': 127.0368},
            {'name': '버거킹 강남우성점', 'address': '서울 강남구 테헤란로 152', 'lat': 37.5008, 'lng': 127.0375},
            {'name': '스시호시카이 강남', 'address': '서울 강남구 봉은사로 140', 'lat': 37.5052, 'lng': 127.0295},
            {'name': '도쿄등심 강남본점', 'address': '서울 강남구 강남대로 382', 'lat': 37.4995, 'lng': 127.0281},
            {'name': '만족오향족발 강남점', 'address': '서울 강남구 역삼로 165', 'lat': 37.4958, 'lng': 127.0335},
            {'name': '홍콩반점 강남역점', 'address': '서울 강남구 강남대로 340', 'lat': 37.4983, 'lng': 127.0277},
            {'name': '빕스 강남점', 'address': '서울 강남구 테헤란로 145', 'lat': 37.5005, 'lng': 127.0372},
            {'name': '애슐리 강남점', 'address': '서울 강남구 강남대로 350', 'lat': 37.4987, 'lng': 127.0278},
            {'name': '놀부부대찌개 강남점', 'address': '서울 강남구 역삼로 170', 'lat': 37.4960, 'lng': 127.0337},
            {'name': '고기리막국수 강남점', 'address': '서울 강남구 봉은사로 125', 'lat': 37.5048, 'lng': 127.0291},
            {'name': '청담골 순두부', 'address': '서울 강남구 테헤란로 135', 'lat': 37.5004, 'lng': 127.0370},
            {'name': '한신포차 강남역점', 'address': '서울 강남구 강남대로 365', 'lat': 37.4992, 'lng': 127.0280},
            {'name': '이삭토스트 강남점', 'address': '서울 강남구 역삼로 155', 'lat': 37.4955, 'lng': 127.0332},
            {'name': '스타벅스 강남R점', 'address': '서울 강남구 강남대로 390', 'lat': 37.4996, 'lng': 127.0283},
            {'name': '교촌치킨 강남점', 'address': '서울 강남구 테헤란로 160', 'lat': 37.5010, 'lng': 127.0380},
        ]

        # 홍대 카페 데이터 (25개)
        hongdae_cafes = [
            {'name': '앤트러사이트 연남점', 'address': '서울 마포구 연남로 79', 'lat': 37.5623, 'lng': 126.9245},
            {'name': '연남살롱', 'address': '서울 마포구 연남로 57', 'lat': 37.5615, 'lng': 126.9238},
            {'name': '밀도 연남점', 'address': '서울 마포구 연남로 85', 'lat': 37.5628, 'lng': 126.9248},
            {'name': '카페 레이어드 연남', 'address': '서울 마포구 연남로 45', 'lat': 37.5608, 'lng': 126.9232},
            {'name': '어니언 연남점', 'address': '서울 마포구 연남로 92', 'lat': 37.5632, 'lng': 126.9252},
            {'name': '커피한약방', 'address': '서울 마포구 월드컵북로2길 65', 'lat': 37.5568, 'lng': 126.9198},
            {'name': '서울앵무새 연남점', 'address': '서울 마포구 연남로 68', 'lat': 37.5618, 'lng': 126.9241},
            {'name': '취미카 연남', 'address': '서울 마포구 연남로 55', 'lat': 37.5612, 'lng': 126.9236},
            {'name': '마마스 브런치 클럽', 'address': '서울 마포구 월드컵북로 21', 'lat': 37.5545, 'lng': 126.9185},
            {'name': '믹스앤믹스 커피', 'address': '서울 마포구 연남로 75', 'lat': 37.5621, 'lng': 126.9243},
            {'name': '프릳츠 연남점', 'address': '서울 마포구 연남로 82', 'lat': 37.5626, 'lng': 126.9247},
            {'name': '러쉬 카페', 'address': '서울 마포구 월드컵북로2길 58', 'lat': 37.5565, 'lng': 126.9195},
            {'name': '카페 마호가니', 'address': '서울 마포구 연남로 63', 'lat': 37.5616, 'lng': 126.9239},
            {'name': '스틸북스 카페', 'address': '서울 마포구 연남로 48', 'lat': 37.5610, 'lng': 126.9234},
            {'name': '로우커피스탠드', 'address': '서울 마포구 월드컵북로 35', 'lat': 37.5552, 'lng': 126.9190},
            {'name': '카페 공명', 'address': '서울 마포구 연남로 88', 'lat': 37.5630, 'lng': 126.9250},
            {'name': '무드 연남', 'address': '서울 마포구 연남로 72', 'lat': 37.5620, 'lng': 126.9242},
            {'name': '언더프레셔 커피', 'address': '서울 마포구 월드컵북로2길 52', 'lat': 37.5562, 'lng': 126.9192},
            {'name': '멜로우 커피', 'address': '서울 마포구 연남로 50', 'lat': 37.5611, 'lng': 126.9235},
            {'name': '카페 36.5', 'address': '서울 마포구 연남로 95', 'lat': 37.5635, 'lng': 126.9255},
            {'name': '보틀팩토리', 'address': '서울 마포구 월드컵북로 42', 'lat': 37.5558, 'lng': 126.9193},
            {'name': '커피 리브레', 'address': '서울 마포구 연남로 60', 'lat': 37.5614, 'lng': 126.9237},
            {'name': '카페 레드', 'address': '서울 마포구 연남로 78', 'lat': 37.5622, 'lng': 126.9244},
            {'name': '스몰비어 브루잉', 'address': '서울 마포구 월드컵북로2길 45', 'lat': 37.5555, 'lng': 126.9188},
            {'name': '더벤티 연남점', 'address': '서울 마포구 연남로 42', 'lat': 37.5606, 'lng': 126.9230},
        ]

        # 을지로 노포 데이터 (25개)
        euljiro_restaurants = [
            {'name': '을지면옥', 'address': '서울 중구 을지로 118', 'lat': 37.5665, 'lng': 126.9912},
            {'name': '을지OB베어', 'address': '서울 중구 을지로 125', 'lat': 37.5668, 'lng': 126.9918},
            {'name': '안동장 칼국수', 'address': '서울 중구 을지로 132', 'lat': 37.5672, 'lng': 126.9925},
            {'name': '양미옥', 'address': '서울 중구 마른내로 68', 'lat': 37.5658, 'lng': 126.9905},
            {'name': '을지다락', 'address': '서울 중구 을지로 142', 'lat': 37.5678, 'lng': 126.9932},
            {'name': '노가리 슈퍼', 'address': '서울 중구 을지로 112', 'lat': 37.5662, 'lng': 126.9908},
            {'name': '충무로 양꼬치', 'address': '서울 중구 마른내로 75', 'lat': 37.5655, 'lng': 126.9902},
            {'name': '을지 금악어', 'address': '서울 중구 을지로 138', 'lat': 37.5675, 'lng': 126.9928},
            {'name': '광희 양곱창', 'address': '서울 중구 을지로 148', 'lat': 37.5680, 'lng': 126.9935},
            {'name': '신성옥', 'address': '서울 중구 마른내로 62', 'lat': 37.5660, 'lng': 126.9908},
            {'name': '을지 노포집', 'address': '서울 중구 을지로 128', 'lat': 37.5670, 'lng': 126.9920},
            {'name': '장수설렁탕', 'address': '서울 중구 마른내로 55', 'lat': 37.5652, 'lng': 126.9898},
            {'name': '밀면달인', 'address': '서울 중구 을지로 155', 'lat': 37.5682, 'lng': 126.9938},
            {'name': '을지 우동', 'address': '서울 중구 을지로 122', 'lat': 37.5667, 'lng': 126.9915},
            {'name': '충무로 닭한마리', 'address': '서울 중구 마른내로 82', 'lat': 37.5648, 'lng': 126.9895},
            {'name': '동대문 엽기떡볶이', 'address': '서울 중구 을지로 162', 'lat': 37.5685, 'lng': 126.9942},
            {'name': '을지 감자탕', 'address': '서울 중구 을지로 115', 'lat': 37.5663, 'lng': 126.9910},
            {'name': '평양냉면집', 'address': '서울 중구 마른내로 58', 'lat': 37.5656, 'lng': 126.9900},
            {'name': '황학동 순대타운', 'address': '서울 중구 을지로 168', 'lat': 37.5688, 'lng': 126.9945},
            {'name': '을지 대포집', 'address': '서울 중구 을지로 108', 'lat': 37.5660, 'lng': 126.9905},
            {'name': '충무로 갈비', 'address': '서울 중구 마른내로 88', 'lat': 37.5645, 'lng': 126.9892},
            {'name': '을지 소머리국밥', 'address': '서울 중구 을지로 135', 'lat': 37.5673, 'lng': 126.9926},
            {'name': '광장시장 빈대떡', 'address': '서울 중구 을지로 172', 'lat': 37.5690, 'lng': 126.9948},
            {'name': '을지 해장국', 'address': '서울 중구 을지로 105', 'lat': 37.5658, 'lng': 126.9902},
            {'name': '동묘 족발골목', 'address': '서울 중구 마른내로 92', 'lat': 37.5642, 'lng': 126.9888},
        ]

        # 맛집 데이터 리스트
        all_restaurants_data = [
            (categories[0], gangnam_restaurants),
            (categories[1], hongdae_cafes),
            (categories[2], euljiro_restaurants),
        ]

        # 각 카테고리별로 맛집 생성 및 템플릿 생성
        for category, restaurants_data in all_restaurants_data:
            restaurants = []
            for r in restaurants_data:
                restaurant, created = Restaurant.objects.get_or_create(
                    name=r['name'],
                    category=category,
                    defaults={
                        'address': r['address'],
                        'latitude': r['lat'],
                        'longitude': r['lng'],
                        'is_approved': True,
                        'created_by': test_user,
                    }
                )
                restaurants.append(restaurant)

            self.stdout.write(f'{category.name} 맛집 {len(restaurants)}개 준비 완료')

            # 빙고 템플릿 생성
            template, created = BingoTemplate.objects.get_or_create(
                title=f'{category.name} 빙고',
                category=category,
                defaults={
                    'description': category.description,
                    'is_active': True,
                }
            )

            if created:
                # 템플릿 아이템 생성 (25개)
                for position, restaurant in enumerate(restaurants[:25]):
                    BingoTemplateItem.objects.get_or_create(
                        template=template,
                        position=position,
                        defaults={'restaurant': restaurant}
                    )
                self.stdout.write(self.style.SUCCESS(f'템플릿 생성: {template.title}'))
            else:
                self.stdout.write(f'템플릿이 이미 존재합니다: {template.title}')

        self.stdout.write(self.style.SUCCESS('\n샘플 데이터 생성 완료!'))
        self.stdout.write('\n테스트 계정:')
        self.stdout.write('  - Username: testuser')
        self.stdout.write('  - Password: testpass123')
        self.stdout.write('\nAdmin 페이지: http://localhost:8000/admin/')
