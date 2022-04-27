from dal import autocomplete
from django import forms
from django.db.models.query import QuerySet
from django.http.request import HttpRequest
from import_export import resources
from config import utils
from courses.models import CourseUser
from django.contrib import admin
from import_export.admin import ImportExportMixin, ImportExportModelAdmin, ExportMixin
from django.utils.translation import ugettext as _


class CourseForm(forms.ModelForm):
    class Meta:
        model = CourseUser
        widgets = {
            "user": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "referrer": autocomplete.ModelSelect2(url="courses:course-autocomplete"),
        }
        fields = "__all__"


class CourseResource(resources.ModelResource):
    pass


class StatusFilter(admin.SimpleListFilter):
    title = _("Status")
    parameter_name = "_status"

    def lookups(self, request, model_admin):
        return (("paid", _("PAID")), ("unpaid", _("UNPAID")))

    def queryset(self, request, queryset):
        if self.value() == "paid":
            return queryset.filter(status=CourseUser.PAID)
        if self.value() == "unpaid":
            return queryset.filter(status=CourseUser.UNPAID)
        return queryset


# Register your models here.
@admin.register(CourseUser)
class VideoCourseAdmin(ImportExportMixin, admin.ModelAdmin):
    resource_class = CourseResource
    date_hierarchy = "created"
    search_fields = ["email", "slug", "number"]
    form = CourseForm
    list_display = [
        "slug",
        "created",
        "exam",
        "plan",
        # "upsells",
        "the_email",
        "full_name",
        "number",
        "status",
        "students",
        "amount",
        "amount_paid",
        "discount",
        "payment_date",
        "additional_users",
        "payer_email",
        "referrer_email",
        "payment_medium",
        "referral_credit",
    ]
    list_filter = [
        StatusFilter,
    ]

    def the_email(self, obj):
        if obj.students > 1:
            return f'<a href="/we-are-allowed/courses/videocourseuser?q={obj.slug}" target="_blank" >{obj.email}</a>'
        return obj.email
    the_email.allow_tags = True

    def number(self, obj):
        if obj.phone:
            return obj.phone
        return ""

    def get_queryset(self, request: HttpRequest) -> QuerySet:
        queryset = super().get_queryset(request)
        return queryset.filter(with_others=False)


class AdditionalUserCourseAdmin(VideoCourseAdmin):
    search_fields = ["slug", "referrer__slug"]

    def get_queryset(self, request: HttpRequest) -> QuerySet:
        return super(VideoCourseAdmin, self).get_queryset(request)


utils.create_modeladmin(AdditionalUserCourseAdmin, CourseUser, name="VideoCourseUser")
