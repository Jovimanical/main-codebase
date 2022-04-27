import logging

from django.urls import reverse
from django.utils import timezone
from django.conf import settings
from django.utils.functional import cached_property

from bookings.models import Booking
from .models import Location
from skills.models import TutorSkill

logger = logging.getLogger(__name__)


class Notification(object):
    def __init__(self, msg, action):
        self.msg = msg
        self.action = action


def new_bookings(x):
    now = timezone.now()
    x.populate_first_session()
    return x.status == Booking.SCHEDULED and x.first_session > now
    # and not x.cleared()


def pending_review(x):
    return (
        x.status == Booking.DELIVERED
        or x.status == Booking.COMPLETED
        and x.reviewed is False
    )


def modified_skills(x):
    return x.status == TutorSkill.MODIFICATION


def cancelled_by_tutors(x):
    return x.status == Booking.PENDING and x.cancel_initiator != None


class UserNotification(object):
    SUBJECT_CREATION = "Subject Creation"
    ID_VERIFICATION = "ID Verification"
    TUTOR_APPLICATION = "Tutor Application"
    BOOKINGS_MADE = "Bookings Made"
    BOOKINGS_RECEIVED = "Bookings Received"
    PROFILE_PIC = "Profile Picture"
    CALENDAR_UPDATE = "Calendar Update"

    def __init__(self, user, profile=None):
        self.user = user
        self.notifications = []
        self.profile = profile or self.user.profile

    @cached_property
    def user_orders(self):
        orders = self.user.orders.all()
        nb = list(filter(new_bookings, orders))
        pr = list(filter(pending_review, orders))
        tc = list(filter(cancelled_by_tutors, orders))
        return nb, pr, tc

    @cached_property
    def tutor_skills(self):
        all_skills = self.user.tutorskill_set.all()
        ms = list(filter(modified_skills, all_skills))
        return all_skills, ms

    def _bank_payment_notification_for_tutors(self):
        """When a tutor has attempted creating a subject, Notify them to populate bank account"""
        all_skills = len(self.tutor_skills[0])

        # modified_count = self.user.require_modification_skills.count()
        if all_skills > 0 and not self.user.has_bank():
            self.notifications.append(
                dict(
                    msg="Please tell us where to send your money",
                    action=reverse("users:account"),
                    group=self.SUBJECT_CREATION,
                    action_text="Modify",
                )
            )

    def _populate_vicinity_for_tutor_address(self):
        """When no vicinity in tutor's tutoring address"""
        tutoring_address = Location.objects.filter(
            user=self.user, addr_type=Location.TUTOR_ADDRESS
        ).first()
        if tutoring_address:
            if not tutoring_address.vicinity:
                self.notifications.append(
                    dict(
                        msg="Add a Town to your tutoring address to get clients near you.",
                        action=reverse("users:edit_profile"),
                        group=self.TUTOR_APPLICATION,
                        action_text="Update Town/City",
                    )
                )

    def _requires_modification(self):
        """When a particular skill requires modifiction after being created"""
        modified_count = len(self.tutor_skills[1])
        # modified_count = self.user.require_modification_skills.count()
        if modified_count > 0:
            v = "s" if modified_count > 1 else ""
            self.notifications.append(
                dict(
                    msg="You have {} subject{} that you need to review.".format(
                        modified_count, v
                    ),
                    action="{}?filter_by=modification".format(
                        reverse("users:tutor_subjects")
                    ),
                    group=self.SUBJECT_CREATION,
                    action_text="Modify",
                )
            )

    def _application_approved(self):
        """When Tutor Application has been approved. User can now start creating subjects"""
        subject_count = len(self.tutor_skills[0])
        if subject_count == 0:
            self.notifications.append(
                dict(
                    msg="Congrats! You're now a tutor. Start adding your subjects",
                    action=reverse("users:subject_creation_landing"),
                    group=self.TUTOR_APPLICATION,
                    action_text="Create First Subject",
                )
            )

    def _id_verification_denied(self):
        """When Uploaded ID is denied. Would require user to return back to make changes"""
        if self.user.submitted_verification and not self.user.identity:
            self.notifications.append(
                dict(
                    msg="We couldn't verify your ID. Please upload another one.",
                    action=reverse("users:edit_verification"),
                    group=self.ID_VERIFICATION,
                    action_text="Re-verify ID",
                )
            )

    def _image_denied(self):
        """When uploaded image is denied"""
        profile = self.user.profile
        if profile.image == None and not profile.image_approved:
            self.notifications.append(
                dict(
                    msg="Your photo wasn't accepted. Please upload a better one.",
                    action=reverse("users:edit_media"),
                    group=self.PROFILE_PIC,
                    action_text="Re-upload",
                )
            )

    def _email_not_verified(self):
        if not self.user.email_verified:
            self.notifications.append(
                dict(
                    msg="Please confirm your email address.",
                    action=reverse("users:resend_mail"),
                    group=self.ID_VERIFICATION,
                    action_text="Resend Email",
                )
            )

    def _when_tutor_requests_cancellation(self):
        """All orders cancelled by tutors"""
        cancelled_orders = self.user_orders[2]
        if len(cancelled_orders) > 0:
            for order in cancelled_orders:
                self.notifications.append(
                    dict(
                        msg="{} requests permission to cancel the  {} lesson. Click to confirm.".format(
                            order.get_tutor.first_name.title(), order.skill_display()
                        ),
                        action=order.get_absolute_url(),
                        group=self.BOOKINGS_MADE,
                        action_text="View",
                    )
                )

    def _orders_placed_recently(self):
        """All recent orders placed by user"""
        recent_orders = self.user_orders[0]
        # recent_orders = self.user.orders.new_bookings()
        if len(recent_orders) > 0:
            for order in recent_orders:
                self.notifications.append(
                    dict(
                        msg="Your {} lesson with {} has been scheduled. Click to view.".format(
                            order.skill_display(), order.get_tutor.first_name.title()
                        ),
                        action=order.get_absolute_url(),
                        group=self.BOOKINGS_MADE,
                        action_text="View",
                    )
                )

    def _pending_reviews(self):
        """When user still has pening reviews to give to tutors"""
        pending_reviews_count = len(self.user_orders[1])
        # pending_reviews_count = self.user.orders.pending_review().count()
        if pending_reviews_count > 0:
            s = "s" if pending_reviews_count > 1 else ""
            self.notifications.append(
                dict(
                    msg="You have {} review{} pending. Please review your tutor's performance".format(
                        pending_reviews_count, s
                    ),
                    action=reverse("users:user_bookings"),
                    group=self.BOOKINGS_MADE,
                    action_text="View Booking{}".format(s),
                )
            )

    def _bookings_received(self):
        """When Tutor receives booking"""
        tutor_orders = Booking.objects.filter(ts__tutor=self.user).new_bookings()
        if len(tutor_orders) > 0:
            for booking in tutor_orders:
                self.notifications.append(
                    dict(
                        msg="{} booked a lesson with you for {}. Click to view.".format(
                            booking.user.first_name.title(), booking.skill_display()
                        ),
                        action=booking.get_tutor_absolute_url(),
                        group=self.BOOKINGS_RECEIVED,
                        action_text="View",
                    )
                )

    def _meetings_not_confirmed(self):
        """When Tutor receives a meeting request"""
        meetings = self.user.meetings.filter(met_with_client=False, made_payment=True)
        if len(meetings) > 0:
            for meeting in meetings:
                self.notifications.append(
                    dict(
                        msg="{} has requested to meet with you on {}. Click to view.".format(
                            meeting.client.first_name.title(), meeting.ts.skill.name
                        ),
                        action=meeting.get_absolute_url(),
                        group=self.BOOKINGS_RECEIVED,
                        action_text="View",
                    )
                )

    def _tutor_application_level_status(self, applicant):
        self.notifications.append(
            dict(
                msg="Please finish up your tutor application.",
                action=applicant.get_application_link,
                group=self.TUTOR_APPLICATION,
                action_text="Finish up now",
            )
        )

    def _has_calendar(self):
        if not self.user.has_mini_calendar:
            path = "users:update_tutor_details"
            if settings.USE_NEW_FLOW:
                path = "users:user_schedule"
            self.notifications.append(
                dict(
                    msg="Please, update your availability",
                    action=reverse(path),
                    group=self.CALENDAR_UPDATE,
                    action_text="Update",
                )
            )

    def populate_all_notifications(self):

        """Populate all notifications in one swoop"""
        from tutor_management.models import TutorApplicantTrack

        self._id_verification_denied()
        # self._email_not_verified()
        self._image_denied()
        self._orders_placed_recently()
        self._pending_reviews()
        if self.profile.is_tutor:
            self._requires_modification()
            self._application_approved()
            self._populate_vicinity_for_tutor_address()
            self._bank_payment_notification_for_tutors()
            self._bookings_received()
            self._when_tutor_requests_cancellation()
            # self._meetings_not_confirmed()
            self._has_calendar()
        applicant = TutorApplicantTrack.objects.filter(pk=self.profile.user_id).first()
        if applicant:
            if self.profile.application_status != self.profile.VERIFIED:
                self._tutor_application_level_status(applicant)

        # if self.profile.application_status != self.profile.DENIED and self.user.tutor_req.has_requirements and self.user.tutor_intent:
