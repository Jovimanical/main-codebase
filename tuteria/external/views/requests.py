# -*- coding: utf-8 -*-
import json
import logging
from django.urls import reverse
from django.http import Http404, JsonResponse
from django.shortcuts import redirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib import messages
from django.contrib.auth import login
from django.core.exceptions import ObjectDoesNotExist
from django.views.generic import TemplateView, RedirectView
from braces.views import LoginRequiredMixin, CsrfExemptMixin
from .mixins import AuthFormMixin, RequestMixin, SecondRequestMixin
from external import forms, helpers
from .display_content import (
    infographics_content,
    testimonials,
    how_it_works,
    how_it_works22,
)
from skills.services import SkillService
from external import services
from pricings.models import Region
from external.models import BaseRequestTutor
from users.models import Constituency
from django.conf import settings

logger = logging.getLogger(__name__)


class ForeignRequestView(RequestMixin, TemplateView):
    form = forms.NigerianLanguagesForm
    online = True
    is_parent = False
    the_category = "Nigerian Languages"


class ForeignAcademicRequestView(RequestMixin, TemplateView):
    form = forms.NigerianLanguagesForm
    online = True
    is_parent = False
    the_category = "School Subjects"


class TutorSelectRequestView(SecondRequestMixin, TemplateView):
    template_name = "external/tutors-select.html"

    def get(self, request, *args, **kwargs):
        area = request.GET.get("area")
        self.object = self.get_object()
        referral_code = request.GET.get("referral_code")
        if len(self.request_service.get_ts_skills) == 0:
            return redirect(
                self.request_service.get_next_url(referral_code=referral_code, **kwargs)
            )
        self.request_service.update_urgency(self.object)
        request.session["tutorskill_subject"] = self.request_service.get_first_subject()
        return super(TutorSelectRequestView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(SecondRequestMixin, self).get_context_data(**kwargs)
        page = self.request.GET.get("page")
        context.update(self.request_service.get_tutor_select_context_data(page=page))
        return context


class TutorOnlineSelectRequestView(SecondRequestMixin, TemplateView):
    template_name = "external/tutors-select.html"


class PricingPackageView(TemplateView):
    template_name = "pages/request_received.html"


class HowView(RedirectView):
    permanent = True
    url = settings.PARENT_REQUEST_URL

class BecomeTutor(RedirectView):
    permanent = True 
    url = settings.BECOME_TUTOR_URL


class StateView(RedirectView):
    permanent = True
    url = settings.PARENT_REQUEST_URL


class SkillRequestView(RequestMixin, TemplateView):
    # class SkillRequestView(, DetailView):
    form = forms.HomeSkillRequestForm
    template_name = "pages/skill-request.html"
    is_parent = False

    def get_areas(self, rr):
        lagos_areas = [x["areas"] for x in rr]
        lagos_areas = [x for y in lagos_areas for x in y]
        return sorted(lagos_areas)

    def get_context_data(self, **kwargs):
        context = super(SkillRequestView, self).get_context_data(**kwargs)
        context["skill"] = self.object
        context["object"] = self.object
        states = self.skill_service.get_supported_states()
        context["valid_states"] = states
        if "Lagos" in states:
            lagos_areas = self.get_areas(Constituency.get_areas_as_dict("Lagos"))
            context["lagos"] = lagos_areas
        if "Abuja" in states:
            context["abuja"] = self.get_areas(Constituency.get_areas_as_dict("Abuja"))
        if "Rivers" in states:
            context["rivers"] = self.get_areas(Constituency.get_areas_as_dict("Rivers"))
        return context

    def get_object(self):
        self.skill_service = SkillService(self.kwargs.get("slug"))
        return self.skill_service.instance

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        slug = ""
        if self.object:
            slug = self.object.slug
        if slug in ["ielts", "gmat", "gre"]:
            return redirect(f"/s/{slug}-tutors")
        if slug in [
            "elementary-english",
            "elementary-mathematics",
            "basic-math",
            "quantitative-reasoning",
            "verbal-reasoning",
            "letters-numbers",
            "english-language",
            "general-mathematics",
            "basic-sciences",
            "basic-technology",
            "basic-computing",
            "computer-science",
            "literature-in-english",
            "physics",
            "chemistry",
            "biology",
            "government",
            "commerce",
            "economics",
            "christian-religious-studies",
            "geography-tutors",
        ]:
            return redirect(f"/hometutors")
            # return redirect(f"/s/hometutoring/about-child")
        if not slug:
            raise Http404("Skill could not be found")
        if "region" in request.GET and request.GET.get("region"):
            reg = request.GET.get("region")
            if len(reg) > 25:
                raise Http404("This is a bogus request Parameter.")
            reg = reg.replace(" ", "-")
            try:
                return redirect(reverse("state_skill_view", args=[slug, reg]))
            except:
                raise Http404
        self.region = ""
        return super(SkillRequestView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super(SkillRequestView, self).post(request, *args, **kwargs)

    def get_subject(self):
        return [self.object.name]


class RequestTutorView(RequestMixin, TemplateView):
    form = forms.HomeSkillRequestForm
    template_name = "pages/request_tutor.html"
    is_parent = False


class RequestView(SecondRequestMixin, TemplateView):
    template_name = "pages/second-request.html"

class PreviousRequestView(RequestView):
    default = False


class PrimeRequestView(RequestMixin, TemplateView):
    template_name = "pages/prime-request.html"
    is_parent = False
    form = forms.PrimeRequestForm

    def get_context_data(self, **kwargs):
        context = super(PrimeRequestView, self).get_context_data(**kwargs)
        set_a, set_b = context["form"].get_prices()
        context.update(set_a=set_a, set_b=set_b)
        return context

    def get_redirect_url(self, instance, order):
        user = self.login_user(instance.user)
        booking_url = "%s" % (reverse("request_payment_page", args=[order]))
        if user is not None:
            return booking_url
        if self.request.user.is_authenticated:
            return booking_url
        return "%s?redirect_url=%s" % (reverse("account_login"), booking_url)

    def login_user(self, user):
        # log in the user
        user.backend = "django.contrib.auth.backends.ModelBackend"
        login(self.request, user)
        return user

    def post(self, request, *args, **kwargs):
        instance, form = services.ExternalService.save_first_form(
            request, prime=True, passed_form=self.form
        )
        if instance:
            self.request_service = services.SingleRequestService(slug=instance.slug)
            order = self.request_service.create_booking()
            url = self.get_redirect_url(instance, order)
            return redirect(url)
        messages.error(request, "There are errors in your form.")
        return self.render_to_response(self.get_context_data(form=form))


def validate_referral_code(request, slug):
    referral_code = request.GET.get("referral_code")
    rq = services.SingleRequestService(slug)
    status = False
    if rq.is_valid_code(referral_code):
        status = True
    return JsonResponse(dict(status=status))


class SelectTutorView(TemplateView):
    template_name = ""


class PricingView(TemplateView):
    template_name = "pages/pricing-page.html"

    def get_object(self):
        self.object = services.SingleRequestService(self.kwargs.get("slug"))
        return self.object

    def post(self, request, *args, **kwargs):
        self.get_object()
        # import pdb
        # pdb.set_trace()
        form = self.object.save_third_form(request)
        if form:
            return self.render_to_response(self.get_context_data(form=form))
        return redirect(reverse("redirect_completion", args=[kwargs.get("slug")]))

    def get_context_data(self, **kwargs):
        context = super(PricingView, self).get_context_data(**kwargs)
        self.get_object()
        discount = self.request.session.get("discount_received", 0)
        self.request.session["the_request_url"] = self.request.get_full_path()
        context["discount"] = discount
        context.update(self.object.third_request_form_context(self.request))
        if not "form" in kwargs:
            form = self.object.get_pricing_form(self.request)
            context.update(form=form(instance=self.object.instance))
        return context


class DiscountRedirectUrl(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        url = self.request.session.pop("the_request_url", None)
        if not url:
            raise Http404("Invalid request")
        self.request.session["discount_received"] = 10
        return url


class IntermediateLoginView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        rq = services.SingleRequestService(kwargs["slug"])
        user = self.login_user(rq.instance.user)
        booking_url = "%s?pricing=%s" % (
            reverse("client_request_completed", args=[rq.instance.slug]),
            rq.instance.plan,
        )
        if user is not None:
            return booking_url
        if self.request.user.is_authenticated:
            return booking_url
        return "%s?redirect_url=%s" % (reverse("account_login"), booking_url)

    def login_user(self, user):
        # log in the user
        if user:
            user.backend = "django.contrib.auth.backends.ModelBackend"
            login(self.request, user)
        return user


class OnlinePaymentRedirectView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        try:
            req = services.SingleRequestService(slug=kwargs["slug"])
            url = req.create_online_booking(kwargs["tutor_slug"])
        except ObjectDoesNotExist:
            raise Http404("No Request matches the given query.")
        user = self.login_user(req.get_user())
        booking_url = "%s" % (reverse("request_payment_page", args=[url]),)

        if user is not None:
            return booking_url
        if self.request.user.is_authenticated:
            return booking_url
        return "%s?redirect_url=%s" % (reverse("account_login"), booking_url)

    def login_user(self, user):
        # log in the user
        user.backend = "django.contrib.auth.backends.ModelBackend"
        login(self.request, user)
        return user


class TempProcessingFeeRedirectPage(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        try:
            req = services.SingleRequestService(slug=kwargs["slug"])
        except ObjectDoesNotExist:
            raise Http404("No Request matches the given query.")
        user = self.login_user(req.get_user())
        booking_url = "%s" % (reverse("request_payment_page", args=[url]),)

        if user is not None:
            return booking_url
        if self.request.user.is_authenticated:
            return booking_url
        return "%s?redirect_url=%s" % (reverse("account_login"), booking_url)

    def login_user(self, user):
        # log in the user
        user.backend = "django.contrib.auth.backends.ModelBackend"
        login(self.request, user)
        return user


class FinalRequestView(LoginRequiredMixin, TemplateView):
    template_name = "pages/request_completed.html"

    # template_name = 'external/processing_fee_completed.html'

    def get(self, request, *args, **kwargs):
        request.session.pop("discount_received", None)
        self.rq_service = services.SingleRequestService(self.kwargs["slug"])
        if self.rq_service.has_paid_fee:
            return redirect(
                reverse("processing_fee_completed", args=[self.rq_service.slug])
            )
        return super(FinalRequestView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(FinalRequestView, self).get_context_data(**kwargs)
        context.update(self.rq_service.get_payment_data(self.request))
        return context


class ProcessingCancelView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        messages.error(self.request, "You have cancelled Payment of the processing fee")
        return reverse("client_request_completed", args=[kwargs["slug"]])


class ProcessingViewRedirectView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        status, msg_txt = services.SingleRequestService.generic_payment_outcome(
            self.request, **kwargs
        )
        if status:
            messages.info(self.request, msg_txt)
            return reverse("processing_fee_completed", args=[kwargs["slug"]])
        messages.error(self.request, msg_txt)
        return reverse("client_request_completed", args=[kwargs["slug"]])


class ProcessingViewCompletedView(TemplateView):
    template_name = "external/processing_fee_completed.html"

    def get_context_data(self, **kwargs):
        context = super(ProcessingViewCompletedView, self).get_context_data(**kwargs)
        a = services.SingleRequestService(self.kwargs["slug"])
        context["object"] = a.instance
        return context


class OnlineRequestCompletedView(ProcessingViewCompletedView):
    template_name = "external/online_request_completed.html"


class RequestBookingPage(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        rq = services.SingleRequestService(kwargs["slug"])
        user = self.login_user(rq.instance.user)
        booking_url = reverse("selected_tutors", args=[rq.instance.slug])
        if user is not None:
            return booking_url
        if self.request.user.is_authenticated:
            return booking_url
        return "%s?redirect_url=%s" % (reverse("account_login"), booking_url)

    def login_user(self, user):
        # log in the user
        user.backend = "django.contrib.auth.backends.ModelBackend"
        login(self.request, user)
        return user


def determine_price_earnable(request):
    price = {}
    params = forms.DeterminePriceEarnableForm()
    if request.method == "POST":
        params = forms.DeterminePriceEarnableForm(request.POST)
        if params.is_valid():
            price = BaseRequestTutor.determine_price_earnable(params)

    return JsonResponse(price)
