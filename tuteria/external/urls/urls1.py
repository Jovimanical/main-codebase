# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime

from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import csrf_exempt
import pytz
from django.conf.urls import include, url
from django.views.generic import TemplateView, RedirectView
from ratelimit.decorators import ratelimit
from django.http import JsonResponse


def static_last_modified(request):
    return datetime.datetime(2015, 3, 10, 5, 4, tzinfo=pytz.utc)


def b_click(request):
    return JsonResponse({})


from .. import views
from ..autocomplete_light_registry import BaseRequestTutorAutocomplete

urlpatterns = [
    # '',
    # Uncomment the next line to enable the admin:
    url(
        regex=r"^$",
        view=views.HomeView.as_view(template_name="pages/home.html"),
        name="home",
    ),
    url(
        r"^baserequesttutor-autocomplete/$",
        BaseRequestTutorAutocomplete.as_view(),
        name="baserequesttutor-autocomplete",
    ),
    url(
        regex=r"^become-a-tutor/$",
        view=views.BecomeTutor.as_view(),
        name="become_tutor",
    ),
    url(
        regex=r"^hometutors/$",
        view=views.HowView.as_view(),
        # view=views.HowView.as_view(template_name="pages/how-it-works.html"),
        name="home_tutors",
    ),
    url(
        regex=r"^classes/(?P<course_name>[\w.@+-]+)/(?P<course_id>[\w.@+-]+)",
        view=views.GroupClass.as_view(),
        name="group_classes",
    ),
    url(
        regex=r"^home-tutors-in-nigeria/$",
        view=views.HowView.as_view(),
        # view=views.HowView.as_view(template_name="pages/how-it-works.html"),
        name="how_it_works",
    ),
    # url(regex=r'^(?P<slug>[\w.@+-]+)-tutors/?region=(?P<state>[\w.@+-]+)$', view=views.StateSkillView.as_view(), name='skill_state_view'),
    url(
        regex=r"^(?P<slug>[\w.@+-]+)-tutors/$",
        view=views.SkillRequestView.as_view(),
        name="skill_only_view",
    ),
    url(
        regex=r"^home-tutors-in-(?P<state>[\w.@+-]+)/$",
        view=views.StateView.as_view(),
        name="state_view",
    ),
    url(
        regex=r"^home-tutors/(?P<skill>[\w.@+-]+)-tutors-in-(?P<state>[\w.@+-]+)$",
        view=ratelimit(key="ip")(views.StateView.as_view()),
        name="state_skill_view",
    ),
    url(r"^emails/$", views.email_design, name="email_temp"),
    # url(r'^ajax-skills/$', views.AutocompleteSkillList.as_view(),
    url(r"^ajax-skills/$", views.autocomplete_skill_list, name="ajax_skills_all"),
    # url(r'^ajax-search/$', views.SearchSkillList.as_view(), name='ajax_search'),
    # url(r'^ajax-skills/(?P<query>[\w.@+-]+)/$', cache_page(60 * 60 * 24)(views.skill_tag_autocomplete_list),
    #     name='ajax_tags_all'),
    # url(regex=r'^categories/$',
    # view=views.HomeView.as_view(template_name='pages/category.html'),
    # name='category_list'),
    url(
        r"^teach-(?P<slug>[\w.@+-]+)/$",
        views.BecomeTutorSpecific.as_view(),
        name="become_tutor_specific",
    ),
    # url(regex=r'^categories/(?P<category_slug>[\w.@+-]+)/(?P<skill_slug>[\w.@+-]+)/$',
    #     view=views.SkillView.as_view(),
    #     name='skill_search'),
    # url(regex=r'^search/$',
    #     view=views.SearchView.as_view(category=False),
    #     name='search'),
    url(
        regex=r"^explore/$",
        view=views.SkillSearchView.as_view(category=False),
        name="skill_search",
    ),
    url(regex=r"^cancellation/$", view=views.cancellation, name="cancellation"),
    url(regex=r"^p/download/$", view=views.download, name="download"),
    url(
        regex=r"^trust/$",
        view=TemplateView.as_view(template_name="pages/trust.html"),
        name="trust_safety",
    ),
    url(regex=r"^request/$", view=RedirectView.as_view(url="/"), name="request_tutor"),
    url(
        regex=r"^request/second-step/(?P<slug>[\w.@+-]+)/$",
        view=views.RequestView.as_view(),
        name="request_tutor_skill",
    ),
    url(
        regex=r"^prev-request/second-step/(?P<slug>[\w.@+-]+)/$",
        view=views.PreviousRequestView.as_view(),
        name="prev_request_tutor_skill",
    ),
    url(regex=r"^prime/$", view=views.PrimeRequestView.as_view(), name="prime-request"),
    url(
        regex=r"^request/pricing/(?P<slug>[\w.@+-]+)/$",
        view=csrf_exempt(views.PricingView.as_view()),
        name="request_pricing_view",
    ),
    # url(regex=r'^request/third-step/(?P<slug>[\w.@+-]+)/$',
    #     view=views.PriceConfirmView.as_view(),
    #     name='price_confirm_step'),
    # url(regex=r'^request-received/(?P<slug>[\w.@+-]+)$',
    # url(regex=r'^make-deposit/(?P<order>[\w.@+-]+)/$',
    #     view=views.RequestTutorReceivedView.as_view(),
    #     name='client_request_received'),
    url(
        regex=r"^request/discounts/apply-discount/$",
        view=views.DiscountRedirectUrl.as_view(),
        name="discount_giver",
    ),
    #     name='client_request_received'),
    url(
        regex=r"^request/discounts/(?P<slug>[\w.@+-]+)/redirect/$",
        view=views.IntermediateLoginView.as_view(),
        name="redirect_completion",
    ),
    url(
        regex=r"^request-completed/(?P<slug>[\w.@+-]+)/$",
        view=views.FinalRequestView.as_view(),
        name="client_request_completed",
    ),
    # url(regex=r'request/payment-completed/(?P<order>[\w.@+-]+)/$',
    #     view=csrf_exempt(views.RequestPaymentCompleteRedirectView.as_view()),
    #     name='request_complete_redirect1'),
    # url(regex=r'deposit/redirect/$', view=views.BeginDepositView.as_view(),
    #     name='begin_deposit'),
    # Processing Fee payment
    url(
        regex=r"request_payment/(?P<slug>[\w.@+-]+)/redirect/$",
        view=csrf_exempt(views.ProcessingViewRedirectView.as_view()),
        name="processing_fee_redirect",
    ),
    url(
        regex=r"request_payment/(?P<slug>[\w.@+-]+)/cancelled/$",
        view=csrf_exempt(views.ProcessingCancelView.as_view()),
        name="processing_fee_cancelled",
    ),
    url(
        regex=r"request_payment/(?P<slug>[\w.@+-]+)/completed/$",
        view=views.ProcessingViewCompletedView.as_view(),
        name="processing_fee_completed",
    ),
    # Request Payment
    url(
        regex=r"request/payment/(?P<order>[\w.@+-]+)/$",
        view=views.RequestPaymentPage.as_view(),
        name="request_payment_page",
    ),
    url(
        regex=r"request/online-payment/(?P<tutor_slug>[\w.@+-]+)/(?P<slug>[\w.@+-]+)/$",
        view=views.OnlinePaymentRedirectView.as_view(),
        name="dollar_online_payment",
    ),
    url(
        regex=r"request/client-payment-completed/(?P<order>[\w.@+-]+)/$",
        view=csrf_exempt(views.ClientPaymentCompletedView.as_view()),
        name="request_complete_redirect",
    ),
    url(
        regex=r"request/client-payment-cancelled/(?P<order>[\w.@+-]+)/$",
        view=csrf_exempt(views.FailedPaymentRedirectView.as_view()),
        name="request_cancelled_redirect",
    ),
    url(
        r"^request/paystack/callback/(?P<order>[\w.@+-]+)$",
        view=csrf_exempt(views.PaystackCallBackView.as_view()),
        name="callback_paystack",
    ),
    url(
        r"^request/paystack/authorize/(?P<order>[\w.@+-]+)$",
        view=views.PaystackAuthorizationView.as_view(),
        name="authorize_paystack",
    ),
    url(
        r"^request/paystack/webhook",
        view=csrf_exempt(views.paystack_webhook),
        name="p_stack_webhook",
    ),
    url(
        r"^request/paystack/callback",
        view=csrf_exempt(views.paystack_webhook),
        name="p_stack_callback",
    ),
    url(
        r"^request/paystack/validate/(?P<order>[\w.@+-]+)/(?P<code>[\w.@+-]+)$",
        view=views.validate_paystack_ref,
        name="validate_paystack",
    ),
    url(
        regex=r"request/(?P<slug>[\w.@+-]+)/booking/$",
        view=views.RequestBookingPage.as_view(),
        name="request_booking_page",
    ),
    url(
        r"^tutors/select/(?P<slug>[\w.@+-]+)/$",
        views.RequestTutorPreview.as_view(),
        name="selected_tutors",
    ),
    url(
        r"^tutors/select/(?P<slug>[\w.@+-]+)/(?P<tutor_slug>[\w.@+-]+)$",
        views.RequestTutorPaymentPage.as_view(),
        name="selected_tutor_redirect",
    ),
    url(
        r"^validate-referral-code/(?P<slug>[\w.@+-]+)/$",
        views.validate_referral_code,
        name="validate_referral_code",
    ),
    # url(
    #     r"^about/$",
    #     view=views.AboutUsView.as_view(template_name="pages/about.html"),
    #     name="about_us",
    # ),
    url(
        r"^founders/$",
        TemplateView.as_view(template_name="pages/founders.html"),
        name="founders",
    ),
    url(
        r"^why-use-tuteria/$",
        TemplateView.as_view(template_name="pages/why-use.html"),
        name="why_use",
    ),
    url(
        r"^press$", TemplateView.as_view(template_name="pages/press.html"), name="press"
    ),
    url(
        r"^media-resources/$",
        TemplateView.as_view(template_name="pages/press.html"),
        name="media_resources",
    ),
    url(
        r"^ebook_giveaway/$",
        TemplateView.as_view(template_name="pages/ebook.html"),
        name="resources",
    ),
    url(
        r"^levels/$",
        TemplateView.as_view(template_name="pages/tutor-level.html"),
        name="tutor_levels",
    ),
    url(r"^user-banned/$", views.banned, name="banned"),
    url(
        r"^terms/$",
        TemplateView.as_view(template_name="pages/terms.html"),
        name="terms",
    ),
    url(
        r"^policies/$",
        TemplateView.as_view(template_name="pages/policy.html"),
        name="policies",
    ),
    url(
        r"^discounts/$",
        TemplateView.as_view(template_name="pages/discounts.html"),
        name="discounts",
    ),
    url(
        r"^payment-policies/$",
        TemplateView.as_view(template_name="pages/payment-policy.html"),
        name="payment_policies",
    ),
    url(
        r"^google57c31afbf3205423.html$",
        TemplateView.as_view(template_name="pages/google57c31afbf3205423.html"),
        name="google57c31afbf3205423",
    ),
    url(r"^", include("reviews.urls")),
    url(r"^invite/", include("referrals.urls")),
    url(r"^", include("connect_tutor.urls")),
    url(r"^partnerships/$", views.PatnershipView.as_view(), name="partnerships"),
    url(
        r"^partnership/completed/$",
        TemplateView.as_view(template_name="pages/patnership-completed.html"),
        name="patnership_completed",
    ),
    # url(r'^featured/$', TemplateView.as_view(template_name='pages/featured-devices.html'),
    #    name="featured-devices"),
    url(
        r"^yahoo-redirect/$",
        TemplateView.as_view(template_name="pages/yahoo_redirect.html"),
        name="yahoo_redirect",
    ),
    url(
        r"^careers/department/position/$",
        TemplateView.as_view(template_name="pages/careers.html"),
    ),
    url(
        regex=r"^nigerian-languages/$",
        view=views.ForeignRequestView.as_view(
            template_name="pages/nigerian-languages.html"
        ),
        name="language_lessons",
    ),
    # url(r'^form/$', views.ReferralTutorRequestView.as_view(),
    #     name='referral_request_form'),
    url(
        regex=r"^online-lessons/$",
        view=views.ForeignAcademicRequestView.as_view(
            template_name="pages/online-lessons.html"
        ),
        name="online_lessons",
    ),
    url(
        regex=r"^request/tutors-select/(?P<slug>[\w.@+-]+)/$",
        view=views.TutorSelectRequestView.as_view(),
        name="request_tutor_skill_online",
    ),
    url(
        r"^request/select-tutor/(?P<slug>[\w.@+-]+)/$",
        view=views.TutorSelectRequestView.as_view(),
        name="tutor_selection",
    ),
    url(
        regex=r"^request/pricing-package/(?P<slug>[\w.@+-]+)/$",
        view=views.PricingPackageView.as_view(),
        name="pricing_package",
    ),
    url(
        regex=r"successful-request/(?P<slug>[\w.@+-]+)/$",
        view=views.OnlineRequestCompletedView.as_view(),
        name="online_request_completed",
    ),
    # url(
    #     regex=r"^earlychild/$",
    #     view=views.HowView.as_view(template_name="pages/earlychild.html"),
    #     name="earlychild",
    # ),
    url(r"^sss/ooo/eww/des", view=b_click, name="button_clicks"),
    url(
        r"^admin/userpayout/(?P<pk>\d+)/$",
        csrf_exempt(views.user_payout_details),
        name="payout_view",
    ),
    url(
        r"^admin/update-remark/(?P<pk>\d+)/$",
        csrf_exempt(views.update_remark_for_admin),
        name="update_remark_view",
    ),
    url(
        r"^determine-price-earnable",
        csrf_exempt(views.determine_price_earnable),
        name="determine_price_earnable",
    ),
    url(r"^", include("external.admin.urls")),
    url(r"^new-flow/", include("external.new_group_flow.urls"))
    #   url(regex=r'^testimonials/$',
    #         view=views.HowView.as_view(template_name='pages/testimonials.html'),
    #         name='testimonials'),
    # url(r'^request-analytics/(?P<status>[\w.@+-]+)/(?P<kind>[\w.@+-]+)/$', views.request_analytics,
    #     name='request-analytics'),
    # url(r"^admin/find_tutor/(?P<slug>[\w.@+-]+)$",
    #     views.RedirectToTutors.as_view(),name='find_tutors')
]
