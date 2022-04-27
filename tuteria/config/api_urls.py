# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import logging

from django.conf.urls import patterns, include, url

# import notifications
from rest_framework.authtoken.views import obtain_auth_token

from api.v1.urls import router
from api.v1 import views

logger = logging.getLogger(__name__)

urlpatterns = patterns(
    "",
    # url(r'^jsreverse/$', urls_js, name='js_reverse'),
    url(r"^api/token/", obtain_auth_token, name="api-token"),
    url(r"^api/rest-auth/", include("rest_auth.urls")),
    url(r"^api/rest-auth/facebook/$", views.FacebookLogin.as_view(), name="fb_login"),
    url(r"^api/rest-auth/google/$", views.GoogleLogin.as_view(), name="google_login"),
    url(
        r"^api/rest-auth/linkedin/$",
        views.LinkedinLogin.as_view(),
        name="linkedin_login",
    ),
    (r"^api/rest-auth/registration/", include("rest_auth.registration.urls")),
    url(r"^api/", include(router.urls)),
    # User management
    url(r"^api-auth/", include("rest_framework.urls", namespace="rest_framework")),
)
