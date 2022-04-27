# -*- coding: utf-8 -*-
import datetime
import json
import logging
import pdb
from allauth.account.forms import LoginForm, ResetPasswordForm, SignupForm
from braces.views import LoginRequiredMixin
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.urls import reverse
from django.http import Http404, JsonResponse
from django.shortcuts import redirect, render, render_to_response
from django.template import RequestContext
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

# Create your views here.
from django.views.generic import FormView, RedirectView, TemplateView
from paypal.standard.ipn.signals import valid_ipn_received
from paypal.standard.models import ST_PP_COMPLETED
from rest_framework.pagination import PageNumberPagination
from config import utils
from external.models import BaseRequestTutor
from . import display_content as const

# redis_con = get_redis_connection('default')
from ..forms import (
    HomeSkillRequestForm,
    PatnershipForm,
    # ReferralTutorRequestForm
)
from .mixins import AuthFormMixin, StateBaseMixin
from wallet import services as wallet_service
from bookings import services as booking_service
from skills.services import SkillService
from users import services as user_service
from external import services
from config.utils import PayStack

logger = logging.getLogger(__name__)


def autocomplete_skill_list(request):
    s = SkillService.skills_with_tutor(query=request.GET.get("name"))
    return JsonResponse(s, safe=False)


class HomeView(AuthFormMixin, TemplateView):
    category = True
    skill = ""
    location = ""
    region = None
    location_query = False

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, request, *args, **kwargs):
        return super(HomeView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        carousel = [
            {"icon_class": "bg1", "caption": "Discover amazing tutors near you"},
            {"icon_class": "bg2", "caption": "Get help for homework and studies"},
            {"icon_class": "bg3", "caption": "Understand profession make-up artistry"},
            {"icon_class": "bg4", "caption": "Learn music from seasoned professionals"},
            {"icon_class": "bg5", "caption": "Easily prepare for exams and tests"},
            {"icon_class": "bg6", "caption": "Make tantalizing cakes all by yourself"},
        ]
        trust_check = [
            "Tutors are manually assessed for highest quality",
            "Tutors have verified offline and online identities",
            "Run up-to-date criminal background checks",
            "Public reviews from tutors' previous clients",
            "24/7 dedicated trust and safety team",
        ]

        category_list = {
            "title": "Mathematics",
            "caption": "Lets help you with numbers",
            "skills": [
                "Math",
                "English",
                "Account",
                "Physics",
                "Chemistry",
                "Geography",
                "French",
                "Biology",
            ],
        }
        top_businesses = [
            {
                "img": "/static/img/ui/math.jpg",
                "heading": "MATHEMATICS",
                "tags": ["Algebra", "Calculus", "Geometry"],
                "url": reverse("skill_search") + "?category={}".format("mathematics"),
            },
            {
                "img": "/static/img/ui/english.png",
                "heading": "ENGLISH LANGUAGE",
                "tags": ["Writing", "Grammar", "Literature"],
                "url": reverse("skill_search") + "?category={}".format("english"),
            },
            {
                "img": "/static/img/ui/exam.jpg",
                "heading": "EXAM PREPARATION",
                "tags": ["SAT", "TOEFL", "ICAN", "IGCSE"],
                "url": reverse("skill_search")
                + "?category={}".format("exam preparation"),
            },
            {
                "img": "/static/img/ui/music.jpg",
                "heading": "MUSIC & INSTRUMENTS",
                "tags": ["Guitar", "Piano", "Music Theory"],
                "url": reverse("skill_search") + "?category={}".format("music"),
            },
            {
                "img": "/static/img/ui/sciences.jpg",
                "heading": "SCIENCE SUBJECTS",
                "tags": ["Physics", "Biology", "Chemistry"],
                "url": reverse("skill_search") + "?category={}".format("science"),
            },
            {
                "img": "/static/img/ui/business.jpg",
                "heading": "BUSINESS & COMMERCE",
                "tags": ["Commerce ", " Account", "Economics"],
                "url": reverse("skill_search") + "?category={}".format("business"),
            },
            {
                "img": "/static/img/ui/beauty1.jpg",
                "heading": "BEAUTY & LIFESTYLE",
                "tags": ["Makeup", "Sewing", "Beadmaking"],
                "url": reverse("skill_search") + "?category={}".format("beauty"),
            },
            {
                "img": "/static/img/ui/cooking1.jpg",
                "heading": "COOKING",
                "tags": ["Cakes", "Soups", "Snacks"],
                "url": reverse("skill_search") + "?category={}".format("cooking"),
            },
        ]
        context.update(
            {
                "carousels": carousel,
                "infographics_content": const.infographics_content,
                "category_list": category_list,
                "top_businesses": top_businesses,
                "testimonials": const.testimonials,
                "trust_checks": trust_check,
                "how_it_works": const.how_it_works,
            }
        )
        context["category"] = self.category
        return context


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 1000


class StateSkillView(StateBaseMixin, TemplateView):
    template_name = "pages/state-with-skill-request.html"
    form = HomeSkillRequestForm
    is_parent = False
    skill = None


@ensure_csrf_cookie
def become_tutor(request):
    login_form = LoginForm()
    signup_form = SignupForm(initial={"referral_code": request.referral_code})
    reset_form = ResetPasswordForm()
    infographics_content2 = [
        {
            "heading": "Teach More People",
            "icon_class": "fourth",
            "tag": "teach.png",
            "content": (
                "We recommend you to hundreds of clients in your area every single day,"
                " so your business is never off."
            ),
        },
        {
            "heading": "Get Instant Payments",
            "icon_class": "fifth",
            "tag": "payment.png",
            "content": (
                "Receive hassle-free payments, track your earnings and instantly"
                " withdraw to your bank in one click!"
            ),
        },
        {
            "heading": "Flexible Schedules",
            "icon_class": "pace-img",
            "tag": "set-schedule.png",
            "content": "You choose when you want to work and how much, and you only pick up jobs you're interested in.",
        },
    ]

    infographics_content3 = [
        {"heading": "1. Apply online", "icon_class": "win1", "tag": "apply-online.png"},
        {
            "heading": "2. Complete identity verification",
            "icon_class": "win2",
            "tag": "id-verification.png",
        },
        {
            "heading": "3. Pass competency assessments",
            "icon_class": "win3",
            "tag": "competency.png",
        },
        {
            "heading": "4. Create subjects to receive clients",
            "icon_class": "win4",
            "tag": "clients.png",
        },
    ]
    ic = infographics_content2
    gs = infographics_content3
    ts = [const.testimonials for x in range(0, 2)]
    total_no_of_hours = booking_service.BookingSessionService.total_tutor_hours()
    logger.info(total_no_of_hours)
    return render(request, "pages/become_tutor_block.html", locals())
    # return render(request, "pages/become_tutor.html", locals())


def populate_reoccuring(x, start_time):
    date_format = "%d-%m-%Y %I%p"
    if x:
        return datetime.datetime.strptime(start_time, date_format)
    return None


def cancellation(request):
    return render(request, "pages/cancellation.html")


def email_design(request):
    return render(request, "account/email/email_confirmation_message.html")


class AboutUsView(TemplateView):
    def get_context_data(self, **kwargs):
        context = super(AboutUsView, self).get_context_data(**kwargs)
        return context

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, request, *args, **kwargs):
        return super(AboutUsView, self).dispatch(request, *args, **kwargs)


def is_flagged(user):
    if hasattr(user, "flagged"):
        return user.flagged
    return False


def banned(request):
    return render(request, "pages/banned.html")


def handler404(request, exception):
    response = render(request, "404.html", {})
    response.status_code = 404
    return response


def handler500(request):
    response = render(request, "500.html", {})
    response.status_code = 500
    return response


class SkillSearchView(TemplateView):
    category = True
    template_name = "pages/skill-search.html"

    def get_context_data(self, **kwargs):
        context = super(SkillSearchView, self).get_context_data(**kwargs)
        data = SkillService.get_active_skills_with_background_images(
            **self.request.GET.dict()
        )
        context.update(**data)
        return context


class BecomeTutorSpecific(TemplateView):
    template_name = "pages/become_tutor_block.html"
    # template_name = "pages/specific_become_pages.html"

    def get_context_data(self, **kwargs):
        context = super(BecomeTutorSpecific, self).get_context_data(**kwargs)
        context["object"] = SkillService(self.kwargs.get("slug")).instance
        context.update(
            total_no_of_tutors=user_service.TutorService.total_number_of_tutors()
        )
        return context


class RequestTutorPreview(LoginRequiredMixin, TemplateView):
    template_name = "external/tutors-select.html"

    def get_object(self):
        self.request_service = services.SingleRequestService(
            slug=self.kwargs.get("slug")
        )
        return self.request_service.instance

    def get_context_data(self, **kwargs):
        context = super(RequestTutorPreview, self).get_context_data(**kwargs)
        context.update(self.request_service.tutor_preview_context())
        context.update(currency="&#x20A6;")
        return context

    def get(self, request, *args, **kwargs):
        self.object: BaseRequestTutor = self.get_object()
        use_old = request.GET.get('use_old')
        if not use_old:
            if self.object.is_parent_request and settings.USE_NEW_LAYOUT:
                if self.object.has_budget_in_pool:
                    return redirect(f"{settings.NEW_PROFILE_URL}/tutors/select/{self.object.slug}")
        if self.request_service.has_been_paid():
            messages.error(self.request, "This request has already been paid for.")
            return redirect(reverse("users:revenue_transactions"))
        if not self.request.user.is_staff:
            if not self.request_service.is_owner(self.request.user):
                messages.error(self.request, "Sorry! You did not place this request.")
                return redirect(reverse("home"))
        return self.render_to_response(self.get_context_data(object=self.object))

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        order = self.request_service.create_booking()
        return redirect(reverse("request_payment_page", args=[order]))


class RequestTutorPaymentPage(LoginRequiredMixin, RedirectView):
    permanent = False
    query_string = True  #

    def get_redirect_url(self, *args, **kwargs):
        try:
            req = services.SingleRequestService(**kwargs)
            url = req.create_booking()
        except ObjectDoesNotExist:
            raise Http404("No Tutor matches the given query.")
        return reverse("request_payment_page", args=[url])


@login_required
def validate_paystack_ref(request, order, code):
    v = PayStack().validate_transaction(code)
    if v:
        try:
            d = services.DepositMoneyService(order).paystack_validation(
                v["amount_paid"]
            )
            a = wallet_service.WalletService(request.user.id)
            a.update_paystack_auth_code(v["authorization_code"])
            return JsonResponse({"status": True})
        except services.error_exception():
            d = services.SingleRequestService(order)
            d.pay_processing_fee()
            return JsonResponse({"status": True})
    else:
        return JsonResponse({"status": False})


def paystack_webhook(request):
    return JsonResponse(json.dumps(request.POST), safe=False)


class RequestPaymentPage(LoginRequiredMixin, TemplateView):
    template_name = "external/request_payment_page.html"

    def get_object(self):
        self.deposit_service = services.DepositMoneyService(self.kwargs["order"])
        return self.deposit_service.instance

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.deposit_service.has_been_paid():
            messages.error(
                request,
                "Payment with transaction_id #{} has already been processed ".format(
                    self.object.order
                ),
            )
            return redirect(reverse("users:revenue_transactions"))
        return super(RequestPaymentPage, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        status = self.deposit_service.notify_admin_of_payments_made()
        if status:
            return redirect(reverse("users:revenue_transactions"))
        return self.render_to_response(self.get_context_data(object=self.object))

    def get_context_data(self, **kwargs):
        context = super(RequestPaymentPage, self).get_context_data(**kwargs)
        context.update(self.deposit_service.get_payment_data(self.request))
        return context


class PatnershipView(FormView):
    template_name = "pages/partnerships.html"
    form_class = PatnershipForm

    def get_success_url(self):
        return reverse("patnership_completed")

    def form_valid(self, form):
        form.save()
        return super(PatnershipView, self).form_valid(form)


class PaystackAuthorizationView(LoginRequiredMixin, RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        if self.request.GET.get("ttype") == "processing_fee":
            self.service = services.SingleRequestService(kwargs["order"])
        else:
            self.service = services.DepositMoneyService(kwargs["order"])
        response, outcome = self.service.paystack_payment_outcome(self.request)
        if outcome:
            if self.request.GET.get("ttype") != "processing_fee":
                messages.error(
                    self.request,
                    "Sorry This Transaction Failed. Please Try again or use other payment options",
                )
        return response


class PaystackCallBackView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        x = self.request.POST
        logger.info(x)
        y = self.request.GET.get("trxref")
        if y:
            v = utils.PayStack().validate_transaction(y)
            if v:
                try:
                    d = services.DepositMoneyService(kwargs.get("order"))
                    d.notify_admin_of_payments_made(condition=True, **v)
                    messages.info(self.request, "Transaction Payment Successful!")
                    return reverse("users:revenue_transactions")
                except ObjectDoesNotExist:
                    d = services.SingleRequestService(kwargs.get("order"))
                    d.pay_processing_fee()
                    messages.info(self.request, "Processing Fee Payment Successful!")
                    return reverse(
                        "processing_fee_completed", args=[kwargs.get("order")]
                    )
        messages.error(
            self.request,
            "Sorry there was an error in this transaction. contact info@tuteria.com",
        )
        return reverse("request_payment_page", args=[kwargs.get("order")])


class FailedPaymentRedirectView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        messages.error(self.request, "Sorry the payment was cancelled")
        return reverse("request_payment_page", args=[kwargs["order"]])


# class ReferralTutorRequestView(LoginRequiredMixin, TemplateView):
#     template_name = 'external/request-form.html'

#     def get_context_data(self, **kwargs):
#         context = super(ReferralTutorRequestView,
#                         self).get_context_data(**kwargs)
#         if 'form' not in context:
#             form = ReferralTutorRequestForm(initial={})
#             context.update(form=form)
#         return context


class ClientPaymentCompletedView(RedirectView):
    permanent = False
    query_string = True
    #

    def get_redirect_url(self, *args, **kwargs):
        status, message_txt = services.DepositMoneyService.generic_payment_outcome(
            self.request, **kwargs
        )
        if status:
            messages.info(self.request, message_txt)
            return reverse("users:revenue_transactions")
        messages.error(self.request, message_txt)
        return reverse("request_payment_page", args=[kwargs["order"]])


def show_me_the_money(sender, **kwargs):
    ipn_obj = sender
    if ipn_obj.payment_status == ST_PP_COMPLETED:
        if ipn_obj.custom == "Processing Fee Payment":
            user_instance = services.SingleRequestService(ipn_obj.invoice)
            user_instance.pay_processing_fee()
        else:
            client_request = services.DepositMoneyService(ipn_obj.invoice)
            client_request.paypal_payment_outcome(
                ipn_obj.mc_gross, custom=ipn_obj.custom == "Request Payment"
            )
    else:
        pass


valid_ipn_received.connect(show_me_the_money)
