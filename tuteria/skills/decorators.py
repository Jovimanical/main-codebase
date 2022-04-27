from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.shortcuts import redirect
from django.contrib import messages
from users.services import UserService


def tutor_registration_requirement(
    function=None, login_url="/become-a-tutor/", redirect_field_name=REDIRECT_FIELD_NAME
):

    def decorator(view_func):

        @login_required(redirect_field_name=redirect_field_name, login_url=login_url)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.can_tutor:
                return redirect(reverse("users:edit_profile"))
            profile = request.user.profile
            if profile.application_status >= 2:
                return redirect(reverse("users:dashboard"))
            if profile.registration_level == 1:
                return redirect(reverse("registration:tutor_credentials"))
            if profile.registration_level == 2:
                return redirect(reverse("registration:tutor_preferences"))
            if profile.registration_level == 3:
                return redirect(reverse("registration:tutor_agreement"))
            return view_func(request, *args, **kwargs)

        return _wrapped_view

    if function:
        return decorator(function)
    return decorator


def create_skill_requirement(
    function=None,
    login_url="/users/edit-verification",
    redirect_field_name=REDIRECT_FIELD_NAME,
):

    def decorator(view_func):

        @login_required
        def _wrapped_view(request, *args, **kwargs):
            user_service = UserService(request.user.email)
            # if user_service.identity:
            #     if user_service.tutor_req.has_connected_social_media:
            return view_func(request, *args, **kwargs)
            #     else:
            #         messages.info(
            #             request,
            #             "You need to verify your online ID in order to create subjects",
            #         )
            #         return redirect(reverse("users:edit_verification"))
            # messages.info(
            #     request,
            #     "You will need to upload an offline ID before your subjects are approved.",
            # )
            # return redirect(reverse("users:edit_verification"))
            # return view_func(request, *args, **kwargs)

        return _wrapped_view

    if function:
        return decorator(function)
    return decorator
