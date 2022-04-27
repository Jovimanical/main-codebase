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
from .. import views

urlpatterns = (
    # '',
    # Uncomment the next line to enable the admin:
    url(
        r"^request-meeting-with-tutor/(?P<pk>\d+)/$",
        views.PrepareRequestToMeetView.as_view(),
        name="request_meeting_redirect",
    ),
    url(
        r"^request-meeting/(?P<order_id>[\w.@+-]+)/$",
        views.RequestMeetingView.as_view(),
        name="request_meeting",
    ),
    url(
        r"^request-meeting-payment/(?P<order_id>[\w.@+-]+)/completed$",
        csrf_exempt(views.RequestMeetingRedirectView.as_view()),
        name="paid_to_request_to_meet",
    ),
    url(
        r"^valid-condition-to-not-receive-payment/(?P<order_id>[\w.@+-]+)",
        views.process_payment_from_previous_request,
        name="condition_to_not_make_payment",
    ),
    url(
        r"^request-meeting/(?P<order_id>[\w.@+-]+)/completed$",
        views.RequestMeetingSummary.as_view(),
        name="request_meeting_completed",
    ),
    url(
        regex=r"^users/client_meetings/$",
        view=views.TutorClientMeetingListView.as_view(),
        name="client_meetings",
    ),
    url(
        r"^users/client_meetings/(?P<order_id>[\w.@+-]+)/$",
        views.CloseMeetingView.as_view(),
        name="close_meeting",
    ),
    url(
        r"^request-meeting-successful/$",
        views.RequestMeetingSuccessful.as_view(),
        name="request_meeting",
    ),
    url(
        regex=r"^users/reviews/$",
        view=views.UserPendingReviewList.as_view(),
        name="reviews",
    ),
    url(
        r"^request-to-meet/agreement/$",
        views.how_request_to_meet_works,
        name="how_request_to_meet_works",
    ),
    url(
        r"^request-to-meet/confirmation/$",
        views.verify_quiz,
        name="validate_request_to_meet",
    ),
    # url(regex=r'^background-check/request/(?P<username>[\w.@+-]+)/$',
    #     view='users.views.request_background_check',
    #     name="request_background_check"),
    # url(regex=r'^background-check/give-consent/$',
    #     view='reviews.views.give_consent',
    #     name='request_consent'
    # ),
    # url(regex=r'^background-check/confirm-request/(?P<order_id>[\w.@+-]+)/$',
    #     view='reviews.views.confirm_request',
    #     name='confirm_request_and_pay'),
    # url(
    #     regex=r'^background-check/process-background-check/$',
    #     view='reviews.views.process_background_check',
    #     name='process_background_check'
    # ),
    # url(r'^background-check/redirect/(?P<order_id>[\w.@+-]+)/$',
    #     csrf_exempt(views.BackgroundPaymentCompleteRedirectView.as_view()),
    #     name='background_redirect'),
)
