# -*- coding: utf-8 -*-
import datetime
import itertools
import logging
from django.db import transaction

from allauth.account.models import EmailAddress
from allauth.account.signals import email_confirmed
from allauth.socialaccount.models import (
    SocialApp,
    SocialAccount,
    SocialToken,
    SocialLogin,
)
from django.db.utils import IntegrityError
from allauth.socialaccount.signals import pre_social_login
from autoslug import AutoSlugField
from cloudinary.models import CloudinaryField
from cloudinary import CloudinaryImage
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.urls import reverse
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.utils.functional import cached_property
from django.db import models
from django.db.models.expressions import RawSQL
from django.db.models.signals import post_save
from django.contrib.postgres.fields import ArrayField, JSONField

# Create your models here.
from django_countries.fields import CountryField

# from django_extensions.db.fields import AutoSlugField
# from django_extensions.db.fields.json import JSONField
from django_extensions.db.models import TimeStampedModel
from embed_video.fields import EmbedVideoField
from geopy import GoogleV3
from geopy.distance import vincenty
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from markupfield.fields import MarkupField
from phonenumber_field.modelfields import PhoneNumberField
import pytz
from ..mixins import TuteriaUserMixin, TutorProfileMixin, LocationMixin
from ..policy import Policy
from ..levels import TuteriaLevel
from registration.interview import TutorInterview
from .managers import (
    CustomUserManager,
    PhoneNumberManager,
    LocationManager,
    UserMilestoneManager,
    TutorManager,
    UserProfileManager,
    TutorUserManager,
    VerifiedTutorManager,
)
from ..location_api import DistanceCalculator
from ssl import SSLError
from config.signals import (
    populate_possible_tutors,
    create_subjects,
    tutor_applicant_email_list,
    verified_tutor_email_list,
)
import requests
from django.conf import settings


from ..related_subjects import get_related_subjects

logger = logging.getLogger(__name__)


def display_name(x):
    return x.first_name


class User(TuteriaUserMixin, AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(
        _("email address"), blank=False, unique=True, db_index=True
    )
    first_name = models.CharField(
        _("first name"),
        max_length=40,
        blank=True,
        null=True,
        unique=False,
        db_index=True,
    )
    last_name = models.CharField(
        _("last name"),
        max_length=40,
        blank=True,
        null=True,
        unique=False,
        db_index=True,
    )
    username = models.CharField(
        _("display name"), max_length=30, blank=True, null=True, unique=False
    )
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=("Designates whether the user can log into this admin " "site."),
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as "
            "active. Unselect this instead of deleting accounts."
        ),
    )
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)
    country = CountryField(null=True)
    slug = AutoSlugField(populate_from="sluger", unique=True, sep="", editable=True)
    confirmed_date = models.DateTimeField(null=True, blank=True)
    # rating for each user
    tuteria_points = models.IntegerField(default=0)
    tutor_intent = models.BooleanField(_("intent to tutor"), default=False)
    background_check_consent = models.BooleanField(_("consent"), default=False)
    last_visit = models.DateTimeField(null=True, blank=True)
    submitted_verification = models.BooleanField(default=False)
    flagged = models.BooleanField(default=False)
    is_teacher = models.NullBooleanField()
    is_referrer = models.BooleanField(default=False)
    recieve_email = models.NullBooleanField()
    pay_with_bank = models.NullBooleanField(default=True)
    drip_counter = models.IntegerField(default=0)
    drip_date = models.DateTimeField(null=True, blank=True)
    teach_online = models.BooleanField(default=False)
    approved_profile = models.BooleanField(default=False)
    remarks = models.TextField(null=True, blank=True)
    # request specific fields
    # request_info = models.ForeignKey('external.BaseRequestTutor',
    # related_name='likely_tutors', null=True, blank=True)
    no_of_subjects_found = models.IntegerField(default=1)
    # payment credentials
    paystack_customer_code = models.CharField(max_length=50, blank=True, null=True)

    data_dump = JSONField(null=True, blank=True)
    # request_dump = JSONField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        db_table = "auth_user"
        abstract = False
        swappable = "AUTH_USER_MODEL"

    @property
    def sluger(self):
        if self.first_name and self.last_name:
            return self.first_name + self.last_name[0]
        return str(self.email).split("@")[0]

    def save_email_and_social_account(self, extra_data, social_account, token):
        EmailAddress.objects.get_or_create(email=self.email, verified=True, user=self)
        app = SocialApp.objects.get(name__iexact=social_account)

        social_account, _ = SocialAccount.objects.update_or_create(
            provider=social_account, uid=extra_data["id"], defaults={"user": self}
        )

        social_token = SocialToken.objects.filter(
            **{"account": social_account, "app": app}
        ).first()
        if not social_token:
            social_token = SocialToken.objects.create(
                token=token, **{"account": social_account, "app": app}
            )

        login = SocialLogin(user=self, account=social_account, token=social_token)
        # pre_social_login.send(None, request=request, sociallogin=login)

    @classmethod
    def create_social_account_user(cls, data, extra_data):

        user, _ = cls.objects.get_or_create(
            email=data["email"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            tutor_intent=True,
        )
        user.save_email_and_social_account(extra_data, "google", extra_data["token"])
        return user

    @classmethod
    def create_fb_user(cls, data):
        user = cls.objects.get_or_create(
            email=data["email"], first_name=data["name"], tutor_intent=True
        )
        return user

    @staticmethod
    def get_admin_wallet():
        admin, _ = User.objects.get_or_create(
            first_name="Admin Wallet",
            last_name="Records",
            is_staff=True,
            email="admin@wallet.com",
        )
        from wallet.models import Wallet

        admin_wallet, _ = Wallet.objects.get_or_create(owner=admin, wallet_type="admin")
        return admin_wallet

    @staticmethod
    def get_admin():
        return User.objects.filter(is_staff=True).first()

    def verify_email(self):
        instance: EmailAddress = EmailAddress.objects.filter(email=self.email).first()
        if not instance:
            instance = EmailAddress.objects.create(user=self, email=self.email)
        instance.verified = True
        instance.save()

    @cached_property
    def email_verified(self):
        return self.email_verified_func()

    def email_verified_func(self):
        return EmailAddress.objects.filter(user=self, verified=True).exists()

    @cached_property
    def id_verified(self):
        return self.id_verified_func()

    def id_verified_func(self):
        return len([x for x in self.all_identity_func() if x.verified]) > 0
        # return UserIdentification.objects.filter(
        #     user=self, doc_type=UserIdentification.IDENTITY, verified=True).exists()

    def deny_teaching_status(self, delete_subjects=False):
        tutor_profile = self.profile
        tutor_profile.application_status = UserProfile.DENIED
        tutor_profile.application_trial = 3
        tutor_profile.save()
        if delete_subjects:
            self.tutorskill_set.all().delete()
        else:
            self.tutorskill_set.update(status=4)  # TutorSkill.DENIED

    @cached_property
    def identity(self):
        return self.all_identity[0] if len(self.all_identity) > 0 else None
        # return UserIdentification.objects.filter(
        #     user=self, doc_type=UserIdentification.IDENTITY
        # ).first()

    @cached_property
    def all_identity(self):
        return self.all_identity_func()

    def all_identity_func(self):
        return UserIdentification.objects.filter(
            user=self, doc_type=UserIdentification.IDENTITY
        )

    @property
    def id_pending(self):
        return UserIdentification.objects.filter(
            user=self, doc_type=UserIdentification.IDENTITY
        ).first()

    @property
    def tutor_verified(self):
        return self.profile.application_status == UserProfile.VERIFIED

    def reputation(self):
        one_time_points = (
            self.milestones.aggregate(models.Sum("milestone__score"))[
                "milestone__score__sum"
            ]
            or 0
        )
        return one_time_points + self.tuteria_points

    def save(self, *args, **kwargs):
        if not self.username:
            self.guess_display_name()
        try:
            return super(User, self).save(*args, **kwargs)
        except IntegrityError:
            return self

    def get_absolute_url(self):
        return reverse("users:profile", args=[self.slug])

    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        last_name = self.last_name or " "
        full_name = "%s %s" % (self.first_name, last_name[0])
        return full_name.strip()

    def get_short_name(self):
        "Returns the short name for the user."
        if self.first_name:
            return self.first_name.title()
        return self.sluger

    def guess_display_name(self):
        """Set a display name, if one isn't already set."""
        if self.username:
            return
        dn = ""
        first_name = ""
        if self.first_name:
            first_name = self.first_name.split(" ")[0]
        if self.first_name and self.last_name:
            dn = "%s %s" % (
                first_name.title(),
                self.last_name[0].title(),
            )  # like "Andrew E"
        elif self.first_name and len(self.first_name) > 14:
            dn = first_name
        self.username = dn.strip()[:14]

    def __str__(self):
        return self.email

    def natural_key(self):
        return (self.email,)


class UserIdentificationManager(models.Manager):
    def denied(self):
        return self.get_queryset().filter(
            doc_type=UserIdentification.IDENTITY, require_modification=True
        )

    def pending(self):
        return self.get_queryset().filter(require_modification=False, verified=False)


class UserIdentification(TimeStampedModel):
    IDENTITY = "identity"
    DOCUMENT_TYPES = ((IDENTITY, "identity"),)
    identity = CloudinaryField(
        max_length=100, verbose_name=_("Identification Document"), null=True
    )
    verified = models.BooleanField(default=False)
    user = models.ForeignKey(
        User,
        verbose_name="user",
        related_name="identifications",
        on_delete=models.CASCADE,
    )
    doc_type = models.CharField(default=IDENTITY, choices=DOCUMENT_TYPES, max_length=30)
    require_modification = models.BooleanField(default=False)
    objects = UserIdentificationManager()

    def __unicode__(self):
        return "%s %s" % (self.user, self.doc_type)

    class Meta:
        db_table = "users_identification"

    def certificate(self):
        from users.services import UserService

        service = UserService
        url, img = service.get_certificate(
            width=30, height=30, as_image=True, identity=self.identity
        )
        if url and img:
            return '<a href="{}">{}</a>'.format(url, img)
        return self.identity

    certificate.allow_tags = True

    def email(self):
        return self.user.email

    def full_name(self):
        user = self.user
        return "%s %s" % (user.first_name, user.last_name)

    def social_networks(self):
        ss = self.user.socialaccount_set.all()
        result = ""
        if len(ss) > 0:
            ss = ss[0]
            if ss.provider == "linkedin_oauth2":
                s = '<a href="%s" target="_blank">%s</a>' % (
                    ss.extra_data.get("publicProfileUrl", ""),
                    ss.provider,
                )
                result += s
            if ss.provider == "google" or ss.provider == "facebook":
                if "link" in ss.extra_data:
                    s = '<a href="%s" target="_blank">%s</a>' % (
                        ss.extra_data.get("link", ""),
                        ss.provider,
                    )
                    result += s
        return result

    social_networks.allow_tags = True

    def phone_number(self):
        return self.user.primary_phone_no.number

    def profile_pic(self):
        from users.services import UserService

        service = UserService
        url, img = service.get_class_profile_pic(
            self.user.profile, width=70, height=49, as_image=True
        )
        if url and img:
            return '<a href="{}">{}</a>'.format(url, img)
        return ""

    profile_pic.allow_tags = True


class PhoneNumber(TimeStampedModel):
    class Meta:
        verbose_name = _("phone number")
        verbose_name_plural = _("phone numbers")
        unique_together = [("owner", "number")]
        db_table = "users_phonenumbers"

    objects = PhoneNumberManager()

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    number = PhoneNumberField()
    verified = models.BooleanField(default=False)
    primary = models.BooleanField(verbose_name=_("primary"), default=False)

    def __str__(self):
        return "%s for %s" % (self.number, self.owner)

    def last_two_digits(self):
        return self.number.as_e164[12:]

    def user_name(self):
        return self.owner.first_name


states = [
    "Abia",
    "Abuja",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bayelsa",
    "Bauchi",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Edo",
    "Ebonyi",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nassarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
]
states_long_lat = [
    (5.726664, 7.565156),
    (9.082473, 7.356269),
    (9.645162, 12.421864),
    (5.068420, 7.683476),
    (6.316646, 6.995496),
    (4.842071, 5.852486),
    (10.807842, 9.751328),
    (7.387295, 8.736775),
    (11.629788, 12.802802),
    (6.316806, 8.799662),
    (5.669369, 6.058477),
    (6.883155, 5.984382),
    (6.221285, 7.818528),
    (7.739940, 5.343869),
    (6.603331, 7.291178),
    (10.545474, 11.171589),
    (5.616333, 7.102473),
    (12.364066, 9.376286),
    (10.470247, 8.079514),
    (11.676993, 8.547603),
    (12.669475, 7.358564),
    (12.208350, 3.981469),
    (7.948534, 6.457488),
    (9.414218, 3.718773),
    (6.669684, 3.561586),
    (8.625961, 7.918797),
    (9.924713, 5.617843),
    (6.963726, 3.419530),
    (7.046053, 5.179615),
    (7.563343, 4.542657),
    (8.167863, 3.594321),
    (9.182326, 9.569508),
    (4.931917, 6.673922),
    (13.406813, 4.891265),
    (7.849436, 10.570253),
    (12.288096, 11.299737),
    (11.996030, 6.133369),
]


def get_state_coordinate(user_addr):
    if user_addr:
        x = states.index(user_addr.state)
        return states_long_lat[x]
    return states_long_lat[25]


class ConstituencyQuerySet(models.QuerySet):
    def possible_constituencies(self, area):
        """Get the list of possible Constituency to be considered.
        it returns the list of ids in which area is found as well as the
        related constituency around it
        :params :area
        :returns a list of the ids of the constituencies"""
        region_id = self.filter(areas__contains=[area]).first()
        import pdb

        pdb.set_trace()
        if region_id:
            return self.possible_regions(region_id.name)
        return self.none()
        # constituency = Constituency.objects.filter(
        #     areas__contains=[area]).values('pk', 'related_with_id')
        # # import pdb; pdb.set_trace()
        # selected = [a['pk'] for a in constituency]
        # selected_2 = [a['related_with_id'] for a in constituency]
        # selected.extend(selected_2)
        # return list(set(selected))

    def get_region(self, area):
        region_id = self.filter(areas__contains=[area]).first()
        if region_id:
            return region_id.name
        return None

    def possible_regions(self, region):
        instance = self.get(name=region)
        return self.filter(
            models.Q(pk__in=[instance.pk, instance.related_with_id])
            | models.Q(related_with__name=region)
        ).values_list("pk", flat=True)


class Constituency(models.Model):
    NIGERIAN_STATES = [("", "Select State")] + [(x, x) for x in states]
    state = models.CharField(
        max_length=50, choices=NIGERIAN_STATES, null=True, blank=True, db_index=True
    )
    name = models.CharField(max_length=80)
    related_with = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL
    )
    areas = ArrayField(models.CharField(max_length=80), blank=True, null=True)
    objects = ConstituencyQuerySet.as_manager()

    def __repr__(self):
        return "<Constituency: %s %s>" % (self.state, self.name)

    def __str__(self):
        return "%s %s" % (self.state, self.name)

    @classmethod
    def populate(cls):
        from pricings.models import Region

        related_regions = (
            Region.objects.filter(for_parent=True)
            .exclude(name="default_pricing")
            .values("state", "name", "areas")
        )
        for region in related_regions:
            x, _ = cls.objects.get_or_create(**region)

    @classmethod
    def get_areas_as_dict(cls, state):
        val = cls.objects.filter(state=state).order_by("pk").values("name", "areas")

        def update(x):
            x.update(selected=False, title=x["name"])
            x.pop("name")
            return x

        return list(map(update, val))


class StateWithRegionQueryset(models.QuerySet):
    def no_coordinate(self):
        return self.filter(
            models.Q(longitude__isnull=True) | models.Q(latitude__isnull=True)
        )

    def with_coordinate(self):
        return self.exclude(
            models.Q(longitude__isnull=True) | models.Q(latitude__isnull=True)
        )

    def with_distance(self, latitude=None, longitude=None, use_miles=False):
        if use_miles:
            distance_unit = 3959
        else:
            distance_unit = 6371
        result = self.with_coordinate().annotate(
            distance=RawSQL(
                "havesinecal(latitude,longitude,%s,%s)", (latitude, longitude)
            )
        )
        return result

    def regions_with_radius(self, coordinate, radius=1):
        value = {}
        if isinstance(coordinate, dict):
            value = coordinate
        else:
            value = {"latitude": coordinate.latitude, "longitude": coordinate.longitude}

        result = self.with_distance(
            latitude=value["latitude"], longitude=value["longitude"]
        ).filter(distance__lte=radius)
        try:
            print(result)
            return result
        except Exception as e:
            logger.exception(e)
            print(e)
            arr = [
                (x.calculate_distance(coordinate.latitude, coordinate.longitude), x)
                for x in StateWithRegion.objects.filter(state=coordinate.state)
            ]
            uu = [x[1].pk for x in arr if x[0] <= radius]
            return StateWithRegion.objects.filter(pk__in=uu)

    def get_region_instance(self, region: str, state=None, country=None):
        base_point = self.filter(region__icontains=region)
        if country:
            base_point = base_point.filter(country__iexact=country)
        if state:
            base_point = base_point.filter(state__iexact=state)
        result = base_point.first()
        return result

    def get_related_regions(self, region: str, radius: float, state=None, country=None):

        result = self.get_region_instance(region, state, country)
        if result:
            queryset = self.all()
            # if state:
            #     queryset = queryset.filter(state__iexact=state)
            result_set = queryset.regions_with_radius(result, radius=radius)
            with_distance = sorted(
                [
                    (x.calculate_distance(result.latitude, result.longitude), x)
                    for x in result_set
                ],
                key=lambda o: o[0],
            )
            return result_set, with_distance
        return [], []


# Create your models here.
class StateWithRegion(models.Model):
    state = models.CharField(max_length=200, db_index=True)
    longitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    latitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    region = models.CharField(max_length=200, null=True, blank=True, db_index=True)
    country = models.CharField(max_length=200, default="Nigeria", db_index=True)
    objects = StateWithRegionQueryset.as_manager()

    def __repr__(self):
        return f"<{self.__class__.__name__} {self.full_address}>"

    @property
    def full_address(self):
        return "%s %s %s" % (self.region, self.state, self.country)

    def calculate_distance(self, latitude, longitude):
        return vincenty(
            (self.latitude, self.longitude), (latitude, longitude)
        ).kilometers

    def get_coordinate(self):
        geolocator = GoogleV3(api_key=settings.GOOGLE_API_KEY)
        location = geolocator.geocode(self.full_address)
        logger.info(location)
        return location

    def populate_lat_lng(self):
        geolocation = self.get_coordinate()
        if geolocation:
            if self.longitude is None or self.latitude is None:
                self.longitude = geolocation.longitude
                self.latitude = geolocation.latitude
            self.save()

    @classmethod
    def build_region_filter(
        cls, region: str, radius: float, state=None, country=None, kind="user"
    ):
        _, with_distance = cls.objects.get_related_regions(
            region, radius, state=state, country=country
        )
        search_regions = [x[1].region for x in with_distance]
        key = "data_dump__tutor_update__personalInfo__region__in"
        if kind != "user":
            key = "vicinity__in"
        return with_distance, {key: search_regions}


def fetch_all_vicinities_from_sheet():
    response = requests.post(
        "https://sheet.tuteria.com/fetch-groups",
        json={
            "link": "https://docs.google.com/spreadsheets/d/1BBI6HUCpHkHk_AgxBEGACpL90dV_D4mySG3-c0ewGVY/edit?usp=sharing",
            "sheet": "Location",
            "segments": [{"cell_range": "A2:B1121", "heading": ["state", "region"]}],
        },
    )
    if response.status_code < 400:
        result = response.json()
        return result["data"][0]
    logger.info("Request failed")
    return []


def update_db_with_data(data):
    StateWithRegion.objects.all().delete()
    StateWithRegion.objects.bulk_create([StateWithRegion(**x) for x in data])
    queryset = StateWithRegion.objects.all()
    return queryset


def populate_queryset(queryset):
    for i, j in enumerate(queryset):
        j.populate_lat_lng()
    return queryset


def bulk_population_of_dataset():
    result = fetch_all_vicinities_from_sheet()
    print("Completed fetching of location info")
    queryset = update_db_with_data(result)
    print("Completed creation of db records")
    populate_queryset(queryset)
    print("Completed creation of longitude and latitudes")


class Location(models.Model, LocationMixin):
    NIGERIAN_STATES = [("", "Select State")] + [(x, x) for x in states]
    address = models.CharField(max_length=120)
    state = models.CharField(
        max_length=50, choices=NIGERIAN_STATES, null=True, blank=True, db_index=True
    )
    distances = JSONField(null=True, blank=True)
    vicinity = models.CharField(max_length=80, null=True, blank=True)
    vicinity_type = models.CharField(max_length=20, null=True, blank=True)
    addr_type = models.IntegerField(
        default=LocationMixin.USER_ADDRESS,
        choices=LocationMixin.ADDRESS_TYPE,
        db_index=True,
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    longitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    latitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    lga = models.CharField(max_length=30, blank=True, null=True)
    region = models.ForeignKey(
        Constituency, null=True, blank=True, on_delete=models.SET_NULL
    )
    # is_teaching_spot = models.BooleanField(default=False)

    objects = LocationManager()

    def email(self):
        return self.user.email

    def calculate_distance(self, latitude, longitude):
        return vincenty(
            (self.latitude, self.longitude), (latitude, longitude)
        ).kilometers

    @property
    def lat_lng(self):
        return dict(lat=self.latitude, lng=self.longitude)

    # def get_loc(self):
    #     if self.latitude and self.longitude:
    #         # Remember, longitude FIRST!
    #         return Point(float(self.longitude), float(self.latitude))

    @property
    def full_address(self):
        if self.vicinity:
            return "%s %s %s" % (self.address, self.vicinity, self.state)
        return "%s %s" % (self.address, self.state)

    class Meta:
        verbose_name = "Location"
        verbose_name_plural = "locations"

    def get_coordinate(self):
        geolocator = GoogleV3()
        location = geolocator.geocode(self.address)
        logger.info(location)
        if location is None:
            location = geolocator.geocode(self.full_address)
        logger.info(location)
        if location is None:
            if self.vicinity:
                location = geolocator.geocode(self.vicinity + " " + self.state)
        return location

    @staticmethod
    def get_locality(raw_response):
        ALLOWED_TYPES = ["point_of_interest", "neighborhood", "sublocality", "route"]
        types = [address["types"] for address in raw_response]
        single_list = [item for sublist in types for item in sublist]

        def get_name(listitem):
            for ad in raw_response:
                if listitem in ad["types"]:
                    return ad["short_name"]

        names = [get_name(ll) for ll in single_list]

        no_dup_list = list(set(single_list))
        zipped = list(set(zip(single_list, names)))

        def get_result(itemss, array):
            for x in array:
                if itemss == x[0]:
                    return x

        final_result = [
            get_result(item, zipped) for item in no_dup_list if item in ALLOWED_TYPES
        ]

        if "neighborhood" in no_dup_list:
            return get_result("neighborhood", final_result)
        if "sublocality" in no_dup_list:
            return get_result("sublocality", final_result)
        if "point_of_interest" in no_dup_list:
            return get_result("point_of_interest", final_result)
        if "route" in no_dup_list:
            return get_result("route", final_result)
        return None

    @property
    def locality(self):
        if self.vicinity:
            if (
                self.vicinity_type == "route"
                or self.vicinity_type == "point_of_interest"
            ):
                return self.vicinity.split(" ")[0]
            else:
                return " ".join(self.vicinity.split(" ")[:2])
        return self.state

    def populate_lat_lng(self):
        geolocation = self.get_coordinate()
        if geolocation:
            if self.longitude is None or self.latitude is None:
                self.longitude = geolocation.longitude
                self.latitude = geolocation.latitude
            self.save()

    def get_vicinity1(self):
        try:
            geolocation = self.get_coordinate()
            if geolocation:
                if self.longitude is None or self.latitude is None:
                    self.longitude = geolocation.longitude
                    self.latitude = geolocation.latitude
                self.save()
                vicinity = Location.get_locality(geolocation.raw["address_components"])
                if not self.vicinity:
                    if vicinity:
                        self.vicinity = vicinity[1]
                        self.vicinity_type = vicinity[0]
            self.save()
        except GeocoderTimedOut as e:
            logger.error(e)
        except SSLError as e:
            logger.error(e)
        except GeocoderServiceError as e:
            logger.error(e)

    def get_vicinity(self, distances=False):
        try:
            geolocation = self.get_coordinate()
            if geolocation:
                if self.longitude is None or self.latitude is None:
                    self.longitude = geolocation.longitude
                    self.latitude = geolocation.latitude

                vicinity = Location.get_locality(geolocation.raw["address_components"])
                if not self.vicinity:
                    if vicinity:
                        self.vicinity = vicinity[1]
                        self.vicinity_type = vicinity[0]
                self.distances = DistanceCalculator.distance_calculator(
                    geolocation,
                    lat_lng=dict(lat=geolocation.latitude, lng=geolocation.longitude),
                )
            self.save(using="default")
        except GeocoderTimedOut as e:
            logger.error(e)
            raise
        except SSLError as e:
            logger.error(e)
            raise

    def __unicode__(self):
        return "{} {}".format(self.user.email, self.address)


class Tutor(User):
    objects = TutorManager()

    class Meta:
        proxy = True


class UserMilestone(models.Model):
    milestone = models.ForeignKey("rewards.Milestone", on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name="milestones", on_delete=models.CASCADE)
    objects = UserMilestoneManager()

    class Meta:
        unique_together = [("milestone", "user")]

    def __str__(self):
        return str(self.milestone)


class UserProfile(TutorInterview, TutorProfileMixin, TimeStampedModel):
    TutorApplicationLevel = (
        (0, "Not Began"),
        (1, "Credentials"),
        (2, "Preference"),
        (3, "Interview"),
        (4, "Interview22"),
    )
    MALE = "M"
    FEMALE = "F"
    LEVELS = (
        (TuteriaLevel.ROOKIE, "new tutor"),
        (TuteriaLevel.AMATEUR, "influencer"),
        (TuteriaLevel.SEMI_PRO, "role model"),
        (TuteriaLevel.VETERAN, "super tutor"),
        (TuteriaLevel.MASTER, "leader"),
    )
    GENDER = ((MALE, "Male"), (FEMALE, "Female"))

    user = models.OneToOneField(
        User,
        primary_key=True,
        verbose_name="user",
        related_name="profile",
        on_delete=models.CASCADE,
    )
    application_status = models.IntegerField(
        default=0, choices=TutorProfileMixin.TutoringStatus, db_index=True
    )
    application_trial = models.IntegerField(default=0)
    registration_level = models.IntegerField(
        default=0, choices=TutorApplicationLevel, db_index=True
    )
    date_denied = models.DateTimeField(null=True, blank=True, db_index=True)
    # description = MarkupField(verbose_name=_('About Me'), max_length=400, blank=True, default='', default_markup_type='markdown', escape_html=True)
    description = models.TextField(verbose_name=_("About Me"), blank=True)
    gender = models.CharField(choices=GENDER, max_length=15, db_index=True, blank=True)
    dob = models.DateField(verbose_name="dob", blank=True, null=True, db_index=True)
    image = CloudinaryField("image", max_length=500, default="", null=True, blank=True)
    video = EmbedVideoField(blank=True, null=True)
    video_approved = models.BooleanField(default=False)
    image_approved = models.BooleanField(default=True)
    agent = models.ForeignKey(
        "external.Agent", null=True, blank=True, on_delete=models.SET_NULL
    )
    tutor_skill_modified = models.DateTimeField(null=True, blank=True)
    custom_header = models.CharField(max_length=70, blank=True, default="")
    tutor_type = models.CharField(max_length=40, blank=True, default="")
    date_approved = models.DateTimeField(null=True, blank=True, db_index=True)
    objects = UserProfileManager()

    # Tutoring Fields
    CANCELLATION_POLICY = (
        (Policy.FLEXIBLE, Policy.FLEXIBLE),
        (Policy.MEDIUM, Policy.MEDIUM),
        (Policy.HARSH, Policy.HARSH),
        # (Policy.LONG_TERM, Policy.LONG_TERM),
    )
    USER_RESIDENCE = "user"
    TUTOR_RESIDENCE = "tutor"
    NEUTRAL = "neutral"
    MEETING_ADDRESS = (
        (USER_RESIDENCE, "Client's Location"),
        (TUTOR_RESIDENCE, "Tutor's Location"),
        (NEUTRAL, "Anywhere convenient"),
    )

    TRAVEL_POLICY = (
        ("near", "at most 5km (~ 30mins drive )"),
        ("not far", "at most 10km (~ 1hrs drive )"),
        ("quite far", "at most 15km (~ 1.5hrs drive )"),
        ("far", "at most 20km (~ 2hrs drive )"),
        ("very far", "greater than 20km (the whole state)"),
    )
    RESPONSE_TIME = (
        ("", "Select"),
        (30, "in 30 minutes"),
        (60, "in 1 hour"),
        (120, "in 2 hours"),
        (180, "in 3 hours"),
        (300, "in 5 hours"),
    )
    INSTANT_BOOKING = 0
    ONE_DAY = 1
    TWO_DAYS = 2
    THREE_DAYS = 3
    PREP_OPTIONS = (
        ("", "Select option"),
        (INSTANT_BOOKING, "Always ready"),
        (ONE_DAY, "At least 1 day"),
        (TWO_DAYS, "At least 2 days"),
        (THREE_DAYS, "At least 3 days"),
    )

    hours = models.IntegerField(verbose_name="max_no_of_hours", default=0, null=True)
    days = models.IntegerField(verbose_name="max_no_of_days", default=0, null=True)
    allow_monthly = models.BooleanField(default=True)
    cancellation = models.CharField(
        max_length=15, default=Policy.FLEXIBLE, choices=CANCELLATION_POLICY
    )
    tutoring_address = models.CharField(
        max_length=10, blank=False, choices=MEETING_ADDRESS, default=USER_RESIDENCE
    )
    tutoring_distance = models.CharField(
        max_length=10, choices=TRAVEL_POLICY, default="near"
    )
    response_time = models.IntegerField(
        verbose_name=_("Response Time"), choices=RESPONSE_TIME, default=0, blank=True
    )
    booking_prep = models.IntegerField(choices=PREP_OPTIONS, null=True, blank=True)
    good_fit = models.NullBooleanField()
    terms_and_conditions = models.NullBooleanField()
    address_reason = models.TextField(null=True, blank=True)
    tutor_description = models.TextField(null=True, blank=True)
    interview_slot = models.CharField(
        max_length=20, null=True, blank=True, choices=TutorInterview.INTERVIEW_OPTIONS
    )

    # Trust
    background_check = models.BooleanField(default=False)
    level = models.IntegerField(
        default=TuteriaLevel.AMATEUR, choices=LEVELS, db_index=True
    )
    YEARS_OF_TEACHING = (
        ("", "Just starting out"),
        (2, "Less than 2 years"),
        (5, "Between 3 to 5 years"),
        (10, "Between 6 to 10 years"),
        (50, "More than 10 years"),
    )
    # no_of_students = models.IntegerField(blank=True,null=True)
    years_of_teaching = models.IntegerField(
        blank=True, null=True, choices=YEARS_OF_TEACHING
    )
    classes = ArrayField(models.CharField(max_length=20), blank=True, null=True)
    blacklist = models.BooleanField(default=False)
    blog_description = models.TextField(default="", blank=True)
    handle = models.CharField(max_length=20, blank=True, default="")
    CURRICULUM = (
        ("1", "Nigerian"),
        ("2", "British"),
        ("3", "American"),
        ("4", "Montessori"),
        ("5", "EYFS"),
    )
    curriculum_used = ArrayField(
        models.CharField(max_length=30, blank=True, choices=CURRICULUM),
        null=True,
        blank=True,
    )
    curriculum_explanation = models.TextField(max_length=300, blank=True, null=True)
    request_pool = models.BooleanField(default=False)
    potential_subjects = ArrayField(
        models.CharField(max_length=50, blank=True), null=True, blank=True
    )
    levels_with_exams = ArrayField(
        models.CharField(max_length=50, blank=True), null=True, blank=True
    )
    answers = JSONField(blank=True, null=True)
    applied_for_prime = models.BooleanField(default=False)

    def curriculum_display(self):
        if self.curriculum_used:
            return [dict(self.CURRICULUM).get(x) for x in self.curriculum_used]

    @property
    def teaching_years(self):
        if self.years_of_teaching == 2:
            return "2 years"
        if self.years_of_teaching == 5:
            return "5 years"
        if self.years_of_teaching == 10:
            return "8 years"
        if self.years_of_teaching == 50:
            return "10 years +"
        return "Starting out"

    def began_application(self):
        return UserProfile.objects.filter(user=self.user).update(
            application_status=1, registration_level=1
        )

    @property
    def full_name(self):
        user = self.user
        return "%s %s" % (user.first_name, user.last_name)

    def save(self, *args, **kwargs):
        if not self.response_time:
            self.response_time = 0

        super(UserProfile, self).save(*args, **kwargs)

    def delete_set_fields(self):
        self.tutor_description = ""
        self.interview_slot = ""
        self.terms_and_conditions = None
        self.user.schedule_set.all().delete()
        self.address_reason = None
        self.good_fit = None
        self.user.education_set.all().delete()
        self.user.workexperience_set.all().delete()
        self.description = ""
        loc = self.user.location_set.tutor_address()
        if loc:
            loc.delete()

    @property
    def can_tutor(self):
        return (
            self.application_trial < 3
            and self.application_status != self.PENDING
            and self.application_status != self.DENIED
        )

    def __unicode__(self):
        return self.user.email

    def guarantors(self):
        all_guarantors = self.user.email.guarantor_set.all()
        result = []
        return result

    @staticmethod
    def disable_tutor_status(profile):
        from .tasks import disable_tutor_status

        profile.application_status = UserProfile.DENIED
        profile.application_trial = 3
        profile.save()
        disable_tutor_status.delay(profile.pk)

    @staticmethod
    def mark_as_verified_bulk(queryset, status=True, agent=None):
        from registration.tasks import action_after_approval

        pks = [x for x in queryset.values_list("pk", flat=True)]
        if status:
            queryset.update(
                application_status=UserProfile.VERIFIED,
                agent=agent,
                tutor_skill_modified=timezone.now(),
            )
        else:
            queryset.update(
                application_status=UserProfile.DENIED,
                agent=agent,
                tutor_skill_modified=timezone.now(),
            )

        action_after_approval.delay(list(pks), status)

    def approve_teaching_status(self):
        self.application_status = UserProfile.VERIFIED
        self.user.tutor_intent = False
        self.date_approved = timezone.now()
        self.user.save()
        self.save()

    @staticmethod
    def mark_as_verified(profile, status=True):
        from registration.tasks import email_to_verified_tutor

        if status:
            profile.approve_teaching_status()
            create_subjects.send(
                sender=profile.__class__,
                tutor_id=profile.user_id,
                subjects=profile.potential_subjects,
            )

        else:
            profile.application_status = UserProfile.DENIED
            profile.date_denied = timezone.now()
            profile.application_trial += 1
            profile.delete_set_fields()
            profile.user.tutorskill_set.all().delete()
        User.objects.filter(pk=profile.user.pk).update(drip_counter=0, drip_date=None)
        profile.save()
        email_to_verified_tutor.delay(profile.pk, status=status)

    def update_status_based_on_timer(self, timeout=90):
        if self.date_denied:
            timeit = timezone.now() - self.date_denied

            if (
                self.application_status == self.DENIED
                and timeit.days >= timeout
                and self.application_trial < 3
            ):
                UserProfile.objects.filter(pk=self.pk).update(
                    date_denied=None, application_status=0, registration_level=0
                )

    @property
    def can_validate_video(self):
        if self.video:
            return self.video and self.video_approved == False
        return False

    def image_display(self):
        if self.image:
            img = self.image.image(width=50, height=50, crop="fill")
            url = self.image.url
            return '<a href="{}">{}</a>'.format(url, img)

    image_display.allow_tags = True

    @property
    def age(self):
        today = datetime.date.today()
        if self.dob:
            return (
                today.year
                - self.dob.year
                - ((today.month, today.day) < (self.dob.month, self.dob.day))
            )
        return 0

    def get_absolute_url(self):
        return reverse("users:dashboard")

    def profile_thumbnail(self):
        my_image = self.image
        if my_image:
            img = my_image.image(width=70, height=49, crop="fill", gravity="faces")
            url = my_image.url
            return '<a href="{}">{}</a>'.format(url, img)
        return my_image or ""

    profile_thumbnail.allow_tags = True


class VerifiedTutor(UserProfile):
    objects = VerifiedTutorManager()

    class Meta:
        proxy = True

    @cached_property
    def all_subjects(self):
        return self.user.tutorskill_set.all()

    # def active(self):
    #     return len([x for x in self.all_subjects if x.status == 2])
    #     # return self.user.tutorskill_set.filter(status=2).count()

    # def pending(self):
    #     return len([x for x in self.all_subjects if x.status == 1])
    #     # return self.user.tutorskill_set.filter(status=1).count()

    # def modification(self):
    #     return len([x for x in self.all_subjects if x.status == 5])
    #     # return self.user.tutorskill_set.filter(status=5).count()

    # def denied(self):
    #     return len([x for x in self.all_subjects if x.status == 4])
    #     # return self.user.tutorskill_set.filter(status=4).count()


class TutorApplicant(UserProfile):
    objects = TutorUserManager()

    class Meta:
        proxy = True

    def educations(self):
        return self.user.education_set.all()

    def work_experiences(self):
        return self.user.workexperience_set.all()

    def phone_number(self):
        return self.user.primary_phone_no

    def social_networks(self):
        networks = self.user.socialaccount_set.all()
        result = ""
        if len(networks) > 0:
            ss = networks[0]
            if ss:
                if ss.provider == "linkedin_oauth2":
                    s = '<a href="%s" target="_blank">%s</a>' % (
                        ss.extra_data.get("publicProfileUrl", ""),
                        ss.provider,
                    )
                    result += s
                if ss.provider == "google" or ss.provider == "facebook":
                    if "link" in ss.extra_data:
                        s = '<a href="%s" target="_blank">%s</a>' % (
                            ss.extra_data.get("link", ""),
                            ss.provider,
                        )
                        result += s
        return result

    social_networks.allow_tags = True

    # def education_proof(self):
    #     cert = self.user_detail.education_set.all()
    #     images = ''
    #     for image_path in cert:
    #         ls = '<a href="{}">{}</a>'.format(image_path.certificate.url,
    #             image_path.certificate.image(width=50,height=50,crop='fill'))
    #         images += ls
    #     return images
    #     # if cert:
    #     #     return cert.image(width=50,height=50,crop='fill')
    #     # return ''
    # education_proof.allow_tags = True

    def email_verified(self):
        return self.user.email_verified

    def identity(self):
        if self.user_detail.identity:
            img = self.user_detail.identity.identity.image(
                width=50, height=50, crop="fill"
            )
            url = self.user_detail.identity.identity.url
            return '<a href="{}">{}</a>'.format(url, img)
        return self.user_detail.identity

    identity.allow_tags = True

    def home_address(self):
        addr = self.user.home_address
        if addr:
            return addr.full_address
        return addr

    def tutor_address(self):
        locations = self.user.location_set.all()
        addr = [x for x in locations if x.addr_type == Location.TUTOR_ADDRESS]
        # addr = self.user.location_set.filter(
        #     addr_type=Location.TUTOR_ADDRESS).first()
        if len(addr) > 0:
            addr = addr[0]
            return addr.full_address
        return None

    def phonenumber(self):
        x = self.user.primary_phone_no
        return x.number if x else None

    @cached_property
    def user_detail(self):
        return self.user

    def full_name(self):
        return "%s %s" % (self.user_detail.first_name, self.user_detail.last_name)


def create_profile(u):
    if hasattr(u, "profile"):
        return u.profile
    return UserProfile.objects.get_or_create(user=u)


# User.profile = cached_property(create_profile)
# User.profile = cached_property(lambda u:
# UserProfile.objects.get_or_create(user=u)[0])


@receiver(email_confirmed)
def email_confirmed_(request, email_address, **kwargs):
    from ..tasks import welcome_email

    user = User.objects.get(email=email_address.email)
    user.is_active = True
    user.confirmed_date = datetime.datetime.now(tz=pytz.utc)
    user.save()
    welcome_email.delay(email_address.email)


@receiver(pre_social_login)
def social_network_connected(request, sociallogin, **kwargs):
    """
    When a social account is created successfully and this signal is received,
    django-allauth passes in the sociallogin param, giving access to metadata on the remote account, e.g.:

    sociallogin.account.provider  # e.g. 'twitter'
    sociallogin.account.get_avatar_url()
    sociallogin.account.get_profile_url()
    sociallogin.account.extra_data['screen_name']

    See the socialaccount_socialaccount table for more in the 'extra_data' field.
    From http://birdhouse.org/blog/2013/12/03/django-allauth-retrieve-firstlast-names-from-fb-twitter-google/comment-page-1/
    """
    # if sociallogin.account.provider == 'facebook':
    #     from users.tasks import upgrade_token

    # upgrade_token.delay(sociallogin.account.provider, sociallogin.token.id)
    print("Connected")


class Loc(object):
    def __init__(self, latitude, longitude):
        self.latitude = latitude
        self.longitude = longitude


@receiver(verified_tutor_email_list)
def on_verified_tutor_email_list(self, user: User, **kwargs):
    user.add_to_verified_tutor_list()


@receiver(populate_possible_tutors)
def on_populate_possible_tutors(sender, request, **kwargs):
    if request.g:
        u = Loc(request.latitude, request.longitude)
        locations = [u]
    else:
        locations = request.clean_address()
    tutors_closeby = User.objects.around_location(locations, 5).verified_tutors()
    tutors_by_subject_list = [
        tutors_closeby.new_skill_search(get_related_subjects(x)).values_list(
            "pk", flat=True
        )
        for x in request.request_subjects
    ]
    tutors_by_description_list = [
        tutors_closeby.profile_search([x]).values_list("pk", flat=True)
        for x in request.request_subjects
    ]
    combined = []
    combined = [
        set(u[0]).union(u[1])
        for u in zip(tutors_by_subject_list, tutors_by_description_list)
    ]
    all_combinations = sum(
        [
            map(list, itertools.combinations(combined, i))
            for i in range(len(combined) + 1)
        ],
        [],
    )
    del all_combinations[0]
    for i, x in enumerate(all_combinations):
        no = len(all_combinations[i])
        cc = set.intersection(*map(set, x))
        User.objects.filter(pk__in=list(cc)).update(
            request_info=request, no_of_subjects_found=no
        )


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


post_save.connect(create_user_profile, sender=User)
