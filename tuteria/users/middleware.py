import logging
import re
from django.utils.timezone import now
from .models import User
from django.urls import reverse
from django.shortcuts import redirect, render
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class SetLastVisitMiddleware(MiddlewareMixin):

    def process_response(self, request, response):
        if hasattr(request, "user"):
            if request.user.is_authenticated:
                # Update last visit time after request finished processing.
                User.objects.filter(pk=request.user.pk).update(last_visit=now())
        return response


class FlaggedUserMiddleware(MiddlewareMixin):

    def process_response(self, request, response):
        if hasattr(request, "user"):
            logger.info(request.META["PATH_INFO"])
            if request.user.is_authenticated:
                if request.user.flagged:
                    if request.path != "/user-banned/":
                        response["Location"] = "/user-banned/"
                        return redirect("banned")
        return response
