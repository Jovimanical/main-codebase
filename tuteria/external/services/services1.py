# -*- coding: utf-8 -*-
import copy
import datetime
import json
from decimal import Decimal
import logging
import os
from django.urls import reverse
from django.db.models import Q
from django.http import Http404
from django.utils.functional import cached_property
from django.utils import timezone
from django.conf import settings
from requests.sessions import session
from skills.models import TutorSkill, Skill, SkillWithState
from external import models as ex_models
from external import forms as ex_forms
from external import tasks as ex_tasks
from external import subjects as ex_subjects
from config import signals, utils
from paypal.standard.forms import PayPalPaymentsForm
import referrals as r
import users as u
import wallet as w
import bookings as b
from pricings.models import Region, Pricing
from bookings.services import BookingService
from bookings.models import Booking
from connect_tutor.admin import RequestPoolAdmin
from connect_tutor.models import RequestPool
from config.utils import generate_code
from django.contrib import admin

logger = logging.getLogger(__name__)


def copy_request(request):
    req_copy = copy.copy(request)
    req_copy.POST = request.POST.copy()
    return req_copy


def generate_key(key, index, value=None):
    return f"session-{index}-{key}", value


def helper_func(instance, i, student_no):
    result = [
        generate_key(x, i, instance[x]) for x in ["start", "no_of_hours", "price"]
    ]
    result.append(generate_key("student_no", i, student_no))
    return result


def build_session_for_new_flow(i, raw_request):
    def format_time():
        try:
            oo = datetime.datetime.strptime(
                f"{raw_request['startDate']} {raw_request['startTime']}",
                "%Y-%m-%d %I:%M %p",
            )
        except ValueError as e:
            oo = datetime.datetime.strptime(
                f"{raw_request['startDate']} {raw_request['startTime']}",
                "%Y-%m-%d %I.%M %p",
            )
        return oo

    instance = {
        "start": format_time(),
        "no_of_hours": raw_request["hours"],
        "price": float("%.2f" % raw_request["price"]),
        "student_no": raw_request["students"],
    }
    result = [
        generate_key(x, i, instance[x])
        for x in ["start", "no_of_hours", "price", "student_no"]
    ]
    return result


def get_phone_number(previous_number):
    if not previous_number:
        return ""
    if previous_number.startswith("+234"):
        previous_number = previous_number[4:]
    if previous_number.startswith("0"):
        previous_number = previous_number[1:]
    return "+234{}".format(previous_number)


def get_search_result_for_page(request):
    """Fetch search result based on page. if default search page, returns None"""
    from_skill_page = request.get("skill_page")
    from_category_page = request.get("category_page")
    if from_skill_page:
        return TutorSkill.objects.with_category_or_skill(
            from_skill_page, **all_search_filters(request)
        )
    if from_category_page:
        return TutorSkill.objects.featured_category_search(
            from_category_page, **all_search_filters(request)
        )
    return None


def all_search_filters(request):
    param = {}
    keys = [
        "age",
        "query",
        "start_rate",
        "end_rate",
        "gender",
        "is_teacher",
        "region",
        "tags",
        "days",
        "days_per_week",
    ]
    for key in keys:
        param[key] = request.get(key)
    if not param.get("region"):
        param["region"] = "Lagos"
    return param


class RequestService(object):
    gender_prefix = dict(Male="M", Female="F")

    def __init__(self, email):
        self.requests = ex_models.BaseRequestTutor.objects.filter(email=email)

    def all(self, placed_only=True):
        if placed_only:
            return self.requests.exclude(status=ex_models.BaseRequestTutor.ISSUED)
        return self.requests.all()

    @classmethod
    def notify_client(cls, request_pk, booking):
        br = ex_models.BaseRequestTutor.objects.get(pk=request_pk)
        br.booking = booking
        br.save()
        return br.user

    # def update_or_create_request(self, **kwargs):
    #     request_details = kwargs.get("request_details")
    #     personal_info = kwargs.get("personal_info")
    #     location = kwargs.get("location")
    #     base_req = self.requests.filter(status=ex_models.BaseRequestTutor.ISSUED).last()
    #     if not base_req:
    #         base_req = ex_models.BaseRequestTutor()
    #         base_req.email = personal_info["email"]
    #     no_of_students = len(request_details["classes"])
    #     for k in ["latitude", "longitude", "state", "vicinity"]:
    #         setattr(base_req, k, location.get(k))

    #     base_req.slug = generate_code(ex_models.BaseRequestTutor, "slug")
    #     base_req.no_of_students = no_of_students
    #     base_req.number = f"+{personal_info['phone_number']}"
    #     base_req.where_you_heard = personal_info.get("how_you_heard") or ""
    #     base_req.is_parent_request = True
    #     base_req.first_name = personal_info["first_name"]
    #     base_req.last_name = personal_info["last_name"]
    #     base_req.classes = [x["class"] for x in request_details["classes"]]
    #     base_req.curriculum = [
    #         x[0]
    #         for x in base_req.CURRICULUM
    #         if x[1].lower().startswith(request_details["curriculum"][0].lower())
    #     ]
    #     if len(base_req.curriculum) == 0:
    #         base_req.curriculum = ''
    #     else:
    #         base_req.curriculum = base_req.curriculum[0]
    #     base_req.home_address = location["address"]
    #     base_req.gender = self.gender_prefix.get(request_details["gender"], "")
    #     base_req.request_info = dict(
    #         request_details={
    #             **kwargs.get("request_details"),
    #             "processing_fee": float(settings.PROCESSING_FEE),
    #         },
    #         personal_info=kwargs.get("personal_info"),
    #         location=kwargs.get("location"),
    #         status=base_req.get_status_display(),
    #     )
    #     base_req.expectation = base_req.extract_expectation_from_request()
    #     base_req.request_subjects = base_req.extract_subject_from_request()
    #     request_dump = base_req.request_info
    #     request_dump["slug"] = base_req.slug
    #     if base_req.user:
    #         ph = u.models.PhoneNumber.objects.filter(owner=base_req.user).first()
    #         if not ph:
    #             ph = u.models.PhoneNumber(
    #                 owner=base_req.user,
    #                 primary=True,
    #                 number=personal_info["phone_number"],
    #             )
    #             ph.number = f"+{personal_info['phone_number']}"
    #             ph.save()
    #         base_req.user = base_req.user
    #         base_req.user.save()
    #     base_req.save()
    #     ex_models.BaseRequestTutor.objects.filter(pk=base_req.pk).update(
    #         created=timezone.now()
    #     )
    #     return {"request_dump": request_dump}
    def get_request_instance(self, personal_info):
        """Get the last request that was missued that belongs to the client. if non
        found then create a new one"""
        base_req = self.requests.filter(status=ex_models.BaseRequestTutor.ISSUED).last()
        if not base_req:
            base_req = ex_models.BaseRequestTutor()
            base_req.email = personal_info["email"]

        base_req.slug = generate_code(ex_models.BaseRequestTutor, "slug")

        base_req.number = f"+{personal_info['phone_number']}"
        base_req.where_you_heard = personal_info.get("how_you_heard") or ""

        base_req.first_name = personal_info["first_name"]
        base_req.last_name = personal_info["last_name"]
        return base_req

    def update_request_as_recent_and_create_phone_number(self, base_req, personal_info):
        """Save slug in request info as well as use existing user phonenumber and update
        date the request was created."""
        request_dump = base_req.request_info
        request_dump["slug"] = base_req.slug
        if base_req.user:
            ph = u.models.PhoneNumber.objects.filter(owner=base_req.user).first()
            if not ph:
                ph = u.models.PhoneNumber(
                    owner=base_req.user,
                    primary=True,
                    number=personal_info["phone_number"],
                )
                ph.number = f"+{personal_info['phone_number']}"
                ph.save()
            base_req.user = base_req.user
            base_req.user.save()
        base_req.save()
        ex_models.BaseRequestTutor.objects.filter(pk=base_req.pk).update(
            created=timezone.now()
        )
        return base_req

    def create_or_update_group_lesson(self, **kwargs):
        lesson_info = kwargs.get("lesson_info")
        personal_info = kwargs.get("personal_info")
        base_req = self.get_request_instance(personal_info)
        base_req.request_subjects = [lesson_info.get("exam").upper()]
        base_req.request_info = dict(
            request_details={**lesson_info},
            personal_info=personal_info,
            status=base_req.get_status_display(),
        )
        base_req = self.update_request_as_recent_and_create_phone_number(
            base_req, personal_info
        )
        # assigns state, amount and vicinity from lesson_info to client
        base_req.state = lesson_info.get("state")
        base_req.vicinity = lesson_info.get("location")
        base_req.budget = Decimal(lesson_info.get("amount"))
        base_req.request_type = 5
        # get agent with email tunji
        agent = ex_models.Agent.get_agent(kind=ex_models.Agent.GROUP)
        if not agent:
            agent = ex_models.Agent.objects.filter(type=ex_models.Agent.GROUP).first()
        if base_req.state:
            if base_req.state.lower() == "abuja":
                # for now let benita handle them all.
                results = ex_models.Agent.get_abuja_agent()
                if results:
                    agent = results
        base_req.agent = agent

        # attached tutor with request
        tt = lesson_info.get("tutor")
        tutor = u.models.User.objects.filter(email=tt.get("email")).first()
        base_req.tutor = tutor
        base_req.status = ex_models.BaseRequestTutor.PENDING
        base_req.save()
        service = SingleRequestService(base_req.slug)
        user, _ = service.create_user_instance_in_form()
        base_req.user = user
        base_req.save()
        base_req.set_group_expectation()
        # generate paystack link
        return base_req

    @classmethod
    def get_group_lesson_details(self, base_req):
        payment_detail = base_req.generate_payment_link_for_group_lessons()
        agent = {}
        for i in ["email", "name", "phone_number", "title", "image_url"]:
            agent[i] = str(getattr(base_req.agent, i))
        return {
            "slug": base_req.slug,
            "request_details": base_req.request_info,
            "payment_details": payment_detail,
            "agent": agent,
        }

    @classmethod
    def get_group_filled_slots(cls, kind, location):
        """
        Get the list of slots that match the passed kind and location"""
        records = ex_models.BaseRequestTutor.objects.filter(
            request_info__request_details__exam__iexact=kind,
            request_info__request_details__location__iexact=location,
            status=ex_models.BaseRequestTutor.PAYED,
        )

        def response(d):
            request_details = d.request_info["request_details"]
            return {
                "type": request_details["lesson_plan"],
                "name": request_details["schedule"]["summary"],
                "created": d.created.strftime("%m-%Y"),
            }

        return [response(x) for x in records]

    def update_or_create_request(self, request_type, **kwargs):
        request_details = kwargs.get("request_details")
        personal_info = kwargs.get("personal_info")
        location = kwargs.get("location")
        base_req = self.get_request_instance(personal_info)

        for k in ["latitude", "longitude", "state", "vicinity"]:
            setattr(base_req, k, location.get(k))

        base_req.home_address = location["address"]
        base_req.gender = self.gender_prefix.get(request_details.get("gender"), "")
        base_req.request_info = dict(
            request_details={
                **kwargs.get("request_details"),
                "processing_fee": float(settings.PROCESSING_FEE),
            },
            personal_info=kwargs.get("personal_info"),
            location=kwargs.get("location"),
            status=base_req.get_status_display(),
        )

        if request_type == "hometutoring":
            no_of_students = len(request_details["classes"])
            online_lessons = request_details.get("online_lessons") or "Physical Lessons"
            rq = 1
            if "online" in online_lessons.lower():
                rq = 3

            base_req.no_of_students = no_of_students
            base_req.is_parent_request = True

            base_req.classes = [x["class"] for x in request_details["classes"]]
            base_req.curriculum = [
                x[0]
                for x in base_req.CURRICULUM
                if x[1].lower().startswith(request_details["curriculum"][0].lower())
            ]
            if len(base_req.curriculum) == 0:
                base_req.curriculum = ""
            else:
                base_req.curriculum = base_req.curriculum[0]

            base_req.expectation = base_req.extract_expectation_from_request()
            base_req.request_subjects = base_req.extract_subject_from_request()
            base_req.request_type = rq

        elif request_type == "exams":
            base_req.no_of_students = request_details.get("student_no")

            def resolve_expectation(request_details):
                def resolve_selections(selections, targeted_score=None):
                    array_selections = selections
                    score = targeted_score or {}
                    if isinstance(selections, dict):
                        array_selections = selections.get("papers", [])

                    if targeted_score:
                        array_selections = [
                            f"{x}({score[x]['score']}/{score[x].get('total',0)})"
                            for x in array_selections
                        ]

                    array_selections_str = ", ".join(array_selections)

                    # Replacing targeted score without total score.
                    array_selections_str = array_selections_str.replace("/0", "")
                    return array_selections_str

                r_selections = request_details.get("selections")
                r_targeted_score = request_details.get("targeted_score")
                selections = resolve_selections(r_selections, r_targeted_score)
                purpose = request_details.get("purpose", "")
                expectations = request_details.get("expectations", "")
                section = request_details.get("exam_type", "")
                online_lesson = request_details.get("online_lesson", "No")
                return f"purpose: {purpose}\nsection: {section}\nselections: {selections}\nonline lessons: {online_lesson}\nother information: {expectations}\n\n"

            def resolve_request_subject(exam):
                skills = dict(
                    gre="GRE",
                    ican="ICAN",
                    acca="ACCA",
                    gmat="GMAT",
                    sat="SAT",
                    ielts="IELTS",
                )
                return skills.get(exam, "")

            base_req.expectation = resolve_expectation(request_details)
            base_req.request_subjects = [
                resolve_request_subject(request_details.get("exam"))
            ]
        base_req = self.update_request_as_recent_and_create_phone_number(
            base_req, personal_info
        )
        # request_dump = base_req.request_info
        # request_dump["slug"] = base_req.slug
        # if base_req.user:
        #     ph = u.models.PhoneNumber.objects.filter(owner=base_req.user).first()
        #     if not ph:
        #         ph = u.models.PhoneNumber(
        #             owner=base_req.user,
        #             primary=True,
        #             number=personal_info["phone_number"],
        #         )
        #         ph.number = f"+{personal_info['phone_number']}"
        #         ph.save()
        #     base_req.user = base_req.user
        #     base_req.user.save()
        # base_req.save()
        # ex_models.BaseRequestTutor.objects.filter(pk=base_req.pk).update(
        #     created=timezone.now()
        # )
        base_req.request_info["discount_info"] = (
            ex_models.PriceDeterminator.get_forced_discount_info(),
        )
        return {"request_dump": base_req.request_info}


class MockClass:
    def __init__(self, tutor, language, online=False, req_instance=None):
        self.tutor = tutor
        self.language = language
        self.online = online
        self.instance = req_instance

    def get_ts(self):
        return (
            self.tutor.tutorskill_set.active()
            .with_ratings()
            .with_reviews()
            .filter(skill__name=self.language)
            .first()
        )

    def get_absolute_url(self):
        if self.online:
            return reverse(
                "dollar_online_payment", args=[self.tutor.slug, self.instance.slug]
            )
        return reverse(
            "users:with_skill_in_url",
            args=[self.tutor.slug, self.get_skill_id, self.instance.slug],
        )

    @property
    def get_skill_id(self):
        return self.get_ts().pk

    def ttp(self):
        if self.online:
            rates = ex_models.PriceDeterminator.get_rates().online_prices
            if self.tutor.online_requests >= 4:
                return rates * 2
            return rates
        return self.get_ts().price

    def no_of_hours_taught(self):
        return self.tutor.no_of_hours_taught()


def error_exception():
    from django.core.exceptions import ObjectDoesNotExist

    return ObjectDoesNotExist


class SingleRequestService(object):
    # Done
    def __init__(
        self,
        slug=None,
        tutor_slug=None,
        pk=None,
        instance: ex_models.BaseRequestTutor = None,
    ):
        if slug:
            self.instance: ex_models.BaseRequestTutor = (
                ex_models.BaseRequestTutor.objects.filter(slug=slug).first()
            )
            if not self.instance:
                raise Http404("BaseRequest not found")
        if pk:
            self.instance: ex_models.BaseRequestTutor = (
                ex_models.BaseRequestTutor.objects.get(pk=pk)
            )
        self.selected_tutor = None
        if instance:
            self.instance = instance
        if tutor_slug:
            self.fetch_tutor(tutor_slug)

    def get_user(self):
        return self.instance.user

    # Done
    def is_online(self):
        return self.instance.request_type == 3

    # Done
    @cached_property
    def get_ts_skills(self):
        return self.preload_tutors(self.instance.region, self.is_online())

    def get_next_url(self, **kwargs):
        if self.is_online():
            return self.mark_as_completed(self.instance)
        return (
            reverse("request_tutor_skill", args=[kwargs.get("slug")])
            + "?referral_code="
            + kwargs.get("referral_code")
        )

    # Done
    def get_first_subject(self):
        return self.instance.request_subjects[0]

    # Done
    def get_tutor_select_context_data(self, **kwargs):
        from skills.services import PaginatorObject

        page = kwargs.get("page")
        skills = self.get_ts_skills
        paginator, result = PaginatorObject().paginate(3, page, _list=skills)
        return {
            "object": self.instance,
            "teach_all_subject": True,
            "ts_skills": result,
            # 'currency': "₦" if self.instance.region else "$",
            "currency": "₦",
            "count": len(skills),
            "the_tutor_list": True,
        }

    # Done

    @classmethod
    def update_urgency(self, instance):
        instance.class_urgency = "immediately"
        instance.save()

    @classmethod
    def add_tutor_to_request_pool(cls, instance):
        from connect_tutor.models import RequestPool

        # populate db with data
        if instance.tutor:
            RequestPool.add_tutor_and_notify_about_job(instance)
        instance.status = ex_models.BaseRequestTutor.PENDING
        return instance

    @classmethod
    def mark_as_completed(self, instance):
        new_instance = self.add_tutor_to_request_pool(instance)
        new_instance.class_urgency = "immediately"
        new_instance.save()
        return reverse("online_request_completed", args=[instance.slug])

    def get_per_hour_price(self, ts):
        from users.models import User

        try:
            ts_price = ts.price
        except Exception:
            raise Http404("Request not found or has already been place.")
        if self.instance.request_type == 3:
            ts_price = 20
            new_inst = User.objects.filter(pk=ts.pk).with_online_requests().first()
            if new_inst.online_requests >= 4:
                ts_price = 50
        return ts_price

    def get_req_pool_tutor_info(self, req_pool):
        return {
            "full_name": req_pool.tutor.get_full_name(),
            "email": req_pool.tutor.email,
            "phone_no": req_pool.tutor.phonenumber_set.all()[0].number.raw_input,
            "address": req_pool.get_tutor_address.full_address,
        }

    def get_request_pool_list(self):
        result = [
            {
                **self.get_req_pool_tutor_info(req_pool),
                "pool_id": req_pool.id,
                "approved": req_pool.approved,
                "teaches_all": req_pool.teaches_all_subject(),
                "matched_subjects": [
                    {
                        "name": tutor_skill.skill.name,
                        "active": tutor_skill.status == tutor_skill.ACTIVE,
                        "url": tutor_skill.get_absolute_url(),
                    }
                    for tutor_skill in req_pool.tutor_found_subjects
                ],
                "additionalInfo": req_pool.other_info or {},
                "default_subject": req_pool.default_subject,
                "cost": req_pool.cost,
            }
            for req_pool in self.instance.request.all()
        ]
        for i in result:
            if not i.get("additionalInfo") and self.instance.is_parent_request:
                i["additionalInfo"] = {"budget": float(self.instance.budget)}

        return result

    def get_req_pool_for_base_req_selected_tutor(self, pool_instance=None):
        req_pool = pool_instance
        if not req_pool:
            req_pool = self.instance.request.filter(tutor=self.instance.tutor).first()
            if not req_pool:
                return False
        tutor = self.get_req_pool_tutor_info(req_pool)
        tutor["subjects"] = [
            x.skill.name for x in req_pool.tutor.tutorskill_set.active()
        ]
        return tutor

    def add_tutors_to_client_pool2(self, request):
        req_pool_admin = RequestPoolAdmin(RequestPool, admin.AdminSite)
        if not self.instance.request.approved_tutors():
            return False
        req_pool_admin.add_tutor_to_client_pool(
            request, self.instance.request.approved_tutors()
        )
        return True

    def update_base_req_details(self, new_budget):
        self.instance.budget = Decimal(new_budget)
        self.instance.save()
        return True

    @classmethod
    def update_additional_pool_details(cls, req_pool_id, data):
        req_pool = RequestPool.objects.filter(pk=req_pool_id)
        if req_pool.exists():
            data.pop("user_id")
            req_pool.update(other_info=data)
            return True

    @classmethod
    def update_request_pool_fields(cls, req_pool_id, data):
        req_pool = RequestPool.objects.filter(pk=req_pool_id)
        if req_pool.exists():
            data.pop("user_id")
            req_pool.update(**data)
            return True

    def create_req_pool_and_attach_tutor_to_baserequest(self, tutor_email):
        tutor = u.models.User.objects.filter(email=tutor_email).first()
        if tutor:
            self.instance.tutor = tutor
            self.instance.save()
            req_pool = RequestPool.add_tutor_and_notify_about_job(
                self.instance, notify=False, approved=True
            )

            return self.get_req_pool_for_base_req_selected_tutor()
        return False

    def create_booking_by_tutor(self, sessions, tutor_skill, remark=""):
        temp_arr = [build_session_for_new_flow(i, x) for i, x in enumerate(sessions)]
        bs_arr = dict([x for y in temp_arr for x in y])

        bs_arr["session-TOTAL_FORMS"] = len(sessions)
        bs_arr["session-INITIAL_FORMS"] = 0
        bs_arr["session-MIN_NUM_FORMS"] = ""
        bs_arr["session-MAX_NUM_FORMS"] = ""
        request_json = {"booking": bs_arr, "booking_type": 1}
        order, form = BookingService.create_booking(
            tutor_skill,
            self.instance.user,
            request_json,
            remark=remark,
            agent=self.instance.booking_agent,
        )
        if order:
            ex_models.BaseRequestTutor.objects.filter(pk=self.instance.pk).update(
                booking_id=order
            )
            return order
        return None

    def create_booking_from_admin(self, data):
        tutor_email = data.get("tutor_email")
        bs = data.get("booking_sessions")
        client_price = data.get("client_price")
        self.instance.budget = client_price
        self.instance.status = ex_models.BaseRequestTutor.PAYED
        self.instance.save()
        subject = data.get("tutor_subject")
        tutor_skill = TutorSkill.objects.filter(
            tutor__email=tutor_email, skill__name=subject
        ).first()
        if not tutor_skill:
            return False

        student_no = self.instance.no_of_students

        temp_arr = [helper_func(x, i, student_no) for i, x in enumerate(bs)]
        bs_arr = dict([x for y in temp_arr for x in y])

        bs_arr["session-TOTAL_FORMS"] = len(bs)
        bs_arr["session-INITIAL_FORMS"] = 0
        bs_arr["session-MIN_NUM_FORMS"] = ""
        bs_arr["session-MAX_NUM_FORMS"] = ""

        request_json = {"booking": bs_arr, "booking_type": 1}
        order, form = BookingService.create_booking(
            tutor_skill,
            self.instance.user,
            request_json,
            remark=data.get("remark"),
            agent=self.instance.booking_agent,
        )
        if order:
            ex_models.BaseRequestTutor.objects.filter(pk=self.instance.pk).update(
                booking_id=order
            )
        return True

    # Done
    def preload_tutors(self, area=None, online=False):
        """Fetches the list of tutors to be displayed to the client"""
        subject = self.instance.request_subjects[0]
        teach_online = self.instance.request_type == 3
        tutors = u.services.TutorService.get_tutors_teaching_skill(
            subject, self.instance.region, teach_online
        )
        return [
            MockClass(x, subject, online=online, req_instance=self.instance)
            for x in tutors
        ]

    # Done
    def tutors_exists(self):
        """Checks if we are going to be displaying tutors to the client"""
        if len(self.instance.request_subjects) == 1:
            has = self.check_skill_support(
                self.instance.request_subjects[0], self.instance.state
            )
            return has
        return False

    # Done
    def has_referral_instance(self):
        return r.models.Referral.objects.filter(
            owner__email=self.instance.email
        ).exists()

    def fetch_tutor(self, tutor_slug):
        self.selected_tutor = (
            self.instance.request.approved_tutors()
            .filter(tutor__slug=tutor_slug)
            .first()
        )

    def tutor_preview_context(self):
        from skills.services import PaginatorObject

        teach_all_subject = self.instance.approved_tutors_teach_all_subjects()
        ts_skills = self.instance.approved_tutors().all().order_by("-recommended")
        pagination, result = PaginatorObject().paginate(10, None, ts_skills)

        return {
            "ts_skills": result,
            "teach_all_subject": teach_all_subject,
            "count": len(ts_skills),
        }

    def has_been_paid(self):
        return self.instance.has_been_paid()

    @property
    def has_paid_fee(self):
        return self.instance.paid_fee

    @property
    def slug(self):
        return self.instance.slug

    def is_owner(self, user):
        u.tasks.create_paystack_customer.delay(self.instance.user_id)
        return user == self.instance.user

    # Done
    def create_booking(self, user=None, amount=None):
        if user:
            self.instance.tutor = user
        if self.selected_tutor:
            self.instance.tutor = self.selected_tutor.tutor
            self.instance.budget = amount or self.selected_tutor.ttp()
        self.instance.save()
        return self.instance.create_new_booking().order

    # Done
    def create_online_booking(self, tutor_id):
        from users.models import User

        new_inst = User.objects.filter(slug=tutor_id).with_online_requests().first()
        if new_inst:
            self.instance.tutor = new_inst
            the_price = ex_models.PriceDeterminator.get_rates().online_prices
            if new_inst.online_requests >= 4:
                the_price = the_price * 2
            price_as_naira = the_price
            self.instance.hours_per_day = 1
            self.instance.days_per_week = 1
            self.instance.available_days = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
            ]
            # self.instance.budget = price_as_naira
            self.instance.budget = price_as_naira * len(self.instance.available_days)
        # create_user_instance
        user, new = User.objects.get_or_create(email=self.instance.email)
        user.first_name = self.instance.first_name
        user.save()
        self.instance.user = user
        self.instance.save()
        self.mark_as_completed(self.instance)
        return self.instance.create_new_booking().order

    # Done
    def pay_processing_fee(self):
        self.instance.pay_processing_fee()

    def remove_percent_discount(self, deduction=0):
        if deduction > 0:
            self.instance.percent_discount = 0
            self.instance.save()

    def save(self):
        self.instance.save()

    def process_paystack_payment(self, request):
        slug = self.instance.slug
        amount = int(settings.PROCESSING_FEE * 100)
        data = dict(
            email=request.user.email,
            amount=amount,
            reference=slug,
            callback_url=build_full_urls(
                request, reverse("callback_paystack", args=[slug])
            ),
        )

        v = utils.PayStack().initialize_transaction(data)
        if len(v.items()) > 0:
            return v["authorization_url"]

    def paystack_payment_outcome(self, request):
        error = False
        try:
            auth_url = self.process_paystack_payment(request)
        except utils.HTTPError as e:
            logger.error(e)
            auth_url = reverse("client_request_completed", args=[self.instance.slug])
            error = True
        finally:
            return auth_url, error

    def paypal_payment_outcome(self, amount, custom=True):
        return True

    def update_payment_and_notify_admin(self, total):
        self.pay_processing_fee()

    def paga_payment_outcome(self, request):
        return paga_payment_outcome(request.POST, self.update_payment_and_notify_admin)

    @classmethod
    def generic_payment_outcome(cls, request, **kwargs):
        v = request.POST
        paypal = True
        transaction_message = "Transaction Payment Successful!"
        status_message = ("", "")
        if (
            v.get("payment_status") == "Completed"
            and v.get("business") == settings.PAYPAL_RECEIVER_EMAIL
        ):
            slug = v["invoice"]
        else:
            slug = kwargs["slug"]
            paypal = False
        client_request = cls(slug)
        if paypal:
            status = client_request.paypal_payment_outcome(v["payment_gross"])
        else:
            status, status_message = client_request.paga_payment_outcome(request)
            transaction_message = "Processing Fee Payment Successful!"
        if not status:
            transaction_message = "Processing Fee Payment Failed. {}".format(
                status_message[1]
            )
        return status, transaction_message

    def get_paystack_form_parameters(self, request):
        """acounts for percentage discount to be incorporated when client pays online"""
        original_amount = settings.PROCESSING_FEE * 100
        return construct_paystack_params(
            request.user.email, original_amount, self.instance.slug
        )

    def get_paypal_form(self, request):
        pk = self.instance.slug
        others = {
            "custom": "Processing Fee Payment",
            "item_name": "Processing Fee for request {}".format(pk),
        }
        urls = ["processing_fee_redirect", "processing_fee_cancelled"]
        return get_paypal_form(
            request.build_absolute_uri, pk, settings.PROCESSING_FEE, urls, others
        )

    def get_payment_form(self, request):
        return get_paga_form(
            request.build_absolute_uri,
            request.user.email,
            request.user.id,
            settings.PROCESSING_FEE,
            "Processing Fee for request {}".format(self.instance.slug),
            self.instance.slug,
            "processing_fee_redirect",
        )

    def get_payment_data(self, request):
        return {
            "paga_form": self.get_payment_form(request),
            "paypal_form": self.get_paypal_form(request),
            "paystack": self.get_paystack_form_parameters(request),
            "object": self.instance,
            "todays_request": ex_models.BaseRequestTutor.objects.request_completed_today(),
            "processing_fee": settings.PROCESSING_FEE,
        }

    # Todo: Done
    def save_second_form(self, request, default=True, **kwargs):
        """Action to save form"""
        referral_code = request.POST.get("referral_code")
        if referral_code:
            request.session["referral_code"] = referral_code

        extra = {}
        if kwargs.get("user_service"):
            extra = kwargs["user_service"].request_form_params()
            # extra.update({'fixed_price': kwargs['user_service'].get_price_for_subject(
            #     self.instance.request_subjects[0])})
        form = self.get_form_instance(kwargs.get("param", False))(
            request.POST, instance=self.instance, **extra
        )
        if form.is_valid():
            if not default:
                self.instance = form.save(default=default)
            else:
                self.instance = form.save()
            self.instance.created = timezone.now()
            if kwargs.get("user_service"):
                # import pdb; pdb.set_trace()
                user_instance = kwargs["user_service"]
                usss = user_instance.user
                if not form.cleaned_data["other_tutors"]:
                    self.instance.remarks = "Only wants {} {}({})".format(
                        usss.first_name, usss.last_name, usss.email
                    )
                tutor_price = int(
                    user_instance.get_price_for_subject(
                        self.instance.request_subjects[0]
                    )
                )
                self.instance.budget = self.instance.price_calculator2(tutor_price)
                self.instance.tutor = usss
                self.save()
                self.instance = self.add_tutor_to_request_pool(self.instance)

            self.instance.valid_request = False
            self.instance.save()
            return self.instance.slug, None
        print(form.errors)
        return None, form

    def create_user_instance_in_form(self, request=None, send=True):
        from users.services import CustomerService
        from users.models import User

        user = User.objects.filter(email=self.instance.email).first()
        password = ""
        if not user:
            user, password = CustomerService.create_user_instance(
                # user, password = u.services.CustomerService.create_user_instance(
                email=self.instance.email,
                first_name=self.instance.first_name,
                last_name=self.instance.last_name,
                background_check_consent=self.instance.is_parent_request,
                number=self.instance.number,
                address=self.instance.home_address,
                state=self.instance.state,
                longitude=self.instance.longitude,
                latitude=self.instance.latitude,
                vicinity=self.instance.vicinity,
                country=self.instance.country,
            )
        self.instance.user = user
        if send:
            self.instance.status = ex_models.BaseRequestTutor.COMPLETED
        self.instance.save()
        ex_models.BaseRequestTutor.objects.filter(pk=self.instance.pk).update(
            created=timezone.now()
        )
        if self.instance.status == ex_models.BaseRequestTutor.COMPLETED:
            ex_tasks.email_sent_after_completing_request.delay(self.instance.pk)
        if request:
            w = request.session.get("referral_code")
            if w:
                r.models.Referral.activate_referral(self.instance.user, w.upper())
                del request.session["referral_code"]
        return user, password

    def save_third_form(self, request, **kwargs):
        req_copy = copy_request(request)
        req_copy.POST["primary_phone_no1"] = get_phone_number(
            request.POST["primary_phone_no1"]
        )
        req_copy.POST["number"] = get_phone_number(request.POST["number"])
        data = req_copy.POST
        form = self.get_pricing_form(request)(data, instance=self.instance)
        if form.is_valid():
            self.instance = form.save()
            self.instance.agent = self.instance.get_agent
            if self.instance.state:
                if self.instance.state.lower() == "abuja":
                    uag = ex_models.Agent.get_abuja_agent()
                    if uag:
                        self.instance.agent = uag
            self.instance.save()
            user, password = self.create_user_instance_in_form(request)
            return None
        return form

    def get_redux_state(self, plan):
        from gateway_client import TuteriaDetail

        tuteria_details = TuteriaDetail()
        subject = ""
        if not self.instance.is_parent_request:
            subject = self.instance.request_subjects[0]
        pricing = self.get_pricing_for_request(plan)
        pricingParams = ex_models.PriceDeterminator.get_rates()
        # new_pricing = ex_models.PriceDeterminator.generate_pricing_info(self.instance)
        # pricing = [
        #     {
        #         "status": 1,
        #         "selected": False,
        #         "perHour": new_pricing["baseRate"],
        #         "heading": "Plan 1",
        #         "factor": new_pricing["standardFx"],
        #     },
        #     {
        #         "status": 2,
        #         "selected": False,
        #         "perHour": new_pricing["baseRate"],
        #         "heading": "Plan 2",
        #         "factor": new_pricing["premiumFx"],
        #     },
        #     {
        #         "status": 3,
        #         "selected": False,
        #         "perHour": new_pricing["baseRate"],
        #         "heading": "Plan 3",
        #         "factor": new_pricing["deluxeFx"],
        #     },
        # ]
        return {
            "priceOptions": pricing,
            "subject": subject,
            "pricingDeterminant": {
                "price_base_rate": float("%.2f" % (pricingParams.price_base_rate)),
                "one_hour_less_price_rate": float(
                    "%.2f" % (pricingParams.one_hour_less_price_rate)
                ),
                "hour_rate": float("%.2f" % (pricingParams.hour_rate)),
                "student_no_rate": float("%.2f" % (pricingParams.student_no_rate)) or 1,
                "hour_factor": pricingParams.hour_factor,
                "discount": float("%.2f" % pricingParams.student_no_rate),
                # "subjectsFx": new_pricing["subjectsFx"],
                # "vicinityFx": new_pricing["vicinityFx"],
                # "stateFx": new_pricing["stateFx"],
                # "curriculumFx": new_pricing["curriculumFx"],
                # "purposeFx": new_pricing["purposeFx"],
                # "hourFactors": new_pricing["hourFactor"],
            },
            "priceFactor": {
                "no_of_students": self.instance.no_of_students,
                "hours_per_day": float("%.2f" % self.instance.hours_per_day),
                "noOfDays": len(self.instance.available_days),
                "days": self.instance.available_days,
                "noOfWeeks": self.instance.days_per_week,
                "discount": float("%.2f" % pricingParams.student_no_rate),
            },
            "processingFee": float("%.0f" % tuteria_details.processing_fee),
            "referral": {
                "code": "",
                "amount": 0,
                "display": self.has_referral_instance(),
                "isFetching": False,
            },
        }

    def get_pricing_for_request(self, plan=None):
        # import pdb

        # pdb.set_trace()
        name = self.instance.request_subjects[0]
        if self.instance.region:
            name = self.instance.region
        pricing = Region.default_pricing(
            name=name,
            is_parent=self.instance.is_parent_request,
            state=self.instance.state,
        )
        if plan:
            for p in pricing:
                if p["heading"] == plan:
                    p["selected"] = True
        return pricing

    def third_request_form_context(self, request):
        referral_code = request.referral_code
        plan = request.POST.get("plan", "")
        pricing = self.get_pricing_for_request(plan)
        pricingParams = ex_models.PriceDeterminator.get_rates()
        operaMiniPlans = self.determine_prices_for_featured_devices(plan)
        r = ""
        if referral_code:
            if referral_code == "None":
                r = ""
            else:
                r = referral_code
        return {
            "object": self.instance,
            "p_params": pricingParams,
            "pricing_options": json.dumps(pricing),
            "basic": [o for o in pricing if o["status"] == Pricing.LOW][0],
            "medium": [o for o in pricing if o["status"] == Pricing.MEDIUM][0],
            "high": [o for o in pricing if o["status"] == Pricing.HIGH][0],
            "referral_code": r,
            "toggle_referral": self.has_referral_instance(),
            "operaMiniPlans": operaMiniPlans,
            "hour_factor": json.dumps(pricingParams.hour_factor),
            "redux_info": json.dumps(self.get_redux_state(plan)),
        }

    def get_pricing_form(self, request):
        if request.is_featured:
            return ex_forms.PriceMiniForm
        return ex_forms.PriceAdjustForm

    def determine_prices_for_featured_devices(self, plan):
        calulate_price = ex_models.PriceDeterminator.get_new_price
        inst = self.instance
        inst.days_per_week = inst.days_per_week or 4
        wks = inst.days_per_week if inst.days_per_week < 4 else 4
        params = (
            inst.no_of_students,
            inst.hours_per_day,
            len(inst.available_days),
            wks,
        )
        descriptions = {
            "Plan 1": "1-5 years experienced tutor with good credentials and proven track-record",
            "Plan 2": "2-6 years experienced tutor with strong credentials, relevant training and expert knowledge",
            "Plan 3": "Seasoned tutor of 3-15 years from a top-most institution with excellent track-record",
        }
        new_budgets = [
            {
                "heading": x["heading"],
                "description": descriptions[x["heading"]],
                "price": calulate_price(x["perHour"], *params),
            }
            for x in self.get_pricing_for_request(plan)
        ]
        return new_budgets

    # Todo: Done
    def get_form_instance(self, param=None):
        """Get the form instance, differentiate between parentrequest form and regular request"""
        if self.instance.request_type == 2:
            if self.instance.tutor:
                return ex_forms.TutorRequestForm2
            if self.instance.request_subjects:
                return ex_forms.SecondRequestForm
        if self.instance.is_parent_request:
            return ex_forms.ParentRequestForm
        if param:
            if self.instance.request_subjects:
                return ex_forms.TutorRequestForm2
        else:
            return ex_forms.SecondRequestForm

    # Todo: Done
    @classmethod
    def check_skill_support(self, skill_name, supported_state, online=False):
        """Checks if the skill searched for has the state supported"""
        from skills.services import SkillService

        skill = SkillService.cached_skill_only(skill_name)
        if skill:
            return skill.with_states.filter(
                state=supported_state, online=online
            ).exists()
        return False

    # Todo: Done
    def second_request_form_context(
        self, referral_code=None, condition=True, param=False, **kwargs
    ):
        selected_skill = kwargs.get("selected_skill", None)

        last_5_request = ex_models.BaseRequestTutor.objects.filter(
            state=self.instance.state,
            status=ex_models.BaseRequestTutor.COMPLETED,
            is_split=False,
        ).order_by("-created")[:5]
        regions = []
        if self.instance.is_parent_request:
            regions = Region.get_areas_as_dict(self.instance.state)
        else:
            if selected_skill:
                self.instance.request_subjects = [selected_skill]
                self.save()

            if len(self.instance.request_subjects) > 0:
                subject = self.instance.request_subjects[0]
                can_use_parent = subject in list(Skill.all_parent_subjects())
                if can_use_parent and not param:
                    regions = Region.get_areas_as_dict(self.instance.state)
        # check if the subject has been activated for the state
        if self.instance.request_subjects:
            if len(self.instance.request_subjects) == 1:
                has_state = SingleRequestService.check_skill_support(
                    self.instance.request_subjects[0], self.instance.state
                )
                if has_state:
                    regions = []
                    # regions = Region.get_areas_as_dict(self.instance.state)
        response = {
            "last_5_request": last_5_request,
            "object": self.instance,
            "levels": ex_subjects.levels_of_student,
            "regions": json.dumps(regions),
            "miniRegion": regions,
            "displayRegion": self.instance.is_parent_request and len(regions) > 0,
            "request_instance": self.instance,
            "rates": ex_models.PriceDeterminator.get_rates(),
        }
        if kwargs.get("user_service"):
            response["weekdays"] = kwargs["user_service"].week_day_with_times()
        if self.instance.request_type == 2:
            response["request_instance"] = self.instance
        if condition:
            if kwargs.get("user_service"):
                response["cost_of_booking"] = kwargs[
                    "user_service"
                ].get_price_for_subject(self.instance.request_subjects[0])
            initial = {
                "number": self.instance.number.as_national.replace(" ", "")
                if self.instance.number
                else "",
                "referral_code": referral_code,
            }
            a = {}
            if "user_service" in kwargs:
                initial.update(possible_subjects=self.instance.request_subjects)
                a = kwargs["user_service"].request_form_params()
            response["form"] = self.get_form_instance(param=param)(
                instance=self.instance, initial=initial, **a
            )
        return response

    def conclude_request(self, **kwargs):
        request_details = kwargs.get("request_details")
        extra_info = {
            "hours_per_day": request_details.get("hours"),
            "budget": request_details.get("budget"),
            "days_per_week": request_details.get("no_of_weeks"),
            "available_days": request_details.get("days"),
            "agent": ex_models.Agent.get_agent(),
            "time_of_lesson": request_details.get("time_of_lesson"),
        }
        # import pdb; pdb.set_trace()
        for info in extra_info:
            setattr(self.instance, info, extra_info[info])
        # self.instance.request_info["request_details"].update({**kwargs})
        self.instance.request_info = {**self.instance.request_info, **kwargs}

        self.instance.class_urgency = utils.get_how_soon_should_lesson_start(
            request_details.get("start_date"), request_details.get("end_date")
        )
        self.instance.save()
        self.create_user_instance_in_form(send=True)


def build_full_urls(request, url):
    return request.build_absolute_uri(url)


def get_paypal_form(func, pk, amount, urls, others):
    u = ex_models.get_dollar_rate()["USDNGN"]
    new_amount = amount / int(u)
    others.update(
        {
            "business": settings.PAYPAL_RECEIVER_EMAIL,
            "invoice": pk,
            "amount": round(new_amount, 2),
            "notify_url": func(reverse("paypal-ipn")),
            "image": "https://www.paypalobjects.com/en_US/i/btn/x-click-but6.gif",
            "return_url": func(reverse(urls[0], args=[pk])),
            "cancel_return": func(reverse(urls[1], args=[pk])),
        }
    )
    return PayPalPaymentsForm(initial=others)


def construct_paystack_params(email, amount, pk):
    return {
        "key": settings.PAYSTACK_PUBLIC_KEY,
        "email": email,
        "amount": amount,
        "ref": pk,
    }


def get_paga_form(func, email, user_id, amount, description, invoice, return_url):
    initial = {}
    production = os.getenv("DJANGO_CONFIGURATION", "")
    TEST = False if production == "Production" else True
    initial = {
        "email": email,
        "account_number": user_id,
        "subtotal": amount,
        "phoneNumber": "",
        "description": description,
        "surcharge": 0,
        "surcharge_description": "Booking Fee",
        "product_code": "",
        "quantity": "",
        "invoice": invoice,
        "test": TEST,
        "return_url": func(reverse(return_url, args=[invoice])),
    }
    return b.forms.PagaPaymentForm(initial=initial)


def paga_payment_outcome(data, func):
    status = data.get("status")
    valid = False
    status_message = get_status_message(status)
    logger.info(data)
    form = b.forms.PagaResponseForm(data)
    if form.is_valid():
        func(form.cleaned_data["total"])
        valid = True
    return valid, status_message


def get_status_message(status):
    if status == "SUCCESS":
        return "Transaction Successful", "Reason: Your payment completed successfully"
    if status == "ERROR_TIMEOUT":
        return "Transaction Failed", "Reason: The transaction timed out."
    if status == "ERROR_INSUFFICIENT_BALANCE":
        return (
            "Transaction Failed",
            "Reason: Insufficient Funds.  Please Fund account and Try again",
        )
    if status == "ERROR_INVALID _CUSTOMER_ACCOUNT":
        return (
            "Transaction Failed",
            "Reason: Transaction could not be authorised. Please contact Paga customer service or send a mail to service@mypaga.com",
        )
    if status == "ERROR_CANCELLED":
        return "Transaction Failed", "Reason: No transaction record"
    if status == "ERROR_BELOW_MINIMUM":
        return (
            "Transaction Failed",
            "Reason: Your transaction amount is below the required minimum transaction amount of N100",
        )
    if status == "ERROR_ABOVE_MAXIMUM":
        return (
            "Transaction Failed",
            "Reason: Your transaction amount is above the maximum transaction amount of N300000",
        )
    if status == "ERROR_AUTHENTICATION":
        return (
            "Transaction Failed",
            "Reason: Authentication Error. Please try again with valid credentials",
        )
    # ERROR_UNKNOWN
    return ("Transaction Failed", "Reason: Error processing transaction. ")


class DepositMoneyService(object):
    def __init__(self, order):
        try:
            self.instance = ex_models.DepositMoney.objects.get(order=order)
        except ex_models.DepositMoney.DoesNotExist:
            raise Http404

        self.payer = self.instance.user
        self.u_service = u.services.UserService(email=self.payer.email)
        self.rq_service = SingleRequestService(pk=self.instance.request_id)
        self.payer_wallet = w.services.WalletService(self.payer.id)

    def paystack_validation(self, v):
        self.instance.update_wallet_and_notify_admin(v)

    def process_paystack_payment(self, request):
        slug = self.instance.order
        amount = int(self.instance.amount_to_be_paid * 100)
        data = dict(
            email=request.user.email,
            amount=amount,
            reference=slug,
            callback_url=build_full_urls(
                request, reverse("callback_paystack", args=[slug])
            ),
        )

        v = utils.PayStack().initialize_transaction(data)
        if len(v.items()) > 0:
            ex_models.DepositMoney.objects.filter(pk=self.instance.pk).update(
                paystack_access_code=v["authorization_url"]
            )
        return v["authorization_url"]

    def reprocess_paystack_payment(self):
        self.instance.pk = self.instance.regenerate_order()
        self.instance.save()

    def paystack_payment_outcome(self, request):
        error = False
        if self.instance.paystack_access_code:
            return self.instance.paystack_access_code, error
        try:
            auth_url = self.process_paystack_payment(request)
        except utils.HTTPError as e:
            logger.error(e)
            self.reprocess_paystack_payment()
            auth_url = reverse("request_payment_page", args=[self.instance.order])
            error = True
        finally:
            return auth_url, error

    def paypal_payment_outcome(self, amount, custom=True):
        status = False
        full_payment = Decimal(
            round(Decimal(amount) * int(ex_models.get_dollar_rate()["USDNGN"]), -1)
        )
        if custom:
            if self.instance.status == ex_models.DepositMoney.ISSUED:
                self.instance.update_wallet_and_notify_admin(full_payment)
                status = True
        else:
            self.instance.process_large_booking(full_payment)
        return status

    def update_payment_and_notify_admin(self, total):
        self.instance.update_wallet_and_notify_admin(total)

    def paga_payment_outcome(self, request):
        return paga_payment_outcome(request.POST, self.update_payment_and_notify_admin)

    @classmethod
    def generic_payment_outcome(cls, request, **kwargs):
        v = request.POST
        paypal = True
        transaction_message = "Transaction Payment Successful!"
        status_message = ("", "")
        if (
            v.get("payment_status") == "Completed"
            and v.get("business") == settings.PAYPAL_RECEIVER_EMAIL
        ):
            slug = v["invoice"]
        else:
            slug = kwargs["order"]
            paypal = False
        client_request = cls(slug)
        if paypal:
            status = client_request.paypal_payment_outcome(v["payment_gross"])
        else:
            status, status_message = client_request.paga_payment_outcome(request)
        if not status:
            transaction_message = "Request Payment Failed. {}".format(status_message[1])
        return status, transaction_message

    @classmethod
    def create_deposit_for_user(self, user):
        d = ex_models.DepositMoney.create(user)
        return d.order

    @property
    def can_use_credit(self):
        return self.payer_wallet.can_use_credit(self.instance.amount_to_be_paid)

    def update_wallet_amount(self, amount, default="+"):
        actions = {
            "+": lambda x: self.instance.wallet_amount + x,
            "-": lambda x: self.instance.wallet_amount - x,
            "=": lambda x: x,
        }
        self.instance.wallet_amount = actions[default](amount)
        self.instance.save()

    @cached_property
    def get_amount(self):
        self.instance.save()
        amount_to_be_paid = self.instance.amount
        deduction = self.u_service.use_referral_credit(amount_to_be_paid)
        self.rq_service.remove_percent_discount(deduction)
        self.update_wallet_amount(deduction, "=")
        wallet_amount = self.payer_wallet.update_amount_available(
            self.instance.amount_to_be_paid
        )
        self.update_wallet_amount(wallet_amount)
        return self.instance.amount_to_be_paid

    def get_payment_return_url(self, request):
        return build_full_urls(
            request, reverse("request_complete_redirect", args=[self.instance.order])
        )

    def get_paypal_form(self, request):
        pk = self.instance.order
        others = {"item_name": "Payment for lesson", "custom": "Request Payment"}
        urls = ["request_complete_redirect", "request_cancelled_redirect"]
        return get_paypal_form(
            request.build_absolute_uri, pk, self.get_amount, urls, others
        )

    def has_been_paid(self):
        return self.instance.status == ex_models.DepositMoney.PAYED

    def notify_admin_of_payments_made(self, condition=None, **kwargs):
        if not condition:
            if self.can_use_credit:
                self.instance.update_wallet_and_notify_admin2(
                    self.instance.amount_to_be_paid
                )
                return True
            return False
        amount_paid = kwargs.get("amount_paid")
        self.instance.update_wallet_and_notify_admin2(amount_paid)
        self.payer_wallet.update_paystack_auth_code(kwargs.get("authorization_code"))

    def get_paystack_form_parameters(self, request):
        """acounts for percentage discount to be incorporated when client pays online"""
        self.instance.request.update_percent_discount()
        original_amount = self.get_amount - self.instance.discounted(self.get_amount)
        return construct_paystack_params(
            request.user.email, original_amount, self.instance.order
        )

    def get_payment_form(self, request):
        return get_paga_form(
            request.build_absolute_uri,
            request.user.email,
            request.user.id,
            self.get_amount,
            "Payment for lesson",
            self.instance.order,
            "request_complete_redirect",
        )

    def construct_text(self, days_per_wek):
        dd = days_per_wek or 4
        text = "Week" if dd < 4 else "Month"
        value = dd if dd < 4 else 1
        return value, text

    def get_payment_data(self, request):
        dd = self.instance.request.days_per_week
        value, text = self.construct_text(dd)
        first_price = self.instance.amount_to_be_paid
        if not self.instance.request.paid_fee:
            first_price = first_price - settings.PROCESSING_FEE
        second_price = first_price * 2
        third_price = first_price * 3
        s1 = second_price * Decimal((1 - 0.05))
        second_diff = second_price - s1
        s2 = third_price * Decimal((1 - 0.05))
        third_diff = third_price - s2
        lessons = (
            len(self.instance.request.available_days)
            * self.instance.request.days_per_week
        )

        prices = [
            ex_models.PricingDisplay(
                self.instance.request,
                sub_text="{} {}".format(value, text),
                pre_text="{} {}{} Lessons".format(
                    value, text, "" if value == 1 else "s"
                ),
                b_text=f"{lessons}  Lesson",
                atext="{}",
                amount=first_price,
                discount=0,
                tag="",
                adescription="Select this plan to pay for {}",
                color="",
                diff="",
            ).output(),
            ex_models.PricingDisplay(
                self.instance.request,
                sub_text="{} {}s".format(value * 2, text),
                pre_text="{} {}s".format(value * 2, text),
                b_text=f"{lessons*2} lessons",
                atext="Book for {}",
                discount=0.05,
                amount=second_price,
                tag="Most Popular",
                adescription="Get 5% discount when you pay for {} ahead",
                color="info",
                diff=second_diff,
            ).output(),
            ex_models.PricingDisplay(
                self.instance.request,
                sub_text="{} {}".format(value * 3, text),
                b_text=f"{lessons*3} Lessons",
                pre_text="{} {}s".format(value * 3, text),
                atext="Book for {}",
                amount=third_price,
                discount=0.1,
                tag="Best Price",
                adescription="Most lessons go more than {}. Save 10% now!",
                color="warning",
                diff=third_diff,
            ).output(),
        ]
        return {
            "paga_form": self.get_payment_form(request),
            "paypal_form": self.get_paypal_form(request),
            "can_use_credit": self.can_use_credit,
            "amount_to_be_paid": self.instance.amount_to_be_paid,
            "paystack": self.get_paystack_form_parameters(request),
            "object": self.instance,
            "req_instance": self.instance.request,
            "processing_fee": settings.PROCESSING_FEE,
            "prices": prices,
            "currency": "₦",
        }


class ExternalService(object):
    # Done
    def __init__(self, email=None, create=False, **kwargs):
        if create and email:
            self.user_service = u.services.UserService(email)
            self.instance = self.create_new_request(self.user_service)

    # Done

    def get_initial_data(self):
        """Data to initialize request_form"""
        fields = ["age", "class_of_child"]
        result = {}
        if self.instance:
            result = {x: str(getattr(self.instance, x)) for x in fields}
            result.update(
                {"number": self.user_service.actual_number.replace("+234", "0")}
            )
        return result

    # Done

    @classmethod
    def create_new_request(cls, user_service):
        instance = ex_models.BaseRequestTutor.create_instance(user_service.user)
        return instance

    # Done

    @classmethod
    def populate_form(cls, request, ts=None, passed_form=None, **kwargs):
        """Initial Form to be filled on subject profile page"""
        context = {}
        form_params = cls.form_params(request, ts=ts, **kwargs)
        if ts:
            the_form = ex_forms.TutorRequestForm1(**form_params)
        else:
            the_form = passed_form(**form_params)
        context["form"] = the_form
        if form_params.get("instance"):
            context["instance_pk"] = form_params["instance"].pk
        return context

    # Done

    @classmethod
    def form_params(cls, request, ts=None, **kwargs):
        """Takes the request, an instance of the userservice
        and other passed parameters to populate the form"""
        from skills.models import Category

        initial = {}
        new_instance = None
        if ts:
            initial["opts_choices"] = ts.form_params()
        if kwargs.get("region"):
            initial.update(initial=dict(state=kwargs["region"]))
        if request.user.is_authenticated:
            new_instance = cls(email=request.user.email, create=True)
            init_data = new_instance.get_initial_data()
            init_data.update(**kwargs)
            if kwargs.get("referral_code"):
                init_data.update(referral_code=kwargs["referral_code"])
            initial["instance"] = new_instance.instance
            initial["initial"] = init_data
        if kwargs.get("online"):
            nigerian_category, _ = Category.objects.get_or_create(
                name=kwargs["the_category"]
            )
            initial["category"] = nigerian_category
        return initial

    # Done

    @staticmethod
    def create_user_from_email(instance):
        """Create user's instance after completing first forms
        for online clients'"""
        user, new = u.models.User.objects.get_or_create(email=instance.email)
        user.country = instance.country
        user.first_name = instance.first_name
        user.save()
        instance.user = user
        instance.save()

    # Done
    @classmethod
    def extra_form_actions(
        cls,
        form,
        tutor=None,
        online=None,
        commit=True,
        area=None,
        prime=False,
        **kwargs,
    ):
        ex_models.BaseRequestTutor.objects.filter(
            email=form.cleaned_data["email"], status=ex_models.BaseRequestTutor.ISSUED
        ).delete()
        instance = form.save(commit=False)
        if tutor:
            instance.request_type = 2
            instance.tutor = tutor
        if kwargs.get("is_parent"):
            instance.is_parent_request = kwargs["is_parent"]
        if kwargs.get("request_subjects"):
            instance.request_subjects = kwargs["request_subjects"]
        if online:
            instance.request_type = 3
        if prime:
            instance.is_parent_request = True
            instance.request_type = 4
        instance.agent = ex_models.Agent.get_agent()
        if instance.state:
            if instance.state.lower() == "abuja":
                aug = ex_models.Agent.get_abuja_agent()
                if aug:
                    instance.agent = aug
        instance.save()

        if online or prime:
            cls.create_user_from_email(instance)
            # check if there are tutors
        if online:
            inst = SingleRequestService(instance.slug)
            if inst.check_skill_support(inst.instance.request_subjects[0], None, True):
                return reverse("request_tutor_skill_online", args=[instance.slug])
            return inst.mark_as_completed(instance)
        if tutor:
            return reverse(
                "users:request_second_step", args=[tutor.slug, instance.slug]
            )
        if area:
            instance.region = u.models.Constituency.objects.get_region(area)
            instance.save()
            # check if tutors exist and if they do, redirect to the page to
            # view them else just continue
            return reverse("tutor_selection", args=[instance.slug])
        if prime:
            if instance.status == ex_models.BaseRequestTutor.COMPLETED:
                ex_tasks.email_sent_after_completing_request.delay(instance.pk)

            return instance
            # log in user and redirect
        return reverse("request_tutor_skill", args=[instance.slug])

    # Done
    @classmethod
    def get_opts_choices(cls, request, ts=None, **kwargs):
        from skills.models import Category

        if ts:
            return {
                "opts_choices": cls.form_params(request, ts, **kwargs).get(
                    "opts_choices"
                )
            }
        if kwargs.get("online"):
            nigerian_category, _ = Category.objects.get_or_create(
                name=kwargs["the_category"]
            )
            return {"category": nigerian_category}
        return {}

    # Done
    @classmethod
    def save_first_form(cls, request, ts=None, passed_form=None, **kwargs):
        req_copy = copy_request(request)
        area = request.POST.get("area")
        if not kwargs.get("online"):
            req_copy.POST["number"] = get_phone_number(request.POST.get("number"))
        initials = cls.get_opts_choices(request, ts, **kwargs)
        if request.user.is_authenticated:
            z = request.POST.get("pk")
            if z:
                initials["instance"] = ex_models.BaseRequestTutor.objects.filter(
                    pk=int(z)
                ).first()
        if ts:
            form = ex_forms.TutorRequestForm1(req_copy.POST, **initials)
        if passed_form:
            form = passed_form(req_copy.POST, **initials)
        # import pdb
        # pdb.set_trace()
        if form.is_valid():
            user = None
            if ts:
                user = ts.user
            return cls.extra_form_actions(form, tutor=user, area=area, **kwargs), None
        return None, form

    # Done
    @classmethod
    def admin_actions_on_profile_page(cls, ts, request_pk=None, action=3, **kwargs):
        options = {
            1: lambda: signals.add_tutor_to_client_request_pool.send(
                sender=cls.__class__, request_id=request_pk, tutorskill=ts, **kwargs
            ),
            2: lambda: ex_models.BaseRequestTutor.objects.filter(pk=request_pk).update(
                tutor=ts.tutor, status=ex_models.BaseRequestTutor.MEETING
            ),
            3: lambda: ex_models.BaseRequestTutor.send_profile_to_client(
                request_pk, ts
            ),
        }
        options[action]()
