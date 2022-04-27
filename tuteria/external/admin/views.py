from django.shortcuts import get_object_or_404
import json
from config import admin_utils
from django.utils import timezone
from external.models import BaseRequestTutor, RequestFollowUp, Agent
from connect_tutor.models import RequestPool
from django.http.response import JsonResponse
from decimal import Decimal
from external.decorators import (
    admin_required,
    base_request_instance_decorator,
    admin_required_cls,
    base_request_instance_decorator_cls,
)
from django.views.decorators.cache import cache_page
from skills.models import TutorSkill
from django.views.generic import View
from external.services.services1 import SingleRequestService
from config.view_utils import generic_response, Result


class RequestFollowUpAdminService:
    @classmethod
    def update_request(cls, body, staff):
        field = body.get("field", "")
        if field == "followup_stage":
            return cls.update_followup_stage(body, staff)
        
        return cls.update_remark(body, staff)

    @classmethod
    def update_remark(cls, body, staff):
        user_id = body.get("user_id")
        action = body.get("action")
        remark = body.get("remark")
        request: RequestFollowUp = RequestFollowUp.objects.filter(pk=user_id).first()
        if not any([request, action, remark]):
            return Result(errors={"msg": "Wrong params sent"})
        request.add_followup_remarks(
            {"action": action, "remark": remark, "staff": staff.email}
        )
        return Result(data={"content": remark, "remarks": request.followup_remarks })

    @classmethod
    def update_followup_stage(cls, body, staff):
        user_id = body.get("user_id")
        followup_stage = body.get("followup_stage")
        request: RequestFollowUp = RequestFollowUp.objects.filter(pk=user_id).first()
        if not any([request, followup_stage]):
            return Result(errors={"msg": "Wrong params sent"})
        request.update_followup_stage({ "followup_stage": followup_stage, "staff": staff.email })
        return Result(data={ "followup_stage": followup_stage })


def user_payout_details(request, pk):
    rq = get_object_or_404(BaseRequestTutor, pk=pk)
    payout = rq.user.userpayout_set.first()

    def callback(ff):
        ff.user = rq.user
        ff.save()
        rq.refund_processing_fee(ff)

    return admin_utils.process_payout_form(request, payout, callback)

def update_remark_for_admin(request, pk):
    data = json.loads(request.body.decode("utf-8"))
    current_time = timezone.now()
    admin_user = request.user
    rq = get_object_or_404(BaseRequestTutor, pk=pk)
    responses = {
        "generic": f"{data['remark']}",
        "profile_to_client": f"Sent profile to client\n{data['remark']}",
        "activity_log": f"Activity Log: \n{data['remark']}",
        "call_client_later": f"To contact client on {data['remark']}",
    }
    composed_text = (
        f"{responses[data['action']]}\nUpdated on : {current_time.strftime('%d-%m-%Y')}"
    )
    rq.remarks = composed_text
    if admin_user:
        agent = Agent.objects.filter(user=admin_user).first()
        if agent:
            rq.agent = agent
    rq.save()
    return JsonResponse({"content": rq.remarks})


def update_request(request):
    return generic_response(
        request,
        lambda body: RequestFollowUpAdminService.update_request(body, request.user)
    )


@admin_required_cls
@base_request_instance_decorator_cls
class CreateBookingFromClientRequestView(View):
    def get(self, request, *args, **kwargs):
        instance: SingleRequestService = kwargs["instance"]
        selected_tutor = instance.get_req_pool_for_base_req_selected_tutor()
        if selected_tutor:
            return JsonResponse(data={"selected_tutor": selected_tutor})
        return JsonResponse(data={"msg": "No tutor found for this request"}, status=400)

    def post(self, request, *args, **kwargs):
        instance: SingleRequestService = kwargs["instance"]
        data = json.loads(request.body.decode("utf-8"))
        result = instance.create_booking_from_admin(data)
        if result:
            return JsonResponse(
                data={"msg": "Booking successfully created"}, status=200
            )

        return JsonResponse(
            data={
                "msg": "This tutor does not have {} skill".format(
                    data.get("tutor_subject")
                )
            },
            status=400,
        )


@admin_required
@base_request_instance_decorator
def client_request_pool_list(request, *arg, **kwargs):
    instance: SingleRequestService = kwargs["instance"]
    tutors = instance.get_request_pool_list()
    qualified = instance.instance.approved_tutors()
    teach_all_subjects = instance.instance.approved_tutors_teach_all_subjects()
    approved_tutors = []
    if teach_all_subjects:
        if len(qualified) > 1:
            approved_tutors = [qualified[0]]
        else:
            approved_tutors = qualified
    else:
        approved_tutors = qualified

    return JsonResponse(
        status=200,
        data={
            "tutors": tutors,
            "teach_all_subjects": bool(teach_all_subjects),
            "split_count": instance.instance.get_split_count(approved_tutors),
        },
    )


@admin_required
@base_request_instance_decorator
def add_tutors_to_client_pool(request, *args, **kwargs):
    instance: SingleRequestService = kwargs["instance"]
    result = instance.add_tutors_to_client_pool2(request)
    if result:
        return JsonResponse(
            data={"msg": "Approved tutors added to client pool"}, status=200
        )
    return JsonResponse(
        status=400, data={"msg": "There are no approved tutors for this request"}
    )


@admin_required
@base_request_instance_decorator
def update_client_budget(request, *args, **kwargs):
    instance: SingleRequestService = kwargs["instance"]
    data = json.loads(request.body.decode("utf-8"))
    instance.instance.budget = Decimal(data.get("new_budget"))
    instance.instance.save()
    return JsonResponse(
        data={
            "msg": "Price of client request has been updated",
            "new_budget": instance.instance.budget,
            "hourly_price": instance.instance.per_hour(),
        },
        status=200,
    )


@admin_required
@base_request_instance_decorator
def update_split_count(request, *args, **kwargs):
    instance: SingleRequestService = kwargs["instance"]
    data = json.loads(request.body.decode("utf-8"))
    split_count = data.get("split_count")
    instance.instance.update_split_count(split_count)
    msg = "Request updated to multiple split"
    if split_count == 1:
        msg = "Request updated to single split"
    return JsonResponse(
        data={
            "msg": msg,
            "split_count": split_count,
        },
        status=200,
    )


@admin_required
def update_request_pool_details_view(request, request_pool_id):
    data = json.loads(request.body.decode("utf-8"))
    updated = SingleRequestService.update_request_pool_fields(request_pool_id, data)
    if updated:
        return JsonResponse(
            status=200, data={"msg": "Tutor's details updated successfully"}
        )
    return JsonResponse(status=404, data={"msg": "Request pool not found"})


@admin_required
@base_request_instance_decorator
def attach_tutor_to_client_req(request, *args, **kwargs):
    instance: SingleRequestService = kwargs["instance"]
    data = json.loads(request.body.decode("utf-8"))
    result = instance.create_req_pool_and_attach_tutor_to_baserequest(
        data.get("tutor_email")
    )
    if result:
        return JsonResponse(
            data={
                "msg": "Tutor with email: {} has been selected for this request".format(
                    data.get("tutor_email")
                ),
                "selected_tutor": result,
            }
        )

    return JsonResponse(
        data={"msg": "No tutor with email: {} found".format(data.get("tutor_email"))},
        status=400,
    )


@admin_required
def update_additional_info(request, request_pool_id):
    data = json.loads(request.body.decode("utf-8"))
    print(data)
    updated = SingleRequestService.update_additional_pool_details(request_pool_id, data)
    if updated:
        return JsonResponse(
            status=200, data={"msg": "Tutor's details updated successfully"}
        )
    return JsonResponse(status=404, data={"msg": "Request pool not found"})
