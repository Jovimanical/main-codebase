from django.conf.urls import include, url
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    url(
        r"^admin/request/(?P<slug>[\w.@+-]+)/request-pool-list/$",
        csrf_exempt(views.client_request_pool_list),
        name="client_request_pool_list"
        # cache_page(60 * 60)(csrf_exempt(views.client_request_pool_list)),
        #     name='client_request_pool_list'
    ),
    url(
        r"^admin/request/(?P<slug>[\w.@+-]+)/update-budget/$",
        csrf_exempt(views.update_client_budget),
        name="update_client_budget",
    ),
    url(
        r"^admin/request/(?P<slug>[\w.@+-]+)/update-split/$",
        csrf_exempt(views.update_split_count),
        name="update_split_count",
    ),
    url(
        r"^admin/request/(?P<slug>[\w.@+-]+)/add-tutors-client-pool/$",
        csrf_exempt(views.add_tutors_to_client_pool),
        name="add_tutors_to_client_pool",
    ),
    url(
        r"^admin/request-pool/(?P<request_pool_id>\d+)/update-details/$",
        csrf_exempt(views.update_request_pool_details_view),
        name="update_request_pool_details_view",
    ),
    url(
        r"^admin/request/(?P<slug>[\w.@+-]+)/booking/create/$",
        csrf_exempt(views.CreateBookingFromClientRequestView.as_view()),
        name="create_booking_view",
    ),
    url(
        r"^admin/request/(?P<slug>[\w.@+-]+)/attach-tutor/$",
        csrf_exempt(views.attach_tutor_to_client_req),
        name="attach_tutor_to_client_req",
    ),
    url(
        r"^admin/request-pool/(?P<request_pool_id>[\w.@+-]+)/update-additional-info/$",
        csrf_exempt(views.update_additional_info),
        name="update_additional_info",
    ),
    url(
        r"^admin/followup/update/$",
        csrf_exempt(views.update_request),
        name="update_request"
    )
]
