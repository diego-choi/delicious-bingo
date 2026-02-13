from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """로그인/회원가입 brute force 방지를 위한 Rate Limiter"""
    scope = 'auth'
