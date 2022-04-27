# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import include, url
from django.views.decorators.csrf import csrf_exempt

from users.decorators import tuteria_agreement_requirement
from .. import views
from bookings.admin import views as admin_views
from ..autocomplete_light_registry import BookingAutocomplete

urlpatterns = (
    # '',
    # Uncomment the next line to enable the admin:
    url(
        regex=r"^bookings/$", view=views.BookingListView.as_view(), name="user_bookings"
    ),
    url(
        r"^booking-autocomplete/$",
        BookingAutocomplete.as_view(),
        name="booking-autocomplete",
    ),
    # Uncomment the next line to enable the admin:
    url(
        regex=r"^manage_bookings/$",
        view=tuteria_agreement_requirement(views.ManageBookingListView.as_view()),
        name="tutor_bookings",
    ),
    # Uncomment the next line to enable the admin:
    url(
        regex=r"^bookings/(?P<order_id>[\w.@+-]+)/$",
        view=views.BookingDetailView.as_view(),
        name="user_booking_summary",
    ),
    url(
        regex=r"^all_bookings/(?P<order_id>[\w.@+-]+)/redirect/$",
        view=views.RequestBookingPage.as_view(),
        name="user_booking_summary_redirect",
    ),
    # Uncomment the next line to enable the admin:
    url(
        regex=r"^manage_bookings/(?P<order_id>[\w.@+-]+)/$",
        view=tuteria_agreement_requirement(views.ManageBookingDetailView.as_view()),
        name="tutor_booking_summary",
    ),
    url(
        r"^update-session/(?P<pk>\d+)/$",
        view=views.BookingSessionUpdateView.as_view(),
        name="update_session_status",
    ),
    url(
        r"^cancel-session/(?P<order_id>[\w.@+-]+)/$",
        views.ResolutionUpdateView.as_view(),
        name="cancel_session",
    ),
    url(
        r"^client-confirms-request/(?P<order_id>[\w.@+-]+)/$",
        views.ClientConfirmRequestView.as_view(),
        name="client_confirm_request",
    ),
    url(
        r"^request-to-cancel/(?P<order_id>[\w.@+-]+)/$",
        views.TutorCancelRequestView.as_view(),
        name="request_to_cancel_booking",
    ),
    url(
        r"^admin/bookings/refund/(?P<pk>[\w.@+-]+)/$",
        csrf_exempt(admin_views.refund_booking_view),
        name="refund_client",
    ),
    url(r"^", include("wallet.urls")),
    url(r"^get_hourly_rate", views.get_hourly_rate, name="get-hourly-rate"),
)
