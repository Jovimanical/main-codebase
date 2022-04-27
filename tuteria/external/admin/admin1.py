import csv
from copy import copy
import datetime
from typing import *
from decimal import Decimal
from django.conf import settings
from django.utils.functional import cached_property
from django import forms
from django.contrib.admin.views.main import ChangeList
from django.http import StreamingHttpResponse, JsonResponse
from django.utils.translation import ugettext as _
from django.utils import timezone
from django.contrib import admin, messages
from django.contrib.admin.helpers import ActionForm
from django.db.models import Q, F, Sum, BooleanField, Case, Value, When
from django.db import models
from django.http import HttpResponseRedirect
from django.urls import reverse

# from django.forms.extras.widgets import SelectDateWidget
from dal import autocomplete
from dateutil.relativedelta import relativedelta
from import_export import resources
from import_export.admin import ImportExportMixin, ImportExportModelAdmin, ExportMixin
from django.contrib.postgres.fields.jsonb import KeyTextTransform
from ..models import (
    SocialCount,
    BaseRequestTutor,
    NewBaseRequestTutor,
    DepositMoney,
    Patner,
    PriceDeterminator,
    Agent,
)
from .. import tasks
from config import utils, signals, admin_utils

# Register your models here.
from users.models import UserProfile
from skills.models import Skill
from ..forms import AgentForm
from hubspot import HubspotAPI
from hubspot.models import HubspotOwner, HubspotStorage, HubspotContact
from django.db import transaction
from .forms import PriceDeterminantForm


@admin.register(PriceDeterminator)
class PriceDeterminatorAdmin(admin.ModelAdmin):
    # list_display = [
    #     'price_base_rate', 'use_default', 'one_hour_less_price_rate',
    #     'hour_rate', 'student_no_rate', 'name', 'online_prices',
    #     'nursery_price', 'nursery_student_price', 'jss_student_price'
    # ]
    list_display = [
        "default_pricing",
        "hour_factor",
        "states",
        "plan_1",
        "plan_2",
        "plan_3",
    ]
    action_form = PriceDeterminantForm
    actions = ["update_pricing_record"]
    change_list_template = None

    def default_pricing(self, obj):
        if obj.use_default:
            return "Default Pricing"
        else:
            return "Not Default Pricing"

    def get_plan(self, plans, key):
        pls = plans or {}
        result = pls.get(key)
        return f"{result}%" if result else None

    def plan_1(self, obj):
        return self.get_plan(obj.plans, "Plan 1")

    plan_1.description = "Plan 1"

    def plan_2(self, obj):
        return self.get_plan(obj.plans, "Plan 2")

    plan_2.description = "Plan 2"

    def plan_3(self, obj):
        return self.get_plan(obj.plans, "Plan 3")

    plan_3.description = "Plan 3"

    def update_pricing_record(self, request, queryset):
        fields = [
            "state",
            "state_percentage",
            "no_of_hours",
            "hour_percentage",
            "plan",
            "plan_percentage",
        ]
        params = {key: request.POST.dict().get(key) for key in fields}
        for q in queryset:
            q.update_pricing_record(params)
        self.message_user(request, "Pricing Info updated successfully")


@admin.register(HubspotOwner)
class HubspotOwnerAdmin(admin.ModelAdmin):
    list_display = ["hubspot_id", "email", "team"]
    actions = ["refetch_owners", "change_to_customer_team"]

    def refetch_owners(self, request, queryset):
        h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))
        storage = HubspotStorage.objects.first()
        # import pdb; pdb.set_trace()
        storage.fetched_agents = False
        storage.save()
        h_instance.fetch_owners(storage)

    def change_to_customer_team(self, request, queryset):
        queryset.update(team=HubspotOwner.CUSTOMER_SUCCESS)


@admin.register(HubspotStorage)
class HubspotStorageAdmin(admin.ModelAdmin):
    pass


@admin.register(HubspotContact)
class HubspotContactAdmin(admin.ModelAdmin):
    list_display = ["email", "vid"]
    search_fields = ["email"]


class BaseRequestEmailAndNumber(resources.ModelResource):
    full_name = resources.Field()
    booking_total = resources.Field()
    no_of_bookings = resources.Field()

    class Meta:
        model = BaseRequestTutor
        fields = ("email", "number", "state", "home_address")

    def dehydrate_full_name(self, rq):
        return "{} {}".format(rq.first_name, rq.last_name)

    def dehydrate_booking_total(self, rq):
        return rq.total_booking_sum

    def dehydrate_no_of_bookings(self, rq):
        return rq.total_bookings


class BaseRequestTutorResource(resources.ModelResource):
    where_you_heard = resources.Field()
    agent = resources.Field()
    status_display = resources.Field()

    class Meta:
        model = BaseRequestTutor
        exclude = ("user", "ts", "booking", "valid_request", "related_request")

    def dehydrate_where_you_heard(self, book):
        return book.get_where_you_heard_display()

    def dehydrate_agent(self, rrr):
        if rrr.agent:
            return rrr.agent.name

    def dehydrate_status_display(self, book):
        return book.get_status_display()


class AgentFForm(ActionForm):
    agent = forms.ModelChoiceField(required=False, queryset=Agent.objects.all())


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "email",
        "phone_number",
        "is_last_agent",
        "next_agent",
        "hubspot_id",
    ]
    list_filter = ("type",)
    actions = ["set_as_last_agent", "set_next_agent"]
    action_form = AgentFForm
    form = AgentForm

    def phone_number(self, obj):
        if obj.phone_number:
            return str(obj.phone_number)
        return ""

    def set_as_last_agent(self, request, queryset):
        ids = queryset.values_list("pk", flat=True)
        queryset.update(is_last_agent=True)
        Agent.objects.exclude(id__in=ids).update(is_last_agent=False)
        self.message_user(request, "Last Agent updated")

    def set_next_agent(self, request, queryset):
        agent = request.POST.get("agent")
        if agent:
            queryset.update(next_agent=agent)
        self.message_user(request, "Next Agent Updated")


class CompletedRequestOnFirstForm(admin.SimpleListFilter):
    title = _("First Form completed")
    parameter_name = "f_form"

    def lookups(self, request, model_admin):
        return (("completed", _("Filled")), ("not_completed", _("Did not fill")))

    def queryset(self, request, queryset):
        if self.value() == "completed":
            return queryset.exclude(Q(time_to_call="") | Q(email=""))
        if self.value() == "not_completed":
            return queryset.filter(Q(time_to_call="") | Q(email=""))
        return queryset


class DepositFilter(admin.SimpleListFilter):
    title = _("Deposit Filter")
    parameter_name = "deposit"

    def lookups(self, request, model_admin):
        return ((DepositMoney.ISSUED, _("Issued")), (DepositMoney.PAYED, _("Payed")))

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(status=self.value())
        return queryset


class FForm2(ActionForm):
    amount = forms.DecimalField(
        widget=forms.TextInput(attrs=dict(size=10, placeholder="amount")),
        required=False,
    )


class DepositMoneyForm(forms.ModelForm):
    class Meta:
        model = DepositMoney
        widgets = {
            "request": autocomplete.ModelSelect2(url="baserequesttutor-autocomplete"),
            "user": autocomplete.ModelSelect2(url="users:user-autocomplete"),
        }
        fields = "__all__"


@admin.register(DepositMoney)
class DepositMoneyAdmin(admin.ModelAdmin):
    list_display = ["user", "amount", "order", "created", "status"]
    list_filter = [DepositFilter]
    actions = ["bank_payment_update", "update_status_as_payed"]
    form = DepositMoneyForm
    action_form = FForm2
    search_fields = ["user__email", "request__slug"]

    def bank_payment_update(self, request, queryset):
        amount = request.POST.get("amount")
        if amount:
            for x in queryset.all():
                x.update_wallet_and_notify_admin(Decimal(amount))
            messages.info(
                request, "{} was successfully added and email sent".format(amount)
            )

    def update_status_as_payed(self, request, queryset):
        queryset.update(status=DepositMoney.PAYED)


class WithoutUser(admin.SimpleListFilter):
    title = _("Request Parent Filters")
    parameter_name = "t_type"

    def lookups(self, request, model_admin):
        return (
            ("without_user", _("Not a user yet")),
            ("is_user", _("is a user")),
            ("paga_agent", _("Paga Agent Phone")),
        )

    def queryset(self, request, queryset):
        if self.value() == "is_user":
            return queryset.exclude(user=None)
        if self.value() == "without_user":
            return queryset.filter(user=None)
        return queryset


class NoPaymentFilter(admin.SimpleListFilter):
    title = _("No Budget")
    parameter_name = "budget"

    def lookups(self, request, model_admin):
        return (("without_budget", _("No Budget")), ("has_budget", _("Has Budget")))

    def queryset(self, request, queryset):
        if self.value() == "without_budget":
            return queryset.filter(budget=None).filter(budget=0)
        if self.value() == "has_budget":
            return queryset.exclude(budget=None).exclude(budget=0)
        return queryset


class UserProfileFilter(admin.SimpleListFilter):
    title = _("User Profile")
    parameter_name = "user_profile"

    def lookups(self, request, model_admin):
        return (
            ("user_profile", _("Has User profile")),
            ("no_user_profile", _("No User profile")),
        )

    def queryset(self, request, queryset):
        if self.value() == "user_profile":
            return queryset.exclude(user=None)
        if self.value() == "no_user_profile":
            return queryset.filter(user=None)
        return queryset


class WaecFilter(admin.SimpleListFilter):
    title = _("Waec Class Status")
    parameter_name = "class_status"

    def lookups(self, request, model_admin):
        return (("SS1", "SS1"), ("SS2", "SS2"), ("SS3", "SS3"))

    def queryset(self, request, queryset):
        filters = (
            lambda o: Q(classes__contains=[o])
            | Q(classes__contains=[o.lower()])
            | Q(classes__contains=[o.replace(" ", "")])
            | Q(classes__contains=[o.lower().replace(" ", "")])
        )
        if self.value() == "SS1":
            return queryset.filter(filters("SSS 1"))

        if self.value() == "SS2":
            return queryset.filter(filters("SSS 2"))

        if self.value() == "SS3":
            return queryset.filter(filters("SSS 3"))

        return queryset


class NewRequestProfileFilter(admin.SimpleListFilter):
    title = _("New request profile sent")
    parameter_name = "_new_r_p_s"

    def lookups(self, request: Any, model_admin: Any) -> List[Tuple[Any, str]]:
        return [
            ("sent_profiles", _("Sent profiles to client")),
            ("not_sent", _("Not sent profiles to client")),
        ]

    def queryset(self, request, queryset):
        if self.value() == "sent_profiles":
            return queryset.filter(request_info__admin__profile_sent=True)
        if self.value() == "not_sent":
            return queryset.filter(request_info__admin__isnull=True)
        return queryset


class RequestKindFilter(admin.SimpleListFilter):
    title = _("Request Kind")
    parameter_name = "request_kind_f"

    def lookups(self, request, model_admin):
        return (
            ("new_flow", _("New Flow Request")),
            ("old_flow", _("Old Flow Requests")),
        )

    def queryset(
        self, request: Any, queryset: models.QuerySet
    ) -> Optional[models.QuerySet]:
        if self.value() == "new_flow":
            return queryset.filter(request_info__client_request__isnull=False)
        if self.value() == "old_flow":
            return queryset.filter(request_info__client_request__isnull=True)
        return queryset


class StatusFilter(admin.SimpleListFilter):
    title = _("Status")
    parameter_name = "_stats"

    def lookups(self, request, model_admin):
        return (
            ("issued", _("Incomplete Requests")),
            ("completed", _("New Requests")),
            # ("spending", _("Profiles Sent to Clients")),
            ("pending", _("Profiles Sent to Clients")),
            ("request_to_meet", _("Speaking with Clients")),
            ("payed", _("Made Payment")),
            ("to_be_booked", _("Moved to Booking")),
            ("booked", _("Requests Booked")),
            ("new_booked", _("New Requests Booked")),
            ("prospective_client", _("Postponed Requests")),
            ("book_later", _("No Available Tutor")),
            ("not_reachable", _("Not Reachable")),
            ("cant_afford_price", _("Can't Afford Price")),
            ("found_manually", _("Client Undecided")),
            ("cold", _("Not Interested")),
            ("refund", _("Refunded Clients")),
            ("undecided", _("Undecided Clients")),
            ("followed_up", _("Followed up clients")),
            ("valid_requests", _("All Completed Requests")),
            ("with_booked", _("With Booked status")),
            ("all_booked", _("All booked request")),
            # ("stale_completed", _("Stale Completed")),
            # ("stale_pending", _("Stale Pending")),
        )

    def queryset(self, request, queryset):
        if self.value() == "all_booked":
            return queryset.filter(
                status__in=[
                    BaseRequestTutor.PAYED,
                    BaseRequestTutor.BOOKED,
                    BaseRequestTutor.TO_BE_BOOKED,
                ]
            )
        if self.value() == "issued":
            return queryset.filter(status=BaseRequestTutor.ISSUED)
        today = timezone.now()
        if self.value() == "pending":
            # import pdb; pdb.set_trace()
            return queryset.filter(status=BaseRequestTutor.PENDING).filter(
                # created__gte=today - relativedelta(months=2)
            )

        if self.value() == "stale_completed":
            return queryset.filter(status=BaseRequestTutor.COMPLETED).filter(
                created__lte=today - relativedelta(months=2)
            )
            # .filter(req_count=0)

        if self.value() == "stale_pending":
            return queryset.filter(status=BaseRequestTutor.PENDING).filter(
                created__lte=today - relativedelta(months=2)
            )
        if self.value() == "completed":
            return queryset.filter(status=BaseRequestTutor.COMPLETED)
        if self.value() == "payed":
            a = Q(booking__made_payment=True)
            b = Q(status=BaseRequestTutor.PAYED)
            # return queryset.filter(a | b)
            return queryset.filter(b)
        if self.value() == "request_to_meet":
            return queryset.filter(status=BaseRequestTutor.MEETING)
        if self.value() == "prospective_client":
            return queryset.filter(status=BaseRequestTutor.PROSPECTIVE_CLIENT)
        if self.value() == "found_manually":
            return queryset.filter(status=BaseRequestTutor.FOUND_MANUALLY)
        if self.value() == "book_later":
            return queryset.filter(status=BaseRequestTutor.CONTINUE_LATER)
        if self.value() == "cold":
            return queryset.filter(status=BaseRequestTutor.COLD)
        if self.value() == "valid_requests":
            return queryset.exclude(status=BaseRequestTutor.ISSUED)
        if self.value() == "to_be_booked":
            return queryset.filter(status=BaseRequestTutor.TO_BE_BOOKED)
        if self.value() == "refund":
            return queryset.filter(status=BaseRequestTutor.REFUND)
        if self.value() == "followed_up":
            return queryset.filter(status=BaseRequestTutor.FOLLOWED_UP_ON)
        if self.value() == "undecided":
            return queryset.filter(status=BaseRequestTutor.UNDECIDED)
        if self.value() == "spending":
            return queryset.filter(status=BaseRequestTutor.PENDING).exclude(
                request_type=5
            )
        if self.value() == "booked":
            return queryset.exclude(booking=None).exclude(request_type=5)
        if self.value() == "new_booked":
            return queryset.exclude(request_info__client_request__isnull=True).filter(
                status=BaseRequestTutor.BOOKED
            )
        if self.value() == "not_reachable":
            return queryset.filter(status=BaseRequestTutor.NOT_REACHABLE)
        if self.value() == "cant_afford_price":
            return queryset.filter(status=BaseRequestTutor.CANT_AFFORD)
        if self.value() == "with_booked":
            return queryset.filter(status=BaseRequestTutor.BOOKED)

        return queryset


class RequestSubjectFilter(admin.SimpleListFilter):
    title = _("By Subject")
    parameter_name = "_subj"

    def lookups(self, request, model_admin):
        params = request.GET.dict()
        # {'created__year': '2019', 'group_lesson_type': 'standard', 'vicinity': 'Okota'}
        all_classes = BaseRequestTutor.objects.filter(request_type=5)
        all_classes = (
            all_classes.annotate(
                classInfo=KeyTextTransform("classInfo", "request_info")
            )
            .annotate(r_subject=KeyTextTransform("related_subject", "classInfo"))
            .values_list("r_subject", flat=True)
            .distinct()
        )
        return [[x, x] for x in all_classes]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(
                request_info__classInfo__related_subject=self.value()
            )
        return queryset


class GroupClassSummaryFilter(admin.SimpleListFilter):
    title = _("Summary")
    parameter_name = "_summary"

    def lookups(self, request, model_admin):
        params = request.GET.dict()
        # {'created__year': '2019', 'group_lesson_type': 'standard', 'vicinity': 'Okota'}
        year = params.get("created_year")
        class_type = params.get("group_lesson_type")
        vicinity = params.get("vicinity")
        print(params)
        all_classes = BaseRequestTutor.objects.filter(request_type=5)
        if year:
            all_classes = all_classes.filter(created__year=year)
        if class_type:
            all_classes = all_classes.filter(
                request_info__request_details__lesson_plan__icontains=class_type
            )
        if vicinity:
            all_classes = all_classes.filter(vicinity=vicinity)
        all_classes = (
            all_classes.annotate(
                r_summary=KeyTextTransform("request_details", "request_info")
            )
            .annotate(schedule=KeyTextTransform("schedule", "r_summary"))
            .annotate(s_summary=KeyTextTransform("summary", "schedule"))
            .values_list("s_summary", flat=True)
            .distinct()
        )
        return [[x, x] for x in all_classes]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(
                request_info__request_details__schedule__summary=self.value()
            )
        return queryset


class GroupLessonStatusFilter(StatusFilter):
    def lookups(self, request, model_admin):
        return (
            # ("completed", _("Completed")),
            # ("prospective_client", _("Prospective Client")),
            # ("to_be_booked", _("Request to be booked")),
            ("payed", _("Made Payment")),
            ("cold", _("Cold Request")),
            ("spending", _("Pending")),
        )


REMARK_STATUS = (
    ("Follow up on profile sent", _("Follow up on profile sent")),
    ("Will make payment later", _("Will make payment later")),
    ("To negotiate a different Price", _("To negotiate a different Price")),
)


class DealStatus(admin.SimpleListFilter):
    title = _("Created Deal")
    parameter_name = "_dealstats"

    def lookups(self, request, model_admin):
        return (("has_deal", _("Had Deal")), ("no_deal", _("No Deal")))

    def queryset(self, request, queryset):
        if self.value() == "has_deal":
            return queryset.exclude(hubspot_deal_id=None)
        if self.value() == "no_deal":
            return queryset.filter(hubspot_deal_id=None)
        return queryset


class CRMStatus(admin.SimpleListFilter):
    title = _("CRM Status")
    parameter_name = "_crmstats"

    def lookups(self, request, model_admin):
        return (
            ("completed", _("Completed")),
            ("hubspot", _("Contacts in Hubspot")),
            ("not_hubspot", _("Not added to Hubspot")),
        )

    def queryset(self, request, queryset):
        if self.value() == "completed":
            return queryset.filter(status=BaseRequestTutor.COMPLETED)
        if self.value() == "hubspot":
            return queryset.exclude(hubspot_contact_id=None)
        if self.value() == "not_hubspot":
            return queryset.filter(hubspot_contact_id=None)
        return queryset


class RemarkFilter(admin.SimpleListFilter):
    title = _("Remark Status")
    parameter_name = "remark"

    def lookups(self, request, model_admin):
        return REMARK_STATUS

    def queryset(self, request, queryset):
        if self.value() == REMARK_STATUS[0][0]:
            return queryset.filter(remarks__icontains=REMARK_STATUS[0][0])
        if self.value() == REMARK_STATUS[1][0]:
            return queryset.filter(remarks__icontains=REMARK_STATUS[1][0])
        if self.value() == REMARK_STATUS[2][0]:
            return queryset.filter(remarks__icontains=REMARK_STATUS[2][0])
        return queryset


class RequestTypeFilter(admin.SimpleListFilter):
    title = _("Request Type")
    parameter_name = "_req_type"

    def lookups(self, request, model_admin):
        return (
            ("parent", _("Parent Request")),
            ("generic", _("Generic Request")),
            ("tutor", _("Tutor Request")),
            ("group", _("Group Lesson Request")),
            ("non_group", _("Non Group Lesson Request")),
        )

    def queryset(self, request, queryset):
        if self.value() == "parent":
            return queryset.filter(is_parent_request=True)
        if self.value() == "generic":
            return queryset.filter(is_parent_request=False, request_type=1)
        if self.value() == "tutor":
            return queryset.filter(request_type=2)
        if self.value() == "group":
            return queryset.filter(request_type=5)
        if self.value() == "non_group":
            return queryset.exclude(request_type=5)
        return queryset


class IsTutorFilter(admin.SimpleListFilter):
    title = _("Is a Tutor")
    parameter_name = "_is_tutor"

    def lookups(self, request, model_admin):
        return (("is_tutor", _("Is a tutor")), ("not_tutor", _("Not a tutor")))

    def queryset(self, request, queryset):
        if self.value() == "is_tutor":
            return queryset.filter(
                user__profile__application_status=UserProfile.VERIFIED
            )
        if self.value() == "not_tutor":
            return queryset.exclude(
                user__profile__application_status=UserProfile.VERIFIED
            )
        return queryset


class UrgencyFilter(admin.SimpleListFilter):
    title = _("Urgency Type")
    parameter_name = "_urgency_type"

    def lookups(self, request, model_admin):
        return (
            ("immediately", _("Immediately")),
            ("next_weeks", _("From next week")),
            ("2_weeks", _("In two weeks")),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(class_urgency=self.value())
        return queryset


class AgentFilter(admin.SimpleListFilter):
    title = _("Assigned Agent")
    parameter_name = "agent"

    def get_queryset(self):
        return Agent.objects.all()

    def lookups(self, request, model_admin):
        options = list(self.get_queryset().values_list("name", "name"))
        options.append(("none", _("None")))
        return options

    def queryset(self, request, queryset):
        if self.value():
            if self.value() == "none":
                return queryset.filter(agent_id=None)
            return queryset.filter(agent__name=self.value())
        return queryset


class RequestAgentFilter(AgentFilter):
    def get_queryset(self):
        return super().get_queryset().filter(type=Agent.CLIENT)


class BookingAgentFilter(AgentFilter):
    title = _("Booking Agent")
    parameter_name = "booking_agent"

    def get_queryset(self):
        return super().get_queryset().filter(type=Agent.CUSTOMER_SUCCESS)

    def queryset(self, request, queryset):
        if self.value():
            if self.value() == "none":
                return queryset.filter(booking_agent_id=None)
            return queryset.filter(booking_agent__name=self.value())
        return queryset


class GroupAgentFilter(AgentFilter):
    def get_queryset(self):
        return super().get_queryset().filter(type=Agent.GROUP)


class GroupDurationFilter(admin.SimpleListFilter):
    title = _("Duration Type")
    parameter_name = "group_lesson_type"

    def lookups(self, request, queryset):
        return [("standard", _("Standard")), ("weekend", _("Weekend"))]

    def queryset(self, request, queryset):
        if self.value() in ["standard", "weekend"]:
            return queryset.filter(
                request_info__request_details__lesson_plan__icontains=self.value()
            )
        return queryset


class SkillFilter(admin.SimpleListFilter):
    title = _("Skill")
    parameter_name = "skill_filter"

    def lookups(self, request, queryset):
        return [("ielts", _("IELTS"))]

    def queryset(self, request, queryset):
        if self.value():
            s_s = Skill.objects.filter(name__icontains=self.value()).values_list(
                "name", flat=True
            )
            return queryset.filter(request_subjects__overlap=list(s_s))
        return queryset


class BookingStageFilter(admin.SimpleListFilter):
    title = _("With tutor assigned")
    parameter_name = "_assign"

    def lookups(self, request, model_admin):
        return (
            ("not booked", _("Has not been booked")),
            ("assigned_tutor", _("Has been assigned tutor")),
            ("no_tutor", _("Has not been assigned tutor")),
            ("booked", _("Has been booked")),
        )

    def queryset(self, request, queryset):
        if self.value() == "not booked":
            return queryset.filter(booking=None)
        if self.value() == "booked":
            return queryset.exclude(booking=None)
        return queryset


# @admin.register(SocialCount)
# class SocialCountAdmin(admin.ModelAdmin):
#     pass

# @admin.register(BaseRequestTutor)
# class RequestTutorAdmin(admin.ModelAdmin):
#     list_display = ['user', 'construct_query']
#     search_fields = ['user__email']
#     form = RequestForm


class ParentRequestForm(forms.ModelForm):
    class Meta:
        model = BaseRequestTutor
        widgets = {
            "related_request": autocomplete.ModelSelect2(
                url="baserequesttutor-autocomplete"
            ),
            "user": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "tutor": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "ts": autocomplete.ModelSelect2(url="users:skill-autocomplete"),
            "booking": autocomplete.ModelSelect2(url="users:booking-autocomplete"),
        }
        fields = "__all__"


class FForm(ActionForm):
    # remarks = forms.CharField(
    #     widget=forms.Textarea(attrs=dict(rows=2, placeholder="remarks")),
    #     required=False)
    # lat = forms.DecimalField(
    #     widget=forms.TextInput(attrs=dict(size=7, placeholder="lat")), required=False
    # )
    # lng = forms.DecimalField(
    #     widget=forms.TextInput(attrs=dict(size=7, placeholder="lng")), required=False
    # )
    # vicinity = forms.CharField(
    #     widget=forms.TextInput(attrs=dict(size=10, placeholder="vicinity")),
    #     required=False,
    # )
    # amount = forms.DecimalField(
    #     widget=forms.TextInput(attrs=dict(size=7, placeholder="amount")), required=False
    # )
    # dop = forms.DateField(widget=SelectDateWidget, required=False)
    # text_msg = forms.CharField(
    #     widget=forms.Textarea(attrs=dict(rows=3, placeholder="text_msg")),
    #     required=False,
    # )
    agent = forms.ModelChoiceField(required=False, queryset=Agent.objects.all())
    email = forms.CharField(
        required=False, widget=forms.TextInput(attrs=dict(placeholder="email"))
    )


class RelatedRequestFields(object):
    def assign_agent(self, request, queryset):
        agent = request.POST.get("agent")
        if agent:
            ids = queryset.values_list("pk", flat=True)
            BaseRequestTutor.objects.filter(pk__in=ids).update(agent=agent)
            self.message_user(request, "Agent updated")

    def client_expectation(self, obj):
        if obj.is_batched:
            from external.new_group_flow.services import GroupRequestService

            return GroupRequestService.construct_summary(obj)
        return obj.expectation

    # def possible_tutors(self, obj):
    #     return ('<a href="{}" target="_blank" >suggested tutors </a>'
    #             ).format(reverse('find_tutors', args=[obj.slug]))

    # possible_tutors.allow_tags = True

    @cached_property
    def same_number(self):
        from django.core.cache import cache

        key = "ADMIN_BR_EMAILS"
        result = cache.get(key)
        if not result:
            result = (
                BaseRequestTutor.objects.all()
                .same_number()
                .values_list("email", flat=True)
            )
            cache.set(key, result, 60 * 60 * 3)
        return result

    def full_name(self, obj):
        check = obj.email in self.same_number
        full_name = "{} {}".format(obj.first_name, obj.last_name)
        if check:
            return ('<a href="{}" target="_blank" >{}</a>').format(
                obj.link_to_admin_for_request(), full_name
            )

        return full_name

    full_name.allow_tags = True

    def tutors_applied(self, obj: BaseRequestTutor):
        x = obj.slug
        if obj.is_split:
            x = obj.email
        res = '<br><a href="{}" target="_blank" >{} tutors </a>'.format(
            obj.link_to_tutors(), obj.req_count
        )
        if obj.req_count > 0:
            res += (
                '<button type="button" data-request-slug="{}"'
                'data-request-url="/tutors/select/{}"'
                'data-request-isParent="{}"'
                'class="btn btn-primary btn-sm clientRequestJs" data-toggle="modal" data-target="#clientRequestModal">'
                "Detail</button>"
            ).format(obj.slug, obj.slug, obj.is_parent_request)

        return res

    tutors_applied.allow_tags = True
    tutors_applied.admin_order_field = "req_count"

    def add_user_to_request(self, request, queryset):
        from external.services import SingleRequestService

        for req in queryset.all():
            aa = SingleRequestService(slug=req.slug)
            aa.create_user_instance_in_form(request, False)
        messages.info(request, "User has been added to request")

    def child_class(self, obj):
        if obj.class_of_child:
            return obj.get_class_of_child_display()
        return obj.classes

    def lat_lng(self, obj):
        if obj.latitude and obj.longitude:
            return (round(float(obj.latitude), 4), round(float(obj.longitude), 4))

    def ts_count(self, obj):
        if obj.status == BaseRequestTutor.COMPLETED:
            return obj.tutors_suggested().count()

    def mark_as_completed(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.COMPLETED, created=timezone.now())

    def mark_request_payment_on_later_date(self, request, queryset):
        dop = request.POST.get("dop_day")
        if dop:
            new_date = datetime.date(
                int(request.POST["dop_year"]),
                int(request.POST["dop_month"]),
                int(request.POST["dop_day"]),
            )
            BaseRequestTutor.objects.filter(
                id__in=queryset.values_list("pk", flat=True)
            ).update(payment_date=new_date)

    def mark_as_paid(self, request, queryset):
        agent = Agent.objects.filter(user=request.user).first()
        if agent:
            BaseRequestTutor.objects.filter(
                id__in=queryset.values_list("pk", flat=True)
            ).update(
                status=BaseRequestTutor.PAYED, modified=timezone.now(), agent=agent
            )

            # todo implement the api on the tuteria-cdn to to send this email

    def mark_as_booked(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.BOOKED)

    def mark_as_later(self, request, queryset):
        queryset.update(status=BaseRequestTutor.CONTINUE_LATER)

    def move_request_to_be_booked(self, request, queryset):
        agent = Agent.get_agent(kind=Agent.CUSTOMER_SUCCESS)
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(
            status=BaseRequestTutor.TO_BE_BOOKED,
            modified=timezone.now(),
            booking_agent=agent,
        )

    def schedule_meeting_with_client(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.MEETING)

    def update_followed_up_clients(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.FOLLOWED_UP_ON)

    update_followed_up_clients.short_description = "Update client followed up on"

    def refunded_client(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.REFUND)

    refunded_client.short_description = "Mark client as refunded"

    def move_to_not_interested(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.COLD)

    def move_to_undecided(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.UNDECIDED)

    def move_to_not_reachable(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.NOT_REACHABLE)

    def move_to_cant_afford_price(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.CANT_AFFORD)

    def mark_as_prospective_client(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.PROSPECTIVE_CLIENT)
        # queryset.update(status=BaseRequestTutor.COLD)

    def mark_request_as_valid(self, request, queryset):
        from connect_tutor import tasks as c_tasks

        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(valid_request=True)
        c_tasks.send_email_to_related_tutors.delay(
        # c_tasks.send_email_to_related_tutors(
            list(queryset.values_list("pk", flat=True))
        )

    # def update_remark(self, request, queryset):
    #     remark = request.POST.get('remarks')
    #     if remark:
    #         BaseRequestTutor.objects.filter(
    #             id__in=[x.pk for x in queryset.all()]).update(remarks=remark)

    def tag_display(self, obj):
        # return ",".join(self.tags.all)
        result = [tag.name for tag in obj.subjects.all()]
        return ",".join(result)

    def how_long(self, obj: BaseRequestTutor):
        return obj.get_days_per_week_display()

    def student(self, obj):
        return obj.no_of_students

    def create_new_booking(self, request, queryset):
        amount = request.POST.get("amount")
        for req in queryset.all():
            deposit = req.create_new_booking(amount)
            tasks.send_email_on_new_booking.delay(deposit.pk)

    def send_sms(self, request, queryset):
        for r in queryset.all():
            tasks.send_sms.delay(r.pk)

    def mark_email_as_resend(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(email_sent=False)

    def follow_up_user(self, request, queryset):
        for x in queryset.all():
            tasks.follow_up_mail_after_finding_tutors.delay(x.pk)

    def send_bank_details_to_client(self, requests, queryset):
        for x in queryset.all():
            tasks.send_phone_numbers_to_clients.delay(x.id)

    def update_email_address(self, request, queryset):
        email = request.POST.get("email")
        if email:
            q = BaseRequestTutor.objects.filter(
                pk__in=list(queryset.values_list("pk", flat=True))
            )
            q.update_email_address(email)
        messages.info(request, "Email Updated")


class Customer(ChangeList):
    pass


def export_owed_as_json(modeladmin, request, queryset):
    summation = queryset.aggregate(t_amount=Sum(F("budget")))["t_amount"] or 0
    response = JsonResponse(dict(sum=summation))
    return response


export_owed_as_json.short_description = "Total Amount Paid"


def make_group_lesson_admin_readable(modeladmin, request, queryset):
    from external.new_group_flow.services import GroupRequestService

    for q in queryset.all():
        GroupRequestService.update_request_to_admin_friendly(q)


make_group_lesson_admin_readable.short_description = (
    "Make group requests readable in admin."
)


@admin.register(BaseRequestTutor)
# class ParentRequestAdmin(RelatedRequestFields, admin.ModelAdmin):
# class ParentRequestAdmin(RelatedRequestFields, ImportExportModelAdmin,
# admin.ModelAdmin):
class ParentRequestAdmin(RelatedRequestFields, ImportExportMixin, admin.ModelAdmin):
    resource_class = BaseRequestTutorResource
    date_hierarchy = "modified"
    list_display = [
        "the_number",
        "new_request_id",
        "created",
        "is_online",
        "full_name",
        "g",
        "agent",
        "remarks",
        "home_address",
        "the_vicinity",
        "the_state",
        "refund_button",
        "email",
        "budgets",
        "plan",
        # "region",
        "per_hour",
        "tutor_selected",
        "request_subjects",
        "how_long",
        "child_class",
        "student",
        "slug",
        "the_curriculum",
        "client_expectation",
        "gender",
        "available_days",
        "time_of_lesson",
        "hours_per_day",
        "tutoring_location",
        "request_start_date",
        "where_you_heard",
        "lat_lng",
        "tutors_applied",
        "responses",
        "db",
        "discount_duration",
    ]
    search_fields = ["email", "slug", "number"]
    actions = [
        "mark_as_pending",
        "send_main_request_to_client",
        # "update_remark",
        # "update_lat_lng_or_vicinity",
        # 'create_new_booking',
        # "send_email_to_tutors_on_group_lesson_payment",
        # "send_sms",
        "update_request_schedule",
        "processing_fee_payment",
        "schedule_meeting_with_client",
        "no_tutor_found_yet",
        "move_to_not_interested",
        "move_to_undecided",
        "move_to_not_reachable",
        "move_to_cant_afford_price",
        "refunded_client",
        "update_followed_up_clients",
        "mark_as_completed",
        "mark_as_prospective_client",
        "move_request_to_be_booked",
        "assign_agent",
        # "penalize_tutor_for_cancelling_before_commencement",
        # 'mark_email_as_resend',
        "mark_as_paid",
        "mark_as_booked",
        "add_user_to_request",
        "update_email_address",
        # 'follow_up_user',
        "mark_request_as_valid",
        # 'mark_request_payment_on_later_date',
        # "send_bank_details_to_client",
        # 'send_notification_text_message',
        # "processing_fee_reminder",
        # "add_to_hubspot",
        # "update_ids_from_hubspot",
        # "create_deals",
        # "update_hubspot_contact",
        # "update_hubspot_deal",
        # "save_hubspot_contacts",
        # "send_issued_email",
        make_group_lesson_admin_readable,
        # 'school_new_year_email',
        export_owed_as_json,
    ]

    form = ParentRequestForm
    action_form = FForm
    list_filter = [
        StatusFilter,
        "follow_up_stages",
        RequestKindFilter,
        NewRequestProfileFilter,
        # CRMStatus,
        # DealStatus,
        RequestAgentFilter,
        BookingAgentFilter,
        SkillFilter,
        # UserProfileFilter,
        # WaecFilter,
        # "paid_fee",
        # "valid_request",
        # "email_sent",
        # "drip_counter",
        "is_split",
        RequestTypeFilter,
        # IsTutorFilter,
        # BookingStageFilter,
        # UrgencyFilter,
        NoPaymentFilter,
        "state",
    ]
    change_list_template = "admin/external/change_list2.html"

    class Media:
        css = {
            "screen": (
                "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
                "admin/dist/bootstrap.min.css",
                "admin/dist/admin-modal-bootstrap-mod.css",
            )
        }
        js = ("admin/dist/bootstrap.min.js",)

    def refund_button(self, obj):
        if obj.is_new_home_request:
            if obj.paid_fee:
                return True
        return admin_utils.generate_refund_button(obj.pk, obj.paid_fee)

    refund_button.allow_tags = True
    refund_button.short_description = "paid fee"
    # refund_button.boolean = True

    def the_vicinity(self, obj):
        return f"{obj.vicinity} {obj.region}"

    the_vicinity.short_description = "vicinity_region"

    def the_curriculum(self, obj):
        return obj.request_curriculum()

    def new_request_id(self, obj: BaseRequestTutor):
        if obj.is_parent_request:
            text = (
                self.request_id(obj)
                + "<br/>"
                + '<a target="_blank" href="%s">Admin Search </a>'
                % (obj.admin_search_link,)
            )
            return text
        if obj.is_new_home_request:
            if obj.status == obj.TO_BE_BOOKED:
                return self.request_id(obj)
            text = f'<a target="_blank" href="/we-are-allowed/external/requestswithsplit/?q={obj.slug}">Main Request</a>'
            if obj.split_requests_count < 2:
                text = f"Main Request"
            slug = obj.slug
            if obj.is_split and obj.related_request:
                slug = obj.related_request.slug
                text = f"Split Request: {obj.related_request.id}"
            url = ""
            if obj.status in [obj.COMPLETED, obj.PAYED, obj.BOOKED, obj.CONTINUE_LATER]:
                url = f"{settings.DJANGO_ADMIN_URL}/api/access/agent-search?agent_id={obj.agent_id}&access_code=AGENT_ACCESS&slug={slug}"
            elif obj.status in [obj.PENDING, obj.MEETING, obj.PAYED, obj.BOOKED]:
                url = f"{settings.DJANGO_ADMIN_URL}/api/access/agent-checkout?agent_id={obj.agent_id}&access_code=AGENT_ACCESS&slug={slug}"
            url_holder = ""
            wallet_transaction = ""
            if obj.status in [obj.PAYED, obj.BOOKED]:
                wallet_transaction = f'<a href="/we-are-allowed/wallet/wallettransaction/?q={obj.slug}" target="_blank">Transaction</a>'
            if url:
                url_holder = f'<a target="_blank" href="{url}">{obj.id}</a><br/><br/>'
            rrr = f'<div>{url_holder}<p style="padding-left:0;padding-right:0;">{text}</p>{wallet_transaction}</div>'
            return rrr
        return self.request_id(obj)

    new_request_id.allow_tags = True
    new_request_id.short_description = "request_id"

    def budgets(self, obj):
        planSelected = obj.payment_info.get("planSelected")
        if planSelected:
            return f"<p>{obj.budget}</p></p>Plan:{planSelected}</p>"
        if obj.request_info:
            if isinstance(obj.request_info, dict) and obj.request_info.get(
                "request_details"
            ):
                return '<a href="https://agent-admin.tuteria.com/s/hometutoring/lesson-schedule/{}" target="_blank" >{}</a>'.format(
                    obj.slug, obj.budget
                )
        return obj.budget

    budgets.allow_tags = True

    def update_request_schedule(self, request, queryset):
        from external.new_group_flow.services import HomeTutoringRequestService

        for x in queryset.all():
            HomeTutoringRequestService.update_days_selected(x)

    def send_email_to_tutors_on_group_lesson_payment(self, request, queryset):
        for x in queryset.all():
            x.group_lesson_paid()

    def send_issued_email(self, request, queryset):
        for a in queryset:
            tasks.send_issued_email_to_client.delay(a.pk)
        messages.info(request, "Issued emails have been sent")

    def get_actions(self, request):
        actions = super(ParentRequestAdmin, self).get_actions(request)
        # if request.user.email not in ["gbozee@example.com"]:
        #     del actions["save_hubspot_contacts"]
        return actions

    def get_changelist(self, request):
        if request.GET.get("_stats") != "payed":
            self.date_hierarchy = "created"
        else:
            self.date_hierarchy = "modified"
        return super().get_changelist(request)

    def discount_duration(self, obj):
        request_info = obj.request_info
        if request_info and isinstance(request_info, dict):
            rq = request_info.get("request_details")
            if rq:
                return rq.get("discount_info")
        return None

    # def get_date_heirachy(self):
    #     pass

    def save_hubspot_contacts(self, request, queryset):
        h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))
        HubspotContact.bulk_update_record(queryset, field="hubspot_contact_id")
        self.message_user(request, "Contacts successfully added")

    def is_online(self, obj):
        return "Online" if obj.request_type == 3 else ""

    def request_id(self, obj):
        tutor_email = "-"
        if obj.tutor:
            tutor_email = obj.tutor.email
        booking_btn = ""
        if obj.status == BaseRequestTutor.TO_BE_BOOKED:
            booking_btn = (
                '<br /><button type="button"  data-request-slug="{}"'
                'data-request-url="/tutors/select/{}"'
                'class="btn btn-primary btn-sm bookingJs" data-toggle="modal" data-target="#bookingModal"'
                'style="padding:1px;font-size:12px">'
                "Create booking</button>"
            ).format(obj.slug, obj.slug)

        if obj.status > BaseRequestTutor.COMPLETED:
            return (
                '<a href="/tutors/select/{}" target="_blank" >{}</a>'.format(
                    obj.slug, obj.id
                )
                + booking_btn
            )
        return str(obj.id) + booking_btn

    request_id.allow_tags = True

    def the_state(self, obj):
        if obj.state:
            return obj.state
        return obj.country

    def the_number(self, obj):
        if obj.number and not "None" in str(obj.number):
            return obj.number
        elif obj.request_info and isinstance(obj.request_info, dict):
            personal_info = obj.request_info.get("personal_info")
            if personal_info:
                return personal_info.get("phone_number", obj.email)
        return obj.email

    def tutor_selected(self, obj):
        if obj.is_batched:
            from external.new_group_flow.services import GroupRequestService

            return GroupRequestService.get_tutor_info(obj)
        if obj.is_new_home_request:
            agent = ""
            if obj.agent:
                agent = obj.agent.pk
            if obj.tutor:
                return f'<div><a href="{settings.DJANGO_ADMIN_URL}/api/access/tutor-jobs?tutor_id={obj.tutor.slug}&access_code=TUTOR_ACCESS&agent={agent}" target="_blank">{obj.tutor.email}</a><br/><p style="margin-left:0;margin-right:0;"><a href="/we-are-allowed/connect_tutor/tutorjobresponse/?q={obj.tutor.email}" target="_blanck">{obj.tutor.first_name}</a> {str(obj.tutor.primary_phone_no.number)}</p></div>'
        return obj.tutor

    tutor_selected.allow_tags = True

    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super(ParentRequestAdmin, self).get_search_results(
            request, queryset, search_term
        )
        # try:
        #     split_search_term = search_term.split(',')
        # except ValueError:
        #     pass
        # else:
        #     queryset |= self.model.objects.filter(age=search_term_as_int)
        year = request.GET.get("modified__year")
        month = request.GET.get("modified__month")
        status = request.GET.get("_stats")
        if year and month and (status == "payed"):
            queryset = queryset.filter(
                booking__created__year=year, booking__created__month=month
            )

        split_search_term = search_term.split(",")
        if "skill" in split_search_term:
            s_s = Skill.objects.filter(
                name__icontains=split_search_term[0]
            ).values_list("name", flat=True)
            # queryset = queryset.filter(request_subjects__overlap=list(s_s))
            queryset |= self.model.objects.filter(request_subjects__overlap=list(s_s))
        return queryset, use_distinct

    def g(self, obj):
        if obj.latitude and obj.longitude:
            return True
        return False

    g.boolean = True
    g.admin_order_field = "latitude"

    def processing_fee_reminder(self, request, queryset):
        for a in queryset.all():
            tasks.send_second_processing_fee_notification_notice.delay(a.pk)

    def school_new_year_email(self, request, queryset):
        ids = queryset.values_list("pk", flat=True)
        for i in ids:
            tasks.generic_email_send.delay(i)

    def add_to_hubspot(self, request, queryset):
        h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))

        # h_instance.initialize_hubspot()

        def callback_func(xx):
            with transaction.atomic():
                for o in xx:
                    BaseRequestTutor.objects.filter(email=o["email"]).update(
                        hubspot_contact_id=o["vid"]
                    )

        h_instance.create_bulk_contacts(queryset.all(), bulk_callback=callback_func)

    def update_ids_from_hubspot(self, request, queryset):
        h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))
        emails = queryset.values_list("email", flat=True)
        results = h_instance.get_bulk_contact_ids(list(emails))
        # import pdb; pdb.set_trace()
        with transaction.atomic():
            for o in results:
                BaseRequestTutor.objects.filter(email__iexact=o["email"]).update(
                    hubspot_contact_id=o["vid"]
                )

    def update_hubspot_deal(self, request, queryset):
        h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))
        for x in queryset.all():
            result = h_instance.update_deal(x, field="hubspot_deal_id")

    def update_hubspot_contact(self, request, queryset):
        h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))
        for x in queryset.all():
            result = h_instance.update_contact(x, field="hubspot_contact_id")

    def create_deals(self, request, queryset):
        h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))
        import time

        counter = 0
        for x in queryset.all():
            x.agent = x.get_agent
            if counter % 10 == 0:
                time.sleep(0.1)
            result = h_instance.create_deal(x, "hubspot_contact_id")
            counter += 1
            if result:
                x.hubspot_deal_id = result
                x.save()

    def send_notification_text_message(self, request, queryset):
        ids = queryset.values_list("pk", flat=True)
        text = request.POST.get("text_msg")
        if text:
            tasks.send_text_message.delay(list(ids), text)

    def db(self, obj):
        if obj.booking:
            return obj.booking.created

    def responses(self, obj):
        if obj.t > 0:
            return True
        return False

    responses.boolean = True

    def save_model(self, request, obj, form, change):
        # Tell Django to save objects to the 'other' database.
        obj.save(using="default")

    def delete_model(self, request, obj):
        # Tell Django to delete objects from the 'other' database
        obj.delete(using="default")

    def get_queryset(self, request):
        qs = super(ParentRequestAdmin, self).get_queryset(request)
        query = (
            qs.do_not_belong_to_admin().display_in_admin().filter(related_request=None)
        )
        if "_stats" in request.GET.keys() and "modified__month" in request.GET.keys():
            if request.GET.get("_stats") == "payed":
                from bookings.models import Booking

                ids = (
                    Booking.objects.filter(
                        created__year=request.GET["modified__year"],
                        created__month=request.GET["modified__month"],
                    )
                    .values("user__email")
                    .annotate(cc=models.Count("user__email"))
                    .filter(cc=1)
                    .values_list("user__email", flat=True)
                )
                # bookings_in_month = Bookings
                return query.filter(email__in=list(ids))
        return query

    def update_lat_lng_or_vicinity(self, request, queryset):
        lat = request.POST.get("lat")
        lng = request.POST.get("lng")
        vicinity = request.POST.get("vicinity")
        pks = [x.id for x in queryset.all()]
        if lat and lng:
            BaseRequestTutor.objects.filter(id__in=pks).update(
                latitude=lat, longitude=lng
            )
        if vicinity:
            BaseRequestTutor.objects.filter(id__in=pks).update(vicinity=vicinity)

    def mark_as_pending(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.PENDING)

    def send_main_request_to_client(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.PENDING)
        first = queryset.filter(related_request=None).first()
        if first:
            tasks.send_profile_to_client.delay(first.pk)

    def no_tutor_found_yet(self, request, queryset):
        BaseRequestTutor.objects.filter(
            id__in=queryset.values_list("pk", flat=True)
        ).update(status=BaseRequestTutor.CONTINUE_LATER)

    def processing_fee_payment(self, request, queryset):
        for x in queryset.all():
            if x.is_new_home_request:
                if not x.paid_fee:
                    if not x.is_split:
                        x.paid_speaking_fee()
                        self.message_user(request, "Speaking fee payment processed.")
                    else:
                        self.message_user(
                            request,
                            "You selected a split request instead of main",
                            level=40,
                        )
            else:
                x.pay_processing_fee()

    def penalize_tutor_for_cancelling_before_commencement(self, request, queryset):
        queryset1 = queryset.exclude(tutor__isnull=True)
        for baserequest in queryset1:
            baserequest.penalize_tutor_for_cancelling_b4_commencement()

        messages.info(
            request,
            "{0} Tutors penalized for requesting to cancel booking before commencement of classes and client refunded".format(
                queryset1.count()
            ),
        )


class GroupLessonAdmin(ParentRequestAdmin):
    list_display = [
        "the_number",
        "request_id",
        "created",
        "full_name",
        "agent",
        "remarks",
        "vicinity",
        "email",
        "budget",
        "tutor_selected",
        "request_subjects",
        "student",
        "slug",
        "summary",
        "start_date",
        "class_duration",
        "where_you_heard",
    ]
    list_filter = [
        RequestSubjectFilter,
        "vicinity",
        GroupDurationFilter,
        GroupLessonStatusFilter,
        GroupAgentFilter,
        "paid_fee",
        GroupClassSummaryFilter,
        # "email_sent",
        # "drip_counter",
        # RequestTypeFilter,
        # 'state'
        # IsTutorFilter,
        # BookingStageFilter,
        # UrgencyFilter,
        # NoPaymentFilter,
    ]
    actions = [
        "update_remark",
        # 'create_new_booking',
        "send_email_to_tutors_on_group_lesson_payment",
        "move_to_not_interested",
        "assign_agent",
        # 'mark_email_as_resend',
        "mark_as_paid",
        "update_email_address",
        # 'follow_up_user',
        "mark_request_as_valid",
        # 'mark_request_payment_on_later_date',
        # 'school_new_year_email',
        make_group_lesson_admin_readable,
        export_owed_as_json,
    ]

    # def get_action(self, )

    def tutor_selected(self, obj):
        if obj.is_batched:
            from external.new_group_flow.services import GroupRequestService

            return GroupRequestService.get_tutor_info(obj)
        return obj.tutor

    tutor_selected.short_description = "Tutor"

    def class_duration(self, obj):
        if isinstance(obj.request_info, dict):
            info = obj.request_info.get("request_details")
            if info:
                return info["schedule"]["duration"]

    class_duration.admin_order_field = (
        "request_info__request_details__schedule__duration"
    )

    def start_date(self, obj):
        if obj.is_batched:
            from external.new_group_flow.services import GroupRequestService

            return GroupRequestService.get_start_date(obj)
        if isinstance(obj.request_info, dict):
            info = obj.request_info.get("request_details")
            if info:
                return info["schedule"]["date_summary"]

    start_date.admin_order_field = (
        "request_info__request_details__schedule__date_summary"
    )

    def summary(self, obj):
        if obj.is_batched:
            from external.new_group_flow.services import GroupRequestService

            return GroupRequestService.construct_summary(obj)
        if isinstance(obj.request_info, dict):
            info = obj.request_info.get("request_details")
            if info:
                return info.get("schedule")["summary"]

    summary.admin_order_field = "request_info__request_details__schedule__summary"

    def get_queryset(self, request):
        qs = super(ParentRequestAdmin, self).get_queryset(request)
        return qs.filter(request_type=5)


utils.create_modeladmin(GroupLessonAdmin, BaseRequestTutor, name="GroupLesson")


@admin.register(NewBaseRequestTutor)
class NewBaseRequestAdmin(ParentRequestAdmin):
    list_filter = [RemarkFilter]

    def get_queryset(self, request):
        qs = (
            super(NewBaseRequestAdmin, self)
            .get_queryset(request)
            .filter(status=BaseRequestTutor.COMPLETED)
        )
        return qs.filter(booking=None)


class FForm2(ActionForm):
    remarks = forms.ChoiceField(
        choices=REMARK_STATUS, widget=forms.RadioSelect, required=False
    )


class PendingRequestAdmin(ParentRequestAdmin):
    search_fields = ["slug", "related_request__slug", "email"]

    def get_queryset(self, request):
        qs = super(ParentRequestAdmin, self).get_queryset(request)
        query = qs.do_not_belong_to_admin().display_in_admin()
        if "_stats" in request.GET.keys() and "modified__month" in request.GET.keys():
            if request.GET.get("_stats") == "payed":
                from bookings.models import Booking

                ids = (
                    Booking.objects.filter(
                        created__year=request.GET["modified__year"],
                        created__month=request.GET["modified__month"],
                    )
                    .values("user__email")
                    .annotate(cc=models.Count("user__email"))
                    .filter(cc=1)
                    .values_list("user__email", flat=True)
                )
                # bookings_in_month = Bookings
                return query.filter(email__in=list(ids))
        return query


utils.create_modeladmin(PendingRequestAdmin, BaseRequestTutor, name="RequestsWithSplit")


class PayedRequestAdmin(RelatedRequestFields, admin.ModelAdmin):
    form = ParentRequestForm
    list_display = [
        "number",
        "created",
        "first_name",
        "last_name",
        "home_address",
        "vicinity",
        "email",
        "budget",
        "per_hour",
        "time_of_lesson",
        "request_subjects",
        "how_long",
        "child_class",
        "student",
        "slug",
        "curriculum",
        "client_expectation",
        "gender",
        "available_days",
        "time_of_lesson",
        "hours_per_day",
        "tutoring_location",
        "class_urgency",
        "tutors_applied",
    ]
    search_fields = ["email", "slug"]
    action_form = FForm
    actions = ["update_remark", "create_new_booking"]
    list_filter = [UrgencyFilter]

    def get_queryset(self, request):
        return (
            super(PayedRequestAdmin, self)
            .get_queryset(request)
            .filter(status=BaseRequestTutor.PAYED)
            .annotate(req_count=models.Count("request"))
        )


# utils.create_modeladmin(PayedRequestAdmin, BaseRequestTutor, name='PayedRequest')


class SuccessfulRequestAnalysisAdmin(PayedRequestAdmin):
    list_display = [
        "email",
        "the_tutor",
        "subject_name",
        "request_subjects",
        "expectation",
        "subject_description",
        "tutor_description",
    ]
    search_fields = ["booking__ts__skill__name", "request_subjects"]

    def subject_name(self, obj):
        if obj.booking:
            return obj.booking.ts.skill.name
        s = self.tss(obj)
        if s:
            return s.skill.name

    def the_tutor(self, obj):
        if obj.booking:
            return obj.booking.ts.tutor.email
        if obj.tutor:
            return obj.tutor.email

    def tss(self, obj):
        if obj.tutor:
            return obj.tutor.tutorskill_set.filter(
                skill__name__icontains=obj.request_subjects[0]
            ).first()

    def subject_description(self, obj):
        if obj.booking:
            return obj.booking.ts.description
        s = self.tss(obj)
        if s:
            return s.description

    def tutor_description(self, obj):
        if obj.booking:
            return obj.booking.tutor.profile.description
        if obj.tutor:
            return obj.tutor.profile.description

    def get_queryset(self, request):
        return (
            super(SuccessfulRequestAnalysisAdmin, self)
            .get_queryset(request)
            .filter(status=BaseRequestTutor.PAYED)
            .annotate(req_count=models.Count("request"))
            .select_related("tutor__profile", "booking__ts")
        )


utils.create_modeladmin(
    SuccessfulRequestAnalysisAdmin, BaseRequestTutor, name="SuccessfulRequestAnalysis"
)


class MonthlyBookingFilter(admin.SimpleListFilter):
    title = _("Booked From")
    parameter_name = "f_form"

    def lookups(self, request, model_admin):
        return (
            ("last_month", _("Last Month")),
            ("two_month", _("2 Months")),
            ("three_month", _("3 Months")),
            ("four_month", _("4 months")),
        )

    def queryset(self, request, queryset):
        today = timezone.now()
        from bookings.models import Booking

        all_bookings = Booking.objects.all()
        if self.value() == "last_month":
            all_bookings = all_bookings.filter(
                created__month=today.month - 1, created__year=today.year
            )
        if self.value() == "two_month":
            all_bookings = all_bookings.filter(
                created__month=today.month - 2, created__year=today.year
            )
        if self.value() == "three_month":
            all_bookings = all_bookings.filter(
                created__month=today.month - 3, created__year=today.year
            )
        if self.value() == "four_month":
            all_bookings = all_bookings.filter(
                created__month=today.month - 4, created__year=today.year
            )
        if self.value():
            user_ids = all_bookings.values_list("user_id", flat=True)
            return queryset.filter(user_id__in=user_ids)
        return queryset


class HasPreviousBookingFilter(admin.SimpleListFilter):
    title = _("Has Previous Booking")
    parameter_name = "previous_booking"

    def lookups(self, request, model_admin):
        return (("has_previous", _("Old client")), ("no_previous", _("New Client")))

    def queryset(self, request, queryset):
        if self.value() == "has_previous":
            return queryset.filter(has_previous=1)
        if self.value() == "no_previous":
            return queryset.filter(has_previous=0)
        return queryset


class Customers(ExportMixin, admin.ModelAdmin):
    list_display = [
        "full_name",
        "email",
        "number",
        "total_bookings",
        "total_booking_value",
        "distinct_bookings",
    ]
    search_fields = ["email", "first_name", "last_name", "request_subjects"]
    list_filter = ["is_parent_request", HasPreviousBookingFilter, "state"]
    form = ParentRequestForm
    actions = ["re_engage_users"]
    resource_class = BaseRequestEmailAndNumber
    date_hierarchy = "booking__created"

    def number(self, obj):
        if obj.number:
            return str(obj.number)
        return ""

    def re_engage_users(self, request, queryset):
        x = queryset.values_list("id", flat=True)
        for o in x:
            tasks.emails_to_former_customers.delay(o)

    def total_bookings(self, obj):
        data = obj.total_bookings
        return '<a href="/we-are-allowed/bookings/booking?q={}" target="_blank" >{}</a>'.format(
            obj.email, data
        )

    total_bookings.allow_tags = True

    def total_booking_value(self, obj):
        return obj.total_booking_sum

    def distinct_bookings(self, obj):
        if obj.user:
            bookings = obj.user.orders.all()
            subject_names = {x.ts_id for x in bookings}
            return len(subject_names)

    def get_queryset(self, request):
        from bookings.models import Booking

        filter_year = request.GET.get("booking__created__year")
        filter_month = request.GET.get("booking__created__month")
        query = (
            super(Customers, self)
            .get_queryset(request)
            .with_bookings()
            .booking_values()
        )
        # if filter_year and filter_month and ft:
        records = list(Booking.objects.has_old_booking(filter_year, filter_month))
        return query.has_previous_booking(records)
        return query


utils.create_modeladmin(Customers, BaseRequestTutor, name="Customers")


class Echo(object):
    """An object that implements just the write method of the file-like
    interface.
    """

    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


class CustomersWhoPlacedRequestsAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ["full_name", "email", "number"]
    search_fields = ["email", "first_name", "last_name", "number"]
    list_filter = ["is_parent_request", "state"]
    form = ParentRequestForm
    actions = ["email_blast", "export_as_csv"]
    resource_class = BaseRequestEmailAndNumber

    def number(self, obj):
        if obj.number:
            return str(obj.number)
        return ""

    def export_as_csv(modeladmin, request, queryset):
        """A view that streams a large CSV file."""
        # Generate a sequence of rows. The range is based on the maximum number of
        # rows that can be handled by a single sheet in most spreadsheet
        # applications.
        # rows = (["Row {}".format(idx), str(idx)] for idx in range(65536))
        rows = (
            [idx.email, f"{idx.first_name} {idx.last_name}", str(idx.number)]
            for idx in queryset.all()
        )
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response["Content-Disposition"] = 'attachment; filename="customer.csv"'
        return response
        # response = HttpResponse(content_type="application/json")
        # serializers.serialize("json", queryset, stream=response)
        # return response

    def email_blast(self, request, queryset):
        x = queryset.values_list("id", flat=True)
        for o in x:
            tasks.email_blast_to_all_clients.delay(o)

    def get_queryset(self, request):
        return (
            super(CustomersWhoPlacedRequestsAdmin, self)
            .get_queryset(request)
            .order_by("email")
            .distinct("email")
        )


utils.create_modeladmin(
    CustomersWhoPlacedRequestsAdmin, BaseRequestTutor, name="CustomersWhoPlacedRequests"
)


class RequestUserForm(ActionForm):
    request_id = forms.IntegerField()


@admin.register(Patner)
class PatnershipAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "company_name", "state", "body"]
    list_filter = ["state"]


from skills.models import TutorSkill


class ClientExpectationAndTutorMatchAdmin(admin.ModelAdmin):
    list_display = [
        "email",
        "expectation",
        "request_subjects",
        "classes",
        "subjects",
        "tutor_description",
        "other_subjects",
    ]

    def get_ts(self, obj):
        booking = obj.booking
        if booking:
            ts = booking.ts
            return ts
        return None

    def tutor_description(self, obj):
        ts = self.get_ts(obj)
        if ts:
            return ts.get_description_of_skill

    def subjects(self, obj):
        ts = self.get_ts(obj)
        if ts:
            return ts.skill.name

    def other_subjects(self, obj):
        booking = obj.booking
        if booking:
            tutor = booking.get_tutor
            subject_names = tutor.tutorskill_set.exclude(
                status=TutorSkill.DENIED
            ).values_list("skill__name", flat=True)
            return subject_names
        return []

    def get_queryset(self, request):
        return (
            super(ClientExpectationAndTutorMatchAdmin, self)
            .get_queryset(request)
            .exclude(booking=None)
            .select_related("booking__ts__skill")
            .filter(is_parent_request=True)
        )


utils.create_modeladmin(
    ClientExpectationAndTutorMatchAdmin, BaseRequestTutor, "MatchMadeFromRequest"
)
