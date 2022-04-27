from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django_quiz.quiz.models import Quiz
from skills.api import SkillSerializer, CategorySerializer, TagSerializer
from skills.models import Skill, Category, SkillCertificate
from taggit.models import Tag

CATEGORY_CACHE_TIMEOUT = 60 * 60 * 24
ALL_CATEGORIES = "all_categories"
CATEGORY_JSON = "category_json"
SKILL_WITH_TUTOR = "skill_with_tutor"
CERTIFICATES = "skill_certificates"
TAGS_JSON = "all_tags"
FACEBOOK_SHARE = "facebook_count"


def get_cached_user_profile(request):
    if hasattr(request, "user"):
        if request.user.is_authenticated:
            # USER_PROFILE = "%s_profile" % request.user.email
            # profile = cache.get(USER_PROFILE)
            # if profile is None:
            # profile = request.user.profile
            # cache.set(USER_PROFILE, profile, CATEGORY_CACHE_TIMEOUT)
            # return profile
            try:
                return request.user.profile
            except:
                return ""
            # response
    return ""


def cached_category_skills(user, category_slug=None):
    # CATEGORY_SKILLS = "%s_skills_json" % category_slug
    # skills = cache.get(CATEGORY_SKILLS)
    # if skills is None:
    if category_slug:
        r = Skill.objects.allowed_skills(user, category_slug)
    else:
        r = Skill.objects.skill_with_quizzes(user)
    skills = SkillSerializer(r, many=True).data
    # cache.set(CATEGORY_SKILLS, skills, 60*4)
    return skills


def cached_category_skills2(user, category_slug, potential_subjects):
    # CATEGORY_SKILLS = "%s_skills_json" % category_slug
    # skills = cache.get(CATEGORY_SKILLS)
    # if skills is None:
    subjects = potential_subjects or []
    r = Skill.objects.allowed_skills_preselect(user, category_slug, subjects)
    skills = SkillSerializer(r, many=True).data
    # cache.set(CATEGORY_SKILLS, skills, 60*4)
    return skills


def get_cached_questions(quiz_url):
    questions = cache.get(quiz_url)
    if questions is None:
        quiz = get_object_or_404(Quiz, url=quiz_url)
        questions = quiz.get_questions()
        cache.set(quiz_url, questions, CATEGORY_CACHE_TIMEOUT)
    return questions


def get_cached_tags_json():
    data = cache.get(TAGS_JSON)
    if data is None:
        data = TagSerializer(Tag.objects.all(), many=True).data
        cache.set(CATEGORY_JSON, data, 60 * 5)
    return data


def get_cached_category_json():
    # data = cache.get(CATEGORY_JSON)
    # if data is None:
    data = CategorySerializer(Category.objects.all(), many=True).data
    # cache.set(CATEGORY_JSON, data, CATEGORY_CACHE_TIMEOUT)
    return data


def get_cached_category_json2(profile_subjects):
    # data = cache.get(CATEGORY_JSON)
    # if data is None:
    skills = Skill.objects.filter(name__in=profile_subjects).values_list(
        "categories", flat=True
    )
    o = list(set(skills))
    data = CategorySerializer(Category.objects.filter(id__in=o), many=True).data
    # cache.set(CATEGORY_JSON, data, CATEGORY_CACHE_TIMEOUT)
    return data


def get_cached_skills_with_tutors():
    data = cache.get(SKILL_WITH_TUTOR)
    if data is None:
        data = Skill.objects.with_tutor()
        cache.set(SKILL_WITH_TUTOR, data, 60 * 3)
    return data


def get_cached_certificates():
    data = cache.get(CERTIFICATES)
    if data is None:
        data = SkillCertificate.objects.all()
        cache.set(CERTIFICATES, data, 60 * 5)
    return data
