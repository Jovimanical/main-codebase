# -*- coding: utf-8 -*-
import ast
import datetime
import functools
import itertools
import operator
import re
import urllib
from django.db.models.functions import Extract
import time
import math
from decimal import Decimal
from django.db import connection
from django.utils.functional import cached_property
from geopy import GoogleV3
import requests
from config.utils import generate_code, MAX_SLOT_NUMBER, Postpone
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.postgres.fields import ArrayField, IntegerRangeField, JSONField
from django.contrib.postgres.fields.jsonb import KeyTextTransform
from django.contrib.sites.models import Site
from django.core.cache import cache
from django.core.exceptions import MultipleObjectsReturned
from django.urls import reverse
from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django_countries.fields import CountryField
from dateutil.relativedelta import relativedelta
from dateutil import parser
from django.db.models.expressions import F, RawSQL

# Create your models here.
from registration.interview import TutorInterview
from users.models import UserProfile, states, Location
from model_utils.models import TimeStampedModel
from phonenumber_field.modelfields import PhoneNumberField
from hubspot.models import HubspotOwner
from django.template.loader import render_to_string

from django.contrib.sites.models import Site
from django.dispatch import receiver

from hubspot.signals import hubspot_action_after_message_webhook
from hubspot import HubspotAPI
from django.utils.timezone import now as ts_now
from . import slots
from config.functions import TO_Timestamp, Age, DatePart


def get_purpose(x):
    return (
        x.get("goal")
        if isinstance(x.get("goal"), str)
        else (x.get("goal") or {}).get("value")
    )


def get_special_needs(x):
    return (
        (x.get("goal") or {}).get("value2")
        if isinstance(x.get("goal"), dict)
        else "None"
    )


def build_split_detail(base_request):
    request_info = base_request.request_info
    request_details = request_info.get("request_details")
    return {
        "searchSubject": "",
        "lessonDays": request_details.get("days"),
        "teacherOption": "",
        "lessonHours": request_details.get("hours"),
        "subjectGroup": base_request.request_subjects,
        "class": [x["class"] for x in request_details.get("classes", [])],
        "curriculum": request_details.get("curriculum"),
        "learningNeed": [],
        "names": [x["class"] for x in request_details.get("classes", [])],
        "purposes": [get_purpose(x) for x in request_details.get("classes", [])],
        "forTeacher": [
            {
                "name": y["class"],
                "gender": "",
                "classDetail": {
                    "class": y.get("class"),
                    "purpose": get_purpose(y),
                    "subjects": y.get("subjects"),
                },
                "learningNeed": "",
                "curriculum": request_details.get("curriculum"),
                "expectation": y.get("expectation"),
                "special_needs": get_special_needs(y),
            }
            for y in request_details.get("classes", [])
        ],
    }


def parse_old_request(request_info, approved_tutors, instance=None):
    from connect_tutor.forms import RequestWithRelations

    slug = request_info.get("slug")
    location = request_info.get("location")
    personal_info = request_info.get("personal_info")
    request_details = request_info.get("request_details")
    no_of_splits = [x.default_subject for x in approved_tutors]
    tuteria_subjects = RequestWithRelations.get_tuteria_subjects()

    def clean_subjects(jj):
        return RequestWithRelations.rewrite_tuteria_subjects(jj, tuteria_subjects)

    result = {
        "contactDetails": {
            "email": personal_info.get("email", ""),
            "phone": personal_info.get("phone_number", ""),
            "state": location.get("state", ""),
            "title": "",
            "medium": personal_info.get("how_you_heard", ""),
            "region": location.get("vicinity", ""),
            "address": location.get("address", ""),
            "country": "Nigeria",
            "lastName": personal_info.get("last_name"),
            "firstName": personal_info.get("first_name"),
            "vicinity": location.get("area"),
            "country_code": "NG",
            "customerType": "parent",
            "preferredComms": {},
        },
        "slug": slug,
        "teacherKind": "One teacher"
        if len(no_of_splits) == 1
        else "Specialized Teachers",
        "childDetails": [
            {
                "name": x.get("class"),
                "gender": "",
                "firstName": x.get("firstName") or x.get("class"),
                "curriculum": request_details.get("curriculum"),
                "classDetail": {
                    "class": x.get("class"),
                    "purpose": get_purpose(x),
                    "subjects": clean_subjects(x.get("subjects")),
                    "original": x.get("subjects"),
                },
                "displayName": "",
                "expectation": x.get("expectation"),
                "learningNeed": "",
                "special_needs": get_special_needs(x),
            }
            for x in request_details.get("classes")
        ],
        "lessonDetails": {
            "lessonType": "physical"
            if request_details.get("online_lessons") == "Physical lessons"
            else "online",
            "lessonSchedule": {
                "lessonDays": request_details.get("days"),
                "lessonPlan": "",
                "lessonTime": request_details.get("time_of_lesson"),
                "lessonHours": request_details.get("hours"),
                "teacherKind": "",
                "lessonUrgency": "Immediately",
                "lessonDuration": request_details.get("no_of_weeks"),
            },
        },
    }
    tutor_id = None
    if instance.tutor:
        tutor_id = instance.tutor.slug
    result["splitRequests"] = [
        {
            "tutorId": tutor_id,
            "searchSubject": x,
            "lessonDays": request_details.get("days"),
            "teacherOption": result["teacherKind"],
            "lessonHours": request_details.get("hours"),
            "subjectGroup": [x],
            "class": [x["class"] for x in request_details.get("classes", [])],
            "curriculum": request_details.get("curriculum"),
            "learningNeed": [],
            "names": [x["class"] for x in request_details.get("classes", [])],
            "purposes": [get_purpose(x) for x in request_details.get("classes", [])],
            "forTeacher": [
                {
                    "name": y["class"],
                    "gender": "",
                    "classDetail": {
                        "class": y.get("class"),
                        "purpose": get_purpose(y),
                        "subjects": clean_subjects(y.get("subjects")),
                        "original": y.get("subjects"),
                    },
                    "learningNeed": "",
                    "curriculum": request_details.get("curriculum"),
                    "expectation": y.get("expectation"),
                    "special_needs": get_special_needs(y),
                }
                for y in request_details.get("classes", [])
            ],
        }
        for x in no_of_splits
    ]
    return result


class PriceDeterminator(models.Model):
    use_default = models.BooleanField(default=True)
    price_base_rate = models.DecimalField(max_digits=16, decimal_places=8, default=0.08)
    one_hour_less_price_rate = models.DecimalField(
        max_digits=16, decimal_places=8, default=1.25
    )
    hour_rate = models.DecimalField(
        verbose_name="Hour Rate/Nursery Price rate",
        max_digits=16,
        decimal_places=8,
        default=0.2,
    )
    student_no_rate = models.DecimalField(
        verbose_name="Discount", max_digits=16, decimal_places=8, default=0.25
    )
    online_prices = models.IntegerField(default=4000)
    use_hubspot = models.BooleanField(default=False)
    name = models.CharField(max_length=10, blank=True)
    states = JSONField(null=True)
    plans = JSONField(null=True)
    discount = models.IntegerField(default=25)
    hour_factor = JSONField(null=True)
    force_discounts = JSONField(null=True, blank=True)

    @classmethod
    def get_forced_discount_info(cls):
        first = cls.objects.first()
        if first:
            return first.force_discounts

    def get_state_factor(self, state, others=False):
        """Get decimal factor that affects pricing for state

        Arguments:
            state {string} -- The state
        """
        states_plan = self.states or {}
        try:
            result = states_plan[state]
        except KeyError:
            result = 100
            if states_plan.get("Others"):
                result = states_plan.get("Others")
        return Decimal(result / 100)

    def get_plan_percent(self, plan):
        """Get decimal factor that affects the pricing for the plan selected

        Arguments:
            plan {string} -- The plan selected i.e Plan 1,2 or 3
        """
        plans = self.plans or {}
        try:
            result = plans[plan]
        except KeyError:
            result = 100
        return Decimal(result / 100)

    def update_pricing_record(self, params):
        """Method to update the fields passed from the params

        Arguments:
            params {dict} -- Consist of the following fields
            state, state_percentage, no_of_hours, hour_percentage,
            plan, plan_percentage
        """

        def helper(field, key, value):
            rr = field or {}
            rr.update(**{key: int(value)})
            return rr

        if params.get("state") and params.get("state_percentage"):
            self.states = helper(
                self.states, params["state"], params["state_percentage"]
            )
        if params.get("no_of_hours") and params.get("hour_percentage"):
            self.hour_factor = helper(
                self.hour_factor,
                str(Decimal(params["no_of_hours"])),
                params["hour_percentage"],
            )
        if params.get("plan") and params.get("plan_percentage"):
            self.plans = helper(self.plans, params["plan"], params["plan_percentage"])
        self.save()

    @staticmethod
    def get_rates():
        x, _ = PriceDeterminator.objects.get_or_create(use_default=True)
        return x

    @classmethod
    def get_prime_rates(cls, name):
        x, _ = cls.objects.get_or_create(name=name)
        return x

    @classmethod
    def create_prime_rates(cls):
        x = cls.get_prime_rates("Set A")
        if x.use_default:
            x.use_default = False
            x.price_base_rate = 1250
            x.student_no_rate = Decimal(0.5)
            x.hour_rate = Decimal(0.833_334)
            x.one_hour_less_price_rate = Decimal(0.88888)
            x.save()
        y = cls.get_prime_rates("Set B")
        if y.use_default:
            y.use_default = False
            y.price_base_rate = Decimal(1041.67)
            y.student_no_rate = Decimal(0.5)
            y.hour_rate = Decimal(0.80003)
            y.one_hour_less_price_rate = Decimal(0.85333)
            y.save()
        return x, y

    @classmethod
    def get_new_pricing_info(cls):
        response = requests.get(f"{settings.CDN_SERVICE}/api/pricing-info")
        result = response.json()
        return result["data"]

    @classmethod
    def generate_pricing_info(cls, request_info):
        info = cls.get_new_pricing_info()
        subject = request_info.request_subjects[0]

        def get_factor(
            o, root="planFactor", key="plan_type", value="factor", default=1
        ):
            uu = [x[value] for x in info[root] if x[key].lower() == o]
            if uu:
                return uu[0]
            return default

        vicinityFx = [
            x["vicinity_factor"]
            for x in info["vicinityFactor"]
            if x["state"].lower() == request_info.state.lower()
            and x["vicinity"].lower() == request_info.vicinity.lower()
        ]
        if vicinityFx:
            vicinityFx = vicinityFx[0]
        else:
            vicinityFx = 1
        baseRate = get_factor(
            subject.lower(),
            root="subjectFactor",
            key="subject",
            value="rate",
            default=1000,
        )
        return {
            "standardFx": get_factor("standard"),
            "premiumFx": get_factor("premium"),
            "deluxeFx": get_factor("deluxe"),
            "stateFx": get_factor(request_info.state, root="stateFactor", key="state"),
            "vicinityFx": vicinityFx,
            "extraStudentFx": get_factor("extrastudents", default=100) / 100,
            "baseRate": baseRate,
            "purposeFx": 1,
            "curriculumFx": 1,
            "subjectsFx": 1,
            "hourFactor": info["hourFactor"],
        }

    @property
    def nursery_price(self):
        return self.price_base_rate * self.hour_rate

    @property
    def nursery_student_price(self):
        return self.jss_student_price * self.one_hour_less_price_rate

    @property
    def jss_student_price(self):
        return self.price_base_rate * self.student_no_rate

    @property
    def jss_price(self):
        return self.price_base_rate

    @classmethod
    def get_new_price(cls, price, student, hrs, days, wks=None):
        weeks = wks if wks else 1
        rate = 1
        students = cls.calculate_rate(student)
        hours = cls.calculate_hrs(hrs)
        extra = price
        if not hrs:
            hrs = 0
        if hrs < 2:
            extra = extra * hrs
        total_price = (
            extra * Decimal(students) * Decimal(hours) * days * Decimal(rate) * weeks
        )
        return round(total_price, -2)

    @classmethod
    def calculate(cls, hrs):
        """Takes hours as a params and returns the a new hour based on the rates"""
        r = cls.get_rates()
        if hrs:
            if hrs == 1:
                return r.price_base_rate + r.one_hour_less_price_rate
            if hrs == 2:
                return 1
            return 1 - r.price_base_rate
        return r.price_base_rate + r.one_hour_less_price_rate

    @classmethod
    def calculate_rate(cls, no):
        r = cls.get_rates()
        if no:
            return no if no == 1.0 else 1 + ((no - 1) * r.student_no_rate)
        return 1

    @classmethod
    def calculate_hrs(cls, hrs):
        r = cls.get_rates()
        if hrs:
            if hrs == Decimal(1):
                return 1 + r.hour_rate
            if hrs == Decimal(1.5):
                return 1 + (r.hour_rate / 2)
            if hrs >= 3:
                return hrs - r.hour_rate
            return hrs
        return 1

    def determine_client_quote(self, **param):
        number_of_weeks = param["days_per_week"]
        number_of_tutors = param.get("number_of_tutors", 1)
        number_of_hour = param["hours_per_day"]
        number_of_students = param["no_of_students"]
        number_of_days = param["available_days"]
        plan = param.get("plan")
        state = param.get("state")

        discount = Decimal(self.student_no_rate)

        real_hour = self.real_hour_func(number_of_students, number_of_hour)
        real_price = self.get_real_price(plan, state)
        default_pc = real_price * real_hour * number_of_days * number_of_weeks
        price = (number_of_tutors * default_pc) + (
            default_pc
            * ((Decimal(number_of_tutors / number_of_students) - 1) * discount)
        )

        return {"price": price}

    def get_real_price(self, plan_type, state, region=100):
        """Determine the real price

        Arguments:
            plan_type {string} -- The plan selected by the client
            state {string} -- The state the client belongs to

        Keyword Arguments:
            region {int} -- The region factor (default: {100})

        Returns:
            [Decimal] -- The new price
        """
        base_rate = self.price_base_rate
        plan = self.get_plan_percent(plan_type)
        tutor_state = self.get_state_factor(state)
        result = (
            Decimal(base_rate)
            * Decimal(plan)
            * Decimal(tutor_state)
            * Decimal(region / 100)
        )
        return round(result, 2)

    def real_hour_func(self, number_of_students, number_of_hour):
        if number_of_hour == 1:
            h_prime = self.hour_factor.get("1")
        elif number_of_hour == 1.5:
            h_prime = self.hour_factor.get("1.5")
        else:
            h_prime = 100
        hour_prime = h_prime / 100
        real_hour_calc = number_of_students * number_of_hour * hour_prime
        return Decimal(real_hour_calc)


class SocialCount(models.Model):
    FACEBOOK = "facebook"
    GOOGLE = "google"
    TWITTER = "twitter"
    OPTIONS = ((FACEBOOK, FACEBOOK), (GOOGLE, GOOGLE), (TWITTER, TWITTER))

    network_type = models.CharField(max_length=10, choices=OPTIONS, db_index=True)
    count = models.IntegerField(default=0)


ages = []


class BaseRequestTutorQueryset(models.QuerySet):
    def hours_ago(self, field):
        return (
            self.annotate(interval=Age(field))
            .annotate(seconds_filter=DatePart("interval"))
            .annotate(hours_filter=models.F("seconds_filter") / 3600)
        )

    def days_ago(self, days: int):
        hours = days * 24
        return self.hours_ago("created").filter(hours_filter__lte=hours)

    def add_date_submitted(self):
        return (
            self.annotate(
                clientRequestInfo=KeyTextTransform("client_request", "request_info")
            )
            .annotate(
                convertedDate=KeyTextTransform("dateSubmitted", "clientRequestInfo")
            )
            .annotate(dateSubmitted=TO_Timestamp("convertedDate"))
            .annotate(interval=Age("dateSubmitted"))
            .annotate(seconds_filter=DatePart("interval"))
            .annotate(hours_filter=models.F("seconds_filter") / 3600)
        )

    def by_drip(self, no, **kwargs):
        options = {
            "drip_1": [2, 0],
            "drip_2": [12, 1],
            "drip_3": [24, 2],
            "drip_4": [168, 3],
            "drip_5": [336, 4],
        }
        hours = options[no]
        return self.filter(
            **{
                f"hours_filter__gte": hours[0],
                f"hours_filter__lte": hours[0] + 1,
                "drip_counter": hours[1],
            }
        )

    def fall_in_new_drip(self):
        working_queryset = self.filter(
            status=BaseRequestTutor.ISSUED,
            request_info__client_request__dateSubmitted__isnull=False,
        ).add_date_submitted()
        tutors = [working_queryset.by_drip(f"drip_{x}") for x in [1, 2, 3, 4, 5]]
        return tutors

    def hours_elapsed(self, hour, field="created"):
        current_time = timezone.now()
        elapsed_time = current_time - relativedelta(hours=hour)
        return self.filter(**{f"{field}__gt": elapsed_time})

    def has_previous_booking(self, bookings):
        return self.annotate(
            has_previous=models.Case(
                models.When(user_id__in=bookings, then=models.Value(1)),
                default=models.Value(0),
                output_field=models.IntegerField(),
            )
        )

    def response_annotation(self, date: datetime.datetime):
        denied_responses = f'SELECT COUNT(DISTINCT U0."req_id") as "requestsDeclined" FROM "connect_tutor_tutorjobresponse" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id" AND U0."status"=3) WHERE (U0."created" > %s)'
        accepted_responses = f'SELECT COUNT(DISTINCT U0."req_id") as "totalJobsAccepted" FROM "connect_tutor_tutorjobresponse" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id" AND U0."status"=2) WHERE (U0."created" > %s)'
        not_responsed = f'SELECT COUNT(DISTINCT U0."req_id") as "requestsNotResponded" FROM "connect_tutor_tutorjobresponse" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id") WHERE (U0."created" > %s) AND (U0."status" = 4)'
        total_responses = f'SELECT COUNT(DISTINCT U0."req_id") as "totalJobsAssigned" FROM "connect_tutor_tutorjobresponse" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id") WHERE (U0."created" > %s)'
        # total_responses = f'SELECT COUNT(DISTINCT U0."id") as "totalJobsAssigned" FROM "external_baserequesttutor" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id") WHERE (U0."created" > %s)'
        return (
            self.annotate(
                requestsDeclined=RawSQL(denied_responses, (date.isoformat(),))
            )
            .annotate(totalJobsAccepted=RawSQL(accepted_responses, (date.isoformat(),)))
            .annotate(requestsNotResponded=RawSQL(not_responsed, (date.isoformat(),)))
            .annotate(totalJobsAssigned=RawSQL(total_responses, (date.isoformat(),)))
        )

    def alternate_response_annotation(self, date: datetime.datetime):
        from connect_tutor.models import TutorJobResponse

        return (
            self.annotate(
                requestsDeclined=models.Count(
                    "req_instance",
                    filter=TutorJobResponse.objects.filter(
                        status=TutorJobResponse.REJECTED
                    ),
                    distinct=True,
                )
            )
            .annotate(
                totalJobsAccepted=models.Count(
                    "req_instance",
                    filter=TutorJobResponse.objects.filter(
                        status=TutorJobResponse.ACCEPTED
                    ),
                    distinct=True,
                )
            )
            .annotate(
                requestsNotResponded=models.Count(
                    "req_instance",
                    filter=TutorJobResponse.objects.filter(
                        status=TutorJobResponse.NO_RESPONSE
                    ),
                    distinct=True,
                )
            )
            .annotate(totalJobsAssigned=models.Count("req_instance"))
        )

    def date_booked(self, dict_param):
        from bookings.models import Booking

        ids = (
            Booking.objects.filter(
                created__year=dict_param["modified__year"],
                created__month=dict_param["modified__month"],
            )
            .values("user__email")
            .annotate(cc=models.Count("user__email"))
            .filter(cc=1)
            .values_list("user__email", flat=True)
        )
        return self.filter(email__in=list(ids))

    def search_for_skill(self, search_term):
        from skills.models import Skill

        split_search_term = search_term.split(",")
        if "skill" in split_search_term:
            s_s = Skill.objects.filter(
                name__icontains=split_search_term[0]
            ).values_list("name", flat=True)
            return self | self.filter(request_subjects__overlap=list(s_s))
        return self

    def paid_filter(self):
        """Track when payment was made for a request"""
        a = models.Q(booking__made_payment=True)
        b = models.Q(status=BaseRequestTutor.PAYED)
        return self.filter(a | b)

    def update_field(self, field, status):
        BaseRequestTutor.objects.filter(
            id__in=self.values_list("pk", flat=True)
        ).update(**{field: status})

    def async_action(self, action, thread_count=10):
        def callback(u):
            action(u)
            connection.close()

        queue = Postpone(callback, self.all(), thread_count=thread_count)
        queue()

    def annotate_booking_count(self):
        from bookings.models import Booking

        return self.annotate(
            total_bookings=models.Count("user__orders")
        ).prefetch_related(
            models.Prefetch(
                "user__orders",
                queryset=Booking.objects.exclude(status=Booking.CANCELLED),
            )
        )

    def display_in_admin(self):
        return (
            self.annotate(req_count=models.Count("request"))
            .annotate(
                t=models.Count(
                    models.Case(
                        models.When(request__approved=True, then=1),
                        output_field=models.IntegerField(),
                    )
                )
            )
            .order_by("-payment_date")
        )

    def same_number(self):
        condition = (
            self.values("number")
            .annotate(models.Count("number"))
            .order_by()
            .filter(number__count__gt=1)
        )
        return self.filter(number__in=[x["number"] for x in condition]).exclude(
            status=BaseRequestTutor.ISSUED
        )

    def booking_values(self):
        from bookings.models import BookingSession

        return self.annotate(
            total_booking_sum=models.Sum("user__orders__bookingsession__price")
        )

    def with_bookings(self):
        return (
            self.exclude(status=BaseRequestTutor.ISSUED)
            .filter(models.Q(status=BaseRequestTutor.PAYED) | ~models.Q(booking=None))
            .annotate_booking_count()
        )

    def update_email_address(self, email):
        from users.models import User

        ids = self.values_list("user_id", flat=True)
        BaseRequestTutor.objects.filter(user_id__in=ids).update(email=email)
        User.objects.filter(id__in=list(ids)).update(email=email)

    def do_not_belong_to_admin(self):
        return self.exclude(number="").exclude(number=None)

    def can_be_displayed(self):
        return self.filter(
            models.Q(status=BaseRequestTutor.COMPLETED)
            | models.Q(status=BaseRequestTutor.PENDING)
        ).filter(booking=None)

    def get_requests_to_be_paid_tomorrow(self):
        today = datetime.date.today()
        return self.filter(payment_date=(today + datetime.timedelta(days=1)))

    def to_be_requested(self, state=None, days_ago=15):
        queryset = (
            self.filter(
                status__in=[
                    BaseRequestTutor.COMPLETED,
                    BaseRequestTutor.CONTINUE_LATER,
                ],
                booking=None,
                # email_sent=True,
                valid_request=True,
                # created__
            )
            .days_ago(days_ago)
            .exclude(budget=0)
            .exclude(budget=None)
            .exclude(request_info__client_request__isnull=False)
            # .exclude(email_sent=True)
        )
        if state:
            queryset = queryset.filter(state=state)
        return queryset

    def raw_request_subjects_state(self, state):
        return (
            self.to_be_requested()
            .filter(state=state)
            .values_list("request_subjects", flat=True)
        )

    def requested_subjects_state(self, state):
        new_skills = list(
            filter(lambda x: x != None, self.raw_request_subjects_state())
        )
        return list(set(itertools.chain(*new_skills)))

    def find_skill(self, skill):
        return self.extra(
            where=["array_to_string(request_subjects,', ') ilike upper(%s)"],
            params=["%{}%".format(skill)],
        )

    def tutor_count_exists(self):
        return self.filter(request__approved=True)

    def qualified(self):
        return (
            self.filter(
                models.Q(status=BaseRequestTutor.COMPLETED)
                | models.Q(status=BaseRequestTutor.CONTINUE_LATER)
            )
            .filter(booking=None, valid_request=True)
            .annotate(pool=models.Count("request"))
            .filter(pool__lt=MAX_SLOT_NUMBER)
        )

    def nearby_locations(self, latitude, longitude, radius, use_miles=False):
        if use_miles:
            distance_unit = 3959
        else:
            distance_unit = 6371
        return self.extra(
            where=[
                "(%s * acos( cos( radians(%s) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(%s) ) + sin( radians(%s) ) * sin( radians( latitude ) ) ) ) < %s"
            ],
            params=[distance_unit, latitude, longitude, latitude, int(radius)],
        )

    def by_vicinity(self, vicinity):
        return self.filter(
            models.Q(home_address__icontains=vicinity)
            | models.Q(vicinity__icontains=vicinity)
        )

    def by_region(self, region, radius=4):
        from users.models import StateWithRegion

        region_instance: StateWithRegion = StateWithRegion.objects.filter(
            region__istartswith=region
        ).first()
        if region_instance:
            related_regions = StateWithRegion.objects.get_related_regions(
                region_instance.region, radius, state=region_instance.state
            )
        else:
            related_regions = StateWithRegion.objects.get_related_regions(
                region, radius
            )
        if len(related_regions[0]):
            print(related_regions[1])
            regions = related_regions[0].values_list("region", flat=True)
            region_search = [models.Q(vicinity__icontains=x) for x in regions] + [
                models.Q(home_address__icontains=x) for x in regions
            ]
            return self.filter(functools.reduce(operator.or_, region_search))
        return self.none()

    def by_distance(self, vicinity="Lagos", latitude=None, longitude=None, radius=30):
        if latitude and longitude:
            try:
                subquery = self.nearby_locations(
                    float(latitude), float(longitude), radius
                )
            except ValueError:
                subquery = self.by_vicinity(vicinity)
        else:
            subquery = self.by_vicinity(vicinity)
        return subquery

    def payed_with_bookings(self):
        pks = (
            self.filter(status=BaseRequestTutor.PAYED)
            .values("user_id")
            .annotate(counts=models.Count("user_id"))
        )
        query = self.filter(user__id__in=[x["user_id"] for x in pks])
        return query.select_related("user").with_bookings_count()

    def with_bookings_count(self):
        return (
            self.annotate(counts=models.Count("user__orders", distinct=True))
            .annotate(
                total_booked=models.Sum(
                    "user__wallet__transactions__amount", distinct=True
                ),
                total_payed=models.Sum("user__wallet__transactions__amount_paid"),
            )
            .filter(counts__gt=0)
        )

    def follow_up(self):
        return self.exclude(hubspot_deal_id=None).filter(sent_reminder=False)


class BaseRequestTutorManager(models.Manager):
    def with_bookings(self):
        return self.get_queryset().with_bookings()

    def by_region(self, *args, **kwargs):
        return self.get_queryset().by_region(*args, **kwargs)

    def follow_up(self):
        return self.get_queryset().follow_up()

    def fall_in_new_drip(self):
        return self.get_queryset().fall_in_new_drip()

    def get_queryset(self):
        return BaseRequestTutorQueryset(self.model, using=self._db)

    def has_previous_booking(self, *args, **kwargs):
        return self.get_queryset().has_previous_booking(*args, **kwargs)

    def request_completed_today(self):
        today = timezone.now()
        return (
            self.get_queryset()
            .filter(status=BaseRequestTutor.COMPLETED)
            .filter(
                created__year=today.year,
                created__month=today.month,
                created__day=today.day,
            )
        )

    def by_distance(self, vicinity="Lagos", latitude=None, longitude=None, radius=30):
        return self.get_queryset().by_distance(
            vicinity=vicinity, latitude=latitude, longitude=longitude, radius=radius
        )

    def requests_to_be_booked(self):
        return (
            self.get_queryset()
            .filter(status=BaseRequestTutor.COMPLETED, booking=None)
            .tutor_count_exists()
        )

    def completed(self):
        return self.get_queryset().filter(
            status=BaseRequestTutor.COMPLETED, email_sent=False
        )

    def users_who_placed_completed(self):
        return self.get_queryset().exclude(status=BaseRequestTutor.ISSUED)

    def current_request_pool_queryset(self, **kwargs):
        days = kwargs.get("days") or 15
        queryset = (
            self.from_search(**kwargs)
            .filter(valid_request=True)
            # .exclude(request_info__client_request__isnull=False)
            .days_ago(days)
            .order_by("-created")
        )
        user = kwargs.pop("user", None)
        if user and user.is_authenticated:
            queryset = queryset.exclude(user=user)
        return queryset.annotate(request_count=models.Count("request"))

    def from_search(self, **kwargs):
        from users.models import StateWithRegion

        q = kwargs.get("q", "")
        state = kwargs.get("state", None)
        latitude = kwargs.get("latitude", None)
        longitude = kwargs.get("longitude", None)
        vicinity = kwargs.get("vicinity")
        gender = kwargs.get("gender", "")
        user = kwargs.get("user")
        radius = kwargs.get("radius") or 10

        queryset = self.get_queryset().qualified()
        if vicinity:
            _, search_filter = StateWithRegion.build_region_filter(
                vicinity, radius, state=state, kind="request"
            )
            queryset = queryset.filter(**search_filter)
        # if latitude and longitude or vicinity:
        #     queryset = queryset.by_distance(
        #         vicinity=vicinity, latitude=latitude, longitude=longitude
        #     )
        if state:
            queryset = queryset.filter(state=state)

        if q:
            queryset = queryset.find_skill(q)
        if gender:
            if gender == "A":
                gender = ""
            queryset = queryset.filter(gender=gender)
        if not state and not latitude and not longitude and not q and not vicinity:
            if user.is_authenticated:
                if user.is_tutor:
                    state = user.revamp_data("personalInfo", "state")
                    # state = user.location_set.actual_tutor_address().state
                    queryset = queryset.filter(state__istartswith=state)
        return queryset

    def new_requests(self):
        return (
            self.get_queryset()
            .filter(status=BaseRequestTutor.COMPLETED)
            .filter(created)
            .exists()
        )

    def do_not_belong_to_admin(self):
        return self.get_queryset().do_not_belong_to_admin()

    def to_be_requested(self, state, **kwargs):
        return self.get_queryset().to_be_requested(state, **kwargs)

    def can_be_displayed(self):
        return self.get_queryset().can_be_displayed()

    def find_skill(self, skill):
        return self.get_queryset().find_skill(skill)

    def get_drip_request(self, counter=0):
        return (
            self.get_queryset()
            .do_not_belong_to_admin()
            .exclude(email="")
            .exclude(email=None)
            .filter(status=BaseRequestTutor.ISSUED, drip_counter=counter)
            .distinct("email")
        )

    def get_pending_drip_request(self):
        """returns queryset for all request that are currently pending and do not
        have a booking attached to them."""
        return (
            self.get_queryset()
            .filter(status=BaseRequestTutor.PENDING)
            .filter(booking=None)
        )

    def with_summary(self, kind):
        return (
            self.get_queryset()
            .filter(
                request_info__request_details__schedule__summary__iexact=kind,
                status=BaseRequestTutor.PAYED,
            )
            .count()
        )


class BaseRequestTutor(TimeStampedModel):
    NUMBER_OF_TUTOR = 1
    NIGERIAN_STATES = [("", "Select State")] + [(x, x) for x in states]
    request_type = models.IntegerField(
        choices=(
            (1, "Regular Request"),
            (2, "Tutor Request"),
            (3, "Online Request"),
            (4, "Prime Request"),
            (5, "Group Request"),
        ),
        default=1,
    )
    gender = models.CharField(
        max_length=2,
        db_index=True,
        blank=True,
        choices=(
            ("", "Any gender is fine"),
            ("M", "I prefer a Male"),
            ("F", "I prefer a Female"),
        ),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    plan = models.CharField(max_length=10, blank=True, null=True)
    hours_per_day = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        choices=(
            ("", "Select"),
            (1, "1 hour"),
            (Decimal(1.5), "1 hour 30 minutes"),
            (2, "2 hours"),
            (Decimal(2.5), "2 hours 30 minutes"),
            (3, "3 hours"),
            (4, "4 hours"),
            (5, "5 hours"),
            (6, "6 hours"),
        ),
        blank=True,
        null=True,
    )
    no_of_students = models.IntegerField(
        default=1, choices=((1, "1"), (2, "2"), (3, "3"), (4, "4"), (5, "5"))
    )
    expectation = models.TextField(max_length=800, blank=True)
    home_address = models.CharField(max_length=100, blank=True)
    longitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    latitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    email = models.EmailField(_("email address"), blank=False, db_index=True)
    first_name = models.CharField(
        _("first name"), max_length=40, blank=True, unique=False, db_index=True
    )
    last_name = models.CharField(
        _("last name"), max_length=40, blank=True, unique=False, db_index=True
    )
    number = PhoneNumberField(blank=True)
    time_to_call = models.CharField(
        max_length=20,
        blank=True,
        choices=TutorInterview.INTERVIEW_OPTIONS + (("Any Time", "Any Time"),),
    )
    state = models.CharField(
        max_length=50, choices=NIGERIAN_STATES, blank=True, db_index=True
    )
    region = models.CharField(max_length=50, blank=True, null=True)
    vicinity = models.CharField(max_length=70, blank=True, null=True)
    budget = models.DecimalField(default=0, blank=True, max_digits=10, decimal_places=2)
    drip_counter = models.IntegerField(default=0)
    WHERE_YOU_HEARD_CHOICES = (
        ("", "Select One"),
        ("1", "TV"),
        ("2", "Radio"),
        ("3", "Facebook"),
        ("4", "LinkedIn"),
        ("5", "Twitter"),
        ("6", "Search Engine (Google/Yahoo/Bing)"),
        ("7", "Friend/Family/Word of Mouth"),
        ("8", "SMS Notification"),
        ("9", "LindaIkeji Blog"),
        ("10", "Nairaland"),
        ("11", "BellaNaija"),
        ("12", "Instagram"),
        ("14", "Youtube"),
        ("15", "Event"),
        ("16", "Agent"),
        ("13", "Others"),
        ("17", "Searched Online"),
        ("18", "From a friend"),
        ("19", "From a blog"),
        ("20", "At an event"),
        ("21", "Saw a banner"),
        ("22", "Cuddle Blog"),
        ("23", "From a teacher"),
        ("24", "Watched from TV"),
        ("25", "Heard on Radio"),
        ("26", "Got an SMS"),
        ("27", "Physical banner"),
        ("28", "Website banner"),
        ("30", "Other media"),
    )
    where_you_heard = models.CharField(
        max_length=100, blank=True, default="", choices=WHERE_YOU_HEARD_CHOICES
    )
    tutoring_location = models.CharField(
        max_length=10,
        blank=False,
        choices=UserProfile.MEETING_ADDRESS,
        default=UserProfile.USER_RESIDENCE,
    )
    class_urgency = models.CharField(
        max_length=30,
        blank=True,
        default="",
        choices=(
            ("", "How soon should lessons start?"),
            ("immediately", "Immediately"),
            ("next_weeks", "From next week"),
            ("2_weeks", "In 2 weeks"),
            ("next_month", "In 1 month"),
            ("2_month", "In 2 months"),
            ("not_sure", "Not sure yet"),
        ),
    )
    days_per_week = models.IntegerField(
        choices=(
            ("", "Select duration"),
            (1, "1 week"),
            (2, "2 weeks"),
            (3, "3 weeks"),
            (4, "1 month"),
            (6, "1.5 months"),
            (8, "2 months"),
            (12, "3 months"),
            (24, "6 months"),
            (48, "1 year"),
        ),
        blank=True,
        null=True,
    )
    available_days = ArrayField(models.CharField(max_length=10), blank=True, null=True)
    slug = models.CharField(max_length=255, unique=True, null=True, db_index=True)
    is_parent_request = models.BooleanField(default=False)
    ISSUED = 1
    COMPLETED = 2
    PAYED = 3
    PENDING = 4
    MEETING = 5
    BOOKED = 6
    CONTINUE_LATER = 7
    COLD = 8
    FOUND_MANUALLY = 9
    PROSPECTIVE_CLIENT = 10
    TO_BE_BOOKED = 11
    NOT_REACHABLE = 12
    CANT_AFFORD = 13
    REFUND = 14
    FOLLOWED_UP_ON = 15
    UNDECIDED = 16
    STATES = (
        (ISSUED, "issued"),
        (COMPLETED, "completed"),
        (PAYED, "payed"),
        (PENDING, "pending"),
        (MEETING, "request_to_meet"),
        (BOOKED, "booked"),
        (FOUND_MANUALLY, "found_manually"),
        (CONTINUE_LATER, "book_later"),
        (COLD, "cold"),
        (PROSPECTIVE_CLIENT, "prospective_client"),
        (TO_BE_BOOKED, "to_be_booked"),
        (NOT_REACHABLE, "not_reachable"),
        (CANT_AFFORD, "cant_afford_price"),
        (REFUND, "refunded"),
        (FOLLOWED_UP_ON, "followed_up_on"),
        (UNDECIDED, "undecided"),
    )
    CLASS_OF_CHILD = (
        ("", "Select Class"),
        ("1", "Nursery Class"),
        ("2", "Basic or Grade 1"),
        ("3", "Basic or Grade 2"),
        ("4", "Basic or Grade 3"),
        ("5", "Basic or Grade 4"),
        ("6", "Basic or Grade 5"),
        ("7", "Basic or Grade 6"),
        ("8", "Basic 7 or JSS 1"),
        ("9", "Basic 8 or JSS 2"),
        ("10", "Basic 9 or JSS 3"),
        ("11", "Basic 10 or SSS 1"),
        ("12", "Basic 11 or SSS 2"),
        ("13", "Basic 12 or SSS 3"),
        ("14", "Undergraduate"),
        ("15", "Adult Student"),
    )
    AGES = (
        ("", "Select Age"),
        ("1", "3 to 5 years"),
        ("2", "6 to 8 years"),
        ("3", "9 to 11 years"),
        ("4", "12 to 17 years"),
        ("5", "18 years +"),
    )
    CURRICULUM = (
        ("", "I'm not sure"),
        ("1", "Nigerian Curriculum"),
        ("2", "British Curriculum"),
        ("3", "American Curriculum"),
        ("4", "Both British and Nigerian"),
        ("6", "IPC Curriculum"),
        ("7", "Montessori"),
        ("8", "EYFS"),
        ("5", "Doesn't apply to me"),
    )
    class_of_child = models.CharField(max_length=15, blank=True, choices=CLASS_OF_CHILD)
    classes = ArrayField(models.CharField(max_length=15), blank=True, null=True)
    age = models.CharField(blank=True, max_length=3, choices=AGES)
    request_subjects = ArrayField(
        models.CharField(max_length=200), blank=True, null=True
    )
    curriculum = models.CharField(max_length=30, blank=True, choices=CURRICULUM)
    status = models.IntegerField(default=ISSUED, choices=STATES)
    will_be_paying_with = models.IntegerField(
        null=True,
        default=0,
        choices=(
            (0, "Select Payment Mode"),
            (1, "Online Payment"),
            (2, "Bank Payment"),
            (3, "Wallet Balance"),
        ),
    )
    amount_paid = models.DecimalField(
        default=0, blank=True, max_digits=10, decimal_places=2
    )
    ts = models.ForeignKey(
        "skills.TutorSkill", null=True, blank=True, on_delete=models.SET_NULL
    )
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="my_client_requests",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    school = models.CharField(max_length=70, blank=True, null=True)
    booking = models.ForeignKey(
        "bookings.Booking", null=True, blank=True, on_delete=models.SET_NULL
    )
    time_of_lesson = models.CharField(max_length=50, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    # remarks = models.CharField(max_length=150, blank=True, null=True)
    # approved = models.BooleanField(default=False)
    paid_fee = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)
    multiple_month = models.BooleanField(default=False)
    valid_request = models.BooleanField(default=False)
    payment_date = models.DateTimeField(null=True, blank=True)
    is_split = models.BooleanField(default=False)
    agent = models.ForeignKey(
        "external.Agent", null=True, blank=True, on_delete=models.SET_NULL
    )
    booking_agent = models.ForeignKey(
        "external.Agent",
        related_name="a_booking",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    # follow_up_agent = models.ForeignKey(
    #     "external.Agent",
    #     related_name="assigned_requests",
    #     null=True,
    #     blank=True,
    #     on_delete=models.SET_NULL,
    # )
    related_request = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL
    )
    percent_discount = models.IntegerField(default=5, null=True, blank=True)
    price_range = IntegerRangeField(blank=True, null=True)
    country = CountryField(null=True, blank=True)
    country_state = models.CharField(max_length=70, blank=True, null=True)
    the_timezone = models.CharField(max_length=70, blank=True, null=True)
    online_id = models.CharField(max_length=70, blank=True, null=True)
    objects = BaseRequestTutorManager()
    hubspot_contact_id = models.IntegerField(null=True, blank=True)
    hubspot_deal_id = models.IntegerField(null=True, blank=True)
    sent_reminder = models.BooleanField(default=False)
    request_info = JSONField(null=True, blank=True)
    NEW_FOLLOW_UP = 1
    FOLLOW_UP_CHOICES = (
        (NEW_FOLLOW_UP, "New Follow-up"),
        (2, "First Contact - Day 0"),
        (3, "Second Contact - Day 1"),
        (4, "Third Contact - Day 2"),
        (5, "Fourth Contact - Day 4"),
        (6, "Firth Contact - Day 7"),
        (7, "Sixth Contact - Day 10"),
        (8, "Seventh Contact - Day 14"),
        (9, "Eight Contact - Day - 19"),
        (10, "Ninth Contact - Day - 24"),
        (11, "Tenth Contact - Day 30"),
    )
    follow_up_stages = models.IntegerField(
        default=NEW_FOLLOW_UP, choices=FOLLOW_UP_CHOICES
    )

    class Meta:
        verbose_name = "Client's Request Detail"
        verbose_name_plural = "Client's Request Details"

    @property
    def admin_search_link(self):
        return f"{settings.NEW_PROFILE_URL}/admin/search/{self.slug}"

    @property
    def sales_remarks(self):
        return self.request_info.get("sales_remarks") or []

    def save_request_info(self, data):
        info = self.request_info or {}
        info.update(**data)
        self.request_info = info
        self.save()

    def get_absolute_url(self):
        return reverse("request_booking_page", args=[self.slug])

    def req_sub(self):

        desc = self.request_subjects
        if desc:
            if len(desc) == 1:
                return desc[0]
            if len(desc) == 0:
                return ""
            return ", ".join(desc[0:-1]) + " and " + desc[-1]
        return ""

    def get_email_template(self):
        site = Site.objects.get_current()
        return {
            "subject": "COPY OF EMAIL SENT TO CLIENT",
            "html": render_to_string(
                "external/email-to-hubspot.html", {"instance": self, "site": site}
            ),
            "text": render_to_string(
                "external/email-to-hubspot.txt", {"instance": self, "site": site}
            ),
        }

    def link_to_admin_for_request(self):
        return ("/we-are-allowed/external/baserequesttutor/?q={}").format(self.email)

    def link_to_tutors(self):
        x = self.slug
        if self.is_split:
            x = self.email
        return "/we-are-allowed/connect_tutor/requestpool/?q={}".format(x)

    @cached_property
    def get_agent(self):
        if not self.agent:
            self.agent = Agent.get_agent()
            self.save()
        return self.agent

    @property
    def split_requests_count(self):
        if self.is_new_home_request and not self.is_split:
            return len(self.client_request.get("splitRequests") or [])
        return 0

    def request_curriculum(self, tutor=None):
        if self.is_new_home_request:
            if self.is_split and self.related_request:
                return self.related_request.request_curriculum(self.tutor)
            split_requests = self.client_request.get("splitRequests") or []
            tutor_with_curriculum = [
                {
                    "curriculum": ", ".join(x.get("curriculum", [])),
                    "tutor_id": x.get("tutorId"),
                }
                for x in split_requests
            ]
            if tutor:
                found = [
                    x for x in tutor_with_curriculum if x["tutor_id"] == tutor.slug
                ]
                if found:
                    return found[0]["curriculum"]
            return ", ".join([x["curriculum"] for x in tutor_with_curriculum])
        return self.curriculum

    def get_split_count(self, approved_tutors):
        split_count = (self.request_info or {}).get("admin_split_count")
        if split_count:
            return split_count
        return len(approved_tutors)

    def update_split_count(self, split_count):
        info = self.request_info or {}
        info["admin_split_count"] = split_count
        self.request_info = info
        self.save()

    def build_split_detail(self):
        if self.is_parent_request:
            if self.is_new_home_request:
                split_r = self.client_request.get("splitRequests") or []
                if len(split_r) > 0:
                    return split_r[0]
            return build_split_detail(self)

    def get_request_info(self, with_split=False):
        if self.is_new_home_request:
            if not with_split:
                if len(self.client_request.get("childDetails") or []) > 0:
                    return self.client_request, 0
            if (
                len(self.client_request.get("splitRequests") or []) > 0
                and self.client_request.get("contactDetails")
                and self.client_request.get("childDetails")
            ):
                return self.client_request, 0
        approved_tutors = []
        qualified = self.approved_tutors()
        if self.approved_tutors_teach_all_subjects():
            if len(qualified) > 1:
                approved_tutors = [qualified[0]]
            else:
                approved_tutors = qualified
        else:
            approved_tutors = qualified
        result = parse_old_request(self.request_info, approved_tutors, instance=self)
        result["status"] = self.get_status_display().lower()
        result["created"] = self.created.isoformat()
        result["modified"] = self.modified.isoformat()
        return result, self.get_split_count(approved_tutors)

    def prepare_request_for_new_admin(self):
        pass

    @property
    def is_new_home_request(self):
        info = (self.request_info or {}).get("client_request")
        return info is not None
        # location_details = self.request_info.get("locationDetails") or {}
        # splitRequests = self.request_info.get("aboutChildDetails") or {}
        # return all([self.is_parent_request, location_details, splitRequests])

    def send_notification_to_tutor_on_job(self):
        # account for split requests as well.
        to_send = []
        pass

    def successful_payment_of_lessons(self, amount_paid=None):
        pass

    def not_booked_client_requests(self):
        not_booked = (
            BaseRequestTutor.objects.filter(
                user=self.user, booking=None, status=self.PAYED
            ).exclude(request_info__client_request__isnull=True)
            # .aggreage(total_budget=models.Sum("budget"))
        )
        splits = not_booked.filter(is_split=True)
        split_parents = [x.related_request_id for x in splits]
        remaining = not_booked.exclude(is_split=False).exclude(id__in=split_parents)
        final_ids = [x.id for x in splits] + [x.id for x in remaining]
        queryset = BaseRequestTutor.objects.filter(id__in=final_ids)
        return queryset

    def wallet_balance_available(self, deduct=False):
        balance = 0
        if self.user:
            balance = self.user.user_wallet_balance
        if deduct:
            paid_requests = (
                BaseRequestTutor.objects.filter(
                    user=self.user, status=self.PAYED, booking=None
                )
                .exclude(request_info__client_request__isnull=True)
                .aggregate(total=models.Sum("budget"))
            )
            result = paid_requests.get("total") or 0
            if result > 0:
                return 0

        return balance

    @property
    def client_request(self):
        if self.is_new_home_request:
            return self.request_info["client_request"]
        return {}

    @property
    def last_conversation_id(self):
        whatsapp_info = self.request_info.get("whatsapp_msg") or {}
        return whatsapp_info.get("conversationId")

    def save_whatsapp_info(self, data):
        request_info = self.request_info or {}
        whatsapp_msg = request_info.get("whatsapp_msg") or {}
        whatsapp_msg = data
        request_info["whatsapp_msg"] = whatsapp_msg
        self.save()

    def save_whatsapp_conversation_id(self, conversationId):
        request_info = self.request_info or {}
        whatsapp_msg = request_info.get("whatsapp_msg") or {}
        whatsapp_msg["conversationId"] = conversationId
        request_info["whatsapp_msg"] = whatsapp_msg
        self.save()

    @classmethod
    def get_request_from_conversation(cls, _id, sender):
        condition1 = models.Q(request_info__whatsapp_msg__conversation__id=_id)
        condition2 = models.Q(number__icontains=sender)
        result = cls.objects.filter(condition1 | condition2)
        return result

    @classmethod
    def get_discount_stats(cls, slug, code):
        request_info = cls.objects.filter(slug=slug).first()
        condition1 = models.Q()
        if request_info:
            condition1 = models.Q(email=request_info.email) | models.Q(
                number=request_info.number
            )
        condition2 = models.Q(
            request_info__paymentInfo__discountCode=code, is_split=False
        )
        queryset = cls.objects.filter(condition1 & condition2)
        count = queryset.count()
        has_used = count > 0
        if count == 1:
            first = queryset.first()
            # check the request to check that it is the same as the slug
            similar = first.slug == slug
            if similar:
                has_used = False
        total_used = cls.objects.filter(condition2).count()
        return {"has_used": has_used, "total_used": total_used}

    @property
    def whatsapp_number(self):
        contact_details = self.client_request.get("contactDetails") or {}
        preferredComms = contact_details.get("preferredComms") or {}
        if preferredComms.get("channel") == "whatsapp":
            return f"+{preferredComms['number']}".replace("++", "+")

    @property
    def tutor_responses(self):
        from connect_tutor.models import TutorJobResponse

        children = list(self.get_split_request().values_list("id", flat=True))
        children.append(self.pk)
        responses = TutorJobResponse.objects.filter(req_id__in=children).all()
        return [
            {
                "tutor_slug": x.tutor.slug,
                "status": x.get_status_display(),
                "dateSubmitted": x.dateSubmitted,
            }
            for x in responses
            if x.tutor
        ]

    @property
    def payment_info(self):
        if self.is_new_home_request:
            return self.request_info.get("paymentInfo") or {}
        return {}

    def update_client_request(self, key, value):
        client_request = self.client_request
        client_request[key] = value
        self.request_info = {**self.request_info, "client_request": client_request}

    @property
    def request_info_for_tutor(self):
        if self.is_new_home_request:
            if self.is_split:
                return self.request_info.get("tutor_info")
            if self.request_info.get("tutor_info"):
                return self.request_info.get("tutor_info")
            return self.client_request.get("splitRequests")
        return {}

    @property
    def actual_amount_paid(self):
        gatewayFee = 0
        if self.payment_info:
            gatewayFee = self.payment_info.get("actualAmountPaid") or 0
        return gatewayFee

    @property
    def tuition_fee(self):
        result = 0
        if self.payment_info:
            result = self.payment_info.get("tutitionFee") or 0
        return result

    @property
    def amount_to_be_paid(self):
        payment_info = self.payment_info
        if payment_info:
            tuitionFee = payment_info.get("tuitionFee") or 0
            transportFare = payment_info.get("transportFare") or 0
            totalTuition = tuitionFee + transportFare
            monthsPaid = payment_info.get("monthsPaid") or 1
            gatewayFee = payment_info.get("gatewayFee") or 0
            discountRemoved = payment_info.get("discountRemoved") or 0
            walletBalance = payment_info.get("walletBalance") or 0
            totalDiscount = payment_info.get("totalDiscount") or 0
            return (
                (totalTuition * monthsPaid)
                - walletBalance
                # + gatewayFee
                - discountRemoved
                - (totalDiscount * monthsPaid)
            )
        return 0

    @property
    def tuteria_discount(self):
        payment_info = self.payment_info
        if payment_info:
            if self.is_split:
                total = self.related_request.baserequesttutor_set.count()
                return self.related_request.tuteria_discount / total
            else:
                discountRemoved = payment_info.get("discountRemoved") or 0
                couponDiscount = payment_info.get("couponDiscount") or 0
                monthsPaid = payment_info.get("monthsPaid", 1)
                return (couponDiscount) + (discountRemoved / monthsPaid)
        return 0

    @property
    def tutor_discount(self):
        payment_info = self.payment_info
        if payment_info:
            if self.is_split:
                return payment_info.get("firstBookingDiscount") or 0
            else:
                totalDiscount = payment_info.get("totalDiscount") or 0
                couponDiscount = payment_info.get("couponDiscount") or 0
                return totalDiscount - couponDiscount
        return 0

    @property
    def total_discount(self):
        payment_info = self.payment_info
        if payment_info:
            if self.is_split:
                return payment_info.get("firstBookingDiscount") or 0
            else:
                discountRemoved = payment_info.get("discountRemoved") or 0
                totalDiscount = payment_info.get("totalDiscount") or 0
                monthsPaid = payment_info.get("monthsPaid", 1)
                return discountRemoved + (totalDiscount * monthsPaid)
        return 0

    def deposit_payment_to_wallet(self, amount_paid=0, deduct=False):
        condition1 = (
            lambda: self.actual_amount_paid > 0
            and amount_paid >= self.actual_amount_paid
        )
        condition2 = lambda: amount_paid >= self.full_payment
        if condition1() or condition2():
            # if self.amount_to_be_paid > 0 and amount_paid > 0:
            amount_value = self.actual_amount_paid or amount_paid
            if not deduct:
                self.user.wallet.deposit_new_payment_to_wallet(self, amount_value)
                self.user.add_to_wallet(float("%.2f" % amount_value))

            # else:
            #     self.user.deduct_from_wallet(float("%.2f" % amount_paid))
            self.status = self.PAYED
            self.update_client_request(
                "bookedDate", datetime.datetime.now().isoformat()
            )
            self.save()
            # check if there are splits
            self.get_split_request().update(status=self.PAYED)

    @property
    def lesson_fee(self):
        payment_info = self.payment_info
        if payment_info:
            if self.is_split:
                lessonFee = payment_info.get("lessonFee")
                return lessonFee
                # transportFare = payment_info.get("transportFare")
                # return lessonFee + transportFare
            else:
                totalTuition = payment_info.get("tuitionFee") or 0
                # transportFare = payment_info.get("transportFare") or 0
                # totalTuition = tuitionFee + transportFare
                monthsPaid = payment_info.get("monthsPaid", 1)
                return (totalTuition) * monthsPaid
        return 0

    @property
    def transport_fare(self):
        return self.full_payment - self.lesson_fee

    @property
    def full_payment(self):
        payment_info = self.payment_info
        if payment_info:
            if self.is_split:
                lessonFee = payment_info.get("lessonFee") or 0
                # return lessonFee
                transportFare = payment_info.get("transportFare") or 0
                return lessonFee + transportFare
            else:
                tuitionFee = payment_info.get("tuitionFee") or 0
                transportFare = payment_info.get("transportFare") or 0
                totalTuition = tuitionFee + transportFare
                monthsPaid = payment_info.get("monthsPaid", 1)
                return (totalTuition) * monthsPaid
        return 0

    @property
    def tutor_info_index(self):
        if self.is_new_home_request:
            return self.request_info.get("tutor_info_index")
        return None

    @property
    def user_country(self):
        contact_info = self.client_request.get("contactDetails") or {}
        return contact_info.get("country")

    @property
    def is_batched(self):
        classInfo = self.request_info or {}
        v = None
        if isinstance(classInfo, dict):
            v = classInfo.get("classInfo")
        if v:
            return True
        return False

    def job_absolute_url(self):
        return reverse("job-details", args=[self.slug])

    @property
    def subject_ast(self):
        if self.request_subjects is None or self.request_subjects == []:
            return None

        desc = self.request_subjects
        if len(desc) == 1:
            return desc[0]
        return ", ".join(desc[0:-1]) + " and " + desc[-1]

    @property
    def request_summary(self):
        text = "{} Subjects".format(len(self.request_subjects))
        if len(self.request_subjects) == 0:
            text = self.request_subjects[0]
        return "Tutor in {} for {}".format(
            "{}, {}".format(self.vicinity, self.state), text
        )

    @classmethod
    def populate_all_data(cls, o):
        from dateutil.parser import parse

        options = (
            (1, "1 week"),
            (2, "2 weeks"),
            (3, "3 weeks"),
            (4, "1 month"),
            (6, "1.5 months"),
            (8, "2 months"),
            (12, "3 months"),
            (24, "6 months"),
            (48, "1 year"),
        )
        days_choices = (
            ("", "Select"),
            (1, "1 hour"),
            (Decimal(1.5), "1 hour 30 minutes"),
            (2, "2 hours"),
            (Decimal(2.5), "2 hours 30 minutes"),
            (3, "3 hours"),
            (4, "4 hours"),
            (5, "5 hours"),
        )

        slug = generate_code(BaseRequestTutor, "slug")
        ss = BaseRequestTutor(
            slug=slug,
            state=o["State"],
            home_address=o["Address"],
            number="+234" + o["Number"],
            first_name=o["Full Name"],
            expectation=o["Goal"],
            no_of_students=o["Students"],
            request_subjects=[o["Subjects"]],
            available_days=[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ][: int(o["Days/Week"])],
            email=o["Email Address"],
            request_type=4,
            is_parent_request=True,
            time_of_lesson=o["Time"],
            budget=o["\ufeff  Amount  "][3:].replace(",", "").strip(),
        )
        for key, val in dict(options).items():
            if val == o["Duration"]:
                ss.days_per_week = key
        for key, val in dict(days_choices).items():
            if val == o["Hours"]:
                ss.hours_per_day = key
        for key, val in {
            "": "Anyone is fine",
            "M": "I want a Male",
            "F": "I want a Female",
        }.items():
            if val == o["Gender"]:
                ss.gender = key
        ss.save()
        cls.objects.filter(pk=ss.pk).update(created=parse(o["Date/Time"]))
        return ss

    def update_payment_date_to_today(self):
        """Set the payment date field to today"""
        self.payment_date = timezone.now()
        self.save()

    def update_percent_discount(self, discount=0):
        """Update the percent discount to value passed"""
        self.percent_discount = discount
        self.save()

    def full_name(self):
        return "%s %s" % (self.first_name, self.last_name)

    def approved_tutors(self):
        ln = self.get_split_request()
        if len(ln) > 0:
            return self.request.related(self)
        if self.related_request:
            return self.request.related(self.related_request)
        return self.request.approved_tutors()

    @property
    def has_budget_in_pool(self):
        uu = [x.tutor_budget > 0 for x in self.approved_tutors()]
        return all(uu)

    def approved_tutors_teach_all_subjects(self):
        ln = self.get_split_request()
        if len(ln) > 0:
            return False
        return self.request.approved_tutors_teach_all_subjects(self.related_request)

    def update_payment_and_status(self, new_amount):
        """When a client successfully makes payment for booking"""
        self.amount_paid = new_amount
        self.status = BaseRequestTutor.PAYED
        self.save()
        if self.related_request:
            BaseRequestTutor.objects.filter(pk=self.related_request_id).update(
                amount_paid=new_amount, status=BaseRequestTutor.PAYED
            )
            self.related_request.get_split_request().update(
                amount_paid=new_amount, status=BaseRequestTutor.PAYED
            )

    def in_vicinity(self, radius=10):
        from users.models import StateWithRegion

        result = StateWithRegion.objects.get_related_regions(self.vicinity, radius)
        if len(result) == 2:
            return result[0]
        return StateWithRegion.objects.none()

    def create_new_booking(self, amount=None):
        self.percent_discount = 0
        self.save()
        budget = amount or self.budget
        deposit = DepositMoney.create(user=self.user)
        deposit.amount = budget
        deposit.request = self
        deposit.save()
        return deposit

    def facebook_content(self):
        x = "Home" if self.is_parent_request else self.request_subjects[0]
        url2 = "https://tuteria.com{}".format(self.job_absolute_url())
        return "Apply Now! {} {} Tutor needed in {}, {} starting at N{} at Tuteria Nigeria".format(
            url2, x, self.get_vicinity(), self.state, round(self.budget)
        )

    def twitter_content(self):
        x = "Home" if self.is_parent_request else self.request_subjects[0]
        url2 = "https://tuteria.com{}".format(self.job_absolute_url())
        return "Apply Now! {} {} Tutor needed in {}, {} starting at N{}".format(
            url2, x, self.get_vicinity(), self.state, round(self.budget)
        )

    def get_split_request(self):
        return BaseRequestTutor.objects.filter(related_request=self)

    @property
    def speaking_fee(self):
        if self.is_new_home_request:
            if self.is_split:
                return self.related_request.speaking_fee
            split = self.get_split_request()
            if len(split) > 0:
                return 2500 * len(split)
            return 3000
        return 0

    def paid_speaking_fee(self, _amount=None):
        from users.models import User

        amount = _amount
        if not amount:
            amount = self.speaking_fee
        instance_wallet = self.user.wallet
        admin_wallet = User.get_admin_wallet()
        instance_wallet.pay_processing_fee(
            self.slug,
            admin_wallet,
            # fee_amount=amount,
            fee_amount=self.speaking_fee,
            # actual_amount=self.speaking_fee,
            request=self,
        )
        self.paid_fee = True
        self.status = self.MEETING
        self.update_client_request(
            "speakingFeeDate", datetime.datetime.now().isoformat()
        )
        self.save()
        BaseRequestTutor.objects.filter(related_request=self).update(
            paid_fee=True, status=self.MEETING
        )
        return self

    def pay_processing_fee(self, deduct=False):
        from users.models import User
        from ..tasks import send_notification_of_processing_fee_to_client

        if not self.user:
            self.user, _ = User.objects.get_or_create(email=self.email)
        instance_wallet = self.user.wallet
        admin_wallet = User.get_admin_wallet()
        instance_wallet.pay_processing_fee(self.slug, admin_wallet, deduct=deduct)
        send_notification_of_processing_fee_to_client.delay(self.pk)
        self.paid_fee = True
        self.save()

    def refund_processing_fee(self, payout=None):
        instance_wallet = self.user.wallet
        instance_wallet.refund_processing_fee(payout, created=self.created)
        BaseRequestTutor.objects.filter(pk=self.pk).update(
            status=BaseRequestTutor.COLD, paid_fee=False
        )

    def penalize_tutor_for_cancelling_b4_commencement(self):
        self.tutor.wallet.penalize_for_cancel_b4_commencement(booking=self.booking)
        if self.booking:
            self.booking.delete()

    def display_name(self):
        if len(self.request_subjects) > 1:
            return "{} and {} other subjects".format(
                self.request_subjects[0], len(self.request_subjects[1:])
            )
        return self.request_subjects[0]

    def has_been_paid(self):
        return self.payment_deposits.filter(made_payment=True).exists()

    def determine_validity(self):
        per_hour = self.per_hour()
        if per_hour and per_hour >= self.state_price:
            self.is_valid = True

    @property
    def state_price(self):
        if self.state in ["Lagos", "Rivers"]:
            return 800
        return 500

    def request_detail_url(self):
        return reverse("job-details", args=[self.slug])

    def coc(self):
        if self.class_of_child:
            return self.get_class_of_child_display()
        return ",".join(self.classes)

    def gen(self):
        gender = dict = {"": "Any Gender", "M": "Male", "F": "Female"}
        return gender[self.gender]

    def per_hour(self):
        if self.budget > 0:
            try:
                if self.days_per_week < 4:
                    result = self.budget / (
                        self.no_of_students
                        * self.hours_per_day
                        * self.days_per_week
                        * len(self.available_days)
                    )
                    return round(result, 2)
                r = self.budget / (
                    self.no_of_students
                    * self.hours_per_day
                    * 4
                    * len(self.available_days)
                )
                return round(r, 2)
            except Exception:
                return 0
        return 0

    def price_calculator(self, per_hour):
        if self.days_per_week < 4:
            return (
                per_hour
                * self.no_of_students
                * self.hours_per_day
                * self.days_per_week
                * len(self.available_days)
            )
        return (
            per_hour
            * self.no_of_students
            * self.hours_per_day
            * len(self.available_days)
            * 4
        )

    def price_calculator2(self, per_hour):
        pricing = PriceDeterminator.get_new_price(
            per_hour, self.no_of_students, self.hours_per_day, len(self.available_days)
        )
        # import pdb; pdb.set_trace()
        if self.days_per_week < 4:
            # pdb.set_trace()
            return pricing * self.days_per_week
            # return Decimal(per_hour) * self.hours_per_day *
            # self.days_per_week * len(self.available_days)
        return pricing * 4

    def no_of_month_to_display(self):
        if self.days_per_week < 4:
            return self.get_days_per_week_display()
        return "1 month"

    def tutor_price(self, per_hour):
        v = self.price_calculator(per_hour)
        if self.multiple_month:
            w = self.days_per_week / 4
            v *= w
        return v

    def get_vicinity(self):
        if self.vicinity:
            return self.vicinity
        split_address = self.home_address.replace(",", "").split()
        if len(split_address) > 0:
            last = split_address[-1]
            if last.lower() == "state":
                return ", ".join(split_address[-3:-2])
            return ", ".join(split_address[-2:])
        return self.home_address

    def remaining_slot(self):
        if hasattr(self, "request_count"):
            return MAX_SLOT_NUMBER - self.request_count
        return MAX_SLOT_NUMBER - self.request.count()

    @staticmethod
    def create_instance(user, create_slug=False):
        x = BaseRequestTutor.objects.filter(
            email=user.email, status=BaseRequestTutor.ISSUED
        ).first()
        if x:
            return x
            # x.all().delete()
        home_address = user.home_address
        phone_number = user.primary_phone_no.number if user.primary_phone_no else ""
        if home_address:
            addr = home_address
            state = addr.state or ""
            dicto = dict(
                home_address=addr.address,
                state=state,
                latitude=addr.latitude,
                longitude=addr.longitude,
                vicinity=addr.vicinity,
            )
        else:
            dicto = dict()
        try:
            new_request, exists = BaseRequestTutor.objects.get_or_create(
                email=user.email, status=BaseRequestTutor.ISSUED
            )
        except MultipleObjectsReturned:
            BaseRequestTutor.objects.filter(
                email=user.email, status=BaseRequestTutor.ISSUED
            ).delete()
            time.sleep(1)
            new_request, exists = BaseRequestTutor.objects.get_or_create(
                email=user.email, status=BaseRequestTutor.ISSUED
            )
        created = timezone.now()
        BaseRequestTutor.objects.filter(pk=new_request.pk).update(
            first_name=user.first_name or "",
            last_name=user.last_name or "",
            email=user.email,
            number=phone_number,
            age=2,
            class_of_child=5,
            created=created,
            **dicto,
        )
        if create_slug:
            new_request.slug = generate_code(BaseRequestTutor, "slug")
        new_request.save()
        return BaseRequestTutor.objects.filter(pk=new_request.pk).first()

    @classmethod
    def generate_slug(cls):
        return generate_code(cls, "slug")

    def get_duration(self):
        return self.get_days_per_week_display()

    def same_password(self):
        password = self.first_name.lower() + self.last_name.lower()
        user = authenticate(email=self.email, password=password)
        if user is not None:
            return True
        return False

    @property
    def g(self):
        if self.latitude and self.longitude:
            return True
        return False

    def new_words(self):
        stop_words = [
            "off",
            "of",
            "by",
            "near",
            "arlong",
            "after",
            "close",
            "to",
            "the",
            "opposite",
            "in",
            "no",
            "behind",
        ]
        combination = "%s %s" % (self.home_address.lower(), self.vicinity.lower())
        nn = combination.replace(",", " ")
        no_duplicates = " ".join(sorted(set(nn.split()), key=nn.split().index))
        no_preposition_list = [x for x in no_duplicates.split() if x not in stop_words]
        return " ".join([x for x in no_preposition_list if not x.isdigit()])

    def clean_address(self):
        yy = self.new_words().split()
        g = GoogleV3()
        houses = [" ".join(x) for x in itertools.combinations(yy, 2)]
        result = []
        for t in houses:
            try:
                u = g.geocode(t)
                if u:
                    if u.address.split()[-1] == "Nigeria":
                        result.append(u)
                time.sleep(1)
            except Exception:
                pass
        return result

    def tutors_suggested2(self):
        from users.models import User

        return User.objects.qualifies_for_requests(
            self.request_subjects, self.state, self.gender
        )

    def tutors_suggested(self, active=True, radius=10):
        """Get the list of tutors in that state that can teach Any
        of the skill the user requested"""
        from users.models import User

        # states = [self.state]
        cleaned_address = []
        if self.latitude and self.longitude:
            cleaned_address = [self]
        # else:
        #     cleaned_address = self.clean_address()
        # cleaned_address = [""]
        # if len(cleaned_address) == 0:
        #     return User.objects.none()
        query = User.objects.in_the_same_vicinity(
            self.request_subjects,
            cleaned_address,
            self.state,
            self.gender,
            active=active,
            radius=radius,
        )
        radius2 = radius
        while query.count() > 20 and radius2 > 3:
            radius2 = radius2 - 2
            query = User.objects.in_the_same_vicinity(
                self.request_subjects,
                cleaned_address,
                self.state,
                self.gender,
                active=active,
                radius=radius2,
            )
        return query

    def tutors_suggested3(self):
        from users.models import User, UserProfile

        # cleaned_address = self.clean_address()
        # import pdb; pdb.set_trace()
        # if len(cleaned_address) > 0:
        queryset = User.objects.filter(
            profile__application_status=UserProfile.VERIFIED
        ).filter(location__state=self.state)
        if self.gender:
            queryset = queryset.filter(profile__gender=gender)

        return queryset
        # return User.objects.in_the_same_vicinity(self.request_subjects,
        #                                          cleaned_address,
        #                                          self.state, self.gender)
        # return User.objects.none()

    @staticmethod
    def notify_client(pk, booking):
        br = BaseRequestTutor.objects.get(pk=pk)
        booking.user = br.user
        booking.save()
        br.booking = booking
        br.save()

    def determine_vicinity(self):
        if self.address and self.state:
            pass
        return None

    @staticmethod
    def send_profile_to_client(pk):
        from ..tasks import send_profile_to_client

        send_profile_to_client.delay(pk)

    def get_description(self):
        return self.expectation

    @property
    def has_made_payment_before(self):
        return BaseRequestTutor.objects.filter(
            user=self.user, status=self.PAYED
        ).exists()

    def top_up(self, price):
        if price / self.budget == 1.5:
            return Decimal(1.05) * price
        if price / self.budget == 3:
            return Decimal(1.1) * price
        return price

    def search(self):
        search_url = []
        for skills in self.request_subjects:
            search_url.append('<a href="%s">%s</a>')

    search.allow_tags = True

    @property
    def number_of_tutors(self):
        return 1

    def get_tutor_fields(self, **kwargs):
        # import pdb; pdb.set_trace()
        return {
            "days_per_week": self.days_per_week,
            "hours_per_day": self.hours_per_day,
            "plan": self.plan,
            "no_of_students": self.no_of_students,
            "state": self.state,
            "available_days": len(self.available_days),
            "number_of_tutors": self.number_of_tutors,
        }

    def get_booking_quote(self, price_determinator):
        return price_determinator.determine_client_quote(
            **{
                "days_per_week": self.days_per_week,
                "hours_per_day": self.hours_per_day,
                "plan": self.plan,
                "no_of_students": self.no_of_students,
                "state": self.state,
                "available_days": len(self.available_days),
                "number_of_tutors": self.number_of_tutors,
            }
        )

    @property
    def request_start_date(self):
        start_date = None
        if self.request_info and isinstance(self.request_info, dict):
            start_date = (self.request_info.get("request_details") or {}).get(
                "start_date"
            )
        return start_date

    def extract_expectation_from_request(self):
        string = ""
        if self.request_info:
            classes = self.request_info.get("request_details", {}).get("classes") or []
            for x in classes:
                string += f"class: {x['class']}\ngoal: "
                if type(x["goal"]) == dict:
                    uu = [str(o) for o in x["goal"].values()]
                    goal = ", ".join(uu)
                    string += f"{goal}\n"
                elif type(x["goal"]) == list:
                    string += ""
                else:
                    string += f"{x['goal']}\n"
                if x.get("expectation"):
                    string += f"expectation: {x['expectation']}\n"
                string += f"\n"
        return string

    def extract_subject_from_request(self):
        classes = self.request_info.get("request_details").get("classes")
        subject_list = [x["subjects"] for x in classes]
        subject_data = []
        for it in subject_list:
            for element in it:
                subject_data.append(element)
        subject = list(sorted(set(subject_data)))
        return subject

    def __str__(self):
        return "%s %s" % (self.email, self.budget)

    def generate_payment_link_for_group_lessons(self):
        """paystack payment link generation"""
        from paystack.utils import get_js_script as p_get_js_scripts

        payment_detail = {
            "amount": float(self.budget),
            "order": self.slug,
            "currency": "ngn",
            "base_country": "NG",
            "discount": 0,
            "description": "Payment for group lessons",
            "user_details": {
                "first_name": self.first_name,
                "last_name": self.last_name,
                "country": "Nigeria",
                "email": self.email,
                "phone_number": str(self.number),
            },
        }
        link = f"{reverse('paystack:verify_payment',args=[self.slug])}"
        payment_detail["user_details"].update(
            key=settings.PAYSTACK_PUBLIC_KEY,
            redirect_url=link,
            kind="paystack",
            js_script=p_get_js_scripts(),
        )
        return payment_detail

    def group_lesson_paid(self):
        """Actions after payment has been made for group lessons."""
        from external.tasks import (
            email_to_notify_tutor_and_client_on_group_lessons,
            notify_client_and_tutors_on_new_group_lessons,
        )

        self.made_payment = True
        self.status = BaseRequestTutor.PAYED
        self.save()
        if self.is_batched:
            notify_client_and_tutors_on_new_group_lessons(self.pk)
        else:
            email_to_notify_tutor_and_client_on_group_lessons(self.pk)
            summary_name = self.request_info["request_details"]["schedule"]["summary"]
            count = BaseRequestTutor.objects.with_summary(summary_name)
            slots.update_entry(summary_name, {"slots": count})

    def set_group_expectation(self):
        lesson_info = self.request_info["request_details"]
        lesson_plan = lesson_info["lesson_plan"]
        schedule = lesson_info["schedule"]
        self.expectation = f"Plan:{lesson_plan}\nSummary:{schedule['summary']}\nduration:{schedule['duration']}"
        self.save()

    @classmethod
    def update_drip_status(cls, queryset, drip_counter):
        cls.objects.filter(id__in=[x.id for x in queryset]).update(
            drip_counter=drip_counter
        )

    @property
    def drip_info(self):
        return {
            "first_name": self.first_name,
            "last_name": self.last_name,
            "url": f"{settings.PARENT_REQUEST_URL}/request/{self.slug}/pricing",
        }

    def new_build_telegram_job_description(self):
        student_string = self.no_of_students
        lesson_string = (
            f"{len(self.available_days) * self.days_per_week}"
            f" (i.e {len(self.available_days)} lesson(s) per week)"
        )
        heading = (
            "Home tutoring lessons"
            if self.is_parent_request
            else f"{self.request_subjects[0]} lessons"
        )
        location_string = (
            "Online (Zoom)"
            if self.request_type == 3
            else "{}, {}".format(self.get_vicinity(), self.state)
        )
        goal_string = self.extract_expectation_from_request().replace("\n\n", "")
        subject_string = ", ".join(self.request_subjects)
        currency_string = "₦{:6,.2f}".format(float(self.budget) * 0.7)
        date_string = self.modified.strftime("%d/%m/%Y")

        template = "🎉 New Job Alert 🎉\n{}\n-----------------------\n\n{}\n\nWhere: {} \nStudents: {} \nLessons: {} \nSubjects: {} \nEarning: {} \nPosted: {} \n\n👇🏽👇🏽 Click here to apply 👇🏽👇🏽\n\n".format(
            f"Ref: {self.slug}",
            heading,
            location_string,
            student_string,
            # goal_string,
            lesson_string,
            subject_string,
            currency_string,
            date_string,
        )

        def get_offset(sub_string, text_kind="bold", increment=False, additional=0):
            pattern = re.compile(re.escape(sub_string))
            ss = pattern.search(template)
            # if not ss:
            #     import pdb

            #     pdb.set_trace()
            result = ss.span()
            offset = result[0] + 1
            length = len(sub_string)
            if increment:
                offset += 1
            return {
                "offset": offset,
                "length": length + additional,
                "type": text_kind,
            }

        rr = []
        # if goal_string:
        #     rr = [(f": {goal_string}", "bold", True, 0)]
        return template, [
            get_offset(x[0], x[1], x[2], x[3])
            for x in (
                [
                    ("New Job Alert", "bold", False, 0),
                    (f"Ref: {self.slug}", "italic", True, 0),
                    (f"Ref: {self.slug}", "bold", True, 0),
                    (f"{heading}", "bold", True, 0),
                    (f": {location_string}", "bold", True, 0),
                    (f": {student_string}", "bold", True, 0),
                    (f": {lesson_string}", "bold", True, 0),
                    (f": {subject_string}", "bold", True, 0),
                    (f": {currency_string}", "bold", True, 0),
                    (f": {date_string}", "bold", True, 0),
                    ("Click here to apply", "bold", False, 6),
                ]
                + rr
            )
        ]

    def build_telegram_job_description(self):
        def width_ratio(this_value, max_value, max_width):
            actual_value = (this_value / max_value) * max_width
            return int(round(actual_value))

        job_link = f"https://www.tuteria.com{self.request_detail_url()}?utm_source=Daily%20Job%20Newsletter&utm_medium=Telegram&utm_campaign=Preview%20Job%20Details"
        # data = """{}\n{}\nClient: {}\nPrice: ₦{}\nView Job details\n{}
        result = self.new_build_telegram_job_description()
        extended_text = "{}{}".format(result[0], job_link)
        return {
            "text": extended_text,
            "entities": result[1],
        }


class NewBaseRequestTutorManager(BaseRequestTutorManager):
    def get_queryset(self):
        return super(NewBaseRequestTutorManager, self).get_queryset().filter(ts=None)


class RequestFollowupManager(BaseRequestTutorManager):
    def get_queryset(self):
        statuses = [
            BaseRequestTutor.ISSUED,
            BaseRequestTutor.CONTINUE_LATER,
            BaseRequestTutor.NOT_REACHABLE,
            BaseRequestTutor.CANT_AFFORD,
            BaseRequestTutor.UNDECIDED,
            BaseRequestTutor.COLD,
        ]
        queryset = models.Q(status__in=statuses, created__year__gte=2022)
        return (
            super().get_queryset().filter(queryset).exclude(slug=None).exclude(slug="")
        )


class NewBaseRequestTutor(BaseRequestTutor):
    objects = NewBaseRequestTutorManager()

    class Meta:
        proxy = True

    def top_up(self, price):
        if float(price) / float(self.budget) == 1.5:
            return Decimal(1.05 * float(price))
        if float(price) / float(self.budget) == 3:
            return Decimal(1.1 * float(price))
        return price


def format_date(date_string):
    if not date_string:
        return ""

    date = parser.parse(date_string)
    year = date.year
    month = date.month
    day = date.day
    hour = str(date.hour).zfill(2)
    minute = str(date.minute).zfill(2)

    return f"{year}/{month}/{day} {hour}:{minute}"


def format_remark(item: dict):
    html = ""
    action = item.get("action")
    remark = item.get("remark")
    staff = item.get("staff")
    date = format_date(item.get("created"))

    html += f'<p style="margin: 1px 0;"><b>Remark: </b>{remark}</p><p style="margin: 1px 0;"><b>Updated by: </b>{staff}</p><p style="margin: 1px 0;"><b>On: </b>{date}</p>'

    if action in ["won", "lost"]:
        html += f'<p style="margin: 1px 0;"><b>Lead {action}</b></p>'

    return html


class RequestFollowUp(BaseRequestTutor):
    objects = RequestFollowupManager()
    IS_GROUP_REQUEST = 5

    class Meta:
        proxy = True
        verbose_name = "Request Follow up"
        verbose_name_plural = "Requests Follow ups"

    def contact_details(self):
        return f'<p style="padding: 0;">{self.first_name} {self.last_name} ({self.email})</p>Phone no: {self.number}<p></p>'

    contact_details.allow_tags = True

    def location(self):
        return f'<p> {self.state}, {self.vicinity}, {self.region or ""}</p><p>{self.home_address}</p>'

    location.allow_tags = True

    def previous_remark(self):
        return self.remarks

    def summary(self):
        if self.request_type == RequestFollowUp.IS_GROUP_REQUEST:
            if self.is_batched:
                from external.new_group_flow.services import GroupRequestService

                return GroupRequestService.construct_summary(self)
            if isinstance(self.request_info, dict):
                info = self.request_info.get("request_details")
                if info:
                    return info.get("schedule")["summary"]
        else:
            return self.expectation

    summary.allow_tags = True
    summary.short_description = "Expectation/Summary"

    def kind(self):
        if self.request_type == RequestFollowUp.IS_GROUP_REQUEST:
            return "Group Request"
        return "Regular Request"

    kind.short_description = "Request Kind"

    def previous_tutor(self):
        if self.tutor:
            return f"<p>{self.tutor.first_name} {self.tutor.last_name} ({self.tutor.email})</p>"

    previous_tutor.allow_tags = True

    def request_details(self):
        return """<p><strong>Subjects</strong>: {}</p>
            {} 
            {} 
            {}
            <p><strong>Gender</strong>:{}</p>
            {}
            <p><strong>Student no</strong>: {}</p>""".format(
            ",".join(self.request_subjects),
            f"<p><strong>Hours</strong>: {self.hours_per_day}</p>"
            if self.hours_per_day
            else "",
            f"<p><strong>Days</strong>: {self.available_days}"
            if self.available_days
            else "",
            f"<p><strong>Time of lesson</strong>: {self.time_of_lesson}</p>"
            if self.time_of_lesson
            else "",
            self.get_gender_display(),
            f"<p><strong>Duration</strong>: {self.no_of_month_to_display()}</p>"
            if self.days_per_week
            else "",
            self.no_of_students,
        )

    request_details.allow_tags = True

    @property
    def followup_remarks(self):
        return (self.request_info or {}).get("followup_remarks") or []

    def add_followup_remarks(self, payload):
        all_remarks = self.followup_remarks
        all_remarks.append({**payload, "created": timezone.now().isoformat()})
        lead_status = self.update_lead_status(payload)
        self.save_request_info(
            {"followup_remarks": all_remarks, "lead_status": lead_status}
        )

    @property
    def lead_status(self):
        return (self.request_info or {}).get("lead_status")

    def update_lead_status(self, payload):
        action = payload.get("action")
        if action not in ["won", "lost"]:
            return ""
        return action

    def update_followup_stage(self, payload):
        new_stage = payload.get("followup_stage")
        self.follow_up_stages = new_stage
        self.save()

    def followup_remarks_display(self):
        remarks = "<br />".join([format_remark(x) for x in self.followup_remarks])
        res = f"""<div id="remark-{self.pk}" data-request-id="{self.pk}" data-followup-stage="{self.follow_up_stages}">{remarks}</div>
        """
        # <button class="btn btn-primary btn-sm requestFollowup" data-request-id={obj.pk} data-followup-stage={obj.follow_up_stages} type="button">Update Remark</button>
        return res

    followup_remarks_display.allow_tags = True
    followup_remarks_display.short_description = "followup_remarks"


class RequestTutor(object):
    AGES = (
        ("", "Any Age"),
        ("24", "18 to 24 years"),
        ("30", "25 to 30 years"),
        ("35", "30 to 35 years"),
        ("80", "35 years & above"),
    )
    age = models.CharField(blank=True, null=True, max_length=3, choices=AGES)
    skill = models.CharField(blank=True, null=True, max_length=20)

    def construct_query(self):
        params = urllib.urlencode(
            dict(
                age=self.age or "",
                query=self.skill or "",
                location=self.location(),
                start_rate=int(self.start_rate) or "",
                end_rate=int(self.end_rate) or "",
                gender=self.gender or "",
            )
        )
        site = Site.objects.get_current()
        return '<a href="%s">%s</a>' % (
            "//{}{}?{}".format(site.domain, reverse("search"), params),
            "{}{}?{}".format(site.domain, reverse("search"), params),
        )

    construct_query.allow_tags = True

    def location(self):
        if self.user:
            return self.user.home_address.address
        return ""

    def __str__(self):
        return str(self.user)


class DepositMoney(TimeStampedModel):
    ISSUED = 1
    PAYED = 2
    STATES = ((ISSUED, "issued"), (PAYED, "payed"))
    order = models.CharField(max_length=12, primary_key=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="deposits",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    wallet_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    made_payment = models.BooleanField(default=False)
    status = models.IntegerField(default=ISSUED, choices=STATES)
    request = models.ForeignKey(
        BaseRequestTutor,
        null=True,
        blank=True,
        related_name="payment_deposits",
        on_delete=models.SET_NULL,
    )
    paystack_access_code = models.URLField(blank=True, null=True)

    @property
    def dollar_amount(self):
        return int(get_dollar_rate()["USDNGN"]) * self.amount

    def get_absolute_url(self):
        return reverse("request_payment_page", args=[self.order])

    def discounted(self, amount):
        return amount * Decimal(self.request.percent_discount / 100.0)

    def redirect_url_for_full_payment(self):
        return reverse("request_complete_redirect1", args=[self.order])

    @property
    def amount_to_be_paid(self):
        if self.request.paid_fee:
            return self.amount - self.wallet_amount
        return self.amount + int(settings.PROCESSING_FEE) - self.wallet_amount

    def regenerate_order(self):
        return generate_code(DepositMoney)

    @staticmethod
    def create(user=None, **kwargs):
        """If client is placing the request for the first time create else return an instance of the previous
        creation"""
        order = generate_code(DepositMoney)
        previous_issued = DepositMoney.objects.filter(
            user_id=user.id, status=DepositMoney.ISSUED
        ).first()
        if previous_issued is None:
            obj, is_new = DepositMoney.objects.get_or_create(
                user_id=user.id, status=DepositMoney.ISSUED, order=order
            )
        else:
            obj = previous_issued
            if not obj.order:
                obj.order = order
                obj.save()
        order1 = obj.order
        return DepositMoney.objects.filter(order=order1).first()

    def amount_top_up(self):
        return sum(self.top_up(self.amount))

    def top_up(self, price):
        if 0 < price < Decimal(31000):
            return (price, price * Decimal(0.05))
        if Decimal(60000) < price < Decimal(71000):
            return (price, price * Decimal(0.1))
        return (price, Decimal(0.15) * price)

    def discount_used(self):
        if Decimal(30000) <= self.amount < Decimal(70000):
            return 5
        if Decimal(70000) <= self.amount < Decimal(150_000):
            return 10
        return 15

    def update_wallet_and_notify_admin(self, full_payment):
        from ..tasks import send_mail_to_admin_on_client_payment

        processing_fee = 0
        if not self.request.paid_fee:
            processing_fee = int(settings.PROCESSING_FEE)
            self.request = self.request.pay_processing_fee()
        new_amount = full_payment - processing_fee
        DepositMoney.objects.filter(pk=self.pk).update(
            status=self.PAYED, made_payment=True
        )
        self.user.wallet.top_up2(*(new_amount, self.wallet_amount))
        if self.request:
            if self.request.status != BaseRequestTutor.PAYED:
                self.request.update_payment_and_status(new_amount)
                send_mail_to_admin_on_client_payment.delay(self.pk)
                # self.user.wallet.top_up2(*(new_amount, self.wallet_amount))

    def update_wallet_and_notify_admin2(self, full_payment):
        from ..tasks import send_mail_to_admin_on_client_payment

        processing_fee = 0
        if not self.request.paid_fee:
            processing_fee = int(settings.PROCESSING_FEE)
            self.request.pay_processing_fee()
        new_amount = full_payment - processing_fee
        DepositMoney.objects.filter(pk=self.pk).update(
            status=self.PAYED, made_payment=True
        )
        if self.request.status != BaseRequestTutor.PAYED:
            self.request.update_payment_and_status(new_amount)
        send_mail_to_admin_on_client_payment.delay(self.pk)
        # self.user.wallet.top_up2(*(new_amount, self.wallet_amount))

    def __str__(self):
        return "%s %s" % (self.order, self.amount)

    def process_large_booking(self, amount_in_naira):
        from ..tasks import email_on_large_deposit

        DepositMoney.objects.filter(pk=self.pk).update(
            status=self.PAYED, amount=amount_in_naira
        )
        amount_to_topup = self.top_up(amount_in_naira)
        self.user.wallet.top_up2(*amount_to_topup)
        email_on_large_deposit.delay(self.pk)


def get_dollar_rate():
    X_CHANGE_RATE = "dollar_to_naira"
    try:
        profile = cache.get(X_CHANGE_RATE)
        if profile is None:
            profile = get_exchange_rate()
            cache.set(X_CHANGE_RATE, profile, 60 * 60 * 24)
    except Exception:
        profile = {"USDNGN": 315}
    return profile


def get_exchange_rate():
    v = requests.get(
        settings.CURRENCY_API_URL,
        {
            "access_key": settings.CURRENCY_API_KEY,
            "currencies": "NGN",
            "format": 1,
            "source": "USD",
        },
    )
    return v.json()["quotes"]


class AgentQueryset(models.QuerySet):
    def request_statistics(self, date_range):
        def query_func(o, status="3,6,11"):
            return (
                f"SELECT {o} FROM "
                '"external_baserequesttutor" BR where BR.agent_id = "external_agent".id '
                f"and BR.status in ({status}) and BR.request_type in (1,2,3) and BR.modified between %s and %s"
            )

        total_payed_requests = query_func(
            'COUNT(DISTINCT BR."id") as "total_payed_requests"'
        )
        pending_requests = query_func(
            'COUNT(DISTINCT BR."id") as "pending_requests_count"',
            BaseRequestTutor.PENDING,
        )
        completed_requests = query_func(
            'COUNT(DISTINCT BR."id") as "completed_requests_count"',
            BaseRequestTutor.COMPLETED,
        )
        sum_of_payed_requests = query_func('SUM(BR.budget) as "payed_request_amount"')
        pending_amount = query_func(
            'SUM(BR.budget) as "pending_amount"', BaseRequestTutor.PENDING
        )
        completed_amount = query_func(
            'SUM(BR.budget) as "completed_amount"', BaseRequestTutor.COMPLETED
        )
        return self.annotate(
            total_payed_requests=RawSQL(
                total_payed_requests, (date_range[0], date_range[1])
            ),
            sum_of_payed_requests=RawSQL(
                sum_of_payed_requests, (date_range[0], date_range[1])
            ),
            pending_requests_count=RawSQL(
                pending_requests, (date_range[0], date_range[1])
            ),
            completed_requests_count=RawSQL(
                completed_requests, (date_range[0], date_range[1])
            ),
            pending_amount=RawSQL(pending_amount, (date_range[0], date_range[1])),
            completed_amount=RawSQL(completed_amount, (date_range[0], date_range[1])),
        )

    def booking_statistics(self, date_range):
        query_func = lambda o: (
            f'select {o} from "wallet_wallettransaction" W '
            'left join "bookings_booking" B on W.booking_id = B.order and W.type = 2'
            ' where B.agent_id = "external_agent".id  and W.created BETWEEN %s AND %s'
        )
        total_bookings_count = query_func(
            'COUNT(DISTINCT W.booking_id) as "total_bookings_count"'
        )
        # query_func2 = lambda o: (
        #     f'select {o} from "bookings_bookingsession" BS '
        #     'left join "bookings_booking" B on BS.booking_id = B.order where B.agent_id = "external_agent".id '
        #     "and B.status != 0 and B.created BETWEEN %s AND %s"
        # )
        total_amount_made = query_func('SUM(W.amount) as "total_amount_made"')
        return self.annotate(
            total_bookings_count=RawSQL(
                total_bookings_count, (date_range[0], date_range[1])
            ),
            total_amount_made=RawSQL(total_amount_made, (date_range[0], date_range[1])),
        )

    # def response_annotation(self, date: datetime.datetime):
    #     denied_responses = f'SELECT COUNT(DISTINCT U0."req_id") as "requestsDeclined" FROM "connect_tutor_tutorjobresponse" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id" AND U0."status"=3) WHERE (U0."created" > %s)'
    #     accepted_responses = f'SELECT COUNT(DISTINCT U0."req_id") as "totalJobsAccepted" FROM "connect_tutor_tutorjobresponse" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id" AND U0."status"=2) WHERE (U0."created" > %s)'
    #     not_responsed = f'SELECT COUNT(DISTINCT U0."req_id") as "requestsNotResponded" FROM "connect_tutor_tutorjobresponse" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id") WHERE (U0."created" > %s) AND (U0."status" = 4)'
    #     total_responses = f'SELECT COUNT(DISTINCT U0."req_id") as "totalJobsAssigned" FROM "connect_tutor_tutorjobresponse" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id") WHERE (U0."created" > %s)'
    #     # total_responses = f'SELECT COUNT(DISTINCT U0."id") as "totalJobsAssigned" FROM "external_baserequesttutor" U0 INNER JOIN "auth_user" U1 ON (U1."id" = U0."tutor_id") WHERE (U0."created" > %s)'
    #     return (
    #         self.annotate(
    #             requestsDeclined=RawSQL(denied_responses, (date.isoformat(),))
    #         )
    #         .annotate(totalJobsAccepted=RawSQL(accepted_responses, (date.isoformat(),)))
    #         .annotate(requestsNotResponded=RawSQL(not_responsed, (date.isoformat(),)))
    #         .annotate(totalJobsAssigned=RawSQL(total_responses, (date.isoformat(),)))
    #     )


class Agent(models.Model):
    CLIENT = "client"
    TUTOR = "tutor"
    GROUP = "group"
    CUSTOMER_SUCCESS = "success"
    FOLLOW_UP = "follow_up"
    AGENT_TYPE = (
        (CLIENT, "Client"),
        (TUTOR, "Tutor"),
        (GROUP, "group"),
        (CUSTOMER_SUCCESS, "customer success"),
        (FOLLOW_UP, "follow up"),
    )
    image = models.CharField(_("image"), max_length=20, blank=True)
    phone_number = PhoneNumberField(blank=True)
    email = models.EmailField(_("email address"), blank=False, db_index=True)
    name = models.CharField(
        _("first name"), max_length=40, blank=True, unique=False, db_index=True
    )
    title = models.CharField(_("title"), max_length=40, blank=True)
    next_agent = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL
    )
    type = models.CharField(max_length=10, choices=AGENT_TYPE, default=CLIENT)
    is_last_agent = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL
    )
    agent_dump = JSONField(null=True)

    objects = AgentQueryset.as_manager()

    def __str__(self):
        return self.name

    def __repr__(self):
        return "<Agent %s>" % self.name

    @property
    def image_url(self):
        if self.image:
            return "/static/img/gallery/" + self.image
        return ""

    @property
    def profile_pic(self):
        if self.agent_dump:
            return self.agent_dump.get("image", "")
        return ""

    @property
    def slack_id(self):
        if self.agent_dump:
            return self.agent_dump.get("slack_id", "")
        return ""

    @cached_property
    def hubspot_id(self):
        response = HubspotOwner.objects.filter(email=self.email).first()
        if response:
            return response.hubspot_id
        return None

    @staticmethod
    def get_abuja_agent():
        result = Agent.objects.filter(email="benita@tuteria.com").first()
        return result

    @staticmethod
    def update_agent_order(kind=None):
        kk = kind
        if not kk:
            kk = Agent.CLIENT
        all_agents = Agent.objects.filter(type=kk).all()
        count = len(all_agents)
        no_next = [x for x in all_agents if not x.next_agent]
        if len(no_next) > 0:
            for j, i in enumerate(all_agents):
                current = i
                if j == (count - 1):
                    next_agent = all_agents[0]
                else:
                    next_agent = all_agents[j + 1]
                print(next_agent)
                current.next_agent = next_agent
                current.save()

    @staticmethod
    def get_agent(kind=None):
        kk = kind
        if not kk:
            kk = Agent.CLIENT
        new_agent = None
        Agent.update_agent_order(kind=kind)
        last_agent = Agent.objects.filter(is_last_agent=True, type=kk).first()
        if last_agent:
            new_next_agent = last_agent.next_agent
            Agent.objects.filter(pk=last_agent.pk).update(
                is_last_agent=False,
            )
            if new_next_agent:
                Agent.objects.filter(pk=new_next_agent.pk).update(
                    is_last_agent=True,
                    # next_agent=new_next_agent.get_next_agent()
                )
                # new_next_agent.is_last_agent=True
                new_agent = Agent.objects.get(pk=new_next_agent.pk)
            else:
                new_agent = Agent.objects.get(pk=last_agent.pk).get_next_agent()
                new_agent.is_last_agent = True
                new_agent.save()
        else:
            new_agent = Agent.create_default_user(kind=kk)
        return Agent.objects.get(pk=new_agent.pk)

    def get_next_agent(self):
        new_pk = self.pk
        if self.pk == Agent.objects.filter(type=self.type).last().pk:
            next_agent = Agent.objects.filter(type=self.type).first()
            return next_agent
        next_agent = Agent.objects.filter(pk__gt=new_pk, type=self.type)[0]
        return next_agent

    @staticmethod
    def create_default_user(kind=None):
        kk = kind
        if not kk:
            kk = Agent.CLIENT
        a = Agent.objects.filter(type=kk).last()
        a.is_last_agent = True
        a.next_agent = a
        a.save()
        return a

    @staticmethod
    def get_or_create_agent_with_required_details(user, agent_type):
        try:
            agent = Agent.objects.get(user=user)
        except Agent.DoesNotExist:
            agent = Agent.objects.create(
                name=user.first_name, user=user, email=user.email, type=agent_type
            )
        return agent

    def get_client_agent_stat(self, yestarday_filter, new_time):
        requests = self.baserequesttutor_set
        new_requests = requests.filter(
            created__year=new_time.year,
            created__month=new_time.month,
            created__day=new_time.day,
        )
        today_requests = requests.filter(**yestarday_filter)
        no_day = requests.exclude(**yestarday_filter)
        first_kind = today_requests.filter(
            remarks__icontains="Sent profile to client"
        ).count()
        second_kind = today_requests.filter(request__modified__gte=new_time).count()
        date_string = new_time.strftime("%d-%m-%Y")
        closed_bookings = today_requests.filter(status__in=[BaseRequestTutor.PAYED])
        return {
            "date": str(new_time.date()),
            "name": self.name,
            "email": self.email,
            "no_of_requests": new_requests.exclude(
                status=BaseRequestTutor.ISSUED
            ).count(),
            "worked": second_kind or first_kind,
            "calls_made": today_requests.filter(
                remarks__icontains="Activity Log"
            ).count(),
            "request_missed": no_day.filter(remarks__icontains=date_string)
            .filter(remarks__icontains="To contact client on")
            .count(),
            "number_of_bookings_closed": closed_bookings.aggregate(
                cc=models.Count("pk")
            )["cc"]
            or 0,
            "amount_closed": closed_bookings.aggregate(pc=models.Sum("budget"))["pc"]
            or 0,
        }

    @classmethod
    def get_all_agent_activity(cls, new_time):
        from skills.models import TutorSkill

        yestarday_filter = dict(
            modified__year=new_time.year,
            modified__month=new_time.month,
            modified__day=new_time.day,
        )
        tutor_applicant_filter = {
            "tutor_skill_modified__year": new_time.year,
            "tutor_skill_modified__month": new_time.month,
            "tutor_skill_modified__day": new_time.day,
        }
        tutor_skill = TutorSkill.objects.filter(**yestarday_filter).exclude(
            agent__isnull=True
        )
        skills_detail = [
            f"{x.tutor.get_full_name()} ({x.skill.name}) {x.get_skill_status_verb()} by {x.agent.name}"
            for x in tutor_skill
        ]
        tutor_applicant = UserProfile.objects.filter(**tutor_applicant_filter)
        tutor_applicant_detail = [
            f"{x.user.get_full_name()} {x.get_status_verb()} by {x.agent.name}"
            for x in tutor_applicant
        ]
        skills_detail_string = " \n ".join(skills_detail)
        tutor_applicant_string = " \n ".join(tutor_applicant_detail)
        composed_skill_detail = f"\n\n*Tutor Skill Report:*\n {skills_detail_string}\n"
        composed_tutor_detail = (
            f"\n\n*Tutor Applicant Report:*\n {tutor_applicant_string}\n"
        )
        return {
            "skills_detail": composed_skill_detail,
            "tutor_applicant_detail": composed_tutor_detail,
        }

    def get_tutor_agent_stat(self, yestarday_filter, new_time):
        from skills.models import TutorSkill

        image_denied_filter = {
            "image_denied_on__year": new_time.year,
            "image_denied_on__month": new_time.month,
            "image_denied_on__day": new_time.day,
        }
        tutor_applicant_filter = {
            "tutor_skill_modified__year": new_time.year,
            "tutor_skill_modified__month": new_time.month,
            "tutor_skill_modified__day": new_time.day,
        }
        tutor_applicant = self.userprofile_set.filter(**tutor_applicant_filter)
        approved_applicant = tutor_applicant.filter(
            application_status=UserProfile.VERIFIED
        ).count()
        denied_applicant = tutor_applicant.filter(
            application_status=UserProfile.DENIED
        ).count()
        tutor_skill = self.tutorskill_set.filter(**yestarday_filter)
        skills_approved = tutor_skill.filter(status=TutorSkill.ACTIVE).count()
        skills_denied = tutor_skill.filter(status=TutorSkill.DENIED).count()
        skills_freeze = tutor_skill.filter(status=TutorSkill.FREEZE).count()
        skills_to_modify = tutor_skill.filter(status=TutorSkill.MODIFICATION).count()
        rejected_skill_image = tutor_skill.filter(
            image=None, **image_denied_filter
        ).count()

        return {
            "skills_approved": skills_approved,
            "skills_denied": skills_denied,
            "skills_freezed": skills_freeze,
            "request_to_modify_skills": skills_to_modify,
            "rejected_skill_image": rejected_skill_image,
            "denied_applicant": denied_applicant,
            "approved_applicant": approved_applicant,
        }

    def get_stats(self, modified=None, tutor_report=False):
        new_time = modified or ts_now()
        yestarday_filter = dict(
            modified__year=new_time.year,
            modified__month=new_time.month,
            modified__day=new_time.day,
        )
        if self.type == self.TUTOR or tutor_report:
            context = self.get_tutor_agent_stat(yestarday_filter, new_time)
        elif self.type == self.CLIENT:
            context = self.get_client_agent_stat(yestarday_filter, new_time)
        return context

    def generate_agent_stat_string(self, new_time, tutor_report=False):
        if self.type == self.TUTOR or tutor_report:
            data = self.get_stats(new_time, True)
            text = f'*Agent Name:* {self.name}\n Skills Approved: {data["skills_approved"]}\n Skills Denied: {data["skills_denied"]}\n Skills Freezed: {data["skills_freezed"]}\n Request To Modify Skills: {data["request_to_modify_skills"]}\n Rejected Skill Image: {data["rejected_skill_image"]}\n Denied Applicant: {data["denied_applicant"]}\n Approved Applicant: {data["approved_applicant"]}\n\n'
        elif self.type == self.CLIENT:
            data = self.get_stats(new_time)
            text = f'Agent Name: {self.name}\n Number of Requests: {data["no_of_requests"]} \n Worked: {data["worked"]} \n Calls/Sms/Activity Logged: {data["calls_made"]} \n Amount Closed: {data["amount_closed"]} \n Number of request closed: {data["number_of_bookings_closed"]} \n\n'
        return text

    @classmethod
    def daily_upload(cls, modified=None, tutor_agent=False):
        # result = []
        new_time = modified or ts_now()
        new_time = new_time - relativedelta(days=1)
        result = f"*Report Date:* {new_time.date()} \n\n"
        if tutor_agent:
            all_agent_activity = Agent.get_all_agent_activity(new_time)
            for u in cls.objects.filter():
                result += f"{u.generate_agent_stat_string(new_time, True)} "
            result += f'\n{all_agent_activity["skills_detail"]} \n{all_agent_activity["tutor_applicant_detail"]} :+1::skin-tone-6:'
            response = requests.post(
                settings.TUTOR_ACTIVITY_WEBHOOK, json={"agent": result}
            )
        else:
            for u in cls.objects.filter(type=cls.CLIENT):
                result += f"{u.generate_agent_stat_string(new_time)} "
            result += ":+1::skin-tone-6:"
            response = requests.post(
                settings.NOTIFY_ACTIVITY_WEBHOOK, json={"agent": result}
            )
        if response.status_code < 400:
            pass


class Patner(models.Model):
    name = models.CharField(_("name"), max_length=70)
    email = models.EmailField()
    company_name = models.CharField(_("name of company"), max_length=70)
    state = models.CharField(
        max_length=50,
        choices=BaseRequestTutor.NIGERIAN_STATES,
        blank=True,
        db_index=True,
    )
    body = models.TextField(_("body"))


class PricingDisplay(object):
    def __init__(self, request, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.online = request.request_type == 3
        if not self.online:
            self.text = self.atext.format(self.pre_text)
            self.description = self.adescription.format(self.pre_text)
        else:
            self.text = self.atext.format(self.b_text)
            self.description = self.adescription.format(self.b_text)

    def get_text(self):
        return self.text

    def get_amount(self):
        return self.amount

    def discounted_amount(self):
        return self.amount * Decimal((1 - self.discount))

    def get_description(self):
        return self.description

    def get_discount(self):
        return self.get_amount() * Decimal((1 - self.discount))

    def get_paypal(self):
        return self.discounted_amount() / Decimal(get_dollar_rate()["USDNGN"])

    def output(self):
        return dict(
            sub_text=self.sub_text,
            text=self.get_text(),
            amount=self.get_amount(),
            discount=self.get_discount(),
            tag=self.tag,
            description=self.get_description(),
            color=self.color,
            diff=self.diff,
            real_price=self.discounted_amount(),
            paypal=self.get_paypal(),
        )


import pytz


@receiver(hubspot_action_after_message_webhook)
def signal_called(sender, **kwargs):
    data = kwargs.get("params")
    h = PriceDeterminator.get_rates()
    if h.use_hubspot:
        h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))
        all_contacts = BaseRequestTutor.objects.follow_up()
        for o in all_contacts:
            h_instance.send_profile_to_agent(
                o.agent.hubspot_id,
                o.hubspot_deal_id,
                "Client has {} the email sent below".format(data["event"]),
            )
            if data["event"] == "opened":
                current_time = datetime.datetime.utcfromtimestamp(
                    float(data["timestamp"])
                )
                current_time = current_time.replace(tzinfo=pytz.utc)
                time_elapsed = (current_time - o.modified).days
                if time_elapsed >= 2:
                    h_instance.follow_up_contacts(
                        o.agent.hubspot_id, [o.hubspot_deal_id], timezone.now()
                    )
                    o.sent_reminder = True
                    o.save()
