import csv
import itertools
import logging
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
from operator import or_

import cloudinary

from cloudinary import CloudinaryImage

# from advanced_filters.admin import AdminAdvancedFiltersMixin
from allauth.account.admin import EmailAddressAdmin, EmailAddress
from dal import autocomplete
from django import forms
from django.contrib import admin
from django.contrib.admin.helpers import ActionForm
from django.db import models
from django.db.models.functions import Cast
from django.db.models import F, Sum, Case, When, IntegerField, Avg, Count, Value
from django.http import StreamingHttpResponse
from django.utils import timezone
from django.utils.functional import cached_property
from django.contrib import messages
from django.utils.translation import ugettext_lazy as _
from import_export import resources
from import_export.admin import ExportMixin

# Register your models here.
from registration.forms import TutorStatusForm
from registration.tasks import (
    notification_on_guarantor_delete,
    verify_id_to_new_tutors,
    sms_to_tutors_to_apply,
)
from rewards.models import Milestone
from skills.models import TutorSkill, Skill
from skills.services import TutorSkillService
from users import tasks
from users.admin import SocialMediaFilter, profile_picture_filter
from users.forms import UserProfileSpecialForm
from registration.tasks import (
    notification_on_guarantor_delete,
    verify_id_to_new_tutors,
    sms_to_tutors_to_apply,
)
from skills.models import TutorSkill, Skill
from config import utils
from config.utils import create_modeladmin, streaming_response
from skills.services import TutorSkillService
from allauth.account.admin import EmailAddressAdmin, EmailAddress
from allauth.socialaccount.admin import SocialAccountAdmin
from import_export import resources
from import_export.admin import ImportExportMixin, ImportExportModelAdmin, ExportMixin
from django.utils.functional import cached_property
from users.models import (
    UserProfile,
    User,
    TutorApplicant,
    Constituency,
    Location,
    UserIdentification,
    UserMilestone,
    VerifiedTutor,
    states,
)
from ..models import (
    WorkExperience,
    Education,
    Schedule,
    EventProxy,
    OccurrenceProxy,
    PhishyUser,
    Guarantor,
)

from registration.tasks import (
    notification_on_guarantor_delete,
    verify_id_to_new_tutors,
    sms_to_tutors_to_apply,
    tutor_to_update_price,
)
from skills.models import TutorSkill, Skill
from config import utils
from config.utils import create_modeladmin
from skills.services import TutorSkillService
from allauth.account.admin import EmailAddressAdmin, EmailAddress
from allauth.socialaccount.admin import SocialAccountAdmin
from import_export import resources
from import_export.admin import ImportExportMixin, ImportExportModelAdmin, ExportMixin
from django.utils.functional import cached_property

admin.site.unregister(EmailAddress)

logger = logging.getLogger(__name__)


class TutorResource(resources.ModelResource):
    # booking_count = resources.Field()
    # total_earned = resources.Field()
    full_name = resources.Field()
    # state = resources.Field()
    phonenumber = resources.Field()
    # gender = resources.Field()

    class Meta:
        model = User
        fields = ["email"]

    def dehydrate_state(self, user):
        states = [x["state"] for x in self.locations if x["user_id"] == user.id]
        return states[0] if len(states) > 0 else ""

    def dehydrate_phonenumber(self, user):
        vv = [x["number"] for x in self.phonenumbers if x["owner_id"] == user.pk]
        return vv[0] if len(vv) > 0 else ""

    def dehydrate_full_name(self, user):
        return "{} {}".format(user.first_name, user.last_name)

    def dehydrate_gender(self, user):
        return user.profile.gender

    # def dehydrate_booking_count(self, user):
    #     return user.bk

    @cached_property
    def all_users(self):
        from users.models import UserProfile

        return [
            x.pk
            for x in self.get_queryset().filter(
                profile__application_status=UserProfile.VERIFIED
            )
        ]

    @cached_property
    def locations(self):
        from users.models import Location

        return Location.objects.filter(user_id__in=self.all_users).values(
            "state", "user_id"
        )

    @cached_property
    def phonenumbers(self):
        from users.models import PhoneNumber

        return (
            PhoneNumber.objects.filter(primary=True)
            .filter(owner_id__in=self.all_users)
            .values("owner_id", "number")
        )

    @cached_property
    def transactions(self):
        from wallet.models import WalletTransactionType, WalletTransaction

        return (
            WalletTransaction.objects.filter(wallet__owner_id__in=self.all_users)
            .filter(type=WalletTransactionType.EARNING)
            .values("wallet__owner_id", "amount")
        )

    def dehydrate_total_earned(self, user):
        valid = [
            x["amount"] for x in self.transactions if x["wallet__owner_id"] == user.pk
        ]
        return sum(valid)


class GuarantorForm(forms.ModelForm):
    class Meta:
        model = Guarantor
        fields = "__all__"
        widgets = {"tutor": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class EducationForm(forms.ModelForm):
    class Meta:
        model = Education
        fields = "__all__"
        widgets = {"tutor": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class WorkExperienceForm(forms.ModelForm):
    class Meta:
        model = WorkExperience
        fields = "__all__"
        widgets = {"tutor": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class GenderFilter(admin.SimpleListFilter):
    title = _("Gender")
    parameter_name = "gender"

    def lookups(self, request, model_admin):
        return (("male", _("Male")), ("female", _("Female")))

    def queryset(self, request, queryset):
        if self.value() == "male":
            return queryset.filter(tutor__profile__gender=UserProfile.MALE)
        if self.value() == "female":
            return queryset.filter(tutor__profile__gender=UserProfile.FEMALE)
        return queryset


class GenderFilter2(admin.SimpleListFilter):
    title = _("Gender")
    parameter_name = "gender"

    def lookups(self, request, model_admin):
        return (("male", _("Male")), ("female", _("Female")))

    def queryset(self, request, queryset):
        if self.value() == "male":
            return queryset.filter(profile__gender=UserProfile.MALE)
        if self.value() == "female":
            return queryset.filter(profile__gender=UserProfile.FEMALE)
        return queryset


def admin_filter_for_verified_tutors(field="tutor"):
    class OnlyVerifiedTutorFilter(admin.SimpleListFilter):
        title = _("Tutor Status")
        parameter_name = "tutor_status"

        def lookups(self, request, model_admin):
            return (
                ("verified_tutors", _("Verified Tutors")),
                ("pending_verification", _("Pending Tutor Verification")),
                ("non_verified_tutors", _("Non Verified Tutors")),
            )

        def queryset(self, request, queryset):
            kwargs = {
                "{}__profile__application_status".format(field): UserProfile.VERIFIED
            }
            if self.value() == "verified_tutors":
                return queryset.filter(**kwargs)
            if self.value() == "non_verified_tutors":
                return queryset.exclude(**kwargs)
            if self.value() == "pending_verification":
                return queryset.filter(
                    **{
                        "{}__profile__application_status".format(
                            field
                        ): UserProfile.PENDING
                    }
                )
            return queryset

    return OnlyVerifiedTutorFilter


OnlyVerifiedTutorFilter = admin_filter_for_verified_tutors()


def get_verification_filter(user=True):
    class VerificationFilter2(admin.SimpleListFilter):
        title = _("Verify ID")
        parameter_name = "certificate"

        def lookups(self, request, model_admin):
            if user:
                return (
                    ("not_verified", _("ID not Verified")),
                    ("verified", _("Verified ID")),
                    ("email_verified", _("Email Verified")),
                    ("email_not_verified", _("Email Not Verified")),
                )
            else:
                return (
                    ("not_verified", _("ID not Verified")),
                    ("verified", _("Verified ID")),
                )

        def queryset(self, request, queryset):
            if user:
                if self.value() == "not_verified":
                    return queryset.exclude(user__identifications__verified=True)
                elif self.value() == "verified":
                    return queryset.filter(user__identifications__verified=True)
                elif self.value() == "email_verified":
                    return queryset.filter(user__emailaddress__verified=True)
                elif self.value() == "email_not_verified":
                    return queryset.filter(user__emailaddress__verified=False)
            else:
                if self.value() == "not_verified":
                    return queryset.exclude(identifications__verified=True)
                elif self.value() == "verified":
                    return queryset.filter(identifications__verified=True)
            return queryset

    return VerificationFilter2


VerificationFilter = get_verification_filter()

# class VerificationFilter(admin.SimpleListFilter):
#     title = _('Verify ID')
#     parameter_name = 'certificate'

#     def lookups(self, request, model_admin):
#         return (('not_verified', _('ID not Verified')),
#                 ('verified', _('Verified ID')),
#                 ('email_verified', _('Email Verified')),
#                 ('email_not_verified', _('Email Not Verified')),)

#     def queryset(self, request, queryset):
#         if self.value() == 'not_verified':
#             return queryset.exclude(user__identifications__verified=True)
#         elif self.value() == 'verified':
#             return queryset.filter(user__identifications__verified=True)
#         elif self.value() == 'email_verified':
#             return queryset.filter(user__emailaddress__verified=True)
#         elif self.value() == 'email_not_verified':
#             return queryset.filter(user__emailaddress__verified=False)
#         else:
#             return queryset


class NotVerifiedFilter(admin.SimpleListFilter):
    title = _("Verified Status")
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return (("not_verified", _("Not Verified")),)

    def queryset(self, request, queryset):
        if self.value() == "not_verified":
            return queryset.filter(verified=False)
        else:
            return queryset


class StarredFilter(admin.SimpleListFilter):
    title = _("Starred")
    parameter_name = "stared"

    def lookups(self, request, model_admin):
        return (("starred", _("Starred")),)

    def queryset(self, request, queryset):
        if self.value() == "starred":
            return queryset.filter(starred=True)
        else:
            return queryset


class ActiveSubjectFilter(admin.SimpleListFilter):
    title = _("By Skill Status")
    parameter_name = "skill_stat"

    def lookups(self, request, model_admin):
        return (
            ("active_subject", _("With Active Subject")),
            ("no_active_subject", _("With no active subject")),
        )

    def queryset(self, request, queryset):
        if self.value() == "active_subject":
            return queryset.annotate(
                active_skills=Sum(
                    Case(
                        When(user__tutorskill__status=2, then=1),
                        output_field=IntegerField(),
                    )
                )
            ).filter(active_skills__gt=0)
        if self.value() == "no_active_subject":
            return queryset.annotate(
                active_skills=Sum(
                    Case(
                        When(user__tutorskill__status=2, then=1),
                        output_field=IntegerField(),
                    )
                )
            ).filter(active_skills=None)
        return queryset


class SubjectCountFilter(admin.SimpleListFilter):
    title = _("By No of Skill")
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return (
            ("no_subject", _("No Subject")),
            ("subject", _("Has Subject")),
            ("with_subject", _("With Subject")),
            ("heading", _("With Description")),
        )

    def queryset(self, request, queryset):
        if self.value() == "no_subject":
            return queryset.annotate(s_count=models.Count("user__tutorskill")).filter(
                s_count=0
            )
        if self.value() == "subject":
            return queryset.annotate(s_count=models.Count("user__tutorskill")).exclude(
                s_count=0
            )
        if self.value() == "with_subject":
            return queryset.annotate(s_count=models.Count("user__tutorskill")).filter(
                s_count__gt=0
            )
        if self.value() == "heading":
            return queryset.exclude(description=None).exclude(description="")
        if self.value() == "active_subject":
            return queryset.annotate(
                active_skills=Sum(
                    Case(
                        When(user__tutorskill__status=2, then=1),
                        output_field=IntegerField(),
                    )
                )
            ).filter(active_skills__gt=0)

        return queryset


class WithCalendarFilter(admin.SimpleListFilter):
    title = "Calendar"
    parameter_name = "has_calendar"

    def lookups(self, request, model_admin):
        return (
            ("has_calendar", _("Has Calendar")),
            ("no_calendar", _("No Calendar")),
            ("no_creator", _("No Creator")),
            ("has_creator", _("Has Creator")),
        )

    def queryset(self, request, queryset):
        if self.value() == "has_calendar":
            return queryset.exclude(calendar=None)
        if self.value() == "no_calendar":
            return queryset.filter(calendar=None)
        if self.value() == "no_creator":
            return queryset.filter(creator=None)
        if self.value() == "has_creator":
            return queryset.exclude(creator=None)
        return queryset


class CalendarTypeFilter(admin.SimpleListFilter):
    title = "Calendar Type"
    parameter_name = "cal_type"

    def lookups(self, request, model_admin):
        return (
            ("available", _("Availability Calendar")),
            ("booking", _("Booking Calendar")),
        )

    def queryset(self, request, queryset):
        if self.value() == "available":
            return queryset.filter(
                calendar__schedule__calender_type=Schedule.AVAILABILITY
            )
        if self.value() == "booking":
            return queryset.filter(calendar__schedule__calender_type=Schedule.BOOKING)
        return queryset


class InvalidScheduleFilter(admin.SimpleListFilter):
    title = "Invalid EndTime"
    parameter_name = "end time"

    def lookups(self, request, model_admin):
        return (("less_than", _("End Time Less Than Start Time")),)

    def queryset(self, request, queryset):
        if self.value() == "less_than":
            return queryset.filter(start__gt=F("end"))
        return queryset


class StartTimeFilter(admin.SimpleListFilter):
    title = "Start Times"
    parameter_name = "start_time"

    def lookups(self, request, model_admin):
        return (("after_noon", _("After Noon")),)

    def queryset(self, request, queryset):
        if self.value() == "after_noon":
            return queryset.extra(where=["extract( HOUR FROM start ) > 12"])
        return queryset


class StateFilter22(admin.SimpleListFilter):
    title = _("By State")
    parameter_name = "state"

    def lookups(self, request, model_admin):
        return tuple([(x, _(x)) for x in states])

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(
                user__location__state__istartswith=self.value(),
                user__location__addr_type=2,
            )
        return queryset


class StateFilter(admin.SimpleListFilter):
    title = _("By State")
    parameter_name = "state"

    def lookups(self, request, model_admin):
        return tuple([(x, _(x)) for x in states])

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(
                tutor__location__state__istartswith=self.value(),
                tutor__location__addr_type=2,
            )
        return queryset


class CalculateDistanceForm(ActionForm):
    # lat = forms.DecimalField(required=False)
    # lon = forms.DecimalField(required=False)
    tax_id = forms.CharField(required=False)
    request_pk = forms.IntegerField(required=False)
    region = forms.ModelChoiceField(required=False, queryset=Constituency.objects.all())
    price = forms.DecimalField(required=False)


class ActionForms(object):
    pass


class DistanceMixin(admin.ModelAdmin):
    list_display2 = ("distance",)
    actions = [
        "update_tax_id",
        "send_emails_to_tutors_on_request",
        "send_mail_to_verify_id",
        "send_mail_to_reupload_profile_picture",
        "sms_to_tutors_to_apply",
        "sms_to_tutors_to_create_subjects",
        "set_tutor_ability_to_teach_online",
        "remove_tutor_ability_to_teach_online",
        "update_price_for_selected_tutor",
        "deduct_writing_fee",
        "freeze_tutor_profile" "sync_to_mailing_list"
        #    'tutor_statistics',
        #    'send_emails_to_tutors_on_request2'
    ]
    # action_form = CalculateDistanceForm

    def sync_to_mailing_list(self, request, queryset):
        for i in queryset:
            i.to_mailing_list()

    def freeze_tutor_profile(self, request, queryset):
        for k in queryset.all():
            TutorSkill.objects.filter(
                tutor_id=k.id, status__in=[TutorSkill.ACTIVE, TutorSkill.PENDING]
            ).update(status=TutorSkill.SUSPENDED)
        user_ids = queryset.values_list("pk", flat=True)
        UserProfile.objects.filter(user_id__in=list(user_ids)).update(
            application_status=UserProfile.FROZEN
        )
        self.message_user(request, "Frozen account successful")

    def tutor_location(self, obj):
        return obj.location_set.actual_tutor_address()

    def update_tax_id(self, request, queryset):
        tax_id = request.POST.get("tax_id")
        if tax_id:
            for x in queryset.all():
                x.save_tax_info(tax_id)
            self.message_user(request, "Tax ID for tutor updated")

    def deduct_writing_fee(self, request, queryset):
        from registration.tasks import deduct_writing_fee_task

        ids = queryset.values_list("pk", flat=True)
        # deduct_writing_fee_task.delay(list(ids), 5000)
        deduct_writing_fee_task(list(ids), 5000)

    def update_price_for_selected_tutor(self, request, queryset):
        price = request.POST.get("price")
        TutorSkillService.update_prices_for_tutors(
            list(queryset.values_list("pk", flat=True)), int(price)
        )
        self.message_user(request, "Tutor's price updated successfully")

    def sms_to_tutors_to_apply(self, request, queryset):
        request_pk = request.POST.get("request_pk")
        for x in queryset.values_list("pk", flat=True):
            sms_to_tutors_to_apply.delay(x, request_pk)

    def set_tutor_ability_to_teach_online(self, request, queryset):
        User.objects.filter(id__in=list(queryset.values_list("id", flat=True))).update(
            teach_online=True
        )

    def remove_tutor_ability_to_teach_online(self, request, queryset):
        User.objects.filter(id__in=list(queryset.values_list("id", flat=True))).update(
            teach_online=False
        )

    def sms_to_tutors_to_create_subjects(self, request, queryset):
        from ..tasks import sms_to_create_subjects

        for x in queryset.values_list("pk", flat=True):
            sms_to_create_subjects.delay(x)

    def send_emails_to_tutors_on_request(self, request, queryset):
        from connect_tutor.tasks import mail_to_tutor_on_request_application

        request_pk = request.POST.get("request_pk")
        if request_pk:
            for x in queryset.all():
                mail_to_tutor_on_request_application.delay(request_pk, x.pk)

    # def send_emails_to_tutors_on_request2(self, request, queryset):
    #     from connect_tutor.tasks import mail_to_tutor_on_request_application
    #     request_pk = queryset.first()
    #     if request_pk.request_info:
    #         for x in queryset.all():
    #             mail_to_tutor_on_request_application.delay(
    #                 x.request_info_id, x.pk)

    def send_mail_to_verify_id(self, request, queryset):
        queryset.send_email_to_verify_id()
        # for x in queryset.all():
        #     verify_id_to_new_tutors.delay(x.pk)

    # def tutor_statistics(self, request, queryset):
    #     state = request.GET.get('state')
    # return HttpResponseRedirect(reverse('users:tutor-stats', args=[state]))

    def send_mail_to_reupload_profile_picture(self, request, queryset):
        queryset.send_mail_to_reupload_profile_picture()
        # for x in queryset.all():
        #     verify_id_to_new_tutors.delay(x.pk, False)

    def distance(self, obj):
        loc = self.tutor_location(obj)
        if loc:
            return loc.calculate_distance(self.latitude, self.longitude)

    # def get_list_display(self, request):
    #     if hasattr(self, "latitude") and hasattr(self, "longitude"):
    #         return self.list_display + self.list_display2
    #     return super(DistanceMixin, self).get_list_display(request)

    # def changelist_view(self, request, *args, **kwargs):
    #     if request.session.get("admin_latitude") and request.session.get(
    #         "admin_longitude"
    #     ):
    #         self.latitude = request.session["admin_latitude"]
    #         self.longitude = request.session["admin_longitude"]
    #     return super(DistanceMixin, self).changelist_view(request, *args, **kwargs)


class AdminMixins(DistanceMixin):
    list_display = ("tutor", "classes")
    list_filter = (
        StateFilter,
        NotVerifiedFilter,
        GenderFilter,
        OnlyVerifiedTutorFilter,
    )

    def mark_as_verified(self, request, queryset):
        queryset.update(verified=True)

    mark_as_verified.description = "Mark as Verified"

    def classes(self, obj):
        return obj.tutor.profile.classes

    def tutor_location(self, obj):
        return obj.tutor.location_set.actual_tutor_address()


@admin.register(WorkExperience)
class WorkExperienceAdmin(ActionForms, AdminMixins):
    list_display = AdminMixins.list_display + (
        "name",
        "role",
        "tutor_address",
        "currently_work",
    )
    search_fields = ("^tutor__email", "name", "role")
    actions = DistanceMixin.actions + ["mark_as_verified"]
    form = WorkExperienceForm

    def tutor_address(self, obj):
        loc = self.tutor_location(obj)
        if loc:
            return loc.full_address


@admin.register(Education)
class EducationAdmin(ActionForms, AdminMixins, DistanceMixin):
    list_display = AdminMixins.list_display + ("school", "course", "degree")
    search_fields = ("^tutor__email", "school", "course")
    form = EducationForm


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ["tutor", "cal_type", "last_updated"]

    def cal_type(self, obj):
        return obj.get_calender_type_display()

    def get_queryset(self, request):
        return (
            super(ScheduleAdmin, self)
            .get_queryset(request)
            .filter(calender_type=Schedule.AVAILABILITY)
        )


@admin.register(OccurrenceProxy)
class OccurenceAdmin(admin.ModelAdmin):
    pass


@admin.register(EventProxy)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "tutor", "start", "end", "end_recurring_period"]
    list_filter = (
        WithCalendarFilter,
        CalendarTypeFilter,
        InvalidScheduleFilter,
        StartTimeFilter,
    )
    search_fields = ["calendar__schedule__tutor__email", "calendar__id"]
    actions = ["add_creator", "fix_end_time"]

    def add_creator(self, request, queryset):
        for event in queryset.all():
            ss = Schedule.objects.get(calendar=event.calendar)
            EventProxy.objects.filter(event.id).update(creator=ss.tutor)

    def fix_end_time(self, request, queryset):
        queryset.update(end=F("end") + timedelta(hours=12))


# @admin.register(CalendarProxy)
# class CalendarAdmin(admin.ModelAdmin):
#     list_display = ['name', 'pk']
#     search_fields = ['schedule__tutor__email']


class UserPreferenceAdminInline(admin.TabularInline):
    model = UserProfile
    form = TutorStatusForm


class MoriningFilter(admin.SimpleListFilter):
    title = _("Timeslot")
    parameter_name = "time_slot"
    MORINING = "morining_slot"
    AFTERNOON = "afternoon_slot"
    EVENING = "evening_slot"

    def lookups(self, request, model_admin):
        return (
            (self.MORINING, _("By morining slot")),
            (self.AFTERNOON, _("By afternoon slot")),
            (self.EVENING, _("By evening slot")),
            ("being_verified", _("Already Verified")),
        )

    def queryset(self, request, queryset):
        if self.value() == self.MORINING:
            return queryset.filter(interview_slot=TutorApplicant.MORNINIG)
        elif self.value() == self.AFTERNOON:
            return queryset.filter(interview_slot=TutorApplicant.AFTERNOON)
        elif self.value() == self.EVENING:
            return queryset.filter(interview_slot=TutorApplicant.EVENING)
        elif self.value() == "being_verified":
            return queryset.been_verified()
        else:
            return queryset


class AmountEarnedFilter(admin.SimpleListFilter):
    title = "amount earned"
    parameter_name = "amount_earned"

    def lookups(self, request, model_admin):
        return ((">0", "Has earned on tuteria"),)

    def queryset(self, request, queryset):
        if self.value() == ">0":
            return queryset.filter(amount_made__gt=0)
        return queryset


class HoursFilter(admin.SimpleListFilter):
    title = "hours taught"
    parameter_name = "hours_taught"

    def lookups(self, request, model_admin):
        return ((">300", "> than 300 hours"),)

    def queryset(self, request, queryset):
        if self.value() == ">300":
            return queryset.filter(no_of_hours__gt=300)
        return queryset


class Echo(object):
    """An object that implements just the write method of the file-like
    interface.
    """

    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


class TaxIDFilter(admin.SimpleListFilter):
    title = _("Tax ID")
    parameter_name = "with_tax"

    def lookups(self, request, model_admin):
        return (("with_tax", _("With Tax id")), ("no_tax", _("Without taxid")))

    def queryset(self, request, queryset):
        if self.value() == "with_tax":
            return queryset.filter(data_dump__tax_info__tax_id__isnull=False)
        if self.value() == "no_tax":
            return queryset.filter(data_dump__tax_info__isnull=True)
        return queryset


class TutorRevampFilter(admin.SimpleListFilter):
    title = _("Revamped Profile")
    parameter_name = "revamp_profile"

    def lookups(self, request, model_admin):
        return (
            ("not_completed_revamp", _("Not completed revamp")),
            ("completed", _("Completed revamp")),
            ("no_revamp", _("has not updated profile info")),
            ("missing_revamp", _("Missing revamp record")),
            ("not_completed", _("Combined missing with not submitted")),
        )

    def queryset(self, request, queryset):
        updated_info = queryset.filter(data_dump__tutor_update__others__isnull=False)
        if self.value() == "not_completed_revamp":
            # completed_ids = queryset.filter(
            #     data_dump__tutor_update__others__isnull=True
            # )
            ids = updated_info.values_list("id", flat=True)
            return queryset.exclude(id__in=list(ids))
        if self.value() == "completed":
            return updated_info
            # return queryset.exclude(data_dump__tutor_update__others__submission=True)
        if self.value() == "no_revamp":
            return queryset.exclude(data_dump__tutor_update__others__submission=True)
        if self.value() == "missing_revamp":
            return queryset.filter(data_dump__tutor_update__isnull=True)
        if self.value() == "not_completed":
            condition1 = models.Q(data_dump__tutor_update__isnull=True)
            condition2 = models.Q(data_dump__tutor_update__others__isnull=True)
            return queryset.filter(condition1 | condition2)
        return queryset


class TutorRevampFilter2(admin.SimpleListFilter):
    title = _("Revamped Profile")
    parameter_name = "revamp_profile"

    def lookups(self, request, model_admin):
        return (("no_revamp", _("has not updated profile info")),)

    def queryset(self, request, queryset):
        if self.value() == "no_revamp":
            return queryset.exclude(
                user__data_dump__tutor_update__others__submission=True
            )
        return queryset


class IsNewTutorFilter(admin.SimpleListFilter):
    title = _("Is new Tutor")
    parameter_name = "is_new_tutor"

    def lookups(self, request, model_admin):
        return [("is_new_tutor", "Is New Tutor")]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(date_joined__year__gte=2022)
        return queryset


class IsNewProfileTutorFilter(IsNewTutorFilter):
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(user__date_joined__year__gte=2022)
        return queryset


# @admin.register(VerifiedTutor)
class VerifiedTutorAdmin(admin.ModelAdmin):
    list_display = (
        "email",
        "tutor_info",
        "is_new_tutor",
        "no_of_hours",
        "active",
        "denied",
        "pending",
        "modification",
        "no_of_bookings",
        "total_amount_made",
        "dob",
        "date_approved",
        "first_job_date",
        "days_approved_to_first_job",
    )
    list_select_related = ("user",)
    form = UserProfileSpecialForm
    list_filter = (
        HoursFilter,
        AmountEarnedFilter,
        IsNewProfileTutorFilter,
        SubjectCountFilter,
        ActiveSubjectFilter,
        StarredFilter,
        SocialMediaFilter,
        StateFilter22,
    )
    search_fields = ["^user__email", "user__first_name"]
    actions = (
        "send_email_on_subject_creation",
        "send_email_on_social_media_update",
        "export_as_csv",
        "export_as_csv_for_calendar",
        "send_mail_to_all_tutors_about_content",
        "remove_description",
        "export_lon_lat_by_state",
        "send_sms_on_subject_creation",
    )

    def days_approved_to_first_job(self, obj):
        if obj.first_job_date and obj.date_approved:
            return (obj.first_job_date - obj.date_approved).days

    days_approved_to_first_job.short_description = "days from approval"

    def job_this_month(self, obj):
        return obj.job_this_month

    def tutor_info(self, obj):
        return f'<a href="/we-are-allowed/tutor_management/verifiedtutorwithskill/?q={obj.user.email}" target="_blank">View tutor info</a>'

    tutor_info.allow_tags = True

    def first_job_date(self, obj):
        if obj.first_job_date:
            return f'<a href="/we-are-allowed/bookings/booking/?q={obj.user.email}" target="_blank">{obj.first_job_date}</a>'

    first_job_date.allow_tags = True

    def is_new_tutor(self, obj):
        return obj.user.date_joined.year >= 2022

    is_new_tutor.boolean = True

    def active(self, obj):
        return obj.active

    def pending(self, obj):
        return obj.pending

    def modification(self, obj):
        return obj.modification

    def denied(self, obj):
        return obj.denied

    def get_queryset(self, request):
        return super(VerifiedTutorAdmin, self).get_queryset(request).statistics_admin()

    def total_amount_made(self, obj):
        return obj.amount_made

    def no_of_hours(self, obj):
        return obj.no_of_hours

    def email(self, obj):
        return obj.user.email

    def no_of_bookings(self, obj):
        return obj.no_of_bookings

    no_of_bookings.admin_order_field = "no_of_bookings"

    def export_as_csv(modeladmin, request, queryset):
        """A view that streams a large CSV file."""
        # Generate a sequence of rows. The range is based on the maximum number of
        # rows that can be handled by a single sheet in most spreadsheet
        # applications.
        # rows = (["Row {}".format(idx), str(idx)] for idx in range(65536))
        rows = (
            [
                idx.user.email,
                idx.user.first_name,
                idx.user.last_name,
                str(idx.user.primary_phone_no),
                f"https://www.tuteria.com/api/tutors/redirect?slug={idx.user.slug}",
            ]
            for idx in queryset.all()
        )
        response = streaming_response(rows, "tutors_without_skill")
        return response
        # response = HttpResponse(content_type="application/json")
        # serializers.serialize("json", queryset, stream=response)
        # return response

    def export_as_csv_for_calendar(modeladmin, request, queryset):
        """A view that streams a large CSV file."""
        # Generate a sequence of rows. The range is based on the maximum number of
        # rows that can be handled by a single sheet in most spreadsheet
        # applications.
        header = [
            [
                "Subject",
                "Start Date",
                "Start Time",
                "End Date",
                "End Time",
                "All Day Event",
                "Reminder On/Off",
                "Reminder Date",
                "Reminder Time",
                "Meeting Organizer",
                "Description",
                "Location",
                "Private",
            ]
        ]

        tutors_with_dob = queryset.all().filter(dob__isnull=False)

        this_year = str(timezone.now().year)

        rows = (
            [
                f"Tutor: {idx.full_name}'s Birthday",
                idx.dob.strftime("%m/%d/{0}".format(this_year)),
                "6:00 AM",
                idx.dob.strftime("%m/%d/{0}".format(this_year)),
                "8:00 PM",
                False,
                "Off",
                idx.dob.strftime("%m/%d/{0}".format(this_year)),
                "9:00 AM",
                "Tuteria",
                f"Please send birthday message to {idx.full_name} at {idx.user.email}",
                idx.user.country,
                False,
            ]
            for idx in tutors_with_dob
        )

        gens = [(x for x in header), rows]
        output = itertools.chain()
        for gen in gens:
            output = itertools.chain(output, gen)

        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in output), content_type="text/csv"
        )
        response[
            "Content-Disposition"
        ] = 'attachment; filename="tutors_without_skill.csv"'
        return response

    def export_lon_lat_by_state(self, request, queryset):
        rows = (
            [
                idx.user.email,
                idx.user.location_set.actual_tutor_address().latitude,
                idx.user.location_set.actual_tutor_address().longitude,
                idx.user.location_set.actual_tutor_address().state,
                idx.user.tutorskill_set.active().aggregate(Avg("price"))["price__avg"],
            ]
            for idx in queryset.all()
        )
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response[
            "Content-Disposition"
        ] = 'attachment; filename="tutors_without_skill.csv"'
        return response

    def send_sms_on_subject_creation(self, request, queryset):
        from ..tasks import sms_to_create_subjects

        for u in queryset.exclude(blacklist=True).all():
            sms_to_create_subjects.delay(u.user_id)

    def send_email_on_subject_creation(self, request, queryset):
        for u in queryset.exclude(blacklist=True).all():
            tasks.email_to_create_subject.delay(u.user.email)

    def send_email_on_social_media_update(self, request, queryset):
        for u in queryset.exclude(blacklist=True).all():
            tasks.email_to_update_social_media.delay(u.user.email)

    def send_mail_to_all_tutors_about_content(self, request, queryset):
        for u in queryset.exclude(blacklist=True).all():
            tasks.email_to_all_verified_tutors.delay(u.user.email)

    def remove_description(self, request, queryset):
        queryset.update(description="")


class FForm(ActionForm):
    text_msg = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=3, placeholder="text_msg")),
        required=False,
    )


@admin.register(TutorApplicant)
class TutorAdmin(admin.ModelAdmin):
    action_form = FForm
    form = UserProfileSpecialForm
    list_display = (
        "email",
        "full_name",
        "profile_thumbnail",
        "date_approved",
        "email_verified",
        "home_address",
        "tutor_address",
        "social_networks",
        "dob",
        "tutor_description",
        "description",
        "gender",
        "phone_number",
        "address_reason",
        "educations",
        "classes",
        "years_display",
        "curriculum_used",
        "curriculum_explanation",
        "work_experiences",
        "potential_subjects",
        "levels_with_exams",
        "answers",
    )
    list_filter = (MoriningFilter, VerificationFilter)
    actions = [
        "mark_as_verified",
        "mark_as_denied",
        "mark_id_as_verified",
        "mark_id_as_rejected",
        "export_phone_number_as_csv",
        "verify_email_notification",
        "send_text_message",
        "send_mail_to_pending_applicant_to_populate_content",
    ]
    search_fields = ["^user__email"]

    def get_queryset(self, request):
        query = (
            super()
            .get_queryset(request)
            .select_related("user")
            .prefetch_related(
                "user__education_set",
                "user__workexperience_set",
                "user__socialaccount_set",
                "user__phonenumber_set",
                "user__location_set",
            )
        )
        return query

    def verify_email_notification(self, request, queryset):
        queryset.verify_email_notification()
        # qq = [x.user_id for x in queryset.all()]
        # tasks.verify_email_notification.delay(qq)

    def email(self, obj):
        return obj.user.email

    def years_display(self, obj):
        return obj.get_years_of_teaching_display()

    def mark_as_verified(self, request, queryset):
        queryset.approve_tutor(True)
        # from external.models import Agent

        # agent = Agent.get_or_create_agent_with_required_details(
        #     request.user, Agent.TUTOR
        # )
        # TutorApplicant.mark_as_verified_bulk(queryset.all(), agent=agent)

    mark_as_verified.description = "Mark Tutors as Verified"

    def mark_as_denied(self, request, queryset):
        queryset.approve_tutor(False)
        # from external.models import Agent

        # agent = Agent.get_or_create_agent_with_required_details(
        #     request.user, Agent.TUTOR
        # )
        # TutorApplicant.mark_as_verified_bulk(queryset.all(), status=False, agent=agent)

    mark_as_denied.description = "Deny Tutors Application"

    def mark_id_as_verified(self, request, queryset):
        queryset.mark_id_as_verified()
        # users = [x.user for x in queryset.all()]
        # ids = [x.id for x in users]
        # UserIdentification.objects.filter(user__in=users).update(verified=True)
        # User.objects.filter(id__in=ids).update(submitted_verification=True)
        # reward2 = Milestone.get_milestone(Milestone.VERIFIED_ID)
        # for user in users:
        #     if user.tuteria_verified:
        #         UserMilestone.objects.get_or_create(user=user, milestone=reward2)

    def mark_id_as_rejected(self, request, queryset):
        queryset.mark_id_as_rejected()
        # public_ids = [x.user.identity.identity.public_id for x in queryset.all()]
        # users = [x.user for x in queryset.all()]
        # logger.debug("Move to celery task")
        # cloudinary.api.delete_resources(public_ids)
        # UserIdentification.objects.filter(user__in=users).delete()

    def export_phone_number_as_csv(self, request, queryset):
        """A view that streams a large CSV file."""
        # Generate a sequence of rows. The range is based on the maximum number of
        # rows that can be handled by a single sheet in most spreadsheet
        # applications.
        # rows = (["Row {}".format(idx), str(idx)] for idx in range(65536))
        rows = ([str(idx.phone_number().number)] for idx in queryset.all())
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response[
            "Content-Disposition"
        ] = 'attachment; filename="email_not_verified_tutors.csv"'
        return response

    def send_mail_to_pending_applicant_to_populate_content(self, request, queryset):
        for u in queryset.all():
            tasks.email_to_all_verified_tutors.delay(u.user.email)

    def send_notification_text_message(self, request, queryset):
        ids = queryset.values_list("pk", flat=True)
        text = request.POST.get("text_msg")
        if text:
            tasks.send_text_message.delay(list(ids), text)


@admin.register(EmailAddress)
class NewEmailAddressAdmin(EmailAddressAdmin):
    list_filter = EmailAddressAdmin.list_filter + (
        admin_filter_for_verified_tutors("user"),
    )
    actions = ("verify_email_notification",)

    def verify_email_notification(self, request, queryset):
        qq = [x.user_id for x in queryset.all()]
        tasks.verify_email_notification.delay(qq)


@admin.register(PhishyUser)
class PhisyUserAdmin(admin.ModelAdmin):
    list_display = ["user", "first_name", "last_name", "dob"]
    search_fields = ["user__email"]


@admin.register(Guarantor)
class GuarantorAdmin(admin.ModelAdmin):
    list_display = [
        "tutor",
        "email",
        "first_name",
        "last_name",
        "no_of_years",
        "phone_no",
        "organization",
        "verified",
    ]
    search_fields = ["tutor__email"]
    actions = ["verify_guarantor"]
    form = GuarantorForm

    def phone_no(self, obj):
        if obj.phone_no:
            return str(obj.phone_no)
        return ""

    def verify_guarantor(self, request, queryset):
        queryset.update(verified=True)

    def deny_guarantor(self, request, queryset):
        for q in queryset.all():
            notification_on_guarantor_delete.delay(q.pk)


class StateFilter2(admin.SimpleListFilter):
    title = _("By State")
    parameter_name = "state"

    def lookups(self, request, model_admin):
        return tuple([(x, _(x)) for x in states])

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(
                data_dump__tutor_update__personalInfo__state__istartswith=self.value(),
            )
        return queryset


class CurriculumFilter(admin.SimpleListFilter):
    title = _("By Curriculum")
    parameter_name = "curriculum"

    def lookups(self, request, model_admin):
        return UserProfile.CURRICULUM

    def queryset(self, request, queryset):
        if self.value():
            name = dict(self.lookup_choices)[self.value()]
            profiles = UserProfile.objects.filter(
                curriculum_used__contains=[self.value()]
            ).values_list("user_id", flat=True)
            q2 = list(profiles)
            q3 = (
                TutorSkill.objects.exclude(status=TutorSkill.DENIED)
                .annotate(z_preferences=Cast("other_info", models.TextField()))
                .filter(z_preferences__icontains=name)
                .values_list("tutor_id", flat=True)
            )
            q2 = list(set(q2 + list(q3)))
            return queryset.annotate(
                d_dump=Cast("data_dump", models.TextField())
            ).filter(models.Q(d_dump__icontains=name) | models.Q(id__in=list(q2)))
        return queryset


class BaseListFilter(admin.ListFilter):
    def __init__(self, request, params, model, model_admin):
        self.used_parameters = {}
        for p in self.expected_parameters():
            if p in params:
                value = params.pop(p)
                self.used_parameters[p] = value.split("|")

    def expected_parameters(self):
        return [self.parameter_name]

    def has_output(self):
        return True

    def choices(self, cl):
        yield {
            "selected": False,
            "query_string": cl.get_query_string({}, [self.parameter_name]),
            "display": "All",
        }

    def queryset(self, request, queryset):
        """
        Returns the filtered queryset based on the value
        provided in the query string and retrievable via
        `self.value()`.
        """
        value_options = self.used_parameters.get(self.parameter_name, None)
        if not value_options:
            return queryset
        return self.query_function(queryset, value_options)

    def query_function(self, queryset, value_options):
        pass


def regular_expression_filter_factory(field_name, tutorskill=False):
    class MultipleValueOptionsFilter(BaseListFilter):
        title = field_name
        parameter_name = "_".join([field_name, "contains"])

        def query_function(self, queryset, value_options):
            filter_dict = {
                "__".join([field_name, "iregex"]): r"\y{0}\y".format(
                    "".join(value_options)
                )
            }
            qs = queryset.filter(**filter_dict)
            if tutorskill:
                return qs.exclude(tutorskill__status=TutorSkill.DENIED)
            return qs
            #
            # def queryset(self, request, queryset):
            #     """
            #     Returns the filtered queryset based on the value
            #     provided in the query string and retrievable via
            #     `self.value()`.
            #     """
            #     value_options = self.used_parameters.get(self.parameter_name, None)
            #     if not value_options:
            #         return queryset

    return MultipleValueOptionsFilter


def in_filter_factory(field_name, skill=False):
    class MultipleValueOptionsFilter(BaseListFilter):
        title = field_name
        # Parameter for the filter that will be used in the URL query.
        parameter_name = "_".join([field_name, "contains"])

        def query_function(self, queryset, value_options):
            whole = [x for x in ",".join(value_options).split(",")]
            skill = []
            for v in whole:
                uu = Skill.objects.filter(name__istartswith=v).values_list(
                    "pk", flat=True
                )
                skill.append(uu)
            v = list(itertools.product(*skill))
            z = [models.Q(tutorskill__skill_id__in=(x)) for x in v]

            return queryset.filter(reduce(or_, z)).exclude(
                tutorskill__status=TutorSkill.DENIED
            )

    return MultipleValueOptionsFilter


def multiple_value_options_filter_factory(field_name):
    """
    This is a class factory. It creates classes used
    for filtering by multiple value options.

    The field options are separated by a "|" character.

    If any of the specified options (or "") is the
    value of the field of a record, then such record
    is considered matching.

    The name of the field that should be using for
    filtering is passed as the argument to the function.
    """

    class MultipleValueOptionsFilter(BaseListFilter):
        # Human-readable title which will be displayed in the
        # right admin sidebar just above the filter options.
        title = field_name

        # Parameter for the filter that will be used in the URL query.
        parameter_name = "_".join([field_name, "in"])

        def query_function(self, queryset, value_options):
            filter_dict = {"__".join([field_name, "contains"]): value_options}
            return queryset.filter(**filter_dict)

    return MultipleValueOptionsFilter


class ActiveSkillFilter(admin.SimpleListFilter):
    title = _("Active Skill")
    parameter_name = "active_sub"

    def lookups(self, request, model_admin):
        return (
            ("active", _("has active subject")),
            ("inactive", _("No active subject")),
        )

    def queryset(self, request, queryset):
        if self.value() == "active":
            return queryset.filter(active_skill__gt=0)
        if self.value() == "inactive":
            return queryset.filter(active_skill=0)
        return queryset


class NotPopulatedSubjectFilter(admin.SimpleListFilter):
    title = _("Not Poulated Subject")
    parameter_name = "no_test"

    def lookups(self, request, model_admin):
        return (("not_populated", _("Taken Test but not populated subject")),)

    def queryset(self, request, queryset):
        if self.value() == "not_populated":
            from skills.models import TutorSkill

            tutors_in_list = (
                TutorSkill.objects.all()
                .taken_tests_but_no_content()
                .values_list("tutor_id", flat=True)
            )
            return queryset.filter(id__in=tutors_in_list)
        return queryset


class CommonEntranceFilter(admin.SimpleListFilter):
    title = "Common Entrance"
    parameter_name = "common_entrance"

    def lookups(self, request, model_admin):
        return (
            ("Yes", _("Taught Common Entrance")),
            ("Montessori", _("Taught Montesorri")),
        )

    def queryset(self, request, queryset):
        if self.value() == "Yes":
            return queryset.filter(profile__answers__Primary__0="Yes")
        if self.value() == "Montessori":
            return queryset.filter(profile__answers__Nursery__0="Yes")
        return queryset


class ArrayFieldListFilter(admin.SimpleListFilter):
    """This is a list filter based on the values
    from a model's `keywords` ArrayField."""

    title = "Exams"
    parameter_name = "exams"

    def lookups(self, request, model_admin):
        # Very similar to our code above, but this method must return a
        # list of tuples: (lookup_value, human-readable value). These
        # appear in the admin's right sidebar

        keywords = UserProfile.objects.values_list("levels_with_exams", flat=True)
        keywords = [x for x in keywords if x is not None]
        keywords = [(kw, kw) for sublist in keywords for kw in sublist if kw]
        keywords = sorted(set(keywords))
        return keywords

    def queryset(self, request, queryset):
        # when a user clicks on a filter, this method gets called. The
        # provided queryset with be a queryset of Items, so we need to
        # filter that based on the clicked keyword.

        lookup_value = self.value()  # The clicked keyword. It can be None!
        if lookup_value:
            # the __contains lookup expects a list, so...
            queryset = queryset.filter(
                profile__levels_with_exams__contains=[lookup_value]
            )
        return queryset


class HasRegionFilter(admin.SimpleListFilter):
    title = "Region"
    parameter_name = "region"

    def lookups(self, request, model_admin):
        tuples = tuple(Constituency.objects.values_list("name", "name"))
        return tuples + (("None", "No Region"), ("has_region", "Has Region"))

    def queryset(self, request, queryset):
        # if self.value() == 'has_region':
        # #     return queryset.exclude(location__region=None)
        if self.value():
            if self.value() == "has_region":
                return queryset.exclude(location__region=None)
            if self.value() == "None":
                return queryset.filter(location__region=None)
            return queryset.filter(location__region__name=self.value())
        # if self.value() == 'None':
        #     return queryset.filter(location__region=None)
        #     # return queryset.filter(id__in=list(ll))

        return queryset


class HasBeenBookedFilter(admin.SimpleListFilter):
    title = "Booked"
    parameter_name = "no_of_bookings"

    def lookups(self, request, model_admin):
        return (
            ("Booked", _("Booked")),
            ("Not Booked", _("Not Booked")),
            ("Active Booking", _("Active Booking")),
            ("Booked but no active", _("Booked but no active")),
        )

    def queryset(self, request, queryset):
        from bookings.models import Booking

        new_queryset = queryset.annotate(booking_count=Count("t_bookings"))
        if self.value() == "Booked":
            return new_queryset.filter(booking_count__gt=0)
        if self.value() == "Not Booked":
            return new_queryset.filter(booking_count=0)
        if self.value() == "Active Booking":

            active_bookings = list(
                Booking.objects.active().values_list("tutor_id", flat=True)
            )
            return new_queryset.filter(id__in=active_bookings)
        if self.value() == "Booked but no active":
            active_bookings = list(
                Booking.objects.active().values_list("tutor_id", flat=True)
            )
            tutor_ids = new_queryset.filter(booking_count__gt=0).values_list(
                "id", flat=True
            )
            remaining = [x for x in tutor_ids if x not in list(active_bookings)]
            return new_queryset.filter(id__in=remaining)

        return new_queryset


class WrittenProfileFilter(admin.SimpleListFilter):
    title = "Profile Written"
    parameter_name = "paid_profile"

    def lookups(self, request, model_admin):
        return (
            ("paid", _("Paid writing fee")),
            ("not_paid", _("Not paid writing fee")),
        )

    def queryset(self, request, queryset):
        if self.value():
            from wallet.models import WalletTransaction

            values = WalletTransaction.objects.all().profile_written()
        if self.value() == "paid":
            return queryset.filter(pk__in=list(values))
        if self.value() == "not_paid":
            return queryset.exclude(pk__in=list(values))
        return queryset


# class NewMixin(AdminAdvancedFiltersMixin, DistanceMixin):
#     pass


def get_query_parameters(url):
    from urllib.parse import urlparse, parse_qs

    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    return {key: value[0] for key, value in query_params.items() if len(value) > 0}


class VerifiedTutorSkillsAdmin(ExportMixin, ActionForms, DistanceMixin):
    resource_class = TutorResource
    list_display = (
        "email",
        "full_name",
        "number",
        "is_new_tutor",
        # "rating",
        # "ratingCount",
        # "active_skills",
        "other_skills",
        # "vicinity",
        # "confirmed_date",
        "full_address",
        "classes",
        # "tutor_description",
        # "gender",
        "curriculum",
        "hijack_user",
        # # 'distance_from_request',
        # # 'base_request',
        # # 'request_subjects',
        "education",
        "workexperience",
        # "potential_subjects",
        # "levels_with_exams",
        # "image",
        # "tax_id",
        # "price_info",
    )
    search_fields = (
        "email",
        "tutorskill__skill__name",
        # "tutorskill__skill__categories__name",
        # "phonenumber__number",
    )
    # advanced_filter_fields = (
    #     # "email",
    #     ("tutorskill__skill__name", "Skill Name"),
    #     # ("tutorskill__status", "Skill Status"),
    #     # ("tutorskill__skill__categories__name", "Skill Categories"),
    # )
    list_filter = (
        # ActiveSkillFilter,
        # NotPopulatedSubjectFilter,
        # TaxIDFilter,
        # TutorRevampFilter,
        # HasBeenBookedFilter,
        # WrittenProfileFilter,
        # ("teach_online", admin.BooleanFieldListFilter),
        # CommonEntranceFilter,
        # get_verification_filter(False),
        # profile_picture_filter(False),
        IsNewTutorFilter,
        CurriculumFilter,
        StateFilter2,
        # GenderFilter2,
        # multiple_value_options_filter_factory("profile__classes"),
        # # ArrayFieldListFilter,
        # regular_expression_filter_factory("education__course"),
        # regular_expression_filter_factory("workexperience__name"),
        # regular_expression_filter_factory("workexperience__role"),
        # regular_expression_filter_factory("tutorskill__description", True),
        # regular_expression_filter_factory("profile__tutor_description"),
        # regular_expression_filter_factory("profile__description"),
        # in_filter_factory("tutorskill__skill__name", True),
    )
    full_path = None

    def full_name(self, obj):
        items = obj.admin_search_parameters([])
        return f"{items['firstName']} {items['lastName']}"

    def image(self, obj):
        profile = obj.profile
        if profile.image:
            img = profile.image.image(width=70, height=49, crop="fill", gravity="faces")
            url = profile.image.url
            return '<a href="{}">{}</a>'.format(url, img)
        return ""

    image.allow_tags = True

    def number(self, obj):
        return obj.admin_search_parameters([], "phone")
        # if obj.phone_number and not isinstance(obj.phone_number, str):
        #     return str(obj.phone_number.number)

    def rating(self, obj):
        return obj.admin_search_parameters([], "rating")

    def ratingCount(self, obj):
        return obj.admin_search_parameters([], "ratingCount")

    def potential_subjects(self, obj):
        return obj.profile.potential_subjects

    def levels_with_exams(self, obj):
        return obj.profile.levels_with_exams

    def price_info(self, obj):
        return obj.revamp_data("pricingInfo")

    # def num
    def other_skills(self, obj):
        def with_link(o):
            if o.status == TutorSkill.ACTIVE:
                return f'<a target="_blank" href="{o.get_absolute_url()}"><strong>{o.skill.name}</strong></a>'
            return f"<strong>{o.skill.name}</strong>"

        arr = "<br/>".join(
            [f"{with_link(x)} ({x.get_status_display()})" for x in obj.user_skills]
        )
        return arr
        # s = obj.ac
        # # s = obj.tutorskill_set.active()
        # return [
        #     '<a href="%s" target="_blank">%s</a>' % (v.get_absolute_url(), v.skill.name)
        #     for v in s
        # ]

    other_skills.allow_tags = True
    actions = ["export_as_csv"]

    def get_actions(self, request):
        actions = super(VerifiedTutorSkillsAdmin, self).get_actions(request)
        if request.GET.get("state"):
            if "send_mail_to_verify_id" in actions:
                del actions["send_mail_to_verify_id"]
            if "send_mail_to_reupload_profile_picture" in actions:
                del actions["send_mail_to_reupload_profile_picture"]
        return actions

    def export_as_csv(modeladmin, request, queryset):
        """A view that streams a large CSV file."""
        # Generate a sequence of rows. The range is based on the maximum number of
        # rows that can be handled by a single sheet in most spreadsheet
        # applications.
        # rows = (["Row {}".format(idx), str(idx)] for idx in range(65536))
        def get_info(idx):
            value = [
                idx.email,
                idx.first_name,
                idx.last_name,
                f"https://www.tuteria.com/api/tutors/redirect?email={idx.email}",
            ]
            try:
                value.append(str(idx.primary_phone_no))
            except Exception as e:
                pass
            return value

        rows = (get_info(idx) for idx in queryset.iterator())
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response["Content-Disposition"] = 'attachment; filename="tutors_with_skill.csv"'
        return response
        # response = HttpResponse(content_type="application/json")
        # serializers.serialize("json", queryset, stream=response)
        # return response

    # def other_skills(self, obj):
    #     return (
    #         '<a href="/we-are-allowed/tutor_management/tutorskill/?q=%s" target="_blank">Skill Profile</a>'
    #         % (obj.email,)
    #     )

    # other_skills.allow_tags = True

    def hijack_user(self, obj):
        return '<a href="/hijack/%s" target="_blank">Hijack user</a>' % obj.pk

    hijack_user.allow_tags = True

    def tutor_description(self, obj):
        return obj.profile.tutor_description

    def gender(self, obj):
        return obj.profile.gender

    def classes(self, obj):
        rr = obj.admin_search_parameters(obj.user_skills, "levelsTaught")
        return "<br>".join(rr)

    classes.allow_tags = True

    def is_new_tutor(self, obj):
        rr = obj.admin_search_parameters([], "isNewTutor")
        return rr

    is_new_tutor.boolean = True

    def curriculum(self, obj):
        rr = obj.admin_search_parameters([], "curriculum")
        return "<br>".join(rr)

    curriculum.allow_tags = True

    def addrs(self, obj):
        addr = obj.location_set.all()
        t_address = [x for x in addr if x.addr_type == 2]
        if len(t_address) > 0:
            return t_address[0]
        if len(addr) > 0:
            return addr[0]

    def full_address(self, obj: User):
        rr = obj.admin_search_parameters([])
        return f"{rr['vicinity']}, {rr['region']}<br>{rr['state']} State"

    full_address.allow_tags = True

    # def get_search_results(self, request, queryset, search_term):
    #     queryset, use_distinct = super(
    #         VerifiedTutorSkillsAdmin, self
    #     ).get_search_results(request, queryset, search_term)
    #     q = request.GET.get("q")
    #     if self.full_path:
    #         # secret source for custom search query parameter
    #         additional_params = get_query_parameters(self.full_path)
    #     # self.get_google_distance(queryset)
    #     return queryset, use_distinct

    def education(self, obj):
        rr = obj.admin_search_parameters([], "education")
        return "<br><br>".join(
            [
                f"School: {r['school']}<br>Course: {r['course']}<br>Degree: {r['degree']}"
                for r in rr
            ]
        )

    education.allow_tags = True

    def workexperience(self, obj):
        rr = obj.admin_search_parameters([], "workHistory")
        isTeacher = lambda r: "is Teacher" if r.get("isTeachingRole") else ""
        return "<br><br>".join(
            [
                f"Company: {r['company']}<br>Role: {r['role']}<br>{isTeacher(r)}"
                for r in rr
            ]
        )

    workexperience.allow_tags = True

    def get_queryset(self, request):
        if not self.full_path:
            self.full_path = request.get_full_path()
        queryset = super(VerifiedTutorSkillsAdmin, self).get_queryset(request)
        # if request.GET.get("q"):
        #     return queryset.annotate_active_skill()
        self.tutorskills = (
            TutorSkill.objects.exclude(status=TutorSkill.DENIED).select_related("skill")
            # .filter(tutor__slug__in=tutor_slugs)
            .all()
        )

        return (
            queryset.new_search()
            # .annotate_active_skill()
            # .prefetch_related(
            #     "location_set", "education_set", "workexperience_set", "phonenumber_set"
            # )
        )
        # .distinct('pk')

    # def lookup_allowed(self, lookup, value):
    #     if lookup in (
    #         "profile__gender",
    #         "profile__classes_in",
    #         "education__course_contains",
    #         "workexperience__name_contains",
    #         "workexperience__role_contains",
    #         "profile__description_contains",
    #         "profile__tutor_description_contains",
    #         "tutorskill__description_contains",
    #         "tutorskill__skill__name_contains",
    #     ):
    #         return True
    #     return super(VerifiedTutorSkillsAdmin, self).lookup_allowed(lookup, value)


# create_modeladmin(VerifiedTutorSkillsAdmin, User, name="VerifiedTutorWithSkill")


class ApprovingTutorsAdmin(VerifiedTutorSkillsAdmin):
    list_filter = (
        "approved_profile",
        HasRegionFilter,
        ("teach_online", admin.BooleanFieldListFilter),
        ActiveSkillFilter,
        StateFilter2,
    )
    date_hierarchy = "confirmed_date"
    actions = ["approve_tutor", "disapprove_tutor", "update_region_of_tutor"]

    def approve_tutor(self, request, queryset):
        ids = list(queryset.values_list("pk", flat=True))
        User.objects.filter(id__in=ids).update(approved_profile=True)
        self.message_user(request, "Tutor successfully approved")

    def disapprove_tutor(self, request, queryset):
        ids = list(queryset.values_list("pk", flat=True))
        User.objects.filter(id__in=ids).update(approved_profile=False)
        self.message_user(request, "Approval status removed for tutor")

    def update_region_of_tutor(self, request, queryset):
        region = request.POST.get("region")
        ids = list(queryset.values_list("pk", flat=True))
        if region:
            Location.objects.filter(user_id__in=ids).update(region=region)
            self.message_user(request, "Region successfully updated")

    def get_actions(self, request):
        actions = super(VerifiedTutorSkillsAdmin, self).get_actions(request)
        for action in [
            "send_emails_to_tutors_on_request",
            "send_mail_to_verify_id",
            "send_mail_to_reupload_profile_picture",
            "sms_to_tutors_to_apply",
            "sms_to_tutors_to_create_subjects",
            "set_tutor_ability_to_teach_online",
            "remove_tutor_ability_to_teach_online",
        ]:
            del actions[action]
        return actions


create_modeladmin(ApprovingTutorsAdmin, User, name="ApprovingTutor")


class ApprovalStatusFilter(admin.SimpleListFilter):
    title = _("Approval Status")
    parameter_name = "approval"

    def lookups(self, request, model_admin):
        return (
            ("approved", _("approved tutors")),
            ("not_approved", _("non approved tutors")),
            ("submitted_but_not_approved", _("Submitted but not approved")),
            ("rejected", _("rejected tutors")),
        )

    def queryset(self, request, queryset):
        if self.value() == "approved":
            return queryset.filter(data_dump__tutor_update__others__approved=True)
        if self.value() == "not_approved":
            condition1 = models.Q(
                data_dump__tutor_update__others__approved__isnull=True
            )
            return queryset.filter(condition1)
        if self.value() == "submitted_but_not_approved":
            condition1 = models.Q(
                data_dump__tutor_update__others__approved__isnull=True,
                data_dump__tutor_update__others__submission=True,
            )
            return queryset.filter(condition1)
        if self.value() == "rejected":
            return queryset.filter(data_dump__tutor_update__others__approved=False)
        return queryset


class PremiumTutorStatus(admin.SimpleListFilter):
    title = _("Premium Status")
    parameter_name = "premium"

    def lookups(self, request, model_admin):
        return (("premium", _("Premium")), ("not_premium", _("Not Premium")))

    def queryset(self, request, queryset):
        if self.value() == "premium":
            return queryset.filter(data_dump__tutor_update__others__premium=True)
        if self.value() == "not_premium":
            condition1 = models.Q(data_dump__tutor_update__others__premium__isnull=True)
            condition2 = models.Q(data_dump__tutor_update__others__premium=False)
            return queryset.filter(condition1 | condition2)
        return queryset


class SetPriceFilter(admin.SimpleListFilter):
    title = _("Price Filter")
    parameter_name = "pricingInfo"

    def lookups(self, request, model_admin):
        return (
            ("has_price", _("Has added price")),
            ("no_price", _("Has not added price")),
        )

    def queryset(self, request, queryset):
        if self.value() == "has_price":
            return queryset.filter(data_dump__tutor_update__pricingInfo__isnull=False)
        if self.value() == "no_price":
            return queryset.filter(data_dump__tutor_update__pricingInfo__isnull=True)
        return queryset


class HoursTaughtFilter(admin.SimpleListFilter):
    title = _("Hours Taught")
    parameter_name = "hours_taught"

    def lookups(self, request, model_admin):
        return (
            ("hours_taught", _("Has hours taught")),
            ("no_hours_taught", _("Has no hours taught")),
        )

    def queryset(self, request, queryset):
        hours = 1
        tutor_ids = (
            User.objects.all()
            .premium_tutor_qualification(hours=hours)
            .values_list("id", flat=True)
        )
        if self.value() == "hours_taught":
            return queryset.filter(pk__in=list(tutor_ids))
        if self.value() == "no_hours_taught":
            return queryset.exclude(pk__in=list(tutor_ids))
        return queryset


class PremiumEligibilityFilter(admin.SimpleListFilter):
    title = _("Premium Eligibility")
    parameter_name = "eligible"

    def lookups(self, request, model_admin):
        return (("eligible", _("Eligible")),)

    def queryset(self, request, queryset):
        if self.value() == "eligible":
            hours = 450
            tutor_ids = (
                User.objects.all()
                .premium_tutor_qualification(hours=hours)
                .values_list("id", flat=True)
            )
            return queryset.filter(pk__in=list(tutor_ids))
        return queryset


class UploadedIDFilter(admin.SimpleListFilter):
    title = _("Uploaded ID")
    parameter_name = "uploaded_id"

    def lookups(self, request, model_admin):
        return (
            ("id_verified", _("ID Verified")),
            ("not_verified", _("ID not verified")),
        )

    def queryset(self, request, queryset):
        if self.value() == "id_verified":
            return queryset.filter(data_dump__tutor_update__identity__isIdVerified=True)
        if self.value() == "not_verified":
            return queryset.exclude(
                data_dump__tutor_update__identity__isIdVerified=True
            )
        return queryset


class TutorRevampAdmin(VerifiedTutorSkillsAdmin):
    list_filter = (
        ActiveSkillFilter,
        ApprovalStatusFilter,
        HoursTaughtFilter,
        PremiumTutorStatus,
        SetPriceFilter,
        # UploadedIDFilter,
        get_verification_filter(False),
        PremiumEligibilityFilter,
    )
    list_display = (
        "r_email",
        "r_number",
        "active_skills",
        "other_skills",
        "r_vicinity",
        "full_address",
        "classes",
        "tutor_description",
        "pricing_info",
        "r_gender",
        "curriculum",
        "hijack_user",
        "education",
        "workexperience",
        "image",
        "identity",
        "hours_taught",
        "premium_qualified_status",
    )
    actions = [
        "approve_tutor",
        "disapprove_tutor",
        "mark_as_premium",
        "remove_premium_status",
        "mark_id_as_verified",
        "download_educations_as_csv",
        "download_as_csv",
        "repopulate_pricing",
    ]
    # list_per_page = 25

    def get_actions(self, request):
        actions = super(TutorRevampAdmin, self).get_actions(request)
        new_actions = {}
        for i, j in actions.items():
            if i in self.actions:
                new_actions[i] = j
        return new_actions

    def repopulate_pricing(self, request, queryset):
        for i in queryset.all():
            tutor_update = i.data_dump.get("tutor_update")
            tutor_update.pop("pricingInfo", None)
            i.data_dump["tutor_update"] = tutor_update
            i.save()
        self.message_user(request, "Pricing Info removed")

    def download_educations_as_csv(modeladmin, request, queryset):
        records = [
            x.revamp_data("educationWorkHistory", "educations")
            for x in queryset.all()
            if x
        ]
        flat = [x for y in records for x in y]
        rows = ([x.get("course")] for x in flat)
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response["Content-Disposition"] = 'attachment; filename="all_educations.csv"'
        return response

    def download_as_csv(modeladmin, request, queryset):
        """A view that streams a large CSV file."""
        # Generate a sequence of rows. The range is based on the maximum number of
        # rows that can be handled by a single sheet in most spreadsheet
        # applications.
        # rows = (["Row {}".format(idx), str(idx)] for idx in range(65536))
        rows = (
            [
                idx.email,
                idx.first_name,
                idx.last_name,
                f"https://www.tuteria.com/api/access/tutor-jobs?tutor_id={idx.slug}&access_code=TUTOR_ACCESS",
            ]
            for idx in queryset.all()
        )
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response[
            "Content-Disposition"
        ] = 'attachment; filename="tutors_without_skill.csv"'
        return response

    def approve_tutor(self, request, queryset):
        for i in queryset:
            tutor_update = i.data_dump.get("tutor_update")
            tutor_update["others"]["approved"] = True
            i.data_dump["tutor_update"] = tutor_update
            i.save()
            tutor_to_update_price(i.first_name, i.email, i.slug)
        self.message_user(request, "Tutor successfully approved")

    def disapprove_tutor(self, request, queryset):
        for i in queryset:
            tutor_update = i.data_dump.get("tutor_update")
            tutor_update["others"]["approved"] = False
            i.data_dump["tutor_update"] = tutor_update
            i.save()
        self.message_user(request, "Tutor successfully disapproved")

    def mark_as_premium(self, request, queryset):
        for i in queryset:
            tutor_update = i.data_dump.get("tutor_update")
            tutor_update["others"]["premium"] = True
            i.data_dump["tutor_update"] = tutor_update
            i.save()
        self.message_user(request, "Premium status successfully approved")

    def remove_premium_status(self, request, queryset):
        for i in queryset:
            tutor_update = i.data_dump.get("tutor_update")
            tutor_update["others"]["premium"] = False
            i.data_dump["tutor_update"] = tutor_update
            i.save()
        self.message_user(request, "Premium status successfully removed")

    def mark_id_as_verified(self, request, queryset):
        for i in queryset:
            tutor_update = i.data_dump.get("tutor_update")
            tutor_update["identity"]["isIdVerified"] = True
            i.data_dump["tutor_update"] = tutor_update
            i.save()
        queryset.mark_id_as_verified()
        self.message_user(request, "ID status successfully approved")

    def get_queryset(self, request):
        return (
            super(TutorRevampAdmin, self)
            .get_queryset(request)
            .filter(data_dump__tutor_update__isnull=False)
            .filter(
                data_dump__tutor_update__others__submission=True,
            )
            # .annotate(hours_taught=Sum("t_bookings__bookingsession__no_of_hours"))
        )

    def pricing_info(self, obj):
        return obj.revamp_data("pricingInfo")

    pricing_info.short_description = "subject prices"

    def hours_taught(self, obj):
        return obj.no_of_hours_taught()

    def r_email(self, obj):
        return obj.revamp_data("personalInfo", "email")

    r_email.short_description = "Email"

    def r_number(self, obj):
        return obj.revamp_data("personalInfo", "phone")

    r_number.short_description = "Number"

    def r_vicinity(self, obj):
        return obj.revamp_data("personalInfo", "region")

    r_vicinity.short_description = "Region"

    def full_address(self, obj):
        address = obj.revamp_data("personalInfo", "address")
        vicinity = obj.revamp_data("personalInfo", "vicinity")
        region = obj.revamp_data("personalInfo", "region")
        state = obj.revamp_data("personalInfo", "state")
        return f"{address} {region} {vicinity} {state}"

    def classes(self, obj):
        class_data = obj.revamp_data("teachingProfile", "classGroup")
        if type(class_data) == dict:
            return ",".join(class_data.values())
        if type(class_data) == list:
            return ",".join(class_data)

    def r_gender(self, obj):
        return obj.revamp_data("personalInfo", "gender")

    r_gender.short_description = "Gender"

    def curriculum(self, obj):
        class_data = obj.revamp_data("teachingProfile", "curriculums")
        if type(class_data) == dict:
            return ",".join(class_data.values())
        if type(class_data) == list:
            return ",".join(class_data)

    def education(self, obj):
        class_data = obj.revamp_data("educationWorkHistory", "educations")
        getter = lambda o, v: o.get(v)
        func = (
            lambda x: f"School:{x.get('school')},Course:{x.get('course')},Degree:{x.get('degree')},Country:{x.get('country')},Duration:{x.get('startYear')}-{x.get('endYear')},grade:{x.get('grade')}"
        )
        if type(class_data) == dict:
            return ",".join([func(x) for x in class_data.values()])
        if type(class_data) == list:
            return ",".join([func(x) for x in class_data])

    def workexperience(self, obj):
        class_data = obj.revamp_data("educationWorkHistory", "workHistories")
        func = (
            lambda x: f"role:{x['role']},Company:{x['company']},isTeacher:{x['isTeachingRole']}"
        )
        if type(class_data) == dict:
            return ",".join([func(x) for x in class_data.values()])
        if type(class_data) == list:
            return ",".join([func(x) for x in class_data])

    def image(self, obj):

        _image = obj.revamp_data("identity", "profilePhoto")
        if _image:
            _img2 = CloudinaryImage(public_id=_image)
            img = _img2.image(width=70, height=49, crop="fill", gravity="faces")
            url = _img2.url
            return '<a href="{}">{}</a>'.format(url, img)
        return ""

    image.allow_tags = True

    def identity(self, obj):
        _image = obj.revamp_data("identity", "uploadStore")
        _verified = obj.revamp_data("identity", "isIdVerified")
        if _image:
            files = _image.get("files")
            if files:
                _img2 = CloudinaryImage(public_id=files[0]["url"])
                img = _img2.image(width=30, height=30, crop="fill", gravity="faces")
                url = _img2.url
                return '<a target="_blank" href="{}">{}</a>'.format(url, img)

    identity.allow_tags = True

    def premium_qualified_status(self, obj):
        hours_taught = 400
        no_of_clients = 3
        repeat_client = 1
        ratings = 4.5
        # hours_condition = (obj.hours_taught or 0) > hours_taught
        # repeat_client_condition = obj.t_bookings.has_repeat_client(1)
        # client_no_count = obj.t_bookings.different_client_count() > no_of_clients
        today = datetime.now() - relativedelta(months=6)
        return {
            "hours_taught": float(obj.no_of_hours_taught() or 0),
            "repeat_client": obj.t_bookings.has_repeat_client(repeat_client),
            "client_no_count": obj.t_bookings.different_client_count(),
            "ratings": obj.my_reviews.average_score(),
            "active_booking_in_6_month": obj.t_bookings.filter(
                first_session__gte=today
            ).exists(),
        }
        # return hours_condition and repeat_client_condition and client_no_count


# create_modeladmin(TutorRevampAdmin, User, name="TutorRevamp")
class YearFilter(admin.SimpleListFilter):
    title = _("Year")
    parameter_name = "year"

    def lookups(self, request, model_admin):
        current = timezone.now()
        dataset = [x for x in range(2015, current.year + 1)]
        return ((x, _(f"{x}")) for x in reversed(dataset))

    def queryset(self, request, queryset):
        if self.value():
            return queryset.customers(self.value())
        #     return queryset.filter(tutor__profile__gender=UserProfile.MALE)
        # if self.value() == "female":
        #     return queryset.filter(tutor__profile__gender=UserProfile.FEMALE)
        return queryset


class PassThroughFilter(admin.SimpleListFilter):
    title = ""
    parameter_name = "db_from"
    template = "admin/hidden_filter.html"

    def lookups(self, request, model_admin):
        print(request.GET.get(self.parameter_name))
        return ((request.GET.get(self.parameter_name), ""),)

    def queryset(self, request, queryset):
        return queryset


class PassThroughToFilter(admin.SimpleListFilter):
    title = ""
    parameter_name = "db_to"
    template = "admin/hidden_filter.html"

    def lookups(self, request, model_admin):
        print(request.GET.get(self.parameter_name))
        return ((request.GET.get(self.parameter_name), ""),)

    def queryset(self, request, queryset):
        return queryset


class CustomerAdmin(ExportMixin, admin.ModelAdmin):
    list_display = [
        "email",
        "booking_count",
        "first_booking_date",
        "last_booking_date",
        "total_amount",
    ]
    # list_display = ["email", "booking_count", "total_earned"]
    list_filter = [
        "profile__gender",
        YearFilter,
        PassThroughFilter,
        PassThroughToFilter,
    ]
    search_fields = ["email"]
    resource_class = TutorResource
    actions = ["export_as_csv"]
    _from = None
    _to = None

    def export_as_csv(modeladmin, request, queryset):
        """A view that streams a large CSV file."""
        # Generate a sequence of rows. The range is based on the maximum number of
        # rows that can be handled by a single sheet in most spreadsheet
        # applications.
        # rows = (["Row {}".format(idx), str(idx)] for idx in range(65536))
        header = [
            [
                "Email",
                "Booking count",
                "first booking date",
                "last booking date",
                "Total amount",
            ]
        ]
        rows = (
            [
                idx.email,
                idx.od,
                idx.first_booking_date,
                idx.last_booking_date,
                idx.session_total_amount,
            ]
            for idx in queryset.all()
        )
        gens = [(x for x in header), rows]
        output = itertools.chain()
        for gen in gens:
            output = itertools.chain(output, gen)

        response = streaming_response(output, "customer_stats")
        return response

    def total_amount(self, obj):
        return obj.session_total_amount

    def first_booking_date(self, obj):
        return obj.first_booking_date

    first_booking_date.admin_order_field = "first_booking_date"

    def last_booking_date(self, obj):
        return obj.last_booking_date

    def booking_count(self, obj):
        return obj.od

    def total_earned(self, obj):
        valid = [
            x["amount"] for x in self.transactions if x["wallet__owner_id"] == obj.pk
        ]
        return '<a href="/we-are-allowed/wallet/wallettransaction/?type__exact=4&q={}" target="_blank" >{}</a>'.format(
            # obj.email, obj.total_earned)
            obj.email,
            sum(valid),
        )

    total_earned.allow_tags = True

    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super().get_search_results(
            request, queryset, search_term
        )
        self._from = request.GET.get("db_from")
        self._to = request.GET.get("db_to")
        if self._from and self._to:
            queryset = queryset.customers(_from=self._from, to=self._to)
        return queryset, use_distinct

    def get_queryset(self, request):
        from wallet.models import WalletTransactionType, WalletTransaction

        self.full_path = request.get_full_path()
        query = super(CustomerAdmin, self).get_queryset(request).customers()
        # if self._from and self._to:
        #     query = query.customers(_from=self._from, to=self._to)
        # else:
        #     import pdb; pdb.set_trace()
        return query
        # kks = [x.pk for x in query]
        # self.transactions = (
        #     WalletTransaction.objects.filter(wallet__owner_id__in=kks)
        #     .filter(type=WalletTransactionType.EARNING)
        #     .values("wallet__owner_id", "amount")
        # )
        # return query.prefetch_related("location_set", "phonenumber_set")


create_modeladmin(CustomerAdmin, User, name="Customers")


def populate_rows():
    queryset = User.objects.filter(
        profile__application_status=UserProfile.VERIFIED
    ).exclude(data_dump__tutor_update__others__submission=True)

    def get_info(idx):
        value = [
            idx.email,
            idx.first_name,
            idx.last_name,
            f"https://www.tuteria.com/api/tutors/redirect?slug={idx.slug}",
        ]
        try:
            value.append(str(idx.primary_phone_no))
        except Exception as e:
            pass
        return value

    rows = (get_info(idx) for idx in queryset.iterator())
    pseudo_buffer = Echo()
    with open("tutor_file.csv", "w+") as o:
        writer = csv.writer(o)
        for row in rows:
            writer.writerow(row)


def deleting_tutors_with_no_active_skill():
    # updated_info = User.objects.filter(data_dump__tutor_update__others__isnull=False)
    # ids = updated_info.values_list("id", flat=True)
    # return queryset.exclude(id__in=list(ids))
    queryset = User.objects.filter(
        profile__application_status=UserProfile.VERIFIED
    ).exclude(data_dump__tutor_update__others__submission=True)
    without_active_skill = queryset.annotate(booking_count=Count("t_bookings")).filter(
        booking_count=0
    )
    ids = without_active_skill.values_list("id", flat=True)
    print(len(ids))
    TutorSkill.objects.filter(tutor_id__in=list(ids)).delete()
    User.objects.filter(id__in=list(ids)).delete()
    return [queryset, without_active_skill]
