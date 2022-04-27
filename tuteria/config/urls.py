# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import logging
import os

from django.contrib.staticfiles.storage import staticfiles_storage
from django.contrib.sitemaps.views import sitemap

# from fastsitemaps.views import sitemap
from django.conf import settings

from django.conf.urls import include, url

# from django.urls import include, path
from django.conf.urls.static import static
from django.http.response import FileResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, RedirectView
from django.http import JsonResponse
import django.contrib.auth.views
from allauth.account import urls

# import notifications
from .sitemaps import my_sitemaps
from payroll.admin import payroll_admin
from users.views import get_areas_in_region, SignupView

# Uncomment the next two lines to enable the admin:
from bookings.views import BookingPageView
import json

from django_js_reverse.views import urls_js
from django.contrib import admin
from graphene_django.views import GraphQLView
from users.admin import tutor_admin, tutor_success_admin
from bookings.admin import customer_success_admin
from external import schema

admin.autodiscover()
logger = logging.getLogger(__name__)


def mailgun_open(request):
    get_req = request.POST
    params = {
        "event": get_req.get("event"),
        "recipient": get_req.get("recipient"),
        "timestamp": get_req.get("timestamp"),
        "tag": get_req.get("tag"),
        "url": get_req.get("url"),
    }
    return JsonResponse(params)


@csrf_exempt
def postscript(request):
    logger.info(request.POST)
    my_file = open("myfile.html", "w+")
    my_file.write(json.dumps(request.POST))  # python will convert \n to os.linesep
    my_file.close()
    response = JsonResponse(request.POST)
    logger.info(response)
    return response


# def apple_pay(request):
#     file = open(settings.APPLE_PAY_FILE, "rb")
#     return FileResponse(file)


# def simple_login(request):
#     body = request.POST
#     email = body.get('email')
#     password = body.get('password')
#     if email and password:
#         record = BaseRequestTutor.objects.filter(email=email).first()
#         if record:
#             user = record.user
#             if user:
#                 if user.check_password(password):
#                     return JsonResponse({'status':True,'data':{
#                         "email": record.email,
#                         'first_name': record.first_name,
#                         'last_name': record.last_name,
#                         'country': str(record.country) if record.country else None,
#                         "phone_no": record.primary_phone_no,
#                         "state":
#                         }})


urlpatterns = [
    # '',
    # url(r".well-known/", include("config.domain-url")),
    url(
        r"we-are-allowed-tutor-success/",
        tutor_success_admin.urls,
    ),
    url(r"^we-are-allowed-tutors/", tutor_admin.urls),
    url(
        r"^we-are-allowed-payroll/",
        payroll_admin.urls,
    ),
    url(
        r"^we-are-allowed-customer-success/",
        customer_success_admin.urls,
    ),
    url(r"^graphql", csrf_exempt(GraphQLView.as_view(graphiql=True))),
    url(r"", include("external.urls")),
    url(r"^course-flow/", include("courses.urls")),
    # url(r'^favicon.ico$',
    #     RedirectView.as_view(
    #         url=staticfiles_storage.url('favicon.ico'), permanent=False),
    # name="favicon"),
    url(r"^get-areas-for-search/$", get_areas_in_region, name="get-areas"),
    # url(r'^jsreverse/$', urls_js, name='js_reverse'),
    url(r"^jsreverse/$", cache_page(60 * 60 * 24)(urls_js), name="js_reverse"),
    url(r"^quiz/", include("django_quiz.quiz.urls")),
    # url(r'^taggit/', include('taggit_bootstrap.urls')),
    # Uncomment the next line to enable the admin:
    url(r"^postscripts/$", csrf_exempt(postscript), name="postscript"),
    # url(r'^grappelli/', include('grappelli.urls')), # grappelli URLS
    # url(r'^jet/', include('jet.urls', 'jet')),
    url(
        "^paystack/verify-payment/(?P<order>[\w.@+-]+)/$",
        schema.verify_payment,
        name="verify_payment",
    ),
    url(
        "^paystack/",
        include("paystack.urls"),
    ),
    url(r"^we-are-allowed/", admin.site.urls),
    url(r"^tutor-applicants/", include("tutor_management.urls")),
    url(r"^hijack/", include("hijack.urls")),
    url(r"^blog/", include("connect_tutor.andablog_urls")),
    # url(r'^facebook/',
    #     include('simple_social_login.fb_login.urls',)),
    # url(r'^google/', include('simple_social_login.google_login.urls',
    #                         )),
    # User management
    url(
        r"^bookings/(?P<order_id>[\w.@+-]+)/$",
        view=BookingPageView.as_view(),
        name="booking_page",
    ),
    # url(r'bookings/requests/(?P<order_id>[\w.@+-]+)/$', view=RequestBookingPageView.as_view(),
    #     name="request_booking_page"),
    url(r"^help/", include("helps.urls")),
    url(
        r"^templates/$",
        TemplateView.as_view(
            template_name="templates/account/email/email_confirmation_signup_message.html"
        ),
        name="emailtt",
    ),
    url(
        r"^logout/$",
        django.contrib.auth.logout,
        {"next_page": "/home-tutors-in-nigeria"},
    ),
    url(r"^accounts/signup/$", SignupView.as_view(), name="account_signup"),
    url(r"^accounts/", include("allauth.urls")),
    url(
        r"^registration/",
        include(
            "registration.urls",
        ),
    ),
    url(
        r"",
        include(
            "users.urls",
        ),
    ),
    url(r"^something/paypal/", include("paypal.standard.ipn.urls")),
    # url(r'^sitemap\.xml$', sitemap, {'sitemaps': my_sitemaps},
    # name='django.contrib.sitemaps.views.sitemap'),
    url(r"^sitemap.xml", include("static_sitemaps.urls")),
    # Your stuff: custom urls go here
    # url(r"^r/", include("anafero.urls")),
    url(
        r"^api-auth/",
        include(
            "rest_framework.urls",
        ),
    ),
    # url(r'^markitup/', include('markitup.urls')),
    # url(r'^ckeditor/', include('ckeditor_uploader.urls')),
    # url(r"^advanced_filters/", include("advanced_filters.urls")),
    url(
        r"^hubspot/",
        include(
            "hubspot.urls",
        ),
    ),
    # url('^inbox/notifications/', include(notifications.urls)),
    # url(r'^sitemap\.xml$', sitemap, {'sitemaps': sitemaps},
    # name='django.contrib.sitemaps.views.sitemap'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    import debug_toolbar

    urlpatterns += (url(r"^__debug__/", include(debug_toolbar.urls)),)
handler404 = "external.views.handler404"
handler500 = "external.views.handler500"
