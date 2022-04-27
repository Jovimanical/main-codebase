import csv
import logging
import operator
from functools import reduce

from django import forms
from django.contrib import admin
from django.contrib.admin.helpers import ActionForm
from django.contrib.admin.utils import lookup_needs_distinct
from django.http import StreamingHttpResponse
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
from embed_video.admin import AdminVideoMixin
from django.db import models

# from hijack.admin import HijackUserAdmin
from hijack_admin.admin import HijackUserAdminMixin, HijackUserAdmin
from import_export import resources
from import_export.admin import ImportExportMixin, ImportExportModelAdmin, ExportMixin
from django.contrib.auth.admin import UserAdmin as MUserAdmin
from django.contrib import messages
import cloudinary

from users.admin.forms import UpdateVicinityActionForm
from ..forms import (
    UserIdentificationForm,
    UserProfileForm,
    UserAdminForm,
    LocationForm,
    UserProfileSpecialForm,
    PhoneNumberAutocompleteForm,
)
from ..models import (
    UserProfile,
    User,
    PhoneNumber,
    UserIdentification,
    Location,
    UserMilestone,
    Constituency,
)

from rewards.models import Milestone
from registration import tasks
from config import utils

logger = logging.getLogger(__name__)


class InputFilter(admin.SimpleListFilter):
    template = "admin/input_filter.html"

    def lookups(self, request, model_admin):
        # Dummy, required to show the filter.
        return ((),)

    def choices(self, changelist):
        # Grab only the "all" option.
        all_choice = next(super().choices(changelist))
        all_choice["query_parts"] = (
            (k, v)
            for k, v in changelist.get_filters_params().items()
            if k != self.parameter_name
        )
        yield all_choice


class PhoneNumberResource(resources.ModelResource):

    class Meta:
        model = PhoneNumber
        fields = ["number"]

class EmailResource(resources.ModelResource):
    class Meta:
        model = Location
        fields = ["user__email"]


class UserIdentificationResource(resources.ModelResource):

    class Meta:
        model = UserIdentification
        fields = ["user__email"]


class SocialMediaFilter(admin.SimpleListFilter):
    title = _("Social Media")
    parameter_name = "social"

    def lookups(self, request, model_admin):
        return (
            ("social_media", _("Has Social Media")),
            ("no_social_media", _("No Social Media")),
        )

    def queryset(self, request, queryset):
        if self.value() == "no_social_media":
            return queryset.annotate(
                social_count=models.Count("user__socialaccount")
            ).filter(social_count=0)
        if self.value() == "social_media":
            return queryset.annotate(
                social_count=models.Count("user__socialaccount")
            ).exclude(social_count=0)
        return queryset


class TutorStatusFilter(admin.SimpleListFilter):
    title = _("Teaching Status")
    parameter_name = "stats"

    def lookups(self, request, model_admin):
        return (
            ("regular_user", _("Regular User")),
            ("tutor", _("Tutor")),
            ("referrer", _("Referrer")),
        )

    def queryset(self, request, queryset):
        if self.value() == "regular_user":
            return queryset.exclude(profile__application_status=UserProfile.VERIFIED)
        if self.value() == "tutor":
            return queryset.filter(profile__application_status=UserProfile.VERIFIED)
        if self.value() == "referrer":
            return queryset.filter(is_referrer=True)
        return queryset


class PhotoFilter(admin.SimpleListFilter):
    title = _("verify image")
    parameter_name = "image"

    def lookups(self, request, model_admin):
        return (
            ("verify_image", _("Can verify profile pic")),
            ("has_image", _("Uploaded an image")),
        )

    def queryset(self, request, queryset):
        if self.value() == "verify_image":
            return queryset.exclude(image=None).filter(image_approved=False)
        if self.value() == "has_image":
            return queryset.filter(image=None)
        return queryset


class TutorFilter(admin.SimpleListFilter):
    title = _("verified_tutor")
    parameter_name = "v_tutor"

    def lookups(self, request, model_admin):
        return (
            ("verified_tutor", _("Verified Tutor")),
            ("pending_tutor", _("Pending Tutor")),
            ("denied_tutor", _("Denied Tutor")),
        )

    def queryset(self, request, queryset):
        if self.value() == "verified_tutor":
            return queryset.filter(application_status=UserProfile.VERIFIED)
        elif self.value() == "pending_tutor":
            return queryset.filter(application_status=UserProfile.PENDING)
        elif self.value() == "denied_tutor":
            return queryset.filter(application_status=UserProfile.DENIED)
        else:
            return queryset


class VideoFilter(admin.SimpleListFilter):
    title = _("verify video")  # or use _('country') for translated title
    parameter_name = "video"

    def lookups(self, request, model_admin):
        return (("can_verify_video", _("Can verify video")),)

    def queryset(self, request, queryset):
        if self.value():
            return (
                queryset.exclude(video=None)
                .exclude(video="")
                .filter(video_approved=False)
            )
        else:
            return queryset


class CommonEntranceFilter(admin.SimpleListFilter):
    title = "Common Entrance"
    parameter_name = "common_entrance"

    def lookups(self, request, model_admin):
        return (("Yes", _("Taught Common Entrance")),)

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(answers__Primary__0="Yes")
        return queryset


class RegistrationStatusFilter(admin.SimpleListFilter):
    title = _("Registration Status")
    parameter_name = "registration_status"

    def lookups(self, request, model_admin):
        return (
            ("not_started", _("Not Started")),
            ("credentials", _("Credentials")),
            ("preferences", _("Preference")),
            ("agreement", _("Agreement")),
        )

    def queryset(self, request, queryset):
        if self.value() == "not_started":
            return queryset.filter(
                registration_level=0, application_status=UserProfile.NOT_APPLIED
            )
        if self.value() == "credentials":
            return queryset.filter(
                registration_level=1, application_status=UserProfile.BEGAN_APPLICATION
            )
        if self.value() == "preferences":
            return queryset.filter(
                registration_level=2, application_status=UserProfile.BEGAN_APPLICATION
            )
        if self.value() == "agreement":
            return queryset.filter(
                registration_level=3, application_status=UserProfile.BEGAN_APPLICATION
            )
        return queryset


class VerifiedTutorFilter(admin.SimpleListFilter):
    title = _("Verified Tutors")
    parameter_name = "verified"

    def lookups(self, request, model_admin):
        return (
            ("verified_tutors_ta", _("Verified Tutors TA")),
            ("verified_tutors_ha", _("Verified Tutors HA")),
        )

    def queryset(self, request, queryset):
        verified_t = queryset.filter(
            user__profile__application_status=UserProfile.VERIFIED
        )
        if self.value() == "verified_tutors_ta":
            return verified_t.filter(addr_type=Location.TUTOR_ADDRESS)
        if self.value() == "verified_tutors_ha":
            return verified_t.filter(addr_type=Location.HOME_ADDRESS)
        return queryset


class SocialMediaFilter(admin.SimpleListFilter):
    title = _("Social Media")
    parameter_name = "social"

    def lookups(self, request, model_admin):
        return (
            ("social_media", _("Has Social Media")),
            ("no_social_media", _("No Social Media")),
        )

    def queryset(self, request, queryset):
        if self.value() == "no_social_media":
            return queryset.annotate(
                social_count=models.Count("user__socialaccount")
            ).filter(social_count=0)
        if self.value() == "social_media":
            return queryset.annotate(
                social_count=models.Count("user__socialaccount")
            ).exclude(social_count=0)
        return queryset


class DateOfBirthFilter(admin.SimpleListFilter):
    title = _("Date of Birth")
    parameter_name = "dob2"

    def lookups(self, request, model_admin):
        return (("dob", _("Has DOB")), ("no_dob", _("No DOB")))

    def queryset(self, request, queryset):
        if self.value() == "dob":
            return queryset.exclude(dob=None)
        if self.value() == "no_dob":
            return queryset.filter(dob=None)
        return queryset


class AddressTypeFilter(admin.SimpleListFilter):
    title = _("Address Type")
    parameter_name = "add_type"

    def lookups(self, request, model_admin):
        return (
            ("home_address", _("Home address")),
            ("tutor_address", _("Tutor address")),
            ("neutral_address", _("Neutral address")),
        )

    def queryset(self, request, queryset):
        if self.value() == "home_address":
            return queryset.filter(addr_type=Location.USER_ADDRESS)
        if self.value() == "tutor_address":
            return queryset.filter(addr_type=Location.TUTOR_ADDRESS)
        if self.value() == "neutral_address":
            return queryset.filter(addr_type=Location.NEUTRAL_ADDRESS)
        return queryset


class NoVicinityFilter(admin.SimpleListFilter):
    title = _("No Vicinity")
    parameter_name = "vicinity"

    def lookups(self, request, model_admin):
        return (
            ("no_vicinity", _("No Vicinity")),
            ("has_vicinity", _("Has Vicinity")),
            ("no_long_lat", _("No longitude and lat")),
        )

    def queryset(self, request, queryset):
        if self.value() == "no_vicinity":
            return queryset.filter(vicinity=None)
        if self.value() == "has_vicinity":
            return queryset.exclude(vicinity=None)
        if self.value() == "no_long_lat":
            return queryset.filter(latitude=None, longitude=None)
        return queryset


class ActiveSubjectTutorFilter(admin.SimpleListFilter):
    title = _("Active Subject")
    parameter_name = "ac"

    def lookups(self, request, model_admin):
        return (("active", _("Has Active Subject")),)

    def queryset(self, request, queryset):
        if self.value() == "active":
            return queryset.with_active_skills()
        return queryset


class VerificationFilter(admin.SimpleListFilter):
    title = _("Verify ID")
    parameter_name = "certificate"

    def lookups(self, request, model_admin):
        return (("not_verified", _("ID not Verified")), ("verified", _("Verified ID")))

    def queryset(self, request, queryset):
        if self.value() == "not_verified":
            return queryset.filter(verified=False)
        if self.value() == "verified":
            return queryset.filter(verified=True)
        return queryset


class LocationFilter(admin.SimpleListFilter):
    title = _("By State")
    parameter_name = "state"

    def lookups(self, request, model_admin):
        return Location.NIGERIAN_STATES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(owner__location__state=self.value())
        return queryset


class LGAFilter(admin.SimpleListFilter):
    title = _("lga")
    parameter_name = "LGA"

    def lookups(self, request, model_admin):
        return (("has_lga", _("Has LGA")), ("no_lga", _("NO LGA")))

    def queryset(self, request, queryset):
        if self.value() == "has_lga":
            return queryset.exclude(lga=None)
        if self.value() == "no_lga":
            return queryset.filter(lga=None)
        return queryset


class HasRegionFilter(admin.SimpleListFilter):
    title = "Region"
    parameter_name = "region"

    def lookups(self, request, model_admin):
        tuples = tuple(Constituency.objects.values_list("name", "name"))
        return tuples + (("None", "No Region"), ("has_region", "Has Region"))

    def queryset(self, request, queryset):
        if self.value() == "has_region":
            return queryset.exclude(region=None)
        if self.value() != "None":
            return queryset.filter(region__name=self.value())
        if self.value() == "None":
            return queryset.filter(region=None)
            # return queryset.filter(id__in=list(ll))

        return queryset


def tutor_filter_status(field="user"):

    class VerifiedTutorFilter(admin.SimpleListFilter):
        title = _("Tutor Status")
        parameter_name = "tutor_status"

        def lookups(self, request, model_admin):
            return (("verified_tutors", _("Verified Tutors")),)

        def queryset(self, request, queryset):
            if self.value() == "verified_tutors":
                return queryset.filter(
                    **{
                        "{}__profile__application_status".format(
                            field
                        ): UserProfile.VERIFIED
                    }
                )
            return queryset

    return VerifiedTutorFilter


OnlyVerifiedTutorFilter = tutor_filter_status()


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
            return queryset.filter(user__profile__gender=UserProfile.MALE)
        if self.value() == "female_tutors":
            return queryset.filter(user__profile__gender=UserProfile.FEMALE)
        return queryset


def profile_picture_filter(user=True):

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
                if user:
                    return queryset.exclude(user__profile__image=None)
                else:
                    return queryset.exclude(profile__image=None)
            if self.value() == "no_profile_pic":
                if user:
                    return queryset.filter(user__profile__image=None)
                else:
                    return queryset.filter(profile__image=None)
            return queryset

    return HasProfilePicFilter22


HasProfilePicFilter = profile_picture_filter()


class PhoneNumberResource(resources.ModelResource):
    first_name = resources.Field()
    email = resources.Field()
    link = resources.Field()
    class Meta:
        model = PhoneNumber
        fields = ["number"]

    def dehydrate_first_name(self, user):
        return user.owner.first_name

    def dehydrate_email(self, user):
        return user.owner.email

    def dehydrate_link(self, user):
        return f"https://www.tuteria.com/api/tutors/redirect?slug={user.owner.slug}",


@admin.register(Constituency)
class ConstituencyAdmin(admin.ModelAdmin):
    list_display = ["name", "state", "areas", "related_with"]
    search_fields = ["name", "state", "areas"]
    list_filter = ["state"]


class identificationMixin(ExportMixin):
    resource_class = UserIdentificationResource

    def get_queryset(self, request):
        return (
            super(identificationMixin, self)
            .get_queryset(request)
            .prefetch_related("user__socialaccount_set")
        )

    def mark_id_as_verified(self, request, queryset):
        public_ids = [x.identity.public_id for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        users = [x.user for x in queryset.all()]
        UserIdentification.objects.filter(
            pk__in=queryset.values_list("pk", flat=True)
        ).update(verified=True, identity=None)
        # queryset.update(verified=True, identity=None)
        reward2 = Milestone.get_milestone(Milestone.VERIFIED_ID)
        for user in users:
            if user.tuteria_verified:
                UserMilestone.objects.get_or_create(user=user, milestone=reward2)

    def mark_id_as_rejected(self, request, queryset):
        public_ids = [x.identity.public_id for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        queryset.delete()

    def mark_user_profile_as_rejected(self, request, queryset):
        from users.tasks import re_upload_profile_pic

        user_ids = [x.user_id for x in queryset.all()]
        profiles = UserProfile.objects.filter(user_id__in=user_ids)
        profiles.mark_user_profile_as_rejected(True)
        # public_ids = [x.image.public_id for x in profiles.all()]
        # cloudinary.api.delete_resources(public_ids)
        # profiles.update(image=None, image_approved=False)
        # for x in user_ids:
        #     re_upload_profile_pic.delay(x)

    def remove_verification_images_for_verified_users(self, request, queryset):
        public_ids = [x.identity.public_id for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        queryset.update(identity=None)


@admin.register(UserIdentification)
class UserIdentificationAdmin(identificationMixin, admin.ModelAdmin):
    list_display = [
        "full_name",
        "email",
        "verified",
        "certificate",
        "profile_pic",
        "social_networks",
    ]
    list_filter = (
        VerificationFilter,
        OnlyVerifiedTutorFilter,
        SocialMediaFilter,
        HasProfilePicFilter,
    )
    search_fields = ["user__email"]
    actions = [
        "mark_id_as_verified",
        "mark_id_as_rejected",
        "mark_user_profile_as_rejected",
        "remove_verification_images_for_verified_users",
    ]
    form = UserIdentificationForm


class VerifiedTutorIdentificationAdmin(identificationMixin, admin.ModelAdmin):
    list_display = [
        "full_name",
        "email",
        "verified",
        "certificate",
        "profile_pic",
        "social_networks",
    ]
    search_fields = ["user__email"]
    actions = [
        "mark_id_as_verified",
        "mark_id_as_rejected",
        "mark_user_profile_as_rejected",
        "remove_verification_images_for_verified_users",
    ]

    def get_queryset(self, request):
        return (
            super(VerifiedTutorIdentificationAdmin, self)
            .get_queryset(request)
            .filter(user__profile__application_status=UserProfile.VERIFIED)
            .annotate(social_count=models.Count("user__socialaccount"))
            .filter(verified=False)
            .exclude(user__profile__image=None)
            .filter(social_count__gt=0)
        )


utils.create_modeladmin(
    VerifiedTutorIdentificationAdmin, UserIdentification, "VerifiedTutorIdentification"
)


@admin.register(PhoneNumber)
class PhoneNumberAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ["owner", "number", "verified", "user_name"]
    search_fields = ["owner__email", "number"]
    form = PhoneNumberAutocompleteForm
    list_filter = [tutor_filter_status(field="owner"), LocationFilter]
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


@admin.register(Location)
class LocationAdmin(ExportMixin,admin.ModelAdmin):
    list_display = (
        "email",
        "address",
        "longitude",
        "latitude",
        "vicinity",
        "region_name",
        "state",
    )
    resource_class= EmailResource
    form = LocationForm
    search_fields = ("address", "state", "user__email")
    # list_editable = ('longitude','latitude','vicinity')
    list_filter = (
        OnlyVerifiedTutorFilter,
        HasRegionFilter,
        GenderFilter,
        AddressTypeFilter,
        NoVicinityFilter,
        ActiveSubjectTutorFilter,
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
            ("Successfully updated vicinity for %s rows") % (count),
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


class TutorLocationAdmin(LocationAdmin):
    list_filter = (LGAFilter,) + LocationAdmin.list_filter

    def get_queryset(self, request):
        return (
            super(TutorLocationAdmin, self)
            .get_queryset(request)
            .filter(user__profile__application_status=UserProfile.VERIFIED)
        )


utils.create_modeladmin(TutorLocationAdmin, Location, name="TutorLocation")


@admin.register(UserProfile)
class UserProfileAdmin(AdminVideoMixin, admin.ModelAdmin):
    # form = UserProfileForm
    search_fields = (
        "^user__email",
        "dob",
        "user__first_name",
        "user__last_name",
        "tutor_description",
        "description",
    )
    ordering = ("user",)
    form = UserProfileSpecialForm
    list_display = ("user", "video", "age", "state", "gender")
    list_select_related = ("user",)
    list_filter = (
        VideoFilter,
        PhotoFilter,
        CommonEntranceFilter,
        TutorFilter,
        RegistrationStatusFilter,
        DateOfBirthFilter,
    )

    actions = [
        "verify_video",
        "verify_image",
        "dissaprove_image",
        "reactivate_denied_tutors",
        "send_email_to_all_users",
    ]

    def verify_video(self, request, queryset):
        for vv in queryset.all():
            vv.approve_video()
            # queryset.update(video_approved=True)

    verify_video.short_description = "Mark Video as Verified"

    def send_email_to_all_users(self, request, queryset):
        from users.tasks import email_to_all_verified_tutors

        for x in queryset.exclude(blacklist=True).all():
            email_to_all_verified_tutors.delay(x.email)

    def get_search_results(self, request, queryset, search_term):
        """
        Returns a tuple containing a queryset to implement the search,
        and a boolean indicating if the results may contain duplicates.
        """
        # Apply keyword searches.
        def construct_search(field_name):
            if field_name.startswith("^"):
                return "%s__istartswith" % field_name[1:]
            elif field_name.startswith("="):
                return "%s__iexact" % field_name[1:]
            elif field_name.startswith("@"):
                return "%s__search" % field_name[1:]
            else:
                return "%s__iregex" % field_name

        use_distinct = False
        search_fields = self.get_search_fields(request)
        if search_fields and search_term:
            orm_lookups = [
                construct_search(str(search_field)) for search_field in search_fields
            ]
            for bit in search_term.split():
                or_queries = []
                for orm_lookup in orm_lookups:
                    if "__iregex" in orm_lookup:
                        new_bit = r"\y{0}\y".format(bit)
                        or_queries.append(models.Q(**{orm_lookup: new_bit}))
                    else:
                        or_queries.append(models.Q(**{orm_lookup: bit}))
                # or_queries = [models.Q(**{orm_lookup: bit})
                #               for orm_lookup in orm_lookups]
                queryset = queryset.filter(reduce(operator.or_, or_queries))
            if not use_distinct:
                for search_spec in orm_lookups:
                    if lookup_needs_distinct(self.opts, search_spec):
                        use_distinct = True
                        break

        return queryset, use_distinct

    def state(self, obj):
        add = obj.user.home_address
        if add:
            return add.state
        return None

    def verify_image(self, request, queryset):
        queryset.update(image_approved=True)

    def dissaprove_image(self, request, queryset):
        users = [u.user_id for u in queryset.all()]
        queryset.update(
            application_status=UserProfile.DENIED,
            application_trial=3,
            date_denied=timezone.now(),
            image=None,
        )
        User.objects.filter(id__in=users).update(flagged=True)

    dissaprove_image.short_description = "Disaprove and flag users"

    verify_image.short_description = "Mark Image as Verified"

    def reactivate_denied_tutors(self, request, queryset):
        tasks.reactivate_valid_denied_users.delay()

    #
    # inlines = [
    # UserPreferenceAdminInline,
    # ]

    def age(self, obj):
        return obj.age


class UserProfileAdminInline(admin.TabularInline):
    model = UserProfile
    form = UserProfileForm


class UserLocationAdminInline(admin.TabularInline):
    model = Location
    # form =


@admin.register(User)
class UserAdmin(MUserAdmin, HijackUserAdminMixin):
    list_select_related = ("profile",)
    """The project uses a custom User model, so it uses a custom User admin model.

    Some related notes at:
    https://github.com/dabapps/django-email-as-username/blob/master/emailusernames/admin.py

    And:
    .../lib/python2.7/site-packages/django/contrib/auth/admin.py
    """
    list_filter = HijackUserAdmin.list_filter + (TutorStatusFilter,)
    inlines = [
        UserProfileAdminInline,
        # UserLocationAdminInline
    ]

    # readonly_fields = ('private_uuid', 'public_id')

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
        (_("Others"),{"fields": ("data_dump",)})
        # (_('Ids'), {'fields': ('private_uuid', 'public_id')}),
    )

    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )
    list_display = (
        "email",
        "first_name",
        "last_name",
        "username",
        "is_staff",
        "hijack_field",
        "slug",
    )
    search_fields = ("first_name", "last_name", "username", "email", "location__state","slug")
    ordering = ("email",)

    form = UserAdminForm


# *** NOTE ***
# As the site uses email instead of username, I'm changing how a User object
# displays or identifies itself in admin. The default in Django (file is
# lib/python2.7/site-packages/django/contrib/auth/models.py) is
#
# def __str__(self):
# return self.get_username()
#
# def natural_key(self):
# return (self.get_username(),)
#
# I'm overriding that a cheap way. I'm not sure if I should replace the entire
# User object ... might be better.
#
# User.__unicode__ = lambda(u): u.email
# User.natural_key = lambda(u): (u.email,)

# admin.site.unregister(DjangoDefaultUser)
