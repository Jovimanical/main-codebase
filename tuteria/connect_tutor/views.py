# -*- coding: utf-8 -*-
import json
import os
from decimal import Decimal
from django.http import HttpResponse, JsonResponse
from django.http import HttpResponseBadRequest
from django.http import HttpResponseRedirect, Http404, HttpResponseForbidden
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render, render_to_response
from django.views.generic import DeleteView, DetailView, ListView, RedirectView
from django.contrib import messages
from django.conf import settings
from django.db.models import Q, Count
from django.utils.functional import cached_property
import dateutil.parser
import datetime
from braces.views import LoginRequiredMixin
from django.contrib.sites.models import Site
from skills.views.services import Constants, NewTutorFlowService
from external.new_group_flow.services import TutorRevampService

from users.context_processors import TuteriaDetail

from . import models
from users.models import User
from external.models import BaseRequestTutor
from .models import RequestPool
from .forms import (
    RequestPoolForm,
    RequestJobFilterForm,
    RequestConfirmationForm,
    RequestSmsConfirmationForm,
    RequestWithRelations,
)
from skills.models import TutorSkill


# Create your views here.
class RequestPoolListView(ListView):
    template_name = "connect_tutor/tutoring-jobs.html"
    model = BaseRequestTutor
    paginate_by = 10
    location_query = True
    region = None

    def get_queryset(self, *args, **kwargs):
        params = self.get_request_parameters()
        params["radius"] = 10
        params["days"] = 30
        # try:
        user = self.request.user
        query = BaseRequestTutor.objects.current_request_pool_queryset(
            user=user, **params
        )
        return query

    def get_request_parameters(self, display_location=True):
        param = {}
        keys = ["q", "state", "vicinity", "latitude", "longitude", "gender"]
        o_state = self.other_state()
        for key in keys:
            param[key] = self.request.GET.get(key)
            if display_location:
                self.location = param.get("location", None)
                if not self.location:
                    self.region = param.get("state", "") or o_state
            else:
                param.pop("latitude", None)
                param.pop("longitude", None)
                self.region = param.get("state", "") or o_state
        self.search_param = param.get("q")
        return param

    def other_state(self):
        state = "Lagos"
        user = self.request.user
        if user.is_authenticated:
            state = user.revamp_data("personalInfo", "state")
            # addr = user.location_set.actual_tutor_address()
            # if addr:
            #     state = addr.state
        return state

    def get_context_data(self, **kwargs):
        context = super(RequestPoolListView, self).get_context_data(**kwargs)
        form = RequestJobFilterForm(initial=self.get_request_parameters())
        o_state = self.other_state()
        context.update(
            form=form,
            state_query=self.request.GET.get("state"),
            o_state=o_state,
            vicinity_query=self.request.GET.get("vicinity"),
            search_query=self.request.GET.get("q"),
        )
        return context


class RequestPoolDetailView(DetailView):
    model = BaseRequestTutor
    template_name = "connect_tutor/job-details.html"

    def tutor_active_subjects(self):
        x = self.request.user.tutorskill_set.exclude(
            status=TutorSkill.DENIED
        ).values_list("skill__name", flat=True)
        return x

    def validate_price(self, cost):
        price_error = False
        if self.object.per_hour() < Decimal(1000):
            if cost > Decimal(1500):
                price_error = True
        else:
            if cost > Decimal(Decimal(2.5) * Decimal(self.object.per_hour())):
                price_error = True
        return price_error

    def determine_distance(self, tutor, req):
        # user_location = tutor.location_set.actual_tutor_address()
        # if req.latitude and req.longitude and user_location.latitude and user_location.longitude:
        # return user_location.calculate_distance(req.latitude,req.longitude)
        # <= 15
        return True

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        subjects = self.object.request_subjects
        amount = request.POST.get("cost") or self.object.budget
        if request.user.is_authenticated:
            tutor = request.user
            if self.is_qualified(tutor.id):
                if not self.determine_distance(tutor, self.object):
                    form = RequestPoolForm(
                        request.POST, **self.get_request_form_params()
                    )
                    messages.error(
                        request,
                        "The tutoring address location is too far from that of the client. Apply for a closer job or update your address accordingly",
                    )
                    return self.render_to_response(
                        self.get_context_data(form=form, object=self.object)
                    )

                if len(self.object.request_subjects) == 1:
                    agree = True
                    # agree = request.POST.get("agree")
                    if not agree:
                        form = RequestPoolForm(
                            request.POST, **self.get_request_form_params()
                        )
                        return self.render_to_response(
                            self.get_context_data(form=form, object=self.object)
                        )
                    # if price_error:
                    #     form = RequestPoolForm(request.POST,**self.get_request_form_params())
                    # return
                    # self.render_to_response(self.get_context_data(form=form,
                    # object=self.object,price_error=price_error,error_msg=error_msg))
                    remarks = request.POST.get("remarks")
                    x, _ = RequestPool.objects.get_or_create(
                        req=self.object, tutor=tutor, cost=amount, remarks=remarks or ""
                    )
                    x.subjects = self.object.request_subjects
                    x.save()
                    messages.info(
                        request, "Thank you. Your entry has been sent successfully."
                    )
                    return redirect(reverse("job-details", args=[self.object.slug]))
                else:
                    form = RequestPoolForm(
                        request.POST, **self.get_request_form_params()
                    )
                    if form.is_valid():
                        # check if user teaches
                        instance = form.save(commit=False)
                        # if price_error:
                        #     form = RequestPoolForm(
                        #         request.POST, **self.get_request_form_params())
                        # return
                        # self.render_to_response(self.get_context_data(form=form,
                        # object=self.object,price_error=price_error,error_msg=error_msg))
                        instance.req = self.object

                        instance.tutor = tutor
                        instance.save()
                        messages.info(
                            request, "Thank you. Your entry has been sent successfully."
                        )
                        return redirect(self.redirect_to_update_details())
                    messages.error(
                        request, "Please select at least one subject you teach."
                    )
                    return self.render_to_response(
                        self.get_context_data(
                            form=form, object=self.object, price_error=""
                        )
                    )
        return self.render_to_response(self.get_context_data(object=self.object))

    def redirect_to_update_details(self):
        # calendar = self.request.user.has_mini_calendar
        # if calendar:
        #     date_modified = dateutil.parser.parse(calendar.last_modified)
        #     days_elapsed = datetime.datetime.now() - date_modified
        #     if days_elapsed.days < 30 and self.request.user.has_valid_address:
        #         reverse('job-details', args=[self.object.slug])
        #     else:
        #         return reverse('users:update_tutor_details')
        # else:
        #     return reverse('users:update_tutor_details')
        return reverse("tutoring-jobs")

    # @cached_property
    # def considered_subjects(self):
    #     """To be called if request is_authenticated"""
    #     skills = self.request.user.tutorskill_set.related_subject(
    #         self.object.request_subjects
    #     ).values("skill__name", "heading")
    #     skills_with_heading = [
    #         {"heading": x["heading"], "name": x["skill__name"]} for x in skills
    #     ]
    #     return skills_with_heading

    @cached_property
    def considered_subjects(self):
        from external.new_group_flow.services import TutorRevampService

        return TutorRevampService.check_tutor_qualification_status(
            self.request.user, self.object.slug, kind=2
        )

    def can_submit_list(self):
        if self.request.user.is_authenticated:
            return json.dumps(
                TutorRevampService.check_tutor_qualification_status(
                    self.request.user, self.object.slug, kind=3
                )
            )
        return []

    def get_application_subjects(self):
        """To be called if request is_authenticated"""
        # skills = self.considered_subjects2
        skills = self.considered_subjects
        return [x["name"] for x in skills]

    def get_request_form_params(self):
        if self.request.user.is_authenticated:
            s = [x.strip() for x in self.object.request_subjects]
            s = RequestWithRelations.get_request_subjects(self.request.user, s)
            s = [(x.strip(), x.strip()) for x in s]
            # s = []
        else:
            s = []
        initial = {"cost": self.object.per_hour}
        # if len(self.object.request_subjects) == 1:
        #     initial['subjects'] = s[0][0]
        ooo = s
        return dict(teachable_subjects=s, initial=initial, user=self.request.user)

    def is_qualified(self, tutor_id):
        try:
            user = User.objects.get(pk=tutor_id)
            if user.is_tutor:
                return True
        except Exception:
            return False
        return False

    def get_context_data(self, **kwargs):
        context = super(RequestPoolDetailView, self).get_context_data(**kwargs)
        if self.request.user.is_authenticated:
            pp = self.get_request_form_params()
            form = RequestPoolForm(**pp)
            tutor = self.request.user
            has_applied_before = self.object.request.filter(tutor_id=tutor.id).exists()
            not_qualified = len(pp["teachable_subjects"]) == 0
            subjects_taught = self.get_application_subjects()
            no_subject = any([x["heading"] for x in self.considered_subjects])
            record = NewTutorFlowService.get_profile_info(
                self.request.user, Constants.SUBJECTS
            )
            record_data = json.dumps(record)

        else:
            record_data = "null"
            form = None
            has_applied_before = False
            subjects_taught = []
            no_subject = False
            not_qualified = True
        context.update(
            # can_submit_list=self.can_submit_list(),
            record_data=record_data,
            has_applied_before=has_applied_before,
            subjects_taught=subjects_taught,
            not_qualified=not_qualified,
            condition=self.object.status
            not in [
                BaseRequestTutor.PENDING,
                BaseRequestTutor.PROSPECTIVE_CLIENT,
                BaseRequestTutor.MEETING,
                BaseRequestTutor.PAYED,
            ],
            no_subject=no_subject,
        )
        if not "form" in kwargs:
            context.update(form=form)
        return context


class Unsubscribe(LoginRequiredMixin, RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        user = self.request.user
        profile = user.profile
        profile.blacklist = True
        profile.save()
        messages.info(
            self.request,
            "You have successfully unsubscribed from jobs email notification",
        )
        return reverse("users:dashboard")


def email_template(request):
    from django.contrib.auth import authenticate as auth
    from django.utils.http import urlquote
    from bookings.models import Booking

    # requests = BaseRequestTutor.objects.completed()[:10]
    r = BaseRequestTutor.objects.filter(status=BaseRequestTutor.PENDING).last()
    booking = Booking.objects.closed().last()
    user = booking.user
    password = user.first_name.lower() + user.last_name.lower()
    total_amount_earned = round(user.wallet.total_amount_earned_by_tutors, 0)
    not_interested_url = "http://localhost:8000{}".format(
        reverse("users:not_interested_in_tutoring")
    )
    amount_earned_last_week = round(user.wallet.amount_earned_last_week_by_tutors, 0)

    if user is not None:
        same_password = True
    else:
        same_password = False
    linkedin_url, twitter_url, facebook_url = get_social_urls(booking.get_tutor)
    user = User.objects.get(pk=22)
    subjects = user.skills_with_quiz_not_taken()
    context = {
        "booking": booking,
        "sender": booking.get_tutor,
        "site": Site.objects.get_current(),
        "tuteria_details": TuteriaDetail(),
        "same_password": same_password,
        "password": password,
        "linkedin_url": linkedin_url,
        "twitter_url": twitter_url,
        "facebook_url": facebook_url,
        "user": user,
        "total_amount_earned": total_amount_earned,
        "not_interested_url": not_interested_url,
        "amount_earned_last_week": amount_earned_last_week,
        "req_instance": r,
        "ss": list(subjects.values_list("skill__name", flat=True)),
    }
    # Todo: set sms details

    # requests = BaseRequestTutor.objects.completed().first()
    # return render(request,'emails/request_tutor_completed.html',context)

    return render(request, "emails/request_tutor_completed.html", context)
    # return render(request, 'emails/request_tutor_completed.html',
    #               {'request_instance': requests,
    #                'same_password': True, 'password': "danny d"})


def get_social_urls(user):
    from django.utils.http import urlquote
    from django.urls import reverse

    meta_title = u"Get ₦1,500 off your first lesson!"
    site = Site.objects.get_current()
    meta_description = (
        "Click here now to join {} on Tuteria and get the best tutors"
        " in your area for any subject, skill or exam."
    ).format(user.first_name)
    rquest_url = site.domain + reverse("users:referral_signup", args=[user.slug])
    linkedin_url = (
        "https://www.linkedin.com/shareArticle?mini=true&"
        "url=https://%s&title=%s&description=%s&submitted-url=https://%s"
    ) % (rquest_url, meta_title, meta_description, rquest_url)

    twitter_msg = "Get the best tutors at #Tuteria to help with any subject, skill or exam! @tuteriacorp https://www.tuteria.com/i/{}".format(
        user.slug
    )
    twitter_url = "https://twitter.com/home?status=%s" % (urlquote(twitter_msg),)
    facebook_url = "https://www.facebook.com/sharer/sharer.php?u=https://%s" % (
        rquest_url
    )
    return linkedin_url, twitter_url, facebook_url


def confirm_availability(request, **kwargs):
    rp = RequestPool.objects.filter(
        req__slug=kwargs["rq_slug"], tutor__slug=kwargs["slug"]
    ).first()
    if not rp:
        raise Http404("This request could not be found")
    # if rp.req.status == BaseRequestTutor.PENDING:
    #     raise HttpResponseForbidden("Sorry You are not Allowed")
    form = RequestConfirmationForm(request.POST)
    if form.is_valid():
        form.confirm_availability(rp)
        messages.info(request, "Thanks for your response")
        return redirect(reverse("home"))
    return redirect(reverse("view_request_detail", args=[rp.tutor.slug, rp.req.slug]))


def view_request_detail(request, **kwargs):
    rp = RequestPool.objects.filter(
        req__slug=kwargs["rq_slug"], tutor__slug=kwargs["slug"]
    ).first()
    if not rp:
        raise Http404("This request could not be found")
    if rp.req.status != BaseRequestTutor.COMPLETED:
        return HttpResponseForbidden("Sorry This request has expired")
    return render(
        request,
        "connect_tutor/job-details-summary.html",
        {"object": rp.req, "form": RequestConfirmationForm(), "tutor": rp.tutor},
    )


def sms_response_from_infobib(request):
    form = RequestSmsConfirmationForm(request.GET)
    if form.is_valid():
        form.confirm_availability()
    return JsonResponse(request.GET)
