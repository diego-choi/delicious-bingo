from django.contrib import admin
from .models import Category, Restaurant, BingoTemplate, BingoTemplateItem, BingoBoard, Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "description"]
    search_fields = ["name"]


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "address", "is_approved", "created_at"]
    list_filter = ["category", "is_approved"]
    search_fields = ["name", "address"]
    list_editable = ["is_approved"]


class BingoTemplateItemInline(admin.TabularInline):
    model = BingoTemplateItem
    extra = 1


@admin.register(BingoTemplate)
class BingoTemplateAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "is_active", "created_at"]
    list_filter = ["category", "is_active"]
    search_fields = ["title"]
    inlines = [BingoTemplateItemInline]


@admin.register(BingoBoard)
class BingoBoardAdmin(admin.ModelAdmin):
    list_display = ["user", "template", "target_line_count", "is_completed", "created_at"]
    list_filter = ["is_completed", "target_line_count"]
    search_fields = ["user__username", "template__title"]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["user", "restaurant", "rating", "visited_date", "is_public"]
    list_filter = ["rating", "is_public", "visited_date"]
    search_fields = ["user__username", "restaurant__name", "content"]
