from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"users", views.AdminUserViewSet)
router.register(r"requests", views.RequestViewSet)
