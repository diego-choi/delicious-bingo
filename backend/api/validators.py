from django.core.exceptions import ValidationError


def validate_image_file_size(image):
    """이미지 파일 크기 검증 (최대 5MB)"""
    max_size = 5 * 1024 * 1024  # 5MB
    if image.size > max_size:
        raise ValidationError('이미지 파일 크기는 5MB 이하여야 합니다.')
