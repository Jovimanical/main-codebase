# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

from django.conf import settings
from django.conf.urls import patterns, include, url
from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = patterns(
    "",
    # Uncomment the next line to enable the admin:
    url(
        regex=r"^request/(?P<username>[\w.@+-]+)/$",
        view="users.views.request_background_check",
        name="request_background_check",
    ),
    url(
        regex=r"^give-consent/$",
        view="users.views.give_consent",
        name="request_consent",
    ),
    url(
        regex=r"^confirm-request/(?P<order_id>[\w.@+-]+)/$",
        view="users.views.confirm_request",
        name="confirm_request_and_pay",
    ),
    url(
        regex=r"^process-background-check/$",
        view="users.views.process_background_check",
        name="process_background_check",
    ),
)
