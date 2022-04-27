from django.conf.urls import include, url
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    url(r"^login/?$", csrf_exempt(views.login), name="new_flow_login"),
    url(
        r"^bulk-requests/?$",
        csrf_exempt(views.bulk_request_fetch),
        name="bulk_request_fetch",
    ),
    url(
        r"^get-subjects/?$",
        csrf_exempt(views.get_tutor_subjects),
        name="get_tutor_subjects",
    ),
    url(
        r"^tutor-subjects/?$",
        csrf_exempt(views.fetch_all_tutor_subjects),
        name="new_flow_tutor_subjects",
    ),
    url(
        r"^save-tutor-subjects/?$",
        csrf_exempt(views.save_tutor_subject),
        name="save_tutor_subject",
    ),
    url(
        r"^delete-tutor-subjects/?$",
        csrf_exempt(views.delete_tutor_subject),
        name="delete_tutor_subject",
    ),
    url(
        r"^reset-password/?$",
        csrf_exempt(views.reset_password),
        name="new_flow_reset_password",
    ),
    url(
        r"^initialize-request/?$",
        csrf_exempt(views.initialize_request),
        name="new_flow_initialize_request",
    ),
    url(
        r"^update-request/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.update_request),
        name="new_flow_update_request",
    ),
    url(r"^magic-link/?$", views.magic_link_login, name="new_flow_magic_link"),
    url(
        r"^booking-info/(?P<slug>[\w.@+-]+)$",
        views.get_booking_info,
        name="new_flow_booking_info",
    ),
    url(
        r"^save-whatsapp-info/(?P<slug>[\w.@+-]+)$",
        views.save_whatsapp_info,
        name="save-whatsapp-info",
    ),
    url(
        r"^booking-with-class/(?P<class_id>[\w.@+-]+)$",
        views.get_booking_with_classID,
        name="new_flow_get_booking_with_classID",
    ),
    url(
        r"^get-bank-details/?$",
        csrf_exempt(views.get_bank_details),
        name="get_bank_details",
    ),
    url(
        r"^update-paid-bank-transfer/?$",
        csrf_exempt(views.update_bank_transfer),
        name="update_bank_transfer",
    ),
    url(
        r"^save-home-tutoring-request/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(
            views.save_home_tutoring_request
        ),  # initializing a new flow request (request-form)
        name="save_home_tutoring",
    ),
    url(
        r"^issue-new-home-tutoring-request/?$",
        csrf_exempt(views.issue_new_home_tutoring_request),  # from client landing page
        name="issue_new_home_tutoring",
    ),
    url(
        r"^update-home-tutoring-request/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(
            views.update_home_tutoring_request
        ),  # expects paymentInfo to be part of data
        name="update_home_tutoring",
    ),
    url(
        r"^generic-home-tutoring-request-update/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.generic_request_update),
        name="generic_update",
    ),
    url(
        r"^home-tutoring-request/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.agent_for_home_tutoring),
        name="agent_for_home_tutoring",
    ),
    url(
        r"^get-agent-info/?$",
        csrf_exempt(views.get_agent_info),
        name="h_get_agent_info",
    ),
    url(
        r"^tutor/(?P<slug>[\w.@+-]+)/update/?$",
        csrf_exempt(views.tutor_update),
        name="tutor_update_flow",
    ),
    url(
        r"^tutor/(?P<slug>[\w.@+-]+)/update-price/?$",
        csrf_exempt(views.update_tutor_price),
        name="tutor_price_update_flow",
    ),
    url(
        r"^new-profile/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.tutor_new_profile),
        name="tutor_new_profile",
    ),
    url(
        r"^tutor-reviews/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.tutor_reviews),
        name="tutor_reviews",
    ),
    url(
        r"^tutoring-jobs/?$",
        csrf_exempt(views.tutoring_jobs),
        name="x_tutoring_jobs",
    ),
    url(
        r"^create-booking/?$",
        csrf_exempt(views.create_booking_by_tutor),
        name="create_booking_by_tutor",
    ),
    url(
        r"^create-client-order/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.create_client_order),
        name="create_client_order",
    ),
    url(
        r"^update-client-order/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.update_client_order),
        name="update_client_order",
    ),
    url(
        r"^send-notification-to-tutor/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.send_notification_to_tutor),
        name="home_tutoring_send_notification_to_tutor",
    ),
    url(
        r"^send-notification-to-client/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.send_notification_to_client),
        name="home_tutoring_send_notification_to_client",
    ),
    url(
        r"^successful-online-payment/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.after_client_online_payment),
        name="action_after_successful_payment",
    ),
    url(
        r"^speaking-fee-payment/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.successful_speaking_fee_payment),
        name="successful_speaking_fee_payment",
    ),
    url(
        r"^whatsapp-webhook/?$",
        csrf_exempt(views.whatsapp_webhook),
        name="whatsapp-webhook",
    ),
    url(
        r"^discount-stats/?$",
        csrf_exempt(views.get_discount_statistics),
        name="discount-stats",
    ),
    url(
        r"^regions/?$",
        csrf_exempt(views.get_related_regions),
        name="state_with_regions",
    ),
    url(r"^search/?$", csrf_exempt(views.search), name="tutor_search"),
    url(
        r"^search/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.search_data_for_tutors),
        name="s_tutors",
    ),
    url(
        r"^admin/search/(?P<slug>[\w.@+-]+)/applied$",
        csrf_exempt(views.tutors_who_applied_for_job),
        name="applied_tutors",
    ),
    url(
        r"^admin/search/single$",
        csrf_exempt(views.specific_tutor_search),
        name="specific_tutor_search",
    ),
    url(
        r"^admin/update-request-pool/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.update_request_pool),
        name="update_request_pool",
    ),
    url(
        r"^pool-tutors/(?P<slug>[\w.@+-]+)/?$",
        csrf_exempt(views.tutors_selected_for_job),
        name="pool-tutors",
    ),
    url(
        r"^update-admin-status/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.update_admin_status),
        name="new_flow_admin_status",
    ),
    url(
        r"^add-tutor-to-pool/?$",
        csrf_exempt(views.add_tutor_to_pool),
        name="add_tutor_to_pool",
    ),
    url(r"^agents/statistics/?$", views.agent_statistics, name="agent_statistics_v"),
]
