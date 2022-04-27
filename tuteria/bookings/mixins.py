import pytz
from django.db.models.expressions import CombinedExpression

from django.utils import timezone

from dateutil.relativedelta import relativedelta
from users.mixins import _bulk_create_event

DEFAULT_MAIL = "gbozee@gmail.com"


class BookingSessionMixin(object):

    def update_calendar(self):
        event = self.booking.get_tutor.booking_calendar.events.filter(
            start=self.start, end=self.end
        ).first()
        if event:
            event.delete()


class BookingMixin(object):
    INITIALIZED = 0
    SCHEDULED = 1
    PENDING = 2
    COMPLETED = 3
    CANCELLED = 4
    BANK_TRANSFER = 6
    DELIVERED = 7
    PREMATURE_CLOSED = 8
    BOOKING_STATUS = (
        (INITIALIZED, "initialized"),
        (SCHEDULED, "scheduled"),
        (PENDING, "pending"),
        (COMPLETED, "completed"),
        (CANCELLED, "cancelled"),
        (BANK_TRANSFER, "bank_transfer"),
        (DELIVERED, "delivered"),
        (PREMATURE_CLOSED, "premature"),
    )

    def invalid_state_for_resolution(self):
        return self.status in [2, 6]

    def supports_discount(self):
        if self.ts:
            return self.student_no > 1 and self.get_rq_discount() > 0
        return False

    def update_tutor_calendar(self):
        if self.calendar_updated:
            return
        response = [
            dict(
                start=event.start.replace(tzinfo=pytz.UTC),
                end=event.end.replace(tzinfo=pytz.UTC),
                title="%s lesson with %s. (booking_id: %s)"
                % (self.skill_display(), self.user.first_name, self.order),
            )
            for event in self.bookingsession_set.all()
        ]
        # import pdb; pdb.set_trace()
        _bulk_create_event(self.get_tutor.booking_calendar, response)
        self.calendar_updated = True
        self.save()

    @property
    def bank_expired(self):
        now = timezone.now()
        return now > self.time_to_expire

    @property
    def time_to_expire(self):
        return self.created + relativedelta(hours=5)

    def free_calendar(self):
        if self.calendar_updated:
            title = "%s lesson with %s. (booking_id: %s)" % (
                self.skill_display(),
                self.user.first_name,
                self.order,
            )
            self.get_tutor.booking_calendar.events.filter(title=title).delete()
        self.calendar_updated = False
        self.save()

    def pre_bank_payment_processing(self):
        from . import tasks

        """Updates tutor calendar, change status of booking to BANK_TRANSFER and send mail to client"""
        self.update_tutor_calendar()
        self.status = self.BANK_TRANSFER
        # send sms to admin

        self.save()
        # tasks.send_mail_on_bank_payment_initiation.delay(self.pk)
        tasks.send_mail_to_admin_on_bank_payment.delay(self.pk)

    def rq_heading(self):
        v = self.baserequesttutor_set.first()
        if v:
            if len(v.request_subjects) > 1:
                first = v.request_subjects[0]
                length = len(v.request_subjects[1:])
                remaining = "s" if length > 1 else ""
                return "%s and %s other subject%s" % (first, length, remaining)
            return v.request_subjects[0]
        return v

    @property
    def days_till_close(self):
        if self.last_session:
            result = (self.last_session - timezone.now()).days
            return result
        else:
            return None


class RequestBookingMixin(object):
    pass
