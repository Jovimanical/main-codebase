from decimal import Decimal
import json
import typing
import datetime
from django.shortcuts import render
from dateutil.relativedelta import relativedelta

from allauth.account.views import ResetPasswordForm
from django.core.handlers.wsgi import WSGIRequest
from django.core.signing import b64_decode, b64_encode
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import reverse
from django.db.models import Q
from django.conf import settings
import requests

from external.models import BaseRequestTutor, Agent
from bookings.models import BookingSession
from external.tasks import magic_link_password
from users.models import User, StateWithRegion, UserProfile
from skills.models import TutorSkill

from .services import (
    GroupRequestService,
    Result,
    HomeTutoringRequestService,
    LoginService,
    TutorRevampService,
    AgentStatistics,
)


def update_tutor_price(request: WSGIRequest, slug):
    admin_email = request.META.get("HTTP_ADMIN_EMAIL")
    admin_password = request.META.get("HTTP_ADMIN_PASSWORD")
    process = False
    if admin_email and admin_password:
        admin = User.objects.filter(
            email__iexact=admin_email, is_superuser=True
        ).first()
        if admin:
            if admin.check_password(admin_password):
                process = True
    if request.method == "POST":
        data = json.loads(request.body)
        result = LoginService.update_tutor_price(slug=slug, data=data, _process=process)
        if result:
            return JsonResponse({"status": True, "data": result}, status=200)
        else:
            return JsonResponse(
                {"status": False, "errors": "Invalid data passed"}, status=400
            )
    return JsonResponse({"status": False, "errors": "Not authorized"}, status=403)


def tutor_update(request: WSGIRequest, slug):
    admin_email = request.META.get("HTTP_ADMIN_EMAIL")
    admin_password = request.META.get("HTTP_ADMIN_PASSWORD")
    process = False
    if admin_email and admin_password:
        admin = User.objects.filter(
            email__iexact=admin_email, is_superuser=True
        ).first()
        if admin:
            if admin.check_password(admin_password):
                process = True
    if request.method == "POST":
        data = json.loads(request.body)
        result = LoginService.update_tutor_info(slug=slug, data=data, _process=process)
        if result:
            return JsonResponse({"status": True, "data": result}, status=200)
        else:
            return JsonResponse(
                {"status": False, "errors": "Invalid data passed"}, status=400
            )
    return JsonResponse({"status": False, "errors": "Not authorized"}, status=403)


def tutor_new_profile(request: WSGIRequest, slug: str):
    user = (
        User.objects.filter(
            slug__iexact=slug, profile__application_status=UserProfile.VERIFIED
        )
        .response_annotation(datetime.datetime.now() + relativedelta(months=4))
        .first()
    )
    if user:
        profile_info = LoginService.tutor_login({"email": user.email}, True)
        return JsonResponse(
            {
                "status": True,
                "data": {
                    "userId": user.slug,
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                    "requestPending": user.pending_to_be_booked,
                    "requestsDeclined": user.requestsDeclined,
                    "totalJobsAssigned": user.totalJobsAssigned,
                    "totalJobsAccepted": user.totalJobsAccepted,
                    "requestsNotResponded": user.requestsNotResponded,
                    "photo": user.cloudinary_image,
                    "level": "premium"
                    if (user.data_dump or {})
                    .get("tutor_update", {})
                    .get("others", {})
                    .get("premium")
                    else "regular",
                    "newTutorDiscount": user.revamp_data(
                        "pricingInfo", "newTutorDiscount"
                    )
                    or 0,
                    "delivery": user.delivery,
                    "profile_info": profile_info,
                    "lastCalendarUpdate": user.lastCalendarUpdate,
                },
            }
        )
    return JsonResponse(
        {"status": False, "errors": "No user with id passed"}, status=400
    )


def login(request: WSGIRequest):
    admin_email = request.META.get("HTTP_ADMIN_EMAIL")
    admin_password = request.META.get("HTTP_ADMIN_PASSWORD")
    process = False
    admin = None
    if admin_email and admin_password:
        admin = User.objects.filter(
            email__iexact=admin_email, is_superuser=True
        ).first()
        if admin:
            if admin.check_password(admin_password):
                process = True
    if request.method == "POST":
        data = json.loads(request.body)
        is_tutor = data.get("is_tutor")
        telegram_id = data.get("telegram_id")
        if telegram_id:
            result = LoginService.get_user_by_telegram(telegram_id)
            if result.errors:
                return JsonResponse(
                    {"status": False, "errors": result.errors}, status=400
                )
            return JsonResponse({"status": True, "data": result.data})
        else:
            if is_tutor:
                if "code" not in data and not "password" in data:
                    r = LoginService.generate_login_code(data)
                    if r.errors:
                        return JsonResponse(
                            {"status": False, "errors": r.errors}, status=400
                        )
                    return JsonResponse({"status": True, "data": r.data})
                result = LoginService.tutor_login(data, process)
            else:
                result = LoginService.request_user_login(data, process)
            if result:
                return JsonResponse({"status": True, "data": result}, status=200)
    return JsonResponse(
        {"status": False, "errors": "Invalid email or password or code"}, status=400
    )


def fetch_all_tutor_subjects(request: WSGIRequest):
    admin_email = request.META.get("HTTP_ADMIN_EMAIL")
    admin_password = request.META.get("HTTP_ADMIN_PASSWORD")
    process = True
    if admin_email and admin_password:
        admin = User.objects.filter(
            email__iexact=admin_email, is_superuser=True
        ).first()
        if admin:
            if admin.check_password(admin_password):
                process = True
    if process:
        if request.method == "POST":
            body = json.loads(request.body)
            result: Result = TutorRevampService.get_subjects(body)
            return JsonResponse({"status": True, "data": result.data})
    return JsonResponse({"status": False, "error": "Invalid params passed"})


def delete_tutor_subject(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        result: Result = TutorRevampService.delete_subject(body)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def save_tutor_subject(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        result: Result = TutorRevampService.save_subject_info(body)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def bulk_request_fetch(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        result = HomeTutoringRequestService.generic_bulk_fetch(body)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def get_tutor_subjects(request: WSGIRequest):
    admin_email = request.META.get("HTTP_ADMIN_EMAIL")
    admin_password = request.META.get("HTTP_ADMIN_PASSWORD")
    process = False
    admin = None
    email = request.GET.get("email")
    if admin_email and admin_password:
        admin = User.objects.filter(
            email__iexact=admin_email, is_superuser=True
        ).first()
        if admin:
            if admin.check_password(admin_password):
                process = True
    if process:
        subjects = (
            TutorSkill.objects.filter(
                tutor__email__iexact=email,
            )
            .filter(Q(status=TutorSkill.ACTIVE) | Q(status=TutorSkill.PENDING))
            .values_list("skill__name", flat=True)
        )
        lessons_taught = BookingSession.objects.filter(
            booking__tutor__email__iexact=email, status=BookingSession.COMPLETED
        ).count()
        tutor = User.objects.filter(email__iexact=email).first()
        if tutor:
            isNewTutor = tutor.date_joined >= datetime.datetime(2020, 1, 1)
            return JsonResponse(
                {
                    "status": True,
                    "data": {
                        "subjects": list(subjects),
                        "lessonsTaught": lessons_taught,
                        "isNewTutor": isNewTutor,
                    },
                },
                status=200,
            )
    return JsonResponse({"status": False, "errors": "Invalid credentials"}, status=400)


def send_login_link(request, callback_url, email):
    url = request.build_absolute_uri(
        reverse("new_flow_magic_link")
        + f"?callback_url={callback_url}&hash={b64_encode(email.encode()).decode('utf-8')}"
    )
    magic_link_password.delay(email, url)


def reset_password(request: WSGIRequest):
    email = None
    callback_url = None
    if request.method == "GET":
        email = request.GET.get("email")
        callback_url = request.GET.get("callback_url")
    elif request.method == "POST":
        data = json.loads(request.body)
        email = data["email"]
        callback_url = data.get("callback_url")
    if email:
        form = ResetPasswordForm({"email": email})
        if form.is_valid() and callback_url:
            send_login_link(request, callback_url, email)
            # result = form.save(request)
            return JsonResponse({"status": True, "msg": "Password sent to email"})
        return JsonResponse({"status": False, "errors": form.errors}, status=400)
    return JsonResponse({"status": False, "msg": "Email not passed"}, status=400)


def initialize_request(request: WSGIRequest):
    admin_email = request.META.get("HTTP_ADMIN_EMAIL")
    admin_password = request.META.get("HTTP_ADMIN_PASSWORD")
    process_action = False
    email = None
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.pop("email", None)
        if email and not "personalInfo" in data:
            # fetch admin
            admin = User.objects.filter(
                email__iexact=admin_email, is_superuser=True
            ).first()
            if admin:
                if admin.check_password(admin_password):
                    process_action = True
        elif not email and "personalInfo" in data:
            process_action = True
    if process_action:
        result: Result = GroupRequestService.initialize_request(data, email=email)
        if result.errors:
            if result.status_code == 403:
                callback_url = result.errors.pop("callback_url")
                email = result.errors.pop("email")
                send_login_link(request, callback_url, email)
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    else:
        return JsonResponse({"status": False, "msg": "Not authorized"}, status=403)


def magic_link_login(request: WSGIRequest):
    admin_email = request.META.get("HTTP_ADMIN_EMAIL")
    admin_password = request.META.get("HTTP_ADMIN_PASSWORD")
    process_action = False
    email = None
    if request.method == "GET":
        callback_url = request.GET.get("callback_url")
        slug = request.GET.get("slug")
        hash = request.GET.get("hash")
        if slug:
            BaseRequestTutor.objects.filter(slug=slug).update(
                status=BaseRequestTutor.COMPLETED
            )
        try:
            email = b64_decode(hash.encode())
            user = User.objects.filter(email=email).first()
            if user:
                full_url = f"{callback_url}?admin-login=true&email={user.email}"
                if slug:
                    full_url += f"&slug={slug}"
                return HttpResponseRedirect(full_url)
        except Exception as e:
            pass
    return HttpResponseRedirect("/")


def get_booking_info(request: WSGIRequest, slug: str):
    rq = BaseRequestTutor.objects.filter(slug=slug).first()
    if not rq:
        return JsonResponse(
            {"status": False, "msg": "Invalid request slug passed"}, status=400
        )
    if request.method == "GET":
        return JsonResponse(
            {
                "status": True,
                "data": {
                    "bookingID": rq.slug,
                    "status": rq.get_status_display(),
                    "classInfo": rq.request_info["classInfo"],
                    "registrationInfo": rq.request_info["requestInfo"],
                    "paymentInfo": rq.request_info.get("paymentInfo"),
                },
            }
        )
    return JsonResponse({"status": False, "msg": "Invalid request"}, status=400)


def get_booking_with_classID(request: WSGIRequest, class_id: str):
    email = request.GET.get("email")
    rq = None
    if email:
        rq = BaseRequestTutor.objects.filter(
            request_info__classInfo__classSelected=class_id, email=email
        ).first()
    if not rq:
        return JsonResponse(
            {"status": False, "msg": "Invalid request slug passed"}, status=400
        )
    if request.method == "GET":
        return JsonResponse(
            {
                "status": True,
                "data": {
                    "bookingID": rq.slug,
                    "status": rq.get_status_display(),
                    "classInfo": rq.request_info["classInfo"],
                    "registrationInfo": rq.request_info["requestInfo"],
                    "paymentInfo": rq.request_info.get("paymentInfo"),
                },
            }
        )
    return JsonResponse({"status": False, "msg": "Invalid request"}, status=400)


def update_request(request: WSGIRequest, slug: str):
    admin_email = request.META.get("HTTP_ADMIN_EMAIL")
    admin_password = request.META.get("HTTP_ADMIN_PASSWORD")

    process_action = False
    rq = BaseRequestTutor.objects.filter(slug=slug).first()
    if not rq:
        return JsonResponse(
            {"status": False, "msg": "Invalid request slug passed"}, status=400
        )
    if request.method == "POST":
        data = json.loads(request.body)
        made_payment = data.pop("madePayment", None)
        # import pdb; pdb.set_trace()
        rq.request_info = {**rq.request_info, **data}
        if admin_password and admin_email:
            admin = User.objects.filter(email=admin_email).get()
            if admin and made_payment:
                if admin.check_password(admin_password):
                    rq.status = BaseRequestTutor.PAYED
        rq.save()
        return JsonResponse(
            {
                "status": True,
                "data": {
                    "classSelected": rq.request_info["classInfo"]["classSelected"],
                    "status": rq.get_status_display(),
                    "bookingID": rq.slug,
                    "registrationInfo": rq.request_info["requestInfo"],
                    "paymentInfo": rq.request_info.get("paymentInfo"),
                },
            }
        )
    return JsonResponse({"status": False, "msg": "Invalid request"}, status=400)


def get_bank_details(request: WSGIRequest):
    if request.method == "POST":
        data = json.loads(request.body)
        result = GroupRequestService.ensure_bank_details(**data)
        return JsonResponse(result)
    return JsonResponse({"status": False, "msg": "Invalid request"}, status=400)


def update_bank_transfer(request: WSGIRequest):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data["customer"]["email"]
        amount = data["amount"]
        rq = GroupRequestService.get_unpaid_request(email, amount)
        if rq:
            rq.request_info = {**rq.request_info, "payment_response": data}
            rq.status = BaseRequestTutor.PAYED
            rq.save()
            return JsonResponse(
                {
                    "status": True,
                    "data": {
                        "classSelected": rq.request_info["classInfo"]["classSelected"],
                        "status": rq.get_status_display(),
                        "bookingID": rq.slug,
                        "registrationInfo": rq.request_info["requestInfo"],
                        "paymentInfo": rq.request_info.get("paymentInfo"),
                    },
                }
            )
    return JsonResponse({"status": False, "msg": "Invalid request"}, status=400)


def save_home_tutoring_request(request: WSGIRequest, slug):
    if request.method == "POST":
        data = json.loads(request.body)
        request_body = data["requestData"]
        update_raw = data.get("update_raw")
        is_admin = data.get("isAdmin")
        if update_raw is None:
            update_raw = True
        result: Result = HomeTutoringRequestService.initialize_request(
            request_body, slug, update_raw=update_raw, is_admin=is_admin
        )
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse(
        {"status": False, "errors": "Only POST requests allowed"}, status=400
    )


def issue_new_home_tutoring_request(request: WSGIRequest):
    if request.method == "POST":
        data = json.loads(request.body)
        result: Result = HomeTutoringRequestService.issue_request(data)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse(
        {"status": False, "errors": "Only POST requests allowed"}, status=400
    )


def save_whatsapp_info(request: WSGIRequest, slug: str):
    if request.method == "POST":
        data = json.loads(request.body)
    return JsonResponse({"status": True})


def generic_request_update(request: WSGIRequest, slug: str):
    if request.method == "POST":
        data = json.loads(request.body)
        result: Result = HomeTutoringRequestService.update_request_data(slug, data)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse({"status": False, "data": "Not allowed"}, status=405)


def update_home_tutoring_request(request: WSGIRequest, slug: str):
    if request.method == "POST":
        data = json.loads(request.body)
        request_body = data["requestData"]
        budgets = data["paymentInfo"]
        new_pricing = data.get("new_pricing")
        isAdmin = data.get("isAdmin")
        send_notice = True
        if new_pricing:
            send_notice = False
        result: Result = HomeTutoringRequestService.update_request(
            slug, request_body, budgets, send_notice=send_notice, is_admin=isAdmin
        )
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    as_parent = request.GET.get("as_parent")
    rq = BaseRequestTutor.objects.filter(slug=slug).first()
    if rq:
        result: Result = HomeTutoringRequestService.get_request_info(
            rq, as_parent=as_parent
        )
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse({"status": False, "errors": {"msg": "not found"}}, status=400)


def get_agent_info(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        params = {}
        if body.get("email"):
            params = {"email__iexact": body["email"]}
        elif body.get("id"):
            params = {"pk": int(body["id"])}
        agent = Agent.objects.filter(**params).first()
        if agent:
            return JsonResponse(
                {
                    "status": True,
                    "data": {
                        "id": agent.id,
                        "title": agent.title,
                        "name": agent.name,
                        "phone_number": str(agent.phone_number),
                        "email": agent.email,
                        "image": agent.profile_pic,
                        "slack_id": agent.slack_id,
                    },
                },
                status=200,
            )
        return JsonResponse(
            {"status": False, "error": {"msg": "Agent not found"}}, status=400
        )
    return JsonResponse(
        {"status": False, "error": {"msg": "Agent not found"}}, status=400
    )


def agent_for_home_tutoring(request: WSGIRequest, slug: str):
    rq = BaseRequestTutor.objects.filter(slug=slug, related_request=None).first()
    if not rq:
        return JsonResponse(
            {"status": False, "errors": {"msg": "No request with slug found"}},
            status=400,
        )
    # agent = rq.agent or Agent.get_agent()
    # if rq.agent and rq.state and rq.vicinity:
    #     if rq.state.lower() == "abuja" or rq.vicinity.lower() == "wuse2":
    #         obj = Agent.get_abuja_agent()
    #         if obj:
    #             rq.agent = obj
    #             rq.save()
    agent = {
        "title": rq.agent.title,
        "name": rq.agent.name,
        "phone_number": str(rq.agent.phone_number),
        "email": rq.agent.email,
        "image": rq.agent.profile_pic,
        "slack_id": rq.agent.slack_id,
    }
    splits = sorted([x.slug for x in rq.get_split_request()])
    walletBalance = rq.wallet_balance_available(True)
    return JsonResponse(
        {
            "status": True,
            "data": {
                "slug": rq.slug,
                "status": rq.get_status_display(),
                "requestData": rq.client_request,
                "paymentInfo": {
                    **rq.payment_info,
                    "paidSpeakingFee": rq.paid_fee,
                    "walletBalance": walletBalance,
                },
                "tutor_responses": rq.tutor_responses,
                "splits": splits,
                "agent": agent,
                "created": rq.created.isoformat(),
                "modified": rq.modified.isoformat(),
            },
        }
    )


def get_related_regions(request: WSGIRequest):
    if request.method == "POST":
        data = json.loads(request.body)
        region = data.get("region")
        state = data.get("state")
        radius = data.get("radius")
    elif request.method == "GET":
        region = request.GET.get("region")
        state = request.GET.get("state")
        radius = request.GET.get("radius")
        if radius:
            radius = float(radius)
    if region and radius:
        data = HomeTutoringRequestService.get_related_regions(
            region, radius, state=state
        )
        if len(data) == 2:
            result, with_distance = data
            return JsonResponse(
                {
                    "status": True,
                    "query": {
                        "name": result.region,
                        "state": result.state,
                        "latitude": result.latitude,
                        "longitude": result.longitude,
                    },
                    "data": [
                        {
                            "region": x[1].region,
                            "state": x[1].state,
                            "distance": x[0],
                        }
                        for x in with_distance
                    ],
                }
            )
    return JsonResponse({"status": False, "data": []}, status=400)


def search(request: WSGIRequest):
    params = {}
    if request.method == "GET":
        params = request.GET.dict()
    elif request.method == "POST":
        params = json.loads(request.body)
    if params:
        queryset = HomeTutoringRequestService.get_search_result(params)
        return JsonResponse(
            {
                "status": True,
                "count": len(queryset),
                "data": queryset,
            },
            status=200,
        )
    return JsonResponse({"status": False, "data": [], "count": 0}, status=400)


def update_client_order(request: WSGIRequest, slug: str):
    if request.method == "POST":
        body = json.loads(request.body)
        result = HomeTutoringRequestService.update_payment_made_for_pool_tutor(
            slug, body
        )
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse(
        {"status": False, "errors": {"msg": "invalid method"}}, status=400
    )


def create_client_order(request: WSGIRequest, slug: str):
    if request.method == "POST":
        body = json.loads(request.body)
        result = HomeTutoringRequestService.create_booking_for_pool_tutor(slug, body)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})
    return JsonResponse(
        {"status": False, "errors": {"msg": "invalid method"}}, status=400
    )


def tutors_selected_for_job(request: WSGIRequest, slug: str):
    result = HomeTutoringRequestService.tutors_selected_for_job(slug)
    if result.errors:
        return JsonResponse({"status": False, "errors": result.errors}, status=400)
    return JsonResponse({"status": True, "data": result.data})


def tutors_who_applied_for_job(request: WSGIRequest, slug: str):
    result = HomeTutoringRequestService.tutors_who_applied_for_job(slug)
    if result.errors:
        return JsonResponse({"status": False, "errors": result.errors}, status=400)
    return JsonResponse({"status": True, "data": result.data})


def specific_tutor_search(request: WSGIRequest):
    if request.method == "POST":
        params = json.loads(request.body)
        result: Result = HomeTutoringRequestService.specific_tutor_search(params)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})


def update_request_pool(request: WSGIRequest, slug: str):
    if request.method == "POST":
        params = json.loads(request.body)
        result: Result = HomeTutoringRequestService.update_request_pool(
            slug, params, request
        )
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})


def add_tutor_to_pool(request: WSGIRequest):
    if request.method == "POST":
        params = json.loads(request.body)
        result: Result = HomeTutoringRequestService.add_tutor_to_pool(params)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data})


# def job_applicants


def update_admin_status(request: WSGIRequest, slug: str):
    if request.method == "POST":
        params = json.loads(request.body)
        rq = BaseRequestTutor.objects.filter(slug=slug).first()
        status = params.pop("status", None)
        if rq:
            rq.request_info["admin"] = params
            if status:
                v = [i for i, j in rq.STATES if j == status]
                if v:
                    rq.status = v[0]
            rq.save()
        return JsonResponse({"status": True}, status=200)


def search_data_for_tutors(request: WSGIRequest, slug: str):
    if request.method == "POST":
        params = json.loads(request.body)
        request_placed = BaseRequestTutor.objects.filter(slug=slug).first()
        if request_placed:
            queryset = HomeTutoringRequestService.selected_tutors_data(
                request_placed, params
            )
            return JsonResponse({"status": True, "data": queryset}, status=200)
    return JsonResponse({"status": False, "data": [], "count": 0}, status=400)


def tutor_reviews(request: WSGIRequest, slug: str):
    reviews, certifications = HomeTutoringRequestService.get_tutor_reviews(slug)
    return JsonResponse(
        {
            "status": True,
            "data": {
                "certifications": [
                    {"award": x.award_name, "institution": x.award_institution}
                    for x in certifications
                ],
                "testimonials": [
                    {
                        "firstName": x.commenter.first_name,
                        "lastName": x.commenter.last_name,
                        "review": x.review,
                        "dateReviewed": x.created.isoformat(),
                        "rating": x.score,
                        "subjectsBooked": [x.tutor_skill.skill.name],
                        "lessonsBooked": x.lessonsBooked,
                    }
                    for x in reviews
                ],
            },
        }
    )


def get_discount_statistics(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        result: Result = HomeTutoringRequestService.get_discount_stats(body)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def whatsapp_webhook(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        HomeTutoringRequestService.parse_webhook(body)
    return JsonResponse({"status": True}, status=200)


def create_booking_by_tutor(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        result: Result = HomeTutoringRequestService.book_lessons(body)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def tutoring_jobs(request: WSGIRequest):
    if request.method == "GET":
        slug = request.GET.get("t_slug")
        if slug:
            result: Result = HomeTutoringRequestService.get_tutor_jobs(slug=slug)
            if result.errors:
                return JsonResponse(
                    {"status": False, "errors": result.errors}, status=400
                )
            return JsonResponse({"status": True, "data": result.data}, status=200)
    elif request.method == "POST":
        body = json.loads(request.body)
        result: Result = HomeTutoringRequestService.save_tutor_response(body)
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def send_notification_to_tutor(request: WSGIRequest, slug: str):
    if request.method == "POST":
        body = json.loads(request.body)
        result: Result = HomeTutoringRequestService.send_notification(
            slug, body, kind="tutor"
        )
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def send_notification_to_client(request: WSGIRequest, slug: str):
    if request.method == "POST":
        body = json.loads(request.body)
        result: Result = HomeTutoringRequestService.send_notification(
            slug, body, kind="client"
        )
        if result.errors:
            return JsonResponse({"status": False, "errors": result.errors}, status=400)
        return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def successful_speaking_fee_payment(request: WSGIRequest, slug: str):
    if request.method == "GET":
        amount_paid = request.GET.get("amount") or "0"
        speaking_code = request.GET.get("speaking_code")
        if speaking_code == settings.TUTERIA_ACCESS_CODE:
            result: Result = HomeTutoringRequestService.successful_online_payment(
                slug, Decimal(float(amount_paid)), kind="speaking"
            )
            if result.errors:
                return JsonResponse(
                    {"status": False, "errors": result.errors}, status=400
                )
            return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def after_client_online_payment(request: WSGIRequest, slug: str):
    if request.method == "GET":
        amount_paid = request.GET.get("amount") or "0"
        access_code = request.GET.get("act_code")
        deduct = request.GET.get("deduct")
        if access_code == settings.TUTERIA_ACCESS_CODE:
            result: Result = HomeTutoringRequestService.successful_online_payment(
                slug, Decimal(float(amount_paid)), deduct=deduct == "true"
            )
            if result.errors:
                return JsonResponse(
                    {"status": False, "errors": result.errors}, status=400
                )
            return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def agent_statistics(request: WSGIRequest):
    result: Result = AgentStatistics.performances(request.GET)
    if result.errors:
        return JsonResponse({"status": False, "errors": result.errors}, status=400)
    return JsonResponse({"status": True, "data": result.data})

def progress_statistics(request:WSGIRequest):
    is_json = request.GET.get('json')
    year = request.GET.get('year')
    result:Result = AgentStatistics.general_performance(year)
    if is_json:
        return JsonResponse({"status":True,'data':result.data})
    return render(request, "pages/progress-statistics.html",{'performance_data':json.dumps(result.data)})