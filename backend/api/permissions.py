from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Staff 사용자만 접근 가능한 권한 클래스
    """
    message = '관리자 권한이 필요합니다.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )
