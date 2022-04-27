from django.contrib import admin

# Register your models here.
from helps.models import Category, Article


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    pass


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ["question", "pk", "category"]
