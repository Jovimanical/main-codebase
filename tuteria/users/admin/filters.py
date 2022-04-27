import itertools
from _operator import or_
from functools import reduce

from django.contrib import admin
from django.db import models
from django.db.models import Count, Sum, Case, When, IntegerField, F
from django.utils.translation import ugettext_lazy as _

from skills.models import TutorSkill, Skill, Category
from users.models import UserProfile, Constituency, Location, states, TutorApplicant


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


class DateOfBirthFilter(admin.SimpleListFilter):
    title = _("Date of Birth")
    parameter_name = "dob2"

    def lookups(self, request, model_admin):
        return (("dob", _("Has DOB")), ("no_dob", _("No DOB")))

    def queryset(self, request, queryset):
        """

        :param request: django.http.request
        :type queryset: django.models.QuerySet
        """
        if self.value() == "dob":
            return queryset.exclude(profile__dob=None)
        if self.value() == "no_dob":
            return queryset.filter(profile__dob=None)
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
                profile__registration_level=0,
                profile__application_status=UserProfile.NOT_APPLIED,
            )
        if self.value() == "credentials":
            return queryset.filter(
                profile__registration_level=1,
                profile__application_status=UserProfile.BEGAN_APPLICATION,
            )
        if self.value() == "preferences":
            return queryset.filter(
                profile__registration_level=2,
                profile__application_status=UserProfile.BEGAN_APPLICATION,
            )
        if self.value() == "agreement":
            return queryset.filter(
                profile__registration_level=3,
                profile__application_status=UserProfile.BEGAN_APPLICATION,
            )
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
            return queryset.filter(profile__application_status=UserProfile.VERIFIED)
        elif self.value() == "pending_tutor":
            return queryset.filter(profile__application_status=UserProfile.PENDING)
        elif self.value() == "denied_tutor":
            return queryset.filter(profile__application_status=UserProfile.DENIED)
        else:
            return queryset


class CommonEntranceFilter(admin.SimpleListFilter):
    title = "Common Entrance"
    parameter_name = "common_entrance"

    def lookups(self, request, model_admin):
        return (("Yes", _("Taught Common Entrance")),)

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(profile__answers__Primary__0="Yes")
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
            return queryset.exclude(profile__image=None).filter(
                profile__image_approved=False
            )
        if self.value() == "has_image":
            return queryset.filter(profile__image=None)
        return queryset


class VideoFilter(admin.SimpleListFilter):
    title = _("verify video")  # or use _('country') for translated title
    parameter_name = "video"

    def lookups(self, request, model_admin):
        return (("can_verify_video", _("Can verify video")),)

    def queryset(self, request, queryset):
        if self.value():
            return (
                queryset.exclude(profile__video=None)
                .exclude(profile__video="")
                .filter(profile__video_approved=False)
            )
        else:
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


class LocationFilter(admin.SimpleListFilter):
    title = _("By State")
    parameter_name = "state"

    def lookups(self, request, model_admin):
        return Location.NIGERIAN_STATES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(owner__location__state=self.value())
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


class ActiveSkillFilter(admin.SimpleListFilter):
    title = _("Active Skill")
    parameter_name = "active_sub"

    def lookups(self, request, model_admin):
        return (("active", _("has active subject")),)

    def queryset(self, request, queryset):
        if self.value() == "active":
            return queryset.filter(active_skill__gt=0)
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


class HasBeenBookedFilter(admin.SimpleListFilter):
    title = "Booked"
    parameter_name = "no_of_bookings"

    def lookups(self, request, model_admin):
        return (("Booked", _("Booked")), ("Not Booked", _("Not Booked")))

    def queryset(self, request, queryset):
        new_queryset = queryset.annotate(booking_count=models.Count("t_bookings"))
        if self.value() == "Booked":
            return new_queryset.filter(booking_count__gt=0)
        if self.value() == "Not Booked":
            return new_queryset.filter(booking_count=0)
        return new_queryset


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


VerificationFilter2 = get_verification_filter()


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


HasProfilePicFilter2 = profile_picture_filter()


class StateFilter2(admin.SimpleListFilter):
    title = _("By State")
    parameter_name = "state"

    def lookups(self, request, model_admin):
        return tuple([(x, _(x)) for x in states])

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(
                location__state__istartswith=self.value(), location__addr_type=2
            )
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


class CurriculumFilter(admin.SimpleListFilter):
    title = _("By Curriculum")
    parameter_name = "curriculum"

    def lookups(self, request, model_admin):
        return UserProfile.CURRICULUM

    def queryset(self, request, queryset):
        if self.value():
            pks = [x.id for x in queryset.all()]
            profiles = UserProfile.objects.filter(
                user_id__in=pks, curriculum_used__contains=[self.value()]
            ).values_list("user_id", flat=True)
            return queryset.filter(id__in=profiles)
        return queryset


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


# OnlyVerifiedTutorFilter = admin_filter_for_verified_tutors()


class TutorMeetingFilter(admin.SimpleListFilter):
    title = "Filters"
    parameter_name = "met_with_client"

    def lookups(self, request, model_admin):
        return (
            ("met_with_client", _("Met with client")),
            ("led_to_booking", _("Led to booking")),
        )

    def queryset(self, request, queryset):
        if self.value() == "met_with_client":
            return queryset.filter(met_with_client=True)
        if self.value() == "led_to_booking":
            return queryset.filter(led_to_booking=True)
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


class Location2Filter(admin.SimpleListFilter):
    title = _("By State")
    parameter_name = "state"

    def lookups(self, request, model_admin):
        return Location.NIGERIAN_STATES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(tutor__location__state=self.value())
        return queryset


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


class ActiveSkillFilter2(admin.SimpleListFilter):
    title = _("Active Skills")
    parameter_name = "active_skill"

    def lookups(self, request, model_admin):
        return (("ac_skill", _("Order active skills")),)

    def queryset(self, request, queryset):
        if self.value() == "ac_skill":
            return queryset.with_tutor().order_by("-active_skills")
        return queryset
