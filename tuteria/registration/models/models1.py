import logging

# from itertools import ifilter

import skills
from cloudinary.models import CloudinaryField
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import Case, IntegerField, Q, Sum, When
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from model_utils.models import TimeStampedModel
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.
from schedule.models import Calendar, Event, Occurrence
from schedule.periods import Period

logger = logging.getLogger(__name__)

User = settings.AUTH_USER_MODEL
ifilter = filter


class Education(models.Model):
    class Meta:
        db_table = "tutors_educations"

    DEGREE = (
        ("", "Select"),
        ("B.Sc.", "B.Sc."),
        ("B.A.", "B.A."),
        ("B.Ed.", "B.Ed."),
        ("B.Eng.", "B.Eng."),
        ("B.Tech.", "B.Tech."),
        ("Diploma", "Diploma"),
        ("MBBS", "MBBS"),
        ("HND", "HND"),
        ("OND", "OND"),
        ("M.Sc.", "M.Sc."),
        ("LL.B", "LL.B"),
        ("MBA", "MBA"),
        ("PhD", "PhD"),
        ("N.C.E", "N.C.E"),
        ("S.S.C.E", "S.S.C.E"),
    )
    school = models.CharField(max_length=125)
    course = models.CharField(max_length=125)
    degree = models.CharField(max_length=10, choices=DEGREE)
    tutor = models.ForeignKey(User, on_delete=models.CASCADE)
    certificate = CloudinaryField(max_length=100, null=True, blank=True)
    verified = models.BooleanField(default=False)

    def certificate_image(self):
        if self.certificate:
            return self.certificate.image(width=200, height=200, crop="fill")
        return ""

    certificate_image.allow_tags = True

    def __str__(self):
        return "School: %s \n Course: %s \n Degree: %s" % (
            self.school,
            self.course,
            self.degree,
        )

    @property
    def display_string(self):
        if self.school and self.course:
            return u"School:%s,Course:%s" % (self.school, self.course)


class WorkExperience(models.Model):
    class Meta:
        db_table = "tutor_work_experiences"

    name = models.CharField(max_length=125, verbose_name=_("Organization Name"))
    role = models.CharField(max_length=125, verbose_name=_("Role"))
    tutor = models.ForeignKey(User, on_delete=models.CASCADE)
    verified = models.BooleanField(default=False)
    currently_work = models.BooleanField(default=False)

    def is_teacher(self):
        return self.tutor.is_teacher

    def __str__(self):
        return "Name: %s \n Role: %s" % (self.name, self.role)

    @property
    def display_string(self):
        if self.name and self.role:
            return u"%s as a %s" % (self.name, self.role)


class Guarantor(models.Model):
    class Meta:
        db_table = "tutor_guarantors"

    tutor = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField(_("email address"), blank=True, null=True, db_index=True)
    first_name = models.CharField(
        _("first name"), max_length=40, db_index=True, blank=True, null=True
    )
    last_name = models.CharField(
        _("last name"), max_length=40, db_index=True, blank=True, null=True
    )
    no_of_years = models.IntegerField(
        choices=(
            ("", "Select Option"),
            (2, "Less than two years"),
            (5, "Between 3 to 5 years"),
            (10, "Between 6 to 10 years"),
            (50, "10 years +"),
        ),
        blank=True,
        null=True,
    )
    phone_no = PhoneNumberField(blank=True, null=True)
    organization = models.CharField(max_length=150, blank=True, null=True)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return "%s %s" % (self.first_name, self.phone_no)


class VerifiedUserWorkExperienceManager(models.Manager):
    def get_queryset(self):
        return (
            super(VerifiedUserWorkExperienceManager, self)
            .get_queryset()
            .select_related("tutor__profile")
            .filter(tutor__profile__application_status=3)
            .filter(tutor__is_teacher=None)
            .annotate(
                active_skills=Sum(
                    Case(
                        When(
                            tutor__tutorskill__status=skills.models.TutorSkill.ACTIVE,
                            then=1,
                        ),
                        output_field=IntegerField(),
                    )
                )
            )
            .filter(active_skills__gte=1)
        )


class VerifiedUserWorkExperience(WorkExperience):
    objects = VerifiedUserWorkExperienceManager()

    class Meta:
        proxy = True

    def tutor_description(self):
        return self.tutor.profile.tutor_description


class ScheduleQuerySet(models.QuerySet):
    def by_tutor(self, tutor):
        return self.filter(tutor=tutor)

    def available_days(self):
        return self.filter(calender_type=Schedule.AVAILABILITY)

    def booked_days(self):
        return self.filter(calender_type=Schedule.BOOKING)

    def month_ago(self):
        v = timezone.now()
        q1 = models.Q(last_updated=None)
        a_month_ago = timezone.now() - timezone.timedelta(days=30)
        q2 = models.Q(last_updated__lt=a_month_ago)
        return self.available_days().filter(q1 | q2)

    def has_client(self):
        from external.models import BaseRequestTutor

        tutors = BaseRequestTutor.objects.exclude(tutor=None).values_list(
            "tutor_id", flat=True
        )
        return self.filter(tutor_id__in=tutors)
        # return self.annotate(rq=models.Count('tutor__baserequesttutor')).filter(rq__gt=1)


class ScheduleManager(models.Manager):
    def get_queryset(self):
        return ScheduleQuerySet(self.model, using=self._db)

    def available_days(self):
        return self.get_queryset().available_days().first()

    def booked_days(self):
        return self.get_queryset().booked_days().first()

    def month_ago(self):
        return self.get_queryset().has_client().month_ago()

    def free_days(self, calendars, months=1):
        a_days, b_days = Schedule.all_events(calendars, months=months)
        date_hours = [a.start.date() for a in b_days]

        def check(value):
            if value.start.date() not in date_hours:
                return True
            return False

        def check2(value):
            if value.start.date() in date_hours:
                return True
            return False

        f_day = ifilter(check, a_days)
        clash_day = ifilter(check2, a_days)
        clash_b_day = ifilter(check2, b_days)
        return f_day, clash_day, b_days
        # booked = self.booked_days()
        # available = self.available_days()
        # if available:
        # a_days = available.get_occurrences(months)
        # if booked:
        # b_days = booked.get_occurrences(months)
        # remove occurrences that have been cancelled
        #         date_hours = [a.start.date() for a in b_days]

        #         def check(value):
        #             if value.start.date() not in date_hours:
        #                 return True
        #             return False

        #         def check2(value):
        #             if value.start.date() in date_hours:
        #                 return True
        #             return False

        #         f_day = ifilter(check, a_days)
        #         clash_day = ifilter(check2, a_days)
        #         clash_b_day = ifilter(check2, b_days)
        #         return f_day, clash_day, b_days
        #     return a_days,[],[]
        # return [], [], []


def determine_time(x):
    if 4 < x.start.hour < 12 and x.end.hour >= 20:
        return ("Morning", "Afternoon", "Evening")
    if 4 < x.start.hour < 12 and 11 < x.end.hour <= 16:
        return ("Morning", "Afternoon")
    if 4 < x.start.hour < 12 and x.end.hour <= 12:
        return ("Morning",)
    if 11 < x.start.hour < 16 and x.end.hour >= 20:
        return ("Afternoon", "Evening")
    if 11 < x.start.hour < 16 and x.end.hour <= 16:
        return ("Afternoon",)
    if x.start.hour > 15:
        return ("Evening",)


class Schedule(models.Model):
    AVAILABILITY = 1
    BOOKING = 2
    CALENDAR_TYPE = ((AVAILABILITY, "available"), (BOOKING, "booking"))
    tutor = models.ForeignKey(User, on_delete=models.CASCADE)
    calender = models.ForeignKey(Calendar, null=True, on_delete=models.SET_NULL)
    calender_type = models.IntegerField(default=AVAILABILITY, choices=CALENDAR_TYPE)
    last_updated = models.DateTimeField(null=True)
    objects = ScheduleManager()

    class Meta:
        db_table = "tutors_schedules"
        unique_together = ("tutor", "calender_type")

    def __unicode__(self):
        return "%s Schedule)" % (self.tutor,)

    def get_occurrences(self, months=1):
        st = timezone.now()
        et = st + relativedelta(months=months)
        period = Period(
            self.calender.events.all().prefetch_related("occurrence_set", "rule"),
            start=st,
            end=et,
        )
        occurrences = period.get_occurrences()
        return filter(lambda x: x.cancelled == False, occurrences)

    def get_new_calendar_format(self):
        occurences = self.get_occurrences(months=12)
        new_result = ((x.start.strftime("%A"), determine_time(x)) for x in occurences)
        return new_result

    @staticmethod
    def all_events(calendars, months=1):
        calendar_ids = [x.pk for x in calendars]
        events = Event.objects.filter(calendar_id__in=calendar_ids).prefetch_related(
            "rule", "occurrence_set"
        )
        st = timezone.now()
        et = st + relativedelta(months=months)
        period = Period(events, start=st, end=et)
        occurrences = period.get_occurrences()
        not_cancelled = filter(lambda x: x.cancelled == False, occurrences)

        available_events_ids = [
            x.pk for x in events if x.calendar_id == calendar_ids[0]
        ]
        booked_events = [x.pk for x in events if x.calendar_id == calendar_ids[1]]
        available_occurrences = [
            x for x in not_cancelled if x.event_id in available_events_ids
        ]
        booked_occurrences = [x for x in not_cancelled if x.event_id in booked_events]

        return available_occurrences, booked_occurrences


class EventManager(models.Manager):
    def remove_expired_events(self):
        now = timezone.now()
        return (
            self.get_queryset()
            .filter(
                Q(end__lt=now, end_recurring_period=None)
                | Q(end_recurring_period__lt=now)
            )
            .delete()
        )


class EventProxy(Event):
    actions = EventManager()

    class Meta:
        proxy = True

    def tutor(self):
        if self.calendar:
            first_schedule = self.calendar.schedule_set.first()
            if first_schedule:
                return first_schedule.tutor.email
        return None


class CalendarProxy(Calendar):
    class Meta:
        proxy = True


class OccurrenceManager(models.Manager):
    def remove_occurrences_that_have_expired(self):
        now = timezone.now()
        self.get_queryset().filter(end__lt=now).delete()


class OccurrenceProxy(Occurrence):
    actions = OccurrenceManager()

    class Meta:
        proxy = True


class PhishyUserManager(models.Manager):
    def get_queryset(self):
        return (
            super(PhishyUserManager, self)
            .get_queryset()
            .order_by("-user__profile__dob")
        )


class PhishyUser(models.Model):
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    objects = PhishyUserManager()

    def __str__(self):
        return self.user.email

    def first_name(self):
        return self.user.first_name

    def last_name(self):
        return self.user.last_name

    def dob(self):
        return self.user.profile.dob

    dob.admin_order_field = "user__profile__dob"


class CalendarQueryset(models.QuerySet):
    def by_weekday(self, weekday):
        return self.filter(days__weekday__in=weekday)

    def by_timeslot(self, time_slot):
        return self.filter(days__time_slot__contains=time_slot)


class UserCalendar(TimeStampedModel):
    tutor = models.OneToOneField(
        User,
        blank=True,
        null=True,
        related_name="user_calendar",
        on_delete=models.SET_NULL,
    )
    objects = CalendarQueryset.as_manager()

    class Meta:
        db_table = "calendar"

    def __repr__(self):
        return "<UserCalendar: %s>" % (self.tutor,)


class CalendarDay(models.Model):
    WEEKDAYS = [
        (x, x)
        for x in [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ]
    ]
    TIME_SLOTS = [(y, y) for y in ["Morning", "Afternoon", "Evening"]]
    weekday = models.CharField(max_length=20, blank=True, null=True, choices=WEEKDAYS)
    time_slot = ArrayField(
        models.CharField(max_length=30, choices=TIME_SLOTS), blank=True, null=True
    )
    calendar = models.ForeignKey(
        UserCalendar,
        blank=True,
        null=True,
        related_name="days",
        on_delete=models.SET_NULL,
    )

    class Meta:
        db_table = "calendar_day"

    def __repr__(self):
        return "<CalendarDay: %s %s>" % (self.weekday, ",".join(self.time_slot))
