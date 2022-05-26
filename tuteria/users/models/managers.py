from __future__ import absolute_import, division, print_function
from builtins import (
    super,
    # zip, round, input, int, pow, object)bytes, str, open, ,
    # range,
)

import logging
import pdb
from operator import or_
from dateutil.relativedelta import relativedelta
from django.contrib.auth.models import BaseUserManager
from django.db import models
from django.utils import timezone


from .querysets import (
    UserProfileActionsQuerySet,
    CustomUserQuerySet,
    LocationQuerySet,
    UserMilestoneQuerySet,
    TutorUserManagerQuerySet,
)
from ..mixins import TutorProfileMixin, LocationMixin

logger = logging.getLogger(__name__)


class UserMilestoneManager(models.Manager):
    def get_queryset(self):
        return UserMilestoneQuerySet(self.model, using=self._db)

    def has_milestone(self, milestone):
        return self.get_queryset().has_milestone(milestone)


class NewApplicantUserManager(BaseUserManager):
    def get_queryset(self):
        return CustomUserQuerySet(self.model, using=self._db).get_new_applicants()


class CustomUserManager(BaseUserManager):
    def get_queryset(self):
        return CustomUserQuerySet(self.model, using=self._db)

    def customers(self,*args, **kwargs):
        return self.get_queryset().customers(*args, **kwargs)

    def get_new_applicants(self):
        return self.get_queryset().get_new_applicants()

    def first_5_verified_skills(self):
        return self.get_queryset().first_5_verified_skills()

    def first_booking(self):
        return self.get_queryset().first_booking()

    def _create_user(self, email, password, is_staff, is_superuser, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        now = timezone.now()
        if not email:
            raise ValueError("The given email must be set")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            is_staff=is_staff,
            is_active=True,
            is_superuser=is_superuser,
            last_login=now,
            date_joined=now,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def with_locations(self):
        return self.get_queryset().with_locations()

    def create_user(self, email, password=None, **extra_fields):
        return self._create_user(email, password, False, False, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        return self._create_user(email, password, True, True, **extra_fields)

    def potentital_tutors_not_applied(self):
        return (
            self.get_queryset()
            .filter(profile__application_status=0)
            .exclude(profile__dob=None)
        )

    def not_rewarded_for_milestone(self, milestone_name):
        return self.get_queryset().exclude(
            milestones__milestone__condition=milestone_name
        )

    def qualifies_for_requests(self, req_skills, state, gender):
        return self.get_queryset().teaches_skill(req_skills, state, gender)

    def around_location(self, locations, radius=5):
        from users.models import Location

        z = [
            Location.objects.nearby_locations(
                round(x.latitude, 4), round(x.longitude, 4), radius
            ).values_list("user_id", flat=True)
            for x in locations
        ]
        remaining = list(set([x for y in z for x in y]))
        return self.get_queryset().filter(id__in=remaining)

    def in_the_same_vicinity(
        self, req_skills, locations, state, gender, active=True, radius=5
    ):
        from users.models import Location

        # z = [Location.objects.nearby_locations(round(x.latitude, 4), round(
        #     x.longitude, 4), 10).values_list('user_id', flat=True) for x in locations]
        # remaining = list(set([x for y in z for x in y]))
        locations2 = Location.objects.filter(state__icontains=state).values_list(
            "user_id", flat=True
        )

        queryset = self.get_queryset()
        if locations:
            queryset = self.around_location(locations, radius=radius)
        else:
            queryset = queryset.filter(id__in=locations2)
        if active:
            return queryset.in_the_same_vicinity2(req_skills, state, gender)
        return queryset.in_the_same_vicinity(req_skills, state, gender)
        # return self.get_queryset().filter(id__in=remaining).in_the_same_vicinity(req_skills, state, gender)

    def tutors_in_level(self, level):
        return self.get_queryset().tutors_in_level(level)

    def users_with_bookings(self):
        return self.get_queryset().users_with_bookings()

    def users_who_booked_classes(self):
        return self.get_queryset().users_who_booked_classes()

    def stuck_potential_tutors(self):
        return self.get_queryset().stuck_potential_tutors()

    def tutors_with_no_subjects(self):
        return self.get_queryset().t_with_no_subjects()

    def potential_customers(self):
        return self.get_queryset().potiential_customers()

    def get_duplicate_users(self):
        return self.get_queryset().get_duplicate_users()



class PhoneNumberManager(models.Manager):
    def add_phone_number(self, user, phone_no, confirm=False):
        try:
            phone_number = self.get(owner=user, number__iexact=phone_no)
        except self.model.DoesNotExist:
            phone_number = self.create(owner=user, number=phone_no)
            # if confirm:
            # phone_number.send_confirmation(request,
            # signup=signup)
        return phone_number

    def get_primary(self):
        return self.get_queryset().filter(primary=True).first()


class LocationManager(models.Manager):
    def get_queryset(self):
        return LocationQuerySet(self.model, using=self._db)

    def vicinity(self):
        return self.get_queryset().home_address().locality

    def without_lga(self):
        return self.get_queryset().filter(lga=None)

    def home_address(self):
        addr = self.get_queryset().home_address()
        if addr is None:
            addr = self.get_queryset().first()
        return addr

    def actual_tutor_address(self):
        addr = self.get_queryset().filter(addr_type=LocationMixin.TUTOR_ADDRESS).first()
        if addr:
            return addr
        return self.home_address()

    def tutor_address(self):
        addr = self.get_queryset().all()
        if len(addr) > 1:
            return addr.last()
        return None

    def users_with_constituencies(self, region):
        return self.get_queryset().users_with_constituencies(region)

    def ordered_tutor_locations(self, tutor_ids, **kwargs):
        """:return Tutor Address Location in the order the tutors where passed"""
        clauses = " ".join(
            ["WHEN user_id=%s THEN %s" % (pk, i) for i, pk in enumerate(tutor_ids)]
        )
        ordering = "CASE %s END" % clauses
        locations = (
            self.get_queryset()
            .filter(user__in=tutor_ids, addr_type=LocationMixin.TUTOR_ADDRESS)
            .all()
        )
        if kwargs.get("coordinate", None):
            locations = locations.nearby_locations2(**kwargs["coordinate"])
        return locations.extra(select={"ordering": ordering}, order_by=("ordering",))

    def second_action(self, location, radius=30, state="Lagos"):
        lc = LocationMixin.get_coord(location)
        if lc:
            logger.info(lc)
            logger.info(lc.latitude)
            logger.info(lc.longitude)
            subquery = self.get_queryset().nearby_locations(
                lc.latitude, lc.longitude, radius
            )
        else:
            subquery = self.get_queryset().filter(state__istartswith=state)
        return subquery

    def get_vicinities(self, search_input, state):
        return self.get_queryset().get_vicinities(search_input, state)

    def nearby_locations(self, lat, lng, radius):
        return self.get_queryset().nearby_locations(lat, lng, radius)

    def by_distance(
        self, location=None, latitude=None, longitude=None, radius=30, state="Lagos"
    ):
        if latitude and longitude:
            try:
                subquery = self.get_queryset().nearby_locations(
                    float(latitude), float(longitude), radius
                )
            except ValueError:
                subquery = self.second_action(location, radius, state)
        else:
            # slow query
            subquery = self.second_action(location, radius, state)
        return subquery.filter(addr_type=LocationMixin.TUTOR_ADDRESS)

    def by_distance2(self, location=None, latitude=None, longitude=None):
        if latitude and longitude:
            subquery = (latitude, longitude)
        else:
            # slow query
            # lc = Location.get_coordinate(location)
            lc = LocationMixin.get_coord(location)
            if lc:
                logger.info(lc)
                logger.info(lc.latitude)
                logger.info(lc.longitude)
                subquery = (lc.latitude, lc.longitude)
            else:
                subquery = (None, None)
        return subquery

    def without_distances(self):
        return self.get_queryset().without_distances()


class TutorManager(CustomUserManager):
    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .select_related("profile")
            .filter(profile__application_status=TutorProfileMixin.VERIFIED)
        )


class UserProfileManager(models.Manager):
    def get_queryset(self):
        return UserProfileActionsQuerySet(self.model, using=self._db)

    def statistics_admin(self):
        return self.get_queryset().statistics_admin()

    def marked_as_verified(self):
        return self.get_queryset().filter(
            application_status=TutorProfileMixin.MARKED_AS_VERIFIED
        )

    def marked_as_denied(self):
        return self.get_queryset().filter(
            application_status=TutorProfileMixin.MARKED_AS_DENIED
        )

    def ninety_days_passed_users(self, days=90):
        today = timezone.now()
        thirty_days_ago = today - relativedelta(days=days)
        return (
            self.get_queryset()
            .filter(
                application_status=TutorProfileMixin.DENIED, application_trial__lt=3
            )
            .filter(
                date_denied__year=thirty_days_ago.year,
                date_denied__month=thirty_days_ago.month,
            )
            .extra(
                where=["extract( HOUR FROM date_denied ) <= %s"],
                params=[thirty_days_ago.day],
            )
        )


class TutorUserManager(models.Manager):
    def get_queryset(self):
        return (
            TutorUserManagerQuerySet(self.model, using=self._db)
            .select_related("user")
            .filter(application_status=TutorProfileMixin.PENDING)
        )

    def been_verified(self):
        return (
            super()
            .get_queryset()
            .select_related("user__identifications")
            .filter(user__identifications__verified=True)
        )

    def pending_but_verified(self):
        return (
            self.get_queryset().select_related("user__identifications").been_verified()
        )


class VerifiedTutorManager(UserProfileManager):
    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(application_status=TutorProfileMixin.VERIFIED)
            .prefetch_related("user__tutorskill_set")
        )

    def with_skill_count(self):
        return self.get_queryset().raw(
            """
            SELECT "users_userprofile"."created", 
                SUM(CASE WHEN "skills_tutorskill".status=1 THEN 1 ELSE 0 END) AS "pending",
                SUM(CASE WHEN "skills_tutorskill".status=2 THEN 1 ELSE 0 END) AS "active",
                SUM(CASE WHEN "skills_tutorskill".status=3 THEN 1 ELSE 0 END) AS "suspended",
                SUM(CASE WHEN "skills_tutorskill".status=4 THEN 1 ELSE 0 END) AS "denied",
                SUM(CASE WHEN "skills_tutorskill".status=5 THEN 1 ELSE 0 END) AS "modification", 
                "users_userprofile"."modified", "users_userprofile"."user_id", "users_userprofile"."application_status", 
                "users_userprofile"."application_trial", "users_userprofile"."registration_level", "users_userprofile"."date_denied",

                "users_userprofile"."description", "users_userprofile"."description_markup_type", "users_userprofile"."gender", 
                "users_userprofile"."_description_rendered", "users_userprofile"."dob", "users_userprofile"."image", "users_userprofile"."video", 
                "users_userprofile"."video_approved", "users_userprofile"."image_approved", "users_userprofile"."hours", "users_userprofile"."days", 
                "users_userprofile"."allow_monthly", "users_userprofile"."cancellation", "users_userprofile"."tutoring_address", 
                "users_userprofile"."tutoring_distance", "users_userprofile"."response_time", "users_userprofile"."booking_prep", 
                "users_userprofile"."good_fit", "users_userprofile"."terms_and_conditions", "users_userprofile"."address_reason", 
                "users_userprofile"."tutor_description", "users_userprofile"."interview_slot", "users_userprofile"."background_check", 
                "users_userprofile"."level", COUNT("skills_tutorskill"."id") AS "user__tutorskill__count", "auth_user"."id", "auth_user"."password", 
                "auth_user"."last_login", "auth_user"."is_superuser", "auth_user"."email", "auth_user"."first_name", "auth_user"."last_name", 
                "auth_user"."username", "auth_user"."is_staff", "auth_user"."is_active", "auth_user"."date_joined", "auth_user"."country", 
                "auth_user"."slug", "auth_user"."confirmed_date", "auth_user"."tuteria_points", "auth_user"."tutor_intent", "auth_user"."background_check_consent", 
                "auth_user"."last_visit", "auth_user"."submitted_verification", "auth_user"."flagged", "auth_user"."is_teacher" 
                FROM "users_userprofile" INNER JOIN "auth_user" ON ( "users_userprofile"."user_id" = "auth_user"."id" ) 
                LEFT OUTER JOIN "skills_tutorskill" ON ( "auth_user"."id" = "skills_tutorskill"."tutor_id" ) 
                WHERE "users_userprofile"."application_status" = 3 
                GROUP BY "users_userprofile"."created", "users_userprofile"."modified", "users_userprofile"."user_id", "users_userprofile"."application_status", "users_userprofile"."application_trial", "users_userprofile"."registration_level", "users_userprofile"."date_denied", "users_userprofile"."description", "users_userprofile"."description_markup_type", "users_userprofile"."gender", "users_userprofile"."_description_rendered", "users_userprofile"."dob", "users_userprofile"."image", "users_userprofile"."video", "users_userprofile"."video_approved", "users_userprofile"."image_approved", "users_userprofile"."hours", "users_userprofile"."days", "users_userprofile"."allow_monthly", "users_userprofile"."cancellation", "users_userprofile"."tutoring_address", "users_userprofile"."tutoring_distance", "users_userprofile"."response_time", "users_userprofile"."booking_prep", "users_userprofile"."good_fit", "users_userprofile"."terms_and_conditions", "users_userprofile"."address_reason", "users_userprofile"."tutor_description", "users_userprofile"."interview_slot", "users_userprofile"."background_check", "users_userprofile"."level", "auth_user"."id", "auth_user"."password", "auth_user"."last_login", "auth_user"."is_superuser", "auth_user"."email", "auth_user"."first_name", "auth_user"."last_name", "auth_user"."username", "auth_user"."is_staff", "auth_user"."is_active", "auth_user"."date_joined", "auth_user"."country", "auth_user"."slug", "auth_user"."confirmed_date", "auth_user"."tuteria_points", "auth_user"."tutor_intent", "auth_user"."background_check_consent", "auth_user"."last_visit", "auth_user"."submitted_verification", "auth_user"."flagged", "auth_user"."is_teacher" ORDER BY "users_userprofile"."modified" DESC, "users_userprofile"."created" DESC

            """
        )
