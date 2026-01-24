from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator, MinLengthValidator


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Restaurant(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="restaurants"
    )
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=500)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    kakao_place_id = models.CharField(max_length=100, blank=True)
    place_url = models.URLField(blank=True)
    is_approved = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="suggested_restaurants"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class BingoTemplate(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="templates"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class BingoTemplateItem(models.Model):
    template = models.ForeignKey(
        BingoTemplate, on_delete=models.CASCADE, related_name="items"
    )
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.CASCADE, related_name="template_items"
    )
    position = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(24)]
    )

    class Meta:
        unique_together = [["template", "position"], ["template", "restaurant"]]
        ordering = ["position"]

    def __str__(self):
        return f"{self.template.title} - Position {self.position}: {self.restaurant.name}"


class BingoBoard(models.Model):
    TARGET_CHOICES = [
        (1, "1 Line"),
        (3, "3 Lines"),
        (5, "5 Lines (Full)"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bingo_boards")
    template = models.ForeignKey(
        BingoTemplate, on_delete=models.CASCADE, related_name="boards"
    )
    target_line_count = models.IntegerField(choices=TARGET_CHOICES, default=1)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s {self.template.title} Board"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews")
    bingo_board = models.ForeignKey(
        BingoBoard, on_delete=models.CASCADE, related_name="reviews"
    )
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.CASCADE, related_name="reviews"
    )
    image = models.ImageField(upload_to="reviews/")
    content = models.TextField(validators=[MinLengthValidator(10)])
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    visited_date = models.DateField()
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["bingo_board", "restaurant"]

    def __str__(self):
        return f"{self.user.username}'s review for {self.restaurant.name}"


class UserProfile(models.Model):
    """사용자 프로필 (닉네임 등 사용자 설정 정보)"""
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='profile'
    )
    nickname = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


class SocialAccount(models.Model):
    """소셜 로그인 연동 정보"""
    PROVIDER_CHOICES = [
        ('kakao', 'Kakao'),
        ('google', 'Google'),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='social_accounts'
    )
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    provider_user_id = models.CharField(max_length=100)
    connected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['provider', 'provider_user_id']]
        indexes = [
            models.Index(fields=['provider', 'provider_user_id']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.provider}"
