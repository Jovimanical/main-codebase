import json

from django.core.handlers.wsgi import WSGIRequest
from django.http.response import JsonResponse
from config.view_utils import generic_response, Result

from skills.views.services import NewTutorFlowService
from skills.models import Skill


def update_quiz(request: WSGIRequest):
    return generic_response(request, lambda body: NewTutorFlowService.update_quiz(body))


def user_select_subjects(request: WSGIRequest):
    return generic_response(
        request, lambda body: NewTutorFlowService.update_subjects_to_teach(body)
    )


def update_retake_status(request: WSGIRequest):
    return generic_response(
        request, lambda body: NewTutorFlowService.update_retake_status(body)
    )


def begin_quiz(request: WSGIRequest):
    return generic_response(request, lambda body: NewTutorFlowService.begin_quiz(body))


def complete_tutor_application(request: WSGIRequest):
    return generic_response(
        request, lambda body: NewTutorFlowService.complete_tutor_application(body)
    )


def login_tutor(request: WSGIRequest):
    return generic_response(request, lambda body: NewTutorFlowService.login_tutor(body))


def delete_tutor_subjects(request: WSGIRequest):
    return generic_response(
        request, lambda body: NewTutorFlowService.delete_subjects(body)
    )


def validate_personal_info(request: WSGIRequest):
    return generic_response(
        request, lambda body: NewTutorFlowService.validate_personal_info(body)
    )


def get_non_testable_subjects(request: WSGIRequest):
    non_testable_subjects = Skill.objects.filter(quiz=None).all()
    return JsonResponse({"data": [x.name for x in non_testable_subjects]})


def update_non_testable_subjects_with_quizes(request: WSGIRequest):
    return generic_response(
        request,
        lambda body: NewTutorFlowService.make_non_testable_subject_testable(body),
    )


def get_related_subjects(request: WSGIRequest):
    return generic_response(
        request, lambda body: NewTutorFlowService.populate_related_subjects(body)
    )
