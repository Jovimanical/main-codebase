from django import forms
from django.contrib import admin, messages
from django.contrib.admin.helpers import ActionForm
from django.urls import reverse
from django.db import models
from django.db.models import Sum
from django.http import HttpResponseRedirect, JsonResponse
from django.utils import timezone
from django.utils.translation import ugettext as _
from import_export import resources
from import_export.admin import ImportExportMixin
from dal import autocomplete

from config import admin_utils
from config.signals import successful_payment
from config.utils import create_modeladmin

from registration.admin import StateFilter
from .. import tasks
from ..models import Booking, BookingSession, BookingSummary, LetterInvite
from external.models import Agent
from external.admin.admin1 import AgentFilter


class BookingForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = [
            "order",
            "ts",
            "user",
            "booking_type",
            "status",
            "paid_tutor",
            "message_to_tutor",
            "first_session",
            "last_session",
            "reviewed",
            "calendar_updated",
            "cancel_initiator",
            "tutor",
            "made_payment",
            "delivered_on",
            "remark",
            "booking_level",
            "transport_fare",
            "witholding_tax",
            "tutor_discount",
            "tuteria_discount",
            "is_group",
        ]
        widgets = {
            "ts": autocomplete.ModelSelect2(url="users:skill-autocomplete"),
            "user": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "cancel_initiator": autocomplete.ModelSelect2(
                url="users:user-autocomplete"
            ),
            "tutor": autocomplete.ModelSelect2(url="users:user-autocomplete"),
        }


class AdminBookingForm(BookingForm):
    class Meta(BookingForm.Meta):
        fields = BookingForm.Meta.fields + ["booking_level"]


class BookingSessionForm(forms.ModelForm):
    class Meta:
        model = BookingSession
        fields = [
            "start",
            "price",
            "student_no",
            "no_of_hours",
            "booking",
            "issue",
            "status",
            "cancellation_reason",
        ]
        widgets = {
            "booking": autocomplete.ModelSelect2(url="users:booking-autocomplete")
        }


class BookingResource(resources.ModelResource):
    total_price = resources.Field()
    get_status = resources.Field()

    class Meta:
        model = Booking
        fields = [
            "order",
            "user__email",
            "delivered_on",
            "first_session",
            "last_session",
            "tutor__email",
            "ts__skill__name",
            "status",
            "total_price",
        ]

    def dehydrate_total_price(self, booking):
        return booking.total_price

    def dehydrate_get_status(self, booking):
        return booking.get_status_display()


class StateFilter2(StateFilter):
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(user__location__state=self.value())
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


class NoCategoryFilter(admin.SimpleListFilter):
    title = _("No category")
    parameter_name = "no_category"

    def lookups(self, request, model_admin):
        return (("no_category", _("No Category")),)

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(ts__skill__subcategories=None)
        return queryset


class NoCategorySessionFilter(NoCategoryFilter):
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(booking__ts__skill__subcategories=None)


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


class BookingsNotClosedFilter(admin.SimpleListFilter):
    title = _("is Closed")
    parameter_name = "is_closed"

    def lookups(self, request, model_admin):
        return (("not_closed", _("Not Closed")), ("closed", _("Closed")))

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
            return (("has_deal", _("Has Deal")), ("no_deal", _("No deal")))

        def queryset(self, request, queryset):
            if self.value() == "has_deal":
                return queryset.exclude(**{field: None})
            if self.value() == "no_deal":
                return queryset.filter(**{field: None})
            return queryset

    return BookingWithDealFilter


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


class BookingTypeFilter(admin.SimpleListFilter):
    pass


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


class NewInput(forms.DateInput):
    input_type = "date"


class UpdateActionForm(ActionForm):
    dont_include_today = forms.BooleanField(
        required=False,
    )
    remark = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=2, placeholder="remarks")), required=False
    )
    start_date = forms.DateField(required=False, widget=NewInput())
    email = forms.EmailField(required=False)
    agent = forms.ModelChoiceField(
        required=False, queryset=Agent.objects.filter(type=Agent.CUSTOMER_SUCCESS)
    )


class BookingAgentFilter(AgentFilter):
    def get_queryset(self):
        return super().get_queryset().filter(type=Agent.CUSTOMER_SUCCESS)


@admin.register(Booking)
class BookingAdmin(ImportExportMixin, admin.ModelAdmin):
    resource_class = BookingResource
    list_display = (
        "order",
        "client_email",
        "skill",
        "remark",
        "agent",
        "till_booking_closes",
        "transport_fare",
        "total_price",
        "booking_level",
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
        "booking__ts__tutor__email",
    )
    form = BookingForm
    action_form = UpdateActionForm
    date_hierarchy = "first_session"
    change_list_template = "admin/external/change_list2.html"
    list_filter = (
        BankTransferFilter,
        BookingsNotClosedFilter,
        # get_booking_with_deal_filter(),
        BookingsEndingSoonFilter,
        BookingsNotReviewedFilter,
        BookingAgentFilter,
        # "ts__skill__subcategories__name",
        # NoCategoryFilter,
        # NoStateFilter,
        # StateFilter2,
    )

    actions = [
        "can_only_delete_initialized_bookings",
        "update_booking_level",
        "update_client_email",
        "update_bookings",
        "close_delivered_bookings",
        "mark_booking_as_delivered",
        "change_booking_to_pending",
        "close_uncompleted_booking_from_admin",
        "penalize_for_uncompleted_booking",
        "penalize_for_cancelling_before_classes_commenced",
        "update_booking_with_wallet_money",
        "assign_agent",
        "send_email_to_review_tutor",
        "pay_tutor_for_classes_taught",
        "get_statistics_for_customers",
        "get_statistics_for_tutors",
        export_owed_as_json,
        "place_new_booking_between_client_and_tutor",
        "update_remark",
        "impersonation_absconded_penalty",
        "squash_bookings",
        "merge_bookings",
        "sync_wallet_with_booking_amount",
        "process_payment_of_bookings",
    ]

    def get_form(self, request, obj, **kwargs):
        if request.user.is_superuser:
            self.form = AdminBookingForm

        return super().get_form(request, obj, **kwargs)

    def assign_agent(self, request, queryset):
        agent = request.POST.get("agent")
        if agent:
            ids = queryset.values_list("pk", flat=True)
            Booking.objects.filter(pk__in=ids).update(agent=agent)
            self.message_user(request, "Agent updated")

    def update_client_email(self, request, queryset):
        email = request.POST.get("email")
        if email:
            user = queryset.first().user
            user.email = email
            user.save()
            self.message_user(request, "Email changed!!")

    def merge_bookings(self, request, queryset):
        Booking.merge_bookings(queryset.all())

    def impersonation_absconded_penalty(self, request, queryset):
        queryset = queryset.filter(status=Booking.SCHEDULED)

        for booking in queryset:
            booking.penalize_tutor_for_abscontion()

    def squash_bookings(self, request, queryset):
        end_year = request.GET.get("first_session__year")
        queryset.bulk_squash_bookings(end_year=end_year)

    def penalize_for_uncompleted_booking(self, request, queryset):
        queryset = queryset.filter(status=Booking.SCHEDULED)
        for booking in queryset:
            booking.penalize_tutor_for_cancelling_booking()

    def penalize_for_cancelling_before_classes_commenced(self, request, queryset):
        queryset1 = queryset.exclude(tutor__isnull=True).filter(
            status=Booking.SCHEDULED
        )

        for booking in queryset1:
            booking.penalize_tutor_for_cancelling_b4_commencement()

        messages.info(
            request,
            "{0} Tutors penalized for requesting to cancel booking before commencement of classes and the clients refunded".format(
                queryset1.count()
            ),
        )

    def get_queryset(self, request):
        return super(BookingAdmin, self).get_queryset(request).for_admin()

    def the_client(self, obj):
        return '<a href="/we-are-allowed/bookingss/bookingsession/?q={}" target="_blank" >{}</a>'.format(
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

    def update_remark(self, request, queryset):
        remark = request.POST.get("remark")
        if remark:
            Booking.objects.filter(pk__in=[x.pk for x in queryset.all()]).update(
                remark=remark
            )

    def update_deal_status(self, request, queryset):
        ids = queryset.values_list("pk", flat=True)
        Booking.update_hubspot(ids)

    def the_tutor(self, obj):
        if obj.tutor:
            return '<a href="/we-are-allowed/tutor_management/verifiedtutorwithskill/?q={}" target="_blank" >{}</a><br/><a href="/we-are-allowed/wallet/wallettransaction/?q={}" target="_blank" >Wallet Transaction</a>'.format(
                obj.tutor.email, obj.tutor.email, obj.tutor.email
            )

    the_tutor.short_description = "tutor"
    the_tutor.allow_tags = True

    def reviews(self, obj):
        count = obj.reviews_given.all()
        count = len(count)
        # count = obj.reviews_count
        return '<a href="/we-are-allowed/reviews/skillreview/?q={}" target="_blank" >{} reviews</a>'.format(
            obj.order, count
        )

    reviews.allow_tags = True

    def send_email_to_review_tutor(self, request, queryset):
        """Email to be sent from admin to client to review tutor"""
        from .. import tasks as tks

        for x in queryset.all():
            tks.send_mail_to_client_on_delivered_booking.delay(x.pk)

    def get_statistics_for_tutors(self, request, queryset):
        return HttpResponseRedirect(reverse("users:customer_insight", args=["tutor"]))

    def get_statistics_for_customers(self, request, queryset):
        return HttpResponseRedirect(
            reverse("users:customer_insight", args=["customer"])
        )

    def can_only_delete_initialized_bookings(self, request, queryset):
        for x in queryset.all():
            if x.status == Booking.INITIALIZED:
                x.delete()

    can_only_delete_initialized_bookings.short_description = (
        "Delete initialized bookings"
    )

    def pay_tutor_for_classes_taught(self, request, queryset):
        for x in queryset.all():
            x.pay_tutor_for_classes_taught()

    def place_new_booking_between_client_and_tutor(self, request, queryset):
        import datetime
        a = request.POST.get("dont_include_today")
        today = request.POST.get('start_date')
        if today:
            today = datetime.datetime.strptime(today,"%Y-%m-%d")
        w = True if not a else False
        for x in queryset.all():
            x.rebook_classes(include_today=w,current_day=today)

    def update_booking_level(self, request, queryset):
        for o in queryset:
            o.booking_level = 75 if o.tutor.is_premium else 70
            o.save()

    update_booking_level.short_description = "Update Booking level"

    def process_payment_of_bookings(self, request, queryset):
        if request.user.is_superuser:
            for x in queryset.all():
                x.pay_group_lessons_tutors()
                x.get_user.wallet.sync_session_with_bookings()

    def sync_wallet_with_booking_amount(self, request, queryset):
        for x in queryset.all():
            x.get_user.wallet.to_session(x)
            x.status = Booking.DELIVERED
            x.save()
            x.get_user.wallet.sync_session_with_bookings("delivered")
            x.pay_group_lessons_tutors()

    def update_booking_with_wallet_money(self, request, queryset):
        from .. import tasks as tks

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

        # querysetBooking.objects.filter(order=booking.order).update(wallet_amount=booking.total_price)

    def update_bookings(self, request, queryset):
        for booking in queryset.all():
            successful_payment.send(
                sender=self.__class__,
                booking_order=booking,
                transaction_id="Bank transfer",
                amount_paid=booking.bank_price,
                request=request,
            )

    update_bookings.short_description = "Update Bank Bookings"

    def update_related_bookings(self, request, queryset):
        for booking in queryset.all():
            booking.when_payment_is_made(booking.bank_price)
        tasks.send_request_notice_combined_to_user.delay(booking.user_id)

    def change_booking_to_pending(self, request, queryset):
        queryset.update(status=Booking.PENDING)

    def mark_booking_as_delivered(self, request, queryset):
        ids = queryset.values_list("pk", flat=True)
        query = Booking.objects.filter(pk__in=list(ids))
        query.update(status=Booking.DELIVERED)
        for booking in query.all():
            booking.update_status_on_hubspot()

    def add_deal_to_hubspot(self, request, queryset):
        query = Booking.objects.filter(
            pk__in=list(queryset.values_list("pk", flat=True))
        )
        Booking.bulk_update_deals_to_hubspot(query)

    def close_uncompleted_booking_from_admin(self, request, queryset):
        for b in queryset.all():
            b.client_confirmed_admin()

    def close_delivered_bookings(self, request, queryset):
        tasks.update_delivered_bookings_to_completed_after_3_days.delay()

    close_delivered_bookings.description = "Close Delivered Bookings"

    def till_booking_closes(self, obj):
        days_left = obj.days_till_close

        if days_left:
            if days_left < 8:
                return "{} days".format(days_left)
            return "{} weeks, {} days".format(days_left / 7, days_left % 7)

    till_booking_closes.admin_order_field = "last_session"

    def client_email(self, obj):
        user = obj.get_user
        if user:
            email = user.email
            return '<a href="/we-are-allowed/bookings/bookingsession/?q={}" target="_blank" >{}</a>'.format(
                obj.order, email
            )

    client_email.allow_tags = True

    def skill(self, obj):
        if obj.ts:
            user = obj.get_user
            if user:
                email = user.email
                url = (
                    '<a href="/we-are-allowed/wallet/bookingnotpaid/?q={}"'
                    ' target="_blank">{}</a>'
                ).format(email, obj.ts.skill.name)
                return url

    skill.allow_tags = True

    # aa = str(obj.ts).split(";;")
    # return aa[0]

    # if obj.ts:
    #     return TutorSkillService.get_skill_name(obj.ts)
    # v = obj.baserequesttutor_set.first()
    # if v:
    #     return v.request_subjects
    # return None

    def booking_status(self, obj):
        return obj.get_status_display()


class BookingsNotClosedAdmin(BookingAdmin):
    list_filter = (
        BankTransferFilter,
        BookingsEndingSoonFilter,
        BookingsNotReviewedFilter,
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
                '<a href="/we-are-allowed/bookings/booking/?q={}" target="_blank" >{}</a>'
            ).format(obj.order, skill)

    skill_display.allow_tags = True

    def get_queryset(self, request):
        return (
            super(FollowUpBookingAdmin, self)
            .get_queryset(request)
            .filter(last_session__lte=timezone.now())
        )


create_modeladmin(BookingsNotClosedAdmin, Booking, name="BookingNotClosed")

create_modeladmin(FollowUpBookingAdmin, Booking, name="FollowUpBooking")


class BookingSessionActionForm(ActionForm):
    field = forms.ChoiceField(
        required=False,
        choices=(
            ("start", "start"),
            ("student_no", "student_no"),
            ("price", "price"),
            ("no_of_hours", "no_of_hours"),
        ),
    )
    value = forms.CharField(required=False, max_length=200)


@admin.register(BookingSession)
class BookingSessionAdmin(admin.ModelAdmin):
    list_display = (
        "client_email",
        "price",
        "status",
        "booking_order",
        "start",
        "no_of_hours",
    )
    search_fields = ["booking__order", "booking__user__email", "booking__tutor__email"]
    list_filter = (
        BookingSessionStatusFilter,
        BookingNotCancelledFilter,
        NoCategorySessionFilter,
        "booking__ts__skill__subcategories__name",
    )
    actions = (
        "mark_session_as_cancelled",
        "mark_session_as_completed",
        "export_as_json",
        "update_booking_session_field",
    )
    date_hierarchy = "start"
    form = BookingSessionForm
    action_form = BookingSessionActionForm

    def client_email(self, obj):
        if obj.booking:
            if obj.booking.user:
                return obj.booking.user.email
        return ""

    def booking_order(self, obj):
        if obj.booking:
            return obj.booking.order
        return ""

    def update_booking_session_field(self, request, queryset):
        field = request.POST.get("field")
        value = request.POST.get("value")
        x_value = None
        if field and value:
            if field in ["price", "student_no"]:
                x_value = float(value)
            elif field == "no_of_hours":
                x_value = float(value)
            else:
                x_value = value
        if x_value:
            queryset.update(**{field: x_value})

    def mark_session_as_cancelled(self, request, queryset):
        queryset.update(status=BookingSession.CANCELLED)

    def mark_session_as_completed(self, request, queryset):
        queryset.update(status=BookingSession.COMPLETED)

    def export_as_json(modeladmin, request, queryset):
        summation = queryset.aggregate(Sum("price"))
        response = JsonResponse(summation)
        return response


@admin.register(LetterInvite)
class LetterInviteAdmin(admin.ModelAdmin):
    pass


@admin.register(BookingSummary)
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
