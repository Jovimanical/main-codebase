# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

from django.conf import settings
from django.conf.urls import include, url
from django.urls import reverse
from django.http import HttpResponse
from django.shortcuts import redirect
from django.views.decorators.cache import cache_control
from django.views.decorators.http import last_modified
from django.views.decorators.csrf import csrf_exempt

from . import views
from .autocomplete_light_registry import ReferralAutocomplete

urlpatterns = (
    # '',
    # Uncomment the next line to enable the admin:
    url(r"^$", views.ReferralView.as_view(), name="request_meeting_redirect"),
    url(
        r"^referral-autocomplete/$",
        ReferralAutocomplete.as_view(),
        name="referral-autocomplete",
    ),
    url(r"^confirm/$", views.UploadDetails.as_view(), name="referral_confirm"),
    url(r"^remind/$", views.RemindUser.as_view(), name="referral_remind"),
    url(r"^google-emails/$", views.test_view, name="google_emails"),
    url(r"^download-form/$", views.get_tutor_request_form, name="offline_form"),
    url(r"^offline$", views.OfflineView.as_view(), name="offline-materials"),
    # url(r'^google/oauth2callback/$', views.auth_return,name='google_redirect'),
)
