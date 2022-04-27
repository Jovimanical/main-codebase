from compat import reverse
from django.contrib import admin
from django.http import HttpRequest
from simplejson import OrderedDict
from tutor_management.models import (
    NewTutorApplicant,
    Reference,
    TutorApplicantTrack,
    TutorRevamp,
    VerifiedTutor,
    TutorSkill,
    Skill,
    QuizSitting,
    VerifiedTutorWithSkill,
)
from .forms import GuarantorForm
from django.db import models
from django.utils import timesince
from django.utils.html import escapejs
from django.contrib.admin.helpers import ActionForm
from django import forms
from config.utils import streaming_response
from django.contrib import messages
from users.models import UserProfile, Location
from registration.admin import (
    VerifiedTutorAdmin as RVerifiedTutorAdmin,
    VerifiedTutorSkillsAdmin as RVerifiedTutorSkillsAdmin,
    TutorRevampAdmin as RTutorRevampAdmin,
)
from skills.admin import (
    TutorSkillAdmin as RTutorSkillAdmin,
    QuizSittingAdmin as RQuizSittingAdmin,
    SkillAdmin as RSkillAdmin,
)

# Register your models here.

import json


class WithRemark(admin.SimpleListFilter):
    title = "With remark"
    parameter_name = "with_remark"

    def lookups(self, request, model_admin):
        return (("with_remark", "with_remark"),)

    def queryset(self, request, queryset):
        if self.value():
            new_queryset = queryset.filter(
                data_dump__tutor_update__admin_remarks__0__isnull=False
            )
            return new_queryset
        return queryset


class StateFilter(admin.SimpleListFilter):
    title = "State"
    parameter_name = "state"

    def lookups(self, request, model_admin):
        return Location.NIGERIAN_STATES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(
                data_dump__tutor_update__personalInfo__state__icontains=self.value()
            )
        return queryset


class CurrentStepFilter(admin.SimpleListFilter):
    title = "Current Step"
    parameter_name = "current_step"
    APPLY = "apply"
    VERIFY = "verify"
    SUBJECTS = "subjects"
    COMPLETE = "complete"
    PREFERENCES = "preferences"
    TERMS = "terms"
    VERIFIED_TUTOR = "application-verified"

    def lookups(self, request, model_admin):
        return (
            (self.APPLY, f"{self.APPLY} (Step 1)"),
            (self.SUBJECTS, f"{self.SUBJECTS} (Step 2)"),
            (self.VERIFY, f"{self.VERIFY} (Step 3)"),
            (self.COMPLETE, f"{self.COMPLETE} (Step 4)"),
            (self.PREFERENCES, f"{self.PREFERENCES} (Step 5)"),
            (self.TERMS, f"{self.TERMS} (Step 6)"),
            (self.VERIFIED_TUTOR, f"{self.VERIFIED_TUTOR} (Step 7)"),
        )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.by_current_step(self.value())
        return queryset


class GuarantorsApprovedFilter(admin.SimpleListFilter):
    title = "Guarantors"
    parameter_name = "guarantors"

    def lookups(self, request, model_admin):
        return (
            ("approved", "Approved"),
            ("pending", "Pending"),
            ("missing", "Missing Gurantors"),
        )

    def queryset(self, reuqest, queryset):
        if self.value() == "approved":
            return queryset.filter(data_dump__tutor_update__guarantors_verified=True)
        if self.value() == "pending":
            condition_1 = models.Q(
                data_dump__tutor_update__guarantors_verified__isnull=True
            )
            condition_2 = models.Q(
                data_dump__tutor_update__educationWorkHistory__guarantors__0__isnull=False
            )
            return queryset.filter(condition_1 & condition_2)
        if self.value() == "missing":
            condition_1 = models.Q(
                data_dump__tutor_update__educationWorkHistory__guarantors__0__isnull=True
            )
            condition_2 = mdoels.Q(
                data_dump__tutor_update__educationWorkHistory__guarantors__isnull=True
            )
            return queryset.filter(condition_1 | condition_2)
        return queryset


class VideoSummaryApprovedFilter(admin.SimpleListFilter):
    title = "Video Submission"
    parameter_name = "video"

    def lookups(self, request, model_admin):
        return (
            ("approved", "Approved"),
            ("pending", "Pending"),
            ("missing", "Missing Video"),
        )

    def queryset(self, request, queryset):
        if self.value() == "approved":
            return queryset.filter(data_dump__tutor_update__others__videoVerified=True)
        if self.value() == "pending":
            condition_1 = models.Q(data_dump__tutor_update__others__videoVerified=False)
            condition_2 = models.Q(
                data_dump__tutor_update__others__videoVerified__isnull=True
            )
            return queryset.filter(
                data_dump__tutor_update__others__videoSummary__url__startswith="http"
            ).filter(condition_2 | condition_1)

        if self.value() == "missing":
            condition_1 = models.Q(
                data_dump__tutor_update__others__videoSummary__isnull=True
            )
            condition_2 = models.Q(
                data_dump__tutor_update__others__videoSummary__url=""
            )
            return queryset.filter(condition_1 | condition_2)
        return queryset


class IdentityApprovedFilter(admin.SimpleListFilter):
    title = "Identity"
    parameter_name = "identity"

    def lookups(self, request, model_admin):
        return (
            ("approved", "Approved"),
            ("pending", "Pending"),
            ("missing", "Missing identity"),
        )

    def queryset(self, request, queryset):
        if self.value() == "approved":
            return queryset.filter(data_dump__tutor_update__identity__isIdVerified=True)
        if self.value() == "pending":
            return queryset.filter(
                data_dump__tutor_update__identity__uploadStore__files__0__isnull=False
            ).exclude(data_dump__tutor_update__identity__isIdVerified=True)
        if self.value() == "missing":
            condition_1 = models.Q(
                data_dump__tutor_update__identity__uploadStore__files__0__isnull=True
            )
            condition_2 = models.Q(
                data_dump__tutor_update__identity__uploadStore__isnull=True
            )
            return queryset.filter(condition_1 | condition_2)
        return queryset


class GenderFilter(admin.SimpleListFilter):
    title = "Gender"
    parameter_name = "gender"

    def lookups(self, request, model_admin):
        return [(x, x) for x in ["male", "female"]]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(
                data_dump__tutor_update__personalInfo__gender=self.value()
            )
        return queryset


class ApplicationStatusFilter(admin.SimpleListFilter):
    title = "Application status"
    parameter_name = "application_status"

    def lookups(self, request, model_admin):
        return [
            (x, x)
            for x in [
                "verified",
                "verified_complete",
                "verified_not_complete",
                "denied",
                "frozen",
                "not_approved",
            ]
        ]

    def queryset(self, request, queryset):
        if self.value() == "verified":
            return queryset.filter(
                profile__application_status=UserProfile.VERIFIED,
                data_dump__tutor_update__appData__currentStep="application-verified",
            )
        if self.value() == "verified_complete":
            return queryset.filter(
                profile__application_status=UserProfile.VERIFIED,
                data_dump__tutor_update__appData__currentStep="complete",
            )
        if self.value() == "verified_not_complete":
            return queryset.filter(
                profile__application_status=UserProfile.VERIFIED,
                data_dump__tutor_update__others__approved=True,
                data_dump__tutor_update__others__submission=True,
            ).exclude(
                data_dump__tutor_update__appData__currentStep="application-verified"
            )
        if self.value() == "denied":
            return queryset.filter(
                profile__application_status=UserProfile.DENIED,
                data_dump__tutor_update__appData__currentStep="complete",
            )
        if self.value() == "frozen":
            return queryset.filter(
                profile__application_status=UserProfile.FROZEN,
                data_dump__tutor_update__appData__currentStep="complete",
            )
        if self.value() == "not_approved":
            return queryset.exclude(
                profile__application_status__in=[
                    UserProfile.DENIED,
                    UserProfile.VERIFIED,
                ]
            )
        return queryset


class UpdateStepForm(ActionForm):
    application_step = forms.ChoiceField(
        choices=[("", "Select")]
        + [
            (x, x)
            for x in [
                "personal-info",
                "location-info",
                "education-history",
                "work-history",
                "schedule-info",
                "teaching-profile",
                "payment-info",
                "new-development-info",
                "agreement-info",
                "verification-info",
                "guarantors-info",
                "verify-email",
                "video-summary",
                "subject-selection",
            ]
        ],
        required=False,
    )
    current_step = forms.ChoiceField(
        choices=[("", "Select")]
        + [
            (x, x)
            for x in [
                "apply",
                "verify",
                "subjects",
                "complete",
                "preferences",
                "terms",
                "application-verified",
            ]
        ],
        required=False,
    )


@admin.register(TutorApplicantTrack)
class TutorApplicantTrackAdmin(admin.ModelAdmin):
    date_hierarchy = "profile__date_approved"
    main_fields = [
        "the_email",
        "full_name",
        "dob",
        "gender",
        "phone",
        "location_country",
        "educations",
        "work_experiences",
        "profile_pic",
        "user_identity_info",
        "video_intro",
        "skills",
        "date_applied",
        "address",
        "references",
        "tutor_remarks",
        "current_step",
        "completed_steps",
    ]
    search_fields = ["email"]
    list_display = main_fields + [
        "delivery_method",
        "payment_info",
        "availability",
        "last_logged_in",
        "hijack_user",
    ]
    list_filter = [
        CurrentStepFilter,
        GenderFilter,
        VideoSummaryApprovedFilter,
        IdentityApprovedFilter,
        ApplicationStatusFilter,
        WithRemark,
    ]
    change_list_template = "admin/tutor_management/change_list2.html"
    action_form = UpdateStepForm
    actions = [
        "update_application_step",
        "update_application_step_without_email",
        "revert_approval_status",
        "re_approve_tutors",
        "export_as_csv",
        "freeze_tutor_profile",
        "update_approved_tutors_status",
        "update_not_approved_tutors_status",
        "update_current_step_for_existing_tutors",
        "sync_to_mailing_list",
    ]

    def get_actions(self, request: HttpRequest) -> OrderedDict:
        actions = super().get_actions(request)
        query_params = request.GET.get("application_status")
        if query_params != "verified_complete":
            actions.pop("update_approved_tutors_status")
        if query_params != "not_approved":
            actions.pop("update_not_approved_tutors_status")
        if query_params != "verified_not_complete":
            actions.pop("update_current_step_for_existing_tutors")
        return actions

    class Media:
        css = {
            "screen": (
                "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
                "admin/dist/bootstrap.min.css",
                "admin/dist/admin-modal-bootstrap-mod.css",
            )
        }
        js = ("admin/dist/bootstrap.min.js",)

    def hijack_user(self, obj: TutorApplicantTrack):
        url = (
            '<a href="/hijack/%s" target="_blank">Hijack user</a>' % obj.pk
            + '<p><a href="%s" target="_blank">View tutor profile</a></p>'
            % obj.get_application_link
        )
        if obj.profile.application_status == UserProfile.VERIFIED:
            url += (
                '<p><a href="%s?redirect_url=/dashboard/" target="_blank">Main site</a></p>'
                % reverse("users:auth_existing_tutor", args=[obj.pk, obj.slug])
            )
        return url

    hijack_user.allow_tags = True

    def last_logged_in(self, obj):
        if obj.last_visit:
            return timesince.timesince(obj.last_visit)

    last_logged_in.short_description = "last logged in"

    def completed_steps(self, obj: TutorApplicantTrack):
        steps = obj.determine_completed_steps()
        return "<br/>".join([x for x, v in steps.items() if v])

    completed_steps.allow_tags = True

    def full_name(self, obj: NewTutorApplicant):
        return obj.resolve_field(["firstName", "lastName"])

    def gender(self, obj: NewTutorApplicant):
        return obj.resolve_field("gender")

    def address(self, obj):
        return obj.resolve_field(["state"])

    def phone(self, obj):
        return obj.resolve_field("phone")

    def current_step(self, obj):
        return f"<p>{obj.current_step}</p><p>{obj.application_step}</p>"

    current_step.allow_tags = True

    def dob(self, obj):
        return obj.resolve_field("dateOfBirth")

    def delivery_method(self, obj):
        return obj.availability.get("preferredLessonType")

    def educations(self, obj: NewTutorApplicant):
        return "<br/>".join(
            [
                f"<p><strong>{x.get('degree')}</strong> {x.get('course')}</p><p>{x.get('school')}</p><p>Start: {x.get('startYear')} End: {x.get('endYear')}</p>"
                for x in obj.educations
            ]
        )

    educations.allow_tags = True

    def work_experiences(self, obj: NewTutorApplicant):
        return "<br/>".join(
            [
                f"<p><strong>{x.get('role')}</strong></p><p>{x.get('company')}</p><p>Start: {x.get('startYear')}, End: {x.get('endYear')}</p><p>Teaching Role: {x.get('isTeachingRole')}</p>"
                for x in obj.work_experiences
            ]
        )

    work_experiences.allow_tags = True

    def tutor_remarks(self, obj: NewTutorApplicant):
        remark = obj.tutor_remarks()
        return "<br/>".join(
            [
                f'<p style="margin-right: 20px;">{x.get("action")}-{x.get("remark")}</p><p>{x.get("staff")}</p><p>{x.get("created")}</p>'
                for x in remark
            ]
        )

    tutor_remarks.allow_tags = True

    def references(self, obj):
        return (
            '<a href="/we-are-allowed/tutor_management/references/?q=%s" target="_blank">References</a>'
            % (obj.email,)
        )

    references.allow_tags = True

    def skills(self, obj: NewTutorApplicant):
        def with_link(o):
            if o.status == TutorSkill.ACTIVE:
                return f'<a target="_blank" href="{o.get_absolute_url()}"><strong>{o.skill.name}</strong></a>'
            if o.status == TutorSkill.PENDING:
                return f'<a target="_blank" href="/we-are-allowed/tutor_management/tutorskill/?q={obj.email}"><strong>{o.skill.name}</strong></a>'

            return f"<strong>{o.skill.name}</strong>"

        arr = "<br/>".join(
            [f"{with_link(x)} ({x.get_status_display()})" for x in obj.user_skills]
        )
        return arr

    skills.allow_tags = True

    def payment_info(self, obj):
        x = obj.payment_info
        if x:
            return f'<p>Bank: {x.get("bankName")}</p><p>Name: {x.get("accountName")}</p><p>Account Number: {x.get("accountNumber")}</p><p>Tax id: {x.get("taxId")}</p>'

    payment_info.allow_tags = True

    def date_applied(self, obj):
        return obj.date_joined

    def user_identity_info(self, obj):
        return obj.identity_pic()

    user_identity_info.allow_tags = True
    user_identity_info.short_description = "Identity"

    def video_intro(self, obj):
        video_summary = obj.others.get("videoSummary")
        if video_summary:
            url = video_summary.get("url")
            id = video_summary.get("id")
            if url and id:
                return '<a href="{}" target="_blank">Video Summary</a>'.format(url)
        return ""

    video_intro.allow_tags = True
    video_intro.short_description = "Video summary"

    def references(self, obj: NewTutorApplicant):
        res = ""
        if obj.guarantors:
            for guarantor in obj.guarantors:
                res += """
                    <div>
                    <p style="font-weight: 700;">{title} {fullName}</p>
                    <p>{occupation}, {company}</p>
                    <p>{email}, {phone}</p>
                    <hr />
                    </div>
                """.format(
                    **guarantor
                )
        return res

    references.allow_tags = True

    def update_application_step_without_email(self, request, queryset):
        current_step = request.POST.get("current_step")
        application_step = request.POST.get("application_step")
        if current_step or application_step:
            for tutor in queryset.all():
                tutor.notify_to_update_step(
                    application_step, current_step, sendMail=False
                )
                tutor.add_remark_action(
                    {"action": "update_step", "remark": "", "staff": request.user.email}
                )
            self.message_user(request, "Notified tutors to update step")
        else:
            self.message_user(
                request, "Current step or application step missing", messages.ERROR
            )

    # actions
    def update_application_step(self, request, queryset):
        current_step = request.POST.get("current_step")
        application_step = request.POST.get("application_step")
        if current_step or application_step:
            for tutor in queryset.all():
                tutor.notify_to_update_step(application_step, current_step)
                tutor.add_remark_action(
                    {"action": "update_step", "remark": "", "staff": request.user.email}
                )
            self.message_user(request, "Notified tutors to update step")
        else:
            self.message_user(
                request, "Current step or application step missing", messages.ERROR
            )

    def re_approve_tutors(self, request, queryset):
        for q in queryset:
            q.notify_to_update_step(None, "complete", sendMail=False)
        user_ids = queryset.values_list("pk", flat=True)
        UserProfile.objects.filter(user_id__in=list(user_ids)).update(
            application_status=UserProfile.VERIFIED
        )
        self.message_user(request, "Application status changed to approved")

    def revert_approval_status(self, request, queryset):
        user_ids = queryset.values_list("pk", flat=True)
        UserProfile.objects.filter(user_id__in=list(user_ids)).update(
            application_status=UserProfile.PENDING
        )
        self.message_user(request, "Application status changed to pending")

    def export_as_csv(self, request, queryset):
        """Ability to export all the details about tutor applicants"""
        rows = (
            [
                obj.resolve_field(["firstName", "lastName"]),
                obj.resolve_field("phone"),
                obj.email,
                obj.profile.get_application_status_display(),
                obj.current_step,
                obj.application_step,
                obj.determine_completed_steps(),
            ]
            for obj in queryset.prefetch_related("profile").all()
        )
        response = streaming_response(rows, "all_tutor_applicants")
        return response

    def freeze_tutor_profile(self, request, queryset):
        # this is a two step action. the first is to change the tutor
        # application status to frozen and the second is to mark all
        # active and pending subjects as suspended
        for k in queryset.all():
            TutorSkill.objects.filter(
                tutor_id=k.id, status__in=[TutorSkill.ACTIVE, TutorSkill.PENDING]
            ).update(status=TutorSkill.SUSPENDED)
            k.to_mailing_list()
        user_ids = queryset.values_list("pk", flat=True)
        UserProfile.objects.filter(user_id__in=list(user_ids)).update(
            application_status=UserProfile.FROZEN
        )
        self.message_user(request, "Frozen account successful")

    def update_approved_tutors_status(self, request, queryset):
        for q in queryset:
            q.notify_to_update_step(None, "application-verified", sendMail=False)
        self.message_user(
            request,
            "All approved tutor 'current-step' updated to 'application verified'",
        )

    def update_current_step_for_existing_tutors(self, request, queryset):
        counter = 0
        for q in queryset:
            if q.approved:
                q.update_verified_tutors_current_step()
                counter += 1
            q.to_mailing_list()
        self.message_user(request, f"{counter} verified tutors 'current-step' updated")

    def update_not_approved_tutors_status(self, request, queryset):
        counter = 0
        for q in queryset:
            result = q.update_applicant_to_complete()
            if result:
                counter += 1
            q.to_mailing_list()
        self.message_user(request, f"{counter} applicants moved to completed")

    def sync_to_mailing_list(self, request, queryset):
        for i in queryset:
            i.to_mailing_list()


@admin.register(NewTutorApplicant)
class NewTutorApplicantAdmin(TutorApplicantTrackAdmin):
    date_hierarchy = "date_joined"
    actions = [
        "approve_applicant",
        "deny_applicant",
        "approve_identity",
        "reject_identity",
        "reupload_video_intro",
    ]
    list_filter = [
        GenderFilter,
        IdentityApprovedFilter,
        VideoSummaryApprovedFilter,
        GuarantorsApprovedFilter,
        StateFilter,
    ]
    list_display = TutorApplicantTrackAdmin.main_fields
    actions = ["approve_applicant", "deny_applicant"]

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .exclude(
                profile__application_status__in=[
                    UserProfile.VERIFIED,
                    UserProfile.DENIED,
                ]
            )
            # .by_current_step(["application-verified"], True)
            .by_current_step(
                ["complete", "application-verified", "terms", "preferences"], True
            )
        )

    def user_identity_info(self, obj):
        res = ""
        if obj.user_identity_info:
            if obj.tutor_id_verified:
                return "Identity approved"
            res += """
          <button type="button" data-info="{}" data-email="{}" data-button-type="identity"
          class="btn btn-primary btn-sm clientRequestJs {}" style="font-size: 10px;">
          Verify identity</button>
        """.format(
                escapejs(
                    json.dumps(
                        {
                            "personal_info": obj.revamp_data("personalInfo"),
                            "identity": obj.revamp_data("identity"),
                            "actual_id": obj.user_identity_info,
                            "user_id": obj.pk,
                        }
                    )
                ),
                obj.email,
                f"id_{obj.pk}",
            )

        return res

    user_identity_info.allow_tags = True
    user_identity_info.short_description = "Identity"

    def video_intro(self, obj):
        res = ""
        if obj.video_verified:
            return "Video approved"
        if obj.video_intro:
            res += """
          <button type="button" data-info="{}" data-email="{}" data-button-type="video"
          class="btn btn-primary btn-sm clientRequestJs {}" style="font-size: 10px;">
          Review video</button>
        """.format(
                escapejs(
                    json.dumps(
                        {
                            "personal_info": obj.revamp_data("personalInfo"),
                            "user_id": obj.pk,
                            "others": obj.revamp_data("others"),
                        }
                    )
                ),
                obj.email,
                f"id_{obj.pk}",
            )

        return res

    video_intro.allow_tags = True
    video_intro.short_description = "Video summary"

    def references(self, obj: NewTutorApplicant):
        res = ""
        if obj.guarantors_approved():
            return "Guarantors approved"
        if obj.guarantors:
            res += """
            <button type="button" data-info="{}"
          class="btn btn-primary btn-sm referencesBtn {}" style="font-size: 10px;">
          Review guarantors</button>
            """.format(
                escapejs(json.dumps({"guarantors": obj.guarantors, "user_id": obj.pk})),
                f"id_{obj.pk}",
            )
        return res

    references.allow_tags = True

    # admin actions
    def approve_applicant(self, request, queryset):
        for tutor in queryset.all():
            tutor.approve_applicant()
            tutor.add_remark_action(
                {"action": "approve_tutor", "remark": "", "staff": request.user.email}
            )
        self.message_user(request, "Applications approved")

    def deny_applicant(self, request, queryset):
        for tutor in queryset.all():
            tutor.deny_applicant()
            tutor.add_remark_action(
                {"action": "deny_tutor", "remark": "", "staff": request.user.email}
            )
        self.message_user(request, "Applications denied")


@admin.register(Reference)
class ReferenceAdmin(admin.ModelAdmin):
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


@admin.register(VerifiedTutor)
class VerifiedTutorAdmin(RVerifiedTutorAdmin):
    pass


@admin.register(VerifiedTutorWithSkill)
class VerifiedTutorSkillsAdmin(RVerifiedTutorSkillsAdmin):
    pass


@admin.register(TutorRevamp)
class TutorRevampAdmin(RTutorRevampAdmin):
    pass


@admin.register(TutorSkill)
class TutorSkillAdmin(RTutorSkillAdmin):
    pass


@admin.register(QuizSitting)
class QuizSittingAdmin(RQuizSittingAdmin):
    pass


@admin.register(Skill)
class SkillAdmin(RSkillAdmin):
    pass
