import datetime
import os
import random
from collections import Counter
from decimal import Decimal
from queue import Queue
from threading import Thread

import pytz
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.urls import reverse
from django.db import models, connection
from django.db.models.fields import Field
from django.dispatch import receiver
from django.utils import timezone
from django.utils.functional import cached_property
from django_extensions.db.models import TimeStampedModel
import requests

from config.signals import successful_payment, tutor_closes_booking
from config.utils import Postpone as Queuer
from config.utils import BookingDetailMixin, generate_code
from hubspot import HubspotAPI
from hubspot.models import HubspotContact, HubspotOwner, HubspotStorage
from rewards.models import Milestone
from skills.models import TutorSkill
from users.levels import TuteriaLevel
from users.models import User, UserMilestone, UserProfile
from users.policy import Policy
from config.utils import generate_code, BookingDetailMixin, Postpone
from hubspot import HubspotAPI
from hubspot.models import HubspotContact, HubspotOwner, HubspotStorage
from wallet.models import WalletTransactionType, WalletTransaction

from ..mixins import BookingMixin, BookingSessionMixin

# from referrals.models import Referral
from ..services import TutorSkillService

if os.getenv("DJANGO_CONFIGURATION") == "StagingDev":
    DEFAULT_MAIL = "gbozee@gmail.com"
else:
    DEFAULT_MAIL = None


@Field.register_lookup
class NotEqual(models.Lookup):
    lookup_name = "ne"

    def as_sql(self, compiler, connection):
        lhs, lhs_params = self.process_lhs(compiler, connection)
        rhs, rhs_params = self.process_rhs(compiler, connection)
        params = lhs_params + rhs_params
        return "%s <> %s" % (lhs, rhs), params


class BookingSessionQuerySet(models.QuerySet):
    def cancelled(self):
        return self.filter(status=BookingSession.CANCELLED)

    def completed(self):
        return self.filter(status=BookingSession.COMPLETED)

    def not_taught(self):
        return self.filter(start__lt=timezone.now())

    def total_amount(self):
        return self.aggregate(t_sum=models.Sum("price"))["t_sum"] or 0

    def not_started(self):
        return self.filter(status=BookingSession.NOT_STARTED)

    def squash_sessions(self, booking_list, booking, delete=False):
        sessions = self.filter(booking_id__in=booking_list).filter(
            status=BookingSession.COMPLETED
        )
        total_amount = sessions.aggregate(
            summ=models.Sum("price"), hrs=models.Sum("no_of_hours")
        )
        # updating the session that would be attached to the squashed booking
        session = sessions.first()
        aggr = BookingSession.objects.aggregate(mx=models.Max("pk"))
        session.id = aggr["mx"] + 1
        session.price = total_amount["summ"]
        session.booking = booking
        session.no_of_hours = total_amount["hrs"]
        session.save()
        # updating booking info
        booking.first_session = session.start
        booking.last_session = sessions.last().end
        booking.squashed_no = len(set(booking_list))
        booking.save()
        if delete:
            Booking.objects.filter(pk__in=booking_list).delete()
            sessions.delete()

    def all_sessions(self, booking):
        """
        Get the list of all the sessions for the group lessons.
        NB: this fetches the sessions of the parent booking since each session has a reference
        to the individual booking"""
        if booking.is_group:
            instance = BookingSession.group_bookings.through.objects.filter(
                booking=booking
            ).values_list("bookingsession_id", flat=True)
            return self.filter(pk__in=list(instance))
        instance = booking.bookings.values_list("pk", flat=True)
        return self.filter(booking_id__in=instance)


class BookingSessionManager(models.Manager):
    def get_queryset(self):
        return BookingSessionQuerySet(self.model, using=self._db)

    def squash_sessions(self, *args, **kwargs):
        return self.get_queryset().squash_sessions(*args, **kwargs)

    def last_session(self):
        return self.get_queryset().order_by("start").last()

    def not_taught(self):
        return self.get_queryset().not_taught()

    def not_started(self):
        return self.get_queryset().not_started()

    def total_no_of_hours_taught(self):
        return (
            self.get_queryset()
            .filter(status=BookingSession.COMPLETED)
            .aggregate(sum=models.Sum("no_of_hours"))["sum"]
        )

    def first_session(self):
        return self.get_queryset().order_by("start").first()

    def completed(self):
        return self.get_queryset().completed()

    def cancelled(self):
        return self.get_queryset().cancelled()

    def valid_for_payment(self):
        return self.get_queryset().exclude(
            status__in=[BookingSession.NOT_STARTED, BookingSession.STARTED]
        )

    def can_be_cancelled(self):
        now = datetime.datetime.now()
        return (
            self.get_queryset()
            .filter(start__gt=now)
            .exclude(status__in=[BookingSession.CANCELLED, BookingSession.COMPLETED])
        )

    def sessions_in_month_and_year(self, tutor, month, year):
        return (
            self.get_queryset()
            .filter(booking__tutor=tutor)
            .filter(start__month=month, start__year=year)
        )

    def all_sessions(self, booking):
        return self.get_queryset().all_sessions(booking)


class BookingSession(BookingSessionMixin, TimeStampedModel):
    NOT_STARTED = 1
    STARTED = 2
    COMPLETED = 3
    CANCELLED = 5
    SESSION_STATUS = (
        (NOT_STARTED, "not started"),
        (STARTED, "started"),
        (COMPLETED, "completed"),
        (CANCELLED, "cancelled"),
    )

    CANCELLATION_REASONS = [
        ("", "Select Reason"),
        ("change_location", "Changing Location"),
        ("no_need_for_lesson", "Don't need lesson anymore"),
        ("dislike_tutor", "Didn't like the tutor"),
        ("family_inconvenience", "Family Inconvenience (e.g Illness)"),
        ("tutor_no_showing_up", "Tutor didn't show up"),
    ]

    IssueChoices = (
        ("", "Select Issue"),
        ("more_hours", "I taught more than the booked hours"),
        ("client_not_cooperative", "Client was not cooperative"),
        ("late_lesson", "Lesson did not start on time"),
    )
    start = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    student_no = models.IntegerField(default=1)
    no_of_hours = models.DecimalField(max_digits=5, decimal_places=2)
    booking = models.ForeignKey(
        "bookings.Booking", null=True, on_delete=models.SET_NULL
    )
    issue = models.CharField(
        max_length=15, choices=IssueChoices, default="", blank=True
    )
    status = models.IntegerField(default=NOT_STARTED, choices=SESSION_STATUS)
    cancellation_reason = models.CharField(
        max_length=20, null=True, blank=True, choices=CANCELLATION_REASONS
    )
    group_bookings = models.ManyToManyField("bookings.Booking", related_name="sessions")
    objects = BookingSessionManager()

    class Meta:
        ordering = ["start"]

    @property
    def day_and_time(self):
        return {
            "day": self.start.strftime("%A"),
            "time": self.start.strftime("%-I:%-M %p"),
            "time_no": int(self.start.strftime("%-H")),
        }

    @property
    def end(self):
        import math

        dec, i = math.modf(self.no_of_hours)
        return self.start + relativedelta(hours=int(i), minutes=60.0 * dec)

    @property
    def weekday(self):
        return self.start.strftime("%A")

    @property
    def month(self):
        return self.start.strftime("%B")

    def is_due(self):
        return self.end < timezone.now()

    def possible_status(self):
        return self.status == self.STARTED or self.status == self.NOT_STARTED

    def status_class(self):
        if self.status == self.NOT_STARTED or self.status == self.STARTED:
            return "default"
        if self.status == self.COMPLETED:
            return "success"
        if self.status == self.CANCELLED:
            return "danger"

    def cancel_session(self, reason="", send_mail=True):
        """Actions taken when booking sessions are cancelled or rescheduled"""

        from .. import tasks

        # sends sms and email to tutor notifying him of the reschedule or
        # cancellation
        if send_mail:
            tasks.send_mail_on_single_session_cancelled.delay(self.pk, DEFAULT_MAIL)
            # updates tutor calendar
        self.update_calendar()
        # reward penalty for cancellation
        reward2 = Milestone.get_milestone(Milestone.CANCEL_SESSION)
        self.booking.get_user.tuteria_points += reward2.score
        self.booking.get_user.save()
        self.status = self.CANCELLED
        self.cancellation_reason = reason
        self.save()
        if not send_mail:
            self.booking.cancel_booking(single=True)

    @property
    def duration(self):
        return (self.end - self.start).seconds / 3600

    @property
    def duration_string(self):
        return "{} - {}".format(
            self.start.strftime("%I%p").lstrip("0"),
            self.end.strftime("%I%p").lstrip("0"),
        ).lower()

    def __str__(self):
        return "Booking session on %s" % self.start.strftime("%d-%m-%Y")


class BookingQuerySet(models.QuerySet):
    def owning(self):
        return self

    def half_way_done(self):
        qs = (
            self.active()
            .filter(remark__icontains="New Client")
            .active()
            .annotate(days_left=(models.F("last_session") - timezone.now()))
        )
        qs = [bk for bk in qs if bk.days_left.days == 14]  # Not a queryset
        return qs

    def squashed(self):
        """Returns squashed booking instance for a user
        Returns:
                Booking -- The squashed instance of the booking if it exists
        """
        return self.filter(squashed=True).completed().first()

    def squash_tutor_bookings(self, user, tutor, delete=False, **kwargs):
        from reviews.models import SkillReview

        queryset = self.completed().filter(tutor=tutor).exclude(squashed=True)
        if user:
            queryset = queryset.filter(user=user)
        if kwargs.get("end_date"):
            queryset = queryset.filter(first_session__lt=kwargs.get("end_date"))
        bookings = queryset
        booking_ids = list(bookings.values_list("order", flat=True))
        new_booking = bookings.first()
        if new_booking:
            new_booking.order = generate_code(Booking)
            new_booking.squashed = True
            new_booking.save()
            new_booking.wallet_transactions.squash_transactions(
                new_booking, booking_ids, **kwargs
            )
            SkillReview.objects.filter(booking_id__in=booking_ids).update(
                booking_id=new_booking
            )
            BookingSession.objects.squash_sessions(booking_ids, new_booking, delete)

    def has_old_booking(self, year, month):
        date = timezone.now()
        if year:
            date = datetime.datetime(int(year), 12, 1)
            if month:
                date = datetime.datetime(int(year), int(month), 1)
        return (
            self.exclude(
                status__in=[Booking.CANCELLED, Booking.INITIALIZED, Booking.PENDING]
            )
            .filter(created__lt=date)
            .values("user_id")
            .order_by("user_id")
            .distinct("user_id")
            .values_list("user_id", flat=True)
        )

    def squash_bookings(self, user=None, delete=False, **kwargs):
        queryset = self.filter(user=user) if user else self
        all_tutors = queryset.values_list("tutor_id", flat=True)
        for tutor in set(all_tutors):
            self.squash_tutor_bookings(user, tutor, delete=delete, **kwargs)

    def bulk_squash_bookings(self, end_year=None, sync=False):
        user_ids = set(self.values_list("user_id", flat=True))
        user_instances = User.objects.filter(pk__in=user_ids)

        def callback(o):
            end_date = None
            if end_date:
                end_date = datetime.datetime(end_year, 12, 31)
            o.orders.squash_bookings(delete=True, end_date=end_date)
            if not sync:
                connection.close()

        if sync:
            for o in user_instances:
                callback(o)
        else:
            queue = Queuer(callback, user_instances, thread_count=len(user_instances))
            queue()

    def get_reviews(self):
        return self.annotate(
            reviews_count=models.Sum(
                models.Case(
                    models.When(reviews_given__booking_id=models.F("order"), then=1),
                    output_field=models.IntegerField(),
                )
            )
        )

    def for_admin(self):
        instance = self.exclude(models.Q(is_group=True) | models.Q(ts=None))
        return (
            instance.annotate(session_total=models.Sum("bookingsession__price"))
            .annotate(
                cccc=models.Count("bookingsession", distinct=True),
                # reviews_count=models.Count('reviews_given', distinct=True)
            )
            .select_related("tutor", "user", "ts__skill")
            .prefetch_related("reviews_given")
        )

    # .select_related('tutor', 'user','ts__skill')

    def new_bookings(self):
        # now = datetime.datetime.now(tz=pytz.utc)
        # return self.filter(status=Booking.SCHEDULED,
        #                    first_session__gt=now).exclude(user=None)
        return self.filter(status=Booking.SCHEDULED).exclude(user=None)

    def active(self):
        now = timezone.now()
        return self.filter(status=Booking.SCHEDULED, first_session__lte=now).exclude(
            user=None
        )

    def active_b(self):
        return self.filter(status=Booking.SCHEDULED)

    def get_uncompleted_bookings(self):
        return self.filter(status=Booking.INITIALIZED, made_payment=False)

    def get_bookings_within_the_hour(self):
        now = timezone.now()
        # import pdb
        # pdb.set_trace()
        return self.filter(
            first_session__year=now.year,
            first_session__month=now.month,
            first_session__day=now.day,
            first_session__hour=(now.hour + 3) % 24,
        )

    def get_booking_ending_soon(self, days=6):
        today = datetime.date.today()
        return self.filter(
            last_session__range=(
                today + datetime.timedelta(days=days),
                today + datetime.timedelta(days=days + 1),
            )
        )

    def get_booking_just_started(self, days=6):
        today = datetime.date.today()
        return self.filter(
            first_session__range=(
                today + datetime.timedelta(days=days),
                today + datetime.timedelta(days=days + 1),
            )
        )

    def delivered(self):
        return self.filter(status=Booking.DELIVERED).exclude(user=None)

    def pending_review(self):
        return self.filter(status=Booking.DELIVERED, reviewed=False)

    def pending(self):
        return self.filter(status=Booking.PENDING)

    def cancelled(self):
        return self.filter(status=Booking.CANCELLED).exclude(user=None)

    def closed(self):
        return self.filter(status=Booking.COMPLETED, paid_tutor=True).exclude(user=None)

    def by_tutor(self, tutor):
        return self.filter(tutor=tutor).exclude(user=None)

    def repeat_booking(self, user, is_tutor=False):
        if is_tutor:
            query = self.filter(tutor=user)
        else:
            query = self.filter(user=user)
        return query

    def bank_based(self):
        return self.filter(status=Booking.BANK_TRANSFER, made_payment=False)

    def with_reviews(self):
        return self.annotate(rc=models.Count("reviews"))

    def canceled_by_tutors(self):
        return self.filter(status=Booking.PENDING).exclude(cancel_initiator=None)

    def bookings_above_15000(self):
        return self.filter()

    def completed(self):
        return self.filter(status=Booking.COMPLETED)

    def clients_with_different_count(self, ids):
        return self.filter(user_id__in=ids).different_client_count()

    def different_client_count(self):
        return (
            self.completed()
            .values("user")
            .annotate(user_count=models.Count("user"))
            .exclude(user_count__lt=1)
            .count()
        )

    def recurrent_booking_count(self):
        return self.recurrent_booking().aggregate(
            sum=models.Sum("user_count"), count=models.Count("user_count")
        )

    def recurrent_booking(self):
        """
        Total number of recurrent booking
        :returns a queryset of the number of users per booking
        """
        return (
            self.exclude(status=Booking.CANCELLED)
            .values("user")
            .annotate(user_count=models.Count("user"))
            .exclude(user_count__lt=2)
        )

    def repeat_booking_count(self):
        return self.recurrent_booking().aggregate(
            sum=models.Sum("user_count"), count=models.Count("user_count")
        )

    def has_repeat_client(self, unique_result=5):
        from collections import Counter

        uu = (
            self.exclude(status=Booking.CANCELLED)
            .values("user")
            .annotate(user_count=models.Count("user"))
        )
        counter = Counter()
        for o in uu:
            counter[o["user"]] += 1
        maximum = max(counter.values()) if counter.values() else 0
        return maximum > 1 and len(counter.values()) > unique_result

    def get_no_of_hours_taught(self):
        """Get the total number of hours taught"""
        return (
            self.filter(bookingsession__status=BookingSession.COMPLETED)
            .aggregate(nh=models.Sum("bookingsession__no_of_hours"))
            .get("nh")
            or 0
        )

    def get_total_price_on_all_bookings(self):
        return (
            self.annotate(tp=models.Sum("bookingsession__price"))
            .order_by("-pk")
            .filter(tp__gte=Decimal(15000))
            .first()
        )

    def async_action(self, action, thread_count=10):
        def callback(u):
            action(u)
            connection.close()

        queue = Postpone(callback, self.all(), thread_count=thread_count)
        queue()

    def scheduled(self):
        return self.filter(status=Booking.SCHEDULED)

    def session_count(self):
        return (
            self.annotate(session_count=models.Count("bookingsession"))
            .values("session_count")
            .aggregate(sc=models.Sum("session_count"))["sc"]
            or 0
        )


class BookingManager(models.Manager):
    def get_queryset(self):
        return BookingQuerySet(self.model, using=self._db)

    def bulk_squash_bookings(self, *args, **kwargs):
        return self.get_queryset().bulk_squash_bookings(*args, **kwargs)

    def squash_bookings(self, *args, **kwargs):
        return self.get_queryset().squash_bookings(*args, **kwargs)

    def has_old_booking(self, *args, **kwargs):
        return self.get_queryset().has_old_booking(*args, **kwargs)

    def first_booking_above_15000(self):
        return self.get_queryset().get_total_price_on_all_bookings()

    def clients_with_different_count(self, ids):
        return self.get_queryset().clients_with_different_count(ids)

    def repeat_booking_count(self):
        result = self.get_queryset().repeat_booking_count()
        count = result.get("count") or 0
        counter = result.get("sum") or 0
        return counter - count

    def has_repeat_client(self, unique_result):
        return self.get_queryset().has_repeat_client(unique_result=unique_result)

    def completed(self):
        return self.get_queryset().completed()

    def scheduled(self):
        return self.get_queryset().scheduled()

    def different_client_count(self):
        return self.get_queryset().different_client_count()

    def get_initialized_bookings(self):
        return self.get_queryset().filter(status=Booking.SCHEDULED)

    def hours_taught(self):
        return (
            self.get_queryset()
            .filter(bookingsession__status=BookingSession.COMPLETED)
            .values_list("bookingsession__no_of_hours", flat=True)
        )

    def get_no_of_hours_taught(self):
        return self.get_queryset().get_no_of_hours_taught()

    def get_bookings_within_the_hour(self):
        return self.get_queryset().get_bookings_within_the_hour()

    def repeat_booking(self, user, is_tutor=False):
        return self.get_queryset().repeat_booking(user, is_tutor)

    def get_uncompleted_bookings(self):
        # return self.get_queryset().get_uncompleted_bookings(days)
        return self.get_queryset().get_uncompleted_bookings()

    def previously_paid_bookings(self):
        return self.get_queryset().filter(made_payment=True).count()

    def new_bookings(self):
        return self.get_queryset().new_bookings()

    def active(self):
        return self.get_queryset().active()

    def active_b(self):
        return self.get_queryset().active_b()

    def pending(self):
        return self.get_queryset().pending()

    def delivered(self):
        return self.get_queryset().delivered()

    def cancelled(self):
        return self.get_queryset().cancelled()

    def closed(self):
        return self.get_queryset().closed()

    def by_tutor(self, tutor):
        return self.get_queryset().by_tutor(tutor)

    def pending_review(self):
        return self.get_queryset().pending_review()

    def bank_based(self):
        return self.get_queryset().bank_based()

    def canceled_by_tutors(self):
        return self.get_queryset().canceled_by_tutors()


class Booking(BookingDetailMixin, BookingMixin, TimeStampedModel):
    has_run = False
    HOURLY = 1
    MONTHLY = 2
    BOOKING_TYPE = ((HOURLY, "hourly"), (MONTHLY, "monthly"))
    order = models.CharField(max_length=12, primary_key=True, db_index=True)
    ts = models.ForeignKey(
        "skills.TutorSkill",
        on_delete=models.SET_NULL,
        related_name="bookings",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="orders",
        null=True,
        blank=True,
    )
    booking_type = models.IntegerField(choices=BOOKING_TYPE, default=HOURLY)
    status = models.IntegerField(
        choices=BookingMixin.BOOKING_STATUS, default=BookingMixin.INITIALIZED
    )
    paid_tutor = models.BooleanField(default=False)
    message_to_tutor = models.TextField(blank=True, null=True)
    first_session = models.DateTimeField(null=True, blank=True)
    last_session = models.DateTimeField(null=True, blank=True)
    reviewed = models.BooleanField(default=False)
    calendar_updated = models.BooleanField(default=False)
    dealId = models.IntegerField(blank=True, null=True)
    cancel_initiator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="bookings_cancelled",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    cancellation_message = models.TextField(null=True, blank=True)
    wallet_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    made_payment = models.BooleanField(default=False)
    delivered_on = models.DateTimeField(null=True, blank=True)
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="t_bookings",
        null=True,
        blank=True,
    )
    remark = models.TextField(null=True, blank=True)
    booking_level = models.IntegerField(
        default=70,
        choices=(
            (35, "35%"),
            (50, "50%"),
            (51, "51%"),
            (52, "52%"),
            (53, "53%"),
            (54, "54%"),
            (55, "55%"),
            (56, "56%"),
            (58, "57%"),
            (59, "59%"),
            (60, "60%"),
            (61, "61%"),
            (62, "62%"),
            (63, "63%"),
            (64, "64%"),
            (65, "65%"),
            (66, "66%"),
            (67, "67%"),
            (68, "68%"),
            (69, "69%"),
            (70, "70%"),
            (71, "71%"),
            (72, "72%"),
            (73, "73%"),
            (74, "74%"),
            (75, "75%"),
            (76, "76%"),
            (77, "77%"),
            (78, "78%"),
            (79, "79%"),
            (80, "80%"),
            (85, "85%"),
        ),
    )
    squashed = models.BooleanField(default=False)
    squashed_no = models.IntegerField(default=0)
    bookings = models.ManyToManyField("self", symmetrical=False)
    is_group = models.BooleanField(default=False)
    agent = models.ForeignKey(
        "external.Agent", null=True, blank=True, on_delete=models.SET_NULL
    )
    tutor_discount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, null=True
    )
    transport_fare = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, null=True
    )
    tuteria_discount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, null=True
    )
    witholding_tax = models.DecimalField(
        max_digits=10, decimal_places=2, default=5, null=True
    )
    objects = BookingManager()

    @property
    def status_display(self):
        return self.get_status_display()

    @property
    def total_hours(self):
        return (
            self.bookingsessions.aggregate(models.Sum("no_of_hours"))[
                "no_of_hours__sum"
            ]
            or 0
        )

    def get_percentage(self):
        options = {
            10: 0.10,
            15: 0.15,
            20: 0.2,
            25: 0.25,
            30: 0.3,
            35: 0.35,
            40: 0.4,
            45: 0.45,
            55: 0.55,
            50: 0.50,
            60: 0.60,
            TuteriaLevel.ROOKIE: 0.65,
            TuteriaLevel.AMATEUR: 0.7,
            TuteriaLevel.SEMI_PRO: 0.75,
            TuteriaLevel.VETERAN: 0.8,
            TuteriaLevel.MASTER: 0.85,
        }
        return options[self.booking_level]

    def weeks_elapsed(self):
        return (timezone.now() - self.first_session).days / 7

    def due_date(self):
        last_session = self.bookingsessions.last()
        if last_session:
            return last_session.end
        return ""

    def pay_tutor_for_classes_taught(self):
        classes_taught = (
            self.bookingsessions.completed().total_amount() * self.booking_level / 100
        )

        amount_to_be_paid = classes_taught - abs(self.get_tutor.wallet.amount_available)
        if amount_to_be_paid > 0:
            self.get_tutor.trigger_payment("Bank", amount_to_be_paid)
            w = self.get_tutor.wallet
            w.amount_available = -classes_taught
            w.save()

    def populate_last_session(self):
        if self.last_session is None:
            self.last_session = self.due_date()
            self.save()

    def compute_first_session(self):
        self.populate_first_session()
        self.populate_last_session()

    def populate_first_session(self):
        if self.first_session is None:
            first_b_sesson = self.bookingsessions.first()
            self.first_session = first_b_sesson.start if first_b_sesson else None
            self.save()

    def cleared(self):
        cancelled = self.bookingsessions.cancelled().count()
        completed = self.bookingsessions.completed().count()
        total = self.bookingsessions.count()
        return total == completed + cancelled and completed > 0

    def tutor_reviewed(self):
        pass

    @property
    def bookingsessions(self):
        # parent_booking = self.booking_set.first()
        # if parent_booking and parent_booking.is_group:

        if self.bookings.filter(is_group=False).exists() or self.is_group:
            return BookingSession.objects.all_sessions(self)
        return self.bookingsession_set

    @property
    def skill(self):
        if self.bookings.exists() and not self.is_group:
            names = [x.ts.skill.name for x in self.bookings.all() if x.ts]
            return " and ".join(names)
        if self.ts:
            return self.ts.skill.name

    @property
    def elapsed_date(self):
        today = datetime.datetime.now(tz=pytz.utc)
        final_date = self.bookingsessions.last_session().start
        difference = final_date - today
        return difference.total_seconds() < 0

    def status_to_completed(self):
        if self.cleared():
            self.status = self.COMPLETED
            self.save()

    def status_class(self):
        if self.status == self.INITIALIZED:
            return "default"
        if self.status == self.SCHEDULED:
            return "default"
        if self.status == self.CANCELLED:
            return "danger"
        if self.status == self.COMPLETED and self.paid_tutor == False:
            return "info"
        if self.status == self.COMPLETED and self.paid_tutor == True:
            return "success"
        if self.status == self.PENDING:
            return "warning"
        if self.status == self.DELIVERED:
            return "primary"

    @classmethod
    def create(cls, ts=None, user=None, tutor_id=None, **kwargs):
        order = generate_code(cls)
        set_tutor = kwargs.pop("set_tutor", False)
        obj, _ = cls.objects.get_or_create(
            order=order,
            ts=ts,
            user=user,
            tutor_id=None if set_tutor else (tutor_id or ts.tutor_id),
            **kwargs,
        )
        return obj

    def get_weekdays_and_no_of_weeks(self):
        """Get the weekdays and the number of weeks from the
        booking sessions"""
        result = [
            dict(
                weekday=x.start.strftime("%A"),
                no_of_hours=x.no_of_hours,
                price=x.price,
                student_no=x.student_no,
                hour=x.start.strftime("%H"),
                minute=x.start.strftime("%M"),
            )
            for x in self.bookingsessions.all()
        ]
        cnt = Counter()
        for o in result:
            cnt[o["weekday"]] += 1

        return {v["weekday"]: v for v in result}.values(), list(cnt.values())

    def get_date_value(self, today, weekday_no, w, include_today=True):
        d = today + relativedelta(weekday=weekday_no)
        if not include_today:
            if today.date() == d.date():
                d = d + relativedelta(days=(w + 1) * 7)
            else:
                d = d + relativedelta(days=w * 7)
        else:
            d = d + relativedelta(days=w * 7)
        return d

    def rebook_classes(self, include_today=True,current_day=None):
        weekday_match = {
            "Monday": 0,
            "Tuesday": 1,
            "Wednesday": 2,
            "Thursday": 3,
            "Friday": 4,
            "Saturday": 5,
            "Sunday": 6,
        }
        weekdays, numbers = self.get_weekdays_and_no_of_weeks()
        today = current_day or timezone.now()
        sessions = []
        for i, x in enumerate(weekdays):
            weekday_no = weekday_match[x["weekday"]]
            for w in range(numbers[i]):
                d = self.get_date_value(
                    today, weekday_no, w, include_today=include_today
                )
                y = d.replace(hour=int(x["hour"]), minute=int(x["minute"]))

                o = {
                    "start": y,
                    "price": self.total_price / sum(numbers),
                    "no_of_hours": x["no_of_hours"],
                    "student_no": x["student_no"],
                }
                sessions.append(o)
        tutor = self.tutor
        if not tutor:
            tutor = self.ts.tutor
        booking_level = 70
        if tutor:
            booking_level = 75 if tutor.is_premium else 70
        booking_inst = Booking.create(
            ts=self.ts,
            user=self.get_user,
            booking_type=self.booking_type,
            agent=self.agent,
            booking_level=booking_level,
        )
        if booking_inst.booking_level == 65:
            booking_inst.booking_level = 70
        for o in sessions:
            o.update(booking=booking_inst)
        BookingSession.objects.bulk_create([BookingSession(**o) for o in sessions])
        return booking_inst

    @property
    def get_user(self):
        if self.user:
            return self.user
        instance = self.booking_set.first()
        if instance:
            return instance.user

    @property
    def all_aggregates(self):
        return self.bookingsessions.aggregate(
            price__sum=models.Sum("price"), student_no__avg=models.Avg("student_no")
        )

    def total_group_price(self):
        return sum([x.total_price for x in self.bookings.all()])

    @property
    def total_price(self):
        """Price of booking based on summation of all the booking sessions"""
        # return
        # self.bookingsessions.aggregate(models.Sum('price')).get('price__sum')
        if self.bookings.exists():
            return self.total_group_price()
        if hasattr(self, "session_total"):
            return self.session_total
        return self.all_aggregates.get("price__sum")

    @property
    def policy(self):
        """Cancellation percent to be deducted when client fails to obey the cancellation policy"""
        if self.total_hours >= 24:
            return Policy(Policy.LONG_TERM, booking=self)
        return Policy(self.get_tutor.profile.cancellation, booking=self)

    @property
    def tutor_level(self):
        """Determines amount to be paid to tutor eventually"""
        lev = self.booking_level
        tutor_level = self.get_tutor.profile.level
        if tutor_level > lev:
            lev = tutor_level

        return TuteriaLevel(lev, booking=self)

    def admin_cut(self):
        """Determines amount to be deducted from amount to be paid to tutor"""
        initial = (100 - self.booking_level) * self.total_price / 100
        # initial = self.tutor_level.admin_cut(self.total_price)
        tuteria_discount = self.tuteria_discount or 0
        return initial - tuteria_discount

    def witholding_tax_amount(self):
        initial = self.amount_earned()
        witholding_tax = self.witholding_tax or 0
        return initial * witholding_tax / 100

    def amount_earned_without_penalty(self):
        return self.total_price - self.cancelled_class_cost()

    def amount_earned(self):
        """Amount to be earned by tutor. considers the percentage split"""
        tutor_earning = self.booking_level * self.amount_earned_without_penalty() / 100
        # tutor_earning = self.amount_earned_without_penalty() - self.admin_cut()
        tutor_discount = self.tutor_discount or 0
        if tutor_discount < 0:  # negative balance should amount to 0
            tutor_discount = 0
        return tutor_earning - tutor_discount

    def total_discount(self):
        tutor_discount = self.tutor_discount or 0
        tuteria_discount = self.tuteria_discount or 0
        return tutor_discount + tuteria_discount

    @property
    def discount_percent(self):
        price = self.gateway_price
        if price < Decimal(20000):
            discount = Decimal(0.05)
        elif Decimal(20000) < price < Decimal(50000):
            discount = Decimal(0.04)
        else:
            discount = Decimal(0.03)
        return int(discount * 100)

        # @property
        # def service_fee(self):
        # return self.discount_percent * self.gateway_price / 100

    @property
    def real_price(self):
        """Actual booking price which consist of service fee"""
        tv = self.total_price or 0
        return tv + self.service_fee

    @property
    def payable_price(self):
        """Actual price that is payed at the gateway"""
        return self.real_price - self.wallet_amount

    @property
    def get_tutor(self):
        if self.tutor:
            return self.tutor

        # if instance:
        # 	return instance.
        return TutorSkillService.owner_of_skill(self.ts)

    @property
    def rq(self):
        return self.baserequesttutor_set.first()

    def get_price(self):
        # if self.ts:
        #     return TutorSkillService.get_price(self.ts)
        fs = self.bookingsessions.first()
        return self.total_price / (
            self.student_no * fs.no_of_hours * self.bookingsessions.count()
        )

    def earning_for_tutor(self):
        price = self.real_price

    def get_rq_discount(self):
        if self.ts:
            return TutorSkillService.get_discount(self.ts)
        return TutorSkillService.get_rq_discount(self.rq, self.tutor)

    def skill_display(self):
        if self.ts:
            return TutorSkillService.get_skill_name(self.ts)
        return TutorSkillService.get_skill_for_request(self.rq)

    @property
    def get_skill(self):
        return TutorSkillService.get_tutor_skill(self.ts)

    @property
    def student_no(self):
        # return
        # int(self.bookingsessions.aggregate(models.Avg('student_no')).get('student_no__avg'))
        return int(self.all_aggregates.get("student_no__avg") or 0)

    def booking_detail(self):
        return "%s with %s" % (self.skill_display(), self.get_tutor.first_name)

    def is_delivered(self):
        if self.status == self.DELIVERED:
            return True
        return False

    def get_absolute_url(self):
        return "%s?email=%s" % (
            reverse("users:user_booking_summary_redirect", args=[self.order]),
            self.get_user.email,
        )

    def get_tutor_l_absolute_url(self):
        return "%s?email=%s" % (
            reverse("users:user_booking_summary_redirect", args=[self.order]),
            self.tutor.email,
        )

    def book_url(self):
        return reverse("booking_page", args=[self.order])

    def can_be_closed(self, days=3):
        today = timezone.now()
        if not self.delivered_on:
            self.delivered_on = today
        elapsed_days = abs(today - self.delivered_on)
        return self.status == Booking.DELIVERED and elapsed_days.days >= days

    def tutor_request_to_cancel(self):
        from .. import tasks

        tasks.send_mail_on_tutor_request_to_cancel_booking.delay(
            self.order, email=DEFAULT_MAIL
        )
        self.status = self.PENDING
        # self.cancel_initiator = self.get_tutor
        self.save()

    def client_response_to_tutor_request_to_cancel(self):
        """Actions taken when client confirms tutor request to cancel booking"""
        if self.status == self.PENDING:
            self.cancel_booking(self.get_tutor)
            from ..forms import BookingReviewForm

            # default review on cancelled booking
            form = BookingReviewForm(
                data={
                    "rating": "0",
                    "review": "The lesson reservation was canceled before it started. This is an automated posting",
                }
            )
            if form.is_valid():
                form.save(self, 3)

    def tutor_fee(self):
        if self.cancelled_class_cost() > 0:
            return self.tutor_level.amount_earned2()
        return self.tutor_level.amount_earned()

    def tutor_pricing(self):
        return self.tutor_level.tutor_earning()

    def cancel_booking(self, initiator=None, single=False):
        """Actions taken when booking sessions are cancelled or rescheduled"""
        if (
            self.status != self.CANCELLED
            or self.status != self.COMPLETED
            or self.satus != self.DELIVERED
        ):
            # cancels all sessions
            current_time = timezone.now()
            if not single:
                self.bookingsessions.update(
                    status=BookingSession.CANCELLED, modified=current_time
                )
            from .. import tasks

            # sends sms and email to tutor notifying him of the reschedule or
            # cancellation
            tasks.send_mail_on_booking_cancelled.delay(self.order, email=DEFAULT_MAIL)
            # updates tutor calendar
            if not single:
                self.free_calendar()
                # reward penalty for cancellation / reschedule
                if initiator:
                    self.cancel_initiator = initiator
                    reward2 = Milestone.get_milestone(Milestone.TUTOR_CANCEL_BOOKING)
                    self.cancel_initiator.tuteria_points += reward2.score
                else:
                    self.cancel_initiator = self.get_user
                    reward2 = Milestone.get_milestone(Milestone.CANCEL_BOOKING)
                    self.cancel_initiator.tuteria_points += reward2.score
                self.cancel_initiator.save()
            else:
                self.cancel_initiator = self.get_user
                self.save()
            # refunds money to client
            self.pay_tutor(transaction_type=WalletTransactionType.CANCELLATION_PENALTY)
            self.status = self.CANCELLED
            self.save()

    # Todo: account for scenario when a booking with more than one session is
    # canceled
    def pay_tutor(self, transaction_type=None):
        if self.bookings.filter(is_group=True).exists():
            self.tutor.wallet.pay_for_group_lessons(self)
        # if not self.is_group:
        else:
            self.get_user.wallet.pay_tutor(
                self, self.get_tutor.wallet, transaction_type
            )
            self.paid_tutor = True
            # if self.get_user.profile.level == 0:
            #     self.get_user.update_to_new_level()

    def reward_referrer(self):
        """Trigger referral payment. Ensures Only amount completed is used in the
        calculation of the referral payment. Accounts for both tutor referral
        and client referral
        """
        amount_to_be_total = self.tutor_level.amount_earned_without_penalty()
        if hasattr(self.get_user, "ref_instance"):
            my_referral = self.get_user.ref_instance
            referred_by = my_referral.referred_by
            if referred_by != self.get_tutor:
                my_referral.first_booking_rewarded(amount_to_be_total)
        if hasattr(self.get_tutor, "ref_instance"):
            my_referral2 = self.get_tutor.ref_instance
            if my_referral2.referred_by != self.get_user:
                my_referral2.first_booking_received_rewarded(amount_to_be_total)

    def client_confirmed(self, rating=None):
        """Actions triggered after client confirms booking or 3 days have elapsed"""
        from .. import tasks

        if self.status == Booking.DELIVERED:
            # money is transferred to tutors account
            # check if already processed
            self._process_after_delivered(rating)
            # not_paid = len(self.wallet_transactions.tutor_earning()) == 0
            # if not_paid:
            #     self.pay_tutor()
            #     if rating:
            #         self.reward_for_posting_review(rating)
            #     tasks.send_mail_to_tutor_on_closed_booking.delay(
            #         self.order, email=DEFAULT_MAIL)
            #     self.status = Booking.COMPLETED
            #     self.save()
            #     self.reward_referrer()
            #     if self.wallet_transactions.all().transaction_not_paid().count(
            #     ) > 0:
            #         tasks.charge_client_again(self.order)
            #     self.update_status_on_hubspot()

    def refund_client_and_tutor(self, user_payout):
        if self.status == Booking.SCHEDULED:
            self.bookingsessions.filter(status=BookingSession.NOT_STARTED).update(
                status=BookingSession.CANCELLED
            )
            self.get_user.wallet.pay_tutor(
                self, self.get_tutor.wallet, user_payout=user_payout, force=True
            )
            self.status = Booking.PREMATURE_CLOSED
            self.save()
            if self.bookingsessions.count() == self.bookingsessions.cancelled().count():
                self.delete()

    @classmethod
    def update_hubspot(cls, ids):
        for booking in cls.objects.filter(pk__in=list(ids)).all():
            booking.update_status_on_hubspot()

    def async_call_to_client_confirmed_admin(
        self, rating=None, with_celery=True, charge=False
    ):
        from .. import tasks

        if self.status == Booking.DELIVERED:
            # money is transferred to tutors account
            self.get_user.wallet.pay_tutor2(self, self.get_tutor.wallet, None)
            self.paid_tutor = True
            if rating:
                self.reward_for_posting_review(rating)
            # import pdb; pdb.set_trace()
            # params = (self.order,)
            # kwargs2 = dict(email=DEFAULT_MAIL)
            func = tasks.send_mail_to_tutor_on_closed_booking
            if with_celery:
                func.delay(self.order, email=DEFAULT_MAIL)
            else:
                func(self.order, email=DEFAULT_MAIL)
            # import pdb; pdb.set_trace();
            self.status = Booking.COMPLETED
            self.save()
            self.reward_referrer()
            if self.get_user.profile.level == 0:
                self.get_user.update_to_new_level()
            tasks.charge_client_again(self.order)

    def pay_group_lessons_tutors(self):
        self.pay_tutor()
        self.paid_tutor = True
        self.status = Booking.COMPLETED
        self.save()

    def _process_after_delivered(self, rating=None, admin=False):
        from .. import tasks

        not_paid = len(self.wallet_transactions.tutor_earning()) == 0
        if not_paid:
            if admin:
                self.get_user.wallet.pay_tutor2(self, self.get_tutor.wallet, None)
            else:
                self.pay_tutor()
            self.paid_tutor = True
            if rating:
                self.reward_for_posting_review(rating)
            # import pdb; pdb.set_trace()
            # params = (self.order,)
            # kwargs2 = dict(email=DEFAULT_MAIL)
            tasks.send_mail_to_tutor_on_closed_booking.delay(
                self.order, email=DEFAULT_MAIL
            )
            # import pdb; pdb.set_trace();
            self.status = Booking.COMPLETED
            self.save()
            self.get_user.wallet.sync_session_with_bookings()
            self.reward_referrer()
            if self.get_user and self.get_user.profile.level == 0:
                self.get_user.update_to_new_level()
            if self.wallet_transactions.all().transaction_not_paid().count() > 0:
                pass
                # tasks.charge_client_again(self.order)
            try:
                self.update_status_on_hubspot()
            except:
                pass
            self.tutor.to_mailing_list()

    def client_confirmed_admin(self, rating=None):
        """Actions triggered after tutor cancels a session from bookings"""

        if self.status == Booking.DELIVERED and not self.paid_tutor:
            # money is transferred to tutors account
            self._process_after_delivered(rating, admin=True)
        else:
            self.status = Booking.COMPLETED
            self.save()

    def async_client_confirmed_admin(self, rating=None):
        """Actions triggered after tutor cancels a session from bookings"""
        self.async_call_to_client_confirmed_admin(rating)

    def reward_for_posting_review(self, rating):
        self.reviewed = True
        reward2 = Milestone.get_milestone(Milestone.GOOD_REVIEWS)
        reward3 = Milestone.get_milestone(Milestone.BAD_REVIEWS)
        reward4 = Milestone.get_milestone(Milestone.GIVE_REVIEW)
        if rating > 3:
            self.get_tutor.tuteria_points += reward2.score
        elif rating < 3:
            self.get_tutor.tuteria_points += reward3.score
        self.get_user.tuteria_points += reward4.score

    def reward_and_booking_status_to_delivered(self, rating):
        qualifies = self.get_user.orders.filter(made_payment=True).count() == 1
        if qualifies:
            # reward for first booking by client
            reward = Milestone.get_milestone(Milestone.BOOKED_FIRST_LESSON)
            if not self.get_user.milestones.has_milestone(reward):
                UserMilestone.objects.create(milestone=reward, user=self.get_user)
        repeat_tutor_hire = (
            self.get_user.orders.filter(
                made_payment=True, tutor_id=self.get_tutor.id
            ).count()
            > 1
        )
        if repeat_tutor_hire:
            # reward for repeat hire of tutor by client
            reward1 = Milestone.get_milestone(Milestone.REPEAT_BOOKING)
            self.get_user.tuteria_points += reward1.score
        if self.status != Booking.DELIVERED:
            reward2 = Milestone.get_milestone(Milestone.GOOD_REVIEWS)
            reward3 = Milestone.get_milestone(Milestone.BAD_REVIEWS)
            # reward for rating received by client from tutor
            if rating > 3:
                self.get_user.tuteria_points += reward2.score
            elif rating < 3:
                self.get_user.tuteria_points += reward3.score
        self.get_user.save()
        tutor = self.get_tutor
        repeat_client_hire = (
            Booking.objects.filter(
                tutor=tutor, made_payment=True, user=self.get_user
            ).count()
            > 1
        )
        if repeat_client_hire:
            reward2 = Milestone.get_milestone(Milestone.REPEAT_CLIENT)
            tutor.tuteria_points += reward2.score
            tutor.save()
        # booking status to delivered
        self.status = Booking.DELIVERED
        self.delivered_on = timezone.now()
        self.save()
        try:
            self.update_status_on_hubspot()
        except:
            pass

    def update_status_on_hubspot(self):
        from wallet.models import WalletTransactionType

        h_instance = HubspotAPI("http://tuteria.com")
        booking_transaction = self.wallet_transactions.filter(
            type=WalletTransactionType.TUTOR_HIRE
        ).first()
        if booking_transaction:
            if self.dealId:
                h_instance.update_booking_deal(
                    self,
                    owing=booking_transaction.is_owing,
                    paid=not booking_transaction.is_owing,
                )

    def attached_to_request(self):
        return self.baserequesttutor_set.exists()

    def amount_to_be_paid(self):
        """Amount to be paid to tutor which only consist of completed sessions"""
        return (
            self.bookingsessions.completed()
            .aggregate(models.Sum("price"))
            .get("price__sum")
        )

    def amount_to_be_paid_with_penalty(self):
        """Amount to be paid to tutor which consist of completed,cancelled and rescheduled"""
        return self.policy.new_amount_with_penalty_deducted()

    def cancelled_class_cost(self):
        return (
            self.bookingsessions.cancelled()
            .aggregate(models.Sum("price"))
            .get("price__sum")
            or 0
        )

    def refund(self):

        if self.cancel_initiator == self.get_tutor:
            return self.total_price - self.amount_to_be_paid()

        return self.total_price - self.amount_to_be_paid_with_penalty()

    def refund2(self):
        return self.cancelled_class_cost()

    def penalize_tutor_for_cancelling_booking(self):

        self.bookingsessions.not_started().update(status=BookingSession.CANCELLED)
        self.cancel_initiator = self.get_tutor

        self.get_user.wallet.penalize_tutor(
            self, self.get_tutor.wallet, transaction_type=None
        )
        self.status = Booking.COMPLETED
        self.paid_tutor = True
        self.save()

    def penalize_tutor_for_abscontion(self):
        self.tutor.deny_teaching_status()

        self.get_user.wallet.absconded_tutor_action(self.get_tutor.wallet, self)

        self.status = Booking.CANCELLED
        self.save()

    def penalize_tutor_for_cancelling_b4_commencement(self):
        self.tutor.wallet.penalize_for_cancel_b4_commencement(booking=self)
        self.delete()

    def move_money_to_wallet_session(self):
        # updates tutor calendar
        self.update_tutor_calendar()
        # import pdb ; pdb.set_trace()
        # moves money to insession
        self.get_user.wallet.to_session(self)
        self.witholding_tax = 5
        # change booking status to scheduled and update payment status
        self.compute_first_session()

    def on_successful_payment(self, amount=None):
        from ..tasks import post_process_booking

        post_process_booking(self.pk)
        # post_process_booking.delay(self.pk)
        # self.move_money_to_wallet_session()
        Booking.objects.filter(pk=self.pk).update(
            status=Booking.SCHEDULED, made_payment=True
        )
        # self.status = Booking.SCHEDULED
        # self.made_payment = True
        # self.save()
        # if client has previously met with the tutor, closes and confirms the
        # meeting
        # self.get_user.request_meetings.confirm_meeting(self.get_tutor)
        # booking_count = self.get_user.orders.previously_paid_bookings()
        # # if client's first booking
        # if booking_count == 1:
        #     # self.get_user.wallet.fund_bonus_on_first_booking()
        #     pass
        # # if client's second booking
        # if booking_count == 2:
        #     LetterInvite.objects.create(user=self.get_user)

    def create_hubspot_record(self, assigned, exists=None):
        h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))
        exist = 2 if Booking.objects.filter(user=self.get_user).count() > 1 else 1
        self.dealId = h_instance.create_booking_deal(
            self, assigned, deal_type=exist, checks=lambda: exists
        )
        self.save()

    @classmethod
    def bulk_update_deals_to_hubspot(cls, query):
        from django.db import connection

        with_h, agents = Booking.get_existing_vids_and_agents()

        def callback(booking):
            exists, assigned = Booking.get_vid_and_agent(
                booking, with_h=with_h, agents=agents
            )
            booking.create_hubspot_record(assigned, exists=exists)
            booking.update_status_on_hubspot()
            connection.close()

        queue = Postpone(callback, query.filter(dealId=None))
        queue()

    @classmethod
    def get_existing_vids_and_agents(cls):
        from external.models import BaseRequestTutor

        with_h = BaseRequestTutor.objects.exclude(hubspot_contact_id=None).values(
            "email", "hubspot_contact_id"
        )
        agents = HubspotOwner.objects.filter(
            team=HubspotOwner.CUSTOMER_SUCCESS
        ).values_list("hubspot_id", flat=True)
        return with_h, agents

    def check_new_client(self):
        remark = self.remark or ""
        data = "(new client)" if "new client" in remark.lower() else ""
        return data

    def get_agent(self):
        if self.agent:
            return self.agent.name
        return ""

    @classmethod
    def bookings_to_be_completed(cls, days=14):
        bookings_to_consider = cls.objects.active()

        close_recently = [o for o in bookings_to_consider if o.days_till_close]
        # booking greater than the days passed in as paramter
        greater_than_days = [o for o in close_recently if o.days_till_close == days]
        two_days = [o for o in close_recently if o.days_till_close == 2]
        return two_days, greater_than_days

    @classmethod
    def reminder_to_contact_clients(cls, days=14, new_client=False):
        two_days, greater_than_days = cls.bookings_to_be_completed(days=days)
        close_recently2 = "\n".join(
            [
                f"email: {x.get_user.email}, order: {x.order} {x.check_new_client()} Agent: {x.get_agent()}"
                for x in two_days
            ]
        )
        greater_than_days2 = "\n".join(
            [
                f"email: {x.get_user.email}, order: {x.order} Agent: {x.get_agent()}"
                for x in greater_than_days
            ]
        )

        general_string = f"Booking to end in 2 days\n {close_recently2}\n\n Bookings in the middle \n{greater_than_days2}\n\n\n:+1::skin-tone-4:"

        # for o in greater_than_days:
        response = requests.post(
            settings.FOLLOW_UP_NEW_CLIENT_WEBHOOK, json={"text": general_string}
        )
        if response.status_code < 400:
            pass

    @classmethod
    def get_vid_and_agent(cls, booking, with_h=None, agents=None):
        new_with_h = with_h
        new_agents = agents
        if not new_with_h:
            new_with_h, new_agents = cls.get_existing_vids_and_agents()
        if len(new_agents) > 0:
            assigned = random.choice(new_agents)
            exists = [x for x in new_with_h if x["email"] == booking.get_user.email]
            if len(exists) > 0:
                exists = exists[0]["hubspot_contact_id"]
            else:
                exists = None
            return exists, assigned
        return None, None

    def when_payment_is_made(self, amount_paid):
        self.on_successful_payment(amount_paid)

    def get_tutor_absolute_url(self):
        return reverse("users:tutor_booking_summary", args=[self.order])

    def not_started(self):
        if not self.first_session:
            self.populate_first_session()
        return timezone.now() < self.first_session

    def can_cancel(self):
        return self.bookingsessions.cancelled().count() < 1

    def __str__(self):
        if self.ts:
            return "%s booked for #%.2f on %s " % (
                self.get_tutor.get_full_name(),
                self.real_price,
                self.created.strftime("%Y-%m-%d"),
            )
        return "%s booked for #%.2f on %s " % (
            self.skill,
            self.real_price,
            self.created.strftime("%Y-%m-%d"),
        )

    @classmethod
    def merge_bookings(cls, bookings):
        users = [x.user for x in bookings]
        transactions = []
        if len(set(x.pk for x in users)) == 1:
            booking = cls.create(user=users[0], set_tutor=True)
            for i in bookings:
                i.user = None
                i.save()
                hired_transaction = i.wallet_transactions.used_to_hire().first()
                if hired_transaction:
                    transactions.append(
                        {
                            "created": hired_transaction.created,
                            "total": hired_transaction.total,
                        }
                    )
                    hired_transaction.delete()
                booking.bookings.add(i)
            booking.compute_first_session()
            if booking.total_price == sum(x["total"] for x in transactions):
                booking.get_user.wallet.to_session(
                    booking, created_date=min(x["created"] for x in transactions)
                )
            return booking

    @classmethod
    def create_merged_booking(cls, user, sessions=None):
        """This makes it possible to mimick parent request currently which
        could have multiple bookings masking as one"""
        booking = cls.create(user=user, set_tutor=True)
        bookings = []
        for i in sessions:
            bk = cls.create(
                ts=i["ts"], booking_level=i.get("booking_level", TuteriaLevel.AMATEUR)
            )
            BookingSession.objects.bulk_create(
                [BookingSession(**x, booking=bk) for x in i["sessions"]]
            )
            bk.compute_first_session()
            bookings.append(bk)
        booking.bookings.add(*bookings)
        booking.compute_first_session()
        booking.get_user.wallet.to_session(booking)
        return booking

    @classmethod
    def create_group_booking(cls, tutor_skill, description, sessions=[], split=15):
        booking = cls.create(
            ts=tutor_skill,
            booking_level=split,
            remark=description,
            wallet_amount=0,
            # is_group=True,
            tutor=tutor_skill.tutor,
        )
        BookingSession.objects.bulk_create(
            [BookingSession(**x, booking=booking) for x in sessions]
        )
        booking.compute_first_session()
        return booking

    def add_booking(self, booking):
        if self.bookings.exists():
            self.bookings.add(booking)
            self.get_user.wallet.to_session(self, edit=True)

    def add_to_lesson(self, client, sessions_to_book=None, expired=False):
        """Add client to group lesson"""
        sub_booking = Booking.create(
            user=client, ts=self.ts, is_group=True, set_tutor=True
        )
        sessions = self.bookingsession_set.values_list("pk", flat=True)
        if sessions_to_book:
            sessions = sessions[:sessions_to_book]
        the_model = BookingSession.group_bookings.through
        result = the_model.objects.bulk_create(
            [the_model(bookingsession_id=x, booking=sub_booking) for x in sessions]
        )
        sub_booking.get_user.wallet.to_session(sub_booking)
        self.bookings.add(sub_booking)

    def get_booking(self, client):
        return self.bookings.filter(user=client).first()

    def update_booking(self):
        # when a client makes remaing part payment for a group lessson
        base_booking = self.booking_set.first()
        all_sessions = base_booking.bookingsession_set.values_list("pk", flat=True)
        local_sessions = self.bookingsessions.values_list("pk", flat=True)
        set_value = list(set(all_sessions).difference(set(local_sessions)))
        the_model = BookingSession.group_bookings.through
        the_model.objects.bulk_create(
            [the_model(bookingsession_id=x, booking=self) for x in set_value]
        )
        self.get_user.wallet.to_session(self, edit=True)

    def close_booking(self):
        # when the booking is to be closed and the tutor is to be paid
        if self.bookings.exists():
            if self.bookings.filter(is_group=True).exists():
                self.bookingsessions.update(status=BookingSession.COMPLETED)
                self.bookings.update(status=self.COMPLETED)
                self._process_after_delivered()
            else:
                for i in self.bookings.all():
                    i._process_after_delivered()
                self.status = self.COMPLETED
                self.save()

    @property
    def get_users(self):
        result = [x.user for x in self.bookings.all()]
        if result:
            return result
        return [self.user] if self.user else []


class LetterInvite(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.get_user)


def callback_async(booking_order, amount_paid, transaction_id, with_celery=True):
    from .. import tasks

    booking_order.when_payment_is_made(amount_paid)
    params = (booking_order.order, float(amount_paid))
    kwargs2 = dict(transaction_id=transaction_id, email=DEFAULT_MAIL)
    func = tasks.send_mail_to_client_and_tutor_on_successful_booking
    if with_celery:
        func.delay(*params, **kwargs2)
    else:
        func(*params, **kwargs2)
    # booking_order.create_hubspot_record(assigned, exists=exists)


@receiver(successful_payment)
def payment_successful_callback(
    sender, booking_order, transaction_id, amount_paid, request, **kwargs
):
    callback_async(booking_order, amount_paid, transaction_id)
    # from .. import tasks
    # from external.models import BaseRequestTutor
    # booking_order.when_payment_is_made(amount_paid)
    # tasks.send_mail_to_client_and_tutor_on_successful_booking.delay(
    #     booking_order.order,
    #     float(amount_paid),
    #     transaction_id=transaction_id,
    #     email=DEFAULT_MAIL)
    # base_request = booking_order.baserequesttutor_set.count()
    # if base_request > 0:
    #     tasks.send_email_to_notify_remaining_tutors_not_selected(
    #         booking_order.order)
    # # tasks.charge_client_again(booking_order.order)
    # exists, assigned = booking_order.get_vid_and_agent(booking_order)
    # # booking_order.create_hubspot_record(assigned, exists=exists)


@receiver(tutor_closes_booking)
def tutor_initiating_closing_booking_callback(
    sender, booking_order, form, request, **kwargs
):
    from .. import tasks

    rating = form.save(
        booking_order, ip_address=request.META["REMOTE_ADDR"], booking_type=2
    )

    booking_order.reward_and_booking_status_to_delivered(rating)
    # email and sms triggered to client to come and close the booking
    tasks.send_mail_to_client_on_delivered_booking.delay(
        booking_order.order, email=DEFAULT_MAIL
    )


class BookingSummary(BookingSession):
    class Meta:
        proxy = True
        verbose_name = "Booking Summary"
        verbose_name_plural = "Booking Summary"


class CustomThread(Thread):
    def __init__(self, queue, func):
        Thread.__init__(self)
        self.queue = queue
        self.func = func

    def run(self):
        while True:
            args = self.queue.get()
            self.func(*args)
            self.queue.task_done()


class Postpone(object):
    # def __init__(self, queue):
    def __init__(self, func, queryset, thread_count=7):
        # pass
        self.queue = Queue()
        for o in range(thread_count):
            t = CustomThread(self.queue, func)
            t.daemon = True
            t.start()
        self.queryset = queryset

        # self.queue = queue

    def __call__(self, *args, **kwargs):
        # def func(*args, **kwargs):
        # import pdb; pdb.set_trace()
        for booking in self.queryset:
            self.queue.put((booking,))
        # return func
        self.queue.join()
