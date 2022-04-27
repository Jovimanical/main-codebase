import json
from courses.models import CourseUser

from django.http.response import JsonResponse
from .services import CourseService, Result
from django.shortcuts import render
from django.core.handlers.wsgi import WSGIRequest

# Create your views here.


def generic_response(request: WSGIRequest, callback):
    if request.method == "POST":
        body = json.loads(request.body)
        result: Result = callback(body)
        if result.errors:
            return JsonResponse(
                {"status": False, "errors": result.errors}, status=result.status_code
            )
        return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def initialize_interest(request: WSGIRequest):
    return generic_response(request, lambda body: CourseService.initialize(body))


def login(request: WSGIRequest):
    return generic_response(
        request, lambda body: CourseService.generate_login_code(body)
    )


def authenticate_login(request: WSGIRequest):
    return generic_response(
        request, lambda body: CourseService.authenticate_login_code(body)
    )


def update_course_user(request: WSGIRequest):
    return generic_response(request, lambda body: CourseService.update(body))


def get_course_info(request: WSGIRequest, slug: str):
    if request.method == "GET":
        result: Result = CourseService.get_course_info(slug)
        if result.errors:
            return JsonResponse(
                {"status": False, "errors": result.errors}, status=result.status_code
            )
        return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)
