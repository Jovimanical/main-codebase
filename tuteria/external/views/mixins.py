from _ssl import SSLError
import copy
import logging
import pdb
from allauth.account.forms import LoginForm, ResetPasswordForm, SignupForm
from gateway_client import TuteriaDetail
from django.urls import reverse
from django.http import Http404
from django.shortcuts import redirect
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login
from ipware.ip import get_ip as get_ip2

from .. import forms
from config import utils
from .display_content import infographics_content
from skills.models import TutorSkill, Skill
from users.models import Location, User, PhoneNumber
from external.subjects import subjects, levels_of_student
from external import services
from referrals.models import Referral
from ..models import BaseRequestTutor
from ..tasks import email_sent_after_completing_request, new_request_notification
from skills.services import SkillService

logger = logging.getLogger(__name__)


class AuthFormMixin(object):
    location_filter = None
    latitude = ""
    longitude = ""

    def get_ip_address(self):
        ip_addr = get_ip2(self.request)
        location = utils.get_ip(ip_addr)
        if location:
            self.location_filter = {
                "location": location["city"],
                "latitude": location["latitude"],
                "longitude": location["longitude"],
            }
        return self.location_filter

    def get_form_params(self):
        return {
            "query": self.skill,
            "location": self.location,
            "gender": self.request.GET.get("gender"),
            "age": self.request.GET.get("age"),
            "distance": self.request.GET.get("distance", 15),
            "start_rate": self.request.GET.get("start_rate", ""),
            "end_rate": self.request.GET.get("end_rate", ""),
        }

    def filter_form_instance(self):
        params = self.get_form_params()
        if self.request.is_phone:
            return forms.TutorSkillFilterForm(choice_type=True, initial=params)
        else:
            return forms.TutorSkillFilterForm(initial=params)

    def context_data_differences(self, context):
        carousel = [
            {"img": "/static/img/backgrounds/3.jpg", "caption": "Math"},
            {"img": "/static/img/backgrounds/hero-.jpg", "caption": "English"},
            {"img": "/static/img/backgrounds/1.jpg", "caption": "Music"},
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
        context.update(
            {
                "carousels": carousel,
                "infographics_content": infographics_content,
                "category_list": category_list,
                "region": self.region,
                "location_query": self.location_query,
            }
        )

        return context

    def get_context_data(self, **kwargs):
        context = super(AuthFormMixin, self).get_context_data(**kwargs)
        filter_form = self.filter_form_instance()
        context.update(
            {
                "login_form": LoginForm(),
                "signup_form": SignupForm(
                    initial={"referral_code": self.request.referral_code}
                ),
                "reset_form": ResetPasswordForm(),
                "filter_form": filter_form,
            }
        )
        context = self.context_data_differences(context)
        return context

    def query_param_location(self):
        param = {}
        keys = [
            "age",
            "query",
            "start_rate",
            "end_rate",
            "gender",
            "is_teacher",
            "region",
            "tags",
            "days",
            "days_per_week",
            "location",
            "latitude",
            "longitude",
            "set_for_request",
        ]
        for key in keys:
            param[key] = self.request.GET.get(key)
        if not param.get("region"):
            param["region"] = "Lagos"
        self.region = param["region"]
        return param


def copy_request(request):
    req_copy = copy.copy(request)
    req_copy.POST = request.POST.copy()
    return req_copy


def get_phone_number(request, previous_number):
    if previous_number.startswith("+234"):
        previous_number = previous_number[4:]
    if previous_number.startswith("0"):
        previous_number = previous_number[1:]
    return "+234{}".format(previous_number)


class LoginUserMixin(object):
    def login_user(self, email, password):
        user = authenticate(email=email, password=password)
        if user is not None:
            login(self.request, user)
        else:
            pass


class RequestMixin(LoginUserMixin):
    is_parent = True
    region = None
    new_instance = None
    online = False
    the_category = None

    def get_context_data(self, **kwargs):
        context = super(RequestMixin, self).get_context_data(**kwargs)
        response = services.ExternalService.populate_form(
            self.request,
            online=self.online,
            the_category=self.the_category,
            region=self.region,
            passed_form=self.form,
            referral_code=self.request.referral_code,
        )
        if "form" not in context:
            context.update(response)
        context.update(processing_fee=TuteriaDetail.processing_fee)
        return context

    def post(self, request, *args, **kwargs):
        url, form = services.ExternalService.save_first_form(
            request,
            is_parent=self.is_parent,
            online=self.online,
            the_category=self.the_category,
            passed_form=self.form,
            request_subjects=self.get_subject(),
        )
        if url:
            referral_code = request.POST.get("referral_code") or ""
            areas = request.POST.get("area") or ""
            return redirect(url + "?referral_code=" + referral_code + "&area=" + areas)
        return self.render_to_response(self.get_context_data(form=form))

    def get_subject(self):
        return None


class BaseSkillMixin(AuthFormMixin):
    location = ""
    location_query = None

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, request, *args, **kwargs):
        return super(BaseSkillMixin, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(BaseSkillMixin, self).get_context_data(**kwargs)
        if self.skill:
            context.update({"category": None, "skill": self.skill})
        context.update(
            {
                "location_query": True,
                "display_searchable_location": False,
                "region": self.region,
            }
        )
        return context


class StateBaseMixin(RequestMixin, BaseSkillMixin):
    def get_selected(self):
        values = [
            "regression-correlation",
            "proofreading-editing",
            "obstetrics-gynaecology",
            "hair-growth-texture",
            "food-nutrition",
            "procurement-inventory",
            "procument-inventory",
        ]
        selected = self.kwargs.get("skill")
        if selected in values:
            splited = selected.split("-")
            return splited[0] + "-&-" + "-".join(splited[1:]).lower().title()
        return selected.lower().title()

    def get_custom_object(self):
        selected = self.kwargs.get("state").lower().title()
        s_skill = self.get_selected()
        self.region = dict(forms.all_states).get(" ".join(selected.split("-")))
        self.skill_query = " ".join(s_skill.split("-"))
        self.cached_result = SkillService.cached_skill_with_tutor_count(
            self.skill_query, self.region
        )
        self.skill = self.cached_result["skill"]

    def get(self, request, *args, **kwargs):
        self.get_custom_object()
        if self.region and self.skill:
            slug = self.skill.slug
            if slug in ["ielts", "gmat", "gre"]:
                return redirect(f"/s/{slug}-tutors")
            return super(StateBaseMixin, self).get(request, *args, **kwargs)
        else:
            raise Http404("Please input both a state and a skill")

    def post(self, request, *args, **kwargs):
        self.get_custom_object()
        return super(StateBaseMixin, self).post(request, *args, **kwargs)

    def get_subject(self):
        return [self.skill]

    def get_context_data(self, **kwargs):
        context = super(StateBaseMixin, self).get_context_data(**kwargs)
        context["tutor_count"] = self.cached_result["tutor_count"]
        return context


class SecondRequestMixin(LoginUserMixin):
    default = True
    def get_object(self):
        self.request_service = services.SingleRequestService(self.kwargs["slug"])
        return self.request_service.instance

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.object.is_parent_request:
            if self.default:
                return redirect("/hometutors")
        return super(SecondRequestMixin, self).get(request, *args, **kwargs)

    # def get_context_data(self, **kwargs):
    #     context = super(SecondRequestMixin, self).get_context_data(**kwargs)
    #     context.update(object=self.object)
    #     return context
    def get_extras(self):
        return {}

    def post(self, request, *args, **kwargs):
        """
        Handles POST requests, instantiating a form instance with the passed
        POST variables and then checked for validity.
        """
        self.object = self.get_object()
        extras = self.get_extras()
        slug, form = self.request_service.save_second_form(request,default=self.default, **extras)
        # check if we have tutors for the requested subject and if the subjects
        # is for online tutoring
        if slug:
            if self.request_service.tutors_exists():
                return redirect(reverse("tutor_selection", args=[slug]))

            # self.login_user(user, password)
            return redirect(
                reverse("request_pricing_view", args=[slug])
                + "?referral_code=%s" % request.referral_code
            )
        print(form.errors)
        return self.render_to_response(self.get_context_data(form=form))

    def get_context_data(self, **kwargs):
        context = super(SecondRequestMixin, self).get_context_data(**kwargs)
        condition = "form" not in context
        response = self.request_service.second_request_form_context(
            self.request.referral_code, condition=condition
        )
        context.update(response)
        return context
