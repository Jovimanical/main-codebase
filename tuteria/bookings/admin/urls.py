from django.conf.urls import include, url
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = [
    url(
        r"^admin/booking/find-tutor/$",
        csrf_exempt(views.find_group_lesson_tutor),
        name="group_find_tutor"
        # cache_page(60 * 60)(csrf_exempt(views.client_request_pool_list)),
        #     name='client_request_pool_list'
    ),
    url(
        r"^admin/booking/create-group-booking/$",
        csrf_exempt(views.create_group_booking_instance),
        name="group_create_admin_booking"
        # cache_page(60 * 60)(csrf_exempt(views.client_request_pool_list)),
        #     name='client_request_pool_list'
    ),
    url(
        r"^admin/booking/process-booking-withdrawal/(?P<slug>[\w.@+-]+)/$",
        csrf_exempt(views.process_withdrawal_for_booking),
        name="group_process_booking_withdrawal"
        # cache_page(60 * 60)(csrf_exempt(views.client_request_pool_list)),
        #     name='client_request_pool_list'
    ),
]
