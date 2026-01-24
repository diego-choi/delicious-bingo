"""카카오 OAuth 서비스"""
import os
import requests
import logging
from django.contrib.auth.models import User
from django.db import transaction
from .models import SocialAccount, UserProfile

logger = logging.getLogger(__name__)

KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token'
KAKAO_USER_INFO_URL = 'https://kapi.kakao.com/v2/user/me'


class KakaoOAuthService:
    """카카오 OAuth2 인증 서비스"""

    @staticmethod
    def get_kakao_token(code: str, redirect_uri: str) -> dict:
        """인가 코드로 액세스 토큰 발급"""
        client_id = os.environ.get('KAKAO_REST_API_KEY', '')
        client_secret = os.environ.get('KAKAO_CLIENT_SECRET', '')

        if not client_id:
            raise ValueError('KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.')

        data = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'code': code,
        }

        # Client Secret이 설정된 경우 추가
        if client_secret:
            data['client_secret'] = client_secret

        # 디버깅용 로깅
        logger.info(f'Kakao token request - redirect_uri: {redirect_uri}, code: {code[:20]}...')

        try:
            response = requests.post(KAKAO_TOKEN_URL, data=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.Timeout:
            logger.error('Kakao token request timeout')
            raise ValueError('카카오 서버 응답 시간이 초과되었습니다.')
        except requests.HTTPError as e:
            error_data = {}
            try:
                error_data = e.response.json() if e.response else {}
            except Exception:
                pass
            logger.error(f'Kakao token request failed: {e}, response: {error_data}')
            error_desc = error_data.get('error_description', '토큰 발급 실패')
            error_code = error_data.get('error', '')
            raise ValueError(f'카카오 인증 실패: {error_desc} ({error_code})')

    @staticmethod
    def get_kakao_user_info(access_token: str) -> dict:
        """액세스 토큰으로 사용자 정보 조회"""
        headers = {
            'Authorization': f'Bearer {access_token}',
        }

        try:
            response = requests.get(KAKAO_USER_INFO_URL, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.Timeout:
            logger.error('Kakao user info request timeout')
            raise ValueError('카카오 서버 응답 시간이 초과되었습니다.')
        except requests.HTTPError as e:
            logger.error(f'Kakao user info request failed: {e}')
            raise ValueError('사용자 정보 조회에 실패했습니다.')

    @staticmethod
    def get_or_create_user(kakao_user_info: dict) -> tuple:
        """
        카카오 사용자 정보로 User 생성 또는 조회

        Returns:
            tuple: (user, is_new_user, social_account)
        """
        # Kakao ID 검증
        raw_kakao_id = kakao_user_info.get('id')
        if not raw_kakao_id:
            raise ValueError('카카오 사용자 ID를 받지 못했습니다.')
        kakao_id = str(raw_kakao_id)

        kakao_account = kakao_user_info.get('kakao_account', {})
        properties = kakao_user_info.get('properties', {})
        profile = kakao_account.get('profile', {})

        # 닉네임: kakao_account.profile.nickname 또는 properties.nickname
        nickname = profile.get('nickname') or properties.get('nickname', '')
        email = kakao_account.get('email', '')

        logger.info(f'Kakao user info - nickname: {nickname}, email: {email}')

        # 1. 기존 소셜 계정 확인
        social_account = SocialAccount.objects.filter(
            provider='kakao',
            provider_user_id=kakao_id
        ).select_related('user').first()

        if social_account:
            return social_account.user, False, social_account

        # 2. 이메일로 기존 계정 확인 (자동 연동)
        # 보안 주의: 이메일 기반 자동 연동은 카카오에서 검증된 이메일만 사용
        existing_user = None
        is_email_verified = kakao_account.get('is_email_verified', False)
        if email and is_email_verified:
            existing_user = User.objects.filter(email=email).first()

        if existing_user:
            # 기존 계정에 소셜 계정 연결
            with transaction.atomic():
                social_account = SocialAccount.objects.create(
                    user=existing_user,
                    provider='kakao',
                    provider_user_id=kakao_id,
                )
                # 프로필이 없으면 생성
                UserProfile.objects.get_or_create(
                    user=existing_user,
                    defaults={'nickname': nickname}
                )
            return existing_user, False, social_account

        # 3. 신규 사용자 생성 (트랜잭션으로 원자적 처리)
        with transaction.atomic():
            username = KakaoOAuthService._generate_unique_username('kakao', kakao_id)

            new_user = User.objects.create_user(
                username=username,
                email=email,
                password=None,  # 소셜 로그인 사용자는 비밀번호 없음
            )

            # 사용자 프로필 생성 (닉네임은 카카오 닉네임으로 초기화)
            UserProfile.objects.create(
                user=new_user,
                nickname=nickname,
            )

            social_account = SocialAccount.objects.create(
                user=new_user,
                provider='kakao',
                provider_user_id=kakao_id,
            )

        return new_user, True, social_account

    @staticmethod
    def _generate_unique_username(provider: str, provider_user_id: str) -> str:
        """
        소셜 계정 정보 기반 고유한 username 생성

        형식: {provider}_{provider_user_id}
        예시: kakao_1234567890
        """
        username = f"{provider}_{provider_user_id}"

        # Django username 최대 길이: 150자 (충분함)
        # 혹시 중복이 있을 경우 대비 (거의 발생하지 않음)
        if User.objects.filter(username=username).exists():
            counter = 1
            while User.objects.filter(username=f"{username}_{counter}").exists():
                counter += 1
            username = f"{username}_{counter}"

        return username
