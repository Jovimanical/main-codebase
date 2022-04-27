from django.http.response import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404
from users.models import User
import json
from .services import SingleRequestService
from django.utils.decorators import method_decorator

# from django.views.generic import View as generic_view


def admin_required(func):

    def _decorator(*args, **kwargs):
        request = args[0]
        if request.method == "POST":
            req = json.loads(request.body.decode("utf-8"))
            user_id = req.get("user_id")
        else:
            user_id = request.GET.get("user_id")

        if user_id:
            try:
                user = User.objects.get(pk=user_id)
            except ObjectDoesNotExist:
                return JsonResponse(status=404, data={"msg": "No admin user found"})

            if user.is_staff:
                return func(*args, **kwargs)
            else:
                return JsonResponse(
                    status=401,
                    data={"msg": "You are not permitted to access this data"},
                )
        else:
            return JsonResponse(status=400, data={"msg": "'user_id' not provided"})

    return _decorator


def base_request_instance_decorator(func):

    def _decorator(*args, **kwargs):
        try:
            instance = SingleRequestService(slug=kwargs["slug"])
            return func(*args, instance=instance, **kwargs)
        except Http404:
            return JsonResponse(status=404, data={"msg": "Client request not found"})

    return _decorator


def admin_required_cls(View):
    View.dispatch = method_decorator(admin_required)(View.dispatch)
    return View


def base_request_instance_decorator_cls(View):
    View.dispatch = method_decorator(base_request_instance_decorator)(View.dispatch)
    return View
