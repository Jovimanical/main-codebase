import csv
from decimal import Decimal

from django.contrib import admin
from django.db.models import F, Sum

# Register your models here.
from django.http import StreamingHttpResponse, JsonResponse
from django.utils import timezone
from django.db import transaction
from import_export import resources
from import_export.admin import ImportExportMixin

from ..models import (
    Wallet,
    WalletTransaction,
    RequestToWithdraw,
    WalletTransactionType,
    UserPayout,
    PaymentHistory,
)
from django.contrib.admin.helpers import ActionForm
from django import forms
from django.contrib import messages
from django.utils.translation import ugettext as _
from ..forms import WalletForm, PayoutForm, RequestToWithdrawForm, WalletTransactionForm
from config.utils import Echo, PayStack, generate_code
from bookings import tasks as booking_tasks
from users.models import User
from django.db import models
from bookings.models import Booking
from bookings.admin import BookingAgentFilter as EAgentFilter, Agent


class WalletTransactionResource(resources.ModelResource):
    total = resources.Field()
    get_status = resources.Field()

    class Meta:
        model = WalletTransaction
        fields = [
            "wallet__owner__email",
            "amount",
            "transaction_type",
            "booking__order",
            "created",
            "modified",
            "total",
            "get_status",
        ]

    def dehydrate_total(self, w):
        return w.total

    def dehydrate_get_status(self, w):
        return w.status


class RequestToWithdrawFilter(admin.SimpleListFilter):
    title = _("Transfer Type")
    parameter_name = "t_type"

    def lookups(self, request, model_admin):
        return (("bank", _("Bank Transfer")), ("paga_agent", _("Paga Agent Phone")))

    def queryset(self, request, queryset):
        if self.value() == "bank":
            return queryset.filter(payout__payout_type=UserPayout.BANK_TRANSFER)
        if self.value() == "paga_agent":
            return queryset.filter(payout=None)
        return queryset


class BookingClosedFilter(admin.SimpleListFilter):
    title = _("Booking Status")
    parameter_name = "b_status"

    def lookups(self, request, model_admin):
        return (
            ("closed", _("Completed Booking")),
            ("not_closed", _("Uncompleted Booking")),
        )

    def queryset(self, request, queryset):
        if self.value() == "closed":
            return queryset.filter(booking__status__in=[3, 4])
        if self.value() == "not_closed":
            return queryset.exclude(booking__status__in=[3, 4])
        return queryset


class AgentFilter(EAgentFilter):
    def queryset(self, request, queryset):
        if self.value():
            if self.value() == "none":
                return queryset.filter(booking__agent_id=None)
            return queryset.filter(booking__agent__name=self.value())
        return queryset


class PayoutFilter(admin.SimpleListFilter):
    pass


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


def reset_request_wallet(model_admin, request, queryset):
    for q in queryset:
        if q.owner:
            q.owner.add_to_wallet(0, reset=True)
    model_admin.message_user(request, "Request wallet balance reset")


def reset_session_available(modeladmin, request, queryset):
    queryset.update(amount_available=0)


reset_session_available.short_description = "Reset amount Available"


def pay_tutor(modeladmin, request, queryset):
    for x in queryset.all():
        x.owner.trigger_payment("Bank", x.amount_available, True)


pay_tutor.short_description = "Process Payment"


def sync_available_request(modeladmin, request, queryset):
    for x in queryset.all():
        x.sync_amount_available()
    modeladmin.message_user(request, "Wallet balance synced")


sync_available_request.short_description = "Sync amount available with request_wallet"


def sync_amount_in_session(modeladmin, request, queryset):
    for x in queryset.all():
        x.sync_session_with_bookings()


sync_amount_in_session.short_description = "Sync amount in session with booking"


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


class UserTypeFilter(admin.SimpleListFilter):
    title = _("User Type")
    parameter_name = "type"

    def lookups(self, request, model_admin):
        return [("tutor", "tutor"), ("not-tutor", "not-tutor")]

    def queryset(self, request, queryset):
        if self.value() == "tutor":
            return queryset.filter(owner__profile__application_status=3)
        if self.value() == "not-tutor":
            return queryset.exclude(owner__profile__application_status=3)
        return queryset


class WithMoneyFilter(admin.SimpleListFilter):
    title = _("With Money")
    parameter_name = "money_type"

    def lookups(self, request, model_admin):
        return [
            ("with_money", "With money"),
            ("with_session", "With money in session"),
            ("less_than_0", "Less than 0"),
            ("request_wallet", ("With request wallet balance")),
        ]

    def queryset(self, request, queryset):
        if self.value() == "with_money":
            return queryset.filter(amount_available__gt=1000)
        if self.value() == "with_session":
            return queryset.exclude(amount_in_session=0)
        if self.value() == "less_than_0":
            return queryset.filter(amount_in_session__lt=0)
        if self.value() == "request_wallet":
            return queryset.filter(owner__data_dump__request_wallet__gt=0)
        return queryset


class WithClientFilter(admin.SimpleListFilter):
    title = _("With client")
    parameter_name = "with_client"

    def lookups(self, request, model_admin):
        return [
            ("with_client", _("With client")),
            ("without_client", _("Without client")),
        ]

    def queryset(self, request, queryset):
        if self.value() == "with_client":
            return queryset.exclude(booking__user=None)
        if self.value() == "without_client":
            return queryset.filter(booking__user=None)
        return queryset


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = (
        "owner_email",
        "available_amount",
        "session_amount",
        "wallet_type",
        "request_wallet",
    )
    search_fields = ("owner__email",)
    form = WalletForm
    list_filter = [UserTypeFilter, WithMoneyFilter]
    action_form = UpdateActionForm
    actions = [
        update_amount_available,
        reset_session_amount,
        reset_session_available,
        pay_tutor,
        sync_amount_in_session,
        reset_request_wallet,
        sync_available_request,
    ]

    def request_wallet(self, obj):
        if obj.owner:
            try:
                return obj.owner.user_wallet_balance
            except Exception as e:
                return 0
        return 0

    def available_amount(self, obj):
        # obj is the Model instance

        # If your locale is properly set, try also:
        # locale.currency(obj.amount, grouping=True)
        return "\u20A6%.2f" % obj.amount_available

    available_amount.admin_order_field = "amount_available"

    def session_amount(self, obj):
        return "\u20A6%.2f" % obj.amount_in_session

    session_amount.admin_order_field = "amount_in_session"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("owner")


class Echo(object):
    """An object that implements just the write method of the file-like
    interface.
    """

    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


@admin.register(WalletTransaction)
class WalletTransactionAdmin(ImportExportMixin, admin.ModelAdmin):
    resource_class = WalletTransactionResource
    list_display = (
        "display_val",
        "credit",
        "type",
        "transaction_type",
        "client",
        "created",
        "modified",
        "wallet_info",
        "amount_available",
        "wallet_owner",
    )
    search_fields = (
        "booking__user__email",
        "wallet__owner__email",
        "request_made__slug",
    )
    list_filter = ["type", "transaction_type", WithClientFilter]
    date_hierarchy = "created"
    form = WalletTransactionForm
    actions = [
        "export_as_csv",
        "export_as_json",
    ]

    def wallet_info(self, obj):
        if obj.wallet:
            owner = obj.wallet.owner
            if owner:
                return f"{owner.first_name} {owner.last_name}"
        return ""

    def export_as_csv(modeladmin, request, queryset):
        """A view that streams a large CSV file."""
        # Generate a sequence of rows. The range is based on the maximum number of
        # rows that can be handled by a single sheet in most spreadsheet
        # applications.
        # rows = (["Row {}".format(idx), str(idx)] for idx in range(65536))
        def get_info(idx):
            value = [
                idx.created.isoformat(),
                idx.email,
                idx.bank_name,
                idx.amount,
                idx.booking_amount,
                idx.bank,
            ]
            return value

        rows = (get_info(idx) for idx in queryset.iterator())
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response["Content-Disposition"] = 'attachment; filename="payments.csv"'
        return response

    export_as_csv.short_description = "Export payment info"

    def amount_available(self, obj):
        if obj.wallet:
            return obj.wallet.amount_available
        return 0

    def get_queryset(self, request, **kwargs):
        query = (
            super(WalletTransactionAdmin, self)
            .get_queryset(request)
            .select_related("wallet__owner")
        )
        return query

    def wallet_owner(self, obj):
        if obj.wallet.owner:
            email = obj.wallet.owner.email
            return (
                '<a href="/we-are-allowed/wallet/wallet/?q={}"' ' target="_blank">{}</a>'
            ).format(email, email)

    wallet_owner.allow_tags = True

    def display_val(self, obj):
        return str(obj)

    def client(self, obj):
        email = obj.email
        if email:
            return f'<a target="_blank" href="/we-are-allowed/bookings/booking/?q={email}">{email}</a>'
        if obj.booking:
            return f'<a target="_blank" href="/we-are-allowed/bookings/booking/?q={obj.booking.order}">{obj.booking.order}</a>'

        return ""

    client.allow_tags = True

    def export_as_json(modeladmin, request, queryset):
        summation = queryset.aggregate_amount()
        response = JsonResponse(dict(sum=summation))
        return response


class ClientPaymentFilter(admin.SimpleListFilter):
    title = "Client Payment Status"
    parameter_name = "client_payment"

    def lookups(self, request, model_admin):
        return (("paid", _("Client has paid")), ("not_paid", _("Client hasn't paid")))

    def queryset(self, request, queryset):
        tutors = (
            WalletTransaction.objects.all()
            .transaction_not_paid()
            .values_list("booking__tutor_id", flat=True)
        )
        if self.value() == "paid":
            return queryset.exclude(user_id__in=tutors)
        if self.value() == "not_paid":
            return queryset.filter(user_id__in=tutors)
        return queryset


#
@admin.register(RequestToWithdraw)
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
    list_filter = [RequestToWithdrawFilter, ClientPaymentFilter]
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
        queryset.process_payment_with_paystack(code=code)
        # for ii in queryset.all():
        #     ii.paystack_payments(code, reason="Tuteria Payment")

    def update_amount_to_be_paid(self, request, queryset):
        amount = request.POST.get("amount")
        queryset.update(amount=amount)

    def duplicate_withdrawal(self, request, queryset):
        for i in queryset.all():
            order = generate_code(RequestToWithdraw)
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
        if "Tutor Payment" not in request.user.groups.values_list("name", flat=True):
            # if request.user.email not in ['gbozee@example.com', "busybenson@example.com"]:
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
            '<a href="/we-are-allowed/wallet/wallet/?q={}"' ' target="_blank">{}</a>'
        ).format(email, email)

    email.allow_tags = True

    def the_amount(self, obj):
        amount = obj.amount
        return (
            '<a href="/we-are-allowed/wallet/wallettransaction/?q={}"'
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
            if a.wallet.owner:
                email = a.wallet.owner.email
                result.append(
                    (
                        '<a href="/we-are-allowed/bookings/booking/?q={}"'
                        ' target="blank">{}</a>'
                    ).format(email, email)
                )
        return result

    links_to_bookings.allow_tags = True

    def clients_not_paid(self, obj):
        result = []
        for a in obj.clients_not_paid:
            if a.wallet.owner:
                result.append(
                    (
                        '<a href="/we-are-allowed/wallet/bookingnotpaid/?q={}"'
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
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response[
            "Content-Disposition"
        ] = 'attachment; filename="{}_payment.csv"'.format(t_type)
        return response

    def update_withdrawal_status_to_paid_bank(self, request, queryset):
        queryset.after_transfer_has_been_made()

    def make_payment(self, request, queryset):
        from .pay_tutor import api_caller

        data = [
            dict(account_name=x.payout.account_id, bank=x.payout.bank, amount=x.amount)
            for x in queryset.all()
        ]
        self.message_user(request, "Payment has been sent to the server")

    def payment_delay_notice(self, request, queryset):
        v = queryset.values_list("user__email", flat=True)
        booking_tasks.send_email_on_payment_delay_notice.delay(list(v))


@admin.register(UserPayout)
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
        BookingClosedFilter,
        AgentFilter,
        get_booking_with_deal_filter("booking__dealId"),
    ] + WalletTransactionAdmin.list_filter

    def amount_owed(self, obj):
        return obj.total - obj.amount_paid

    def client(self, obj):
        return obj.email

    client.allow_tags = True

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
                '<a href="/we-are-allowed/users/'
                'phonenumber/?q={}" target="_blank" >{}</a>'
            ).format(email, "%s %s" % (first_name, last_name))
        return ""

    client_name.allow_tags = True

    def get_queryset(self, request):
        return super(BookingsNotPaid, self).get_queryset(request).transaction_not_paid()

    def email_to_make_payments(self, request, queryset):
        for i in queryset.all():
            booking_tasks.new_email_on_payment_reminder.delay(
                email=i.email, first_name=i.first_name, total_owed=float(i.total_owed)
            )
        # booking_tasks.send_mail_to_clients_on_amount_owed.delay(
        #     ids=list(ids))

    def mark_transactions_as_paid(self, request, queryset):
        records = [x.booking_id for x in queryset.all()]
        queryset.update(amount_paid=F("amount") + F("credit"))
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
                t_amount=Sum(F("amount") + F("credit") - F("amount_paid"))
            )["t_amount"]
            or 0
        )
        response = JsonResponse(dict(sum=summation))
        return response

    export_owed_as_json.short_description = "Total Amount Owed"


@admin.register(PaymentHistory)
class BookingHistoryAdmin(admin.ModelAdmin):
    change_list_template = "admin/payment_history_change_list.html"
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
        from .chart import LineChart

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
        # response.context_data['summary_total'] = dict(
        #     qs.aggregate(**metrics)
        # )
        # convert to Trunc
        # period = self.get_next_in_date_hierarchy(
        #     request,
        #     self.date_hierarchy,
        # )
        # response.context_data['period'] = period
        # summary_over_time = qs.annotate(
        #     period=models.functions.Trunc(
        #         'start',
        #         period,
        #         output_field=models.DateTimeField(),
        #     ),
        # ).values('period')\
        #     .annotate(total=models.Sum('price'))\
        #     .order_by('period')

        # summary_range = summary_over_time.aggregate(
        #     low=models.Min('total'),
        #     high=models.Max('total'),
        # )
        # high = summary_range.get('high', 0)
        # low = summary_range.get('low', 0)

        # summary_over_time_data = [{
        #     'period': x['period'],
        #     'total': x['total'] or 0,
        #     'pct': ((x['total'] or 0) - low) / (high - low) * 100
        #     if high > low else 0,
        # } for x in summary_over_time]
        # response.context_data['summary_over_time'] = summary_over_time_data
        email = request.GET.get("q")
        if email:
            line_chart = LineChart()
            line_chart.summary_data = WalletTransaction.objects.filter(
                wallet__owner__email=email
            ).booking_times()
            response.context_data["line_chart"] = line_chart
        return response


def create_modeladmin(modeladmin, model, name=None):
    class Meta:
        proxy = True
        app_label = model._meta.app_label

    attrs = {"__module__": "", "Meta": Meta}

    newmodel = type(name, (model,), attrs)

    admin.site.register(newmodel, modeladmin)
    return modeladmin


create_modeladmin(BookingsNotPaid, WalletTransaction, name="BookingNotPaid")


def create_modeladmin2(modeladmin, model, name=None):
    class Meta:
        proxy = True
        # app_label = "users23"
        verbose_name = "Customer Management"

    attrs = {"__module__": "wallet.admin.admin1", "Meta": Meta}

    newmodel = type(name, (model,), attrs)

    admin.site.register(newmodel, modeladmin)
    return modeladmin


class ActiveBooking(admin.SimpleListFilter):
    title = "Active Status"
    parameter_name = "active"

    def lookups(self, request, model_admin):
        return (("active", _("Active Booking")), ("inactive", _("Inactive Booking")))

    def queryset(self, request, queryset):
        scheduled_qs = queryset.annotate(
            scheduled=models.Sum(
                models.Case(
                    models.When(orders__status=Booking.SCHEDULED, then=1),
                    output_field=models.IntegerField(),
                    default=models.Value(0),
                )
            )
        )
        if self.value() == "active":
            return scheduled_qs.filter(scheduled__gt=0)
        if self.value() == "inactive":
            return scheduled_qs.filter(scheduled=0)
        return queryset


class BookingDateFilter(admin.SimpleListFilter):
    title = "Recent Booking Status"
    parameter_name = "r_b_status"

    def lookups(self, request, model_admin):
        return (("new", _("New Bookings")), ("end", _("Ending Soon Bookings")))

    def queryset(self, request, queryset):
        active = Booking.objects.active()
        if self.value() == "end":
            a = active.get_booking_ending_soon().values_list("user_id", flat=True)
            return queryset.filter(pk__in=list(a))
        if self.value() == "new":
            b = active.get_booking_just_started().values_list("user_id", flat=True)
            return queryset.filter(pk__in=list(b))
        return queryset


class OwingClientFilter(admin.SimpleListFilter):
    title = "Owing Status"
    parameter_name = "owing"

    def lookups(self, request, model_admin):
        return (("owing", _("Owing Clients")), ("not_owing", _("Not Owing Clients")))

    def queryset(self, request, queryset):
        with_owing = WalletTransaction.objects.transaction_not_paid()
        if self.value() == "owing":
            v = with_owing.filter(total_owed__gt=0).values_list(
                "wallet__owner_id", flat=True
            )
            return queryset.filter(pk__in=list(v))
        if self.value() == "not_owing":
            v = with_owing.filter(total_owed=0).values_list(
                "wallet__owner_id", flat=True
            )
            return queryset.filter(pk__in=list(v))
        return queryset


class FForm(ActionForm):
    remarks = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=2, placeholder="remarks")), required=False
    )


class CustomerManagementAdmin(admin.ModelAdmin):
    list_display = [
        "full_name",
        "remarks",
        "email",
        "number",
        "addr",
        "state",
        "total_paid",
        "total_owed",
        "booking_count",
        "reviews",
        "request_count",
    ]
    search_fields = [
        "first_name",
        "last_name",
        "phonenumber__number",
        "email",
        "location__address",
    ]
    list_filter = [
        ActiveBooking,
        OwingClientFilter,
        BookingDateFilter,
        "location__state",
    ]
    action_form = FForm
    actions = ["update_remark"]

    def update_remark(self, request, queryset):
        remark = request.POST.get("remarks")
        if remark:
            User.objects.filter(id__in=[x.pk for x in queryset.all()]).update(
                remarks=remark
            )

    def full_name(self, obj):
        return "%s %s" % (obj.first_name, obj.last_name)

    def reviews(self, obj):
        count = obj.reviews_given
        return '<a href="/we-are-allowed/reviews/skillreview/?q={}" target="_blank" >{} reviews</a>'.format(
            obj.email, count
        )

    reviews.allow_tags = True

    def booking_count(self, obj):
        count = obj.order_count
        return '<a href="/we-are-allowed/bookings/booking/?q={}" target="_blank" >{} bookings</a>'.format(
            obj.email, count
        )

    booking_count.allow_tags = True

    def request_count(self, obj):
        # count = obj.rq_count
        return '<a href="/we-are-allowed/external/baserequesttutor/?q={}" target="_blank" >requests</a>'.format(
            obj.email
        )  # ,count)

    request_count.allow_tags = True

    def number(self, obj):
        return obj.phone_number_details

    def total_paid(self, obj):
        count = obj.total_paid
        return '<a href="/we-are-allowed/wallet/wallettransaction/?q={}&type__exact=2" target="_blank" >{:.2f}</a>'.format(
            obj.email, count
        )

    total_paid.allow_tags = True

    def total_owed(self, obj):
        count = obj.total_paid - obj.total_paid_owed
        return '<a href="/we-are-allowed/wallet/bookingnotpaid/?q={}" target="_blank" >{:.2f}</a>'.format(
            obj.email, count
        )

    total_owed.allow_tags = True

    def addr(self, obj):
        if obj.home_address:
            return obj.home_address.address

    def state(self, obj):
        if obj.home_address:
            return obj.home_address.state

    def get_queryset(self, request):
        queryset = (
            super(CustomerManagementAdmin, self)
            .get_queryset(request)
            .annotate(order_count=models.Count("orders"))
            .annotate(reviews_given=models.Count("skillreview"))
            .annotate(
                total_paid=models.Sum(
                    models.Case(
                        models.When(
                            wallet__transactions__type=WalletTransactionType.TUTOR_HIRE,
                            then=models.F("wallet__transactions__amount"),
                        ),
                        default=models.Value(0),
                        output_field=models.DecimalField(
                            max_digits=12, decimal_places=2
                        ),
                    )
                )
            )
            .annotate(
                total_paid_owed=models.Sum(
                    models.Case(
                        models.When(
                            wallet__transactions__type=WalletTransactionType.TUTOR_HIRE,
                            then=models.F("wallet__transactions__amount_paid"),
                        ),
                        default=models.Value(0),
                        output_field=models.DecimalField(
                            max_digits=12, decimal_places=2
                        ),
                    )
                )
            )
            .filter(order_count__gt=0)
        )

        return queryset


create_modeladmin(CustomerManagementAdmin, User, name="CustomerManagement")
