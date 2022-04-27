import os
from decimal import Decimal
from django.urls import reverse
from django.db import models
from django.conf import settings
import datetime
from django.dispatch import receiver
from django.http import response
from django.template.loader import render_to_string
from django.contrib.postgres.fields import ArrayField
from django.utils.functional import cached_property
from django.utils import timezone
from model_utils.models import TimeStampedModel
from andablog.models import Entry
from django_extensions.db.fields import AutoSlugField
from django.contrib.postgres.fields import ArrayField, IntegerRangeField, JSONField
from external.models import BaseRequestTutor
from config import utils
from django.db.models.functions import TruncHour
from config.signals import add_tutor_to_client_request_pool
from skills.models import related_subjects, TutorSkill
from users.related_subjects import found_s


class RequestPoolQuerySet(models.QuerySet):
    def update_tutors_prices(self, amount):
        # for inst in self.all():
        #     for oo in inst.tutor_found_subjects:
        #         oo.price = amount
        #         oo.save()
        self.values_list("pk", flat=True).update(cost=amount)

    def can_apply(self):
        return self.count() != utils.MAX_SLOT_NUMBER

    def remaining_slots(self):
        return utils.MAX_SLOT_NUMBER - self.count()

    def approved(self):
        return self.filter(approved=True).exists()

    def approved_tutors(self):
        return self.filter(approved=True)

    def approved_tutors_teach_all_subjects(self, req=None):
        if req:
            x = self.related(req)
        else:
            x = self.approved_tutors()
        d = all([y.teaches_all_subject() for y in x])
        return d

    def valid_tutors(self):
        from users.models import User

        return User.objects.filter(
            pk__in=self.approved_tutors().values_list("tutor_id", flat=True)
        ).all()

    def related(self, req):
        rr = req.get_split_request().values_list("pk", flat=True)
        return RequestPool.objects.filter(req_id__in=rr, approved=True)

    def applied_for_today(self):
        today = timezone.now()
        return (
            self.filter(
                created__day=today.day,
                created__year=today.year,
                created__month=today.month,
            ).count()
            >= 5
        )

    def notify_other_tutors(self, booking):
        applicants = self.filter(req__booking=booking).exclude(tutor=booking.get_tutor)
        return applicants


# Create your models here.
# class RequestPoolManager(models.Manager):
#     pass
production = os.getenv("DJANGO_CONFIGURATION", "")
TEST = False if production == "Production" else True


class RequestPool(TimeStampedModel):
    req = models.ForeignKey(
        BaseRequestTutor,
        verbose_name="pool_of_tutors",
        related_name="request",
        on_delete=models.CASCADE,
    )
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="applications",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
    )
    subjects = ArrayField(models.CharField(max_length=50), blank=True, null=True)
    cost = models.DecimalField(default=0, blank=True, max_digits=10, decimal_places=2)
    approved = models.BooleanField(default=False)
    recommended = models.BooleanField(default=False)
    remarks = models.TextField(null=True, blank=True, max_length=255)
    default_subject = models.CharField(max_length=50, blank=True, null=True)
    request_status = models.IntegerField(choices=((1, "New"), (2, "Old")), default=2)
    other_info = JSONField(null=True, blank=True)
    objects = RequestPoolQuerySet.as_manager()

    @property
    def tutor_budget(self):
        info = self.other_info or {}
        return info.get("budget") or 0

    @property
    def no_of_lessons(self):
        info = self.other_info or {}
        return info.get("no_of_lessons") or 0

    def get_ts(self):
        if self.default_subject:
            return (
                self.tutor.tutorskill_set.filter(
                    skill__name__istartswith=self.default_subject
                )
                .with_ratings()
                .with_reviews()
                .first()
            )
        return (
            self.tutor.tutorskill_set.related_subject(self.subjects)
            .active()
            .with_ratings()
            .with_reviews()
            .first()
        )

    def get_ts_dev(self):
        return self.tutor.tutorskill_set.active().first()

    @cached_property
    def tutor_found_subjects(self):
        from connect_tutor.forms import RequestWithRelations

        """The list of subjects the tutor has that matches the request"""
        subjects = self.tutor.tutorskill_set.select_related("skill").exclude(status=4)
        tuteria_subjects = RequestWithRelations.get_tuteria_subjects()
        subjects_related = [
            y.lower() for y in related_subjects(self.subjects, tuteria_subjects)
        ]
        s = [
            x
            for x in subjects
            if len(list(set(x.skill.related_with).intersection(subjects_related))) > 0
        ]
        return s

    def found_subjects(self, single=False):
        s = self.tutor_found_subjects
        if single:
            subjects = self.subjects or []
            s = [o for o in subjects if found_s(o)]
        return s

    def ttp(self):
        try:
            result = Decimal(self.req.tutor_price(self.cost))
        except TypeError:
            result = 0
        return result

    def get_absolute_url(self):
        return reverse("selected_tutor_redirect", args=[self.req.slug, self.tutor.slug])

    def teaches_all_subject(self):
        if self.req.request_subjects and self.subjects:
            return sorted(self.req.request_subjects) == sorted(self.subjects)
        return False

    def __str__(self):
        return "{} {}".format(str(self.req), str(self.tutor))

    def determine_distance(self):
        user_location = self.tutor.actual_tutor_address()
        if self.req.latitude and self.req.longitude:
            return (
                user_location.calculate_distance(self.req.latitude, self.req.longitude)
                <= 15
            )
        return True

    def message_to_be_displayed(self):
        tutor_name = self.tutor.first_name
        subjects = ""
        rr = self.req.request_subjects
        for i, x in enumerate(rr):
            if i == len(rr) - 1:
                subjects += "and " + x
            else:
                subjects += x + ", "
        days = ", ".join(self.req.available_days)
        hour = self.req.hours_per_day
        the_class = ", ".join(self.req.classes)
        s = "s" if hour > 1 else ""
        return "{} will teach {} for {} on {} for {} hour{} per lesson".format(
            tutor_name, subjects, the_class, days, hour, s
        )

    def no_of_hours_taught(self):
        return self.tutor.no_of_hours_taught()

    def get_address(self):
        if self.tutor:
            addresses = self.tutor.location_set.all()
            t = [x for x in addresses if x.addr_type == 2]
            if len(t) > 0:
                return t[0]
            return addresses[0]

    @cached_property
    def get_tutor_address(self):
        return self.get_address()

    def get_lat_lng(self):
        x = self.get_tutor_address
        if x:
            if x.latitude:
                return "{},{}".format(x.latitude, x.longitude)
            return x.full_address

    @property
    def message(self):
        s_names = [s for s in self.found_subjects(single=True)]
        weeks = self.req.days_per_week if self.req.days_per_week < 4 else 4
        weeks_str = "{} weeks".format(weeks) if weeks < 4 else "1 month"
        base_url = "http://www.tuteria.com"
        if TEST:
            base_url = "http://tuteria.ngrok.io"
        msg = """
    {}! Are you interested in teaching {} at {}.
    Days/week: {}
    For: {}
    No of hrs: {} @ {}.
    Earning: N{}. For more details {}"""
        return msg.format(
            self.tutor.first_name,
            ",".join(s_names),
            "{},{}".format(self.req.vicinity, self.req.state),
            len(self.req.available_days),
            weeks_str,
            self.req.hours_per_day,
            self.req.time_of_lesson,
            round(Decimal(self.req.budget) * Decimal(0.7)),
            base_url
            + reverse("view_request_detail", args=[self.tutor.slug, self.req.slug]),
        )

    def notify_tutor_about_job(self):
        self.request_status = 1
        number = str(self.tutor.primary_phone_no.number)
        if TEST:
            number = "+2348128800809"
        self._send_message(
            number,
            render_to_string(
                "messages/sms_tutor.txt",
                dict(message=self.message, reply=settings.INFOBIB_DEFAULT_NUMBER),
            ),
        )
        self.save()

    @property
    def full_name(self):
        return "{} {}".format(self.tutor.first_name, self.tutor.last_name)

    @property
    def location(self):
        x = self.get_tutor_address
        return x.full_address

    @classmethod
    def add_tutor_and_notify_about_job(cls, instance, notify=True, **kwargs):
        pool, _ = cls.objects.get_or_create(
            req=instance,
            tutor=instance.tutor,
            defaults=dict(
                subjects=instance.request_subjects, cost=instance.budget, **kwargs
            ),
        )
        if notify:
            pool.notify_tutor_about_job()
        return pool

    def confirm(self):
        self.request_status = 2
        self.approved = True
        self.save()

    def reject(self):
        self.delete()

    def _send_message(self, to, message):
        utils.get_sms_client(to, message, client_type="infobib")


class BlogCategory(models.Model):
    slug = AutoSlugField(populate_from="name")
    name = models.CharField(max_length=70)

    def __str__(self):
        return self.name


class BlogArticle(models.Model):
    article = models.OneToOneField(Entry, related_name="link", on_delete=models.CASCADE)
    category = models.ForeignKey(
        BlogCategory, related_name="articles", null=True, on_delete=models.SET_NULL
    )
    image = models.ImageField()
    background_color = models.CharField(max_length=10, blank=True, null=True)
    featured = models.BooleanField(default=False)


@receiver(add_tutor_to_client_request_pool)
def on_add_to_pool(sender, request_id, tutorskill, cost=0, **kwargs):
    req = BaseRequestTutor.objects.get(pk=request_id)
    # try and avoid duplicate
    instance, _ = RequestPool.objects.get_or_create(req=req, tutor=tutorskill.tutor)
    instance.subjects = req.request_subjects
    instance.cost = cost or tutorskill.price
    instance.save()
    # instance = RequestPool.objects.create(
    #     req=req,
    #     tutor=tutorskill.tutor,
    #     subjects=req.request_subjects,
    #     cost=cost or tutorskill.price,
    # )
    instance.notify_tutor_about_job()


class TutorJobResponseQueryset(models.QuerySet):
    def pending(self, current_date: datetime.datetime, days=1):
        return self.after_period(TutorJobResponse.PENDING, current_date, days=days)

    def after_period(self, status, current_date, days=1):
        queryset = self.filter(status=status).annotate(
            after_24=models.ExpressionWrapper(
                TruncHour(models.F("created")) + datetime.timedelta(days=days),
                output_field=models.DateTimeField(),
            )
        )
        return queryset.filter(after_24__lt=current_date)


class TutorJobResponse(TimeStampedModel):
    PENDING = 1
    ACCEPTED = 2
    REJECTED = 3
    NO_RESPONSE = 4
    APPLIED = 5
    REPLACED = 6
    STATES = (
        (PENDING, "pending"),
        (ACCEPTED, "accepted"),
        (REJECTED, "declined"),
        (NO_RESPONSE, "no_response"),
        (APPLIED, "applied"),
        (REPLACED, "replaced"),
    )
    req = models.ForeignKey(
        BaseRequestTutor, related_name="req_instance", on_delete=models.CASCADE
    )
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="responses",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
    )
    status = models.IntegerField(default=PENDING, choices=STATES)
    response_time = models.BigIntegerField(default=0)
    data_dump = JSONField(null=True, blank=True)
    objects = TutorJobResponseQueryset.as_manager()

    class Meta:
        pass

    @property
    def comment(self):
        data = self.data_dump or {}
        return data.get("comment", "")

    @property
    def reason(self):
        data = self.data_dump or {}
        return data.get("reason", "")

    @property
    def dateSubmitted(self):
        data = self.data_dump or {}
        return data.get("dateSubmitted", "")

    @property
    def callFeedback(self):
        data = self.data_dump or {}
        return data.get("callFeedback", "")

    @property
    def bookingStage(self):
        data = self.data_dump or {}
        return data.get("bookingStage", {})

    @classmethod
    def get_instance(cls, request: BaseRequestTutor, tutor: settings.AUTH_USER_MODEL):
        instance = cls.objects.filter(req=request, tutor=tutor).first()
        if not instance:
            instance = cls.objects.create(req=request, tutor=tutor)
        return instance

    @classmethod
    def change_status_to_not_applied(cls):
        today = timezone.now()
        result = cls.objects.pending(today, days=1)
        # any additional action to be taken
        result.update(status=cls.NO_RESPONSE)

    @classmethod
    def update_tutor_response(cls, pk=None, status="", responseTime=0, **kwargs):
        instance = cls.objects.filter(pk=pk).first()
        if pk and status:
            r = [i for i, j in dict(cls.STATES).items() if j.lower() == status.lower()]
            if r:
                instance.status = r[0]
                previous = instance.data_dump or {}
                instance.response_time = instance.response_time or responseTime
                instance.data_dump = {**previous, **kwargs}
                instance.save()
                return instance
        return None
