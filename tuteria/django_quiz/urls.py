# -*- coding: utf-8 -*-
import json
from django.core.handlers.wsgi import WSGIRequest

from django.db.models.query_utils import Q
from django.views.decorators.csrf import csrf_exempt
from users.models.models1 import User
from allauth.account.decorators import verified_email_required
from django.conf.urls import url
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.core.cache import cache
from django.urls import reverse
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.cache import cache_page
from django_languages.languages import LANGUAGES
from rest_framework import generics, mixins
from taggit.models import Tag

from .api import QuestionSerializer
from config import const
from .quiz.models import Quiz
from .multichoice.models import MCQuestion
from skills import api as skills_api
from skills.models import Skill, TutorSkill
from users.forms import PhoneNumberForm
from skills import models as skill_models
from skills.api import SkillSerializer


def repopulate_quiz_data(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        result = Quiz.create_subject_and_quiz(body)
        return JsonResponse({"status": True, "data": result})
    return JsonResponse({"status": False, "error": "Not allowed"}, status=400)


def ensure_creation_of_quiz_array(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        result = Quiz.bulk_create_subject_quiz_info(body["info"])
        return JsonResponse({"status": True, "data": result})
    return JsonResponse({"status": False, "error": "Not allowed"}, status=400)


def get_user_quizzes(request):
    slug = request.GET.get("slug")
    email = request.GET.get("email")
    query = {}
    if slug:
        query["slug"] = slug
    if email:
        query["email"] = email
    user = User.objects.filter(Q(**query)).first()
    if not user:
        return JsonResponse({"status": False, "msg": "Invalid user"}, status=400)
    skills = const.cached_category_skills(user)
    return JsonResponse({"status": True, "data": skills})


@login_required
def get_skills(request, category_slug):
    profile = request.user.profile
    if request.GET.get("url_params", ""):
        skills = const.cached_category_skills2(
            request.user, category_slug, profile.potential_subjects
        )
    else:
        skills = const.cached_category_skills(request.user, category_slug)
    return JsonResponse(skills, safe=False)


def get_news(request):
    news = [
        {
            "link": "http://www.forbes.com/sites/tobyshapshak/2016/05/07/exclusive-real-solutions-to-real-problems-named-in-innovation-prize-for-africa-2016-finalists/#79a4cd3227a9",
            "logo": "img/press/forbes.png",
            "text": "Real Solutions To Real Problems - Tuteria, Named In Innovation Prize For Africa 2016 Finalists",
            "date": "May 07, 2016",
        },
        {
            "link": "https://drive.google.com/file/d/0BzFqV_tFvLfGUDVnc1djWDFBbXc/view",
            "logo": "img/press/channels.png",
            "text": "Godwin Benson, CEO Tuteria, Innovation in Technology & Education",
            "date": "Sept. 07, 2015",
        },
        {
            "link": "http://techcabal.com/2015/09/22/godwin-benson-talks-about-his-hyperlocal-marketplace-for-tutors/",
            "logo": "img/press/techcabal.png",
            "text": "Godwin Benson, Founder of Tuteria Talks About His Hyperlocal Marketplace For Tutors",
            "date": "Sept. 22, 2015",
        },
        {
            "link": "http://www.youtube.com/watch?v=VDGzpJi9fM4",
            "logo": "img/press/cctv.jpg",
            "text": "Nigerian starts online platform for tutors - Featured on CCTV, Channels TV & Aljazeera",
            "date": "Oct. 7, 2015",
        },
        {
            "link": "http://www.microsoft.com/en-ng/mobile/phone/lumia535-dual-sim/",
            "logo": "img/press/microsoft.png",
            "text": "Godwin Benson, Founder of Tuteria wins Microsoft's Passion to Empire Campaign",
            "date": "Apr 27, 2015",
        },
        {
            "link": "http://ynaija.com/class-2015-nigerias-100-innovative-persons-technology/",
            "logo": "img/press/ynaija.jpg",
            "text": "Tuteria Named as Top 100 Most Innovative Startups in Nigeria. Godwin Benson at Number 10.",
            "date": "Feb 18, 2015",
        },
        {
            "link": "http://www.bellanaija.com/2015/05/14/budding-entrepreneurs-meet-the-5-winners-of-the-microsoft-lumia-535-dual-sim-passion-to-empire-campaign/",
            "logo": "img/press/bellanaija.jpg",
            "text": "Budding Entrepreneurs! Meet the winners of Microsoft Passion to Empire Campaign",
            "date": "May 14, 2015",
        },
        {
            "link": "https://www.facebook.com/NiaraInspireAfrica/posts/851844311540501",
            "logo": "img/press/niara.jpg",
            "text": "Tuteria, 1st Runner Up at Niara Inspire Africa Startup Pitch Competition",
            "date": "Jan 28, 2015",
        },
        {
            "link": "hhttps://www.facebook.com/IntelNigeria/photos/a.277443308998129.66943.259379530804507/821101384632316/?type=1&pnref=story",
            "logo": "img/press/intel.png",
            "text": "Meet Godwin Benson, winner of the Microsoft Passion to Empire Campaign",
            "date": "May 18, 2015",
        },
        {
            "link": "http://www.spreadmediang.com/passion-to-empire-winners-business-pitch/",
            "logo": "img/press/spreadmedia.png",
            "text": "The 5 Winners of The “From Passion to Empire” Campaign Pitch Their Business Ideas.",
            "date": "May 28, 2015",
        },
        {
            "link": "http://techcabal.com/2015/06/08/nigeria-based-neighbourhood-peer-education-platform-tuteria-launches-tomorrow/",
            "logo": "img/press/techcabal.png",
            "text": "NIGERIA-BASED NEIGHBOURHOOD PEER-EDUCATION PLATFORM, TUTERIA, LAUNCHES TOMORROW",
            "date": "June 9, 2015",
        },
    ]
    return JsonResponse(dict(news=news), safe=False)


class QuizList(generics.ListAPIView):
    model = MCQuestion
    serializer_class = QuestionSerializer

    def get_queryset(self):
        # questions = const.get_cached_questions(self.args[0])
        self.quiz = get_object_or_404(Quiz, url=self.args[0])
        return self.quiz.get_questions()


class TagList(generics.ListAPIView):
    model = Tag
    serializer_class = skills_api.TagSerializer
    queryset = Tag.objects.all()


class SkillCertificateList(generics.ListAPIView):
    model = skill_models.SkillCertificate
    serializer_class = skills_api.SkillCertificateSerializer
    queryset = skill_models.SkillCertificate.objects.all()


@login_required
def validate_quiz(request):
    if request.is_ajax():
        body = json.loads(request.body)
        passed = body.get("status", False)
        if passed:
            request.user.profile.began_application()
            messages.info(request, "Welcome to the Tutor Registration Page")
            return redirect(reverse("registration:tutor_credentials"))

    return HttpResponse(
        json.dumps({"status": "invalid"}), content_type="application/json"
    )


urlpatterns = (
    # URL pattern for the UserListView  # noqa
    url(
        regex=r"^questions/([\w-]+)/$",
        view=cache_page(const.CATEGORY_CACHE_TIMEOUT)(QuizList.as_view()),
        name="tutor-registration-quiz",
    ),
    url(r"^quiz-result", validate_quiz, name="validate_quiz"),
    url(
        r"^categories/(?P<category_slug>[\w.@+-]+)",
        get_skills,
        name="api_category_skills",
    ),
    url(
        r"^get-quizzes/$",
        get_user_quizzes,
        name="api_user_quizzes",
    ),
    url(
        r"^repopulate-quiz/$",
        csrf_exempt(repopulate_quiz_data),
        name="populate_quiz_data",
    ),
    url(
        r"^ensure-quiz-creation/$",
        csrf_exempt(ensure_creation_of_quiz_array),
        name="ensure-quiz-creation",
    ),
    url(r"^tags/$", TagList.as_view(), name="api_tags"),
    url(r"^certificates/$", SkillCertificateList.as_view(), name="api_certificates"),
    url(r"^news/$", get_news, name="api_news"),
)
