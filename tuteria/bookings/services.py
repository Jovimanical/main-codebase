import pdb
import json
import datetime

from decimal import Decimal
from django.urls import reverse
from django.conf import settings
from django.http import Http404
from skills.models import TutorSkill
import bookings as b
import external as e
import users as u
import skills as s
from rewards.models import Milestone
from config import signals
import requests


class TutorSkillService:
    @classmethod
    def get_skill_name(cls, ts):
        """Name of subject assigned to tutorskill"""
        return ts.skill.name

    @classmethod
    def get_ts(cls, ts):
        if ts:
            return ts
        return None

    @classmethod
    def get_tutor_skill(cls, ts):
        """Instance of the tutorskill"""
        if ts:
            return ts.skill
        return None

    @classmethod
    def get_rq_discount(cls, rq, tutor):
        """Discount on the first subject in request"""
        skill = TutorSkill.objects.filter(
            skill__name__istartswith=rq.request_subjects[0], tutor=tutor
        ).first()
        return skill.discount

    @classmethod
    def get_skill_for_request(cls, u):
        """The requested subjects from a request instance"""
        if u:
            return u.request_subjects
        return None

    @classmethod
    def owner_of_skill(cls, ts):
        return ts.tutor

    @classmethod
    def get_price(cls, ts):
        return ts.price

    @classmethod
    def get_discount(cls, ts):
        return ts.discount


def construct_url(url, _type="client"):
    options = {"client": "users:user_bookings", "tutor": "users:tutor_bookings"}
    return "%s?filter_by=%s" % (reverse(options[_type]), url)


class BookingService(object):
    def __init__(self, email, tutor=False):
        if tutor:
            self.bookings = b.models.Booking.objects.filter(tutor__email=email)
            self._type = "tutor"
        else:
            self._type = "client"
            self.bookings = b.models.Booking.objects.filter(user__email=email)

    @classmethod
    def create_booking(cls, ts, user, request_json, **kwargs):
        v = request_json[u"booking"]
        booking_type = request_json[u"booking_type"]
        booking_level = 75 if ts.tutor.is_premium else 70
        booking_inst = b.models.Booking.create(
            ts=ts,
            user=user,
            booking_type=booking_type,
            booking_level=booking_level,
            witholding_tax=5,
            **kwargs
        )
        booking_form = b.forms.BookingFormset(
            v, instance=booking_inst, prefix="session"
        )
        if booking_form.is_valid():
            for form in booking_form.forms:
                form.save()
            return booking_inst.order, None
        return None, booking_form

    def client_booking_status(self, key):
        options = {
            "new": lambda x: x.new_bookings(),
            "awaiting_review": lambda x: x.pending_review(),
            "cancelled": lambda x: x.cancelled(),
            "pending": lambda x: x.pending(),
            "completed": lambda x: x.closed(),
        }
        return options[key](self.bookings)

    def tutor_booking_status(self, key):
        options = {
            "new": lambda x: x.new_bookings(),
            "delivered": lambda x: x.delivered(),
            "cancelled": lambda x: x.cancelled(),
            "pending": lambda x: x.pending(),
            "completed": lambda x: x.closed(),
        }
        return options[key](self.bookings)

    def tutor_data(self):
        url_type = ["new", "delivered", "completed", "pending", "cancelled"]
        text = ["Upcoming", "Delivered", "Completed", "Pending", "Cancelled"]
        filter_text = ["Upcoming", "Delivered", "Completed", "Pending", "Cancelled"]
        mobile_text = ["New", "Del.", "Compl.", "Pend.", "Canc."]
        return url_type, text, filter_text, mobile_text

    def client_data(self):
        url_type = ["new", "awaiting_review", "completed", "pending", "cancelled"]
        text = ["Upcoming", "Awaiting<br>Review", "Completed", "Pending", "Cancelled"]
        filter_text = [
            "Upcoming",
            "Awaiting Review",
            "Completed",
            "Pending",
            "Cancelled",
        ]
        mobile_text = ["New", "AR", "Compl.", "Pend.", "Canc."]
        return url_type, text, filter_text, mobile_text

    def get_booking_view_skills(self, filter_by="new", page=1):
        options = {
            "client": lambda: self.client_data(),
            "tutor": lambda: self.tutor_data(),
        }
        options2 = {
            "client": lambda: self.client_booking_status,
            "tutor": lambda: self.tutor_booking_status,
        }
        url_type, text, filter_text, mobile_text = options[self._type]()
        u = [
            dict(
                url=construct_url(o, self._type),
                url_text=text[k],
                filter_text=filter_text[k],
                mobile_text=mobile_text[k],
                count=len(options2[self._type]()(o)),
            )
            for k, o in enumerate(url_type)
        ]
        bookings = options2[self._type]()(filter_by)

        page_object, bookings = s.services.PaginatorObject().paginate(
            _list=bookings, page=page
        )
        return {"urls": list(u), "bookings": bookings, "object_list": bookings}


def get_serializers():
    from bookings.api import BookingSessionSerializer

    return BookingSessionSerializer


class SingleBookingService(object):
    def __init__(self, pk, **kwargs):
        try:
            self.instance = b.models.Booking.objects.get(pk=pk)
        except b.models.Booking.DoesNotExist:
            raise Http404

    def get_tutor(self):
        if self.instance.tutor:
            return self.instance.tutor
        return self.instance.ts.tutor

    def get_sessions(self, serialized=False, status="all"):
        queryset = self.instance.bookingsession_set
        options = {
            "all": lambda: queryset.all(),
            "can_be_cancelled": lambda: queryset.can_be_cancelled(),
        }
        data = options[status]()
        if serialized:
            w = get_serializers()(data, many=True).data
            return w
        return data

    def cancel_sessions(self, request):
        bb = json.loads(request.body)
        b_sessions = bb.get("sessions")
        reason = bb.get("reason")
        count = len(self.get_sessions())
        all_bookings_cancelled = (count == len(b_sessions)) and count >= 1
        if all_bookings_cancelled:
            self.instance.cancel_booking()
            return True, None, self.get_tutor_absolute_url()
        else:
            to_send_mail = False if count == 1 else True
            for session in b_sessions:
                BookingSessionService(session.get("id")).cancel_session(
                    reason, to_send_mail
                )
        return False, b_sessions, self.get_tutor_absolute_url()

    def tutor_cancel_booking(self, request):
        form = b.forms.RequestToCancelForm(request.POST, instance=self.instance)
        if form.is_valid():
            inst = form.save(commit=False)
            inst.tutor_request_to_cancel()
            return inst.order, self.get_tutor_absolute_url()
        return False, self.get_tutor_absolute_url()

    def client_responds_to_cancellation(self):
        self.instance.client_response_to_tutor_request_to_cancel()
        return self.get_tutor_absolute_url()

    def get_tutor_absolute_url(self):
        return self.instance.get_tutor_absolute_url()

    def can_book(self, request):
        if request.user == self.instance.user:
            return True
        return (
            request.user.is_authenticated
            and request.session.get("order_id") == self.instance.order
        )

    def get_user_service(self, email=None):
        the_email = email or self.instance.user.email
        return u.services.UserService(email=the_email)

    def admin_actions_on_booking(self, request_pk=None, user_email=None, **kwargs):
        user = None
        if request_pk:
            user = e.services.RequestService.notify_client(request_pk, self.instance)
        if user_email:
            user = self.get_user_service(user_email).user
        if user:
            self.instance.user = user
            self.instance.save()

    def has_reviewed_how_tutoring_works(self):
        reward2 = Milestone.get_milestone(Milestone.HOW_TUTORING_WORKS)
        if not self.instance.get_tutor.milestones.has_milestone(reward2):
            return reward2.get_absolute_url() + "?next=" + self.get_tutor_absolute_url()
        return None

    def is_tutor_viewing_page(self, user):
        return self.instance.get_tutor.pk == user.id

    @classmethod
    def weekday_sessions(self, sessions):
        return sorted(sessions, key=lambda x: (x.start.weekday(),))

    @classmethod
    def month_sessions(self, sessions):
        return sorted(sessions, key=lambda x: (x.start.month,))

    def booking_view_context(self, request):
        sessions = self.get_sessions()
        return {
            "bs_service": self,
            "can_book": self.can_book(request),
            "last_session": list(sessions)[-1],
            "sessions": self.weekday_sessions(sessions),
            "first_session": sessions[0],
            "month_sessions": self.month_sessions(sessions),
        }

    def after_review_given(self, form, _type="client", request=None):
        if _type == "client":
            rating = form.save(self.instance, booking_type=1)
            self.instance.client_confirmed(rating)
        else:
            signals.tutor_closes_booking.send(
                sender=self.__class__,
                booking_order=self.instance,
                form=form,
                request=request,
            )

    def construct_service_dict(self):
        user_fields = ["email", "first_name", "last_name"]
        user_dict = {x: evaluate_decimal(self.instance.user, x) for x in user_fields}
        tutor_dict = {x: evaluate_decimal(self.instance.tutor, x) for x in user_fields}
        user_dict.update(username=self.instance.user.slug)
        tutor_dict.update(username=self.instance.tutor.slug)
        skill_dict = dict(
            status=self.instance.ts.status, skill=self.instance.ts.skill.name
        )
        skill_dict.update(tutor=tutor_dict)
        bookingsession_dict = [
            "start",
            "price",
            "student_no",
            "issue",
            "status",
            "cancellation_reason",
            "no_of_hours",
        ]
        bs_func = lambda o: {x: evaluate_decimal(o, x) for x in bookingsession_dict}
        bs = [bs_func(a) for a in self.instance.bookingsession_set.all()]
        wallet_fields = [
            "order",
            "status",
            "paid_tutor",
            "first_session",
            "last_session",
            "reviewed",
            "wallet_amount",
            "made_payment",
            "delivered_on",
            "created",
            "modified",
        ]
        wallet_dict = {x: evaluate_decimal(self.instance, x) for x in wallet_fields}
        wallet_dict.update(
            user=user_dict, tutor=tutor_dict, ts=skill_dict, booking_sessions=bs
        )
        return wallet_dict

    def save_booking_to_service(self):
        url = settings.BOOKING_SERVICE_URL + "/booking/"
        response = requests.post(url, json=self.construct_service_dict())
        return response

    @classmethod
    def save_all_booking_instances(cls):
        s = b.models.Booking.objects.all()
        gen = (
            SingleBookingService(o.pk)
            for o in s
            if o.user != "gbozee@example.com" and o.ts.tutor != "gbozee@example.com"
        )
        for t in gen:
            response = t.save_booking_to_service()
            if response.status_code >= 400:
                print(response.json())
            yield t


def evaluate_decimal(obj, field):
    v = getattr(obj, field)
    if isinstance(v, Decimal):
        v = int(v)
    if isinstance(v, datetime.datetime):
        v = v.isoformat()
    return v


class BookingSessionService(object):
    def __init__(self, pk, **kwargs):
        self.instance = b.models.BookingSession.objects.get(pk=pk)

    def submit_session(self, request):
        form = b.forms.SessionSubmissionForm(request.POST, instance=self.instance)
        if form.is_valid():
            return form.save()
        return None

    def get_booking_url(self):
        return self.instance.booking.get_tutor_absolute_url()

    def cancel_session(self, reason, to_send_mail):
        self.instance.cancel_session(reason, send_mail=to_send_mail)

    @classmethod
    def total_tutor_hours(self):
        return str(int(b.models.BookingSession.objects.total_no_of_hours_taught()))
