from django.core.cache import cache

from skills.models import Category


CATEGORY_CACHE_TIMEOUT = 60 * 60 * 24


def get_cached_category_with_skill(state):
    slug = "{}_CATEGORIES".format(state)
    categories = cache.get(slug)
    if categories is None:
        cat = Category.objects.with_active_skills(state)[:9]
        result = [
            dict(
                name=category.name,
                slug=category.slug,
                skills=category.skill_set.all()
                .by_state(state)
                .exclude(active_skills=None)
                .order_by("-active_skills")[:5],
            )
            for category in cat
        ]
        categories = zip(result[0::3], result[1::3], result[2::3])
        cache.set(slug, categories, CATEGORY_CACHE_TIMEOUT)
    return categories
