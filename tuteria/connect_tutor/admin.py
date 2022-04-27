from external.models import PriceDeterminator
from decimal import Decimal
import urllib
from dal import autocomplete
from django.shortcuts import reverse
from andablog.admin import EntryAdmin
from andablog.models import Entry
from ckeditor.widgets import CKEditorWidget
from django import forms
from django.db import models
from django.contrib import admin, messages
from django.contrib.admin.helpers import ActionForm
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
import requests



# Register your models here.
from .models import RequestPool, BlogCategory, BlogArticle, TutorJobResponse
from config.utils import create_modeladmin, get_result
from external.models import BaseRequestTutor
from external.tasks import send_profile_to_client, send_text_message
from users.models import UserProfile
from skills.models import related_subjects, TutorSkill

from registration.tasks import verify_id_to_new_tutors
from hubspot import HubspotAPI


def profile_picture_filter():
    class HasProfilePicFilter22(admin.SimpleListFilter):
        title = _("Profile Pic")
        parameter_name = "profile_pic"

        def lookups(self, request, model_admin):
            return (
                ("has_profile_pic", _("Has Profile Pic")),
                ("no_profile_pic", _("No profile pic")),
            )

        def queryset(self, request, queryset):
            if self.value() == "has_profile_pic":
                return queryset.exclude(tutor__profile__image=None)
            if self.value() == "no_profile_pic":
                return queryset.filter(tutor__profile__image=None)
            return queryset

    return HasProfilePicFilter22


def gender_filter():
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

    return GenderFilter


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ("slug", "name")


class BlogArticleAdmin(admin.StackedInline):
    model = BlogArticle


class EntryForm(forms.ModelForm):
    # content = forms.CharField(widget=AdminPagedownWidget())
    content = forms.CharField(widget=CKEditorWidget())

    class Meta:
        model = Entry
        fields = "__all__"
        widgets = {"author": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class BudgetUpdateForm(ActionForm):
    amount = forms.DecimalField(
        widget=forms.TextInput(attrs=dict(placeholder="amount")), required=False
    )
    subjects = forms.CharField(
        widget=forms.TextInput(attrs=dict(placeholder="subjects")), required=False
    )
    default_subject = forms.CharField(
        widget=forms.TextInput(attrs=dict(placeholder="d_subjects")), required=False
    )
    text_msg = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=3, placeholder="text_msg")),
        required=False,
    )


class NewEntryAdmin(EntryAdmin):
    list_display = ["title", "featured", "is_published", "published_timestamp"]
    form = EntryForm
    inlines = (BlogArticleAdmin,)

    def featured(self, obj):
        return obj.link.featured

    featured.boolean = True

    def mark_as_featured(self, request_queryset):
        queryset.update(featured=True)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "author":
            kwargs["queryset"] = get_user_model().objects.all()
            # Q(is_superuser=True) | Q(user_permissions__content_type__app_label='andablog',
            #                          user_permissions__content_type__model='entry')).distinct()
            kwargs["initial"] = request.user.id
        return super(EntryAdmin, self).formfield_for_foreignkey(
            db_field, request, **kwargs
        )


admin.site.unregister(Entry)
admin.site.register(Entry, NewEntryAdmin)


class RemoveApprovedRequest(admin.SimpleListFilter):
    title = _("Not Approved Yet")
    parameter_name = "a_r"

    def lookups(self, request, model_admin):
        return (
            ("approved_request", _("Approved Request")),
            ("not_approved", _("Not Approved Requests")),
        )

    def queryset(self, request, queryset):
        x = queryset.filter(approved=True).values_list("req_id", flat=True)
        if self.value() == "approved_request":
            return queryset.filter(req_id__in=x)
        if self.value() == "not_approved":
            return queryset.exclude(req_id__in=x)
        return queryset


class RequestTypeFilter(admin.SimpleListFilter):
    title = _("Request Type")
    parameter_name = "_req_type"

    def lookups(self, request, model_admin):
        return (
            ("parent", _("Parent Request")),
            ("generic", _("Generic Request")),
            ("tutor", _("Tutor Request")),
        )

    def queryset(self, request, queryset):
        if self.value() == "parent":
            return queryset.filter(req__is_parent_request=True)
        if self.value() == "generic":
            return queryset.filter(req__is_parent_request=False, req__request_type=1)
        if self.value() == "tutor":
            return queryset.filter(req__request_type=2)
        return queryset


def create_modeladmin(modeladmin, model, name=None):
    class Meta:
        proxy = True
        app_label = model._meta.app_label

    attrs = {"__module__": "", "Meta": Meta}

    newmodel = type(name, (model,), attrs)

    admin.site.register(newmodel, modeladmin)
    return modeladmin


class RequestForm(forms.ModelForm):
    class Meta:
        model = RequestPool
        fields = "__all__"
        widgets = {
            "tutor": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "req": autocomplete.ModelSelect2(url="baserequesttutor-autocomplete"),
        }


@admin.register(TutorJobResponse)
class TutorJobResponseAdmin(admin.ModelAdmin):
    list_display = [
        "slug",
        "tutor_email",
        "request_info",
        "reason",
        "comment",
        "status",
        "created",
        "agent",
    ]
    search_fields = ("req__slug", "tutor__email", "req__email")
    list_select_related = ["tutor", "req"]
    list_filter = [
        "status",
    ]
    form = RequestForm

    def slug(self, obj):
        return obj.req.slug

    def comment(self, obj):
        if obj.data_dump:
            return obj.data_dump.get("comment", "")
        return ""

    def reason(self, obj):
        if obj.data_dump:
            return obj.data_dump.get("reason")
        return ""

    def tutor_email(self, obj):
        if obj.tutor:
            return '<a href="/hijack/%s" target="_blank">%s</a>' % (
                obj.tutor_id,
                obj.tutor.email,
            )

    tutor_email.allow_tags = True

    def request_info(self, obj):
        return '<a href="/we-are-allowed/external/requestswithsplit?q=%s" target="_blank">%s</a>' % (
            obj.req.slug,
            obj.req.slug,
        )

    request_info.allow_tags = True

    def agent(self, obj):
        if obj.req:
            if obj.req.agent:
                return obj.req.agent.name


@admin.register(RequestPool)
class RequestPoolAdmin(admin.ModelAdmin):
    list_display = [
        "slug",
        "tutor",
        "req_url",
        "quiz_url",
        "request_subjects",
        "user_subjects",
        "approved",
        "cost",
        "per_hour",
        "tutor_gender",
        "full_address",
        "distance",
        "subjects",
        "remarks",
        "full_name",
        "number",
        "ttp",
        "budget",
        "tutor_skills",
        "tutor_requested",
    ]
    actions = [
        "add_tutor_to_client_pool",
        "resend_link_to_hubspot",
        "remove_tutor_from_pool",
        "update_price_of_client_and_request",
        "set_tutor_as_recommended",
        "send_mail_to_tutors_to_update_exhibitions",
        "send_mail_to_tutors_to_update_skill",
        "update_tutors_price",
        "send_mail_to_reupload_profile_picture",
        "update_client_subject_with_tutors",
        "default_subject_update",
        "mark_as_approved",
        "send_text_message_to_tutors",
    ]
    action_form = BudgetUpdateForm
    list_filter = [
        RemoveApprovedRequest,
        RequestTypeFilter,
        profile_picture_filter(),
        gender_filter(),
        "approved",
    ]
    search_fields = ("req__slug", "tutor__email", "req__email")
    form = RequestForm
    tuteria_subjects = []

    def slug(self, obj):
        return obj.req.slug

    slug.admin_order_field = "-req"

    def quiz_url(self, obj):
        if obj.tutor:
            return '<a href="/we-are-allowed/tutor_management/quizsitting/?q={}" target="_blank">quiz_url</a>'.format(
                obj.tutor.email
            )

    quiz_url.allow_tags = True

    def req_url(self, obj):
        return '<a href="/we-are-allowed/external/requestswithsplit/?q={}" target="_blank" >request_url</a>'.format(
            obj.req.slug
        )

    req_url.allow_tags = True

    def tutor_gender(self, obj):
        return obj.req.get_gender_display()

    def tutor_skills(self, obj):
        if obj.tutor:
            return '<a href="/we-are-allowed/tutor_management/tutorskill/?q={}" target="_blank" >tutor_skills</a>'.format(
                obj.tutor.email
            )

    tutor_skills.allow_tags = True

    def tutor_requested(self, obj):
        return obj.req.tutor

    def full_name(self, obj):
        x = obj
        if x.tutor:
            return "{} {}".format(x.tutor.first_name, x.tutor.last_name)

    def full_address(self, obj):
        if obj.get_tutor_address:
            return obj.get_tutor_address.full_address

    def number(self, obj):
        if obj.tutor:
            all_numbers = obj.tutor.phonenumber_set.all()
            return all_numbers[0].number
        # return ''.join(x.number for x in obj.primary_phone_no)
        # return obj.tutor.primary_phone_no

    def budget(self, obj):
        return obj.req.budget

    def request_subjects(self, obj):
        return obj.req.request_subjects

    def per_hour(self, obj):
        return '<a href="/tutors/select/{}" target="_blank" >{}</a>'.format(
            obj.req.slug, obj.req.per_hour()
        )

    per_hour.allow_tags = True

    def send_text_message_to_tutors(self, request, queryset):
        ids = queryset.values_list("pk", flat=True)
        text = request.POST.get("text_msg")
        if text:
            send_text_message.delay(list(ids), text)

    def update_tutors_price(self, request, queryset):
        new_price = request.POST.get("amount")
        if new_price:
            queryset.update_tutors_prices(Decimal(new_price))
            messages.info(request, "Tutor's price has been updated")

    def get_google_distance(self, request, queryset):
        if request.GET.get("q"):
            xx = queryset.first()
            if xx:
                xx = xx.req
            tutor_ids = [x.tutor_id for x in queryset.all()]
            if xx:
                if xx.latitude:
                    self.distances = get_result(xx, queryset, tutor_ids)
                else:
                    self.distances = []
            else:
                self.distances = []

    def distance(self, obj):
        if hasattr(self, "distances"):
            x = [y for y in self.distances if y[1] == obj.tutor_id]
            if x:
                return x[0][0]

    def send_mail_to_reupload_profile_picture(self, request, queryset):
        for x in queryset.all():
            verify_id_to_new_tutors.delay(x.tutor_id, False)

    def update_client_subject_with_tutors(self, request, queryset):
        req_id = queryset.first().req
        queryset.update(subjects=req_id.request_subjects)

    def get_queryset(self, request):
        from connect_tutor.forms import RequestWithRelations
        from users.models import PhoneNumber

        self.tuteria_subjects = RequestWithRelations.get_tuteria_subjects()
        query = (
            super(RequestPoolAdmin, self)
            .get_queryset(request)
            .select_related("req", "tutor")
            .filter(req__booking=None)
            .prefetch_related(
                models.Prefetch(
                    "tutor__tutorskill_set",
                    queryset=TutorSkill.objects.select_related("skill").exclude(
                        status=TutorSkill.DENIED
                    ),
                    to_attr="valid_tutorskills",
                ),
                "tutor__phonenumber_set",
                "tutor__location_set",
            )
        )
        return query

    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super(RequestPoolAdmin, self).get_search_results(
            request, queryset, search_term
        )

        self.get_google_distance(request, queryset)
        return queryset, use_distinct

    def remove_tutor_from_pool(self, request, queryset):
        req_ids = [vv.req_id for vv in queryset.all()]
        queryset.update(approved=False)
        BaseRequestTutor.objects.filter(id__in=req_ids).update(
            status=BaseRequestTutor.COMPLETED
        )

    def update_price_of_client_and_request(self, request, queryset):
        reqs = [x.req_id for x in queryset.all()]
        BaseRequestTutor.objects.filter(id__in=reqs).update(
            budget=request.POST.get("amount")
        )
        messages.info(request, "Budget amount updated")

    def mark_as_approved(self, request, queryset):
        queryset.update(approved=True)

    def shared_implementation(self, request, queryset):
        first = queryset.first().req
        main_request = first.related_request
        req_ids = [vv.req_id for vv in queryset.all()]
        BaseRequestTutor.objects.filter(id__in=req_ids).update(
            status=BaseRequestTutor.PENDING, payment_date=timezone.now()
        )
        queryset.update(approved=True, modified=timezone.now())
        if main_request:
            main_request.status = BaseRequestTutor.PENDING
            main_request.save()
        # else:
        first.status = BaseRequestTutor.PENDING
        first.email = first.email.strip()
        first.save()
        h = PriceDeterminator.get_rates()
        if h.use_hubspot:
            h_instance = HubspotAPI(reverse("hubspot:hubspot_code"))
            if not first.hubspot_contact_id:
                first.hubspot_contact_id = h_instance.create_contact(first)
            if not first.hubspot_deal_id:
                first.hubspot_deal_id = h_instance.create_deal(
                    first, "hubspot_contact_id"
                )
            h_instance.send_email(first, deal="hubspot_deal_id", agent_field="name")
        return req_ids

    def resend_link_to_hubspot(self, request, queryset):
        self.shared_implementation(request, queryset)

    def add_tutor_to_client_pool(self, request, queryset):
        req_ids = self.shared_implementation(request, queryset)
        send_profile_to_client(req_ids[0])
        # send_profile_to_client.delay(req_ids[0])
        messages.info(request, "Added To Pool")

    def set_tutor_as_recommended(self, request, queryset):
        queryset.update(recommended=True)

    def send_mail_to_tutors_to_update_skill(self, request, queryset):
        from .tasks import send_mail_to_update_skills

        subjects = request.POST.get("subjects")
        for x in queryset.all():
            send_mail_to_update_skills.delay(x.tutor_id, x.req_id, subjects)

    def send_mail_to_tutors_to_update_exhibitions(self, request, queryset):
        from .tasks import send_mail_to_tutors_to_update_exhibitions

        subjects = request.POST.get("subjects")
        for x in queryset.all():
            send_mail_to_tutors_to_update_exhibitions.delay(
                x.tutor_id, x.req_id, subjects
            )

    def default_subject_update(self, request, queryset):
        subjects = request.POST.get("default_subject")
        queryset.update(default_subject=subjects)

    def user_subjects(self, obj):
        if obj.tutor:
            subjects = obj.tutor.valid_tutorskills
            subjects_related = [y.lower() for y in related_subjects(obj.subjects, self.tuteria_subjects)]
            s = [
                x
                for x in subjects
                if len(list(set(x.skill.related_with).intersection(subjects_related)))
                > 0
            ]
            # s = obj.tutor.tutorskill_set.related_subject(obj.subjects).all()
            return [
                '<a href="%s" target="_blank">%s</a>'
                % (v.get_absolute_url(), v.skill.name)
                for v in s
            ]

    user_subjects.allow_tags = True


class BookingsToBePlacedAdmin(admin.ModelAdmin):
    list_display = [
        "slug",
        "pk",
        "tutor_subjects",
        "budget",
        "amount_paid",
        "available_days",
        "time_of_lesson",
        "request_subjects",
        "class_urgency",
        "hijack_user",
        "expectation",
    ]

    def hijack_user(self, obj):
        return '<a href="/hijack/%s" target="_blank">Hijack %s</a>' % (
            obj.user.pk,
            obj.user.first_name,
        )

    hijack_user.allow_tags = True

    def tutor_subjects(self, obj):
        s = []
        for u in obj.request.valid_tutors():
            for d in u.tutorskill_set.related_subject(obj.request_subjects).all():
                s.append(d)
        return [
            '<a href="%s" target="_blank">%s</a>' % (v.get_absolute_url(), v.skill.name)
            for v in s
        ]

    tutor_subjects.allow_tags = True

    def get_queryset(self, request):
        return (
            super(BookingsToBePlacedAdmin, self)
            .get_queryset(request)
            .filter(status=BaseRequestTutor.PAYED)
            .filter(booking=None)
            .exclude(amount_paid=Decimal(0))
            .tutor_count_exists()
        )


create_modeladmin(BookingsToBePlacedAdmin, BaseRequestTutor, name="BookingsToBePlaced")
