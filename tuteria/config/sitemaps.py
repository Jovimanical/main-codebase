from django.contrib import sitemaps
from django.urls import reverse
from django.core.cache import cache
from skills.models import Skill, TutorSkill
from users.models import states
from django.utils.text import slugify
from external.models import BaseRequestTutor


def get_active_skills():
    s = cache.get("SITEMAP_TSSKILLS")
    if s is None:
        s = TutorSkill.objects.active()
        cache.set("SITEMAP_TSSKILLS", s, 60 * 24 * 30)
    return s


class StaticViewSitemap(sitemaps.Sitemap):
    priority = 0.5
    changefreq = "daily"

    def items(self):
        return ["home", "become_tutor", "why_use", "discounts", "policies", "terms"]

    def location(self, item):
        return reverse(item)


class TutoringJobsSitemaps(sitemaps.Sitemap):
    changefreq = "daily"
    priority = 0.7

    def items(self):
        return BaseRequestTutor.objects.all().qualified()

    def location(self, obj):
        return obj.job_absolute_url()


class RequestSubjectsSitemap(sitemaps.Sitemap):
    priority = 0.6

    def items(self):
        return Skill.objects.with_tutor()

    def location(self, item):
        return reverse("skill_only_view", args=[item.slug])


class StateOnly(object):

    def __init__(self, state):
        self.state = state


class SkillWithState(object):

    def __init__(self, skill, state):
        self.skill = skill
        self.state = state


class SkillWithStateSitemap(sitemaps.Sitemap):
    priority = 0.6
    changefreq = "weekly"

    def items(self):
        v = []
        for x in Skill.objects.with_tutor():
            for y in states:
                v.append(SkillWithState(x, slugify(y)))
        return v

    def location(self, item):
        return reverse("state_skill_view", args=[item.skill.slug, item.state])


class StateOnlySitemap(sitemaps.Sitemap):
    priority = 0.6
    changefreq = "weekly"

    def items(self):
        return [slugify(y) for y in states]

    def location(self, item):
        return reverse("state_view", args=[item])


def my_sitemaps():
    info_dict = {"queryset": get_active_skills()}
    return {
        "static": StaticViewSitemap,
        "skills": RequestSubjectsSitemap,
        "tutor_skill": sitemaps.GenericSitemap(info_dict, priority=0.6),
        "state_skills": SkillWithStateSitemap,
        "tutoring_jobs": TutoringJobsSitemaps,
        "state": StateOnlySitemap,
    }
