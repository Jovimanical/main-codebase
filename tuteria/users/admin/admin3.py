import csv
import logging

import cloudinary
import django

# from advanced_filters.admin import AdminAdvancedFiltersMixin
from allauth.account.adapter import get_adapter
from allauth.account.admin import EmailAddressAdmin
from allauth.account.models import EmailAddress
from allauth.socialaccount.admin import SocialAccountAdmin
from allauth.socialaccount.models import SocialAccount
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as MUserAdmin
from django.db import models
from django.db.models import Avg, When, Sum, Case, Value, IntegerField
from django.http import StreamingHttpResponse
from django.utils.translation import ugettext_lazy as _
from hijack_admin.admin import HijackUserAdmin, HijackUserAdminMixin
from import_export.admin import ExportMixin

import skills
from django_quiz.multichoice.models import Answer, MCQuestion
from django_quiz.quiz.models import Quiz, Progress, Sitting, Category, SubCategory
from registration import tasks
from registration.admin import VerifiedTutorAdmin, TutorRevampAdmin
from registration.models import Education, Guarantor, WorkExperience
from registration.tasks.tasks1 import sms_to_create_subjects
from reviews.forms import TutorMeetingForm
from reviews.models import SkillReview, TutorMeeting
from rewards.models import Milestone
from skills.models import (
    TutorSkill,
    SkillCertificate,
    SubjectExhibition,
    PendingTutorSkill,
    QuizSitting,
    SkillWithState,
    Skill,
    Category as SCategory,
)
from skills.tasks import tasks1 as skill_tasks
from users.admin import filters, utils
from users.admin.filters import admin_filter_for_verified_tutors
from users.admin.mixins import DistanceMixin, AdminMixins, identificationMixin
from users.admin.resources import PhoneNumberResource, TutorResource, TutorSkillResource
from users.forms import UserAdminForm, LocationForm, UserProfileSpecialForm
from users.models import (
    UserProfile,
    timezone,
    Location,
    PhoneNumber,
    UserIdentification,
    VerifiedTutor,
    TutorApplicant,
    UserMilestone,
)
from users.tasks import tasks1
from .admin1 import User, UserProfileAdminInline
from .forms import (
    UpdateVicinityActionForm,
    PhoneNumberAutocompleteForm,
    UserIdentificationForm,
    FForm,
    QuizAdminForm,
    SkillReviewForm,
    DateForm,
    TutorSkillForm,
    QuizSittingForm,
    ActionForms,
    EducationForm,
    GuarantorForm,
    WorkExperienceForm,
    SkillCertificateForm,
    SkillForm,
    ByStateFilterForm,
)

logger = logging.getLogger(__name__)


class TutorSuccessAdmin(admin.AdminSite):
    site_header = "Tutor Success Admin"
    site_title = "Tutor Success Admin"
    index_title = "Tutor Success Administration"


tutor_success_admin = TutorSuccessAdmin(name="tutor_success_admin")


@admin.register(User, site=tutor_success_admin)
class UserAdmin(MUserAdmin, HijackUserAdminMixin):
    list_select_related = ("profile",)
    list_filter = (
        HijackUserAdmin.list_filter
        + (filters.TutorStatusFilter,)
        + (
            filters.VideoFilter,
            filters.PhotoFilter,
            filters.CommonEntranceFilter,
            filters.TutorFilter,
            filters.RegistrationStatusFilter,
            filters.DateOfBirthFilter,
        )
    )

    inlines = [UserProfileAdminInline]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            _("Personal info"),
            {"fields": ("first_name", "last_name", "username", "country", "slug")},
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                    "is_teacher",
                    "tutor_intent",
                    "flagged",
                    "pay_with_bank",
                    "is_referrer",
                    "recieve_email",
                    "paystack_customer_code",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )
    list_display = (
        "email",
        "first_name",
        "last_name",
        "get_age",
        "get_state",
        "get_gender",
        "get_video",
        "username",
        "is_staff",
        "hijack_field",
        "slug",
    )

    search_fields = ("first_name", "last_name", "username", "email", "location__state")
    ordering = ("email",)
    form = UserAdminForm
    actions = [
        "verify_video",
        "verify_image",
        "dissaprove_image",
        "reactivate_denied_tutors",
        "send_email_to_all_users",
    ]

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for instance in instances:
            instance.created = timezone.now()
            instance.save()
        formset.save_m2m()

    def verify_video(self, request, queryset):
        for vv in queryset.all():
            vv.profile.approve_video()

    def verify_image(self, request, queryset):
        id_list = queryset.values_list("id", flat=True)
        UserProfile.objects.filter(user__id__in=id_list).update(image_approved=True)

    def dissaprove_image(self, request, queryset):
        users = [u.pk for u in queryset.all()]
        UserProfile.objects.filter(user__id__in=users).update(
            application_status=UserProfile.DENIED,
            application_trial=3,
            date_denied=timezone.now(),
            image=None,
        )

        queryset.update(flagged=True)
        # queryset.update(profile__application_status=UserProfile.DENIED, profile__application_trial=3,
        #                 profile__date_denied=timezone.now(),
        #                 image=None)
        # User.objects.filter(id__in=users).update(flagged=True)

    def reactivate_denied_tutors(self, request, queryset):
        tasks.reactivate_valid_denied_users.delay()

    def send_email_to_all_users(self, request, queryset):
        from users.tasks import email_to_all_verified_tutors

        for x in queryset.exclude(profile__blacklist=True).all():
            email_to_all_verified_tutors.delay(x.email)

    def get_queryset(self, request):
        query_set = (
            super(UserAdmin, self)
            .get_queryset(request)
            .prefetch_related("location_set")
        )

        return query_set

    def get_age(self, obj):
        return obj.profile.age or "-"

    get_age.short_description = "age"

    def get_state(self, obj):

        location = obj.location_set.all()
        if location:
            return location[0].state
        return "-"

    get_state.short_description = "state"

    def get_gender(self, obj):
        return obj.profile.gender or "-"

    get_gender.short_description = "gender"

    def get_video(self, obj):
        return obj.profile.video

    get_video.short_description = "video"


class Echo(object):
    """An object that implements just the write method of the file-like
    interface.
    """

    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


@admin.register(Location, site=tutor_success_admin)
class LocationAdmin(admin.ModelAdmin):
    list_select_related = ("user",)
    list_display = (
        "email",
        "address",
        "longitude",
        "latitude",
        "vicinity",
        "region_name",
        "state",
    )
    form = LocationForm
    search_fields = ("address", "state", "user__email")
    # list_editable = ('longitude','latitude','vicinity')
    list_filter = (
        filters.OnlyVerifiedTutorFilter,
        filters.HasRegionFilter,
        filters.GenderFilter,
        filters.AddressTypeFilter,
        filters.NoVicinityFilter,
        filters.ActiveSubjectTutorFilter,
        filters.LGAFilter,
        "state",
    )
    action_form = UpdateVicinityActionForm
    actions = (
        "update_vicinity",
        "update_state",
        "remove_coordinate",
        "update_latitude_and_longitude",
        "remove_all_tutor_address_with_same",
        "update_vicinity_csv",
        "update_region_of_tutor",
    )

    def region_name(self, obj):
        if obj.region:
            return obj.region.name
        return obj

    def update_region_of_tutor(self, request, queryset):
        region = request.POST.get("region")
        ids = list(queryset.values_list("pk", flat=True))
        if region:
            Location.objects.filter(pk__in=ids).update(region=region)
            self.message_user(request, "Region successfully updated")

    def update_vicinity_csv(modeladmin, request, queryset):
        """A view that streams a large CSV file."""
        # Generate a sequence of rows. The range is based on the maximum number of
        # rows that can be handled by a single sheet in most spreadsheet
        # applications.
        # rows = (["Row {}".format(idx), str(idx)] for idx in range(65536))
        rows = ([idx.user.email] for idx in queryset.all())
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows), content_type="text/csv"
        )
        response[
            "Content-Disposition"
        ] = 'attachment; filename="update_vicinity_emails.csv"'
        return response
        # response = HttpResponse(content_type="application/json")
        # serializers.serialize("json", queryset, stream=response)
        # return response

    def remove_all_tutor_address_with_same(modeladmin, request, queryset):
        user_ids = queryset.all().values_list("user_id")
        Location.objects.filter(
            user_id__in=user_ids, addr_type=Location.USER_ADDRESS
        ).update(addr_type=Location.TUTOR_ADDRESS)
        queryset.delete()

    def remove_coordinate(self, request, queryset):
        queryset.update(latitude=None, longitude=None, vicinity=None)

    def update_latitude_and_longitude(self, request, queryset):
        lat = request.POST.get("latitude", None)
        lon = request.POST.get("longitude", None)
        vicinity = request.POST.get("vicinity", None)
        ids = [x.pk for x in queryset.all()]
        if lat and lon:
            Location.objects.filter(id__in=ids).update(latitude=lat, longitude=lon)
        if vicinity:
            Location.objects.filter(id__in=ids).update(vicinity=vicinity)
        self.message_user(
            request,
            "Successfully updated coordinate for %s rows" % (queryset.count()),
            messages.SUCCESS,
        )

    def update_vicinity(modeladmin, request, queryset):
        vicinity = request.POST["vicinity"]
        count = 0
        for x in queryset.all():
            count += 1
            x.vicinity = vicinity
            x.save()
        modeladmin.message_user(
            request,
            "Successfully updated vicinity for %s rows" % count,
            messages.SUCCESS,
        )

    def update_state(modeladmin, request, queryset):
        vicinity = request.POST["vicinity"]
        count = 0
        for x in queryset.all():
            count += 1
            x.state = vicinity
            x.save()
        modeladmin.message_user(
            request,
            ("Successfully updated vicinity for %s rows") % (count),
            messages.SUCCESS,
        )


@admin.register(PhoneNumber, site=tutor_success_admin)
class PhoneNumberAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ["owner", "number", "verified", "user_name"]
    search_fields = ["owner__email", "number"]
    form = PhoneNumberAutocompleteForm
    list_filter = [filters.tutor_filter_status(field="owner"), filters.LocationFilter]
    resource_class = PhoneNumberResource

    def number(self, obj):
        if obj.number:
            return str(obj.number)
        return ""


class Echo(object):
    """An object that implements just the write method of the file-like
    interface.
    """

    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


@admin.register(UserIdentification, site=tutor_success_admin)
class UserIdentificationAdmin(admin.ModelAdmin, identificationMixin):
    list_select_related = ("user__profile",)
    list_display = [
        "full_name",
        "email",
        "verified",
        "certificate",
        "profile_pic",
        "social_networks",
    ]
    list_filter = (
        filters.VerificationFilter,
        filters.OnlyVerifiedTutorFilter,
        filters.SocialMediaFilter,
        filters.HasProfilePicFilter,
    )
    search_fields = ["user__email"]
    actions = [
        "mark_id_as_verified",
        "mark_id_as_rejected",
        "mark_user_profile_as_rejected",
        "remove_verification_images_for_verified_users",
    ]
    form = UserIdentificationForm


class VerifiedTutorSkillsAdmin(ExportMixin, DistanceMixin):
    resource_class = TutorResource
    list_display = (
        "email",
        "number",
        "active_skills",
        "other_skills",
        "vicinity",
        "full_address",
        "classes",
        "tutor_description",
        "gender",
        "curriculum",
        "hijack_user",
        # 'distance_from_request',
        # 'base_request',
        # 'request_subjects',
        "education",
        "workexperience",
        "potential_subjects",
        "levels_with_exams",
        "image",
    )
    search_fields = (
        "email",
        "tutorskill__skill__name",
        "tutorskill__skill__categories__name",
    )
    advanced_filter_fields = (
        "email",
        ("tutorskill__skill__name", "Skill Name"),
        ("tutorskill__status", "Skill Status"),
        ("tutorskill__skill__categories__name", "Skill Categories"),
    )
    list_filter = (
        filters.ActiveSkillFilter,
        filters.NotPopulatedSubjectFilter,
        filters.HasBeenBookedFilter,
        ("teach_online", admin.BooleanFieldListFilter),
        filters.CommonEntranceFilter,
        filters.get_verification_filter(False),
        filters.profile_picture_filter(False),
        filters.StateFilter2,
        filters.GenderFilter2,
        filters.multiple_value_options_filter_factory("profile__classes"),
        filters.CurriculumFilter,
        # ArrayFieldListFilter,
        filters.regular_expression_filter_factory("education__course"),
        filters.regular_expression_filter_factory("workexperience__name"),
        filters.regular_expression_filter_factory("workexperience__role"),
        filters.regular_expression_filter_factory("tutorskill__description", True),
        filters.regular_expression_filter_factory("profile__tutor_description"),
        filters.regular_expression_filter_factory("profile__description"),
        filters.in_filter_factory("tutorskill__skill__name", True),
    )

    def image(self, obj):
        profile = obj.profile
        if profile.image:
            img = profile.image.image(width=70, height=49, crop="fill", gravity="faces")
            url = profile.image.url
            return '<a href="{}">{}</a>'.format(url, img)
        return ""

    image.allow_tags = True

    def number(self, obj):
        return str(obj.phone_number.number)

    def potential_subjects(self, obj):
        return obj.profile.potential_subjects

    def levels_with_exams(self, obj):
        return obj.profile.levels_with_exams

    # def num
    def active_skills(self, obj):
        s = obj.ac
        # s = obj.tutorskill_set.active()
        return [
            '<a href="%s" target="_blank">%s</a>' % (v.get_absolute_url(), v.skill.name)
            for v in s
        ]

    active_skills.allow_tags = True

    def get_actions(self, request):
        actions = super(VerifiedTutorSkillsAdmin, self).get_actions(request)
        if request.GET.get("state"):
            if "send_mail_to_verify_id" in actions:
                del actions["send_mail_to_verify_id"]
            if "send_mail_to_reupload_profile_picture" in actions:
                del actions["send_mail_to_reupload_profile_picture"]
        return actions

    def other_skills(self, obj):
        return (
            '<a href="/we-are-allowed/skills/tutorskill/?q=%s" target="_blank">Skill Profile</a>'
            % (obj.email,)
        )

    other_skills.allow_tags = True

    def hijack_user(self, obj):
        return '<a href="/hijack/%s" target="_blank">Hijack user</a>' % obj.pk

    hijack_user.allow_tags = True

    def tutor_description(self, obj):
        return obj.profile.tutor_description

    def gender(self, obj):
        return obj.profile.gender

    def classes(self, obj):
        return obj.profile.classes

    def curriculum(self, obj):
        return obj.profile.curriculum_display()

    def vicinity(self, obj):
        if self.addrs(obj):
            return self.addrs(obj).vicinity

    def addrs(self, obj):
        addr = obj.location_set.all()
        t_address = [x for x in addr if x.addr_type == 2]
        if len(t_address) > 0:
            return t_address[0]
        if len(addr) > 0:
            return addr[0]

    def full_address(self, obj):
        if self.addrs(obj):
            return self.addrs(obj).full_address
            # add = self.tutor_location(obj)
            # if add:
            #     return add.full_address

    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super(
            VerifiedTutorSkillsAdmin, self
        ).get_search_results(request, queryset, search_term)
        q = request.GET.get("q")
        # if len(q) == 12:
        # self.get_google_distance(queryset)
        return queryset, use_distinct

    def education(self, obj):
        return ", ".join([x.display_string for x in obj.education_set.all()])

    def workexperience(self, obj):
        return ", ".join(
            [x.display_string for x in obj.workexperience_set.all() if not x]
        )

    def get_queryset(self, request):
        queryset = (
            super(VerifiedTutorSkillsAdmin, self)
            .get_queryset(request)
            .select_related("profile")
        )
        if request.GET.get("q"):
            return queryset.annotate_active_skill()
        return (
            queryset.filter(profile__application_status=UserProfile.VERIFIED)
            .annotate_active_skill()
            .prefetch_related(
                "location_set", "education_set", "workexperience_set", "phonenumber_set"
            )
        )
        # .distinct('pk')

    def lookup_allowed(self, lookup, value):
        if lookup in (
            "profile__gender",
            "profile__classes_in",
            "education__course_contains",
            "workexperience__name_contains",
            "workexperience__role_contains",
            "profile__description_contains",
            "profile__tutor_description_contains",
            "tutorskill__description_contains",
            "tutorskill__skill__name_contains",
        ):
            return True
        return super(VerifiedTutorSkillsAdmin, self).lookup_allowed(lookup, value)


utils.create_modeladmin(
    VerifiedTutorSkillsAdmin,
    User,
    name="VerifiedTutorWithSkill",
    admin_var=tutor_success_admin,
)
utils.create_modeladmin(
    TutorRevampAdmin, User, name="TutorRevampView", admin_var=tutor_success_admin
)


@admin.register(VerifiedTutor, site=tutor_success_admin)
class VerifiedTutorAdmin(VerifiedTutorAdmin):
    """
    This should not be here as its a duplicate of what was implemented in VerifiedTutorAdmin under registration app.
    Comment made by: @gofaniyi
    """

    # list_display = ('email', 'active', 'denied', 'pending', 'modification',
    #                 'description', 'no_of_bookings', 'dob',)
    # list_select_related = ('user',)
    # form = UserProfileSpecialForm
    # list_filter = (filters.SubjectCountFilter, filters.ActiveSubjectFilter, filters.StarredFilter,
    #                filters.SocialMediaFilter, filters.StateFilter22)
    # search_fields = ['^user__email', 'user__first_name']
    # actions = ('send_email_on_subject_creation',
    #            'send_email_on_social_media_update', 'export_as_csv',
    #            'send_mail_to_all_tutors_about_content', 'remove_description',
    #            'export_lon_lat_by_state', 'send_sms_on_subject_creation')

    # def get_queryset(self, request):
    #     return super(VerifiedTutorAdmin, self).get_queryset(request).annotate(
    #         no_of_bookings=models.Count('user__t_bookings')).prefetch_related('user__tutorskill_set')

    # def email(self, obj):
    #     return obj.user.email

    # def no_of_bookings(self, obj):
    #     return obj.no_of_bookings

    # no_of_bookings.admin_order_field = "no_of_bookings"

    # def export_as_csv(modeladmin, request, queryset):
    #     """A view that streams a large CSV file."""
    #     # Generate a sequence of rows. The range is based on the maximum number of
    #     # rows that can be handled by a single sheet in most spreadsheet
    #     # applications.
    #     # rows = (["Row {}".format(idx), str(idx)] for idx in range(65536))
    #     rows = ([idx.user.email, idx.dob] for idx in queryset.all())
    #     pseudo_buffer = Echo()
    #     writer = csv.writer(pseudo_buffer)
    #     response = StreamingHttpResponse(
    #         (writer.writerow(row) for row in rows), content_type="text/csv")
    #     response[
    #         'Content-Disposition'] = 'attachment; filename="tutors_without_skill.csv"'
    #     return response
    #     # response = HttpResponse(content_type="application/json")
    #     # serializers.serialize("json", queryset, stream=response)
    #     # return response

    # def export_lon_lat_by_state(self, request, queryset):
    #     rows = ([
    #         idx.user.email,
    #         idx.user.location_set.actual_tutor_address().latitude,
    #         idx.user.location_set.actual_tutor_address().longitude,
    #         idx.user.location_set.actual_tutor_address().state,
    #         idx.user.tutorskill_set.active().aggregate(
    #             Avg('price'))['price__avg']
    #     ] for idx in queryset.all())
    #     pseudo_buffer = Echo()
    #     writer = csv.writer(pseudo_buffer)
    #     response = StreamingHttpResponse(
    #         (writer.writerow(row) for row in rows), content_type="text/csv")
    #     response[
    #         'Content-Disposition'] = 'attachment; filename="tutors_without_skill.csv"'
    #     return response

    # def send_sms_on_subject_creation(self, request, queryset):

    #     for u in queryset.exclude(blacklist=True).all():
    #         sms_to_create_subjects.delay(u.user_id)

    # def send_email_on_subject_creation(self, request, queryset):
    #     for u in queryset.exclude(blacklist=True).all():
    #         tasks1.email_to_create_subject.delay(u.user.email)

    # def send_email_on_social_media_update(self, request, queryset):
    #     for u in queryset.exclude(blacklist=True).all():
    #         tasks1.email_to_update_social_media.delay(u.user.email)

    # def send_mail_to_all_tutors_about_content(self, request, queryset):
    #     for u in queryset.exclude(blacklist=True).all():
    #         tasks1.email_to_all_verified_tutors.delay(u.user.email)

    # def remove_description(self, request, queryset):
    #     ids = [x.id for x in queryset.all()]

    #     UserProfile.objects.filter(user_id__in=ids).update(description='')
    pass


@admin.register(TutorApplicant, site=tutor_success_admin)
class TutorAdmin(admin.ModelAdmin):
    action_form = FForm
    form = UserProfileSpecialForm
    list_select_related = ("user",)
    list_display = (
        "email",
        "full_name",
        "profile_thumbnail",
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
    list_filter = (filters.MoriningFilter, filters.VerificationFilter)
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

    def email_verified(self, obj):
        emails = [x for x in obj.user.emailaddress_set.all() if x.verified]

        return len(emails) > 0

    def get_queryset(self, request):
        query = (
            super()
            .get_queryset(request)
            .select_related("user")
            .prefetch_related(
                "user__education_set",
                "user__workexperience_set",
                "user__emailaddress_set",
                "user__socialaccount_set",
                "user__phonenumber_set",
                "user__location_set",
            )
        )
        return query

    def verify_email_notification(self, request, queryset):
        qq = [x.user_id for x in queryset.all()]
        tasks1.verify_email_notification.delay(qq)

    def email(self, obj):
        return obj.user.email

    def years_display(self, obj):
        return obj.get_years_of_teaching_display()

    def mark_as_verified(self, request, queryset):
        for user in queryset.all():
            TutorApplicant.mark_as_verified(user.user.profile)

    mark_as_verified.description = "Mark Tutors as Verified"

    def mark_as_denied(self, request, queryset):
        for user in queryset.all():
            TutorApplicant.mark_as_verified(user.user.profile, status=False)

    mark_as_denied.description = "Deny Tutors Application"

    def mark_id_as_verified(self, request, queryset):
        users = [x.user for x in queryset.all()]
        ids = [x.pk for x in queryset]
        UserIdentification.objects.filter(user__in=ids).update(verified=True)
        User.objects.filter(id__in=ids).update(submitted_verification=True)
        reward2 = Milestone.get_milestone(Milestone.VERIFIED_ID)
        for user in users:
            if user.tuteria_verified:
                import pdb

                pdb.set_trace()
                UserMilestone.objects.get_or_create(user=user, milestone=reward2)

    def mark_id_as_rejected(self, request, queryset):
        public_ids = [x.user.identity.identity.public_id for x in queryset.all()]
        users = [x.user for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        UserIdentification.objects.filter(user__in=users).delete()

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
            tasks1.email_to_all_verified_tutors.delay(u.user.email)

    def send_notification_text_message(self, request, queryset):
        ids = [x.user.id for x in queryset]
        text = request.POST.get("text_msg")

        if text:
            tasks1.send_text_message(ids, text)


class AnswerInline(admin.TabularInline):
    model = Answer


@admin.register(Quiz, site=tutor_success_admin)
class QuizAdmin(admin.ModelAdmin):
    form = QuizAdminForm

    list_display = ("title", "pass_mark")
    list_filter = ("category",)
    search_fields = ("title",)


@admin.register(MCQuestion, site=tutor_success_admin)
class MCQuestionAdmin(admin.ModelAdmin):
    list_display = ("content", "get_quiz")
    list_filter = ("category",)
    fields = (
        "content",
        "category",
        "sub_category",
        "figure",
        "quiz",
        "explanation",
        "answer_order",
    )

    search_fields = ("content", "quiz__title")
    filter_horizontal = ("quiz",)

    inlines = [AnswerInline]


@admin.register(SocialAccount, site=tutor_success_admin)
class NewSocialAccountAdmin(SocialAccountAdmin):
    search_fields = []
    raw_id_fields = ("user",)
    list_display = ("user", "uid", "provider")
    list_filter = ("provider",)

    def __init__(self, *args, **kwargs):
        super(SocialAccountAdmin, self).__init__(*args, **kwargs)
        if not self.search_fields and django.VERSION[:2] < (1, 7):
            self.search_fields = self.get_search_fields(None)

    def get_search_fields(self, request):
        base_fields = get_adapter().get_user_search_fields()
        return list(map(lambda a: "user__" + a, base_fields))


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
    list_filter = ["approved", filters.StateFilter, "skill__name"]
    actions = ["approve_tutors", "deny_tutors"]
    form = TutorSkillForm

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


utils.create_modeladmin(
    ApprovedActiveTutorAdmin,
    TutorSkill,
    name="ApprovedActiveTutor",
    admin_var=tutor_success_admin,
)


@admin.register(skills.models.Category, site=tutor_success_admin)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "featured"]
    actions = ["mark_as_featured", "mark_as_not_featured"]

    def mark_as_featured(self, request, queryset):
        queryset.update(featured=True)

    def mark_as_not_featured(self, request, queryset):
        queryset.update(featured=False)


class SkillCertificateInlineAdmin(admin.TabularInline):
    model = SkillCertificate


class SubjectExhibitionInlineAdmin(admin.TabularInline):
    model = SubjectExhibition


@admin.register(TutorSkill, site=tutor_success_admin)
class TutorSkillAdmin(ExportMixin, admin.ModelAdmin):
    list_display = [
        "tutor",
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
        "exhibition_list",
        "admin_img",
    ]
    search_fields = ("skill__name", "tutor__email", "heading", "tutor__location__state")
    list_filter = (
        filters.StatusFilter,
        filters.VerifiedFilter,
        filters.NoHeadingFilter,
        filters.ProfilePicFilter,
        filters.SkillDisplayFilter,
        filters.GenderFilter,
        filters.BookingFilter,
        filters.TakenTestFilter,
        filters.Location2Filter,
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
    ]
    # list_select_related = ('tutor', 'skill')
    form = TutorSkillForm
    inlines = [SkillCertificateInlineAdmin, SubjectExhibitionInlineAdmin]
    resource_class = TutorSkillResource

    def passed(self, obj):
        if obj.skill.testable:
            return obj.passed
        return None

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
            return x[0].score

    def wc(self, obj):
        if obj.description:
            return len(" ".join(obj.description.split()))
        return 0

    def approve_skill(self, request, queryset):
        queryset.update(status=TutorSkill.ACTIVE)
        # TutorSkill.objects.filter(pk__in=queryset.values_list('pk', flat=True)) \
        #     .update(status=TutorSkill.ACTIVE)

        # for skill in queryset.all():
        #     skill.skill.link_tutor_skill_tags()

    def upload_exhibition(self, request, queryset):
        v = [x.pk for x in queryset.all()]
        skill_tasks.upload_exhibition_or_certificate.delay("exhibit", v)
        messages.info(request, "Exhibition Emails Sent")
        # queryset.update(status=TutorSkill.MODIFICATION)

    def take_quiz(self, request, queryset):
        x = list(set(queryset.values_list("tutor_id", flat=True)))
        for _id in x:
            skill_tasks.email_to_take_quiz.delay(_id)

    def upload_certificate(self, request, queryset):
        v = [x.pk for x in queryset.all()]
        skill_tasks.upload_exhibition_or_certificate.delay("certificate", v)
        messages.info(request, "Certificate Emails Sent")

    def freeze_subject(self, request, queryset):
        TutorSkill.objects.filter(pk__in=queryset.values_list("pk", flat=True)).update(
            status=TutorSkill.FREEZE
        )

    def deny_skill(self, request, queryset):
        queryset.update(status=TutorSkill.DENIED)

    def mark_skill_for_display(self, request, queryset):
        queryset.update(marked_for_display=True)

    def remove_skill_for_display(self, request, queryset):
        queryset.update(marked_for_display=False)

    def require_modiication(self, request, queryset):
        queryset.update(status=TutorSkill.MODIFICATION)

        TutorSkill.objects.filter(id__in=queryset.values_list("id", flat=True)).update(
            status=TutorSkill.MODIFICATION
        )

    def mark_skill_image_as_rejected(self, request, queryset):

        public_ids = [x.image.public_id for x in queryset.all()]
        cloudinary.api.delete_resources(public_ids)
        queryset.update(image=None)

    def mark_user_image_as_rejected(self, request, queryset):
        public_ids = [
            x.get_img.public_id for x in queryset.all() if x.get_img is not None
        ]

        cloudinary.api.delete_resources(public_ids)
        UserProfile.objects.filter(
            user_id__in=[x.tutor_id for x in queryset.all()]
        ).update(image=None)

    def mark_exhibition_pictures_as_denied(self, request, queryset):
        # TODO: Create Exhibition factory and write tests for this action
        ts_ids = [x.id for x in queryset.all()]
        exhibition_list = SubjectExhibition.objects.filter(id__in=ts_ids)
        public_ids = [x.image.public_id for x in exhibition_list.all()]
        cloudinary.api.delete_resources(public_ids)
        exhibition_list.delete()

    def mark_certificates_as_denied(self, request, queryset):
        # TODO: Create Skill Certificate factory and write tests for this action.
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


@admin.register(PendingTutorSkill, site=tutor_success_admin)
class PendingTutorSkillAdmin(TutorSkillAdmin):
    list_display = TutorSkillAdmin.list_display + ["state"]
    list_filter = (
        filters.VerifiedFilter,
        filters.NoHeadingFilter,
        filters.ProfilePicFilter,
        filters.SkillDisplayFilter,
        filters.GenderFilter,
    )


@admin.register(QuizSitting, site=tutor_success_admin)
class QuizSittingAdmin(admin.ModelAdmin):
    list_display = ["tutor_skill", "score", "completed", "created", "modified"]
    search_fields = ("tutor_skill__tutor__email", "tutor_skill__skill__name")
    list_filter = (filters.QuizFilter,)
    actions = ["mark_quiz_sittings_as_retake"]
    form = QuizSittingForm

    def mark_quiz_sittings_as_retake(self, request, queryset):
        ts_ids = [x.tutor_skill_id for x in queryset.all()]
        skill_tasks.send_email_to_retake_and_delete.delay(ts_ids)


def create_action(category):
    def action(modeladmin, request, queryset):
        for s in queryset:
            if category not in s.categories.all():
                s.categories.add(category)

    name = "%s_skills" % (category.name.lower(),)
    return name, (action, name, "Add Skills to %s Category" % (category.name,))


@admin.register(SkillCertificate, site=tutor_success_admin)
class SkillCertificateAdmin(admin.ModelAdmin):
    search_fields = ["ts__tutor__email"]
    form = SkillCertificateForm


@admin.register(Skill, site=tutor_success_admin)
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
        filters.ActiveSkillFilter2,
        filters.BackgroundFilter,
        "market_category",
        "categories__name",
        "subcategories__name",
    ]

    def get_queryset(self, request):
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
        v = dict(create_action(q) for q in SCategory.objects.all())
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
        print("Done")

    def set_as_featured(self, request, queryset):
        q = [s.pk for s in queryset.all()]
        Skill.objects.filter(id__in=q).update(featured=True)

    def remove_featured(self, request, queryset):
        q = [s.pk for s in queryset.all()]
        Skill.objects.filter(id__in=q).update(featured=False)
