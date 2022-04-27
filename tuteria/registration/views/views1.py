
import json
import logging

from allauth.account.views import _ajax_response
from braces.views import LoginRequiredMixin
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.core.serializers.json import DjangoJSONEncoder
from django.urls import reverse
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.sites.models import Site
from django.dispatch import Signal, receiver
from django.utils import timezone

# Create your views here.
from django.utils.decorators import method_decorator
from django.utils.functional import cached_property
from django.views.generic import FormView, UpdateView, TemplateView, RedirectView
from registration.forms import (
    EducationFormset,
    WorkExperienceFormSet,
    ScheduleFormset,
    TutoringPreferenceForm,
    PolicyForm,
    TutorAddressForm,
    TutorDescriptionForm,
    InterviewForm,
    GuarantorFormset,
    TutoringPreferenceForm2,
)
from users.decorators import tutor_registration_requirement
from users.models import User, UserMilestone
from users.forms import CalendarFormSet
from rewards.models import Milestone
from django_quiz.api import QuestionSerializer
from django_quiz.quiz.models import Quiz
from registration.models import Schedule

from rest_framework.renderers import JSONRenderer
from users.api import TutorScheduleSerializer
from schedule.models import Event


logger = logging.getLogger(__name__)
tutor_registration_done = Signal(providing_args="profile")


@receiver(tutor_registration_done)
def registration_completed(sender, profile, **kwargs):
    # Disables tutor intent
    User.objects.filter(pk=profile.user_id).update(tutor_intent=False)
    profile.application_status = profile.PENDING
    profile.save()
    logger.info("Tutor Registration Completed")


@tutor_registration_requirement
def tutor_landing(request):
    user = request.user
    logger.info("Hello world")
    if not user.tutor_intent:
        user.tutor_intent = True
        user.save()
    if func(user):
        return redirect(reverse("registration:how_tutoring_works"))
    return redirect(request.user.tutor_req.get_next_url())
    # q = get_object_or_404(Quiz,url='tutor-registration-quiz')
    # questions = QuestionSerializer(q.get_questions(),many=True).data
    # location = request.user.home_address
    # if location and not location.distances:
    #     logger.info("Fetching vicinity locations")
    #     populate_vicinity.delay(location.pk)
    # else:
    #     logger.info("Already Fetched vicinity location")
    # return render(request, 'registration/tutor/landing.html',
    #     dict(questions=json.dumps(questions,cls=DjangoJSONEncoder)))


def func(user):
    """Checks if user has agreed to how tutoring works in tuteria
    :return True if user has not agreed
    """
    reward2 = Milestone.get_milestone(Milestone.HOW_TUTORING_WORKS)
    if hasattr(user, "profile"):
        return user.milestones.has_milestone(reward2) is False
    return False


class RegistrationFormMixin(object):
    # def get_form_classes(self):
    #     return {}

    def get_context_data(self, **kwargs):
        context = super(RegistrationFormMixin, self).get_context_data(**kwargs)
        if "form_error" not in context:
            context.update(**self.get_form_classes())
        return context


# @user_passes_test(func, login_url='/registration/milestone-check/')
# # @login_required
# def how_tutoring_works(request):
#     q = get_object_or_404(Quiz, url='tutor-registration-quiz')
#     questions = QuestionSerializer(q.get_questions(), many=True).data
#     return render(request, 'registration/tutor/landing.html',
#                   dict(questions=json.dumps(questions, cls=DjangoJSONEncoder)))


class HowTutoringWorks(TemplateView):
    template_name = "registration/tutor/landing.html"

    def get_context_data(self, **kwargs):
        context = super(HowTutoringWorks, self).get_context_data(**kwargs)
        q = get_object_or_404(Quiz, url="tutor-registration-quiz")
        questions = QuestionSerializer(q.get_questions(), many=True).data
        context.update(questions=json.dumps(questions, cls=DjangoJSONEncoder))
        return context


how_tutoring_works = user_passes_test(func, login_url="/registration/milestone-check/")(
    HowTutoringWorks.as_view()
)


class MileStoneCheck(LoginRequiredMixin, RedirectView):
    permanent = False

    def get_redirect_url(self, *args, **kwargs):
        if self.request.user.tutor_intent:
            tutor_registration_done.send(
                sender=self.__class__, profile=self.request.user.profile
            )
            return reverse("registration:appliation_completed")
        return reverse("users:dashboard")


class BeginRegistrationView(LoginRequiredMixin, RedirectView):
    permanent = False

    # @method_decorator(user_passes_test(lambda user: user.profile.application_status == UserProfile.VERIFIED, login_url='/registration/tutor-landing/'))
    @method_decorator(
        user_passes_test(func, login_url="/registration/milestone-check/")
    )
    def dispatch(self, request, *args, **kwargs):
        return super(BeginRegistrationView, self).dispatch(request, *args, **kwargs)

    def get_redirect_url(self, *args, **kwargs):
        reward2 = Milestone.get_milestone(Milestone.HOW_TUTORING_WORKS)
        UserMilestone.objects.get_or_create(user=self.request.user, milestone=reward2)
        next_url = self.request.GET.get("next", None)
        if next_url:
            return next_url
        return reverse("registration:milestone_check")
        # tutor_registration_done.send(sender=self.__class__, profile=self.request.user.profile)
        # return reverse('registration:appliation_completed')


def schedule_interview(request):
    return render(request, "registration/tutor/step5.html")


@login_required
def update_calendar(request):
    data = json.loads(request.body)
    event_id = [x.get("event_id") for x in data]
    new_event = [x for x in event_id if x is not None]
    news = filter(lambda x: x.get("is_new", False), data)
    updates = filter(lambda x: x.get("is_new", False) is False, data)
    events = [Event.objects.get(id=x) for x in new_event]
    logger.info(len(event_id))
    logger.info(len(events))
    logger.info(len(updates))
    Schedule.objects.filter(tutor=request.user).update(last_updated=timezone.now())
    if len(events) == len(updates):
        request.user.update_schedule_occurrences(events, updates)
        request.user.bulk_create_available(news)
        return JsonResponse(data={"msg": "Successful"}, status=200)
    else:
        return JsonResponse(
            data={"msg": "Events fetched do not match params passed"}, status=400
        )


class RedirectCredentials(RedirectView):
    permanent = False

    def get_redirect_url(self, *args, **kwargs):
        return reverse("users:edit_profile")
