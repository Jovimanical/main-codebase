from typing import *
from external.models.models1 import RequestFollowUp
from django.utils.translation import ugettext as _
from django.db import models
from .admin1 import ParentRequestAdmin, admin
from dateutil.parser import parse


class StatusFilter(admin.SimpleListFilter):
    title = _("Status")
    parameter_name = "_stats"

    def lookups(self, request: Any, model_admin: Any) -> List[Tuple[Any, str]]:
        return (
            ("issued", _("Incomplete Requests")),
            ("book_later", _("No Available Tutor")),
            ("not_reachable", _("Not Reachable")),
            ("cant_afford_price", _("Can't Afford Price")),
        )

    def queryset(
        self, request: Any, queryset: models.QuerySet
    ) -> Optional[models.QuerySet]:
        if self.value() == "issued":
            return queryset.filter(status=RequestFollowUp.ISSUED)
        if self.value() == "book_later":
            return queryset.filter(status=RequestFollowUp.CONTINUE_LATER)
        if self.value() == "not_reachable":
            return queryset.filter(status=RequestFollowUp.NOT_REACHABLE)
        if self.value() == "cant_afford_price":
            return queryset.filter(status=RequestFollowUp.CANT_AFFORD)
        return queryset


class LeadStatusFilter(admin.SimpleListFilter):
    title = _("Lead Status")
    parameter_name = "lead_status"

    def lookups(self, request: Any, model_admin: Any) -> List[Tuple[Any, str]]:
        return (
            ("won", _("Won Leads")),
            ("lost", _("Lost Leads")),
            ("none", _("Pending Leads")),
        )

    def queryset(
        self, request: Any, queryset: models.QuerySet
    ) -> Optional[models.QuerySet]:
        if self.value() == "won":
            return queryset.filter(request_info__lead_status="won")
        if self.value() == "lost":
            return queryset.filter(request_info__lead_status="lost")
        if self.value() == "none":
            return queryset.filter(
                models.Q(request_info__lead_status__isnull=True)
                | models.Q(request_info__lead_status="")
            )
        return queryset


@admin.register(RequestFollowUp)
class RequestFollowUpAdmin(admin.ModelAdmin):
    list_display = [
        "slug",
        "contact_details",
        "created",
        "kind",
        "location",
        "budget",
        "previous_remark",
        "summary",
        "previous_tutor",
        "request_details",
        "followup_remarks_display",
        "status",
    ]

    list_filter = [StatusFilter, "follow_up_stages", LeadStatusFilter]
    change_list_template = "admin/external/change_list3.html"
