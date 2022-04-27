# -*- coding: utf-8 -*-
import math
import logging

from django.db.models import Avg
from django.utils.encoding import smart_str
from django.utils.functional import cached_property

import users
from reviews.models import SkillReview

logger = logging.getLogger(__name__)


class TutorSkillMixin(object):

    @property
    def get_description_of_skill(self):
        """Description to be displayed as subject description."""
        return self.description

    @property
    def cancellation_policy(self):
        return self.tutor.cancellation_policy

    @property
    def cancellation_policy_text(self):
        return self.tutor.cancellation_policy_text

    @cached_property
    def no_of_hours_taught(self):
        return self.tutor.no_of_hours_taught()

    @property
    def credentials(self):
        return ", ".join(self.tutor.education_set.values_list("degree", flat=True))

    @property
    def travel_policy(self):
        return self.tutor.travel_policy

    @property
    def travel_policy_text(self):
        return self.tutor.travel_policy_text

    @property
    def extra_student(self):
        return self.price - (self.price * self.discount / 100)

    @property
    def has_video(self):
        has_v = True if self.tutor_profile.video else False
        return has_v and self.tutor_profile.video_approved

    @property
    def has_exhibition(self):
        if self.has_video or len(self.tutor_exhibitions) > 0:
            return True
        return False

    @cached_property
    def tutor_exhibitions(self):
        return self.exhibitions.all()

    @property
    def video(self):
        return self.tutor_profile.video

    @property
    def monthly_price(self):
        if self.monthly_booking:
            if self.hours_per_day and self.days_per_week:
                return self.price * self.hours_per_day * self.days_per_week * 4
        return False

    @property
    def long_term_booking_price(self):
        if self.monthly_booking:
            return self.monthly_price
        return self.price * 24

    @property
    def new_long_term_booking(self):
        return self.price * 24

    @property
    def request_to_meet_price(self):
        """Long term booking is now 24hrs of booking price"""
        return self.new_long_term_booking * 30 / 100

    @property
    def monthly_price_discount(self):
        return self.monthly_price - (self.monthly_price * self.discount / 100)

    @property
    def address_components(self):
        return self.tutor.address_components

    @property
    def place_of_work(self):
        v = self.tutor.workexperience_set.first()
        if v:
            return v.name
        return self.tutor.tutor_address_components[0]

    @property
    def skill_and_vicinity(self):
        _, location = self.address_components
        return "%s tutor in %s" % (self.skill.name, location)

    @cached_property
    def location(self):
        state, vicinity = self.tutor.tutor_address_components
        return "%s, %s" % (vicinity, state)

    # def state(self):
    #     return self.address_components[0]

    @property
    def profile_pic(self):
        if self.image:
            return self.image
        return self.tutor.profile_pic

    @property
    def rating_split(self):
        # return math.modf(self.review_count().average_score())
        return math.modf(self.rating)

    @property
    def rating_integer(self):
        _, integer = self.rating_split
        return range(int(integer))

    @property
    def rating_decimal(self):
        dec, _ = self.rating_split
        if dec >= 0.2:
            return True
        return False

    @property
    def age(self):
        return self.tutor.profile.age

    @cached_property
    def passed(self):
        return self.sitting.count() > 0 and self.sitting.first().passed

    @cached_property
    def taken_test(self):
        return self.sitting.count() > 0

    @property
    def skill_image(self):
        if self.image:
            return self.image
        return self.tutor.profile.image

    # @property
    def calendar(self):
        return dict(
            hourly=self.tutor.hourly_calender(months=4),
            monthly=self.tutor.monthly_calender(months=4),
        )

    @cached_property
    def calendar_client(self):
        return dict(
            hourly=self.tutor.hourly_calender_client(months=4),
            # monthly=self.tutor.monthly_calender_client(months=4))
            monthly=self.tutor.hourly_calender_client(months=4),
        )
        # return dict(hourly=self.tutor.booked_days(), monthly=self.tutor.available_days(months=4))

    @property
    def expected_hours(self):
        if self.hours_per_day:
            if self.days_per_week:
                return self.hours_per_day * self.days_per_week * 4
            else:
                return self.hours_per_day * 3 * 4
        return 2 * 3 * 4

    @cached_property
    def tutor_profile(self):
        return self.tutor.profile

    @property
    def tutor_details(self):
        return dict(
            max_student=self.max_student,
            supports_monthly=self.monthly_booking,
            expected_hours=self.expected_hours,
            price=self.price,
            hours_per_day=self.hours_per_day,
            days_per_week=self.days_per_week,
            discount=self.discount,
            montly_price=self.monthly_price,
            url=self.get_absolute_url(),
            booking_prep=self.tutor_profile.booking_prep,
            first_name=self.tutor.first_name,
        )

    @property
    def response_time(self):
        return self.tutor.profile.get_response_time

    def post_review(self, user, review_text, score, booking=None, **kwargs):
        ip = kwargs.get("ip_address", None)
        # construct review
        review = SkillReview(
            tutor_skill=self,
            commenter=self.tutor,
            review=review_text,
            review_type=2,
            booking=booking,
            score=score,
        )
        # give rating
        review.save()

    @property
    def rating(self):
        if self.review_count == 0:
            return 0
        return self.rating_sum / self.review_count

    @property
    def ratings(self):
        return (
            self.reviews.exclude(commenter=self.tutor)
            .aggregate(Avg("score"))
            .get("score__avg")
            or 0
        )

    # def review_count(self):
    #     return self.valid_reviews
    # return self.reviews.exclude(commenter=self.tutor)

    @property
    def gender_string(self):
        return self.tutor.gender_string

    # Fields for verifying subjects
    def awards(self):
        all_sc = self.skillcertificate_set.all()
        active = [s for s in all_sc if s.award_name and s.award_institution]
        return active

    def exhibition_list(self):
        # return ''
        exhibition_collections = self.exhibitions.all()
        images = ""
        for image_path in exhibition_collections:
            if image_path.image:
                images += '<a href="{}" target="_blank">{}</a>'.format(
                    image_path.image.url,
                    image_path.image.image(width=50, height=50, crop="fill"),
                )
                # images += image_path.image.image(width=50,height=50,crop='fill')
        return images

    exhibition_list.allow_tags = True

    def phone_number(self):
        fn = self.tutor.phone_number
        if fn:
            return fn.number

    @cached_property
    def get_img(self):
        return self.tutor.profile.image

    def admin_img(self):
        if self.image:
            img = self.image.image(width=70, height=49, crop="fill", gravity="faces")
            url = self.image.url
        elif type(self.profile_pic) != str:
            img = self.profile_pic.image(
                width=70, height=49, crop="fill", gravity="faces"
            )
            url = self.profile_pic.url
        else:
            img = ""
            url = ""
        return '<a href="{}" target="_blank">{}</a>'.format(url, img)

    admin_img.allow_tags = True

    def tag_display(self):
        # return ",".join(self.tags.all)
        result = [tag.name for tag in self.tags.all()]
        return ",".join(result)
        # for tag in self.tags.all():
        # retuls.append(tag)

    def get_image_with_no_error(self):
        if self.image:
            return self.image
        if type(self.profile_pic) != str:
            return self.profile_pic

    def image_url(self):
        img = self.get_image_with_no_error()
        if img:
            return img.url

    def state(self):
        addr = self.tutor.location_set.filter(
            addr_type=users.models.Location.TUTOR_ADDRESS
        ).first()
        if addr:
            return addr.state
        return addr

    def education_degree(self):
        return self.tutor.education_degree()

    def exhibition_display(self):
        return [x.image.url for x in self.exhibitions.all() if x.image]
