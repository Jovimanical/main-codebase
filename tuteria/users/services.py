from collections import defaultdict
import logging
import math
import re
import pdb
from django.utils.functional import cached_property
from django.core.exceptions import ValidationError
import cloudinary
from . import models as user_models
from . import api as user_api
from .notifications import UserNotification

# from .forms import NO_LINK_REGEX
from rewards.models import Milestone
from reviews.models import SkillReview
from skills import services as skill_service
from external import services as ex_service
import json
import urllib
from collections import namedtuple
import referrals as r
import requests
from django.conf import settings
from django.core.cache import cache
from users import forms
from django.db import IntegrityError
from django.http import Http404
from config.builtin_types import dict
from users.tasks.tasks1 import re_upload_profile_pic

NO_LINK_REGEX = (
    "\(([^)]+)\)\[([^\]]+)\]|\[([^\]]+)\]\(([^)]+)\)|(http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+)"
)
CALENDAR_API_URL = settings.CALENDAR_API_URL

TIMEOUT = 60 * 60 * 24

logger = logging.getLogger(__name__)


def _json_object_hook(d):
    return namedtuple("X", d.keys())(*d.values())


def json2obj(data):
    return json.loads(data, object_hook=_json_object_hook)


class BaseService:
    base_url = None

    @classmethod
    def get_request_url(cls, url, params):
        return cls.base_url + "/{}?{}".format(url, params)

    @classmethod
    def get_json_cache(cls, url, **kwargs):
        ts = cache.get(kwargs["cache"])
        if ts is None:
            req = requests.get(cls.get_request_url(url, kwargs[params]))
            req.raise_for_status()
            ts = req.content
            cache.set(kwargs["cache"], ts, TIMEOUT)
        return ts

    @classmethod
    def get_json(cls, url, **kwargs):
        params = urllib.urlencode(kwargs)
        if "cache" in kwargs:
            ts = cls.get_json_cache(url, params=params, **kwargs)
        else:
            req = requests.get(cls.get_request_url(url, params))
            req.raise_for_status()
            ts = req.content
        if "as_json" in kwargs:
            return ts
        return json2obj(ts)


class CalendarService(BaseService):
    base_url = CALENDAR_API_URL

    @classmethod
    def post_json(cls, url, **kwargs):
        req = requests.post(
            CALENDAR_API_URL + "/{}".format(url), json=kwargs.get("data")
        )
        try:
            req.raise_for_status()
        except requests.exceptions.HTTPError as e:
            pass
        else:
            ts = req.content
            return json2obj(ts)

    @classmethod
    def put_json(cls, url, **kwargs):
        req = requests.put(
            CALENDAR_API_URL + "/{}".format(url), data=kwargs.get("data")
        )
        try:
            req.raise_for_status()
        except requests.exceptions.HTTPError as e:
            pass
        else:
            ts = req.content
            return json2obj(ts)

    @classmethod
    def get_calendar_detail(cls, user):
        try:
            c = cls.get_json("calendar/{}".format(user.pk))
        except requests.exceptions.HTTPError:
            c = None
        except Exception:
            c = None
        return c

    @classmethod
    def create_calendar(cls, user, **kwargs):
        return cls.post_json(
            "calendar", data={"tutor_id": user.pk, "days": kwargs.get("days")}
        )

    @classmethod
    def update_calendar(cls, user, **kwargs):
        return cls.put_json(
            "calendar/{}".format(user.pk), data={"days": kwargs.get("days")}
        )


def get_weekdays_object(arr, no_of_weeks=12, starts=0):
    d = defaultdict(list)
    for v in arr:
        # pdb.set_trace()
        key = v.get("weekday")
        d[key].append(v)
    weekdays = [Weekday(key, value, no_of_weeks, starts) for key, value in d.items()]
    return weekdays


class ReviewService(skill_service.PaginatorObject):

    def __init__(self, email, skill=None, tutorskill_id=None):
        self.reviews = SkillReview.objects.reviews_on_all_subjects(email)
        if skill:
            self.reviews = self.reviews.filter(tutor_skill__skill__name=skill)
        if tutorskill_id:
            self.reviews = self.reviews.filter(tutor_skill_id=tutorskill_id)

    def get_list(self):
        return self.reviews

    @property
    def rating_integer(self):
        dec, integer = math.modf(self.reviews.average_score())
        return range(int(integer))

    @property
    def rating_decimal(self):
        dec, integer = math.modf(self.reviews.average_score())
        if dec >= 0.2:
            return True
        return False

    def exists(self):
        return self.reviews.exists()


class LocationService(object):

    def __init__(self, user_email):
        self.locations = user_models.Location.objects.filter(user__email=user_email)

    def first(self):
        return self.locations.first()

    @cached_property
    def home_address(self):
        return self.locations.home_address()

    @property
    def address_components(self):
        address = self.home_address
        state = address.state
        vicinity = address.locality
        return state, vicinity

    @property
    def tutor_address_components(self):
        address = self.locations.actual_tutor_address()
        if address:
            state = address.state
            vicinity = address.vicinity
        else:
            state = ""
            vicinity = ""
        return state, vicinity

    @property
    def display(self):
        state, vicinity = self.tutor_address_components
        return "{}, {}".format(vicinity, state)


class IdentityService(object):

    def __init__(self, user_email):
        self.identifications = user_models.UserIdentification.objects.filter(
            user__email=user_email
        )

    def exists(self):
        return self.identifications.exists()

    def first(self):
        return self.identifications.filter(
            doc_type=user_models.UserIdentification.IDENTITY
        ).first()


class PhoneNumberService(object):

    def __init__(self, email):
        self.phonenumbers = user_models.PhoneNumber.objects.filter(owner__email=email)

    def all(self):
        return self.phonenumbers.all()

    def primary(self):
        return self.phonenumbers.filter(primary=True).first()

    @classmethod
    def get_number(self, number, as_national=False):
        if number:
            if as_national:
                return number.number.as_national()
            return number.number
        return ""


class UserService(object):

    def __init__(self, email=None, **kwargs):
        self._get_user(email=email, **kwargs)
        self.ts_service = skill_service.TutorSkillService(self.user.email)
        self.identity_service = IdentityService(self.user.email)
        self.location_service = LocationService(self.user.email)
        self.phone_service = PhoneNumberService(self.user.email)
        self.rq_service = ex_service.RequestService(self.user.email)
        self.get_phonenumbers()

    def get_absolute_url(self):
        return self.user.get_absolute_url()

    def is_prime_tutor(self):
        return self.profile.applied_for_prime

    def update_registration_level(self, level):
        UserService.update_reg_level(self.user.email, level)

    @cached_property
    def educations(self):
        return self.user.education_set.all()

    @cached_property
    def work_experiences(self):
        return self.user.workexperience_set.all()

    @property
    def is_tutor(self):
        """User is a tutor @property"""
        return self.profile.is_tutor

    @property
    def id_verified(self):
        return self.user.id_verified

    @property
    def primary_phone_no(self):
        return self.phone_service.primary()

    @property
    def as_national(self):
        return self.phone_service.get_number(self.primary_phone_no, True)

    @property
    def travel_policy_profile(self):
        text = "{} will usually travel <strong>{}</strong> from {}"
        state, vicinity = self.location_service.address_components
        distance = self.profile.get_tutoring_distance_display()
        return text.format(self.user.first_name, distance, vicinity)

    @property
    def actual_number(self):
        """Actual number of user +234********"""
        result = self.phone_service.get_number(self.primary_phone_no)
        return str(result)

    def schedule(self, as_dict=True):
        return user_api.TutorScheduleSerializer(self.user).data

    @cached_property
    def locations(self):
        return self.location_service.locations

    @cached_property
    def identity(self):
        return self.identity_service.first()

    @property
    def tutorskills(self):
        return self.ts_service.tutorskills

    def active_tutorskills(self, **kwargs):
        return self.ts_service.active(**kwargs)

    def failed_tutorskills(self, **kwargs):
        return self.ts_service.denied(**kwargs)

    def get_cached_categories_as_json(self, **kwargs):
        return self.ts_service.get_cached_category_json(
            self.profile.potential_subjects, **kwargs
        )

    def get_skill_service(self, *args, **kwargs):
        o = self.ts_service.get_skill(*args, **kwargs)
        if isinstance(o, tuple):
            result, _ = o
            return result
        return o

    def get_skill(self, skill_slug):
        return self.get_skill_service(skill_slug).instance

    def save_skill(self, skill_slug, data):
        return self.ts_service.update_skill(skill_slug, data)

    def tutor_application_next_url(self):
        if self.user.tutor_intent:
            return self.user.tutor_req.get_next_url()

    @property
    def subjects_selected(self):
        sub_categories, non_academic = self.ts_service.get_subject_categories()
        return {
            "others": non_academic,
            "groups": sub_categories,
            "selected_subjects": self.profile.potential_subjects or [],
            "levels": self.profile.levels_with_exams or [],
            "subcategory_answers": self.profile.answers or {},
        }

    def _get_user(self, **kwargs):
        new_kwargs = dict((k, v) for k, v in kwargs.items() if v)
        self.user = user_models.User.objects.get(**new_kwargs)
        try:
            self.profile = self.user.profile
        except user_models.UserProfile.DoesNotExist:
            raise Http404("You can not view this page at the moment.")
        self.tutor_req = self.user.tutor_req
        return self

    def requests_placed(self):
        return self.rq_service.all()

    @classmethod
    def get_user(cls, *args, **kwargs):
        return cls(**kwargs)

    def get_reviews(self, **kwargs):
        kwargs.update(email=self.user.email)
        self.reviews = ReviewService(**kwargs)
        return self.reviews

    def get_phonenumbers(self):
        self.phonenumbers = self.phone_service.all()
        return self.phonenumbers

    def get_notifications(cls):
        notifications = UserNotification(cls.user, cls.profile)
        notifications.populate_all_notifications()
        cls.notifications = notifications.notifications

    def get_reputation_list(self):
        self.reputations = Milestone.reputation_list(self.user)

    def get_profile_forms(self):
        form_params = self.instantiate_general_user_forms()
        form_params.update(object=self, profile=self.profile)
        education_formset, we_formset, preference_form = tuple(
            self.instantiate_tutor_specific_forms()
        )
        form_params.update(
            education_formset=education_formset,
            we_formset=we_formset,
            preference_form=preference_form,
        )
        return form_params

    def update_profile_details(self, request):
        general_instance_is_valid, all_forms = self.process_general_forms(request)
        if general_instance_is_valid:
            self.save_personal_info(all_forms, None)
            return None
        return all_forms

    def validate_profile_forms(self, request):
        """Validating the profile form section of registration"""
        logger.info(request.POST)
        general_instance_is_valid, all_forms = self.process_general_forms(request)
        form_instances = self.process_all_formsets(request)
        if not form_instances and general_instance_is_valid:
            self.save_personal_info(all_forms, form_instances)
            return None
        form_params = all_forms
        if form_instances is not None:
            education_formset, we_formset, preference_form = form_instances
            form_params.update(
                education_formset=education_formset,
                we_formset=we_formset,
                preference_form=preference_form,
            )
        return form_params

    def process_all_formsets(self, request):
        logger.info(self.user.tutor_intent)
        form_instances = self.instantiate_tutor_specific_forms(request.POST)
        for x in form_instances:
            logger.info(x.errors)
        is_valid = all([x.is_valid() for x in form_instances])
        if is_valid:
            for x in form_instances:
                x.save()
            self.update_registration_level(level=3)
            return None
        return tuple(form_instances)

    def process_general_forms(self, request):
        formss = self.instantiate_general_user_forms(request.POST)
        return all(r.is_valid() for r in formss.values()), formss

    def instantiate_tutor_specific_forms(self, data=None):
        """Initialize the tutor specific section of the form"""
        from registration import forms as reg_forms

        forms = [
            x(data=data, instance=self.user)
            for x in [reg_forms.EducationFormset, reg_forms.WorkExperienceFormSet]
        ]
        forms.append(reg_forms.TutorDescriptionForm(data=data, instance=self.profile))
        return forms

    def instantiate_general_user_forms(self, data=None):
        form = forms.UserEditForm(data=data, instance=self.user)
        if self.user.tutor_verified:
            profile_form = forms.VerifiedProfileForm(data=data, instance=self.profile)
        else:
            profile_form = forms.UserProfileForm(data=data, instance=self.profile)
        address_form = forms.UserHomeAddressFormSet(
            data=data, instance=self.user, form_kwargs={"user_state": True}
        )
        primary_phone_form = forms.PhoneNumberForm(
            data=data, instance=self.primary_phone_no
        )
        if data:
            logger.info(primary_phone_form.is_valid())
            logger.info(profile_form.is_valid())
            logger.info(profile_form.errors)
            logger.info(address_form.is_valid())
            logger.info(form.is_valid())
        return dict(
            form=form,
            profile_form=profile_form,
            address_form=address_form,
            primary_phone_form=primary_phone_form,
        )

    # @classmethod
    def save_personal_info(cls, general_forms, form_instances=None):
        form = general_forms.get("form")
        profile_form = general_forms.get("profile_form")
        address_form = general_forms.get("address_form")
        primary_phone_form = general_forms.get("primary_phone_form")
        cls.user = form.save()
        logger.info(profile_form.cleaned_data["description"])
        profile_form.save()
        description = profile_form.cleaned_data["description"]
        if description:
            description = re.sub(NO_LINK_REGEX, "", description)
        cls.profile.description = description
        cls.profile.save()
        logger.info(cls.profile.description)
        logger.info("Before saving address form")
        address_form.save()
        for ad_form in address_form.forms:
            ad_form.save(changed=address_form.has_changed())
        primary_phone_form.save(user=cls.user)
        logger.info("after saving address form")
        if cls.profile.description:
            reward2 = Milestone.get_milestone(Milestone.COMPLETE_PROFILE)
            user_models.UserMilestone.objects.get_or_create(
                user=cls.user, milestone=reward2
            )
        if cls.user.tutor_intent and not form_instances:
            cls.update_registration_level(3)

    def save_location(cls, data):
        if cls.user.tutor_verified:
            location_form = forms.TutorAddressForm1(data=data, user=cls.user)
            location_form.save()

        data_dump = dict(
            cls.user.data_dump if cls.user.data_dump is not None else {}
        ).toObject()

        locations = []
        try:
            locations = data_dump.locations
        except AttributeError:
            pass
        locations.append(data)
        setattr(data_dump, "locations", locations)

        dump_form = forms.UserDumpDataForm(
            dict(data_dump=data_dump.__dict__), instance=cls.user
        )
        dump_form.save()
        return True, {}

    def save_personal_info1(cls, data, form_instances=None):
        phone_numbers = data.pop("phone_numbers")
        if cls.user.tutor_verified:
            form = forms.UserEditForm1(data=data, instance=cls.user)

            profile_form = forms.UserProfileForm(data=data, instance=cls.user.profile)
            cls.user = form.save()
            profile_form.save()

        phone_number_forms = forms.PhoneNumberFormSet.get_form_instance(
            phone_numbers, cls.user, prefix="phone_number_set"
        )

        if phone_number_forms.is_valid():
            phone_number_forms.save()
        else:
            return False, phone_number_forms.errors

        data_dump = dict(
            cls.user.data_dump if cls.user.data_dump is not None else {}
        ).toObject()

        for key, value in data.items():
            setattr(data_dump, key, value)

        phone_numbers_dump = []
        try:
            phone_numbers_dump = data_dump.phone_numbers
        except AttributeError:
            pass
        phone_numbers_dump.extend(phone_numbers)
        setattr(data_dump, "phone_numbers", phone_numbers_dump)

        dump_form = forms.UserDumpDataForm(
            dict(data_dump=data_dump.__dict__), instance=cls.user
        )
        dump_form.save()

        if cls.user.tutor_intent and not form_instances:
            cls.update_registration_level(3)

        return True, []

    def save_about_tutor_info(cls, data):
        if cls.user.tutor_verified:
            form = forms.TutorAppAboutTutorInfo1(data=data, instance=cls.user)

            profile_form = forms.TutorAppAboutTutorInfo2(
                data=data, instance=cls.user.profile
            )
            cls.user = form.save()
            profile_form.save()

        data_dump = dict(
            cls.user.data_dump if cls.user.data_dump is not None else {}
        ).toObject()

        for key, value in data.items():
            setattr(data_dump, key, value)

        dump_form = forms.UserDumpDataForm(
            dict(data_dump=data_dump.__dict__), instance=cls.user
        )
        dump_form.save()

        return True, []

    def save_photo_info(cls, data):
        form = forms.TutorPhotoInfo(data=data, instance=cls.user.profile)
        form.save()
        return True, []

    # @classmethod
    def save_tutor_info(
        cls,
        education_formset,
        we_formset,
        preference_form,
        policy_form,
        guarantor_formset,
    ):
        # delete all previous info
        cls.user.education_set.all().delete()
        cls.user.workexperience_set.all().delete()
        cls.user.guarantor_set.all().delete()
        # save forms
        education_formset.save()
        we_formset.save()
        guarantor_formset.save()
        preference_form.save()
        policy_form.save()
        cls.profile.save()

    def save_photo_and_video(cls, form, _type="video"):
        if _type == "video":
            form.save()
            # u.approve_video()
            return dict(success=True), 200
        else:
            try:
                form.save()
                # form.save(user=request.user, **self.params())
                cls.profile.image_approved = True
                reward2 = Milestone.get_milestone(Milestone.FACIAL_PHOTO)
                user_models.UserMilestone.objects.get_or_create(
                    user=cls.user, milestone=reward2
                )
                cls.profile.save()
                ret = dict(success=True)
                status = 200
            except cloudinary.api.Error:
                ret = dict(success=False)
                status = 400
            return ret, status

    # @classmethod
    def save_identification(cls, form, doc_type):
        instance = form.save(commit=False)
        instance.user = cls.user
        if doc_type:
            user_models.User.objects.filter(user=cls.user).update(
                submitted_verification=True
            )
            instance.doc = doc_type
        instance.save()
        return dict(success=True), 200

    @staticmethod
    def update_reg_level(email, level):
        user_models.UserProfile.objects.filter(user__email=email).update(
            registration_level=level
        )

    def update_new_tutor_skill(self, ts):
        ts.monthly_booking = self.profile.allow_monthly
        ts.hours_per_day = self.profile.hours
        ts.days_per_week = self.profile.days
        ts.save()
        return ts

    # TODO
    def wallet_amount_available(self):
        return self.user.wallet.amount_available

    @property
    def profile_pic(self):
        return self.user.profile_pic

    def use_referral_credit(self, amount_to_be_paid):
        deduction = 0
        if self.user.can_use_referral_credit(amount_to_be_paid):
            deduction = self.user.ref_instance.get_discount_value(amount_to_be_paid)
            self.user.has_used_credit()
        return deduction

    # TODO: refractor this to use the external api
    @classmethod
    def get_class_profile_pic(self, profile, **kwargs):
        """Returns the url of a user profile image"""
        img = (None,)
        url = None
        if profile.image:
            img = profile.image.image(width=70, height=49, crop="fill", gravity="faces")
            url = profile.image.url
        return url, img

    def get_profile_pic(self, **kwargs):
        """Returns the url of a user profile image"""
        profile = self.user.profile
        img = (None,)
        url = None
        if profile.image:
            img = profile.image.image(width=70, height=49, crop="fill", gravity="faces")
            url = profile.image.url
        return url, img

    @classmethod
    def get_certificate(self, **kwargs):
        identity = kwargs.get("identity")
        if identity:
            img = identity.image(width=30, height=30, crop="fill")
            url = identity.url
            return url, img
        return None, None

    def update_wallet_with_processing_fee(self, request_slug, deduct=False):
        instance_wallet = self.user.wallet
        admin_wallet = user_models.User.get_admin_wallet()
        instance_wallet.pay_processing_fee(request_slug, admin_wallet, deduct=deduct)

    def top_up_wallet_with_amount_paid(self, amount):
        self.user.wallet.top_up2(amount)


class CustomerService(UserService):
    # remember background_check_consent = is_parent_request

    @classmethod
    def create_user_instance(cls, **kwargs):
        password = kwargs["first_name"].lower() + kwargs["last_name"].lower()
        email = kwargs["email"].lower()
        user = user_models.User.objects.filter(email__istartswith=email).first()
        new = False
        if not user:
            user = user_models.User(email=email)
            new = True
        if new:
            print(kwargs)
            print(user)
            user.set_password(password)
            for k, v in kwargs.items():
                if hasattr(user, k) and k not in ['state','vicinity']:
                    setattr(user, k, v)
            user.pay_with_bank = False
            user.save()
        number = kwargs.get("number")
        if number:
            user_no = user.primary_phone_no
            if not user_no:
                exists = user_models.PhoneNumber.objects.filter(number=number).first()
                if not exists:
                    user_models.PhoneNumber.objects.get_or_create(
                        owner=user, number=number, primary=True
                    )
                else:
                    if exists.owner.email == user.email:
                        user_models.PhoneNumber.objects.filter(
                            owner=user, primary=True
                        ).update(number=number)    
            else:
                try:
                    user_models.PhoneNumber.objects.filter(
                        owner=user, primary=True
                    ).update(number=number)
                except IntegrityError:
                    pass
        if kwargs.get("state") and kwargs.get("vicinity"):
            user_models.Location.objects.get_or_create(
                user=user,
                address=kwargs["address"],
                state=kwargs["state"],
                latitude=kwargs["latitude"],
                longitude=kwargs["longitude"],
                vicinity=kwargs["vicinity"],
            )
        if kwargs.get("referral_code"):
            r.models.Referral.activate_referral(user, kwargs["referral_code"].upper())
        return user, password

    @classmethod
    def update_profile_emails(cls, ids, email):
        user_models.User.objects.filter(id__in=list(ids)).update(email=email)
        return user_models.User.objects.filter(id__in=list(ids))


class TutorService(UserService):

    def form_params(self):
        """Form values for tutor's subjects'"""
        hours = self.profile.hours or 4
        return self.ts_service.form_params(hours)

    def deny_application(self, **kwargs):
        self.profile.application_status = user_models.UserProfile.DENIED
        self.profile.application_trial = 3
        self.profile.agent = kwargs.get("agent")
        self.profile.save()
        self.ts_service.delete_all()

    def client_actions_on_request_post(self, request, **kwargs):
        return ex_service.ExternalService.save_first_form(request, self, **kwargs)

    def request_form(self, request, get_form=True, **kwargs):
        """Fetches request form with all initial parameters.
        Returns a dictionary of the form and if a new request
        instance was created."""
        response = ex_service.ExternalService.populate_form(request, self, **kwargs)
        if get_form:
            if self.is_tutor:
                return response
        response.pop("form", None)
        return response

    def get_available_weekdays(self):
        days_in_week = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        montly_calendar = self.user.monthly_calender_client(months=4)
        wk = filter(
            lambda x: len(x.get_start_times()) > 0, get_weekdays_object(montly_calendar)
        )
        wki = [x.name for x in wk]
        return dict(
            weekdays=[x for x in sorted(wki, key=days_in_week.index)],
            durations=[
                dict(name=x.name, duration=x.get_start_times())
                for x in sorted(wk, key=lambda v: days_in_week.index(v.name))
            ],
        )

    def week_day_with_times(self):
        return [
            "{} from {}".format(x["name"], x["duration"][0][1])
            for x in self.get_available_weekdays()["durations"]
        ]

    @classmethod
    def total_number_of_tutors(cls):
        return user_models.VerifiedTutor.objects.all().count()

    def get_price_for_subject(self, skill_name):
        skill = self.active_tutorskills().filter(skill__name=skill_name).first()
        # if skill:
        #     return skill.price
        return 5000

    def specific_skill(self, pk, name=None):
        if name:
            return self.active_tutorskills().filter(skill__name=name).first()
        return self.active_tutorskills().filter(pk=pk).with_ratings().first()

    def request_form_params(self):
        return self.ts_service.active(form_details=True, get_all=True)

    @classmethod
    def get_tutors_teaching_skill(cls, skill_name, region, online=False):
        from skills.models import TutorSkill

        users_with_location = user_models.Location.objects.users_with_constituencies(
            region
        )
        # import pdb; pdb.set_trace()
        tutor_with_skill = TutorSkill.objects.active().with_skill_and_match_tutors(
            skill_name, users_with_location
        )
        if online:
            tutor_with_skill = TutorSkill.objects.active().with_skill_and_match_tutors(
                skill_name
            )

        result = (
            user_models.User.objects.filter(pk__in=list(tutor_with_skill))
            .annotate_active_skill()
            .exclude(approved_profile=False)
        )
        # import pdb; pdb.set_trace()
        if online:
            return result.filter(teach_online=True)
        return result

    def found_subjects(self, subjects):
        return self.ts_service.found_subjects(subjects)

    def reject_image(self, **kwargs):
        try:
            cloudinary.api.delete_resources([self.profile_pic.public_id])
        except:
            pass
        self.profile.image = None
        self.profile.agent = kwargs.get("agent")
        self.profile.image_approved = False
        self.profile.save()
        # Send Email to Tutor
        re_upload_profile_pic.delay(self.user.id)
