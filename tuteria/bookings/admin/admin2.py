import csv
from decimal import Decimal

from django.contrib import admin, messages
from django.contrib.admin.helpers import ActionForm
from django.utils import timezone
from django.utils.translation import ugettext as _
from config import utils
from config.signals import successful_payment
from users.models import User
from django.db import models
from django.urls import reverse
from django.http import JsonResponse, StreamingHttpResponse, HttpResponseRedirect

from config import admin_utils
from reviews.models import SkillReview
from reviews.forms import SkillReviewForm, forms
from wallet.forms import (
    WalletForm,
    WalletTransactionForm,
    RequestToWithdrawForm,
    PayoutForm,
)
from wallet.models import (
    Wallet,
    WalletTransaction,
    RequestToWithdraw,
    WalletTransactionType,
    UserPayout,
    PaymentHistory,
)
from ..models import Booking, BookingSession, BookingSummary, LetterInvite
from ..forms import BookingForm, BookingSessionForm
from .. import tasks as tks
from . import filters, export_owed_as_json


class CustomerSuccessAdminSite(admin.AdminSite):
    site_header = "Customer Success Administration"


customer_success_admin = CustomerSuccessAdminSite(name="Customer Success Admin")


class BookingAdminActionMixin(object):
    actions = [
        "update_bookings",
        "close_delivered_bookings",
        "mark_booking_as_delivered",
        "change_booking_to_pending",
        "close_uncompleted_booking_from_admin",
        "update_booking_with_wallet_money",
        "send_email_to_review_tutor",
        "pay_tutor_for_classes_taught",
        "get_statistics_for_customers",
        "get_statistics_for_tutors",
        export_owed_as_json,
        "place_new_booking_between_client_and_tutor",
        "update_remark",
        "add_deal_to_hubspot",
        "update_deal_status",
    ]

    def update_bookings(self, request, queryset):
        from bookings.models import callback_async

        queryset.async_action(
            lambda booking: callback_async(
                booking, booking.bank_price, "Bank transfer", False
            )
        )

    update_bookings.short_description = "Update Bank Bookings"

    def close_delivered_bookings(self, request, queryset):
        tks.async_update_delivered_bookings_to_completed_after_3_days()

    close_delivered_bookings.description = "Close Delivered Bookings"

    def mark_booking_as_delivered(self, request, queryset):
        ids = queryset.values_list("pk", flat=True)
        query = Booking.objects.filter(pk__in=list(ids))
        query.update(status=Booking.DELIVERED)
        for booking in query.all():
            booking.update_status_on_hubspot()

    def change_booking_to_pending(self, request, queryset):
        queryset.update(status=Booking.PENDING)

    def close_uncompleted_booking_from_admin(self, request, queryset):
        queryset.async_action(
            lambda b: b.async_call_to_client_confirmed_admin(None, False)
        )

    def update_booking_with_wallet_money(self, request, queryset):
        counter = 0
        for x in queryset.all():
            Booking.objects.filter(pk=x.pk).update(wallet_amount=x.total_price)
            x.on_successful_payment(x.total_price)
            tks.send_mail_to_client_and_tutor_on_successful_booking.delay(
                x.order, float(x.total_price), transaction_id=x.order, email=None
            )
            wallet = x.user.wallet
            wallet.amount_available -= x.total_price
            wallet.save()
            counter += 1
        messages.info(request, "Updated bookings for {}".format(counter))

    def send_email_to_review_tutor(self, request, queryset):
        """Email to be sent from admin to client to review tutor"""
        queryset.async_action(lambda x: tks.async_send_email_to_review_tutor(x.pk))

    def pay_tutor_for_classes_taught(self, request, queryset):
        queryset.async_action(lambda x: x.pay_tutor_for_classes_taught())

    def get_statistics_for_customers(self, request, queryset):
        return HttpResponseRedirect(
            reverse("users:customer_insight", args=["customer"])
        )

    def get_statistics_for_tutors(self, request, queryset):
        return HttpResponseRedirect(reverse("users:customer_insight", args=["tutor"]))

    def place_new_booking_between_client_and_tutor(self, request, queryset):
        a = request.POST.get("dont_include_today")
        w = True if not a else False
        queryset.async_action(lambda x: x.rebook_classes(include_today=w))

    def update_remark(self, request, queryset):
        remark = request.POST.get("remark")
        if remark:
            Booking.objects.filter(pk__in=[x.pk for x in queryset.all()]).update(
                remark=remark
            )

    def add_deal_to_hubspot(self, request, queryset):
        from external.models import BaseRequestTutor

        query = Booking.objects.filter(
            pk__in=list(queryset.values_list("pk", flat=True))
        )
        Booking.bulk_update_deals_to_hubspot(query)

    def update_deal_status(self, request, queryset):
        ids = queryset.values_list("pk", flat=True)
        Booking.update_hubspot(ids)

    def export_owed_as_json(modeladmin, request, queryset):
        # summation = queryset.aggregate(t_amount=models.Sum('bookingsession__price'))['t_amount'] or 0
        summation = (
            queryset.aggregate(
                t_amount=models.Sum(
                    models.Case(
                        models.When(
                            bookingsession__status__ne=BookingSession.CANCELLED,
                            then=models.F("bookingsession__price"),
                        ),
                        output_field=models.DecimalField(),
                    )
                )
            )["t_amount"]
            or 0
        )
        response = JsonResponse(dict(sum=summation))
        return response


export_owed_as_json.short_description = "Total Amount Calculation"


class BookingSessionAdminActionMixin(object):
    actions = (
        "mark_session_as_cancelled",
        "mark_session_as_completed",
        "export_as_json",
    )

    def mark_session_as_cancelled(self, request, queryset):
        queryset.update(status=BookingSession.CANCELLED)

    def mark_session_as_completed(self, request, queryset):
        queryset.update(status=BookingSession.COMPLETED)

    def export_as_json(modeladmin, request, queryset):
        summation = queryset.aggregate(models.Sum("price"))
        response = JsonResponse(summation)
        return response


@admin.register(Booking, site=customer_success_admin)
class BookingAdmin(BookingAdminActionMixin, admin.ModelAdmin):
    list_display = (
        "order",
        "client_email",
        "skill",
        "remark",
        "till_booking_closes",
        "total_price",
        "refund_button",
        "made_payment",
        "delivered_on",
        "paid_tutor",
        "first_session",
        "last_session",
        "the_tutor",
        "reviews",
    )
    search_fields = (
        "user__email",
        "order",
        "tutor__email",
        "ts__tutor__email",
        "user__first_name",
        "user__last_name",
    )
    form = BookingForm
    action_form = filters.UpdateActionForm
    date_hierarchy = "first_session"
    list_filter = (
        filters.BankTransferFilter,
        filters.BookingsNotClosedFilter,
        filters.get_booking_with_deal_filter(),
        filters.BookingsEndingSoonFilter,
        filters.BookingsNotReviewedFilter,
        "ts__skill__subcategories__name",
        filters.NoCategoryFilter,
        filters.NoStateFilter,
        filters.StateFilter2,
    )

    def get_queryset(self, request):
        return super(BookingAdmin, self).get_queryset(request).for_admin()

    def the_client(self, obj):
        return '<a href="/we-are-allowed-customer-success/bookingss/bookingsession/?q={}" target="_blank" >{}</a>'.format(
            obj.order, obj.client_email
        )

    def refund_button(self, obj):
        return admin_utils.generate_refund_button(
            obj.pk,
            obj.status == Booking.SCHEDULED,
            obj.get_status_display(),
            url="/users/admin/bookings/refund/",
            kind="booking",
            b_text="Refund Client",
        )

    refund_button.allow_tags = True
    refund_button.short_description = "Booking status"

    def the_tutor(self, obj):
        if obj.tutor:
            return '<a href="/we-are-allowed-customer-success/users/verifiedtutorwithskill/?q={}" target="_blank" >{}</a>'.format(
                obj.tutor.email, obj.tutor.email
            )

    the_tutor.short_description = "tutor"
    the_tutor.allow_tags = True

    def reviews(self, obj):
        count = obj.reviews_given.all()
        count = len(count)
        # count = obj.reviews_count
        return '<a href="/we-are-allowed-customer-success/reviews/skillreview/?q={}" target="_blank" >{} reviews</a>'.format(
            obj.order, count
        )

    reviews.allow_tags = True

    def update_related_bookings(self, request, queryset):
        queryset.async_action(
            lambda booking: booking.when_payment_is_made(booking.bank_price)
        )
        tks.send_request_notice_combined_to_user.delay(booking.user_id)

    def till_booking_closes(self, obj):
        if obj.last_session:
            result = (obj.last_session - timezone.now()).days
            if result < 8:
                return "{} days".format(result)
            return "{} weeks, {} days".format(result / 7, result % 7)

    till_booking_closes.admin_order_field = "last_session"

    def client_email(self, obj):
        email = obj.user
        if obj.user:
            email = obj.user.email
        return '<a href="/we-are-allowed-customer-success/bookings/bookingsession/?q={}" target="_blank" >{}</a>'.format(
            obj.order, email
        )

    client_email.allow_tags = True

    def skill(self, obj):
        email = obj.user.email
        if obj.ts:
            url = (
                '<a href="/we-are-allowed-customer-success/wallet/bookingnotpaid/?q={}"'
                ' target="_blank">{}</a>'
            ).format(email, obj.ts.skill.name)
            return url

    skill.allow_tags = True

    def booking_status(self, obj):
        return obj.get_status_display()


@admin.register(BookingSession, site=customer_success_admin)
class BookingSessionAdmin(BookingSessionAdminActionMixin, admin.ModelAdmin):
    list_display = (
        "client_email",
        "price",
        "status",
        "booking_order",
        "start",
        "no_of_hours",
    )
    search_fields = ["booking__order", "booking__user__email"]
    list_filter = (
        filters.BookingSessionStatusFilter,
        filters.BookingNotCancelledFilter,
        filters.NoCategorySessionFilter,
        "booking__ts__skill__subcategories__name",
    )
    date_hierarchy = "start"
    form = BookingSessionForm

    def client_email(self, obj):
        if obj.booking:
            if obj.booking.user:
                return obj.booking.user.email
        return ""

    def booking_order(self, obj):
        if obj.booking:
            return obj.booking.order
        return ""


@admin.register(LetterInvite, site=customer_success_admin)
class LetterInviteAdmin(admin.ModelAdmin):
    pass


@admin.register(BookingSummary, site=customer_success_admin)
class BookingSummaryAdmin(admin.ModelAdmin):
    change_list_template = "admin/booking_summary_change_list.html"
    date_hierarchy = "start"
    list_filter = ("booking__ts__skill__categories__name",)

    def get_next_in_date_hierarchy(self, request, date_hierarchy):
        if date_hierarchy + "__day" in request.GET:
            return "hour"
        if date_hierarchy + "__month" in request.GET:
            return "day"
        if date_hierarchy + "__year" in request.GET:
            return "week"
        return "month"

    def get_queryset(self, request):
        query = super(BookingSummaryAdmin, self).get_queryset(request)
        return query.select_related("booking__ts__skill").exclude(
            status=BookingSession.CANCELLED
        )

    def changelist_view(self, request, extra_context=None):
        from .chart import LineChart

        response = super(BookingSummaryAdmin, self).changelist_view(
            request, extra_context=extra_context
        )
        try:
            qs = response.context_data["cl"].queryset
        except (AttributeError, KeyError):
            return response
        metrics = {
            "total": models.Count("booking__order"),
            "lesson_count": models.Count("id"),
            "total_sales": models.Sum("price"),
        }
        response.context_data["summary"] = list(
            qs.values("booking__ts__skill__name")
            .annotate(**metrics)
            .order_by("-total_sales")
        )
        response.context_data["summary_total"] = dict(qs.aggregate(**metrics))
        # convert to Trunc
        period = self.get_next_in_date_hierarchy(request, self.date_hierarchy)
        response.context_data["period"] = period
        summary_over_time = (
            qs.annotate(
                period=models.functions.Trunc(
                    "start", period, output_field=models.DateTimeField()
                )
            )
            .values("period")
            .annotate(total=models.Sum("price"))
            .order_by("period")
        )

        summary_range = summary_over_time.aggregate(
            low=models.Min("total"), high=models.Max("total")
        )
        high = summary_range.get("high", 0)
        low = summary_range.get("low", 0)

        summary_over_time_data = [
            {
                "period": x["period"],
                "total": x["total"] or 0,
                "pct": ((x["total"] or 0) - low) / (high - low) * 100
                if high > low
                else 0,
            }
            for x in summary_over_time
        ]
        response.context_data["summary_over_time"] = summary_over_time_data
        line_chart = LineChart()
        line_chart.summary_data = summary_over_time_data
        response.context_data["line_chart"] = line_chart
        return response


class BookingsNotClosedAdmin(BookingAdmin):
    list_filter = (
        filters.BankTransferFilter,
        filters.BookingsEndingSoonFilter,
        filters.BookingsNotReviewedFilter,
    )
    actions = BookingAdmin.actions + ["update_last_session"]

    def get_queryset(self, request):
        return (
            super(BookingsNotClosedAdmin, self)
            .get_queryset(request)
            .exclude(status=Booking.COMPLETED)
            .exclude(status=Booking.CANCELLED)
        )

    def update_last_session(self, request, queryset):
        for qq in queryset.all():
            last_session = qq.bookingsession_set.last()
            qq.last_session = last_session.end
            qq.save()
        messages.info(request, "Last session updated")


class FollowUpBookingAdmin(BookingAdmin):
    list_display = ["client_email", "skill_display"]
    date_hierarchy = "last_session"

    def skill_display(self, obj):
        skill = None
        if obj.ts:
            skill = obj.ts.skill.name
        if skill:
            return (
                '<a href="/we-are-allowed-customer-success/bookings/booking/?q={}" target="_blank" >{}</a>'
            ).format(obj.order, skill)

    skill_display.allow_tags = True

    def get_queryset(self, request):
        return (
            super(FollowUpBookingAdmin, self)
            .get_queryset(request)
            .filter(last_session__lte=timezone.now())
        )


class DateForm(ActionForm):
    the_date = forms.DateField(widget=forms.SelectDateWidget(), required=False)


@admin.register(SkillReview, site=customer_success_admin)
class ReviewAdmin(admin.ModelAdmin):
    form = SkillReviewForm
    list_display = ["tutor", "commenter", "score", "modified", "review"]
    search_fields = [
        "tutor_skill__tutor__email",
        "booking__order",
        "commenter__email",
        "booking__user__email",
    ]
    actions = ["update_modified_date_of_review"]
    action_form = DateForm

    def tutor(self, obj):
        return obj.tutor_skill.tutor

    def update_modified_date_of_review(self, request, queryset):
        form = self.action_form(request.POST)
        form.is_valid()
        if form.cleaned_data["the_date"]:
            queryset.update(modified=form.cleaned_data["the_date"])


# wallet admin started here
class UpdateActionForm(ActionForm):
    amount_to_add = forms.DecimalField(
        widget=forms.TextInput(attrs=dict(placeholder="amount to add")), required=False
    )
    credit_to_add = forms.DecimalField(
        initial=0,
        widget=forms.TextInput(attrs=dict(placeholder="credit to add")),
        required=False,
    )
    remark = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=2, placeholder="remarks")), required=False
    )


class PayoutActionForm(ActionForm):
    code = forms.CharField(
        widget=forms.TextInput(attrs=dict(placeholder="OTP Code")), required=False
    )
    amount = forms.DecimalField(
        widget=forms.TextInput(attrs=dict(placeholder="amount to add")), required=False
    )


def reset_session_amount(modeladmin, request, queryset):
    queryset.update(amount_in_session=0)


reset_session_amount.short_description = "Reset amount in Session"


def reset_session_available(modeladmin, request, queryset):
    queryset.update(amount_available=0)


reset_session_available.short_description = "Reset amount Available"


def pay_tutor(modeladmin, request, queryset):
    for x in queryset.all():
        x.owner.trigger_payment("Bank", x.amount_available, True)


pay_tutor.short_description = "Process Payment"


def update_amount_available(modeladmin, request, queryset):
    price = request.POST["amount_to_add"] or 0
    credit = request.POST["credit_to_add"] or 0
    price = Decimal(price)
    alla = queryset.all()
    for x in alla:
        x.top_up2(price, int(credit))
        # x.amount_available += price
        # x.save()
        modeladmin.message_user(
            request,
            ("Successfully updated amount_available for %s rows") % (x.owner.email,),
            messages.SUCCESS,
        )


update_amount_available.short_description = "Update Amount Available of selected rows"


@admin.register(Wallet, site=customer_success_admin)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("owner_email", "available_amount", "session_amount", "wallet_type")
    search_fields = ("owner__email",)
    form = WalletForm
    action_form = UpdateActionForm
    actions = [
        update_amount_available,
        reset_session_amount,
        reset_session_available,
        pay_tutor,
    ]

    def available_amount(self, obj):
        # obj is the Model instance

        # If your locale is properly set, try also:
        # locale.currency(obj.amount, grouping=True)
        return u"\u20A6%.2f" % obj.amount_available

    available_amount.admin_order_field = "amount_available"

    def session_amount(self, obj):
        return u"\u20A6%.2f" % obj.amount_in_session

    session_amount.admin_order_field = "amount_in_session"


@admin.register(WalletTransaction, site=customer_success_admin)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "display_val",
        "credit",
        "type",
        "transaction_type",
        "client",
        "client_phone_number",
        "created",
        "modified",
        "wallet_owner",
    )
    search_fields = ("booking__user__email", "wallet__owner__email")
    list_filter = ["type", "transaction_type"]
    date_hierarchy = "created"
    form = WalletTransactionForm
    actions = ["export_as_json"]

    def get_queryset(self, request, **kwargs):
        query = (
            super(WalletTransactionAdmin, self)
            .get_queryset(request)
            .select_related("wallet__owner")
        )
        return query

    def wallet_owner(self, obj):
        email = obj.wallet.owner.email
        return (
            '<a href="/we-are-allowed-customer-success/wallet/wallet/?q={}"'
            ' target="_blank">{}</a>'
        ).format(email, email)

    wallet_owner.allow_tags = True

    def display_val(self, obj):
        return str(obj)

    def client(self, obj):
        email = obj.email
        if email:
            return email
        return ""

    def client_phone_number(self, obj):
        booking = obj.booking
        if booking:
            phone_number = booking.user.primary_phone_no
            if phone_number:
                return phone_number.number
        return ""

    def export_as_json(modeladmin, request, queryset):
        summation = queryset.aggregate_amount()
        response = JsonResponse(dict(sum=summation))
        return response


#


@admin.register(RequestToWithdraw, site=customer_success_admin)
class RequestToWithdrawAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "email",
        "phone_no",
        "the_amount",
        "account_id",
        "created",
        "order",
        "bank",
        "transfer_code",
        "clients_not_paid",
        "links_to_bookings",
    ]
    list_filter = [filters.RequestToWithdrawFilter, filters.ClientPaymentFilter]
    form = RequestToWithdrawForm
    action_form = PayoutActionForm
    actions = [
        "make_payment",
        "update_withdrawal_status_to_paid_bank",
        "generate_csv",
        "payment_delay_notice",
        "update_amount_to_be_paid",
        "duplicate_withdrawal",
        "process_payment_with_paystack",
    ]

    def process_payment_with_paystack(self, request, queryset):
        code = request.POST.get("code")
        for ii in queryset.all():
            ii.paystack_payments(code, reason="Tuteria Payment")

    def update_amount_to_be_paid(self, request, queryset):
        amount = request.POST.get("amount")
        queryset.update(amount=amount)

    def duplicate_withdrawal(self, request, queryset):
        for i in queryset.all():
            order = utils.generate_code(RequestToWithdraw)
            RequestToWithdraw.objects.create(
                payout=i.payout,
                user=i.user,
                amount=i.amount,
                charge=i.charge,
                order=order,
            )
            self.message_user(request, "New Request to Withdraw created")

    duplicate_withdrawal.description = "Create new withdrawal request"

    def get_actions(self, request):
        actions = super(RequestToWithdrawAdmin, self).get_actions(request)
        if request.user.email not in ["gbozee@example.com", "busybenson@example.com"]:
            del actions["process_payment_with_paystack"]
        return actions

    def bank(self, obj):
        if obj.payout:
            return obj.payout.bank

    def name(self, obj):
        if obj.payout:
            return obj.payout.account_name

    def email(self, obj):
        email = obj.user.email
        return (
            '<a href="/we-are-allowed-customer-success/wallet/wallet/?q={}"'
            ' target="_blank">{}</a>'
        ).format(email, email)

    email.allow_tags = True

    def the_amount(self, obj):
        amount = obj.amount
        return (
            '<a href="/we-are-allowed-customer-success/wallet/wallettransaction/?q={}"'
            ' target="_blank">{}</a>'
        ).format(obj.user.email, amount)

    the_amount.allow_tags = True

    def phone_no(self, obj):
        return obj.phone_number

    def account_id(self, obj):
        if obj.payout:
            return obj.payout.account_id

    def links_to_bookings(self, obj):
        result = []
        for a in obj.clients_not_paid:
            email = a.wallet.owner.email
            result.append(
                (
                    '<a href="/we-are-allowed-customer-success/bookings/booking/?q={}"'
                    ' target="blank">{}</a>'
                ).format(email, email)
            )
        return result

    links_to_bookings.allow_tags = True

    def clients_not_paid(self, obj):
        result = []
        for a in obj.clients_not_paid:
            result.append(
                (
                    '<a href="/we-are-allowed-customer-success/wallet/bookingnotpaid/?q={}"'
                    ' target="_blank">{}</a>'
                ).format(a.wallet.owner.email, "Client yet to pay {}".format(a.total))
            )
        return result

    clients_not_paid.allow_tags = True

    def generate_csv(self, request, queryset):
        t_type = request.GET.get("t_type")
        if t_type == "bank":
            rows = (
                [
                    idx.payout.account_name,
                    idx.phone_number,
                    idx.payout.bank,
                    "'{}".format(idx.payout.account_id),
                    idx.user_d.email,
                    "Withdrawal on {}".format(timezone.now()),
                    idx.order,
                    idx.amount,
                ]
                for idx in queryset.all()
            )
        elif t_type == "paga_agent":
            rows = (
                [
                    idx.user_d.first_name,
                    idx.user_d.last_name,
                    idx.phone_number,
                    idx.user_d.email,
                    idx.amount,
                ]
                for idx in queryset.all()
            )
        else:
            rows = []
            messages.info(request, "Ensure you select a filter")
        pseudo_buffer = utils.Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response[
            "Content-Disposition"
        ] = 'attachment; filename="{}_payment.csv"'.format(t_type)
        return response

    def update_withdrawal_status_to_paid_bank(self, request, queryset):
        list_ = [x.create_transaction_records() for x in queryset.all()]
        WalletTransaction.objects.bulk_create(list_)
        queryset.delete()

    def make_payment(self, request, queryset):
        from wallet.admin.pay_tutor import api_caller

        data = [
            dict(account_name=x.payout.account_id, bank=x.payout.bank, amount=x.amount)
            for x in queryset.all()
        ]
        self.message_user(request, "Payment has been sent to the server")

    def payment_delay_notice(self, request, queryset):
        v = queryset.values_list("user__email", flat=True)
        tks.send_email_on_payment_delay_notice.delay(list(v))


@admin.register(UserPayout, site=customer_success_admin)
class UserPayoutAdmin(admin.ModelAdmin):
    form = PayoutForm

    list_display = ["user", "account_id", "account_name", "bank", "recipient_code"]
    search_fields = ["user__email", "account_name", "account_id"]
    actions = ["add_recipient_to_paystack"]

    def add_recipient_to_paystack(self, request, queryset):
        for x in queryset.all():
            x.save()
        self.message_user(request, "Payout Added")


from bookings.admin import get_booking_with_deal_filter


class BookingsNotPaid(WalletTransactionAdmin):
    list_display = [
        "client",
        "client_name",
        "total",
        "amount_paid",
        "remark",
        "amount_owed",
        "total_owed",
    ]
    actions = WalletTransactionAdmin.actions + [
        "email_to_make_payments",
        "update_amount_paid",
        "update_remark",
        "mark_transactions_as_paid",
        "export_owed_as_json",
    ]
    action_form = UpdateActionForm
    list_filter = [
        filters.BookingClosedFilter,
        get_booking_with_deal_filter("booking__dealId"),
    ] + WalletTransactionAdmin.list_filter

    def amount_owed(self, obj):
        return obj.total - obj.amount_paid

    def update_remark(self, request, queryset):
        remark = request.POST.get("remark")
        if remark:
            for oo in queryset.all():
                oo.remark = remark
                oo.save()

    def total_owed(self, obj):
        return obj.total_owed

    def client_name(self, obj):
        email = obj.email
        first_name = obj.first_name
        last_name = obj.last_name
        if email and first_name and last_name:
            return (
                '<a href="/we-are-allowed-customer-success/users/'
                'phonenumber/?q={}" target="_blank" >{}</a>'
            ).format(email, "%s %s" % (first_name, last_name))
        return ""

    client_name.allow_tags = True

    def get_queryset(self, request):
        return super(BookingsNotPaid, self).get_queryset(request).transaction_not_paid()

    def email_to_make_payments(self, request, queryset):
        for i in queryset.all():
            tks.new_email_on_payment_reminder.delay(
                email=i.email, first_name=i.first_name, total_owed=float(i.total_owed)
            )
        # booking_tasks.send_mail_to_clients_on_amount_owed.delay(
        #     ids=list(ids))

    def mark_transactions_as_paid(self, request, queryset):
        records = [x.booking_id for x in queryset.all()]
        queryset.update(amount_paid=models.F("amount") + models.F("credit"))
        values = list(records)
        Booking.update_hubspot(values)

    def update_amount_paid(self, request, queryset):
        price = request.POST["amount_to_add"] or 0
        credit = request.POST["credit_to_add"] or 0
        price = Decimal(price)
        queryset.update(amount_paid=price)

    update_amount_paid.short_description = "Update Amount Paid(requires price)"

    def export_owed_as_json(modeladmin, request, queryset):
        summation = (
            queryset.aggregate(
                t_amount=models.Sum(
                    models.F("amount") + models.F("credit") - models.F("amount_paid")
                )
            )["t_amount"]
            or 0
        )
        response = JsonResponse(dict(sum=summation))
        return response

    export_owed_as_json.short_description = "Total Amount Owed"


@admin.register(PaymentHistory, site=customer_success_admin)
class BookingHistoryAdmin(admin.ModelAdmin):
    change_list_template = "admin/payment_history_change_list2.html"
    date_hierarchy = "created"
    search_fields = ["owner__email"]

    def get_queryset(self, request):
        return (
            super(BookingHistoryAdmin, self)
            .get_queryset(request)
            .booking_history()
            .filter(booking_total__gt=0)
        )

    def changelist_view(self, request, extra_context=None):
        from wallet.admin.chart import LineChart

        response = super(BookingHistoryAdmin, self).changelist_view(
            request, extra_context=extra_context
        )
        try:
            qs = response.context_data["cl"].queryset
        except (AttributeError, KeyError):
            return response
        metrics = {
            "total_bookings": models.Count("booking__order"),
            "total_paid_bookings": models.Count("id"),
            "total_sales": models.Sum("price"),
        }
        response.context_data["summary"] = list(
            qs.values("owner__email").booking_history()
            # .order_by('-total_sales')
        )
        email = request.GET.get("q")
        if email:
            line_chart = LineChart()
            line_chart.summary_data = WalletTransaction.objects.filter(
                wallet__owner__email=email
            ).booking_times()
            response.context_data["line_chart"] = line_chart
        return response


utils.create_modeladmin(
    BookingsNotPaid,
    WalletTransaction,
    name="BookingNotPaid",
    admin_var=customer_success_admin,
)

utils.create_modeladmin(
    BookingsNotClosedAdmin,
    Booking,
    name="BookingNotClosed",
    admin_var=customer_success_admin,
)

utils.create_modeladmin(
    FollowUpBookingAdmin,
    Booking,
    name="FollowUpBooking",
    admin_var=customer_success_admin,
)
