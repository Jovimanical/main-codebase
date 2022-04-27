from dal import autocomplete
import datetime
from django.contrib import admin
from config.utils import create_modeladmin
from django.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django import forms

# Register your models here.
from users.models import User, UserProfile
from bookings.models import Booking
from registration.admin import StateFilter2
from .models import Referral, EmailInvite
from .tasks import notice_for_all_referrals


class EmailForm(forms.ModelForm):

    class Meta:
        fields = "__all__"
        model = EmailInvite
        widgets = {"user": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class ReferralForm(forms.ModelForm):

    class Meta:
        model = Referral
        fields = "__all__"
        widgets = {
            "referred_by": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "owner": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "manager": autocomplete.ModelSelect2(url="users:user-autocomplete"),
        }


@admin.register(Referral)
class RequestPoolAdmin(admin.ModelAdmin):
    list_display = [
        "owner",
        "referred_by",
        "created",
        "ref_amount",
        "used_credit",
        "agreed_percent",
    ]
    search_fields = ["referred_by__email", "owner__email"]
    form = ReferralForm


@admin.register(EmailInvite)
class EmailInviteAdmin(admin.ModelAdmin):
    list_display = ["email", "user", "email_sent"]
    search_fields = ["user__email", "email"]
    form = EmailForm


# @admin.register(CredentialsModel)
# class CredentialsAdmin(admin.ModelAdmin):
#     pass

# @admin.register(FlowModel)
# class FlowModelAdmin(admin.ModelAdmin):
#     pass


class ReferredByFilter(admin.SimpleListFilter):
    title = _("Brought a referrer")
    parameter_name = "brought_referrer"

    def lookups(self, request, model_admin):
        return (
            ("referred", _("Has Referred a referrer")),
            # ('not',_(''))
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(no_of_referrals__gt=0)
        return queryset


class DateElapsedFilter(admin.SimpleListFilter):
    title = _("Days Elapsed")
    parameter_name = "days_passed"

    def lookups(self, request, model_admin):
        return (
            (5, _("5 days elapsed")),
            (10, _("10 days elapsed")),
            (15, _("15 days elapsed")),
            (20, _("20 days elapsed")),
            (30, _("30 days elapsed")),
        )

    def queryset(self, request, queryset):
        if self.value():
            time_threshold = datetime.datetime.now() - datetime.timedelta(
                days=int(self.value())
            )
            return queryset.filter(ref_instance__flyer_date__lt=time_threshold)
        return queryset


class ReferralMonitoringAdmin(admin.ModelAdmin):
    list_display = [
        "full_name",
        "email",
        "number",
        "address",
        "date_elapsed",
        "booked_referrals",
        "tutors",
    ]
    search_fields = ["first_name", "last_name", "email"]
    list_filter = [
        ReferredByFilter,
        DateElapsedFilter,
        "ref_instance__is_manager",
        "ref_instance__offline",
        "ref_instance__downloaded_form",
        "recieve_email",
        StateFilter2,
    ]
    form = ReferralForm
    actions = ["update_referral_flyer_date", "send_email_on_new_update"]

    # def no_of_referrals(self,obj):
    # 	return obj.no_of_referrals

    def full_name(self, obj):
        return "%s %s" % (obj.first_name, obj.last_name)

    def requested_form(self, obj):
        return obj.ref_instance.offline

    requested_form.boolean = True

    def number(self, obj):
        return obj.primary_phone_no.number

    def date_elapsed(self, obj):
        ref = obj.ref_instance
        if ref.flyer_date:
            x = timezone.now() - ref.flyer_date
            return x.days

    date_elapsed.admin_order_field = "ref_instance__flyer_date"

    def address(self, obj):
        return obj.location_set.actual_tutor_address().full_address

    def booked_referrals(self, obj):
        return Booking.objects.clients_with_different_count(
            obj.referrals.values_list("owner_id", flat=True)
        )

    def tutors(self, obj):
        return obj.referrals.filter(
            owner__profile__application_status=UserProfile.VERIFIED
        ).count()

    def get_queryset(self, request):
        return (
            super(ReferralMonitoringAdmin, self)
            .get_queryset(request)
            .annotate(no_of_referrals=models.Count("referrals"))
            .filter(is_referrer=True)
            .select_related("ref_instance")
        )

    def update_referral_flyer_date(self, request, queryset):
        Referral.objects.filter(pk__in=queryset.values_list("pk", flat=True)).update(
            flyer_date=timezone.now()
        )

    def send_email_on_new_update(self, request, queryset):
        for x in queryset.all():
            notice_for_all_referrals.delay(x.pk)


create_modeladmin(ReferralMonitoringAdmin, User, name="ReferralMonitoring")
