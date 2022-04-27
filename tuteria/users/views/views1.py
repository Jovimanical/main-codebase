# -*- coding: utf-8 -*-

from __future__ import absolute_import, division, print_function

import copy
import datetime
import json
import logging
import math
from builtins import (
    super,
)  # zip, round, input, int, pow, object)bytes, str, open, , range,
from operator import or_
from allauth.socialaccount.signals import pre_social_login
import dateutil.parser
from django.core.handlers.wsgi import WSGIRequest
import django_filters
from allauth.account.adapter import get_adapter
from allauth.account.models import EmailAddress
from allauth.account.views import (
    AjaxCapableProcessFormViewMixin,
    _ajax_response,
    SignupView as BSignupView,
)
from braces.views import (
    CsrfExemptMixin,
    JsonRequestResponseMixin,
    JSONResponseMixin,
    LoginRequiredMixin,
)
from django import forms as django_forms
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.sites.models import Site
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.urls import reverse
from django.db.models import Prefetch, Q
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.shortcuts import render
from django.utils.functional import cached_property
from django.views.generic import (
    DetailView,
    FormView,
    RedirectView,
    TemplateView,
    UpdateView,
    View,
)
from mailchimp import ListDoesNotExistError
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.renderers import JSONRenderer

from config import utils
from config.local_cache import LocalCache
from external.services import SingleRequestService
from registration import forms
from registration.views import RegistrationFormMixin
from skills.models import TutorSkill
from users import services
from wallet.forms import UserPayoutForm
from ..api import ApiUserSerializer, ApiUserWithLocationSerializer
from ..forms import (
    CalendarFormSet,
    MailingListForm,
    PhoneNumberForm,
    SubjectPopulateForm,
    TutorAddressForm,
    UserMediaForm,
    UserMediaMiniForm,
    UserUploadForm,
    UserUploadMiniForm,
    UserVideoForm,
)

# Create your views here.
from ..mailchimp_api import MailChimpAPI
from ..models import PhoneNumber, User, UserProfile, get_state_coordinate
from ..services import TutorService

logger = logging.getLogger(__name__)
# from simple_social_login.google_login import signals as google_signals
# from simple_social_login.fb_login import signals as fb_signals
from django.dispatch import receiver
from allauth.socialaccount.models import SocialToken, SocialLogin
from allauth.socialaccount.models import SocialApp, SocialAccount

from skills.views.services import NewTutorFlowService, Constants


class ValidationMixin(JSONResponseMixin):
    json_dumps_kwargs = {"indent": 2}

    def obj_query(self, request):
        return None

    def get(self, request, *args, **kwargs):
        obj = self.obj_query(request)
        if obj:
            unique = True
            status = 200
        else:
            unique = False
            status = 404
        return self.render_json_response(dict(status=unique), status=status)


class UserEmailValidationView(ValidationMixin, View):
    def obj_query(self, request):
        field_value = request.GET["email"]
        return User.objects.filter(email=field_value).all()


class UserPhoneNumberValidationView(ValidationMixin, View):
    def obj_query(self, request):
        field_value = request.GET["phone_number"].replace(" ", "")
        return PhoneNumber.objects.filter(number=field_value).all()


class LoggedInUserPhoneValidation(LoginRequiredMixin, ValidationMixin, View):
    def obj_query(self, request):
        field_value = request.GET["number"].replace(" ", "")
        query1 = (
            PhoneNumber.objects.filter(number=field_value)
            .filter(owner=request.user)
            .all()
        )
        if not query1:
            query2 = PhoneNumber.objects.filter(number=field_value).all()
            if query2:
                return True
        return False


def to_international(no):
    split = no.split("+234")
    if len(split) > 1:
        return no
    return "+234" + no[1:]


# Todo: Upgrade to use twilio for phone verification


@login_required
def verify_primary_phone_number(request):
    data = request.POST.dict()
    numbers = {
        "number": to_international(data.get("number")),
        "primary_phone_no1": to_international(data.get("primary_phone_no1")),
    }

    form = PhoneNumberForm(numbers)
    if form.is_valid():
        form.save(user=request.user)
        return HttpResponse(json.dumps({"status": "success"}), "application/json")

    return HttpResponse(
        json.dumps({"status": "failed"}), "application/json", status=400
    )


@login_required
def get_languages(request):
    result = [
        (l.language, l.full_language) for l in request.user.profile.languages.all()
    ]
    data = json.dumps(dict(result))
    return HttpResponse(data, content_type="application/json")


@login_required
def resend_email(request):
    email = request.user.email
    email_address = get_object_or_404(EmailAddress, user=request.user, email=email)
    logger.debug(email_address)
    get_adapter().add_message(
        request,
        messages.INFO,
        "account/messages/" "email_confirmation_sent.txt",
        {"email": email},
    )
    email_address.send_confirmation(request)
    return redirect(reverse("users:edit_verification"))


@login_required
def upload_doc(request, doc_type):
    form = UserUploadForm(request.POST)
    if form.is_valid():
        form.save(user=request.user, doc=doc_type)
        ret = dict(success=True)
        status = 200
    else:
        ret = dict(success=False)
        status = 400

    return HttpResponse(json.dumps(ret), content_type="application/json", status=status)


class MailingListSignUpView(AjaxCapableProcessFormViewMixin, FormView):
    form_class = MailingListForm

    def get_mailing_list_api(self):
        return MailChimpAPI(utils.get_mailchimp_api(), settings.MAILCHIMP_LIST_ID)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(dict(mail_list=True))
        return context

    def form_valid(self, form):
        instance = form.save(commit=False)
        mail_api = self.get_mailing_list_api()
        try:
            mail_api.add_to_mailing_list(instance)
        except ListDoesNotExistError:
            messages.info(self.request, "Please Try again")
        return super().form_valid(form)

    def form_invalid(self, form):
        return super().form_invalid(form)

    def get_success_url(self):
        return reverse("users:mailing_subscription_confirm")


class ConfirmMailingSubscription(RedirectView):
    permanent = False

    def get_redirect_url(self):
        messages.info(
            self.request, "An email has been sent to your inbox. Please confirm."
        )
        return reverse("home")


def after_login(request):
    return redirect(reverse("users:dashboard"))


class UserRedirectView(LoginRequiredMixin, RedirectView):
    permanent = False

    def get_redirect_url(self):
        user = self.request.user
        UserProfile.objects.filter(user=user).update(image_approved=True)
        LocalCache.populate_user_cache(user)
        logger.info(self.request.GET)
        return reverse("users:dashboard")


class SharedMixin(object):
    def get_form_kwargs(self):
        return {}


class UserMixin(LoginRequiredMixin, SharedMixin):
    model = User

    def get_object(self, **kwargs):
        return services.UserService(self.request.user.email)

    @cached_property
    def user_profile(self):
        return self.object.profile

    def get_form_kwargs(self):
        """
        Returns the keyword arguments for instantiating the form.
        """
        kwargs = super(UserMixin, self).get_form_kwargs()
        if hasattr(self, "object"):
            kwargs.update({"instance": self.object.user})
        return kwargs


class AjaxCapablePostFormMixin(object):
    def custom_form_invalid(self, **forms):
        if self.request.is_ajax():
            r = {}
            for key, val in forms.items():
                r.update({key: val.errors})
            return JsonResponse({"errors": r}, status=400)
        return self.render_to_response(self.get_context_data(**forms))


class BaseNewFlowView(UserMixin):
    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        form_params = self.get_form_kwargs()
        form_params["object"] = form_params["instance"]
        return self.render_to_response(self.get_context_data(**form_params))


class JobsView(BaseNewFlowView, TemplateView):
    template_name = "users/jobs.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(self.request.user, Constants.JOBS)
        context_data["initial_data"] = json.dumps(data)
        context_data["booking_key"] = "bookings"
        return context_data


class JobsDetailView(BaseNewFlowView, TemplateView):
    template_name = "users/jobs.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(self.request.user, Constants.JOBS)
        new_jobs = [
            x
            for x in data["jobs"]
            if x["slug"].lower() == self.kwargs["request_slug"].lower().strip()
        ]
        data["jobs"] = new_jobs
        context_data["initial_data"] = json.dumps(data)
        context_data["booking_key"] = "requests"
        return context_data


class PostApplication(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/post-confirmation.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.POST_APPLICATION
        )
        context["initial_data"] = json.dumps(data)
        return context


class EducationHistoryView(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/education-history.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.EDUCATION_HISTORY
        )
        context_data["initial_data"] = json.dumps(data)
        return context_data


class WorkHistoryView(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/work-history.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.WORK_HISTORY
        )
        context_data["initial_data"] = json.dumps(data)
        return context_data


class LocationInfoView(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/location-info.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.LOCATION_INFO
        )
        context_data["initial_data"] = json.dumps(data)
        return context_data


class ProfilePictureView(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/profile-pic.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.PROFILE_PHOTO
        )
        context_data["initial_data"] = json.dumps(data)
        return context_data


class ScheduleView(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/schedule.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.SCHEDULE_INFO
        )
        context_data["initial_data"] = json.dumps(data)
        return context_data


class TeachingProfileView(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/teaching-profile.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.TEACHING_PROFILE
        )
        context_data["initial_data"] = json.dumps(data)
        return context_data


class VerificationView(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/verification.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.VERIFICATION
        )
        context_data["initial_data"] = json.dumps(data)
        return context_data


class GuarantorView(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/guarantors.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.VERIFICATION
        )
        context_data["initial_data"] = json.dumps(data)
        return context_data


class UploadProofView(BaseNewFlowView, TemplateView):
    template_name = "users/edit_profile/new-tutor-pages/proof.html"

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.VERIFICATION
        )
        context_data["initial_data"] = json.dumps(data)
        return context_data


def new_flow_post(request: WSGIRequest):
    if request.method == "POST":
        post_data = request.POST
        files = request.FILES
        if not post_data:
            post_data = json.loads(request.body)
        result = NewTutorFlowService.post_action(post_data, request.user, files=files)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse(
        {"status": False, "errors": "Invalid method. Only POST allowed"}, status=400
    )


class UserEditView(
    UserMixin, AjaxCapableProcessFormViewMixin, AjaxCapablePostFormMixin, TemplateView
):
    template_name = "users/edit_profile/personal_info.html"

    def get_success_url(self):
        result = self.object.tutor_application_next_url()
        if result:
            return result
        return reverse("users:edit_profile")

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        form_params = self.object.get_profile_forms()
        return self.render_to_response(self.get_context_data(**form_params))

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        tutor_intent = request.POST.get("tutor_intent")
        if not tutor_intent:
            form_params = self.object.update_profile_details(request)
        else:
            form_params = self.object.validate_profile_forms(request)
        if not form_params:
            messages.success(self.request, "Profile Information updated!")
            return redirect(self.get_success_url())
        return self.custom_form_invalid(**form_params)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        data = NewTutorFlowService.get_profile_info(
            self.request.user, Constants.PERSONAL_INFO
        )
        context["initial_data"] = json.dumps(data)
        return context


class MediaMixin(UserMixin):
    def params(self):
        return {}

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST)
        if form.is_valid():
            form.save(user=request.user, **self.params())
            ret = dict(success=True)
            status = 200
        else:
            ret = dict(success=False)
            status = 400

        return HttpResponse(
            json.dumps(ret), content_type="application/json", status=status
        )


class UserEditMediaView(MediaMixin, UpdateView):
    form_class = UserMediaForm

    def init_form(self):
        if self.request.is_featured:
            return UserMediaMiniForm(instance=self.user_profile)
        return UserMediaForm(instance=self.user_profile)

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        profile = self.object.profile
        if request.is_featured:
            logger.info(request.FILES)
            form = UserMediaMiniForm(request.POST, request.FILES, instance=profile)
        else:
            form = self.form_class(request.POST, instance=profile)

        if request.POST.get("upload_type") == "video":
            logger.info(request.POST)
            video_form = UserVideoForm(request.POST, instance=profile)
            if video_form.is_valid():
                ret, status = self.object.save_photo_and_video(video_form)
            else:
                ret = dict(success=False)
                status = 400
        else:
            if form.is_valid():
                ret, status = self.object.save_photo_and_video(form, _type="photo")
            else:
                ret = dict(success=False)
                status = 400
        if request.is_featured:
            # if self.request.user.tutor_intent:
            #     return redirect(self.request.user.tutor_req.get_next_url())
            return redirect(reverse("users:edit_media"))
        else:
            return redirect(reverse("users:edit_media"))
            # return HttpResponse(json.dumps(ret),
            # content_type='application/json', status=status)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        video_form = UserVideoForm(instance=self.object.user)
        context.update(video_form=video_form, form=self.init_form())
        return context


class UserUploadMixin(MediaMixin):
    form_class = UserUploadForm
    doc_type = None

    def init_form(self):
        if self.request.is_featured:
            return UserUploadMiniForm()
        return UserUploadForm

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        if request.is_featured:
            form = UserUploadMiniForm(request.POST, request.FILES)
        else:
            form = self.form_class(request.POST)

        if form.is_valid():
            ret, status = self.object.save_identification(form, self.doc_type)
        else:
            ret = dict(success=False)
            status = 400

        if request.is_featured:
            if self.object.user.tutor_intent:
                return redirect(self.object.tutor_req.get_next_url())
            return redirect(reverse("users:edit_verification"))
        else:
            return JsonResponse(ret, status=status)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(form=self.init_form())
        return context

    def get_object(self, **kwargs):
        self.doc_type = self.kwargs.get("doc_type", None)
        return services.UserService(self.request.user.email)

    def params(self):
        return dict(doc=self.doc_type)


class UserUploadView(UserUploadMixin, UpdateView):
    pass


class UserVerificationView(UserUploadMixin, UpdateView):
    doc_type = "identity"


class UserDashboardView(UserMixin, DetailView):
    template_name = "users/dashboard2.html"

    @cached_property
    def the_object(self):
        return services.UserService(self.request.user.email)

    def get_object(self):
        return self.the_object

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        self.get_notifications()
        context.update(object=self.object, usdetails=self.response_for_js_obj())
        return context

    def get_notifications(self):
        self.object = self.get_object()
        self.object.get_notifications()
        self.object.get_reputation_list()

    def response_for_js_obj(self):
        from referrals.templatetags.tuteria_thumbnail import ImageService

        result = {}
        user = self.object.user
        profile_pic = self.object.profile.profile_pic
        profile = dict(
            profile_pic_mobile=ImageService.get_url(
                profile_pic,
                **{"class": "img-responsive"},
                alt=user.first_name,
                format="jpg",
                crop="fill",
                height=80,
                width=80,
            ),
            profile_pic=ImageService.get_url(
                profile_pic,
                height=250,
                width=250,
                format="jpg",
                crop="fill",
                **{"class": "img-responsive center-block"},
                alt=user.first_name,
            ),
            registration_level=self.object.profile.registration_level,
        )
        notifications = [
            dict(text=x["msg"], link=x["action"]) for x in self.object.notifications
        ]
        tr = self.object.tutor_req
        tutor_req = dict(
            percentage=tr.percentage(),
            has_completed_verification=tr.has_completed_verification,
            get_next_url=tr.get_next_url(),
        )
        reputations = [
            dict(condition=x.condition, score=x.score, url=x.get_absolute_url())
            for x in self.object.reputations
        ]
        user = dict(
            first_name=user.first_name,
            reputation=user.reputation(),
            is_tutor=self.object.is_tutor,
            notifications=notifications,
            tutor_intent=user.tutor_intent,
            profile=profile,
            tutor_req=tutor_req,
            reputations=reputations,
        )
        urls = {
            "profile": self.object.get_absolute_url(),
            "edit_profile": reverse("users:edit_profile"),
            "how_tutoring_works": reverse("registration:how_tutoring_works2"),
            "help_article": reverse("help:article_detail", args=[17]),
        }
        quick_links = []
        if self.object.profile.application_status > 0:
            pp = "users:edit_tutor_profile"
            if settings.USE_NEW_FLOW:
                pp = "users:user_guarantors"
            quick_links.append(
                dict(
                    url=f"{reverse(pp)}#guarantor_section",
                    text="Update Guarantors",
                )
            )
        if self.object.profile.application_status == self.object.profile.VERIFIED:
            education_path = "users:edit_tutor_profile"
            profile_path = "users:update_tutor_details"
            if settings.USE_NEW_FLOW:
                education_path = "users:user_education_history"
                profile_path = "users:edit_profile"
            quick_links.extend(
                [
                    dict(
                        url=f"{reverse(profile_path)}",
                        text="Update Tutor Profile",
                    ),
                    dict(
                        url=f"{reverse(education_path)}",
                        text="Edit Work & Education",
                    ),
                ]
            )
        else:
            quick_links.append(
                dict(url=f'{reverse("trust_safety")}', text="Trust & Safety")
            )
        verification_link = "users:edit_verification"
        if settings.USE_NEW_FLOW:
            verification_link = "users:user_new_verifications"
        quick_links.append(
            dict(url=f"{reverse(verification_link)}", text="Verifications")
        )
        return {"user": user, "urls": urls, "quick_links": quick_links}


def copy_request(request):
    req_copy = copy.copy(request)
    req_copy.POST = request.POST.copy()
    return req_copy


def get_phone_number(request, previous_number):
    if not previous_number:
        return ""
    if previous_number.startswith("+234"):
        previous_number = previous_number[4:]
    if previous_number.startswith("0"):
        previous_number = previous_number[1:]
    return "+234{}".format(previous_number)


class UserProfileView(TemplateView):
    template_name = "users/profile.html"

    def get_object(self):
        try:
            self.object = services.TutorService.get_user(slug=self.kwargs.get("slug"))
        except ObjectDoesNotExist:
            raise Http404("This user does not exist")
        else:
            return self.object

    @cached_property
    def user_profile(self):
        return self.object.profile

    def rating_decimal(self, score):
        if type(score) == float:
            dec, integer = math.modf(score)
            pos = True if dec >= 0.2 else False
            return range(int(integer)), pos

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        url, form = self.object.client_actions_on_request_post(request)
        if url:
            referral_code = request.POST.get("referral_code") or ""
            return redirect(url + "?referral_code=" + referral_code)
        return self.render_to_response(
            self.get_context_data(form=form, object=self.object)
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        self.object = self.get_object()
        pagination, result = self.object.get_reviews().paginate(
            number=10, page=self.request.GET.get("page")
        )
        self.request.session["from_skill_page"] = False
        self.request.session["tutorskill_subject"] = None
        skills = self.object.active_tutorskills()
        first_skill = skills[0] if len(skills) > 0 else None
        carousel = None
        group = [skills[i : i + 3] for i in range(0, len(skills), 3)]
        active_subjects = self.object.active_tutorskills(profile_values=True)
        context.update(
            object=self.object,
            reviews=self.object.reviews,
            skills=skills,
            first_skill=first_skill,
            carousel=carousel,
            groups=group,
            ratings=result,
            paginator=pagination,
            subjects=active_subjects,
        )
        condition = "form" not in kwargs
        context.update(self.object.request_form(self.request, get_form=condition))
        return context


class RequestTutorRedirectView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        self.request.session["tutorskill_subject"] = kwargs["skill_id"]
        return reverse(
            "users:request_second_step", args=[kwargs["slug"], kwargs["request_slug"]]
        )


class ExistingTutorRedirectView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        pk = kwargs["pk"]
        slug = kwargs["slug"]
        redirect_url = self.request.GET.get("redirect_url")
        rq = None
        try:
            rq = User.objects.get(slug=slug)
        except ObjectDoesNotExist:
            raise Http404("Booking does not exist")
        booking_url = reverse("users:edit_profile")
        if redirect_url:
            booking_url = redirect_url
        if rq:
            if rq.pk == int(pk):

                user = self.login_user(rq)
                if user is not None:
                    return booking_url

        if self.request.user.is_authenticated:
            return booking_url
        return "%s?next=%s" % (reverse("account_login"), booking_url)

    def login_user(self, user):
        user.backend = "django.contrib.auth.backends.ModelBackend"
        login(self.request, user)
        return user


class TutorSecondStepRequestView(TemplateView):
    template_name = "users/second_form.html"
    request_slug = None
    instance = None

    def get_initializers(self):
        self.user_service = TutorService(slug=self.kwargs["slug"])
        self.object = self.user_service.user
        self.request_service = SingleRequestService(
            slug=self.kwargs.get("request_slug")
        )
        self.request_instance = self.request_service.instance

    def get(self, request, *args, **kwargs):
        self.get_initializers()
        return self.render_to_response(self.get_context_data(object=self.object))

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests, instantiating a form instance with the passed
        POST variables and then checked for validity.
        """
        # import pdb
        # pdb.set_trace()
        self.get_initializers()
        # form_details = self.object.tutorskill_set.active().form_details()
        slug, form = self.request_service.save_second_form(
            request, user_service=self.user_service, param=True
        )
        if slug:
            self.request.session.pop("from_skill_page", False)
            self.request.session.pop("tutorskill_subject", None)

            user_instance, password = self.request_service.create_user_instance_in_form(
                request
            )
            user = authenticate(email=user_instance.email, password=password)
            user_instance.backend = "django.contrib.auth.backends.ModelBackend"

            # if user is not None:
            login(self.request, user_instance)
            # else:
            #     pass
            order = self.request_service.create_booking(self.object)
            return redirect(reverse("request_payment_page", args=[order]))
            # return redirect(reverse("", args=[kwargs.get('request_slug')]))

            # return redirect(reverse("request_pricing_view", args=[slug]) +
            # "?referral_code=%s" % request.referral_code)
        return self.render_to_response(self.get_context_data(form=form))

    def get_ts(self):
        my_pk = self.request.session.get("tutorskill_subject", None)
        if my_pk:
            return self.user_service.specific_skill(my_pk)
        if not my_pk and len(self.request_instance.request_subjects) > 0:
            return self.user_service.specific_skill(
                None, name=self.request_instance.request_subjects[0]
            )
        return None

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from_skill_page = self.request.session.get("from_skill_page", False)
        condition = "form" not in context
        selected_skill = self.get_ts()
        if selected_skill:
            selected_skill = selected_skill.skill.name
        response = self.request_service.second_request_form_context(
            self.request.referral_code,
            param=True,
            condition=condition,
            user_service=self.user_service,
            selected_skill=selected_skill,
        )

        context.update(response)
        context["object"] = self.user_service.user
        ts = self.get_ts()
        context.update(from_skill_page=from_skill_page, specific_skill=ts)
        price = self.request_service.get_per_hour_price(ts)
        currency = "₦" if price > 100 else "$"
        processing_fee = settings.PROCESSING_FEE
        if price < 100:
            processing_fee = settings.PROCESSING_FEE / 250
        context.update(
            price=price, currency=currency, processing_fee=int(processing_fee)
        )
        return context

    def get_extras(self):
        return dict(ts=self.get_ts())


class UserPayoutView(UserMixin, DetailView):
    def get_payout_options(self):
        self.object = self.get_object()
        return self.object.user.userpayout_set.all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        payout_options = self.get_payout_options()
        if not context.get("payment_form", None):
            payment_form = UserPayoutForm(filters=payout_options)
            context["payment_form"] = payment_form
        context.update(payout_options=payout_options)
        return context

    def post(self, request, *args, **kwargs):
        payment_form = UserPayoutForm(request.POST, filters=self.get_payout_options())
        if payment_form.is_valid():
            ff = payment_form.save(commit=False)
            ff.user = self.request.user
            ff.save()
            p_type = "Bank" if ff.payout_type == 1 else "Paga"
            # messages.info(request,"You have successfully added %s payment" % p_type)
            response = redirect(reverse("users:account"))
        else:
            response = self.render_to_response(
                self.get_context_data(payment_form=payment_form, **kwargs)
            )
        return _ajax_response(self.request, response, form=payment_form)


def SkillFiler(queryset, value):
    qq = value.split(",")
    fil = []
    first = Q(tutorskill__skill__name__in=qq)
    fil.append(first)
    z = [Q(tutorskill__skill__name__icontains=u) for u in qq]
    fil.extend(z)
    return queryset.filter(reduce(or_(fil)))


class AngularUserView(TemplateView):
    template_name = "users/user_client.html"


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = "page_size"
    max_page_size = 100000


class UserFilter(django_filters.FilterSet):
    email = django_filters.CharFilter(name="email", lookup_type="istartswith")
    description = django_filters.CharFilter(
        name="profile__description", lookup_type="icontains"
    )
    address = django_filters.CharFilter(
        name="location__address", lookup_type="icontains"
    )
    state = django_filters.CharFilter(name="location__state")
    course = django_filters.CharFilter(
        name="education__course", lookup_type="icontains"
    )
    we_name = django_filters.CharFilter(
        name="workexperience__name", lookup_type="icontains"
    )
    we_role = django_filters.CharFilter(
        name="workexperience__role", lookup_type="icontains"
    )
    skill_name = django_filters.CharFilter(method="filter_skill_name")
    ts_description = django_filters.CharFilter(
        name="tutorskill__description", lookup_type="icontains"
    )
    pks = django_filters.CharFilter(method="filter_pks")
    tutor_description = django_filters.CharFilter(
        name="profile__tutor_description", lookup_type="icontains"
    )

    class Meta:
        model = User
        fields = [
            "email",
            "description",
            "address",
            "state",
            "course",
            "we_name",
            "we_role",
            "skill_name",
            "ts_description",
            "tutor_description",
            "pks",
        ]

    def filter_skill_name(self, queryset, value):
        qq = value.split(",")
        fil = []
        first = Q(tutorskill__skill__name__in=qq)
        fil.append(first)
        z = [Q(tutorskill__skill__name__icontains=u) for u in qq]
        fil.extend(z)
        return queryset.filter(reduce(or_, fil))

    def filter_pks(self, queryset, value):
        return queryset.filter(pk__in=value.split(","))


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    serializer_class = ApiUserSerializer
    # queryset = User.objects.with_locations().select_related('profile').prefetch_related('location_set','education_set',
    # 'workexperience_set','tutorskill_set')
    queryset = User.objects.all()
    filter_class = UserFilter
    pagination_class = StandardResultsSetPagination
    lookup_field = "slug"

    def get_serializer_class(self):
        with_location = self.request.query_params.get("with_location")
        if with_location:
            return ApiUserWithLocationSerializer
        return super(AdminUserViewSet, self).get_serializer_class()


class TutorSkillService:
    @staticmethod
    def get_2_tutors():
        from skills.models import TutorSkill

        return [
            TutorSkill.objects.filter(pk=9847).first(),
            TutorSkill.objects.filter(pk=7947).first(),
        ]


class ReferralSignupView(DetailView):
    model = User
    template_name = "pages/referral.html"

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if not self.object.is_referrer:
            raise Http404("This page does not exists")
        # if request.user.is_authenticated:
        #     messages.info(request,"You are already a user on Tuteria")
        #     return redirect(reverse('request_meeting_redirect'))
        if hasattr(self.object, "ref_instance"):
            request.referral_code = self.object.ref_instance.referral_code
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        used_credit = True
        user_name = self.object.first_name
        meta_description = (
            "Click here now to join {} on Tuteria and get the best tutors"
            " in your area for any subject, skill or exam."
        ).format(user_name)
        if user.is_authenticated:
            if hasattr(user, "ref_instance"):
                ref_instance = user.ref_instance
                if ref_instance.referred_by:
                    used_credit = ref_instance.used_credit
        context.update(
            sk=TutorSkill.objects.active()[:2],
            t_model=TutorSkillService.get_2_tutors(),
            used_credit=used_credit,
            meta_description=meta_description,
        )
        return context


class TutorUpdateMixin(LoginRequiredMixin):
    template_name = "users/update_details.html"

    def get_context_data(self, **kwargs):
        context = super(TutorUpdateMixin, self).get_context_data(**kwargs)
        tutor_address = self.request.user.location_set.filter(addr_type=2).first()
        if not "address_form" in context:
            s = None
            if tutor_address:
                s = tutor_address.state
            tutor_address_form = TutorAddressForm(instance=tutor_address, user_state=s)
        else:
            tutor_address_form = context["address_form"]
        coordinate = get_state_coordinate(tutor_address)
        context.update(address_form=tutor_address_form, coordinate=coordinate)
        return context


def get_regions(request):
    state = request.GET.get("state", "")
    from users.models import Constituency

    result = []
    result = Constituency.objects.filter(state=state).values("name", "areas", "id")
    return JsonResponse({"data": list(result)})


class NewUpdateAvailability(RedirectView):
    permanent = True

    def get_redirect_url(self, *args, **kwargs):
        return reverse(
            "users:tutor_path_redirect", args=[self.request.user.slug, "schedule"]
        )


class UpdateCalendarView(TutorUpdateMixin, TemplateView):
    calendar = None

    def get(self, request, *args, **kwargs):
        user = request.user
        self.calendar = user.has_mini_calendar
        if self.calendar:
            date_modified = dateutil.parser.parse(self.calendar.last_modified)
            days_elapsed = datetime.datetime.now() - date_modified
            # if days_elapsed.days < 30 and user.has_valid_address:
            #     return redirect(reverse('tutoring-jobs'))
        return super(UpdateCalendarView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        user = request.user
        self.calendar = user.has_mini_calendar
        calendar_form = CalendarFormSet(request.POST)
        if calendar_form.is_valid():
            calendar_form.update_calender(user)
            messages.info(request, "Your calendar has been updated.")
            return redirect(request.path)
        return self.render_to_response(
            self.get_context_data(calendar_form=calendar_form, **kwargs)
        )

    def get_calendar_form_initials(self):
        initial = [
            {"weekday": x, "time_slot": []}
            for x in [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ]
        ]
        if self.calendar:
            weekdays = [y.weekday for y in self.calendar.days]
            initial = [u.__dict__ for u in self.calendar.days] + [
                w for w in initial if w.get("weekday") not in weekdays
            ]
        return initial

    def get_context_data(self, **kwargs):
        context = super(UpdateCalendarView, self).get_context_data(**kwargs)
        if not "calendar_form" in context:
            calendar_formset = CalendarFormSet(
                initial=self.get_calendar_form_initials()
            )
            context.update(calendar_form=calendar_formset)
        return context


class UpdateHomeAddress(TutorUpdateMixin, TemplateView):
    def post(self, request, *args, **kwargs):
        user = request.user
        tutor_address = self.request.user.location_set.filter(addr_type=2).first()
        state = None
        if tutor_address:
            state = tutor_address.state
        tutor_address_form = TutorAddressForm(
            request.POST, instance=tutor_address, user_state=state
        )
        if tutor_address_form.is_valid():
            a = tutor_address_form.save(commit=False)
            a.user = user
            a.save()
            messages.info(request, "Your tutoring address has been updated.")
            return redirect(reverse("users:update_tutor_details"))
        messages.error(request, "We couldn't save your address.")
        return self.render_to_response(
            self.get_context_data(address_form=tutor_address_form, **kwargs)
        )


def analytics_csv(request, kind):
    if kind == "tutor":
        users = User.objects.users_with_bookings().prefetch_related(
            "location_set", "workexperience_set"
        )

        rows = [
            [
                "Vicinity",
                "State",
                "booking_count",
                "repeat_booking_count",
                "is_teacher",
                "lat",
                "lng",
            ]
        ]
        for idx in users:
            vicinity = idx.t_address.vicinity if idx.t_address else ""
            state = idx.t_address.state if idx.t_address else ""
            lat = idx.t_address.latitude if idx.t_address else ""
            lng = idx.t_address.longitude if idx.t_address else ""
            rows.append(
                [
                    vicinity,
                    state,
                    idx.bk,
                    idx.t_bookings.repeat_booking_count(),
                    idx.teacher,
                    lat,
                    lng,
                ]
            )
    else:
        users = User.objects.users_who_booked_classes().prefetch_related(
            "location_set", "baserequesttutor_set"
        )
        rows = [
            [
                "Vicinity",
                "State",
                "total_orders",
                "repeat_orders",
                "came_from",
                "avg_booking",
            ]
        ]
        for idx in users:
            vicinity = idx.t_address.vicinity if idx.t_address else ""
            state = idx.t_address.state if idx.t_address else ""
            lat = idx.t_address.latitude if idx.t_address else ""
            lng = idx.t_address.longitude if idx.t_address else ""
            rows.append(
                [
                    vicinity,
                    state,
                    idx.od,
                    idx.orders.repeat_booking_count(),
                    idx.came_from,
                    idx.average_booking_price,
                    lat,
                    lng,
                ]
            )
    return utils.streaming_response(rows, "{}_analytics".format(kind))


def tutors_stats(request, state):
    tutors = User.objects.filter(profile__application_status=UserProfile.VERIFIED)
    if state != "None":
        tutors = tutors.filter(location__state=state)
    tutors = tutors.prefetch_related(
        Prefetch(
            "tutorskill_set",
            queryset=TutorSkill.objects.select_related("skill").active(),
            to_attr="ac",
        ),
        "location_set",
    ).prefetch_related(
        Prefetch(
            "phonenumber_set",
            queryset=PhoneNumber.objects.filter(primary=True),
            to_attr="p_phone",
        )
    )
    final_set = []
    rows = [
        [
            "Email",
            "latitude",
            "longitude",
            "state",
            "vicinity",
            "gender",
            "number",
            "skill",
        ]
    ]
    for x in tutors:
        latitude = x.t_address.latitude if x.t_address else ""
        longitude = x.t_address.longitude if x.t_address else ""
        state = x.t_address.state if x.t_address else ""
        vicinity = x.t_address.vicinity if x.t_address else ""
        skill = [y.skill.name for y in x.ac]
        rows.append(
            [
                x.email,
                latitude,
                longitude,
                state,
                vicinity,
                x.profile.gender,
                ",".join([str(uu.number) for uu in x.p_phone]),
                skill,
            ]
        )
    return utils.streaming_response(rows, "tutor_analytics_{}".format(state))


class NotInterestedInTutoringView(LoginRequiredMixin, RedirectView):
    permanent = False

    def get_redirect_url(self):
        User.objects.filter(pk=self.request.user.pk).update(tutor_intent=False)
        UserProfile.objects.filter(user=self.request.user).update(application_status=0)
        return reverse("users:dashboard")


class SubjectPopulateView(UserMixin, DetailView):
    template_name = "users/subject-populate.html"
    form_class = SubjectPopulateForm

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if not self.object.user.tutor_intent:
            return redirect(reverse("users:edit_profile"))
        return super(SubjectPopulateView, self).get(request, *args, **kwargs)

    def get_form_kwargs(self):
        kwargs = super(SubjectPopulateView, self).get_form_kwargs()
        kwargs.update(instance=self.object.profile)
        return kwargs

    def get_success_url(self):
        messages.info(self.request, "Your subjects have been updated.")
        if self.object.user.tutor_intent:
            return self.self.object.tutor_req.get_next_url()
        return reverse("users:select_subjects")

    def get_context_data(self, **kwargs):
        context = super(SubjectPopulateView, self).get_context_data(**kwargs)
        opts = self.object.subjects_selected
        context.update(sub_categories=json.dumps(opts), profile=self.object.profile)
        return context


class SubjectCreateView(CsrfExemptMixin, JsonRequestResponseMixin, DetailView):
    require_json = True
    model = User

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        logger.info(self.request_json)
        # if len(self.request_json.keys()) > 0:
        form = SubjectPopulateForm(self.request_json, instance=self.object.profile)
        if form.is_valid():
            form.save()
            return self.render_json_response({"status": True})
        return self.render_bad_request_response(form.errors)


class TutorProfileEditView(UserMixin, RegistrationFormMixin, UpdateView):
    template_name = "users/edit_profile/tutor_profile.html"
    form_class = forms.TutoringPreferenceForm2

    def get_tutor_json_data(self):
        renderer = JSONRenderer()
        return renderer.render(self.object.schedule(as_dict=True))

    def get_context_data(self, **kwargs):
        context = super(TutorProfileEditView, self).get_context_data(**kwargs)
        profile_url = "https://{}{}".format(
            Site.objects.get_current(), self.object.get_absolute_url()
        )
        context.update(ts_json=self.get_tutor_json_data(), public_url=profile_url)
        return context

    def get_success_url(self):
        return reverse("users:edit_tutor_profile")

    def get_form_classes(self):
        we_count = self.object.user.workexperience_set.count()
        location = self.object.locations.first()
        return {
            "education_formset": forms.EducationFormset(instance=self.object.user),
            "we_formset": forms.WorkExperienceFormSet(instance=self.object.user),
            "preference_form": forms.TutoringPreferenceForm2(
                instance=self.object.profile
            ),
            "policy_form": forms.PolicyForm(instance=self.object.profile),
            "location": json.dumps(location.distances, cls=DjangoJSONEncoder)
            if location.distances
            else "",
            # "guarantor_formset": forms.GuarantorFormset(instance=self.object.user),
        }

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        location = self.object.locations.first()
        user = self.object.user
        profile = self.object.profile
        education_formset = forms.EducationFormset(request.POST, instance=user)
        we_formset = forms.WorkExperienceFormSet(request.POST, instance=user)
        preference_form = forms.TutoringPreferenceForm2(request.POST, instance=profile)
        policy_form = forms.PolicyForm(request.POST, instance=profile)
        # guarantor_formset = forms.GuarantorFormset(request.POST, instance=user)
        logger.info(education_formset.is_valid())
        logger.info(we_formset.errors)
        logger.info(preference_form.is_valid())
        logger.info(preference_form.errors)
        logger.info(policy_form.is_valid())
        logger.info(policy_form.errors)
        # logger.info(guarantor_formset.errors)
        if (
            education_formset.is_valid()
            and we_formset.is_valid()
            and preference_form.is_valid()
            and policy_form.is_valid()
            # and guarantor_formset.is_valid()
        ):
            education_formset.save()
            # guarantor_formset.save()
            we_formset.save()
            preference_form.save()
            messages.info(request, "Profile Updated")
            response = redirect(self.get_success_url())
            return _ajax_response(self.request, response)
        else:
            return self.render_to_response(
                self.get_context_data(
                    form_error=True,
                    education_formset=education_formset,
                    we_formset=we_formset,
                    preference_form=preference_form,
                    # guarantor_formset=guarantor_formset,
                    policy_form=policy_form,
                    location=json.dumps(location.distances, cls=DjangoJSONEncoder),
                )
            )


from pricings.models import Region


def RegionView(request, state):
    regions = Region.get_areas_as_dict(state)

    return render(request, "includes/region_select.html", {"miniRegion": regions})


def get_areas_in_region(request):
    areas = Region.get_areas_as_dict(state=request.GET.get("state"))
    if areas:
        areas = [dict(title=x["title"]) for x in areas]
    return JsonResponse(dict(areas=areas))


class PrimeForm(django_forms.Form):
    agree = django_forms.BooleanField(required=True)

    def save(self, profile):
        profile.applied_for_prime = True
        profile.save()


class PrimeApplicationView(UserMixin, TemplateView):
    template_name = "users/prime_application.html"

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.object.profile.applied_for_prime:
            messages.info(request, "You are already a prime tutor")
            return redirect(reverse("users:dashboard"))
        return super(PrimeApplicationView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        form = PrimeForm(request.POST)
        if form.is_valid():
            form.save(self.object.profile)
            messages.success(
                request, "You have successfully applied to be a prime tutor"
            )
            return redirect(reverse("users:dashboard"))
        messages.error(request, "You must select the checkbox that you agree")
        return self.render_to_response(self.get_context_data(form=form))

    def get_context_data(self, **kwargs):
        context = super(PrimeApplicationView, self).get_context_data(**kwargs)
        if not "form" in context:
            context.update(form=PrimeForm())
        return context


class SignupView(BSignupView):
    def post(self, request, *args, **kwargs):
        new_request = copy_request(request)
        new_request.POST["phone_number"] = get_phone_number(
            request, request.POST.get("phone_number")
        )
        logger.info(new_request.POST)
        self.request = new_request
        return super(SignupView, self).post(new_request, *args, **kwargs)


class TutorJobRedirectView(RedirectView):
    permanent = True

    def get_redirect_url(self, *args, **kwargs):
        options = {
            "jobs": "tutor-jobs",
            "schedule": "tutor-availability",
            "subjects": "tutor-subject",
        }
        try:
            value = options.get(kwargs["path"])
            return f"{settings.DJANGO_ADMIN_URL}/api/access/{value}?tutor_id={kwargs['slug']}&access_code=TUTOR_ACCESS"
        except KeyError:
            raise Http404()


class RedirectLogin(RedirectView):
    permanent = True

    def get_redirect_url(self, *args, **kwargs):
        User = get_user_model()
        user = User.objects.filter(email=kwargs.get("email")).first()
        backend = "django.contrib.auth.backends.ModelBackend"
        login(self.request, user, backend=backend)

        # import pdb;pdb.set_trace()
        return reverse("users:dashboard")


# @receiver(fb_signals.data_from_fb_scope)
# def onFacebookSignUpCompleted(sender, request, data, **kwargs):

#     user,_ = User.create_fb_user(data)

#     backend = 'django.contrib.auth.backends.ModelBackend'
#     login(request, user,backend=backend)


# @receiver(fb_signals.save_long_lived_token)
# def onFacebookClientData2(sender, request, access_token, expires_at, **kwargs):
#     User = get_user_model()
#     user = request.user

#     extra_data = json.loads(request.body)
#     user.save_email_and_social_account(extra_data,"facebook",access_token)


# @receiver(google_signals.data_from_google_scope)
# def onGoogleSignUpCompleted(sender, request, data, **kwargs):

#     extra_data = json.loads(request.body)
#     extra_data['id'] = extra_data['token'][:125]

#     user = User.create_social_account_user(data,extra_data)

#     backend = 'django.contrib.auth.backends.ModelBackend'

#     login(request, user, backend=backend)
