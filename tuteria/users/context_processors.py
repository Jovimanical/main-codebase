# -*- coding: utf-8 -*-
import os
import datetime

from allauth.account.forms import LoginForm, ResetPasswordForm
from allauth.account.forms import SignupForm
import cloudinary
from django.contrib.sites.models import Site
from django.conf import settings
from django.db.models import Count, Sum
from django.core.cache import cache
from django.utils.functional import SimpleLazyObject

from config import const
from connect_tutor.models import BlogCategory, BlogArticle

# from django_redis import get_redis_connection
from external.models import SocialCount
from skills.models import Category
from gateway_client import TuteriaDetail
import requests


def get_static_assets():
    result = {"css": [], "js": []}
    response = requests.get(f"{settings.TUTERIA_CDN_URL}/asset-manifest.json")
    if response.status_code < 400:
        data = response.json()
        result["css"] = [x for x in data["entrypoints"] if x.endswith(".css")]
        result["js"] = [x for x in data["entrypoints"] if x.endswith(".js")]
    return result


static_assets = get_static_assets()


# redis_con = get_redis_connection('default')


def consts(request):
    search_placeholder = "What do you want to learn?"

    def first_set():
        # ff1 = cache.get('first_category_set')
        ff1 = None
        if not ff1:
            ff1 = (
                Category.objects.filter(priority__lte=10)
                .annotate(count=Count("skill"))
                .prefetch_related("skill_set")
            )
            cache.set("first_category_set", ff1, 60 * 60 * 24)
        return ff1

    def final_set():
        # ff2 = cache.get('final_category_set')
        ff2 = None
        if not ff2:
            ff2 = (
                Category.objects.filter(priority__gt=10)
                .annotate(count=Count("skill"))
                .prefetch_related("skill_set")
            )
            cache.set("final_category_set", ff2, 60 * 60 * 24)
        return ff2

    def tuteria_site():
        return Site.objects.get_current()

    if os.getenv("DJANGO_CONFIGURATION") == "Local":
        local_env = True
    else:
        local_env = False
    user_profile = const.get_cached_user_profile(request)
    date_to_launch = datetime.date(2015, 6, 30) - datetime.date.today()
    if request.user.is_authenticated:
        first_name = request.user.first_name or ""
        user_name = first_name.title()
    else:
        user_name = ""
    # categories = Category.objects.annotate(count=Count('skill')).prefetch_related('skill_set')
    return dict(
        SITE_NAME="Tuteria",
        ICON_EFFECTS=dict(
            format="png",
            type="facebook",
            transformation=[
                dict(
                    height=95,
                    width=95,
                    crop="thumb",
                    gravity="face",
                    effect="sepia",
                    radius=20,
                ),
                dict(angle=10),
            ],
        ),
        TUTOR_THUMBNAIL={
            "fetch_format": "auto",
            "class": "thumbnail inline",
            "format": "jpg",
            "crop": "fill",
            "height": 32,
            "width": 45,
        },
        SUBJECT_THUMBNAIL={
            "fetch_format": "auto",
            "class": "thumbnail inline",
            "format": "jpg",
            "crop": "fill",
            "height": 32,
            "width": 32,
        },
        USER_PROFILE_THUMBAIL={
            "fetch_format": "auto",
            "class": "img-circle",
            "format": "jpg",
            "crop": "fill",
            "height": 100,
            "width": 100,
        },
        USER_PROFILE_THUMBAIL_80={
            "fetch_format": "auto",
            "class": "img-circle",
            "format": "jpg",
            "crop": "fill",
            "height": 80,
            "width": 80,
        },
        USER_PROFILE_THUMBNAIL_DESKTOP={
            "fetch_format": "auto",
            "class": "img-circle",
            "format": "jpg",
            "crop": "fill",
            "height": 130,
            "width": 130,
        },
        THUMBNAIL={
            "fetch_format": "auto",
            "class": "thumbnail inline ",
            "format": "jpg",
            "crop": "fill",
            "height": 150,
            "width": 200,
        },
        RATING_THUMBNAIL={
            "fetch_format": "auto",
            "class": "img-circle",
            "format": "jpg",
            "crop": "fill",
            "height": 68,
            "width": 68,
        },
        TS_THUMBNAIL={
            "fetch_format": "auto",
            "class": "img-circle media-object",
            "format": "jpg",
            "crop": "fill",
            "height": 120,
            "width": 110,
            "quality": 85,
            "gravity": "faces",
        },
        PAYMENT_THUMBNAIL={
            "fetch_format": "auto",
            "class": "img-circle media-object",
            "format": "jpg",
            "crop": "fill",
            "height": 80,
            "width": 80,
        },
        AVATAR={
            "fetch_format": "auto",
            "class": "img-circle",
            "format": "jpg",
            "crop": "fill",
            "height": 30,
            "width": 30,
        },
        MINI_AVATAR={
            "fetch_format": "auto",
            "class": "media-object img-circle",
            "format": "jpg",
            "crop": "fill",
            "height": 40,
            "width": 40,
        },
        BOOKING_AVATAR={
            "fetch_format": "auto",
            "class": "media-object img-circle",
            "format": "jpg",
            "crop": "fill",
            "height": 60,
            "width": 60,
        },
        local_env=local_env,
        PROFILE_THUMBNAIL={
            "fetch_format": "auto",
            "class": "img-circle",
            "format": "jpg",
            "crop": "fill",
            "height": 225,
            "width": 225,
        },
        tuteria_details=TuteriaDetail(),
        SEARCH_THUMBNAIL={
            "crop": "fill",
            "height": 161,
            "width": 227,
            "fetch_format": "auto",
            "class": "img-thumbnail3",
            "quality": 85,
            "radius": 5,
            # "crop": "fill", "height": 400, "width": 400, "fetch_format,:"auto:"class": "img-thumbnail3", "quality": 75,
            "gravity": "faces",
        },
        SEARCH_THUMBNAIL_MOBILE={"crop": "fill", "height": 64, "width": 64},
        SQUARE_PROFILE_THUMBNAIL={
            "fetch_format": "auto",
            "class": "img-thumbnail",
            "format": "jpg",
            "crop": "fill",
            "height": 225,
            "width": 225,
        },
        REQUEST_AVATAR={
            "crop": "fill",
            "height": 110,
            "width": 110,
            "fetch_format": "auto",
            "class": "img-thumbnail3",
            "quality": 85,
            "gravity": "faces",
            "format": "jpg",
        },
        search_placeholder=search_placeholder,
        # tuteria_categories=categories,
        tuteria_categories=dict(
            featured=SimpleLazyObject(first_set), secondary=SimpleLazyObject(final_set)
        ),
        CLOUDINARY_CLOUD_NAME=cloudinary.config().cloud_name,
        site=SimpleLazyObject(tuteria_site),
        login_form=LoginForm(),
        signup_form=SignupForm(initial={"referral_code": request.referral_code}),
        reset_form=ResetPasswordForm(),
        request_user_profile=user_profile,
        SHORT_TTL=60 * 5,
        MEDIUM_TTL=60 * 15,
        LONG_TTL=60 * 60 * 24,  # 1 day
        # facebook_counter=SocialCount.objects.get_or_create(network_type=SocialCount.FACEBOOK)[0],
        # google_counter=SocialCount.objects.get_or_create(network_type=SocialCount.GOOGLE)[0],
        # twitter_counter=SocialCount.objects.get_or_create(network_type=SocialCount.TWITTER)[0],
        # total_invites=SocialCount.objects.aggregate(count=Sum('count')),
        home_page_url="www.{}".format(tuteria_site().domain),
        django_conf=os.getenv("DJANGO_CONFIGURATION", "Local"),
        LAUNCH_DAY_REMAINING=date_to_launch.days,
        blog_categories=[],
        featured_article=None,
        og_title="Find the Perfect Tutor Near You | Welcome to Tuteria",
        og_description=(
            "Tuteria helps you find, evaluate and book lessons with quality private "
            "tutors near you for whatever you wish to learn. From academic subjects to various exams "
            "and even skills like music, bead-making, photography, dance and more!"
        ),
        meta_title="Get ₦1,500 off your first lesson!",
        meta_description=(
            "Click here now to join {} on Tuteria and get the best tutors"
            " in your area for any subject, skill or exam."
        ).format(user_name),
        use_new_tutor_flow=settings.USE_NEW_FLOW,
        debug=False,
        # debug=False,
        tutor_client_cdn=settings.TUTERIA_CDN_URL,
        static_assets=static_assets
    )

    # og_title="Earn Extra Money Teaching People What You Love",
    # og_description=("From academic subjects to various exams and even skills like music, bead-making "
    # "photography, dance, public speaking and more - Tuteria helps you earn money with your free time by "
    # "teaching people in your community. Apply Now! Application is now open!")
    # )
