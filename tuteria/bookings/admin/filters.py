from django import forms
from django.db import models
from django.contrib import admin
from django.contrib.admin.helpers import ActionForm
from django.utils.translation import ugettext as _
from ..models import Booking, BookingSession
from wallet.models import WalletTransaction, UserPayout
from registration.admin import StateFilter


class BankTransferFilter(admin.SimpleListFilter):
    title = _("bank transfer")  # or use _('country') for translated title
    parameter_name = "bank transfer"

    def lookups(self, request, model_admin):
        return (
            ("bank transfer", _("Bank Transfer Payments")),
            ("initialized", _("initialized")),
            ("scheduled", _("scheduled")),
            ("pending", _("pending")),
            ("completed", _("completed")),
            ("cancelled", _("cancelled")),
            ("delivered", _("delivered")),
        )

    def queryset(self, request, queryset):
        if self.value() == "bank transfer":
            return queryset.filter(status=Booking.BANK_TRANSFER)
        if self.value() == "initialized":
            return queryset.filter(status=Booking.INITIALIZED)
        if self.value() == "scheduled":
            return queryset.filter(status=Booking.SCHEDULED)
        if self.value() == "pending":
            return queryset.filter(status=Booking.PENDING)
        if self.value() == "completed":
            return queryset.filter(status=Booking.COMPLETED)
        if self.value() == "cancelled":
            return queryset.filter(status=Booking.CANCELLED)
        if self.value() == "delivered":
            return queryset.filter(status=Booking.DELIVERED)
        return queryset


class UpdateActionForm(ActionForm):
    dont_include_today = forms.BooleanField(required=False)
    remark = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=2, placeholder="remarks")), required=False
    )


class BookingsNotClosedFilter(admin.SimpleListFilter):
    title = _("is Closed")
    parameter_name = "is_closed"

    def lookups(self, request, model_admin):
        return ("not_closed", _("Not Closed")), ("closed", _("Closed"))

    def queryset(self, request, queryset):
        if self.value() == "not_closed":
            return queryset.exclude(status=Booking.COMPLETED)
        if self.value() == "closed":
            return queryset.filter(status=Booking.COMPLETED)
        return queryset


def get_booking_with_deal_filter(field="dealId"):

    class BookingWithDealFilter(admin.SimpleListFilter):
        title = _("Is a hubspot deal")
        parameter_name = "hub_deal"

        def lookups(self, request, model_admin):
            return ("has_deal", _("Has Deal")), ("no_deal", _("No deal"))

        def queryset(self, request, queryset):
            if self.value() == "has_deal":
                return queryset.exclude(**{field: None})
            if self.value() == "no_deal":
                return queryset.filter(**{field: None})
            return queryset

    return BookingWithDealFilter


class BookingsEndingSoonFilter(admin.SimpleListFilter):
    title = _("ending_soon")  # or use _('country') for translated title
    parameter_name = "last_session"

    def lookups(self, request, model_admin):
        return (("ending_soon", _("Ending Soon")),)

    def queryset(self, request, queryset):
        if self.value() == "ending_soon":
            return queryset.get_booking_ending_soon()
        return queryset


class BookingsNotReviewedFilter(admin.SimpleListFilter):
    title = _("reviewed")  # or use _('country') for translated title
    parameter_name = "reviewed"

    def lookups(self, request, model_admin):
        return (("not_reviewed", _("Not Reviewed")),)

    def queryset(self, request, queryset):
        if self.value() == "not_reviewed":
            return queryset.filter(reviewed=False)
        return queryset


class NoCategoryFilter(admin.SimpleListFilter):
    title = _("No category")
    parameter_name = "no_category"

    def lookups(self, request, model_admin):
        return (("no_category", _("No Category")),)

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(ts__skill__subcategories=None)
        return queryset


class NoStateFilter(StateFilter):
    title = _("No state")
    parameter_name = "no_state"

    def lookups(self, request, model_admin):
        return (("no_state", _("No State")),)

    def queryset(self, request, queryset):
        if self.value() == "no_state":
            return queryset.filter(user__location__state=None)
        return queryset


class StateFilter2(StateFilter):

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(user__location__state=self.value())
        return queryset


class BookingSessionStatusFilter(admin.SimpleListFilter):
    title = _("Status")
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return (
            ("not_started", _("not started")),
            ("started", _("started")),
            ("completed", _("completed")),
            ("cancelled", _("cancelled")),
        )

    def queryset(self, request, queryset):
        if self.value() == "not_started":
            return queryset.filter(status=BookingSession.NOT_STARTED)
        if self.value() == "started":
            return queryset.filter(status=BookingSession.STARTED)
        if self.value() == "completed":
            return queryset.filter(status=BookingSession.COMPLETED)
        if self.value() == "cancelled":
            return queryset.filter(status=BookingSession.CANCELLED)
        return queryset


class BookingNotCancelledFilter(admin.SimpleListFilter):
    title = _("Completed Status")
    parameter_name = "completed_status"

    def lookups(self, request, model_admin):
        return (
            ("exclude_cancelled", _("Exclude cancelled")),
            ("exclude_cancelled_not_started", _("Exclude not started and cancelled")),
        )

    def queryset(self, request, queryset):
        if self.value() == "exclude_cancelled":
            return queryset.exclude(status=BookingSession.CANCELLED)
        if self.value() == "exclude_cancelled_not_started":
            return queryset.exclude(status=BookingSession.CANCELLED).exclude(
                status=BookingSession.NOT_STARTED
            )
        return queryset


class NoCategorySessionFilter(NoCategoryFilter):

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(booking__ts__skill__subcategories=None)


# wallet filter started here


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


class PayoutFilter(admin.SimpleListFilter):

    def queryset(self, request, queryset):
        pass

    def lookups(self, request, model_admin):
        pass


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
