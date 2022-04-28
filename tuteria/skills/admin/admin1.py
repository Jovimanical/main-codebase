# -*- coding: utf-8 -*-
import csv
from dal import autocomplete
from django import forms
from django.contrib import admin
from django.contrib.admin.helpers import ActionForm
from django.contrib.admin.utils import lookup_needs_distinct
from django.db import models
from django.http import StreamingHttpResponse
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
import cloudinary
from django.db.models import F, Count, When, Case, Sum, Value, IntegerField
from django.contrib import messages
from django.urls import reverse
from skills.forms import FForm

# Register your models here.
# from zinnia.models import Entry
from registration.forms import TutorStatusForm
import operator
from ..models import (
    TutorSkill,
    SkillWithState,
    Skill,
    Category,
    PendingTutorSkill,
    SubjectExhibition,
    SkillCertificate,
    QuizSitting,
    SubCategory,
)
from users.models import UserProfile, states, Location
from external.forms import all_states
from external.models import Agent
from registration.admin import Echo
from ..forms import SubjectExhibitionForm
from ..tasks import (
    send_email_to_retake_and_delete,
    upload_exhibition_or_certificate,
    email_to_take_quiz,
    email_to_modify_skill,
    email_to_populate_skill_content,
    email_on_decision_taken_on_subject,
)
from config.utils import create_modeladmin
from users.mixins import LocationMixin
from import_export import resources
from import_export.admin import ImportExportMixin, ImportExportModelAdmin, ExportMixin


class TutorSkillResource(resources.ModelResource):
    phone_number = resources.Field()
    email = resources.Field()

    class Meta:
        model = TutorSkill
        fields = []

    def dehydrate_phone_number(self, book):
        return book.tutor.primary_phone_no.number

    def dehydrate_email(self, book):
        return book.tutor.email


class UserPreferenceAdminInline(admin.TabularInline):
    model = UserProfile
    form = TutorStatusForm


class TutorSkillForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["heading"].required = False
        self.fields["description"].required = False

    class Meta:
        model = TutorSkill
        fields = "__all__"
        exclude = ("agent",)
        widgets = {"tutor": autocomplete.ModelSelect2(url="users:user-autocomplete")}


def create_action(category):
    def action(modeladmin, request, queryset):
        for s in queryset:
            if category not in s.categories.all():
                s.categories.add(category)

    name = "%s_skills" % (category.name.lower(),)
    return name, (action, name, "Add Skills to %s Category" % (category.name,))


class QuizFilter(admin.SimpleListFilter):
    title = _("Result in Test")
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return (("not_completed", _("Not Completed")), ("failed", _("Failed")))

    def queryset(self, request, queryset):
        if self.value() == "not_completed":
            return queryset.filter(completed=False)
        if self.value() == "failed":
            return queryset.filter(
                score__lt=F("tutor_skill__skill__quiz__pass_mark"), completed=True
            )
        else:
            return queryset


class LocationFilter(admin.SimpleListFilter):
    title = _("Latitude & Longitude Filter")
    parameter_name = "state_filter"
    latitude = None
    longitude = None

    def lookups(self, request, model_admin):
        self.latitude = request.GET.get("lat")
        self.longitude = request.GET.get("lon")
        return (("latitude", _("By Latitude and Longitude")), ("state", _("By State")))

    def expected_parameters(self):
        return [self.parameter_name, "lat", "lon"]

    def queryset(self, request, queryset):
        if self.value() == "latitude":
            location = request.GET.get("loca")
            if self.latitude and self.longitude:
                return queryset.by_distance(
                    latitude=self.latitude, longitude=self.longitude
                )
        if self.value() == "state":
            return queryset.by_state(state=request.GET.get("state"))
        return queryset


class Location2Filter(admin.SimpleListFilter):
    title = _("By State")
    parameter_name = "state"

    def lookups(self, request, model_admin):
        return Location.NIGERIAN_STATES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(tutor__location__state=self.value())
        return queryset


class SkillDisplayFilter(admin.SimpleListFilter):
    title = _("Marked as Displayable")
    parameter_name = "displayer"

    def lookups(self, request, model_admin):
        return (
            ("marked", _("Marked for display")),
            ("not_marked", _("Not marked for display")),
        )

    def queryset(self, request, queryset):
        if self.value() == "marked":
            return queryset.filter(marked_for_display=True)
        if self.value() == "not_marked":
            return queryset.exclude(marked_for_display=True)
        return queryset


class AddressFilter(admin.SimpleListFilter):
    title = _("Tutoring Address Location")
    parameter_name = "t_address"

    def lookups(self, request, model_admin):
        return (
            ("user_address", _("User Address")),
            ("tutor_address", _("Tutor Address")),
            ("neutral_address", _("Neutral Address")),
        )

    def queryset(self, request, queryset):
        if self.value() == "user_address":
            return queryset.filter(
                tutor__profile__tutoring_address=UserProfile.USER_RESIDENCE
            )
        if self.value() == "tutor_address":
            return queryset.filter(
                tutor__profile__tutoring_address=UserProfile.TUTOR_RESIDENCE
            )
        if self.value() == "neutral_address":
            return queryset.filter(tutor__profile__tutoring_address=UserProfile.NEUTRAL)
        return queryset


class StatusFilter(admin.SimpleListFilter):
    title = _("By Status")
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return (
            ("active", _("Active Skills")),
            ("pending", _("Pending Skills")),
            ("denied", _("Denied Skills")),
            ("modified", _("Requires Modification Skills")),
            ("suspended", _("Suspended Skills")),
            ("freeze", _("Freeze Skills")),
        )

    def queryset(self, request, queryset):
        dicto = dict(
            freeze=TutorSkill.FREEZE,
            active=TutorSkill.ACTIVE,
            pending=TutorSkill.PENDING,
            suspended=TutorSkill.SUSPENDED,
            denied=TutorSkill.DENIED,
            modified=TutorSkill.MODIFICATION,
        )
        if self.value():
            if self.value() == "freeze":
                return queryset.filter(
                    status__in=[TutorSkill.FREEZE, TutorSkill.DENIED]
                )
            return queryset.filter(status=dicto[self.value()])
        else:
            return queryset


class NoHeadingFilter(admin.SimpleListFilter):
    title = _("By Heading Content")
    parameter_name = "heading"

    def lookups(self, request, model_admin):
        return (("has_heading", _("Has Heading")), ("no_heading", _("No Heading")))

    def queryset(self, request, queryset):
        if self.value() == "has_heading":
            return queryset.exclude(heading=None)
        if self.value() == "no_heading":
            return queryset.filter(heading=None)
        return queryset


class VerifiedFilter(admin.SimpleListFilter):
    title = _("By Verificaton Status and Picture")
    parameter_name = "verified"

    def lookups(self, request, model_admin):
        return (("true", _("Verified Ids")), ("false", _("Non Verified Ids")))

    def queryset(self, request, queryset):
        if self.value() == "true":
            return queryset.filter(tutor__identifications__verified=True)
        if self.value() == "false":
            return queryset.filter(tutor__identifications__verified=False)
        return queryset


class ProfilePicFilter(admin.SimpleListFilter):
    title = _("Profile Pic")
    parameter_name = "profile_pic"

    def lookups(self, request, model_admin):
        return (
            ("has_picture", _("Has profile pic")),
            ("no_picture", _("No profile pic")),
        )

    def queryset(self, request, queryset):
        if self.value() == "has_picture":
            return queryset.exclude(tutor__profile__image=None)
        if self.value() == "no_picture":
            return queryset.filter(tutor__profile__image=None)
        return queryset


class ActiveSkillFilter(admin.SimpleListFilter):
    title = _("Active Skills")
    parameter_name = "active_skill"

    def lookups(self, request, model_admin):
        return (("ac_skill", _("Order active skills")),)

    def queryset(self, request, queryset):
        if self.value() == "ac_skill":
            return queryset.with_tutor().order_by("-active_skills")
        return queryset


class BackgroundFilter(admin.SimpleListFilter):
    title = _("Background Image")
    parameter_name = "bg"

    def lookups(self, request, model_admin):
        return (("has_bg", _("Has background")), ("no_bg", _("No background")))

    def queryset(self, request, queryset):
        if self.value() == "has_bg":
            return queryset.exclude(background_image="")
        if self.value() == "no_bg":
            return queryset.filter(background_image="")
        return queryset


class CategoryFilter(admin.SimpleListFilter):
    title = _("Category")
    parameter_name = "category"

    def lookups(self, request, model_admin):
        return Category.objects.values_list("slug", "name")

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(categories__slug=self.value())
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


class SuperTutorFilter(admin.SimpleListFilter):
    title = _("is Starred")
    parameter_name = "starred"

    def lookups(self, request, model_admin):
        return (("starred", _("Is starred")), ("not_starred", _("Is not starred")))

    def queryset(self, request, queryset):
        if self.value() == "starred":
            return queryset.filter(tutor__profile__request_pool=True)
        if self.value() == "not_starred":
            return queryset.filter(tutor__profile__request_pool=False)
        return queryset


class ByStateFilterForm(ActionForm):
    state = forms.ChoiceField(required=False, choices=all_states, initial="")
    status = forms.ChoiceField(
        required=False, choices=[(2, "Active"), (1, "Pending")], initial=2
    )
    market_category = forms.ChoiceField(
        required=False, choices=Skill.CHOICES, initial=Skill.SCHOOL
    )
    sub_categories = forms.ModelChoiceField(
        required=False, queryset=SubCategory.objects.all()
    )


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)


class SkillForm(forms.ModelForm):
    class Meta:
        model = Skill
        fields = "__all__"
        widgets = {
            "testifier": autocomplete.ModelSelect2(url="users:user-autocomplete")
        }


# @admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    search_fields = ("categories__name", "name")
    list_display = (
        "name",
        "testable",
        "featured",
        "quiz_url",
        "market_category",
        "active_skills",
    )
    form = SkillForm
    action_form = ByStateFilterForm
    actions = [
        "add_to_subcategory",
        "fetch_tags_for_skills",
        "set_as_featured",
        "remove_featured",
        "generate_csv",
        "update_market_category",
    ]
    list_filter = [
        ActiveSkillFilter,
        BackgroundFilter,
        "market_category",
        "categories__name",
        "subcategories__name",
    ]

    def get_queryset(self, request):
        from bookings.models import Booking
        qs = super(SkillAdmin, self).get_queryset(request)
        return qs.annotate(
            active_skills=Sum(
                Case(
                    When(tutorskill__status=TutorSkill.ACTIVE, then=1),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            )
        )

    def active_skills(self, obj):
        return obj.active_skills
        # return obj.tutorskill_set.active().count()

    def add_to_subcategory(self, request, queryset):
        x = request.POST.get("sub_categories", None)
        if x:
            for y in queryset.all():
                y.subcategories.add(x)
                y.save()
            # queryset.update(subcategories=x)
        messages.info(request, "Subcategory updated")

    def update_market_category(self, request, queryset):
        market_category = request.POST.get("market_category", None)
        if market_category:
            queryset.update(market_category=int(market_category))
        messages.info(request, "Market Category Updated")

    def generate_csv(self, request, queryset):
        state = request.POST.get("state", None)
        status = request.POST.get("status", None)
        selected = "pending" if status == 1 else "active"
        if state and status:
            rows = [
                [x.items()[1][1], x.items()[0][1] or 0]
                for x in queryset.by_state(state, status).values(
                    "name", "active_skills"
                )
            ]
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
        ] = 'attachment; filename="{}_{}_tutors.csv"'.format(state, selected)
        return response

    def get_actions(self, request):
        actions = super(SkillAdmin, self).get_actions(request)
        u = actions.copy()
        v = dict(create_action(q) for q in Category.objects.all())
        u.update(v)
        return u

    def fetch_tags_for_skills(self, request, queryset):
        for s in queryset.all():
            v = (
                s.get_all_tags()
                .values_list("tags__name", flat=True)
                .distinct("tags__name")
            )
            for t in v:
                # s.tags.clear()
                s.tags.add(t)
            s.save()

    def set_as_featured(self, request, queryset):
        q = [s.pk for s in queryset.all()]
        Skill.objects.filter(id__in=q).update(featured=True)

    def remove_featured(self, request, queryset):
        q = [s.pk for s in queryset.all()]
        Skill.objects.filter(id__in=q).update(featured=False)


class SkillInlineAdmin(admin.TabularInline):
    model = Skill


class SkillCertificateForm(forms.ModelForm):
    class Meta:
        model = SkillCertificate
        fields = "__all__"
        widgets = {"ts": autocomplete.ModelSelect2(url="users:skill-autocomplete")}


@admin.register(SkillCertificate)
class SkillCertificateAdmin(admin.ModelAdmin):
    search_fields = ["ts__tutor__email"]
    form = SkillCertificateForm


class QuizSittingForm(forms.ModelForm):
    class Meta:
        model = QuizSitting
        fields = "__all__"
        widgets = {
            "tutor_skill": autocomplete.ModelSelect2(url="users:skill-autocomplete")
        }


# @admin.register(QuizSitting)
class QuizSittingAdmin(admin.ModelAdmin):
    list_display = ["tutor_skill", "score", "completed", "created", "modified"]
    search_fields = ("tutor_skill__tutor__email", "tutor_skill__skill__name")
    list_filter = (QuizFilter,)
    actions = ["mark_quiz_sittings_as_retake"]
    form = QuizSittingForm

    def mark_quiz_sittings_as_retake(self, request, queryset):
        queryset.retake_quiz()
        # ts_ids = [x.tutor_skill_id for x in queryset.all()]
        # send_email_to_retake_and_delete.delay(ts_ids)


@admin.register(SubjectExhibition)
class SubjectExhibitionAdmin(admin.ModelAdmin):
    search_fields = ["ts__tutor__email"]
    list_display = ["ts", "image"]
    form = SubjectExhibitionForm


class SkillCertificateInlineAdmin(admin.TabularInline):
    model = SkillCertificate


class SubjectExhibitionInlineAdmin(admin.TabularInline):
    model = SubjectExhibition


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "featured"]
    actions = ["mark_as_featured", "mark_as_not_featured"]

    def mark_as_featured(self, request, queryset):
        queryset.update(featured=True)

    def mark_as_not_featured(self, request, queryset):
        queryset.update(featured=False)


def create_modeladmin(modeladmin, model, name=None):
    class Meta:
        proxy = True
        app_label = model._meta.app_label

    attrs = {"__module__": "", "Meta": Meta}

    newmodel = type(name, (model,), attrs)

    admin.site.register(newmodel, modeladmin)
    return modeladmin


class TakenTestFilter(admin.SimpleListFilter):
    title = _("Has not Taken Test")
    parameter_name = "not_taken_test"

    def lookups(self, request, model_admin):
        return (
            ("not_taken_test", _("Has not Taken Test")),
            ("taken_test", _("Has Taken Test")),
        )

    def queryset(self, request, queryset):
        new_queryset = queryset.exclude(skill__quiz=None).annotate(
            took_quiz=Count("sitting")
        )
        if self.value() == "not_taken_test":
            return new_queryset.filter(took_quiz=0)
        if self.value() == "taken_test":
            return new_queryset.exclude(took_quiz=0)
        return queryset


class GenderFilter(admin.SimpleListFilter):
    title = _("Gender")
    parameter_name = "gender"

    def lookups(self, request, model_admin):
        return (
            ("male_tutors", _("Male Tutors")),
            ("female_tutors", _("Female Tutors")),
        )

    def queryset(self, request, queryset):
        if self.value() == "male_tutors":
            return queryset.filter(tutor__profile__gender=UserProfile.MALE)
        if self.value() == "female_tutors":
            return queryset.filter(tutor__profile__gender=UserProfile.FEMALE)
        return queryset


class CurriculumFilter(admin.SimpleListFilter):
    title = _("By Curriculum")
    parameter_name = "curriculum"

    def lookups(self, request, model_admin):
        return UserProfile.CURRICULUM

    def queryset(self, request, queryset):
        if self.value():
            pks = [x.tutor_id for x in queryset.all()]
            profiles = UserProfile.objects.filter(
                tutor__in=pks, tutor__profile__curriculum_used__contains=[self.value()]
            ).values_list("user_id", flat=True)
            return queryset.filter(id__in=profiles)
        return queryset


class BookingFilter(admin.SimpleListFilter):
    title = _("Booking Status")
    parameter_name = "booking"

    def lookups(self, request, model_admin):
        return (("booked", _("Booked")), ("not_booked", _("Not booked")))

    def queryset(self, request, queryset):
        if self.value():
            queryset = queryset.annotate(ts_count=models.Count("bookings"))
        if self.value() == "booked":
            return queryset.filter(ts_count__gt=0)
        if self.value() == "not_booked":
            return queryset.filter(ts_count=0)
        return queryset


# @admin.register(TutorSkill)
class TutorSkillAdmin(ExportMixin, admin.ModelAdmin):
    list_display = [
        "tutor",
        "agent",
        "skill_url",
        "status",
        "heading",
        "state",
        "description",
        "wc",
        "price",
        "quiz_score",
        "passed",
        "tag_display",
        "number",
        "awards",
        "state",
        "date_approved",
        "exhibition_list",
        "remark",
        "admin_img",
    ]
    search_fields = ("skill__name", "tutor__email", "heading", "tutor__location__state")
    list_filter = (
        StatusFilter,
        VerifiedFilter,
        NoHeadingFilter,
        ProfilePicFilter,
        SkillDisplayFilter,
        GenderFilter,
        BookingFilter,
        TakenTestFilter,
        Location2Filter,
    )
    actions = [
        "approve_skill",
        "deny_skill",
        "require_modiication",
        "mark_skill_image_as_rejected",
        "mark_exhibition_pictures_as_denied",
        "mark_certificates_as_denied",
        "mark_user_image_as_rejected",
        "fix_all_slugs",
        "mark_skill_for_display",
        "remove_skill_for_display",
        "upload_exhibition",
        "upload_certificate",
        "take_quiz",
        "freeze_subject",
        "send_24hour_modification_notice",
        "send_reminder_to_populate_content",
    ]
    # list_select_related = ('tutor', 'skill')
    date_hierarchy = "modified"
    action_form = FForm
    form = TutorSkillForm
    inlines = [SkillCertificateInlineAdmin, SubjectExhibitionInlineAdmin]
    resource_class = TutorSkillResource

    def passed(self, obj):
        if obj.skill.testable:
            return obj.passed
        return None

    def date_approved(self, obj):
        return obj.tutor.profile.date_approved

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("skill__quiz", "tutor__profile")
            .prefetch_related(
                "tutor__phonenumber_set",
                "tutor__location_set",
                "tags",
                "exhibitions",
                "skillcertificate_set",
                "sitting",
            )
        )

    def skill_url(self, obj):
        return '<a href="{}" target="_blank" >{}</a>'.format(
            obj.get_absolute_url(), obj.skill.name
        )

    skill_url.allow_tags = True

    def number(self, obj):
        numbers = obj.tutor.phonenumber_set.all()
        x = [y for y in numbers if y.verified == True]
        if len(x) > 0:
            return x[0].number

    def state(self, obj):
        addr = obj.tutor.location_set.all()
        t_addr = [x for x in addr if x.addr_type == 2]
        if len(t_addr) > 0:
            return t_addr[0].state
        if len(addr) > 0:
            return addr[0].state
        # add = obj.tutor.location_set.actual_tutor_address()
        # if add:
        #     return add.state

    def quiz_score(self, obj):
        x = obj.sitting.all()
        if len(x) > 0:
            return f'<a href="/we-are-allowed/tutor_management/quizsitting/?q={obj.tutor.email}" target="_blank">{x[0].score}</a>'

    quiz_score.allow_tags = True

    def wc(self, obj):
        if obj.description:
            return len(" ".join(obj.description.split()))
        return 0

    def approve_skill(self, request, queryset):
        agent = Agent.get_or_create_agent_with_required_details(
            request.user, Agent.TUTOR
        )
        queryset.approve_skill(agent=agent)
        for i in queryset.all():
            i.update_tutor_prices()
        # TutorSkill.update_queryset(queryset, status=TutorSkill.ACTIVE, agent=agent)

        # tutor_skill_ids = queryset.values_list("id", flat=True)
        # for tutor_skill_id in tutor_skill_ids:
        #     email_on_decision_taken_on_subject.delay(tutor_skill_id, approved=True)

    def upload_exhibition(self, request, queryset):
        v = [x.pk for x in queryset.all()]
        upload_exhibition_or_certificate.delay("exhibit", v)
        messages.info(request, "Exhibition Emails Sent")
        # queryset.update(status=TutorSkill.MODIFICATION)

    def take_quiz(self, request, queryset):
        x = list(set(queryset.values_list("tutor_id", flat=True)))
        for _id in x:
            email_to_take_quiz.delay(_id)

    def upload_certificate(self, request, queryset):
        v = [x.pk for x in queryset.all()]
        upload_exhibition_or_certificate.delay("certificate", v)
        messages.info(request, "Certificate Emails Sent")

    def freeze_subject(self, request, queryset):
        msg = request.POST.get("msg")
        if msg:
            agent = Agent.get_or_create_agent_with_required_details(
                request.user, Agent.TUTOR
            )
            # import pdb; pdb.set_trace()
            TutorSkill.update_queryset(
                queryset, status=TutorSkill.DENIED, remark=msg, agent=agent
            )

        # messages.info(request, "")
        # TutorSkill.objects.filter(pk__in=queryset.values_list('pk', flat=True))\
        #     .update(status=TutorSkill.FREEZE, agent=agent)

    def deny_skill(self, request, queryset):
        agent = Agent.get_or_create_agent_with_required_details(
            request.user, Agent.TUTOR
        )
        queryset.deny_skill(agent=agent)
        # TutorSkill.update_queryset(queryset, status=TutorSkill.DENIED, agent=agent)

        # tutor_skill_ids = queryset.values_list("id", flat=True)
        # for tutor_skill_id in tutor_skill_ids:
        #     email_on_decision_taken_on_subject.delay(tutor_skill_id)

        # TutorSkill.objects.filter(pk__in=queryset.values_list('pk', flat=True))\
        #     .update(status=TutorSkill.DENIED, agent=agent)

    def mark_skill_for_display(self, request, queryset):
        queryset.update(marked_for_display=True)

    def remove_skill_for_display(self, request, queryset):
        queryset.update(marked_for_display=False)

    def send_reminder_to_populate_content(self, request, queryset):
        tutor_skill_ids = queryset.values_list("id", flat=True)
        for tutor_skill_id in tutor_skill_ids:
            email_to_populate_skill_content.delay(tutor_skill_id)
        messages.info(request, "Reminder Notice Sent!!!")

    def send_24hour_modification_notice(self, request, queryset):
        # TutorSkill.objects.filter(
        #     id__in=tutor_skill_ids)\
        #     .update(status=TutorSkill.MODIFICATION, agent=agent)
        tutor_skill_ids = queryset.values_list("id", flat=True)
        for tutor_skill_id in tutor_skill_ids:
            email_to_modify_skill.delay(tutor_skill_id, notice_24_hour=True)
        messages.info(request, "Modification Notice Sent!!!")
        # queryset.update(marked_for_display=False)

    def require_modiication(self, request, queryset):
        agent = Agent.get_or_create_agent_with_required_details(
            request.user, Agent.TUTOR
        )
        queryset.require_modification(agent=agent)
        # tutor_skill_ids = queryset.values_list("id", flat=True)
        # TutorSkill.update_queryset(
        #     queryset, status=TutorSkill.MODIFICATION, agent=agent
        # )
        # # TutorSkill.objects.filter(
        # #     id__in=tutor_skill_ids)\
        # #     .update(status=TutorSkill.MODIFICATION, agent=agent)
        # for tutor_skill_id in tutor_skill_ids:
        #     email_to_modify_skill.delay(tutor_skill_id)

    def mark_skill_image_as_rejected(self, request, queryset):
        agent = Agent.get_or_create_agent_with_required_details(
            request.user, Agent.TUTOR
        )
        public_ids = [x.image.public_id for x in queryset.all() if x.image]
        if public_ids:
            cloudinary.api.delete_resources(public_ids)
        TutorSkill.update_queryset(
            queryset, image=None, agent=agent, image_denied_on=timezone.now()
        )
        # queryset.update(image=None, agent=agent, image_denied_on=timezone.now())

    def mark_user_image_as_rejected(self, request, queryset):
        public_ids = [
            x.get_img.public_id for x in queryset.all() if x.get_img is not None
        ]
        cloudinary.api.delete_resources(public_ids)
        UserProfile.objects.filter(
            user_id__in=[x.tutor_id for x in queryset.all()]
        ).update(image=None)

    def mark_exhibition_pictures_as_denied(self, request, queryset):
        queryset.reject_exhibition_pictures()
        # ts_ids = [x.id for x in queryset.all()]
        # exhibition_list = SubjectExhibition.objects.filter(id__in=ts_ids)
        # public_ids = [x.image.public_id for x in exhibition_list.all()]
        # cloudinary.api.delete_resources(public_ids)
        # exhibition_list.delete()

    def mark_certificates_as_denied(self, request, queryset):
        certificate_list = SkillCertificate.objects.filter(
            ts_id__in=queryset.values_list("id", flat=True)
        )
        certificate_list.delete()

    def fix_all_slugs(self, request, queryset):
        for ts in queryset.all():
            ts.slug = ts.generate_slug()
            ts.save()

        # def lookup_allowed(self, lookup, value):
        #     if lookup in ('tutor__profile__gender',):
        #         return True
        #     return super(TutorSkillAdmin, self).lookup_allowed(lookup, value)


@admin.register(PendingTutorSkill)
class PendingTutorSkillAdmin(TutorSkillAdmin):
    list_display = TutorSkillAdmin.list_display + ["state"]
    list_filter = (
        VerifiedFilter,
        NoHeadingFilter,
        ProfilePicFilter,
        SkillDisplayFilter,
        GenderFilter,
    )


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


@admin.register(SkillWithState)
class SkillWithStateAdmin(admin.ModelAdmin):
    list_display = ["skill", "state", "online"]


class ApprovedActiveTutorAdmin(admin.ModelAdmin):
    list_display = (
        "tutor_email",
        "skill_name",
        "price",
        "subject_description",
        "full_address",
        "lat_lng",
        "classes",
        "tutor_description",
        # 'curriculum', 'hijack_user'
        "years_of_experience",
        "test_scores",
        "education",
        "workexperience",
        "award",
        "exhibition_list",
        "profile_pic",
    )
    search_fields = ("tutor__email", "skill__name")
    list_filter = ["approved", StateFilter, "skill__name"]
    actions = ["approve_tutors", "deny_tutors", "update_tutor_price"]
    form = TutorSkillForm
    action_form = FForm

    def full_address(self, obj):
        locations = obj.tutor.location_set.all()
        return ", ".join([x.full_address for x in locations])

    def subject_description(self, obj):
        return obj.description

    def tutor_description(self, obj):
        return obj.tutor.profile.tutor_description

    def classes(self, obj):
        return obj.tutor.profile.classes

    def tutor_email(self, obj):
        return obj.tutor.email

    def skill_name(self, obj):
        return obj.skill.name

    skill_name.admin_order_field = "skill__name"

    def profile_pic(self, obj):
        return obj.admin_img()

    profile_pic.allow_tags = True

    def lat_lng(self, obj):
        locations = obj.tutor.location_set.all()
        result = filter(lambda x: x.latitude and x.longitude, locations)
        return [(x.latitude, x.longitude) for x in result]

    lat_lng.admin_order_field = "tutor__location__longitude"

    def years_of_experience(self, obj):
        return obj.tutor.profile.get_years_of_teaching_display()

    def test_scores(self, obj):
        return ", ".join(
            [
                "{}:{}".format(x.tutor_skill.skill.name, x.score)
                for x in obj.sitting.all()
            ]
        )

    def education(self, obj):
        return ", ".join(
            [
                x.display_string
                for x in obj.tutor.education_set.all()
                if x.display_string
            ]
        )

    def workexperience(self, obj):
        return ", ".join(
            [
                x.display_string
                for x in obj.tutor.workexperience_set.all()
                if x.display_string
            ]
        )

    def award(self, obj):
        return obj.skillcertificate_set.all()

    def approve_tutors(self, request, queryset):
        queryset.update(approved=True)
        messages.info(request, "Approved Tutors")

    def deny_tutors(self, request, queryset):
        queryset.update(approved=False)
        messages.error(request, "Denied Tutors")

    def update_tutor_price(self, request, queryset):
        amount = request.POST.get("amount")
        if amount:
            queryset.update(price=amount)
        messages.info(request, "Price updated")

    def get_queryset(self, request):
        return (
            super(ApprovedActiveTutorAdmin, self)
            .get_queryset(request)
            .select_related("tutor", "skill")
            .filter(status=TutorSkill.ACTIVE, tutor__identifications__verified=True)
            .exclude(tutor__profile__image=None)
            .prefetch_related(
                "tutor__location_set",
                "tutor__education_set",
                "tutor__workexperience_set",
                "tutor__profile",
                "sitting__tutor_skill",
                "exhibitions",
                "skillcertificate_set",
            )
        )


create_modeladmin(ApprovedActiveTutorAdmin, TutorSkill, name="ApprovedActiveTutor")
