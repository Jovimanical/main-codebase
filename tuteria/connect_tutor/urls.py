# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime

from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import csrf_exempt
import pytz
from django.conf.urls import include, url
from django.views.generic import TemplateView


def static_last_modified(request):
    return datetime.datetime(2015, 3, 10, 5, 4, tzinfo=pytz.utc)


from . import views

urlpatterns = (
    # '',
    # Uncomment the next line to enable the admin:
    url(r"^tutoring-jobs/$", views.RequestPoolListView.as_view(), name="tutoring-jobs"),
    url(
        r"^tutoring-jobs/unsubscribe_from_jobs/$",
        views.Unsubscribe.as_view(),
        name="unsubscribe",
    ),
    url(
        r"^tutoring-jobs/(?P<slug>[\w.@+-]+)/$",
        views.RequestPoolDetailView.as_view(),
        name="job-details",
    ),
    url(r"^tutoring-jobs/jjj/email-temp/$", views.email_template, name="email_temp"),
    url(
        r"^tutoring-jobs/sms/confirm/(?P<slug>[\w.@+-]+)/(?P<rq_slug>[\w.@+-]+)/$",
        views.confirm_availability,
        name="confirm_availability",
    ),
    url(
        r"^tutoring-jobs/(?P<slug>[\w.@+-]+)/(?P<rq_slug>[\w.@+-]+)/$",
        views.view_request_detail,
        name="view_request_detail",
    ),
    url(
        r"^sms/infobib/inbound/$",
        views.sms_response_from_infobib,
        name="infobib_callback",
    ),
)
