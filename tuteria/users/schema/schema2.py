import graphene
from graphene_django.types import DjangoObjectType
from config.local_cache import LocalCache
from users import models


class UserProfile(DjangoObjectType):

    class Meta:
        model = models.UserProfile
        exclude_fields = ["image", "video"]


class User(DjangoObjectType):
    profile = graphene.Field(UserProfile)

    class Meta:
        model = models.User
        exclude_fields = ["country"]

    def resolve_profile(self, info, **kwargs):
        _, profile = LocalCache.get_user_cache(info.context, "slug", self.slug)
        return profile


class Query(object):
    cached_user = graphene.Field(User, slug=graphene.String())

    def resolve_cached_user(self, info, **kwargs):
        key = list(kwargs.keys())[0]
        value = kwargs[key]
        user, _ = LocalCache.get_user_cache(info.context, key, value)
        return user
