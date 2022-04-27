from django.contrib import admin
from external.models import BaseRequestTutor, Agent
from django.utils.translation import ugettext as _
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from .forms import REMARK_STATUS


class StatusFilter(admin.SimpleListFilter):
    title = _("Status")
    parameter_name = "_stats"

    def lookups(self, request, model_admin):
        return [
            ("issued", _("Issued")),
            ("completed", _("Completed")),
            ("pending", _("Completed but not assigned")),
            ("prospective_client", _("Prospective Client")),
            ("to_be_booked", _("Request to be booked")),
            ("payed", _("Made Payment")),
            ("request_to_meet", _("Meeting with Client")),
            ("book_later", _("No tutor found")),
            ("stale_completed", _("Stale Completed")),
            ("stale_pending", _("Stale Pending")),
            ("cold", _("Cold Request")),
            ("valid_requests", _("Valid Requests")),
            ("spending", _("Pending")),
        ]

    def queryset(self, request, queryset):
        options = {
            "issued": BaseRequestTutor.ISSUED,
            "request_to_meet": BaseRequestTutor.MEETING,
            "found_manually": BaseRequestTutor.FOUND_MANUALLY,
            "prospective_client": BaseRequestTutor.PROSPECTIVE_CLIENT,
            "book_later": BaseRequestTutor.CONTINUE_LATER,
            "cold": BaseRequestTutor.COLD,
            "valid_requests": BaseRequestTutor.ISSUED,
            "to_be_booked": BaseRequestTutor.TO_BE_BOOKED,
            "spending": BaseRequestTutor.PENDING,
        }
        time_options = {
            "pending": BaseRequestTutor.PENDING,
            "completed": BaseRequestTutor.COMPLETED,
        }
        stale_options = {
            "stale_completed": BaseRequestTutor.COMPLETED,
            "stale_pending": BaseRequestTutor.PENDING,
        }
        today = timezone.now()
        if self.value() in time_options.keys():
            return queryset.filter(status=time_options[self.value()]).filter(
                created__year__gte=today.year - 1, created__month__gte=today.month - 1
            )
        if self.value() in options.keys():
            return queryset.filter(status=options[self.value()])
        if self.value() in stale_options.keys():
            return queryset.filter(status=stale_options[self.value()]).filter(
                created__lte=today - relativedelta(months=2)
            )
        if self.value() == "payed":
            return queryset.paid_filter()
        return queryset


class CRMStatus(admin.SimpleListFilter):
    title = _("CRM Status")
    parameter_name = "_crmstats"

    def lookups(self, request, model_admin):
        return [
            ("completed", _("Completed")),
            ("hubspot", _("Contacts in Hubspot")),
            ("not_hubspot", _("Not added to Hubspot")),
        ]

    def queryset(self, request, queryset):
        if self.value() == "completed":
            return queryset.filter(status=BaseRequestTutor.COMPLETED)
        if self.value() == "hubspot":
            return queryset.exclude(hubspot_contact_id=None)
        if self.value() == "not_hubspot":
            return queryset.filter(hubspot_contact_id=None)
        return queryset


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


class AgentFilter(admin.SimpleListFilter):
    title = _("Assigned Agent")
    parameter_name = "agent"

    def lookups(self, request, model_admin):
        options = list(Agent.objects.values_list("name", "name"))
        options.append(("none", _("None")))
        return options

    def queryset(self, request, queryset):
        if self.value():
            if self.value() == "none":
                return queryset.filter(agent_id=None)
            return queryset.filter(agent__name=self.value())
        return queryset


class UserProfileFilter(admin.SimpleListFilter):
    title = _("User Profile")
    parameter_name = "user_profile"

    def lookups(self, request, model_admin):
        return (
            ("user_profile", _("Has Tuteria account")),
            ("no_user_profile", _("No Tuteria account")),
        )

    def queryset(self, request, queryset):
        if self.value() == "user_profile":
            return queryset.exclude(user=None)
        if self.value() == "no_user_profile":
            return queryset.filter(user=None)
        return queryset


class RequestTypeFilter(admin.SimpleListFilter):
    title = _("Request Type")
    parameter_name = "_req_type"

    def lookups(self, request, model_admin):
        return [
            ("parent", _("Parent Request")),
            ("generic", _("Generic Request")),
            ("tutor", _("Tutor Request")),
            ("prime", _("Prime Request")),
        ]

    def queryset(self, request, queryset):
        if self.value() == "parent":
            return queryset.filter(is_parent_request=True)
        if self.value() == "generic":
            return queryset.filter(is_parent_request=False, request_type=1)
        if self.value() == "tutor":
            return queryset.filter(request_type=2)
        if self.value() == "prime":
            return queryset.filter(request_type=4)
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


class UrgencyFilter(admin.SimpleListFilter):
    title = _("Urgency Type")
    parameter_name = "_urgency_type"

    def lookups(self, request, model_admin):
        return [
            ("immediately", _("Immediately")),
            ("next_weeks", _("From next week")),
            ("2_weeks", _("In two weeks")),
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(class_urgency=self.value())
        return queryset
