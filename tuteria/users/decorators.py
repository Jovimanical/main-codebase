import logging
from django.contrib import messages
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.shortcuts import redirect

from functools import wraps
from django.views.decorators.cache import cache_page
from django.utils.decorators import available_attrs
from users.models.models1 import UserProfile
from tutor_management.models import TutorApplicantTrack
from users.tasks import populate_vicinity

logger = logging.getLogger(__name__)


def passes_test_cache(test_func, timeout=None, using=None, key_prefix=None):
    def decorator(view_func):
        @wraps(view_func, assigned=available_attrs(view_func))
        def _wrapped_view(request, *args, **kwargs):
            if test_func(request):
                return cache_page(timeout, cache=using, key_prefix=key_prefix)(
                    view_func
                )(request, *args, **kwargs)
            else:
                return view_func(request, *args, **kwargs)

        return _wrapped_view

    return decorator


def tuteria_agreement_requirement(
    function=None, redirect_field_name=REDIRECT_FIELD_NAME
):
    def decorator(view_func):
        @login_required(redirect_field_name=redirect_field_name)
        def _wrapped_view(request, *args, **kwargs):
            profile = request.user.profile
            applicant: TutorApplicantTrack = TutorApplicantTrack.objects.filter(
                id=profile.user_id
            ).first()
            if applicant:
                if profile.application_status != UserProfile.VERIFIED:
                    return redirect(applicant.get_application_link)
                if (
                    profile.application_status == UserProfile.VERIFIED
                    and request.user.date_joined.year >= 2022
                ):
                    if applicant.current_step != "application-verified":
                        # try to update the current step and only when after update check again
                        applicant.update_verified_tutors_current_step()
                        if applicant.current_step != "application-verified":
                            return redirect(applicant.get_application_link)
            return view_func(request, *args, **kwargs)

        return _wrapped_view

    if function:
        return decorator(function)
    return decorator


def tutor_registration_requirement(
    function=None, redirect_field_name=REDIRECT_FIELD_NAME
):
    def decorator(view_func):
        @login_required(redirect_field_name=redirect_field_name)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.tutor_req.has_requirements:
                if not request.user.tutor_intent:
                    request.user.tutor_intent = True
                    request.user.save()
                messages.info(
                    request, message="Please complete the steps to become a tutor"
                )
                return redirect(request.user.tutor_req.get_next_url())
                # return redirect(reverse('users:edit_profile'))

            profile = request.user.profile
            if profile.age < 18:
                messages.info(
                    request, message="You must be 18 years or above to become a tutor."
                )
                return redirect(reverse("users:dashboard"))
            if profile.application_trial >= 3:
                messages.info(
                    request,
                    message="You have exceeded the maximum number of trials to be a tutor",
                )
                return redirect(reverse("users:dashboard"))
            if profile.application_status == profile.DENIED:
                messages.info(
                    request,
                    message="You are currently denied from applying as a tutor!",
                )
                return redirect(reverse("users:dashboard"))
            if profile.application_status == profile.PENDING:
                messages.info(
                    request, message="Your application is currently being reviewed."
                )
                return redirect(reverse("users:dashboard"))
            if profile.application_status == profile.VERIFIED:
                return redirect(reverse("users:tutor_subjects"))
            location = request.user.home_address
            if location and not location.distances:
                logger.info("Fetching vicinity locations")
                populate_vicinity.delay(location.pk)
            else:
                logger.info("Already Fetched vicinity location")
            if (
                profile.registration_level == 0
                and request.user.tutor_req.has_requirements
            ):
                if not request.user.tutor_intent:
                    request.user.tutor_intent = True
                    request.user.save()
                return redirect(request.user.tutor_req.get_next_url())
            if request.user.tutor_req.has_requirements:
                return view_func(request, *args, **kwargs)

        return _wrapped_view

    if function:
        return decorator(function)
    return decorator


def tutor_application_completed(function=None, redirect_field_name=REDIRECT_FIELD_NAME):
    def decorator(view_func):
        @login_required(
            redirect_field_name=redirect_field_name, login_url="/become-a-tutor/"
        )
        def _wrapped_view(request, *args, **kwargs):
            profile = request.user.profile
            if profile.application_status != profile.PENDING:
                return redirect(profile.get_absolute_url())
            return view_func(request, *args, **kwargs)

        return _wrapped_view

    if function:
        return decorator(function)
    return decorator
