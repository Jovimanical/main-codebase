import logging
from django.contrib import messages
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.shortcuts import redirect

from functools import wraps
from django.views.decorators.cache import cache_page
from django.utils.decorators import available_attrs


def has_agreed_to_request_to_meet_conditions(
    function=None, redirect_field_name=REDIRECT_FIELD_NAME
):

    def decorator(view_func):

        @login_required(
            redirect_field_name=redirect_field_name,
            login_url="/request-to-meet/agreement",
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
