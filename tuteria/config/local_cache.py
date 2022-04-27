from django.core.cache import cache


class LocalCache(object):

    @classmethod
    def populate_user_cache(cls, user):
        # from users.models import User
        # query = User.objects.filter(pk=user_id).select_related('profile')
        # import pdb; pdb.set_trace()
        # result = query[0]
        # profile = result.profile
        keys = [f"User_{getattr(user,x)}" for x in ["slug", "id", "email"]]
        cache.set_many({x: [user, user.profile] for x in keys}, timeout=None)

    @classmethod
    def get_user_cache(cls, cache_key, key, param):
        result = cache.get(cache_key)
        if not result:
            instance = User.objects.filter(**{key: param}).first()
            result = [instance, instance.profile]
            cache.set(cache_key, result, timeout=None)
        return result
