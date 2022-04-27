import base64
import datetime
import logging
import math
import os
import json
import functools
import typing
import pytz
import reviews
import skills
from allauth.socialaccount.templatetags.socialaccount import get_social_accounts
from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.utils.encoding import smart_str
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Avg, Count
from django.utils import timezone
from django.utils.functional import cached_property
from geopy import GoogleV3
from registration.models import Schedule
from repoze.lru import lru_cache
from rewards.models import Milestone
from schedule.models import Calendar, Event, Rule
from schedule.periods import Period
from skills.scheduler import AvailableDay

from .levels import (
    level_one_requirements,
    level_two_requirements,
    level_three_requirements,
    level_four_requirements,
    TuteriaLevel,
)
from .pre_tutor_registration import PreRegistration
import cloudinary

logger = logging.getLogger(__name__)


def _bulk_create_event(calender, events, user=None):
    arrays = [Event(calendar=calender, creator=user, **e) for e in events]
    return Event.objects.bulk_create(arrays)


def get_rule():
    try:
        rule = Rule.objects.get(frequency="WEEKLY")
    except ObjectDoesNotExist:
        rule = Rule(
            frequency="WEEKLY", name="Weekly", description="will recur once every Week"
        )
        rule.save()
    return rule


def _create_event(
    calendar,
    title=None,
    start_time=None,
    end_time=None,
    commit=True,
    reoccur_time=None,
    reoccur=False,
    user=None,
    rule=None,
):
    """
    Creates an event.
    """
    if not reoccur:
        data = {
            "title": title,
            "start": start_time,
            "end": end_time,
            "calendar": calendar,
        }
    else:
        rule = rule or get_rule()
        if not reoccur_time:
            reoccur_time = end_time
        data = {
            "title": title,
            "start": start_time,
            "end": end_time,
            "calendar": calendar,
            "end_recurring_period": reoccur_time,
            "rule": rule,
        }

    event = Event(creator=user, **data)
    if commit:
        event.save()
    return event


def dedupe(items, key=None):
    seen = set()
    for item in items:
        val = item if key is None else key(item)
        if val not in seen:
            yield item
            seen.add(val)


class BookingMixin(object):
    time_stripper = datetime.datetime.strptime
    date_format = "%d-%m-%Y %I%p"
    server_timezone = pytz.timezone(settings.TIME_ZONE)

    @property
    def group_lessons(self):
        from bookings.models import Booking

        pk = self.t_bookings.filter(bookings__is_group=True).values_list(
            "order", flat=True
        )
        return Booking.objects.filter(pk__in=set(pk))

    def create_calendar(self, calendar_type):
        calendar = Calendar(
            name="{} Schedule for {}".format(calendar_type.title(), self.email),
            slug="%s_%s" % (self.slug, calendar_type),
        )
        calendar.save()
        return calendar

    @cached_property
    def booking_calendar(self):
        # import pdb; pdb.set_trace()
        return self.get_available_calendar(Schedule.BOOKING)

    @cached_property
    def available_calendar(self):
        return self.get_available_calendar(Schedule.AVAILABILITY)

    def one_time_booking_event(self, **kwargs):
        """
        kwargs are
        'title': '',
        'start_time': datetime,
        'end_time': datetime,
        """
        return _create_event(
            self.booking_calendar, user=self, rule=self.get_rule, **kwargs
        )

    @lru_cache(maxsize=3, timeout=60)
    def get_available_calendar(self, cal_type=Schedule.AVAILABILITY):
        # import pdb; pdb.set_trace()
        schedule, _ = Schedule.objects.get_or_create(tutor=self, calender_type=cal_type)
        if schedule.calender is None:
            text = "availability" if cal_type == Schedule.AVAILABILITY else "booking"
            schedule.calender = self.create_calendar(text)
            schedule.save()
        return schedule.calender

    def one_time_available_event(self, **kwargs):
        """
        kwargs are
        'title': '',
        'start_time': datetime,
        'end_time': datetime,
        """
        return _create_event(
            self.available_calendar, rule=self.get_rule, user=self, **kwargs
        )

    @cached_property
    def get_rule(self):
        return get_rule()

    def bulk_create_available(self, events, prepared=False):
        rule = self.get_rule
        response = []
        if not prepared:
            for event in events:
                ee = dict(
                    start=self.time_stripper(event["start"], self.date_format)
                    .replace(tzinfo=self.server_timezone)
                    .astimezone(pytz.UTC),
                    end=self.time_stripper(event["end"], self.date_format)
                    .replace(tzinfo=self.server_timezone)
                    .astimezone(pytz.UTC),
                    title="Booking on %s" % event["start"],
                )
                reoccur_count = event["reoccur_count"]
                if reoccur_count > 1:
                    end_time = (
                        self.time_stripper(event["end"], self.date_format)
                        .replace(tzinfo=self.server_timezone)
                        .astimezone(pytz.UTC)
                    )
                    end_reoccur_period = end_time + relativedelta(
                        weeks=reoccur_count - 1
                    )
                    # pdb.set_trace()
                    ee.update(end_recurring_period=end_reoccur_period, rule=rule)
                response.append(ee)
        else:
            response = events

        return _bulk_create_event(self.available_calendar, response, user=self)

    def update_event(self, events, params):
        assert len(events) == len(params)

        result = [
            self.update_single_event(event, params[i]) for i, event in enumerate(events)
        ]
        return result

    def get_occurrence(self, event, date, old_date=None):
        """
        get a specific occurrence (date) of an event
        """
        if not old_date:
            old_date = event.start
        occurrence = event.get_occurrence(old_date)

        def sample_filter(x):
            same_date = x.start.date() == old_date.date()
            within_hour = x.start.hour <= old_date.hour <= x.end.hour
            return x.start == old_date or (same_date and within_hour)

        if occurrence is None:
            vv = event.get_occurrences(old_date, date + relativedelta(months=6))
            try:
                # occurrence = list(filter(lambda x: x.start == old_date, vv))[0]
                occurrence = list(filter(sample_filter, vv))[0]
                # occurrence = [z for z in vv if sample_filter(z)]
            except IndexError:
                occurrence = None
        # last attempt at getting occurrence
        if occurrence is None:
            # get all occurrences in all the event passed
            events = self.available_calendar.events.all()
            now = timezone.now()
            period = Period(events, now, date + relativedelta(months=6))
            occurrences = period.get_occurrences()

            def sample_filter2(x):
                same_date = x.start.date() == old_date.date()
                return same_date

            try:
                # occurrence = list(filter(lambda x: x.start == old_date, vv))[0]
                occurrence = list(filter(sample_filter2, occurrences))[0]
            except IndexError:
                occurrence = None
        return occurrence

    def update_single_event(self, event, param):
        occurrence = self.get_occurrence(event, param["start"], param["old_start"])
        if occurrence:
            if param["cancelled"]:
                occurrence.cancel()
            else:
                occurrence.move(param["start"], param["end"])
        return occurrence

    @property
    def gender_string(self):
        if self.profile.gender == "M":
            first_person, third_person = "he", "him"
        else:
            first_person, third_person = "she", "her"
        return "Review {} also to see what {} said about you and close this booking.".format(
            third_person.lower(), first_person.lower()
        )

    def update_schedule_occurrences(self, events, occurrence_dict):
        def date_with_utc(tt):
            return (
                self.time_stripper(tt, "%d-%m-%Y %I:%M %p")
                .replace(tzinfo=self.server_timezone)
                .astimezone(pytz.UTC)
            )

        occurrences = []
        for x in occurrence_dict:
            v = dict(
                old_start=date_with_utc(x["date"] + " " + x["old_start"]),
                start=date_with_utc(x["date"] + " " + x["start"]),
                end=date_with_utc(x["date"] + " " + x["end"]),
                cancelled=x.get("cancelled", False),
            )
            occurrences.append(v)
        # occurrences = [dict(old_start=date_with_utc(x['date'] + " " + x["old_start"]),
        # start=date_with_utc(x['date'] + " " + x["start"]),
        # end=date_with_utc(x['date'] + " " + x["end"]), cancelled=x.get("cancelled", False))
        # for x in occurrence_dict]

        return self.update_event(events, occurrences)

    # @lru_cache(maxsize=3, timeout=60)
    # def get_free_days(self, months=1):
    # return (self.schedule_set.available_days().get_occurrences(months=months),
    # self.schedule_set.booked_days().get_occurrences(months=months))
    #

    def get_free_clash_and_clashed_booked_days(self, months=1):
        return self.schedule_set.free_days(
            [self.available_calendar, self.booking_calendar], months
        )

    def calendar(self, hours=None, months=1):
        free_result, clash, booked = self.calendar_result
        new_free_result = filter(lambda x: x["cancelled"] is False, free_result)
        clash_result = [AvailableDay(x, hours, booked).tutor_display() for x in clash]
        # clash_result = [AvailableDay(x, hours, booked).display_result() for x in clash]
        new_clash = filter(lambda x: len(x["times"]) > 0, clash_result)
        final_clash_result = dedupe(new_clash, key=lambda x: x["date"])
        merged = new_free_result + list(final_clash_result)
        return merged

    @cached_property
    def get_tuple_of_calendar(self):
        return self.get_free_clash_and_clashed_booked_days(months=4)

    def calender_client(self, hours=None, months=None):
        """Calender for client to book from. uses the display_result function in AvailableDay"""
        free, clash, booked = self.get_tuple_of_calendar
        free_result = [AvailableDay(x, hours).display_result() for x in free]
        # free_result, clash, booked = self.calender_result_client
        new_free_result = list(filter(lambda x: x["cancelled"] is False, free_result))
        clash_result = [AvailableDay(x, hours, booked).display_result() for x in clash]
        new_clash = list(filter(lambda x: len(x["times"]) > 0, clash_result))
        final_clash_result = dedupe(new_clash, key=lambda x: x["date"])
        merged = new_free_result + list(final_clash_result)
        return merged

    def monthly_calender(self, hours=1, months=1):
        return self.calendar(hours=hours, months=months)

    def monthly_calender_client(self, hours=1, months=1):
        return self.calender_client(hours=hours, months=months)

    def hourly_calender(self, months=1):
        return self.calendar(months=months)

    def hourly_calender_client(self, months=1):
        return self.calender_client(months=months)

    def return_no_duplicates(self, result_set):
        no_dup = dedupe(result_set, key=lambda x: x["date"])
        return list(no_dup)

    def no_of_hours_taught(self):
        return self.t_bookings.get_no_of_hours_taught()

    def active_bookings(self):
        return self.t_bookings.active_b().count()

    @cached_property
    def calendar_result(self):
        free, clash, booked = self.get_free_clash_and_clashed_booked_days(months=4)
        free_result = [AvailableDay(x).tutor_display() for x in free]
        # free_result = [AvailableDay(x).display_result() for x in free]
        new_free_result = filter(lambda x: x["cancelled"] is False, free_result)
        clash_result = [AvailableDay(x).tutor_display() for x in clash]
        # clash_result = [AvailableDay(x).display_result() for x in clash]
        # action = lambda x: AvailableDay(x).display_result()
        # if special:
        #     action = lambda x: AvailableDay(x).tutor_display()
        # free_result = [action(x) for x in free]
        # return free_result, clash, booked
        return new_free_result, self.return_no_duplicates(clash_result), booked

    @cached_property
    def calender_result_client(self):
        free, clash, booked = self.get_free_clash_and_clashed_booked_days(months=4)
        free_result = [AvailableDay(x).display_result() for x in free]
        # new_free_result = filter(lambda x: x['cancelled'] is False, free_result)
        new_free_result = free
        # clash_result = [AvailableDay(x).display_result() for x in clash]
        clash_result = clash
        # action = lambda x: AvailableDay(x).display_result()
        # if special:
        #     action = lambda x: AvailableDay(x).tutor_display()
        # free_result = [action(x) for x in free]
        # return free_result, clash, booked
        return new_free_result, clash_result, booked
        # return new_free_result,self.return_no_duplicates(clash_result),booked

    def booked_days(self):
        _, booked, _ = self.calendar_result
        # booked_days = [AvailableDay(x).tutor_display() for x in booked]
        # return self.return_no_duplicates(booked_days)
        return booked

    def available_days(self, months=4):
        # free, clash, _ = self.get_free_clash_and_clashed_booked_days(months)
        # free_result = [AvailableDay(x).tutor_display() for x in free]
        # # clash_result = [AvailableDay(x).tutor_display() for x in clash]
        # # book = self.return_no_duplicates(free)
        # new_free_result = filter(lambda x: x['cancelled'] is False, free_result)
        # return new_free_result
        free, _, _ = self.calendar_result
        return free

    def post_review(self, ts, review_text, score, booking=None, **kwargs):
        review = reviews.models.SkillReview(
            tutor_skill=ts,
            commenter=self,
            review=review_text,
            review_type=1,
            booking=booking,
            score=score,
        )
        review.save()

    @cached_property
    def my_reviews(self):
        return reviews.models.SkillReview.objects.reviews_on_all_subjects(self.email)

    @property
    def rating_integer(self):
        dec, integer = math.modf(self.my_reviews.average_score())
        return range(int(integer))

    @property
    def rating_decimal(self):
        dec, integer = math.modf(self.my_reviews.average_score())
        if dec >= 0.2:
            return True
        return False

    @cached_property
    def failed_skills_count(self):
        return (
            self.tutorskill_set.filter(status=skills.models.TutorSkill.DENIED).count()
            < 10
        )

    def has_paga(self):
        return self.userpayout_set.has_paga().exists()

    def has_bank(self):
        return self.userpayout_set.has_bank().exists()

    @cached_property
    def bank_payout(self):
        return self.userpayout_set.has_bank().first()

    @cached_property
    def paga_payout(self):
        return self.userpayout_set.has_paga().first()

    def can_use_referral_credit(self, amount=0):
        if hasattr(self, "ref_instance"):
            if (
                self.ref_instance.used_credit is False
                and self.ref_instance.referred_by is not None
            ):
                if amount >= 15000:
                    return True
        return False

    def check_referral_credit_usage(self):
        if hasattr(self, "ref_instance"):
            return self.ref_instance.used_credit is False
        return False

    def get_referral_instance(self):
        from referrals.models import Referral

        return Referral.get_instance(self)

    def has_used_credit(self):
        if hasattr(self, "ref_instance"):
            referral = self.ref_instance
            referral.used_credit = True
            referral.save()

    def trigger_payment(self, payment_type, amount_to_withdraw, ch=False, force=False):
        self.wallet.trigger_payment(payment_type, amount_to_withdraw, ch, force)
        # if payment_type == 'Bank':
        #     payout = self.bank_payout
        #     charge = 200 if amount_to_withdraw > 100000 else 150
        # else:
        #     payout = None
        #     charge = (amount_to_withdraw * 1 / 100) + 70
        # if ch:
        #     charge = 0
        # self.wallet.initiate_withdrawal(payout=payout, charge=charge,
        #                                 amount=amount_to_withdraw,force=force)


class VerificationMixin(object):
    def custom_header(self):
        h = self.profile.custom_header
        if h:
            return h
        return "Private home tutor in {} Nigeria.".format(self.location)

    def tutor_type(self):
        v = self.profile.tutor_type
        if v:
            return v
        return self.profile.get_level_display().title()

    @cached_property
    def qualifications(self):
        result = self.education_set.first()
        return result.degree

    @property
    def ratings(self):
        from reviews.models import SkillReview

        return (
            SkillReview.objects.reviews_on_all_subjects(self)
            .aggregate(Avg("score"))
            .get("score__avg")
            or 0
        )

    @property
    def phone_number(self):
        s = self.phonenumber_set.all()
        o = [d for d in s if d.primary]
        return o[0] if len(o) > 0 else ""
        # return self.phonenumber_set.get_primary()

    @property
    def is_tutor(self):
        """If user is already a tutor"""
        return self.profile.application_status == self.profile.VERIFIED

    @cached_property
    def can_tutor(self):
        social = (
            self.facebook_verified or self.google_verified or self.linkedin_verified
        )
        return self.identity is not None and self.email_verified and social

    def social_verified(self):
        return any(
            [self.facebook_verified, self.google_verified, self.linkedin_verified]
        )

    @cached_property
    def vicinity(self):
        vici = self.location_set.home_address()
        if vici:
            return vici.vicinity if vici.vicinity else vici.state
        return ""

    @cached_property
    def home_address(self):
        locations = self.location_set.all()
        if len(locations) > 0:
            return locations[0]
        return None
        # return self.location_set.home_address()

    @cached_property
    def t_address(self):
        addresses = self.location_set.all()
        t_address = [x for x in addresses if x.addr_type == 2]
        if len(t_address) > 0:
            return t_address[0]
        if len(addresses) > 0:
            return addresses[0]

    @cached_property
    def t_address2(self):
        addresses = self.super_loc
        t_address = [x for x in addresses if x.addr_type == 2]
        if len(t_address) > 0:
            return t_address[0]
        if len(addresses) > 0:
            return addresses[0]

    @cached_property
    def teacher(self):
        return any(
            [v for v in self.workexperience_set.all() if "teacher" in v.role.lower()]
        )

    @cached_property
    def tutor_req(self):
        return PreRegistration(self)

    @cached_property
    def average_booking_price(self):
        x = self.orders.all()
        u = [y.total_price for y in x]
        return round(sum(u) / len(u), 2)

    @cached_property
    def came_from(self):
        x = self.baserequesttutor_set.all()
        paid = [y for y in x if y.status == y.PAYED]
        if len(paid) > 0:
            return paid[0].get_where_you_heard_display()
        if len(x) > 0:
            return x[0].get_where_you_heard_display()

    @cached_property
    def tuteria_verified(self):
        social_verification = True
        # social_verification = (
        #     self.facebook_verified
        #     or self.twitter_verified
        #     or self.google_verified
        #     or self.linkedin_verified
        # )
        return all([self.id_verified, social_verification, self.email_verified])

    @cached_property
    def all_social_verified(self):
        return True
        # return all(
        #     [self.facebook_verified, self.google_verified, self.linkedin_verified]
        # )

    @property
    def any_verification(self):
        return any(
            [
                self.id_verified,
                # self.facebook_verified,
                # self.google_verified,
                # self.linkedin_verified,
                self.email_verified,
            ]
        )

    @property
    def identity_exists(self):
        return hasattr(self, "identification")

    @property
    def complete_profile(self):
        profile = self.profile
        return all(
            [
                self.first_name,
                self.last_name,
                self.phone_number,
                self.email,
                self.home_address,
                profile.description,
                profile.gender,
                profile.dob,
            ]
        )

    @cached_property
    def social_account_list(self):
        return get_social_accounts(self)

    @cached_property
    def facebook_verified(self):
        return True
        # return self.social_account_list.get("facebook") is not None

    @cached_property
    def google_verified(self):
        return True
        # return self.social_account_list.get("google") is not None

    @cached_property
    def twitter_verified(self):
        return True
        # return self.social_account_list.get("twitter") is not None

    @cached_property
    def linkedin_verified(self):
        return True
        # return self.social_account_list.get("linkedin_oauth2") is not None

    @cached_property
    def phone_number_details(self):
        number = self.primary_phone_no
        if number:
            return number.number
        return number

    def the_number(self):
        number = self.primary_phone_no
        if number:
            return str(number.number)

    @cached_property
    def primary_phone_no(self):
        phone_numbers = self.phonenumber_set.all()
        is_primary = [x for x in phone_numbers if x.primary]
        if len(is_primary) > 0:
            return is_primary[0]
        return phone_numbers.first()
        # primary = self.phonenumber_set.filter(primary=True).first()
        # if not primary:
        #     primary = self.phonenumber_set.first()
        # return primary

    @cached_property
    def pending_bg_check(self):
        count = self.background_checks
        return count.count() > 0 and self.background_checks.pending().exists()

    @cached_property
    def background_checked(self):
        return self.background_checks.passed().exists()


class TutorSkillMixin(object):
    # tutoring skill methods
    @property
    def active_skills(self):
        return self.tutorskill_set.active()

    @property
    def pending_skills(self):
        return self.tutorskill_set.pending()

    @property
    def require_modification_skills(self):
        return self.tutorskill_set.require_modification()

    @property
    def suspended_skills(self):
        return self.tutorskill_set.suspended()

    @property
    def denied_skills(self):
        return self.tutorskill_set.denied()

    @property
    def no_subjects(self):
        return self.tutorskill_set.all().valid_subjects().count() == 0

    @property
    def cancellation_policy(self):
        return self.profile.cancellation

    @property
    def cancellation_policy_text(self):
        cancellation_hours = {"Flexible": 6, "Moderate": 12, "Strict": 24}
        text = "if you need to cancel or reschedule a lesson, {} requires you do so at least {} hours before your next lesson."
        return text.format(
            self.first_name, cancellation_hours[self.cancellation_policy]
        )

    @cached_property
    def tutoring_address(self):
        return self.profile.tutoring_address

    @property
    def travel_policy(self):
        travel_text = {
            "user": "your home",
            "tutor": "tutor's location",
            "neutral": "a neutral location",
        }

        return "Lessons hold at {}".format(travel_text[self.profile.tutoring_address])

    def get_lat_lng(self):
        x = self.location_set.actual_tutor_address()
        if x.latitude:
            return "{},{}".format(x.latitude, x.longitude)
        return x.full_address

    @property
    def travel_policy_text(self):
        text = "When you book lessons, {} will usually travel anywhere {} from {} to deliver lessons (e.g from {} to {})"
        state, vicinity = self.address_components
        home_address = self.home_address
        profile = self.profile
        distance = profile.get_tutoring_distance_display()
        if home_address:
            logger.info(home_address.distances)
        try:
            td = profile.tutoring_distance
            destination = ""
            if home_address:
                hd = home_address.distances
                destination = hd[td][0]["name"]
        except IndexError as e:
            logger.debug(e)
            destination = ""
        except KeyError as e:
            destination = ""
        except TypeError as e:
            destination = ""
        if vicinity and destination:
            return text.format(
                self.first_name, distance, vicinity, vicinity, destination
            )
        return "When you book lessons, {} will usually travel anywhere {} from {} to deliver lessons.".format(
            self.first_name, distance, vicinity
        )

    @property
    def travel_policy_profile(self):
        text = "{} will usually travel <strong>{}</strong> from {}"
        state, vicinity = self.address_components
        home_address = self.home_address
        profile = self.profile
        distance = profile.get_tutoring_distance_display()
        return text.format(self.first_name, distance, vicinity)

    def education_degree(self):
        last_cert = self.education_set.last()
        if last_cert:
            return last_cert.degree
        return ", ".join(self.education_set.values_list("degree", flat=True))

    def level_percent(self):
        return TuteriaLevel(self.profile.level).admin_percent()

    def earning_percent(self):
        return 100 - self.level_percent()

    def update_level(self):
        profile = self.profile
        if profile.level == 0 and level_one_requirements(self):
            profile.level = 1
        elif profile.level == 1 and level_two_requirements(self):
            profile.level = 2
        elif profile.level == 2 and level_three_requirements(self):
            profile.level = 3
        else:
            if profile.level == 3 and level_four_requirements(self):
                profile.level = 4
        profile.save()


class TuteriaUserMixin(VerificationMixin, BookingMixin, TutorSkillMixin):
    def to_mailing_list(self):
        from users.tasks import post_to_email_list

        if self.profile.application_status == TutorProfileMixin.VERIFIED:
            # post_to_email_list(self.pk, "verified-tutor")
            post_to_email_list.delay(self.pk, "verified-tutor")
        else:
            applicant = self.as_applicant()
            if applicant:
                # post_to_email_list(self.pk, "tutor-applicant")
                post_to_email_list.delay(self.pk, "tutor-applicant")

    def as_applicant(self):
        from tutor_management.models import TutorApplicantTrack

        found = TutorApplicantTrack.objects.filter(pk=self.pk).first()
        return found

    def completed_profile_application(self):
        instance = self.as_applicant()
        if instance:
            if self.profile.application_status == TutorProfileMixin.VERIFIED:
                if self.date_joined.year >= 2022:
                    return instance.current_step == "application-verified"
        return True

    @property
    def login_code(self):
        dump = self.data_dump or {}
        login_code = dump.get("login_code")
        return login_code

    def save_login_code(self, code=""):
        self.data_dump = {**(self.data_dump or {}), "login_code": code}
        self.save()

    def save_thinkific_data(self, data):
        self.data_dump = {**(self.data_dump or {}), "thinkific": data}
        self.save()

    def save_tax_info(self, tax_id):
        dump = self.data_dump or {}
        tax_info = dump.get("tax_info") or {}
        tax_info["tax_id"] = tax_id
        dump["tax_info"] = tax_info
        self.data_dump = dump
        self.save()

    @property
    def tax_id(self):
        dump = self.data_dump or {}
        tax_info = dump.get("tax_info") or {}
        original = tax_info.get("tax_id")
        in_form = self.revamp_data("paymentInfo", "taxId")
        return original or in_form

    @property
    def thinkific_data(self):
        dump = self.data_dump or {}
        thinkific = dump.get("thinkific") or {}
        return thinkific

    @property
    def thinkific_user_id(self):
        return self.thinkific_data.get("user_id")

    @property
    def thinkific_url(self):
        if self.thinkific_user_id:
            VIDEO_HOST = "https://courses.tuteria.com"
            password = "thisisacomplicatedpass237232"
            authString = f"email={self.email}&password={password}"
            encoded = base64.b64encode(authString.encode("utf-8"))
            return f"{VIDEO_HOST}/users/sign_in?q={encoded.decode('utf-8')}"
        return ""

    @property
    def user_wallet_balance(self):
        dump = self.data_dump or {}
        wallet = dump.get("request_wallet") or 0
        return wallet

    def can_use_wallet(self, amount):
        return self.user_wallet_balance >= amount

    def add_to_wallet(self, amount, reset=False):
        new_balance = self.user_wallet_balance + amount
        if reset:
            new_balance = amount
        previous_dump = self.data_dump or {}
        self.data_dump = {
            **previous_dump,
            "request_wallet": float("%.2f" % new_balance),
        }
        self.save()

    def deduct_from_wallet(self, amount):
        if self.can_use_wallet(amount):
            difference = self.user_wallet_balance - amount
            self.add_to_wallet(difference, reset=True)
        elif self.user_wallet_balance > 0:
            self.add_to_wallet(0, reset=True)

    def update_phone_number(self, new_number):
        from users.models import PhoneNumber

        self.phonenumber_set.all().delete()
        PhoneNumber.objects.create(
            owner=self, number=f"+{new_number}", verified=True, primary=True
        )

    def update_revamp_data(self, data):
        user_dump = self.data_dump or {}
        tutor_dump = user_dump.get("tutor_update") or {}
        tutor_dump.update(**data)
        self.data_dump = {**(self.data_dump or {}), "tutor_update": tutor_dump}
        self.save()

    @property
    def tests_taken(self):
        return self.revamp_data("testsTaken", default=[]) or []

    def update_test_taken(self, additional_tests):
        # remove duplicates
        rr = []
        names = []
        for o in additional_tests:
            if o["skill"] not in names:
                names.append(o["skill"])
                rr.append(o)
        self.update_revamp_data({"testsTaken": rr})
        self.save()

    def revamp_data(self, key, _value=None, default=None):
        data_dump = self.data_dump
        if data_dump:
            tutor_profile = data_dump.get("tutor_update")
            if tutor_profile:
                value = tutor_profile.get(key)
                if value and _value:
                    return value.get(_value) or default
                return value or default

    @property
    def years_of_experience(self):
        profile = self.profile
        if profile.years_of_teaching:
            return profile.yoe_display

        work_history = (
            self.revamp_data("educationWorkHistory", "workHistories", []) or []
        )
        initial_value = 0
        teaching_history = [x for x in work_history if x.get("isTeachingRole")]

        def func(accumulator, currentValue):
            current_year = timezone.now().year
            start_year = currentValue.get("startYear") or 0
            end_year = currentValue.get("endYear") or 0

            experience = (
                (current_year - int(start_year))
                if currentValue.get("isCurrent")
                else (int(end_year) - int(start_year))
            )
            return accumulator + experience + 1

        reducer = functools.reduce(func, teaching_history, initial_value)
        # if reducer == 0:
        #     return "Ready to start tutoring"
        if 0 < reducer < 2:
            return "More than 1 year experience"
        if 2 < reducer < 5:
            return "More than 3 years experience"
        if 5 < reducer < 10:
            return "More than 6 years experience"
        if reducer > 10:
            return "More than 10 years exprience"
        return reducer

    def availability_info(self):
        data = self.revamp_data("availability") or {}
        availability = data.pop("availability", {})
        result = {key: value for key, value in availability.items() if value}
        return {
            **data,
            "lastCalendarUpdate": data.get("lastCalendarUpdate", ""),
            "availability": result,
        }

    @property
    def lastCalendarUpdate(self):
        result = self.availability_info()
        return result["lastCalendarUpdate"]

    @classmethod
    def update_last_calendar_update(self):
        queryset = self.objects.exclude(
            data_dump__tutor_update__availability__isnull=True
        ).filter(data_dump__tutor_update__availability__lastCalendarUpdate__isnull=True)
        for u in queryset.all():
            u.data_dump["tutor_update"]["availability"][
                "lastCalendarUpdate"
            ] = datetime.datetime.now().isoformat()
            u.save()
        return queryset

    @property
    def cloudinary_image(self):
        tutor_update = (self.data_dump or {}).get("tutor_update") or {}
        identity = tutor_update.get("identity") or {}
        image = identity.get("profilePhoto")
        # image = self.data_dump["tutor_update"]["identity"]["profilePhoto"]
        if image:
            instance = cloudinary.CloudinaryImage(public_id=image)
            return instance.build_url(
                width=132, height=132, format="jpg", crop="fill", gravity="face"
            )
        return ""

    @property
    def is_premium(self):
        value = self.revamp_data("others", "premium")
        return value

    @property
    def delivery(self):
        value = self.revamp_data("teachingProfile", "onlineProfile")
        # value = self.data_dump["tutor_update"]["teachingProfile"]["onlineProfile"]
        if value and value.get("acceptsOnline"):
            return ["physical", "online"]
        return ["physical"]

    def get_tutor_skills(self, tutorskills):
        result = [x for x in tutorskills if x.tutor_id == self.pk]
        return result

    def get_search_skill(self, tutorskills, search_subject, hourlyRate=0):
        from .related_subjects import get_related_subjects

        if search_subject:
            value = [
                x
                for x in self.get_tutor_skills(tutorskills)
                if x.skill.name.lower() == search_subject.lower()
            ]
        else:
            value = self.get_tutor_skills(tutorskills)
        skills = [
            x.skill.name.lower()
            for x in self.get_tutor_skills(tutorskills)
            if x.status == x.ACTIVE
        ]
        skill_with_status = [
            {"name": x.skill.name, "status": x.get_status_display()}
            for x in self.get_tutor_skills(tutorskills)
            if x.status not in [x.DENIED, x.FREEZE, x.SUSPENDED]
        ]
        if value:
            related = [
                x.title()
                for x in get_related_subjects(value[0].skill.name)
                if x in skills
            ]
            rr = {
                "name": value[0].skill.name,
                "headline": value[0].heading,
                "description": value[0].description,
                "related": related,
                "skills": [x.title() for x in skills],
                "skills_with_status": skill_with_status
                # "related": [
                #     x.title() for x in get_related_subjects(value[0].skill.name)
                # ],
            }
            if hourlyRate == 0:
                rr["hourlyRate"] = float(value[0].price)
            return rr
        return {}

    def determine_distance(self, distance_array):
        region = self.data_dump["tutor_update"]["personalInfo"]["region"]
        found = [x for x in distance_array if x[1].region == region]
        if found:
            return found[0][0]

    @property
    def profile_pic(self):
        img = self.profile.image
        if img:
            return img
        return os.getenv("DEFAULT_IMAGE", "placeholder-white")

    @property
    def address_components(self):
        address = self.location_set.home_address()
        state = ""
        vicinity = ""
        if address:
            state = address.state
            vicinity = address.locality
        return state, vicinity

    def update_to_new_level(self):
        profile = self.profile
        profile.level = TuteriaLevel.AMATEUR
        profile.save()

    @property
    def tutor_address_components(self):
        address = self.location_set.actual_tutor_address()
        if address:
            state = address.state
            vicinity = address.vicinity
        else:
            state = ""
            vicinity = ""
        return state, vicinity

    @property
    def location(self):
        state, vicinity = self.tutor_address_components
        return "{}, {}".format(vicinity, state)

    @property
    def state(self):
        state, _ = self.tutor_address_components
        return state

    @cached_property
    def has_valid_address(self):
        tutor_address = self.location_set.filter(
            addr_type=LocationMixin.TUTOR_ADDRESS
        ).first()
        if not tutor_address:
            return False
        if not tutor_address.latitude or not tutor_address.longitude:
            return False
        if not tutor_address.vicinity:
            return False
        if (3 < tutor_address.latitude < 15) and (3 < tutor_address.latitude < 15):
            return True
        return False

    @cached_property
    def has_mini_calendar(self):
        from .services import CalendarService

        result = CalendarService.get_calendar_detail(self)
        return result

    @property
    def hours_elapsed_from_signup(self):
        """Hours elapsed since user joined the site."""
        today = timezone.now()
        d = today - self.date_joined
        return int(d.total_seconds() / 3600)

    @property
    def hours_from_being_verified(self):
        from users.models import UserProfile

        if hasattr(self, "profile"):
            return self.get_duration(self)
        else:
            user, _ = UserProfile.objects.get_or_create(user=self)
            return self.get_duration(user.user)

    def get_duration(self, user):
        today = timezone.now()
        if user.profile.date_approved:
            d = today - user.profile.date_approved
            return int(d.total_seconds() / 3600)
        else:
            p = user.profile
            p.date_approved = today
            p.save()

    def skills_with_quiz_not_taken(self):
        return (
            self.tutorskill_set.exclude(skill__quiz=None)
            .annotate(taken_quiz=Count("sitting"))
            .filter(taken_quiz=0)
        )

    def admin_search_parameters(self, tutorskills, key=None):
        rr = self.search_parameters(tutorskills)
        if key:
            return rr[key]
        return rr

    def search_parameters(self, tutorskills, with_distance=0, search_subject=""):
        def get_from_dump(x, parent):
            uu = x.data_dump
            if uu:
                pp = uu.get("tutor_update") or {}
                return pp.get(parent) or {}
            return {}

        x = self
        return {
            "userId": x.slug,
            "email": x.email,
            "firstName": x.first_name,
            "lastName": x.last_name,
            "gender": "male" if x.profile.gender == "M" else "female",
            "photo": x.cloudinary_image,
            "level": "premium"
            if get_from_dump(x, "others").get("premium")
            else "regular",
            "delivery": x.delivery,
            "dateOfBirth": get_from_dump(x, "personalInfo").get("dateOfBirth") or "",
            "phone": get_from_dump(x, "personalInfo").get("phone") or "",
            "requestPending": x.pending_to_be_booked,
            "requestsDeclined": x.requestsDeclined,
            "totalJobsAssigned": x.totalJobsAssigned,
            "totalJobsAccepted": x.totalJobsAccepted,
            "requestsNotResponded": x.requestsNotResponded,
            "activeBookings": [
                {
                    "startDate": j.first_session.strftime("%Y-%m-%d")
                    if j.first_session
                    else "",
                    "endDate": j.last_session.strftime("%Y-%m-%d")
                    if j.last_session
                    else "",
                    "schedule": []
                    # "schedule": list(
                    #     {
                    #         f'{k.start.strftime("%A")}: {k.start.strftime("%-I%p")} - {k.end.strftime("%-I%p")}'
                    #         for k in j.bookingsession_set.all()
                    #     }
                    # ),
                }
                for j in x.unique_bookings
            ],
            "distance": x.determine_distance(with_distance) if with_distance else 0,
            "rating": x.rating,
            "ratingCount": x.rating_count,
            "isIdVerified": get_from_dump(x, "identity").get("isIdVerified") or False,
            "isBackgroundChecked": True,
            "videoIntro": None,
            "students": x.student_arr,
            "lessonsTaught": x.lessonsTaught,
            "newTutorDiscount": x.revamp_data("pricingInfo", "newTutorDiscount") or 0,
            "isNewTutor": x.date_joined >= datetime.datetime(2022, 1, 1),
            "country": x.revamp_data("personalInfo", "country") or "",
            "state": x.revamp_data("personalInfo", "state") or "",
            "region": x.revamp_data("personalInfo", "region") or "",
            "vicinity": x.revamp_data("personalInfo", "vicinity") or "",
            "specialNeedExpertise": x.revamp_data("teachingProfile", "specialNeeds")
            or [],
            "examsExperience": x.get_examExperiences(
                x, tutor_skills=x.get_tutor_skills(tutorskills)
            ),
            "curriculum": x.get_curriculums(
                x, tutor_skills=x.get_tutor_skills(tutorskills)
            ),
            "levelsTaught": x.get_levelsTaught(
                x, tutor_skills=x.get_tutor_skills(tutorskills)
            ),
            "entranceSchools": x.get_entranceSchools(
                x, tutor_skills=x.get_tutor_skills(tutorskills)
            ),
            "education": x.revamp_data("educationWorkHistory", "educations") or [],
            "workHistory": x.revamp_data("educationWorkHistory", "workHistories") or [],
            "certification": [],
            "subject": x.parse_subject(x, tutorskills, search_subject=search_subject),
            "subjectList": [y.skill.name for y in x.get_tutor_skills(tutorskills)],
            "testimonials": [],
            **x.availability_info(),
        }

    def get_curriculums(cls, instance, tutor_skills: typing.List[typing.Any] = ()):
        curriculums = instance.revamp_data("teachingProfile", "curriculums") or []
        if curriculums:
            return curriculums
        merged = [(x.curriculum_used or []) for x in tutor_skills]
        return list(set([x for y in merged for x in y]))

    def get_levelsTaught(cls, instance, tutor_skills: typing.List[typing.Any] = ()):
        levels_taught = instance.revamp_data("teachingProfile", "classGroup") or []
        if levels_taught:
            return levels_taught
        merged = [x.levels_taught for x in tutor_skills]
        return list(set([x for y in merged for x in y]))

    def get_entranceSchools(cls, instance, tutor_skills: typing.List[typing.Any] = ()):
        schools = (instance.revamp_data("teachingProfile", "examExperience") or {}).get(
            "schools"
        ) or []
        if schools:
            return schools
        merged = [x.schools_taught for x in tutor_skills]
        return list(set([x for y in merged for x in y]))

    def get_examExperiences(cls, instance, tutor_skills: typing.List[typing.Any] = ()):
        exams = (instance.revamp_data("teachingProfile", "examExperience") or {}).get(
            "exams"
        ) or []
        if exams:
            return exams
        merged = [x.actual_exams for x in tutor_skills]
        return list(set([x for y in merged for x in y]))

    def parse_subject(cls, instance, tutorskills, search_subject=None):
        x = instance
        hourlyRate = x.revamp_data("pricingInfo", "hourlyRates") or {}
        extraStudents = x.revamp_data("pricingInfo", "extraStudents") or {}
        key = search_subject
        if not key:
            key = list(hourlyRate.keys())
            if len(key) > 0:
                key = key[0]
        if not isinstance(key, str):
            key = ""
        hourlyRate = hourlyRate.get(key) or 0
        extraStudents = extraStudents.get(key) or 0
        return {
            "hourlyRate": float(hourlyRate),
            "discountForExtraStudents": (
                x.revamp_data("pricingInfo", "discountForExtraStudents") or 0
            ),
            "extraStudents": extraStudents,
            **x.get_search_skill(tutorskills, search_subject, float(hourlyRate)),
        }


class TutorMixin(BookingMixin):
    pass


class TutorProfileMixin(object):
    NOT_APPLIED = 0
    BEGAN_APPLICATION = 1
    PENDING = 2
    VERIFIED = 3
    DENIED = 4
    FROZEN = 7
    MARKED_AS_VERIFIED = 5
    MARKED_AS_DENIED = 6
    TutoringStatus = (
        (NOT_APPLIED, "NOT APPLIED"),
        (BEGAN_APPLICATION, "BEGAN APPLICATION"),
        (PENDING, "APPLICATION COMPLETED PENDING REVIEW"),
        (VERIFIED, "VERIFIED"),
        (DENIED, "DENIED"),
        (FROZEN, "FROZEN"),
        (MARKED_AS_DENIED, "MARKED AS DENIED"),
        (MARKED_AS_VERIFIED, "MARKED AS VERIFIED"),
    )

    @property
    def get_response_time(self):
        if self.response_time > 0:
            time = self.response_time
        else:
            time = 1
        return dict(self.RESPONSE_TIME).get(time)

    @property
    def is_tutor(self):
        """If user is already a tutor"""
        return self.application_status == self.VERIFIED

    @property
    def cancellation_policy_text(self):
        cancellation_hours = {"Flexible": 6, "Moderate": 12, "Strict": 24}
        text = "if you need to cancel or reschedule a lesson, {} requires you do so at least {} hours before your next lesson."
        return text.format(self.user.first_name, cancellation_hours[self.cancellation])

    @property
    def profile_pic(self):
        img = self.image
        if img:
            return img
        return os.getenv("DEFAULT_IMAGE", "placeholder-white")

    @property
    def yoe_display(self):
        YEARS_OF_TEACHING = (
            ("", "Ready to start tutoring"),
            (2, "More than 1 year experience"),
            (5, "More than 3 years experience"),
            (10, "More than 6 years experience"),
            (50, "More than 10 years experience"),
        )
        return dict(YEARS_OF_TEACHING)[self.years_of_teaching]

    def approve_video(self):
        from .models import UserMilestone

        self.video_approved = True
        reward2 = Milestone.get_milestone(Milestone.UPLOAD_VIDEO)
        UserMilestone.objects.get_or_create(user=self.user, milestone=reward2)
        self.save()

    @cached_property
    def failed_skills_count(self):
        return self.user.failed_skills_count

    def public_id(self):
        if self.image:
            return self.image.public_id
        return os.getenv("DEFAULT_IMAGE", "placeholder-white")

    def get_status_verb(self):
        verb = None
        if self.application_status == self.VERIFIED:
            verb = "verified"
        elif self.application_status == self.DENIED:
            verb = "denied"
        return verb


class LocationMixin(object):
    USER_ADDRESS = 1
    TUTOR_ADDRESS = 2
    NEUTRAL_ADDRESS = 3

    ADDRESS_TYPE = (
        (USER_ADDRESS, "User Address"),
        (TUTOR_ADDRESS, "Tutor Address"),
        (NEUTRAL_ADDRESS, "Neutral Address"),
    )

    @staticmethod
    def get_coord(location):
        geolocator = GoogleV3()
        # try:
        loc = geolocator.geocode(location)
        # except GeocoderTimedOut:
        #     loc = None
        return loc

    @property
    def get_distances(self):
        if type(self.distances) in [str, unicode]:
            return json.loads(self.distances)
        if self.distances:
            return {}
        return self.distances

    def user_name(self):
        return self.user.first_name
