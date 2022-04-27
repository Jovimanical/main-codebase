# -*- coding: utf-8 -*-
import copy
import json
import logging
from allauth.account.views import AjaxCapableProcessFormViewMixin, _ajax_response
from braces.views import JSONRequestResponseMixin, LoginRequiredMixin
from django.contrib import messages

from django.utils.functional import cached_property
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.urls import reverse
from django.http import Http404, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import redirect, render
from django.utils.decorators import method_decorator

# Create your views here.
from django.views.generic import RedirectView, TemplateView

# from external.forms import TutorSkillFilterForm
from rest_framework.renderers import JSONRenderer
from users import services as user_service

from . import milestone_task
from .. import services
from ..decorators import create_skill_requirement
from ..api import GraphTutorSkillSerializer
from .services import NewTutorFlowService, Constants

logger = logging.getLogger(__name__)


class ClientRequestView(LoginRequiredMixin, TemplateView):
    template_name = "users/requests.html"

    def get_context_data(self, **kwargs):
        context = super(ClientRequestView, self).get_context_data(**kwargs)
        self.object = user_service.UserService(self.request.user.email)
        context["object_list"] = self.object.requests_placed()
        return context


class TutorSubjectRedirectView(RedirectView):
    permanent = True

    def get_redirect_url(self, *args, **kwargs):
        return reverse(
            "users:tutor_path_redirect", args=[self.request.user.slug, "subjects"]
        )


class TutorSubjectsView(LoginRequiredMixin, TemplateView):
    template_name = "users/subjects.html"

    def get_object(self):
        return user_service.UserService(self.request.user.email)

    def get_context_data(self, **kwargs):
        context = super(TutorSubjectsView, self).get_context_data(**kwargs)
        self.object = self.get_object()
        context["profile"] = self.object.profile
        ts_service = self.object.ts_service
        options = self.request.GET.dict()
        context.update(ts_service.get_subject_view_skills(**options))
        active_count = context["urls"][0]["count"]
        if active_count >= 5:
            milestone_task.update_milestone(
                "created_5_subjects", self.object.user.email
            )
        record = NewTutorFlowService.get_profile_info(self.object.user,Constants.SUBJECTS)
        context['initial_data'] = json.dumps(record)
        return context


class TutorSubjectUpdateView(LoginRequiredMixin, TemplateView):
    template_name = "skills/edit-subject.html"

    def get_object(self):
        self.user = user_service.UserService(self.request.user.email)
        self.skill_service = self.user.get_skill_service(
            self.kwargs["slug"], delete_sitting=True
        )
        return self.skill_service.instance

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if (
            not self.user.id_verified
            and not self.user.tutor_req.has_connected_social_media
        ):
            messages.info(
                request,
                "You will need to upload an offline ID before your subjects are approved.",
            )

        return self.render_to_response(self.get_context_data())

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        logger.info(request.POST)
        url, form, certificate_form = self.skill_service.save_tutorskill_from_form(
            request
        )
        if url:
            messages.success(
                request,
                "Your Skill is saved and awaits verification! You can add another subject.",
            )
            return redirect(url)
        logger.info(form.errors)
        logger.info(certificate_form.errors)
        return self.render_to_response(
            self.get_context_data(form=form, certificate_form=certificate_form)
        )

    def get_context_data(self, **kwargs):
        context = super(TutorSubjectUpdateView, self).get_context_data(**kwargs)
        context["object"] = self.object
        context.update(self.skill_service.get_update_forms(context))
        context["u_service"] = self.user
        return context


@login_required
def quiz_started(request, quiz_url):
    us = user_service.UserService(request.user.email)
    try:
        result, testable = us.ts_service.start_quiz(quiz_url)
    except ObjectDoesNotExist:
        raise Http404("No Quiz matches the given query.")
    else:
        if request.is_featured:
            skill_instance = us.get_skill_service(quiz_url=quiz_url)
            if testable:
                return render(
                    request,
                    "skills/exam2.html",
                    {
                        "quiz": skill_instance.get_quiz(),
                        "skill": skill_instance.get_skill(),
                        "ts": skill_instance.instance,
                    },
                )
        return JsonResponse({"status": True})


@login_required
def verify_skill(request, quiz_url):
    us = user_service.UserService(request.user.email)
    try:
        ts = us.get_skill_service(quiz_url=quiz_url)
    except ObjectDoesNotExist:
        raise Http404("No Quiz matches the given query.")
    if ts.testable:
        if ts.passed_quiz():
            return redirect(reverse("users:edit_subject", args=[ts.get_skill().slug]))
    return redirect(reverse("users:tutor_subjects"))


@login_required
def exam_result(request, quiz_url):
    us = user_service.UserService(request.user.email)
    url = reverse("users:tutor_subjects")
    if request.is_ajax():
        try:
            ts = us.get_skill_service(quiz_url=quiz_url)
        except ObjectDoesNotExist:
            raise Http404("No Quiz matches the given query.")
        if ts.testable:
            passed = ts.validate_quiz(json.loads(request.body))
            if passed:
                url = url = reverse("users:edit_subject", args=[ts.get_skill().slug])
        return JsonResponse({"next": url})
    return HttpResponseBadRequest()


@login_required
def add_tutor_skill(request, quiz_url):
    ts, _ = services.SingleTutorSkillService.get_or_create(
        request.user.email, None, quiz_url, status=5
    )
    return redirect(reverse("users:edit_subject", args=[ts.get_skill().slug]))


class SubjectLandingView(LoginRequiredMixin, TemplateView):
    template_name = "skills/new-subject-wizard/0-select-subject.html"
    ts = None

    @method_decorator(create_skill_requirement)
    def dispatch(self, *args, **kwargs):
        return super(SubjectLandingView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):
        self.object = user_service.UserService(request.user.email)
        profile = self.object.profile
        if not profile.application_status == 3:
            messages.error(request, "You are not yet a verified tutor")
            return redirect(reverse("users:dashboard"))
        if not self.object.failed_tutorskills(count=True) < 10:
            messages.error(request, "You have previously failed 10 subjects.")
            return redirect(reverse("users:tutor_subjects"))
        else:
            return super(SubjectLandingView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(SubjectLandingView, self).get_context_data(**kwargs)
        data = self.object.get_cached_categories_as_json(**self.request.GET.dict())
        context.update(categories=json.dumps(data))
        return context


def paginator_func(ts, number, request):
    paginator = Paginator(ts, number)
    page = request.GET.get("page")
    try:
        result = paginator.page(page)
    except PageNotAnInteger:
        result = paginator.page(1)
    except EmptyPage:
        result = paginator.page(paginator.num_pages)

    return paginator, result


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


class TutorSkillPublicView(
    JSONRequestResponseMixin, AjaxCapableProcessFormViewMixin, TemplateView
):
    template_name = "skills/profile2.html"

    @cached_property
    def fetch_object(self):
        return services.SingleTutorSkillService(**self.kwargs)

    def get_object(self, queryset=None):
        self.ts = self.fetch_object
        if self.ts.instance is None:
            raise Http404("TutorSkill does not exist.")
        return self.ts.instance

    def get_paginator(self, ts, number=2):
        return paginator_func(ts, number, self.request)

    def get_tutor_json_data(self):
        renderer = JSONRenderer()
        data = {}
        if self.request.user.is_staff:
            data = self.ts.raw_json
        return renderer.render(data)

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if request.GET.get("format") == "json":
            return JsonResponse(self.ts.raw_json())
        status, slug = self.ts.can_be_viewed(self.request.user)
        if status:
            messages.info(
                request, "This skill has not been approved by the Tuteria Quality team"
            )
            return redirect(reverse("users:profile", args=[slug]))
        context = self.get_context_data(object=self.object)
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        if request.user.is_staff:
            if request.POST.get("request_pk"):
                rq = request.POST
                self.ts.admin_actions_on_request_post(
                    rq["request_pk"], int(rq["request_action"])
                )
                if int(rq["request_action"]) == 1:
                    messages.info(request, "Successfully added tutor to request pool")
                return self.render_to_response(
                    self.get_context_data(object=self.object)
                )
            else:
                return self.booking_post(self.object, request)
        else:
            url, form = self.ts.client_actions_on_request_post(request)
            if url:
                request.session["from_skill_page"] = True
                request.session["tutorskill_subject"] = self.object.pk
                referral_code = request.POST.get("referral_code") or ""
                return redirect(url + "?referral_code=" + referral_code)
            return self.render_to_response(
                self.get_context_data(form=form, object=self.object)
            )

    def booking_post(self, ts, request):
        order, form = self.ts.creating_booking_post(request.user, self.request_json)
        if order:
            request.session["order_id"] = order
            response = redirect(reverse("booking_page", args=[order]))
        else:
            response = HttpResponse("/")
        return _ajax_response(self.request, response, form=form)

    def get_context_data(self, **kwargs):
        context = super(TutorSkillPublicView, self).get_context_data(**kwargs)
        reviews_count = self.ts.get_review_count()
        page = self.request.GET.get("page")
        pagination, result = self.ts.get_reviews(page=page)
        # filter_form = TutorSkillFilterForm()
        other_subjects = self.ts.get_other_subjects()
        context.update(
            ratings=result,
            paginator=pagination,
            ts_json=self.get_tutor_json_data(),
            tutor=self.object.tutor,
            reviews_count=reviews_count,
            other_subjects=other_subjects,
            # filter_form=filter_form
        )
        condition = "form" not in kwargs
        context["object"] = self.object
        context["ts_service"] = self.ts
        context["active_bookings"] = self.object.tutor.active_bookings()
        context.update(self.ts.request_form(self.request, get_form=condition))
        return context


class SubjectDeleteView(LoginRequiredMixin, RedirectView):
    permanent = False

    def get_redirect_url(self, *args, **kwargs):
        us = user_service.UserService(self.request.user.email)
        try:
            skill = us.get_skill_service(kwargs.get("slug"))
            skill_name = skill.delete()
            messages.info(
                self.request, "{} has been successfully deleted".format(skill_name)
            )
        except ObjectDoesNotExist:
            messages.warning(self.request, "This skill does not appear to exist.")
        finally:
            return reverse("users:tutor_subjects") + "?filter_by=modification"


def pricing_on_subject(request):
    query = services.TutorSkillService.get_pricing_on_subject(**request.GET.dict())
    return JsonResponse(query, safe=False)


class ValidateSkillView(LoginRequiredMixin, RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        skill = services.SingleTutorSkillService(pk=kwargs.get("pk"))
        skill.validate_skill(**self.request.GET.dict(), user=self.request.user)
        return skill.get_absolute_url()


# class EnhancedSubjectsView(LoginRequiredMixin,TemplateView):
class EnhancedSubjectsView(TemplateView):
    template_name = "skills/enhanced_view.html"


def found_subject(request, slug):
    subjects = request.GET.getlist("subjects", None)
    tutor = user_service.TutorService(slug=slug)
    data = GraphTutorSkillSerializer(tutor.found_subjects(subjects), many=True).data
    return JsonResponse({"result": data})
