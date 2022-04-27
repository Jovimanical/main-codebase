from django.shortcuts import render
from config.view_utils import generic_response, Result
from .models import NewTutorApplicant, TutorApplicantTrack
import requests
from django.conf import settings

# Create your views here.


def tuteria_cdn_action(path, payload):
    response = requests.post(f"{settings.CDN_SERVICE}/api/{path}", json=payload)
    if response.status_code < 400:
        result = response.json()
        return result["data"]


class TutorManagementAdminService:
    @classmethod
    def update_remark(cls, body, staff):
        user_id = body.get("user_id")
        action = body.get("action")
        remark = body.get("remark")
        applicant: TutorApplicantTrack = TutorApplicantTrack.objects.filter(pk=user_id).first()
        if not any([applicant, action, remark]):
            return Result(errors={"msg": "Wrong params sent"})
        applicant.add_remark_action(
            {"action": action, "remark": remark, "staff": staff.email}
        )
        return Result(data={"content": remark})

    @classmethod
    def update_video_identity_status(cls, body, staff):
        user_id = body.get("user_id")
        type = body.get("type")
        action = body.get("action")
        applicant = TutorApplicantTrack.objects.filter(pk=user_id).first()
        if not any([applicant, action, type]):
            return Result(errors={"msg": "Wrong params sent"})
        if action == "approve":
            if type == "video":
                applicant.update_video_as_approved()
            elif type == "identity":
                applicant.approve_identity()
        elif action == "deny":
            if type == "video":
                applicant.reupload_video()
            elif type == "identity":
                applicant.reject_identity()
        applicant.add_remark_action(
            {"action": f"{action} {type}", "remark": "", "staff": staff.email}
        )
        return Result(data={"msg": True})

    @classmethod
    def update_guarantors(cls, body, staff):
        user_id = body.get("user_id")
        guarantors = body.get("guarantors")
        applicant: NewTutorApplicant = TutorApplicantTrack.objects.filter(
            pk=user_id
        ).first()
        if not any([applicant]) and not isinstance(guarantors, list):
            return Result(errors={"msg": "Wrong params sent"})
        applicant.update_guarantors(guarantors)
        applicant.add_remark_action(
            {
                "action": "guarantor update",
                "remark": f"removed guarantor",
                "staff": staff.email,
            }
        )
        return Result(data={"msg": True})

    @classmethod
    def approve_guarantors(cls, body, staff):
        user_id = body.get("user_id")
        action = body.get("action")
        applicant: NewTutorApplicant = TutorApplicantTrack.objects.filter(
            pk=user_id
        ).first()
        if not any([applicant, action]):
            return Result(errors={"msg": "Wrong params sent"})
        if action == "approve":
            applicant.verify_guarantors()
        elif action == "deny":
            applicant.notify_to_update_guarantors()
        applicant.add_remark_action(
            {"action": "guarantor update", "remark": f"{action}", "staff": staff.email}
        )
        return Result(data={"msg": True})


def update_remark(request):
    return generic_response(
        request,
        lambda body: TutorManagementAdminService.update_remark(body, request.user),
    )


def update_video_identity_status(request):
    return generic_response(
        request,
        lambda body: TutorManagementAdminService.update_video_identity_status(
            body, request.user
        ),
    )


def update_guarantors(request):
    return generic_response(
        request,
        lambda body: TutorManagementAdminService.update_guarantors(body, request.user),
    )


def approve_guarantors(request):
    return generic_response(
        request,
        lambda body: TutorManagementAdminService.approve_guarantors(body, request.user),
    )
