# Create your views here.
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.linkedin_oauth2.views import LinkedInOAuth2Adapter
from rest_auth.registration.views import SocialLoginView
from rest_framework import viewsets

from django.contrib.auth import get_user_model

from .mixins import DefaultsMixin
from serializers.users import UserSerializer, RequestSerializer
from external.models import BaseRequestTutor

User = get_user_model()


class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter


class LinkedinLogin(SocialLoginView):
    adapter_class = LinkedInOAuth2Adapter


class AdminUserViewSet(DefaultsMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    lookup_field = "pk"
    serializer_class = UserSerializer
    queryset = User.objects.all()
    search_fields = ("email", "first_name", "last_name")
    ordering_fields = ("pk",)


class RequestViewSet(DefaultsMixin, viewsets.ModelViewSet):
    queryset = BaseRequestTutor.objects.completed()
    serializer_class = RequestSerializer
    ordering_fields = "created"
    search_fields = ("email", "first_name", "slug")
