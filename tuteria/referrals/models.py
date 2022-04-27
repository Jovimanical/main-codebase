import random
from decimal import Decimal

from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.urls import reverse
from django.db import models
from django.utils import timezone
from django_extensions.db.models import TimeStampedModel


def generate_code(referral_class, user, key="offline_code"):
    def _generate_code():
        t = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        return "".join([random.choice(t) for i in range(5)])

    first_name = user.first_name.split()[0].upper()[:2]
    code = "%s%s" % (first_name, _generate_code())
    kwargs = {"offline_code": code}
    while referral_class.objects.filter(**kwargs).exists():
        code = "%s%s" % (first_name, _generate_code())
    return code


class ReferralQuerySet(models.QuerySet):
    def first_booking_reward(self, user):
        b = self.filter()
        pass

    def first_booking_received_reward(self):
        pass

    def new_referrals(self):
        now = timezone.now()
        return self.filter(
            created__year=now.year, created__month=now.month, created__day=now.day
        )


REFERRAL_CODE = (("FIRSTBOOKING", 1500),)


# Create your models here.
class Referral(TimeStampedModel):
    DEFAULT_NO_OF_MONTHS = 1
    UNLIMITED = 100
    CHOICES = ((DEFAULT_NO_OF_MONTHS, "3 months"), (UNLIMITED, "Unlimited months"))
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        primary_key=True,
        related_name="ref_instance",
        verbose_name="user",
        on_delete=models.CASCADE,
    )
    referred_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="referrals",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    used_credit = models.BooleanField(default=False)
    first_class = models.BooleanField(default=False)
    first_booking = models.BooleanField(default=False)
    ref_amount = models.DecimalField(
        default=0, blank=True, max_digits=10, decimal_places=2
    )
    referral_code = models.CharField(max_length=40, blank=True, null=True)
    offline_code = models.CharField(max_length=8, blank=True, null=True)
    offline = models.BooleanField(default=False)
    is_manager = models.BooleanField(default=False)
    date_sent = models.DateTimeField(null=True, blank=True)
    downloaded_form = models.BooleanField(default=False)
    flyer_date = models.DateTimeField(null=True, blank=True)
    manager = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL
    )
    no_of_months = models.IntegerField(default=DEFAULT_NO_OF_MONTHS, choices=CHOICES)
    agreed_percent = models.IntegerField(default=0)
    percent_discount = models.IntegerField(default=0)
    minimum_amount = models.DecimalField(
        default=Decimal(15000), max_digits=16, decimal_places=8
    )

    objects = ReferralQuerySet.as_manager()

    # def get_user_and_amount(self,referralcode):

    def get_referral_payment_amount(self, amount=0):
        if self.agreed_percent > 0:
            return amount * self.agreed_percent / 100.0
        return 2000

    def status(self):
        if self.first_class and self.first_booking:
            return ""
        if not self.first_class and not self.first_booking:
            return "has not booked first class"
        if self.first_class and not self.first_booking:
            if self.owner.is_tutor:
                return "has not received class yet"
            else:
                return "is not a tutor yet"
        return "has not booked first class yet"

    def can_display_link(self):
        if not self.date_sent:
            return True
        seven_days_later = self.date_sent + relativedelta(days=7)
        return timezone.now() > seven_days_later

    @staticmethod
    def get_instance(user, referred_by=None, offline=False):
        from referrals.tasks import free_credit_notification

        r, is_new = Referral.objects.get_or_create(
            owner=user, defaults=dict(percent_discount=0)
        )
        if is_new and referred_by:
            r.referred_by = referred_by
            discount = referred_by.ref_instance.percent_discount
            if discount > 0:
                r.percent_discount = discount
            r.ref_amount = 1500
            # r.offline = offline
            r.save()
            # email to be sent when referral successfully created
            free_credit_notification.delay(r.pk)
        if not r.offline_code:
            r.generate_referral_code()
        return r

    @staticmethod
    def activate_referral(user, code):
        referral = Referral.objects.filter(referral_code=code.upper()).first()
        referral2 = Referral.objects.filter(offline_code=code.upper()).first()
        if referral2:
            Referral.get_instance(user, referral2.owner, offline=True)
        if referral:
            Referral.get_instance(user, referral.owner)

    def generate_referral_code(self):
        # self.offline_code = generate_code(Referral, self.owner)
        self.save()

    def first_booking_rewarded(self, amount):
        """Has rewarded instance referred_by after user places first booking.
        Booking must be greater or equal to 15000"""
        from users.models import User
        from referrals.tasks import send_email_on_referral_earned

        if self.first_class == False:
            admin_wallet = User.get_admin_wallet()
            new_amount = amount
            if self.used_credit:
                new_amount = amount - self.ref_amount
            new_amount = self.determine_amount_to_be_paid_to_referrer(new_amount)
            if self.referred_by:
                self.referred_by.wallet.referral_earning(
                    self.owner, "client_booking", new_amount, admin_wallet
                )
                user_bookings = self.owner.orders.closed()
                if user_bookings == 3:
                    self.first_class = True
                self.save()
                # send mail to referral
                send_email_on_referral_earned.delay(self.pk, "completed", float(amount))

    def first_booking_received_rewarded(self, amount):
        """Has rewarded instance referred_by after user has become a tutor and
        has received his"""
        from users.models import User
        from referrals.tasks import send_email_on_referral_earned

        tutor_booking = self.owner.t_bookings.completed().count()
        if (
            not self.first_booking
            and amount >= self.minimum_amount
            and tutor_booking == 0
        ):
            admin_wallet = User.get_admin_wallet()
            new_amount = self.get_referral_payment_amount(amount)
            # pdb.set_trace()
            if self.referred_by:
                self.referred_by.wallet.referral_earning(
                    self.owner, "tutor_booking", new_amount, admin_wallet
                )

                self.first_booking = True
                self.save()
                # send mail to referral
                send_email_on_referral_earned.delay(self.pk, "delivered", float(2000))
        self.determine_reward_termination()

    def determine_reward_termination(self):
        tutor_booking = self.owner.t_bookings.completed().count()
        if tutor_booking >= self.no_of_months:
            Referral.objects.filter(pk=self.pk).update(first_booking=True)

    def total_earned(self):
        bookings_made = self.owner.orders.first_booking_above_15000()
        bookings_received = self.owner.t_bookings.first_booking_above_15000()
        a = 0
        b = 0
        if bookings_made:
            if Decimal(15000) <= bookings_made.total_price < Decimal(50000):
                a = Decimal(1500)
            if Decimal(50000) <= bookings_made.total_price < Decimal(100000):
                a = Decimal(3000)
            if bookings_made.total_price >= Decimal(100000):
                a = Decimal(5000)
        if bookings_received:
            if bookings_received.total_price >= Decimal(1500):
                b = Decimal(1500)
        return a + b

    def __str__(self):
        return "<Referral: {}>".format(self.owner)

    @property
    def referred_someone(self):
        """function to check if referre has referred someone """
        return Referral.objects.filter(referred_by=self.owner).exists()

    def determine_amount_to_be_paid_to_referrer(self, amount):
        """Determine amount to be paid to referrer"""
        return amount * Decimal(0.1)

    def get_discount_value(self, original_amount):
        """Returns the discount value to be deducted from
        The booking price"""
        if self.percent_discount > 0:
            return Decimal(self.percent_discount * original_amount / 100)
        return Decimal(1500)


class EmailInvite(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="invitations",
        null=True,
        on_delete=models.SET_NULL,
    )
    email = models.EmailField()
    email_sent = models.BooleanField(default=False)

    def is_user(self):
        from users.models import User

        return User.objects.filter(email=self.email).exists()

    def __str__(self):
        return "%s" % (self.email,)

    @staticmethod
    def create_new(email, user):
        instance, is_new = EmailInvite.objects.get_or_create(email=email)
        if is_new:
            instance.user = user
            instance.save()
        return instance

    def get_absolute_url(self):
        return reverse("users:referral_signup", args=[self.user.slug])
