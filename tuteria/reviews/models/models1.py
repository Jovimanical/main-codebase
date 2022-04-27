from django.db import models
from django.urls import reverse
from django.conf import settings
from django.core.validators import MaxValueValidator
from django.db.models import F
from django_extensions.db.models import TimeStampedModel

from config.utils import generate_code, BookingDetailMixin
from users.models import User
from registration.interview import TutorInterview
from wallet.models import WalletTransactionType


class SkillReviewQuerySet(models.QuerySet):
    def average_score(self):
        return self.aggregate(models.Avg("score"))["score__avg"] or 0


class SkillReviewManager(models.Manager):
    def get_queryset(self):
        return SkillReviewQuerySet(self.model, using=self._db)

    def reviews_from_tutors(self):
        return self.get_queryset().filter(review_type=SkillReview.TUTOR_TO_USER)

    def reviews_from_users(self):
        return self.get_queryset().filter(review_type=SkillReview.USER_TO_TUTOR)

    def reviews_on_all_subjects(self, user_email):
        from bookings.models import Booking

        bk = Booking.objects.filter(
            models.Q(user__email=user_email) | models.Q(tutor__email=user_email)
        ).values_list("pk", flat=True)
        queryset = (
            self.get_queryset()
            .filter(booking_id__in=bk)
            .exclude(commenter__email=user_email)
        )
        # if user.is_tutor:
        #     ts = user.tutorskill_set.values_list('pk',flat=True)
        #     return queryset.filter(tutor_skill_id__in=ts)
        return queryset

    def from_admin(self):
        return (
            self.get_queryset().filter(review_type=SkillReview.ADMIN_TO_TUTOR).first()
        )

    def average_score(self):
        return self.get_queryset().aggregate(models.Avg("score"))["score__avg"]

    def ordered_tutor_reviews(self, tutor_ids):
        clauses = " ".join(
            [
                "WHEN tutor_skill_id=%s THEN %s" % (pk, i)
                for i, pk in enumerate(tutor_ids)
            ]
        )
        ordering = "CASE %s END" % clauses
        locations = (
            self.get_queryset()
            .filter(tutor_skill_id__in=tutor_ids)
            .annotate(tc=models.Count("tutor_skill_id", distinct=True))
        )
        return locations.extra(select={"ordering": ordering}, order_by=("ordering",))


# Create your models here.
class SkillReview(TimeStampedModel):
    USER_TO_TUTOR = 1
    TUTOR_TO_USER = 2
    ADMIN_TO_TUTOR = 3
    REVIEW_TYPES = (
        (USER_TO_TUTOR, "From user to tutor"),
        (TUTOR_TO_USER, "From tutor to user"),
    )
    id = models.AutoField(primary_key=True)
    tutor_skill = models.ForeignKey(
        "skills.TutorSkill", related_name="reviews", on_delete=models.CASCADE
    )
    commenter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    review = models.TextField(blank=True, null=True)
    score = models.IntegerField(default=0, validators=[MaxValueValidator(5)])
    review_type = models.IntegerField(choices=REVIEW_TYPES, default=USER_TO_TUTOR)
    booking = models.ForeignKey(
        "bookings.Booking",
        related_name="reviews_given",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    objects = SkillReviewManager()

    @property
    def reviewer_image(self):
        x = self.commenter.profile_pic
        if x:
            if type(x) == str:
                return x
            return x.url

    @property
    def reviewer(self):
        return self.commenter.first_name

    @property
    def location(self):
        home_address = self.commenter.location_set.all()
        first_address = home_address[0]
        return "%s, %s" % (first_address.vicinity, first_address.state)

    @property
    def get_date(self):
        review = (
            self.tutor_skill.rating.get_ratings()
            .filter(user_id=self.commenter_id)
            .first()
        )
        date_voted = review.date_added
        return date_voted.strftime("%B %Y")

    def __unicode__(self):
        return "%s reviewed by %s" % (self.tutor_skill, self.commenter)

    def __str__(self):
        return "%s reviewed by %s" % (self.tutor_skill, self.commenter)

    def score_array(self):
        return range(self.score)


class TutorMeetingQuerySet(models.QuerySet):
    def get_tutor(self, tutor):
        return self.filter(state=TutorMeeting.PAYED, tutor=tutor)

    def has_hired_tutor_before(self, tutor):
        return self.get_tutor(tutor).exists()

    def permitted_to_request_tutor_skill(self, ts):
        """Condition to be met in order to request a particular skill"""
        return self.filter(state=TutorMeeting.PAYED, ts__skill=ts.skill).count() < 2

    def previous_request_made(self, ts):
        """Checks if a request has been placed before for the skill to be learnt"""
        return self.all_payed_request_not_closed().filter(ts__skill=ts.skill).first()

    def all_payed_request_not_closed(self):
        """Fetch all meetings that haven't led to booking yet"""
        return self.filter(state=TutorMeeting.PAYED, led_to_booking=False)

    def tutor_request_not_closed(self, tutor):
        """Fetch meeting with tutor that haven't led to booking yet
        :param tutor: The tutor in question.
        :return: Only meetings by said tutor that haven't led to booking."""
        return self.get_tutor(tutor).filter(led_to_booking=False)

    def cost_of_all_request(self):
        """Cost of all meetings that haven't led to booking yet"""
        return self.all_payed_request_not_closed().calculate_cost()

    def cost_for_specific_tutor(self, tutor):
        """
        cost for meeting which specific tutor that haven't led to booking yet.
        :param tutor: The tutor in question.
        :return: The amount paid for the meeting
        """
        return self.tutor_request_not_closed(tutor).calculate_cost()

    def calculate_cost(self):
        """Summation of all data's total price which consist of adding both amount_paid and wallet_amount."""
        return (
            self.annotate(total_price=F("amount_paid") + F("wallet_amount")).aggregate(
                models.Sum("total_price")
            )["total_price__sum"]
            or 0
        )


class TutorMeetingManager(models.Manager):
    def get_queryset(self):
        return TutorMeetingQuerySet(self.model, using=self._db)

    def has_been_offered_by_admin(self):
        """Situation when we have offered to find a tutor for the client and it did not result to payment"""
        return (
            self.get_queryset()
            .filter(admin_request=True)
            .exclude(state=TutorMeeting.PAYED)
            .exists()
        )

    def confirm_meeting(self, tutor):
        s = (
            self.get_queryset()
            .filter(tutor=tutor, state=TutorMeeting.PAYED, led_to_booking=False)
            .first()
        )
        if s:
            TutorMeeting.objects.filter(order=s.order).update(led_to_booking=True)

    def has_hired_tutor_before(self, tutor):
        """Checks if a request to meet this tutor has occurred irrespective of the subjects."""
        return self.get_queryset().has_hired_tutor_before(tutor=tutor)

    def permitted_to_request_tutor_skill(self, ts):
        return self.get_queryset().permitted_to_request_tutor_skill(ts=ts)

    def initiated(self):
        return self.get_queryset().filter(state=TutorMeeting.PAYED)

    def stale_requests(self):
        return self.get_queryset().filter(state=TutorMeeting.ISSUED, made_payment=False)

    def previous_request_made(self, ts):
        return self.get_queryset().previous_request_made(ts)

    def from_tutor(self, tutor):
        return self.get_queryset().tutor_request_not_closed(tutor)

    def all_meetings_not_closed(self):
        return self.get_queryset().all_payed_request_not_closed()

    def cost_of_all_request(self):
        return self.get_queryset().cost_of_all_request()

    def cost_for_specific_tutor(self, tutor):
        return self.get_queryset().cost_for_specific_tutor(tutor)

    def is_valid_instance_for_not_collecting_payment_again(self, tutor_skill):
        """Scenario when we should not collect money again from the client. This only
        happens if he has hired a tutor before for the subject and is not hiring for more than
        one instance of the tutorskill"""
        return self.get_queryset().filter(ts__skill=tutor_skill.skill).count() == 2

    def get_request_instance(self, tutor_skill, client):
        """Instance for tutor meeting accounting for case when client has requested to meet
        a previous tutor for the same skill"""
        initial_tutor_request = self.previous_request_made(tutor_skill)
        if initial_tutor_request:
            # if he has, then he doesn't need to pay again
            rtm = TutorMeeting.create(
                ts=tutor_skill,
                client=client,
                wallet_amount=initial_tutor_request.amount_paid,
                amount_paid=tutor_skill.request_to_meet_price,
            )
        else:
            rtm = TutorMeeting.create(
                ts=tutor_skill,
                client=client,
                amount_paid=tutor_skill.request_to_meet_price,
            )
        return rtm


class TutorMeeting(BookingDetailMixin, TimeStampedModel):
    ISSUED = 1
    PAYED = 2
    ACCEPTED = 3
    REJECTED = 4
    STATES = (
        (ISSUED, "issued"),
        (PAYED, "payed"),
        (ACCEPTED, "accepted"),
        (REJECTED, "rejected"),
    )
    order = models.CharField(max_length=12, primary_key=True, db_index=True)
    tutor = models.ForeignKey(
        "users.User", related_name="meetings", on_delete=models.CASCADE
    )
    ts = models.ForeignKey("skills.TutorSkill", null=True, on_delete=models.SET_NULL)
    client = models.ForeignKey(
        "users.User",
        null=True,
        related_name="request_meetings",
        on_delete=models.SET_NULL,
    )
    state = models.IntegerField(default=ISSUED, choices=STATES)
    led_to_booking = models.BooleanField(default=False)
    time_to_call = models.CharField(
        max_length=20, null=True, blank=True, choices=TutorInterview.INTERVIEW_OPTIONS
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    wallet_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    made_payment = models.BooleanField(default=False)
    viewed_by_tutor = models.BooleanField(default=False)
    met_with_client = models.BooleanField(default=False)
    meeting_outcome = models.TextField(max_length=500, blank=True, null=True)
    admin_request = models.BooleanField(default=False)

    objects = TutorMeetingManager()

    class Meta:
        unique_together = ("client", "tutor")

    def post_payment(self, transaction_id=None, amount_paid=0):
        from .tasks import send_mail_to_client_and_tutor_on_successful_booking

        # moves money to user wallet
        admin_wallet = User.get_admin_wallet()
        self.client.wallet.top_up(
            self,
            amount_paid,
            admin_wallet=admin_wallet,
            transaction_type=WalletTransactionType.REQUEST_TUTOR,
        )
        # change booking status to scheduled and update payment status
        self.state = self.PAYED
        self.made_payment = True
        self.save()
        send_mail_to_client_and_tutor_on_successful_booking.delay(
            self.order, float(amount_paid), transaction_id=transaction_id
        )

    # Todo: Test this code.
    @staticmethod
    def create(ts=None, client=None, **kwargs):
        """If client is placing the request for the first time create else return an instance of the previous
        creation"""
        order = generate_code(TutorMeeting)
        obj, is_new = TutorMeeting.objects.get_or_create(
            client_id=client.id, tutor=ts.tutor
        )
        if is_new:
            TutorMeeting.objects.filter(client_id=client.id, tutor=ts.tutor).update(
                order=order, ts=ts, **kwargs
            )
            order1 = order
        else:
            order1 = obj.order
        return TutorMeeting.objects.filter(order=order1).first()

    @property
    def total_price(self):
        return self.amount_paid

    @property
    def real_price(self):
        return self.amount_paid

    @property
    def service_fee(self):
        return self.total_price * 15 / 1000

    def get_absolute_url(self):
        return reverse("close_meeting", args=[self.order])

    def __str__(self):
        return "%s by %s" % (self.order, self.client)


# class BackgroundCheckManager(models.Manager):
#     def pending(self):
#         return self.get_queryset().filter(
#             status=self.model.PENDING)

#     def passed(self):
#         return self.get_queryset().filter(
#             status=self.model.PASSED)


# class BackgroundCheck(BookingDetailMixin, TimeStampedModel):
#     NOT_CHECKED = 1
#     PENDING = 2
#     PASSED = 3
#     FAILED = 4
#     OPTIONS = (
#         (NOT_CHECKED, 'not checked'),
#         (PENDING, 'pending'),
#         (PASSED, 'passed'),
#         (FAILED, 'failed'),
#     )
#     CRIMINAL = 1
#     ADDRESS_CHECK = 2
#     BOTH = 3
#     BACKGROUND_OPTIONS = (
#         (CRIMINAL, 'Criminal Background Check'),
#         (ADDRESS_CHECK, 'Address Verification Check'),
#         (BOTH, 'Both Criminal and Address Check')
#     )
#     status = models.IntegerField(default=NOT_CHECKED, choices=OPTIONS)
#     tutor = models.ForeignKey("users.User", related_name='background_checks')
#     requested_by = models.ForeignKey("users.User", null=True)
#     objects = BackgroundCheckManager()
#     order = models.CharField(max_length=12, db_index=True)
#     amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
#     wallet_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
#     made_payment = models.BooleanField(default=False)

#     @property
#     def total_price(self):
#         return self.amount_paid

#     @classmethod
#     def create(cls, **kwargs):
#         order = generate_code(cls)
#         obj, _ = cls.objects.get_or_create(
#             order=order,
#             **kwargs
#         )
#         return obj

#     def update_amount_to_be_paid(self):
#         tutor_wallet = self.tutor.wallet.amount_available
#         if tutor_wallet >= self.amount_paid:
#             self.wallet_amount = self.amount_paid
#         elif self.amount_paid > tutor_wallet > 0:
#             self.wallet_amount = tutor_wallet
#         else:
#             self.wallet_amount = 0
#         self.save()

#     def process_payment(self):
#         if self.tutor.background_check_consent:
#             self.made_payment = True
#             self.status = self.PENDING
#             admin_wallet = User.get_admin_wallet()
#             self.tutor.wallet.pay_background_check(self, admin_wallet)
#             self.save()

#     def get_absolute_url(self):
#         return reverse('users:edit_verification')

#     def __str__(self):
#         return "%s on %s" % (self.get_status_display(), self.tutor.first_name)
