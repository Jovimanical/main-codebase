from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.reverse import reverse

from external.models import BaseRequestTutor

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    # full_name = serializers.CharField(source='get_full_name', read_only=True)
    links = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "slug",
            "is_active",
            "links",
        )

    def get_links(self, obj):
        request = self.context["request"]
        username = obj.slug
        return {"self": reverse("user-detail", kwargs={"pk": obj.pk}, request=request)}


class RequestSerializer(serializers.ModelSerializer):
    # full_name = serializers.CharField(source='get_full_name', read_only=True)
    links = serializers.SerializerMethodField()

    class Meta:
        model = BaseRequestTutor
        fields = (
            "id",
            "slug",
            "email",
            "first_name",
            "last_name",
            "links",
            "created",
            "number",
            "request_subjects",
            "state",
        )

    def get_links(self, obj):
        request = self.context["request"]
        return {
            "user": reverse("user-detail", kwargs={"pk": obj.user_id}, request=request),
            "self": reverse(
                "baserequesttutor-detail", kwargs={"pk": obj.pk}, request=request
            ),
        }
