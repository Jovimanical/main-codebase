# coding=utf-8
from decimal import Decimal

from requests.api import request
from django.db.models.functions import Concat
from django.db import models
from django.db.models import Q

# Create your models here.
from django.dispatch import receiver
from django.utils.functional import cached_property
from django.utils.translation import ugettext as _
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from django_extensions.db.models import TimeStampedModel
from config.signals import successful_payment, when_client_closes_session
from users.models import User
from ..mixins import WalletMixin
from bookings.mixins import BookingMixin
from config.utils import generate_code
from django.conf import settings
from config.utils import PayStack
from ..helpers import get_bank_list


class WalletTransactionType:
    DEPOSIT = 1
    TUTOR_HIRE = 2  # used
    WITHDRAWAL = 3  # used
    EARNING = 4  # used
    SERVICE_CHARGE = 5
    REFUND = 6  # used
    CANCELLATION_PENALTY = 7
    ADMINS_CUT = 8
    REFERRAL_CREDIT = 9
    ACCOUNT_LOAD_CREDIT = 10
    BONUS_CREDIT = 11
    BACKGROUND_CHECK = 12
    WITHDRAWAL_COMPLETED = 13
    REQUEST_TUTOR = 14
    REFERRAL_BOOKING_MADE = 15
    REFERRAL_NEW_BOOKING = 16
    REFERRAL_PAYMENT = 17
    PROCESSING_FEE = 18
    BANK_CHARGES = 19
    WRITING_FEE = 20
    BOOKING_NOT_COMPLETED_PENALTY = 21
    ABSCONDED = 22
    TRANSPORT_FARE = 23
    WITHOLDING_TAX = 24

    CHOICES = (
        (DEPOSIT, "DEPOSIT"),
        (TUTOR_HIRE, "TUTOR_HIRE"),
        (WITHDRAWAL, "WITHDRAWAL"),
        (EARNING, "TUTOR EARNING"),
        (SERVICE_CHARGE, "SERVICE_CHARGE"),
        (REFUND, "REFUND"),
        (CANCELLATION_PENALTY, "CANCELLATION_PENALTY"),
        (ADMINS_CUT, "TUTERIA EARNING"),
        (REFERRAL_CREDIT, "REFERRAL_CREDIT"),
        (ACCOUNT_LOAD_CREDIT, "ACCOUNT_LOAD_CREDIT"),
        (BONUS_CREDIT, "BONUS_CREDIT"),
        (BACKGROUND_CHECK, "BACKGROUND_CHECK"),
        (WITHDRAWAL_COMPLETED, "WITHDRAWAL_COMPLETED"),
        (REQUEST_TUTOR, "REQUEST_TUTOR"),
        (REFERRAL_NEW_BOOKING, "REFERRAL_NEW_BOOKING"),
        (REFERRAL_BOOKING_MADE, "REFERRAL_BOOKING_MADE"),
        (REFERRAL_PAYMENT, "REFERRAL_PAYMENT"),
        (PROCESSING_FEE, "PROCESSING_FEE"),
        (BANK_CHARGES, "BANK_CHARGES"),
        (WRITING_FEE, "WRITING_FEE"),
        (BOOKING_NOT_COMPLETED_PENALTY, "BOOKING NOT COMPLETED PENALTY"),
        (ABSCONDED, "ABSCONDED"),
        (WITHOLDING_TAX, "WITHOLDING_TAX"),
        (TRANSPORT_FARE, "TRANSPORT_FARE"),
    )

    INCOME = "income"
    EXPENDITURE = "expenditure"
    TYPES = (
        (INCOME, "income"),
        (EXPENDITURE, "expenditure"),
        (ABSCONDED, "ABSCONDED"),
        (BOOKING_NOT_COMPLETED_PENALTY, "BOOKING NOT COMPLETED PENALTY"),
    )

    # @staticmethod
    # def SERVICE_FEE(price, per_hour):
    # if per_hour < 1500:
    # return price * 10 / Decimal(100)
    # else:
    # return price * 5 / Decimal(100)
    @classmethod
    def log_string(cls, tr):
        # if tr.type == cls.DEPOSIT:
        # return u"₦{} deposited on {}".format(tr.amount, tr.created)
        if tr.type == cls.TUTOR_HIRE:
            return "Payment used to hire tutor"
            # if tr.type == cls.ACCOUNT_LOAD_CREDIT:
            # return u"₦{} load credit earned".format(tr.credit)
            # if tr.type == cls.ADMINS_CUT:
            # return u"₦{} paid to admin".format(tr.amount)
        if tr.type == cls.BONUS_CREDIT:
            return "₦{} bonus earned for placing first booking".format(tr.credit)
        if tr.type == cls.REQUEST_TUTOR:
            return "Requested tutor deposit"
        if tr.type == cls.CANCELLATION_PENALTY:
            return "₦{} tutor's cancellation fee".format(round(tr.amount, 2))
        if tr.type == cls.BOOKING_NOT_COMPLETED_PENALTY:
            return "₦{} tutor's cancellation fee".format(round(tr.amount, 2))
        if tr.type == cls.EARNING:
            return "Earned from completed lesson"
            # if tr.type == cls.REFERRAL_CREDIT:
            # return u"₦{} referral credit earned".format(tr.credit)
        if tr.type == cls.REFUND:
            return "Refunded from cancelled lesson"
        if tr.type == cls.ABSCONDED:
            return "tutor's absconding penanlty fee "
        if tr.type == cls.WITHDRAWAL_COMPLETED:
            return "Withdrawal Completed Summary"
            # if tr.type == cls.SERVICE_CHARGE:
            # return u"₦{} service charge".format(tr.amount)
            # if tr.type == cls.BACKGROUND_CHECK:
            # return u"₦{} used in requesting background
            # check".format(tr.amount)
        if tr.type == cls.DEPOSIT:
            return "₦{} Deposited".format(round(tr.amount, 2))

        if tr.type == cls.REFERRAL_BOOKING_MADE:
            return "₦{} Rewarded for referred client placing booking".format(
                round(tr.amount, 2)
            )

        if tr.type == cls.REFERRAL_NEW_BOOKING:
            return "₦{} Rewarded for referred client first client booking".format(
                round(tr.amount, 2)
            )
        if tr.type == cls.REFERRAL_PAYMENT:
            return "₦{} Paid for referral ".format(round(tr.amount, 2))
        if tr.type == cls.PROCESSING_FEE:
            return tr.extra_message
        if tr.type == cls.TRANSPORT_FARE:
            return "₦{} Transport fare for tutor".format(round(tr.amount, 2))
        if tr.type == cls.BANK_CHARGES:
            return "Bank Charge of ₦100"
        else:
            return "Withdrawn Initiated"

    @classmethod
    def to_string(cls, tr):
        if tr.type == cls.DEPOSIT:
            return "₦{} deposited on {}".format(round(tr.amount, 2), tr.created)
        if tr.type == cls.REQUEST_TUTOR:
            return "₦{} deposited in requesting tutor on {}".format(
                round(tr.amount, 2), tr.created
            )
        if tr.type == cls.TUTOR_HIRE:
            return "₦{} used to hire tutor".format(round(tr.amount, 2))
        if tr.type == cls.ACCOUNT_LOAD_CREDIT:
            return "₦{} load credit earned".format(round(tr.credit, 2))
        if tr.type == cls.ADMINS_CUT:
            return "₦{} paid to admin".format(round(tr.amount, 2))
        if tr.type == cls.BONUS_CREDIT:
            return "₦{} bonus earned".format(round(tr.credit, 2))
        if tr.type == cls.CANCELLATION_PENALTY:
            return "₦{} tutor's cancellation fee".format(round(tr.amount, 2))
        if tr.type == cls.BOOKING_NOT_COMPLETED_PENALTY:
            return "₦{} tutor's cancellation fee".format(round(tr.amount, 2))
        if tr.type == cls.ABSCONDED:
            return "tutor's absconding penanlty fee "
        if tr.type == cls.EARNING:
            return "₦{} earned from tutoring".format(round(tr.amount, 2))
        if tr.type == cls.REFERRAL_CREDIT:
            return "₦{} referral credit earned".format(round(tr.credit, 2))
        if tr.type == cls.REFUND:
            return "₦{} refunded back".format(round(tr.amount, 2))
        if tr.type == cls.SERVICE_CHARGE:
            return "₦{} service charge".format(round(tr.amount, 2))
        if tr.type == cls.BACKGROUND_CHECK:
            return "₦{} used in requesting background check".format(round(tr.amount, 2))
        if tr.type == cls.WITHDRAWAL_COMPLETED:
            return "₦{} successfully paid to client account on {}".format(
                round(tr.amount, 2), tr.created
            )
        if tr.type == cls.PROCESSING_FEE:
            return tr.extra_message
        if tr.type == cls.TRANSPORT_FARE:
            return "₦{} Transport fare for tutor".format(round(tr.amount, 2))
        else:
            return "₦{} withdrawn on {}".format(round(tr.amount, 2), tr.created)


def compose_and_delete(queryset, booking):
    new_record = queryset.first()
    pk = None
    if new_record:
        amt = queryset.exclude(booking__squashed=True).sum_up_all_transactions()
        new_record.amount = amt["t_amount"]
        new_record.booking = booking
        new_record.credit = amt["t_credit"]
        new_record.save()
        pk = new_record.pk
    queryset.exclude(pk=pk).delete()


class SumSubquery(models.Subquery):
    template = "(SELECT SUM(%(sum_field)s) FROM (%(subquery)s) _sum)"
    output_field = models.DecimalField()

    def __init__(self, queryset, output_field=None, *, sum_field, **extra):
        extra["sum_field"] = sum_field
        super(SumSubquery, self).__init__(queryset, output_field, **extra)


class WalletTransactionQueryset(models.QuerySet):
    # def total_amount(self):
    #     return self.extra(select={
    #         't_amount':'(credit+amount)'
    #         })

    def get_revenue_with_tutor_earning(self, year=None):
        earnings = self.tutor_earning()
        revenue = self.used_to_hire()
        if year:
            earnings = earnings.filter(created__year=year)
            revenue = revenue.filter(created__year=year)
        return {
            'earnings': earnings.count(),
            'revenue': revenue.count()
        }

    def tutor_earning_statistics(self):
        from bookings.models import BookingSession

        amount_paid = BookingSession.objects.filter(
            booking_id=models.OuterRef("booking_id")
        ).values("price")
        return (
            self.tutor_earning()
            .annotate(
                client_name=Concat(
                    models.F("booking__user__first_name"),
                    models.Value(" "),
                    models.F("booking__user__last_name"),
                ),
                tutor_assigned=Concat(
                    models.F("booking__tutor__first_name"),
                    models.Value(" "),
                    models.F("booking__tutor__last_name"),
                ),
                client_amount_paid=SumSubquery(amount_paid, sum_field="price"),
                tutor_fee=models.F("amount"),
                date=models.F("booking__created"),
            )
            .values("client_name", "tutor_assigned", "client_amount_paid", "tutor_fee", "date")
        )

    def profile_written(self):
        return self.filter(type=WalletTransactionType.WRITING_FEE).values_list(
            "wallet__owner_id", flat=True
        )

    def squash_transactions(self, booking, stale_booking_ids, end_date=None):
        """Squash all transactions between client and tutor

        Expects the tutor_hire transaction for client to be squashed
        Expects the earning, withdrawn,withdrawn completed and bank charges
        for tutor to be squashed

        Arguments:
            booking {Booking} -- Booking instance
        """
        user_transactions = WalletTransaction.objects.filter(
            wallet__owner=booking.user, booking__tutor=booking.tutor
        ).used_to_hire()
        tutor_transactions = WalletTransaction.objects.filter(
            wallet__owner=booking.tutor
        )
        admin_transactions = WalletTransaction.objects.filter(
            booking_id__in=stale_booking_ids
        )
        if end_date:
            user_transactions = user_transactions.filter(
                booking__first_session__lt=end_date
            )
            tutor_transactions = tutor_transactions.filter(
                booking__first_session__lt=end_date
            )
            admin_transactions = admin_transactions.filter(
                booking__first_session__lt=end_date
            )
        earnings = tutor_transactions.filter(booking__user=booking.user)
        compose_and_delete(user_transactions, booking)
        compose_and_delete(earnings.tutor_earning(), booking)
        compose_and_delete(tutor_transactions.withdrawn(), None)
        compose_and_delete(tutor_transactions.withdrawn_completed(), None)
        compose_and_delete(tutor_transactions.bank_charges(), None)
        compose_and_delete(admin_transactions, booking)

    def aggregate_amount(self):
        """Returns the total sum of all amounts as a dictionary"""
        result = self.aggregate(t_amount=models.Sum("amount"))
        if result["t_amount"] == None:
            result["t_amount"] = 0
        return result

    def sum_up_all_transactions(self):
        """Returns the total sum of all amounts and credits used as a dictionary"""
        result = self.aggregate(
            t_amount=models.Sum("amount"), t_credit=models.Sum("credit")
        )
        if result["t_amount"] == None:
            result["t_amount"] = 0
        if result["t_credit"] == None:
            result["t_credit"] = 0
        return result

    def in_year(self, year):
        return (
            self.filter(created__year=year).aggregate(cc=models.Sum("amount"))["cc"]
            or 0
        )

    def for_tutor(self, tutor):
        return self.filter(booking__tutor=tutor)

    def processing_fee(self):
        return self.filter(type=WalletTransactionType.PROCESSING_FEE)

    def deposited(self):
        return self.filter(type=WalletTransactionType.DEPOSIT)

    def in_session(self):
        return self.used_to_hire().exclude(
            Q(booking__status=BookingMixin.COMPLETED)
            | Q(booking__status=BookingMixin.CANCELLED)
        )

    def payment_to_tutors(self, user):
        return self.payed_to_tutor().exclude(booking__tutor=user)

    def refunded(self):
        return self.filter(type=WalletTransactionType.REFUND)

    def payed_to_tutor(self):
        return self.used_to_hire().filter(
            Q(booking__status=BookingMixin.COMPLETED)
            | Q(booking__status=BookingMixin.CANCELLED)
        )

    def used_to_hire(self):
        return self.filter(type=WalletTransactionType.TUTOR_HIRE)

    def withdrawn(self):
        return self.filter(type=WalletTransactionType.WITHDRAWAL)

    def withdrawn_completed(self):
        return self.filter(type=WalletTransactionType.WITHDRAWAL_COMPLETED)

    def bank_charges(self):
        return self.filter(type=WalletTransactionType.BANK_CHARGES)

    def admin_pay(self):
        return self.filter(type=WalletTransactionType.ADMINS_CUT)

    def earned(self):
        return self.filter(transaction_type=WalletTransactionType.INCOME)

    def earnings_used_to_hire(self):
        return self.filter(type=WalletTransactionType.TUTOR_HIRE, credit__gt=0)

    def pending(self):
        return self.filter(
            booking__status=BookingMixin.DELIVERED,
            type=WalletTransactionType.TUTOR_HIRE,
        )

    def upcoming(self):
        return self.filter(
            booking__status=BookingMixin.SCHEDULED,
            type=WalletTransactionType.TUTOR_HIRE,
        )

    def tutor_earning(self):
        return self.filter(type=WalletTransactionType.EARNING)

    def from_referrals(self):
        return self.filter(
            models.Q(type=WalletTransactionType.REFERRAL_BOOKING_MADE)
            | models.Q(type=WalletTransactionType.REFERRAL_NEW_BOOKING)
        )

    def total_amount(self):
        return self.annotate(
            total_amount=models.Sum(
                models.Case(
                    models.When(
                        wallet__transactions__type=WalletTransactionType.TUTOR_HIRE,
                        then=models.F("wallet__transactions__amount")
                        + models.F("wallet__transactions__credit"),
                    ),
                    output_field=models.DecimalField(),
                )
            )
        )

    def with_bookings(self):
        return (
            self.annotate(first_name=models.F("booking__user__first_name"))
            .annotate(last_name=models.F("booking__user__last_name"))
            .annotate(email=models.F("booking__user__email"))
        )

    def total_paid(self):
        return self.annotate(
            total_paid=models.Sum(
                models.Case(
                    models.When(
                        wallet__transactions__type=WalletTransactionType.TUTOR_HIRE,
                        then=models.F("wallet__transactions__amount_paid"),
                    ),
                    output_field=models.DecimalField(),
                )
            )
        )

    def booking_history(self):
        booking_paid = models.Q(
            wallet__transactions__type=WalletTransactionType.TUTOR_HIRE
        ) & models.Q(
            wallet__transactions__amount_paid=models.F("wallet__transactions__amount")
            + models.F("wallet__transactions__credit")
        )
        return self.annotate(
            booking_total=models.Sum(
                models.Case(
                    models.When(
                        wallet__transactions__type=WalletTransactionType.TUTOR_HIRE,
                        then=1,
                    ),
                    default=models.Value(0),
                    output_field=models.IntegerField(),
                )
            ),
            booking_paid=models.Sum(
                models.Case(
                    models.When(booking_paid, then=1),
                    default=models.Value(0),
                    output_field=models.IntegerField(),
                )
            ),
        )

    def booking_times(self):
        return self.used_to_hire().annotate(
            bd=models.F("booking__last_session") - models.F("booking__first_session"),
            btp=models.F("modified") - models.F("booking__first_session"),
            ltp=models.F("modified") - models.F("booking__last_session"),
        )

    def transaction_not_paid(self):
        return (
            self.used_to_hire()
            .annotate(
                remainder=models.F("amount")
                + models.F("credit")
                - models.F("amount_paid")
            )
            .filter(remainder__gt=0)
            .total_amount()
            .total_paid()
            .annotate(total_owed=models.F("total_amount") - models.F("total_paid"))
        )

    # def total_amount_owed(self)


class WalletTransactionManager(models.Manager):
    def get_revenue_with_tutor_earning(self, *args, **kwargs):
        return self.get_queryset().get_revenue_with_tutor_earning(*args,**kwargs)
    def get_queryset(self):
        return WalletTransactionQueryset(self.model, using=self._db).with_bookings()

    def tutor_earning_statistics(self):
        return self.get_queryset().tutor_earning_statistics()

    def profile_written(self):
        return self.get_queryset().profile_written()

    def squash_transactions(self, *args, **kwargs):
        # import ipdb; ipdb.set_trace()
        return WalletTransactionQueryset(
            self.model, using=self._db
        ).squash_transactions(*args, **kwargs)

    def admin_pay(self):
        return self.get_queryset().admin_pay()

    def withdrawn_completed(self):
        return self.get_queryset().withdrawn_completed()

    def processing_fee(self):
        return self.get_queryset().processing_fee()

    def bank_charges(self):
        return self.get_queryset().bank_charges()

    def tutor_earning(self):
        return self.get_queryset().tutor_earning()

    def for_tutor(self, tutor):
        return self.get_queryset().for_tutor(tutor)

    def withdrawn(self):
        return self.get_queryset().withdrawn()

    def from_referrals(self):
        return self.get_queryset().from_referrals()

    def used_to_hire(self):
        return self.get_queryset().used_to_hire()

    def payed(self):
        return self.get_queryset().used_to_hire().first()

    def cancelled(self):
        return self.get_queryset().filter(
            type=WalletTransactionType.CANCELLATION_PENALTY
        )

    def refund(self):
        return self.get_queryset().filter(type=WalletTransactionType.REFUND)

    def background_check(self):
        return self.get_queryset().filter(type=WalletTransactionType.BACKGROUND_CHECK)

    def transaction_not_paid(self):
        return self.get_queryset().transaction_not_paid()


class WalletTransaction(TimeStampedModel):
    type = models.IntegerField(choices=WalletTransactionType.CHOICES)
    wallet = models.ForeignKey(
        "Wallet", related_name="transactions", on_delete=models.CASCADE
    )
    amount = models.DecimalField(default=Decimal(0), max_digits=16, decimal_places=8)
    transaction_type = models.CharField(
        choices=WalletTransactionType.TYPES,
        default=WalletTransactionType.INCOME,
        max_length=15,
    )
    credit = models.DecimalField(
        max_digits=16, decimal_places=8, default=Decimal("0.00")
    )
    amount_paid = models.DecimalField(
        max_digits=16, decimal_places=8, default=Decimal("0.00")
    )

    total = property(lambda self: self.amount + self.credit)
    booking = models.ForeignKey(
        "bookings.Booking",
        related_name="wallet_transactions",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    status = property(lambda self: self.get_type_display())
    extra_message = models.CharField(max_length=150, blank=True, null=True)
    # content_type = models.ForeignKey(ContentType)
    # object_id = models.PositiveIntegerField()
    # actual field used
    # content_object = GenericForeignKey('content_type', 'object_id')
    remark = models.TextField(null=True, blank=True)
    request_made = models.ForeignKey(
        "external.BaseRequestTutor",
        related_name="request_transactions",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    objects = WalletTransactionManager()

    def __str__(self):
        return WalletTransactionType.to_string(self)

    @property
    def to_string(self):
        return WalletTransactionType.log_string(self)

    def __repr__(self):
        return "<WalletTransaction: %s %s>" % (
            self.get_type_display(),
            round(self.amount + self.credit, 2),
        )

    @property
    def is_owing(self):
        return (self.amount + self.credit - self.amount_paid) > 0

    @property
    def bank_name(self):
        if self.wallet:
            payout: UserPayout = self.wallet.owner.bank_payout
            if payout:
                return payout.account_name

    @property
    def bank(self):
        if self.wallet:
            payout: UserPayout = self.wallet.owner.bank_payout
            if payout:
                return payout.bank

    @property
    def booking_amount(self):
        if self.booking:
            return float("%.2f" % self.booking.total_price)


class WalletQuerySet(models.QuerySet):
    def booking_history(self):
        booking_paid = models.Q(
            transactions__type=WalletTransactionType.TUTOR_HIRE
        ) & models.Q(
            transactions__amount_paid=models.F("transactions__amount")
            + models.F("transactions__credit")
        )
        return self.annotate(
            booking_total=models.Sum(
                models.Case(
                    models.When(
                        transactions__type=WalletTransactionType.TUTOR_HIRE, then=1
                    ),
                    output_field=models.IntegerField(),
                )
            ),
            booking_paid=models.Sum(
                models.Case(
                    models.When(booking_paid, then=1),
                    output_field=models.IntegerField(),
                )
            ),
        )


class Wallet(WalletMixin, TimeStampedModel):
    WALLET_TYPE = (("user", "user"), ("admin", "admin"))
    credits = models.DecimalField(default=Decimal(0), max_digits=16, decimal_places=8)
    amount_available = models.DecimalField(
        default=Decimal(0), max_digits=16, decimal_places=8
    )
    amount_in_session = models.DecimalField(
        default=Decimal(0), max_digits=16, decimal_places=8
    )
    credit_in_session = models.DecimalField(
        default=Decimal(0), max_digits=16, decimal_places=8
    )
    previous_available_balance = models.DecimalField(
        default=Decimal(0), max_digits=16, decimal_places=8
    )
    wallet_type = models.CharField(choices=WALLET_TYPE, default="user", max_length=10)
    authorization_code = models.CharField(max_length=50, blank=True, null=True)
    owner = models.OneToOneField(User, related_name="wallet", on_delete=models.CASCADE)
    auto_withdraw = models.BooleanField(default=False)

    objects = WalletQuerySet.as_manager()

    @property
    def total_available_balance(self):
        return self.amount_available + self.credits

    @property
    def total_amount_owing(self):
        amount_owed = (
            self.transactions.all()
            .transaction_not_paid()
            .aggregate(
                ama=models.Sum(
                    models.F("amount") + models.F("credit") - models.F("amount_paid")
                )
            )["ama"]
            or 0
        )
        return round(amount_owed, 0)

    @property
    def total_in_session(self):
        return self.amount_in_session + self.credit_in_session

    @property
    def total_amount_loaded(self):
        return self.total_amounts(WalletTransactionType.DEPOSIT)

    @property
    def total_amount_earned(self):
        return self.total_amounts(WalletTransactionType.EARNING)

    @property
    def total_amount_withdrawn(self):
        return self.total_amounts(WalletTransactionType.WITHDRAWAL)

    @property
    def total_referral_credit(self):
        return self.get_total_credits(WalletTransactionType.REFERRAL_CREDIT)

    @property
    def total_referral_earning(self):
        return (
            self.transactions.from_referrals()
            .aggregate(models.Sum("amount"))
            .get("amount__sum")
            or 0
        )

    @property
    def simple_withrawable(self):
        b_c = self.total_bonus_credit["credit__sum"] or 0
        v = self.owner
        if hasattr(v, "ref_instance"):
            if v.ref_instance.used_credit is False:
                if self.amount_available > 0:
                    return self.amount_available - b_c
                return self.amount_available - v.ref_instance.ref_amount - b_c
        if self.amount_available > 0:
            return self.amount_available - b_c
        return self.amount_available

    @property
    def displayable_amount(self):
        v = self.owner
        if hasattr(v, "ref_instance"):
            if v.ref_instance.used_credit is False:
                return self.amount_available + v.ref_instance.ref_amount
        return self.amount_available

    @property
    def total_earned_from_referrals(self):
        a = (
            self.total_amounts(WalletTransactionType.REFERRAL_BOOKING_MADE)[
                "amount__sum"
            ]
            or 0
        )
        b = (
            self.total_amounts(WalletTransactionType.REFERRAL_NEW_BOOKING)[
                "amount__sum"
            ]
            or 0
        )
        return a + b

    @property
    def total_amount_earned_by_tutors(cls):
        return (
            WalletTransaction.objects.filter(
                type=WalletTransactionType.TUTOR_HIRE
            ).aggregate(models.Sum("amount"))["amount__sum"]
            * 7
            / 10
        )

    @property
    def amount_earned_last_week_by_tutors(self):
        two_weeks = timezone.now() - relativedelta(days=15)
        x = (
            WalletTransaction.objects.filter(
                type=WalletTransactionType.TUTOR_HIRE, created__gte=two_weeks
            ).aggregate(models.Sum("amount"))["amount__sum"]
            or 0
        )
        return x * 7 / 10

    @property
    def total_load_credit(self):
        return self.get_total_credits(WalletTransactionType.ACCOUNT_LOAD_CREDIT)

    @property
    def total_credits(self):
        return (
            self.total_referral_credit["credit__sum"]
            + self.total_load_credit["credit__sum"]
        )

    @property
    def total_bonus_credit(self):
        return self.get_total_credits(WalletTransactionType.BONUS_CREDIT)

    @property
    def total_amount_spent(self):
        return self.total_transaction(WalletTransactionType.EXPENDITURE)

    @property
    def total_credit_used(self):
        return self.get_total_credits(WalletTransactionType.TUTOR_HIRE)

    def get_total_credits(self, transaction_type):
        return self.transactions.filter(type=transaction_type, credit__gt=0).aggregate(
            models.Sum("credit")
        )

    def total_amounts(self, transaction_type):
        return self.transactions.filter(type=transaction_type).aggregate(
            models.Sum("amount")
        )

    def get_details_for_chart(self):
        hire_transactions = (
            self.transactions.filter(type=WalletTransactionType.TUTOR_HIRE)
            .order_by("created")
            .values(
                "created",
                "modified",
                "amount",
                "credit",
                "amount_paid",
                "booking__last_session",
                "booking__first_session",
            )
        )
        return hire_transactions

    def total_transaction(self, transaction_type):
        return self.transactions.filter(transaction_type=transaction_type).aggregate(
            models.Sum("amount")
        )

    def deduct_writing_fee(self, fee_amount):
        exists = self.transactions.filter(
            type=WalletTransactionType.WRITING_FEE
        ).exists()
        if not exists:
            WalletTransaction.objects.create(
                type=WalletTransactionType.WRITING_FEE,
                amount=Decimal(fee_amount),
                transaction_type=WalletTransactionType.EXPENDITURE,
                wallet=self,
                extra_message=f"{fee_amount} Payment for writing profile",
            )
            self.amount_available -= fee_amount
            self.save()

    def pay_processing_fee(
        self,
        request_slug,
        admin_wallet,
        deduct=False,
        fee_amount=settings.PROCESSING_FEE,
        actual_amount=0,
        request=None,
    ):
        processing_fee = "Processing Fee payment for request #{}".format(request_slug)
        WalletTransaction.objects.create(
            type=WalletTransactionType.PROCESSING_FEE,
            amount=Decimal(fee_amount),
            transaction_type=WalletTransactionType.EXPENDITURE,
            wallet=self,
            extra_message=processing_fee,
            request_made=request,
        )

        WalletTransaction.objects.create(
            type=WalletTransactionType.PROCESSING_FEE,
            amount=Decimal(fee_amount),
            transaction_type=WalletTransactionType.INCOME,
            wallet=admin_wallet,
            extra_message=processing_fee + " by {}".format(self.owner.email),
        )
        if deduct:
            self.amount_available -= Decimal(fee_amount)
            self.save()
        admin_wallet.amount_available += Decimal(fee_amount)
        admin_wallet.save()

    def refund_processing_fee(self, payout, created=None):
        from gateway_client import TuteriaDetail

        processing_fees = self.transactions.processing_fee()
        if created:
            processing_fees = processing_fees.filter(
                created__year=created.year, created__month=created.month
            )
        refund_amount = TuteriaDetail.processing_fee + 100
        self.amount_available += refund_amount
        self.save()
        self.initiate_withdrawal(payout, self.amount_available)
        processing_fees.delete()

    def top_up2(self, amount, credit=0, wallet_amount=0):
        WalletTransaction.objects.create(
            type=WalletTransactionType.DEPOSIT,
            amount=amount,
            credit=credit,
            transaction_type=WalletTransactionType.INCOME,
            wallet=self,
        )
        self.amount_available += Decimal(amount) + Decimal(credit)
        self.save()

    def top_up(
        self,
        booking,
        amount,
        transaction_type=WalletTransactionType.DEPOSIT,
        admin_wallet=None,
    ):
        """When user loads money into his/her wallet. Either through request to meet or by deposit."""
        if booking.wallet_amount <= 0:
            WalletTransaction.objects.create(
                type=transaction_type,
                amount=booking.total_price,
                transaction_type=WalletTransactionType.INCOME,
                credit=booking.wallet_amount,
                wallet=self,
            )

            WalletTransaction.objects.create(
                type=WalletTransactionType.SERVICE_CHARGE,
                amount=booking.service_fee,
                transaction_type=WalletTransactionType.INCOME,
                wallet=admin_wallet,
            )
            # moves actual money to in user wallet
            self.amount_available += booking.total_price
            self.save()
            # service charge moves to admin account. Ensure this account is created prior
            # to other accounts
            admin_wallet.amount_available += booking.service_fee
            admin_wallet.save()

    def top_up_credit(self, amount, t_type=WalletTransactionType.REFERRAL_CREDIT):
        if amount > 0:
            WalletTransaction.objects.create(
                wallet=self,
                type=t_type,
                transaction_type=WalletTransactionType.INCOME,
                credit=amount,
            )
            if t_type == WalletTransactionType.BONUS_CREDIT:
                data = dict(
                    previous_available_balance=self.amount_available,
                    amount_available=(self.amount_available + amount),
                )
            else:
                data = dict(credits=(self.credits + amount))
            Wallet.objects.filter(id=self.id).update(**data)

    def to_session(self, booking, edit=False, created_date=None, skip=False):
        # constructs service fee
        admin = User.get_admin_wallet()
        fields = dict(
            amount=booking.total_price,
            transaction_type=WalletTransactionType.EXPENDITURE,
            credit=-booking.wallet_amount,
        )
        hire, _ = WalletTransaction.objects.get_or_create(
            wallet=self,
            type=WalletTransactionType.TUTOR_HIRE,
            booking=booking,
        )

        for key, value in fields.items():
            setattr(hire, key, value)
        hire.save()
        if created_date:
            WalletTransaction.objects.filter(pk=hire.pk).update(created=created_date)
        if booking.service_fee > 0 and not edit:
            WalletTransaction.objects.create(
                type=WalletTransactionType.SERVICE_CHARGE,
                amount=booking.service_fee,
                transaction_type=WalletTransactionType.INCOME,
                booking=booking,
                wallet=admin,
            )
        # moves actual money to in session
        if not created_date:
            if edit:
                self.amount_in_session = booking.total_price
            else:
                self.amount_in_session += booking.total_price
                # difference = booking.wallet_amount - booking.total_price
                # if difference > 0:
                #     self.amount_in_session += difference
                # if self.credit_in_session
                # self.amount_available -= booking.wallet_amount
            self.save()
        # service charge moves to admin account. Ensure this account is created prior
        # to other accounts
        if not edit:
            admin.amount_available += booking.service_fee
            admin.save()

    def session_taught(self, amount, credit=0, booking=None):
        if booking:
            data = dict(
                amount_in_session=(self.amount_in_session - booking.amount_spent),
                credit_in_session=self.credit_in_session - booking.credit_used,
            )
        else:
            data = dict(
                amount_in_session=(self.amount_in_session - amount),
                credit_in_session=self.credit_in_session - credit,
            )
        Wallet.objects.filter(id=self.id).update(**data)

    def hire_tutor(self, price, price_per_hour=1000):
        if price <= 0:
            raise InvalidException(_("Can't send zero or negative amounts"))
        if price > self.amount_available:
            raise InvalidException(_("Trying to send too much"))
        self.to_session(price, price_per_hour=price_per_hour)

    def withdraw(self, amount):
        if amount > self.amount_available:
            raise InvalidException(_("Trying to withdraw more than you earn"))
        WalletTransaction.objects.create(
            wallet=self,
            type=WalletTransactionType.WITHDRAWAL,
            transaction_type=WalletTransactionType.EXPENDITURE,
            amount=amount,
        )

        Wallet.objects.filter(id=self.id).update(
            previous_available_balance=self.amount_available,
            amount_available=(self.amount_available - amount),
        )

    def initiate_withdrawal(self, payout=None, amount=0, charge=0, force=False):
        """Create Request to withdraw instance and deduct amount from amount available"""
        ttype = (
            WalletTransactionType.REFUND if force else WalletTransactionType.WITHDRAWAL
        )
        WalletTransaction.objects.create(
            type=ttype,
            wallet=self,
            transaction_type=WalletTransactionType.EXPENDITURE,
            amount=amount,
        )
        kwargs = {
            "payout": payout,
            "user": self.owner,
            "amount": amount - charge,
            "charge": charge,
            "order": generate_code(RequestToWithdraw),
        }
        RequestToWithdraw.objects.create(**kwargs)
        self.amount_available -= amount
        self.save()

    def fund_bonus_on_first_booking(self):
        bonus_amount = 1000
        WalletTransaction.objects.create(
            type=WalletTransactionType.BONUS_CREDIT,
            credit=bonus_amount,
            transaction_type=WalletTransactionType.INCOME,
            wallet=self,
        )
        self.amount_available += bonus_amount
        self.save()

    def pay_background_check(self, bg_check, admin_wallet):
        WalletTransaction.objects.create(
            type=WalletTransactionType.BACKGROUND_CHECK,
            amount=bg_check.gateway_price,
            transaction_type=WalletTransactionType.EXPENDITURE,
            wallet=self,
            credit=bg_check.wallet_amount,
        )

        assert Decimal(self.amount_available) >= Decimal(bg_check.wallet_amount)
        self.amount_available -= Decimal(bg_check.wallet_amount)
        self.save()
        admin_wallet.amount_available += Decimal(bg_check.amount_paid)
        admin_wallet.save()

    def cancelation_fee(self, booking, tutor_wallet, admin_wallet, paid_to_tutor):
        amount_to_be_paid = paid_to_tutor
        t_pay = 0
        admin_cut = 0
        if amount_to_be_paid:
            complied = booking.policy.booking_cancellation_complied()
            if not complied:
                admin_cut = booking.admin_cut()
                t_pay = paid_to_tutor
                WalletTransaction.objects.create(
                    type=WalletTransactionType.CANCELLATION_PENALTY,
                    amount=paid_to_tutor,
                    transaction_type=WalletTransactionType.INCOME,
                    booking=booking,
                    wallet=tutor_wallet,
                )
                # admin gets cut based on percentage from tutor
                WalletTransaction.objects.create(
                    amount=booking.admin_cut(),
                    type=WalletTransactionType.ADMINS_CUT,
                    transaction_type=WalletTransactionType.INCOME,
                    booking=booking,
                    wallet=admin_wallet,
                )
            else:
                t_pay = 0
                admin_cut = booking.admin_cut() + amount_to_be_paid
                WalletTransaction.objects.create(
                    amount=admin_cut,
                    type=WalletTransactionType.CANCELLATION_PENALTY,
                    transaction_type=WalletTransactionType.INCOME,
                    booking=booking,
                    wallet=admin_wallet,
                )
        # if cancellation or refund, it is returned to client
        refund = booking.refund()
        if refund > 0:
            WalletTransaction.objects.create(
                type=WalletTransactionType.REFUND,
                transaction_type=WalletTransactionType.INCOME,
                booking=booking,
                wallet=booking.user.wallet,
                amount=booking.refund(),
            )
        if self.amount_in_session >= booking.total_price:
            tutor_wallet.amount_available += t_pay
            tutor_wallet.save()
            admin_wallet.amount_available += admin_cut
            admin_wallet.save()
            self.amount_in_session -= booking.total_price
            self.amount_available += refund
            self.save()

    def trigger_withdrawal(self, amount_to_be_paid, force=False, paid_to_tutor=True):
        if self.auto_withdraw or force:
            self.owner.trigger_payment(
                "Bank", amount_to_be_paid, force=not paid_to_tutor
            )

    def trigger_payment(self, payment_type, amount_to_withdraw, ch=False, force=False):
        if payment_type == "Bank":
            payout = self.owner.bank_payout
            charge = 50
            # charge = 200 if amount_to_withdraw > 100000 else 150
        else:
            payout = None
            charge = (amount_to_withdraw * 1 / 100) + 70
        if ch:
            charge = 0
        self.initiate_withdrawal(
            payout=payout, charge=charge, amount=amount_to_withdraw, force=force
        )

    def pay_for_group_lessons(self, booking):
        bookings = booking.bookings.all()
        admin_wallet = User.get_admin_wallet()
        ttype = WalletTransactionType.EARNING
        paid_to_tutor = booking.amount_earned()
        admin_cut = booking.admin_cut()
        WalletTransaction.objects.create(
            type=ttype,
            amount=paid_to_tutor,
            transaction_type=WalletTransactionType.INCOME,
            booking=booking,
            wallet=self,
        )
        if admin_cut > int(0):
            WalletTransaction.objects.create(
                amount=admin_cut,
                type=WalletTransactionType.ADMINS_CUT,
                transaction_type=WalletTransactionType.INCOME,
                booking=booking,
                wallet=admin_wallet,
            )
        self.amount_available += paid_to_tutor
        self.save()
        admin_wallet.amount_available += admin_cut
        admin_wallet.save()
        for b in bookings:
            walle = b.user.wallet
            walle.amount_in_session -= b.total_price
            walle.save()
        self.owner.trigger_payment("Bank", paid_to_tutor)

    def pay_tutor(
        self,
        booking,
        tutor_wallet,
        transaction_type=None,
        user_payout=None,
        force=False,
        has_penalty=False,
    ):
        """function responsible for transfering payment to tutor.
        It takes into consideration the percentage split"""
        # tutor is only payed for sessions he taught
        admin_wallet = User.get_admin_wallet()
        ttype = transaction_type or WalletTransactionType.EARNING
        paid_to_tutor = (
            0
            if booking.cancel_initiator == booking.get_tutor
            else booking.amount_earned()
        )
        # if transaction type is cancellation.
        admin_cut = booking.admin_cut()
        if force:
            to_be_paid = booking.total_price - booking.refund2()
            paid_to_tutor = to_be_paid * Decimal(booking.get_percentage())
            admin_cut = to_be_paid - paid_to_tutor
        if transaction_type == WalletTransactionType.CANCELLATION_PENALTY:
            self.cancelation_fee(booking, tutor_wallet, admin_wallet, paid_to_tutor)
        else:
            if paid_to_tutor:
                # account for witholding tax
                if booking.witholding_tax_amount():
                    # create withoulding tax wallet transaction and remove money from tutor wallet.
                    WalletTransaction.objects.create(
                        type=WalletTransactionType.WITHOLDING_TAX,
                        amount=booking.witholding_tax_amount(),
                        transaction_type=WalletTransactionType.EXPENDITURE,
                        booking=booking,
                        wallet=tutor_wallet,
                    )
                    paid_to_tutor -= booking.witholding_tax_amount()
                    # admin_cut += booking.witholding_tax_amount()
                if booking.transport_fare:
                    WalletTransaction.objects.create(
                        type=WalletTransactionType.TRANSPORT_FARE,
                        amount=booking.transport_fare,
                        transaction_type=WalletTransactionType.INCOME,
                        booking=booking,
                        wallet=tutor_wallet,
                    )
                    paid_to_tutor += booking.transport_fare
                WalletTransaction.objects.create(
                    type=ttype,
                    amount=paid_to_tutor,
                    transaction_type=WalletTransactionType.INCOME,
                    booking=booking,
                    wallet=tutor_wallet,
                )
                # admin gets cut based on percentage from tutor
                if admin_cut > int(0):
                    WalletTransaction.objects.create(
                        amount=admin_cut,
                        type=WalletTransactionType.ADMINS_CUT,
                        transaction_type=WalletTransactionType.INCOME,
                        booking=booking,
                        wallet=admin_wallet,
                    )
            if booking.refund2() > 0:
                WalletTransaction.objects.create(
                    type=WalletTransactionType.REFUND,
                    transaction_type=WalletTransactionType.INCOME,
                    booking=booking,
                    wallet=booking.user.wallet,
                    amount=booking.refund2(),
                )
            # assert self.amount_in_session >= booking.total_price
            # if self.amount_in_session >= booking.total_price:
            transport_fare = booking.transport_fare or 0
            booking_total = (
                booking.total_price + transport_fare - booking.total_discount()
            )
            if paid_to_tutor:
                tutor_wallet.amount_available += paid_to_tutor
                tutor_wallet.save()
                admin_wallet.amount_available += admin_cut
                admin_wallet.save()
                self.amount_in_session -= booking_total
                # self.amount_available += booking.refund2()
                self.save()
            # handle case when tutor isn't to be paid.
            if booking.refund2() and not paid_to_tutor:
                self.amount_in_session -= booking_total
                self.amount_available += booking.refund2()
                self.save()
            self.sync_session_with_bookings()
        if paid_to_tutor and not has_penalty:
            tutor_wallet.trigger_withdrawal(tutor_wallet.amount_available, True)
        if user_payout:
            self.trigger_withdrawal(self.amount_available + 100, force, paid_to_tutor)
        return paid_to_tutor

    def pay_tutor2(self, booking, tutor_wallet, transaction_type=None):
        """"""
        # tutor is only payed for sessions he taught
        admin_wallet = User.get_admin_wallet()
        ttype = transaction_type or WalletTransactionType.EARNING
        paid_to_tutor = booking.amount_earned()
        # if transaction type is cancellation.
        if transaction_type == WalletTransactionType.CANCELLATION_PENALTY:
            self.cancelation_fee(booking, tutor_wallet, admin_wallet, paid_to_tutor)
        else:
            if paid_to_tutor:
                WalletTransaction.objects.create(
                    type=ttype,
                    amount=paid_to_tutor,
                    transaction_type=WalletTransactionType.INCOME,
                    booking=booking,
                    wallet=tutor_wallet,
                )
                # admin gets cut based on percentage from tutor
                WalletTransaction.objects.create(
                    amount=booking.admin_cut(),
                    type=WalletTransactionType.ADMINS_CUT,
                    transaction_type=WalletTransactionType.INCOME,
                    booking=booking,
                    wallet=admin_wallet,
                )
            if booking.refund2() > 0:
                WalletTransaction.objects.create(
                    type=WalletTransactionType.REFUND,
                    transaction_type=WalletTransactionType.INCOME,
                    booking=booking,
                    wallet=booking.user.wallet,
                    amount=booking.refund2(),
                )
            # assert self.amount_in_session >= booking.total_price
            if self.amount_in_session >= booking.total_price:
                if paid_to_tutor:
                    tutor_wallet.amount_available += paid_to_tutor
                    tutor_wallet.save()
                    if paid_to_tutor >= tutor_wallet.amount_available:
                        paid_to_tutor = (
                            tutor_wallet.amount_available
                        )  # reset the amount paid to tutor with what is in the wallet
                    admin_wallet.amount_available += booking.admin_cut()
                    admin_wallet.save()
                    self.amount_in_session -= booking.total_price
                    self.amount_available += booking.refund2()
                    self.save()
        tutor_wallet.trigger_withdrawal(tutor_wallet.amount_available)

    def penalize_tutor(self, booking, tutor_wallet, transaction_type=None):
        tutor_earning = self.pay_tutor(
            booking,
            tutor_wallet,
            transaction_type=transaction_type,
            force=True,
            has_penalty=True,
        )

        amount_to_deduct = float(tutor_earning) * 0.15

        WalletTransaction.objects.create(
            type=WalletTransactionType.BOOKING_NOT_COMPLETED_PENALTY,
            amount=Decimal(amount_to_deduct),
            transaction_type=WalletTransactionType.EXPENDITURE,
            booking=booking,
            wallet=tutor_wallet,
        )

        tutor_wallet.amount_available -= Decimal(amount_to_deduct)
        tutor_wallet.save()

    def absconded_tutor_action(self, tutor_wallet, booking):

        transaction = WalletTransaction.objects.get(
            booking=booking, type=WalletTransactionType.TUTOR_HIRE
        )
        transaction.type = WalletTransactionType.ABSCONDED
        transaction.save()
        admin_wallet = User.get_admin_wallet()

        WalletTransaction.objects.create(
            type=WalletTransactionType.ADMINS_CUT,
            amount=Decimal(booking.total_price),
            transaction_type=WalletTransactionType.INCOME,
            booking=booking,
            wallet=admin_wallet,
        )

        self.amount_in_session -= booking.total_price
        self.save()

        admin_wallet.amount_available += booking.total_price
        admin_wallet.save()

        # WalletTransaction.objects.create(
        #     type=WalletTransactionType.ABSCONDED, amount=settings.ABSCONDED_FEE,
        #     transaction_type=WalletTransactionType.EXPENDITURE,
        #     booking=booking, wallet=tutor_wallet)
        # tutor_wallet.amount_available -= settings.ABSCONDED_FEE
        # tutor_wallet.save()

    def penalize_for_cancel_b4_commencement(self, booking):
        if booking:
            from bookings.models import BookingSession

            # cancel sessions so the client would be refunded
            booking.bookingsession_set.update(status=BookingSession.CANCELLED)
            booking.cancel_initiator = booking.get_tutor
            client_wallet = booking.user.wallet
            # refund the client
            tutor_earning = client_wallet.pay_tutor(
                booking,
                booking.tutor.wallet,
                transaction_type=WalletTransactionType.REFUND,
                force=False,
                has_penalty=True,
            )
            # delete tutor_hire record
            tutor_hire_trans = WalletTransaction.objects.filter(
                wallet=booking.user.wallet,
                type=WalletTransactionType.TUTOR_HIRE,
                booking=booking,
            )
            tutor_hire_trans.delete()

        # penalize the tutor
        WalletTransaction.objects.create(
            type=WalletTransactionType.ABSCONDED,
            wallet=self,
            amount=Decimal(5000),
            transaction_type=WalletTransactionType.EXPENDITURE,
            extra_message="Tutor penalized for requesting to cancel booking before commencement of classes",
            remark="",
        )
        self.amount_available -= Decimal(5000)
        self.save()

    def refund(self, amount, booking, penalty=0, price_per_hour=None):
        service_fee = WalletTransactionType.SERVICE_FEE(booking.total, price_per_hour)

        wallet_dict = dict(
            credit_in_session=self.credit_in_session - booking.credit_used,
            credits=self.credits + booking.credit_used,
            amount_available=self.amount_available
            + booking.amount_spent
            - (service_fee + penalty),
            amount_in_session=self.amount_in_session - booking.amount_spent,
        )
        if booking.credit_used == 0:
            wallet_dict.update(
                dict(
                    amount_available=self.amount_available + amount,
                    amount_in_session=self.amount_in_session
                    - (amount + penalty + service_fee),
                )
            )
        if booking.amount_spent == 0:
            wallet_dict.update(
                dict(
                    credits=self.credits + amount,
                    amount_available=self.amount_available,
                    amount_in_session=self.amount_in_session,
                    credit_in_session=self.credit_in_session
                    - (amount + penalty + service_fee),
                )
            )

        transaction_dict = dict(
            amount=booking.amount_spent,
            credit=booking.credit_used,
            wallet=self,
            type=WalletTransactionType.REFUND,
            transaction_type=WalletTransactionType.INCOME,
        )
        WalletTransaction.objects.create(**transaction_dict)
        Wallet.objects.filter(id=self.id).update(**wallet_dict)

    @staticmethod
    def cancel_session(
        booking,
        user_wallet,
        tutor_wallet,
        admin_wallet,
        late_cancellation=False,
        price_per_hour=1000,
    ):
        if admin_wallet.wallet_type != "admin":
            raise InvalidException(_("Must be an admin wallet"))
        if not tutor_wallet.owner.tutor_profile:
            raise InvalidException(_("Must be a tutor wallet"))
        if (
            user_wallet.total_in_session < booking.total
            or user_wallet.total_in_session - booking.total < 0
        ):
            raise InvalidException(
                _("Amount to be paid can't be greater than amount in session")
            )

        price = booking.total - WalletTransactionType.SERVICE_FEE(
            booking.total, price_per_hour
        )
        admin_wallet.top_up(
            WalletTransactionType.SERVICE_FEE(booking.total, price_per_hour),
            type=WalletTransactionType.SERVICE_CHARGE,
        )
        admin_wallet = Wallet.objects.get(id=admin_wallet.id)
        if late_cancellation:
            penalty = tutor_wallet.owner.tutor_profile.cancellation_penalty_charge(
                price
            )
            amount_to_refund = price - penalty
            tutor_fee = tutor_wallet.owner.tutor_profile.percentage(penalty)

            user_wallet.refund(
                amount_to_refund,
                booking,
                penalty=penalty,
                price_per_hour=price_per_hour,
            )
            tutor_wallet.top_up(tutor_fee, type=WalletTransactionType.EARNING)
            admin_wallet.top_up(
                penalty - tutor_fee, type=WalletTransactionType.ADMINS_CUT
            )
        else:
            user_wallet.refund(price, booking, price_per_hour=price_per_hour)

    def referral_earning(self, user, referral_type, amount, admin_wallet):
        """Reward for referral based on the referral type. if type is tutor__booking and amount is greater
        than or equal to 15000 then 1500 from admin wallet is sent to the owner of the wallet."""
        if referral_type == "tutor_booking":
            to_be_paid = Decimal(amount)
            WalletTransaction.objects.create(
                type=WalletTransactionType.REFERRAL_NEW_BOOKING,
                amount=to_be_paid,
                transaction_type=WalletTransactionType.INCOME,
                wallet=self,
            )
        else:
            to_be_paid = amount
            WalletTransaction.objects.create(
                type=WalletTransactionType.REFERRAL_BOOKING_MADE,
                amount=to_be_paid,
                transaction_type=WalletTransactionType.INCOME,
                wallet=self,
            )
        WalletTransaction.objects.create(
            type=WalletTransactionType.REFERRAL_PAYMENT,
            amount=to_be_paid,
            transaction_type=WalletTransactionType.EXPENDITURE,
            wallet=admin_wallet,
        )
        admin_wallet.amount_available -= to_be_paid
        admin_wallet.save()
        self.amount_available += to_be_paid
        self.save()

    def deposit_new_payment_to_wallet(self, request_instance, amount):
        full_payment = request_instance.full_payment
        discounts = Decimal(request_instance.total_discount)
        WalletTransaction.objects.create(
            type=WalletTransactionType.DEPOSIT,
            amount=full_payment,
            transaction_type=WalletTransactionType.INCOME,
            credit=-discounts,
            request_made=request_instance,
            wallet=self,
        )
        self.amount_available += amount
        self.credits += discounts
        self.save()

    def sync_amount_available(self):
        if self.owner:
            self.amount_available = self.owner.user_wallet_balance
            self.save()

    def sync_session_with_bookings(self, status="active"):
        from bookings.models import BookingSession

        queryset = self.owner.orders.active_b()
        if status == "delivered":
            queryset = self.owner.orders.delivered()
        bookings = queryset.values_list("order", flat=True)
        sessions = BookingSession.objects.filter(
            booking_id__in=list(bookings)
        ).aggregate(bb=models.Sum("price"))
        self.amount_in_session = sessions.get("bb") or 0
        self.save()

    def __str__(self):
        return str(self.owner)


User.wallet = property(lambda u: Wallet.objects.get_or_create(owner=u)[0])

# def create_user_wallet(sender, instance, created, **kwargs):
#     if created:
#         Wallet.objects.get_or_create(owner=u)

# post_save.connect(create_user_wallet, sender=User)


class UserPayoutQuerySet(models.QuerySet):
    def has_paga(self):
        return self.filter(payout_type=UserPayout.PAGA)

    def has_bank(self):
        return self.filter(payout_type=UserPayout.BANK_TRANSFER)


class UserPayoutManager(models.Manager):
    def get_queryset(self):
        return UserPayoutQuerySet(self.model, using=self._db)

    def has_paga(self):
        return self.get_queryset().has_paga()

    def has_bank(self):
        return self.get_queryset().has_bank()


class UserPayout(models.Model):
    BANK_TRANSFER = 1
    PAGA = 2
    BANKS = (
        ("", "Select Bank"),
        ("Citibank", "Citibank"),
        ("Access Bank", "Access Bank"),
        ("Diamond Bank", "Diamond Bank"),
        ("Ecobank Nigeria", "Ecobank Nigeria"),
        ("Enterprise Bank", "Enterprise Bank"),
        ("Fidelity Bank Nigeria", "Fidelity Bank Nigeria"),
        ("First Bank of Nigeria", "First Bank of Nigeria"),
        ("First City Monument Bank", "First City Monument Bank"),
        ("First Inland Bank", "First Inland Bank"),
        ("Guaranty Trust Bank", "Guaranty Trust Bank"),
        ("Heritage Bank", "Heritage Bank"),
        ("Keystone Bank Limited", "Keystone Bank Limited"),
        ("Mainstreet Bank", "Mainstreet Bank"),
        ("Skye Bank", "Skye Bank"),
        ("Polaris Bank", "Polaris Bank"),
        ("Stanbic IBTC Bank", "Stanbic IBTC Bank"),
        ("Standard Chartered Bank", "Standard Chartered Bank"),
        ("Sterling Bank", "Sterling Bank"),
        ("Union Bank of Nigeria", "Union Bank of Nigeria"),
        ("United Bank for Africa", "United Bank for Africa"),
        ("Unity Bank", "Unity Bank"),
        ("Wema Bank", "Wema Bank"),
        ("Zenith Bank", "Zenith Bank"),
        ("Jaiz Bank", "Jaiz Bank"),
        ("Suntrust Bank", "Suntrust Bank"),
        ("Providus Bank", "Providus Bank"),
        ("Parallex Bank", "Parallex Bank"),
    )
    PAYOUT_TYPES = ((BANK_TRANSFER, "Bank Transfer"),)
    payout_type = models.IntegerField(default=BANK_TRANSFER, choices=PAYOUT_TYPES)
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    account_id = models.CharField(blank=True, null=True, max_length=10)
    # bank = models.CharField(max_length=70, null=True, blank=True)
    bank = models.CharField(
        max_length=70, null=True, blank=True, choices=get_bank_list()
    )
    account_name = models.CharField(max_length=70, null=True, blank=True)
    recipient_code = models.CharField(max_length=100, null=True, blank=True)
    objects = UserPayoutManager()

    class Meta:
        unique_together = ("user", "payout_type")

    def __str__(self):
        return "%s %s" % (self.user.email, self.get_payout_type_display())

    def save(self, *args, **kwargs):
        if not self.recipient_code:
            # move out
            paystack = PayStack()
            result = paystack.create_recipient(self)
            if result:
                self.recipient_code = result["recipient_code"]
        return super(UserPayout, self).save(*args, **kwargs)


class InvalidException(Exception):
    pass


@receiver(successful_payment)
def my_callback(sender, booking_order, request, **kwargs):
    pass


@receiver(when_client_closes_session)
def client_closes_booking(sender, booking_order, request, **kwargs):
    pass


class RequestToWithdrawQueryset(models.QuerySet):
    def delete_withdrawal(self):
        for i in self.all():
            last_withdrawal_transaction = (
                i.user.wallet.transactions.withdrawn().order_by("-created").first()
            )
            last_withdrawal_transaction.delete()
            i.delete()

    def process_payment_with_paystack(self, code=None):
        # to eventually delete dependencies on paystack on the codebase.
        for ii in self.all():
            ii.paystack_payments(code, reason="Tuteria Payment")

    def after_transfer_has_been_made(self, save=False):
        queryset = self.all()
        if not save:
            list_ = [x.create_transaction_records() for x in queryset]
            WalletTransaction.objects.bulk_create(list_)
        else:
            for i in queryset:
                i.create_transaction_records(save)
        queryset.delete()


class RequestToWithdraw(TimeStampedModel):
    payout = models.ForeignKey(
        UserPayout, null=True, blank=True, on_delete=models.SET_NULL
    )
    amount = models.DecimalField(default=Decimal(0), max_digits=16, decimal_places=8)
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    charge = models.DecimalField(default=Decimal(0), max_digits=16, decimal_places=3)
    order = models.CharField(max_length=12, null=True, db_index=True)
    transfer_code = models.CharField(max_length=100, null=True, blank=True)
    objects = RequestToWithdrawQueryset.as_manager()

    def __str__(self):
        if self.payout:
            return str(self.payout.user)
        return self.user.email

    @property
    def total_amount(self):
        return self.amount + self.charge

    @cached_property
    def phone_number(self):
        det = self.user_d.phone_number_details
        if det:
            return det.as_national
        return ""

    def paystack_payments(self, code=None, reason=""):
        paystack = PayStack()
        if self.transfer_code:
            paystack.verify_transfer(self.transfer_code, code)
        else:
            if self.payout.recipient_code:
                amount = self.amount + self.charge - Decimal(100)
                self.transfer_code, msg = paystack.create_transfer_code(
                    self.payout, amount, reason
                )
                if self.transfer_code and msg != "Transfer requires OTP to continue":
                    self.create_transaction_records(True)
                    self.delete()
                else:
                    self.save()
            else:
                self.payout.save()

    def create_transaction_records(self, save=False):
        instance = WalletTransaction(
            wallet=self.user.wallet,
            type=WalletTransactionType.WITHDRAWAL_COMPLETED,
            amount=self.amount,
            transaction_type=WalletTransactionType.EXPENDITURE,
            credit=self.charge,
        )
        if not hasattr(self, "update_modified"):
            setattr(self, "update_modified", False)
            setattr(self, "created", timezone.now())
            setattr(self, "modified", timezone.now())
        if save:
            instance.save()
            WalletTransaction.objects.create(
                wallet=self.user.wallet,
                type=WalletTransactionType.BANK_CHARGES,
                amount=100,
                transaction_type=WalletTransactionType.EXPENDITURE,
                credit=0,
            )
        return instance

    @cached_property
    def user_d(self):
        return self.user

    @cached_property
    def clients_not_paid(self):
        result = (
            WalletTransaction.objects.filter(booking__tutor=self.user)
            .transaction_not_paid()
            .select_related("wallet__owner")
        )
        return result

        # class ClientPayment(TimeStampedModel):
        #     ISSUED = 1
        #     PAYED = 3
        #     STATES = (
        #         (ISSUED, 'issued'),
        #         (PAYED, 'payed'),
        #     )
        #     order = models.CharField(max_length=12, primary_key=True, db_index=True)
        #     user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='orders', null=True)
        #     status = models.IntegerField(default=ISSUED, choices=STATES)
        #     amount = models.DecimalField(default=30000, blank=True, max_digits=10, decimal_places=2)

        #     @classmethod
        #     def create(cls, user=None, **kwargs):
        #         obj = cls.objects.filter(user=user,status=ClientPayment.ISSUED).first()
        #         if not instance:
        #             order = generate_code(cls)
        #             obj, _ = cls.objects.get_or_create(
        #                 order=order,
        #                 user_id=user.id,
        #                 **kwargs
        #             )
        #         return obj


class PaymentHistory(Wallet):
    class Meta:
        proxy = True
        verbose_name = "Payment History Summary"
        verbose_name_plural = "Payment History Summary"
