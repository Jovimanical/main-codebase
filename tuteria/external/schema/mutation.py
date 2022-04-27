from graphene.types.generic import GenericScalar
import graphene
from . import types, utils
from django.shortcuts import reverse
from .. import services
from users.models import User, PhoneNumber
from external.models import BaseRequestTutor, Agent
from external.services import SingleRequestService, RequestService
from config.utils import generate_code


class saveRequestMutation(utils.BaseMutation):
    fields = [("request_dump", "json"), ("errors", "json")]
    form_fields = {
        "request_details": types.RequestInput(required=True),
        # "kind" : graphene.String(required=True),
        # "personal_info": {
        #     "fields": [
        #         ("first_name", str, {"required": True}),
        #         ("last_name", str, {"required": True}),
        #         ("email", str, {"required": True}),
        #         ("phone_number", str, {"required": True}),
        #         ("how_you_heard", str),
        #     ],
        #     "name": "UserDetailInput",
        # },
        "personal_info": types.UserDetailInput(required=False),
        "location": {
            "fields": [
                ("address", str),
                ("state", str),
                ("vicinity", str),
                ("area", str),
                ("latitude", float),
                ("longitude", float),
            ],
            "required": True,
            "name": "UserLocationInput",
        },
    }

    def callback(self, **kwargs):
        request_details = kwargs["request_details"]
        kind = "hometutoring"
        if request_details.get("exam"):
            kind = "exams"
        request = RequestService(kwargs["personal_info"]["email"])
        request_dump = request.update_or_create_request(request_type=kind, **kwargs)
        return request_dump


class completeRequestMutation(utils.BaseMutation):
    fields = [("request_dump", "json"), ("agent", "json")]
    form_fields = {
        "request_details": types.RequestInput(required=True),
        "slug": graphene.String(required=True),
    }

    def callback(self, **kwargs):
        service = SingleRequestService(kwargs["slug"])
        service.conclude_request(**kwargs)
        req = service.instance
        agent = req.agent
        if agent:
            o = {}
            for i in ["email", "name", "phone_number", "title", "image_url"]:
                o[i] = str(getattr(agent, i))
            agent = o
        request_dump = {}
        # import pdb; pdb.set_trace()
        request_dump = {
            "request_dump": {
                **req.request_info,
                "status": req.get_status_display(),
                "paid_fee": req.paid_fee,
                "fee_link": reverse("redirect_completion", args=[req.slug]),
            },
            "agent": agent,
        }
        return request_dump


class createGroupLessonRecordMutation(utils.BaseMutation):
    fields = [
        ("slug", str),
        ("request_details", "json"),
        ("payment_details", "json"),
        ("agent", "json"),
    ]
    form_fields = {
        "lesson_info": {
            "name": "LessonInfoType",
            "fields": [
                ("exam", str),
                ("lesson_plan", str),
                ("amount", str),
                ("schedule", "json"),
                ("tutor", "json"),
                ("state", str),
                ("location", str),
                ("curriculum_link", str),
                ("venue", str),
            ],
        },
        "personal_info": types.UserDetailInput(required=True),
    }

    def callback(self, **kwargs):
        lesson_info = kwargs.get("lesson_info")
        personal_info = kwargs.get("personal_info")
        request = RequestService(personal_info["email"])
        base_req = request.create_or_update_group_lesson(**kwargs)
        return RequestService.get_group_lesson_details(base_req)


class getGroupLessonMutation(utils.BaseMutation):
    fields = [
        ("slug", str),
        ("request_details", "json"),
        ("payment_details", "json"),
        ("agent", "json"),
    ]
    form_fields = {"slug": graphene.String(required=True)}

    def callback(self, **kwargs):
        rq = BaseRequestTutor.objects.filter(slug=kwargs["slug"]).first()
        if rq:
            return RequestService.get_group_lesson_details(rq)


class getSlotMutation(utils.BaseMutation):
    fields = [("schedule", "json")]
    form_fields = {
        "kind": graphene.String(required=True),
        "location": graphene.String(required=True),
    }

    def callback(self, **kwargs):
        result = RequestService.get_group_filled_slots(
            kwargs["kind"], kwargs["location"]
        )
        return {"schedule": result}


class Mutation(object):
    saveRequest = saveRequestMutation.Field()
    completeRequest = completeRequestMutation.Field()
    createGroupLessonRecord = createGroupLessonRecordMutation.Field()
    getGroupLesson = getGroupLessonMutation.Field()
    getSlot = getSlotMutation.Field()
