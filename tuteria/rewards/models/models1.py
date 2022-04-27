import logging
from allauth.account.signals import user_signed_up
from django.urls import reverse
from django.db import models
from django.core.cache import cache

# Create your models here.
from django.dispatch import receiver
from django_extensions.db.fields import AutoSlugField
from rewards.signals import receive_review_reward, repeat_client_booking, signup_reward

logger = logging.getLogger(__name__)


class Milestone(models.Model):
    VERIFIED_ID = "verified_id"
    BOOKED_FIRST_LESSON = "first_lesson"
    FACIAL_PHOTO = "facial_photo"
    COMPLETE_PROFILE = "complete_profile"
    REPEAT_BOOKING = "repeat_booking"
    GIVE_REVIEW = "give_reviews"
    SIGNED_UP = "signed_up"
    CANCEL_SESSION = "cancel_session"
    CANCEL_BOOKING = "cancel_booking"
    # Tutor milestones
    CREATED_5_SUBJECTS = "created_5_subjects"
    GOOD_REVIEWS = "received_good_reviews"
    BAD_REVIEWS = "received_bad_reviews"
    REPEAT_CLIENT = "repeat_client"
    UPLOAD_VIDEO = "upload_video"
    BACKGROUND_CHECKED = "background_check"
    TUTERIA_CERTIFICATION = "tuteria_certification"
    TUTOR_CANCEL_BOOKING = "tutor_cancels_booking"
    HOW_TUTORING_WORKS = "how_tutoring_works"
    VERIFIED_ID_TEXT = "Verify Your ID"
    BOOKED_FIRST_LESSON_TEXT = "Book your first lesson"
    CREATED_5_SUBJECTS_TEXT = "Create first 5 subjects"
    GIVE_REVIEW_TEXT = "Give reviews"
    GOOD_REVIEWS_TEXT = "Receive Good Reviews"
    HOW_TUTORING_WORKS_TEXT = "Learn How to Succeed as a Tutor"
    FACIAL_PHOTO_TEXT = "Upload a Facial Photo"
    UPLOAD_VIDEO_TEXT = "Upload a Video"
    COMPLETE_PROFILE_TEXT = "Complete your Profile"
    OPTIONS = (
        (VERIFIED_ID, dict(condition=VERIFIED_ID_TEXT, score=15, one_time=True)),
        (
            BOOKED_FIRST_LESSON,
            dict(condition=BOOKED_FIRST_LESSON_TEXT, score=20, one_time=True),
        ),
        (
            CREATED_5_SUBJECTS,
            dict(condition=CREATED_5_SUBJECTS_TEXT, score=5, one_time=True),
        ),
        (GIVE_REVIEW, dict(condition=GIVE_REVIEW_TEXT, score=20)),
        (GOOD_REVIEWS, dict(condition=GOOD_REVIEWS_TEXT, score=10)),
        (BAD_REVIEWS, dict(condition="Bad Reviews", score=-15)),
        (REPEAT_BOOKING, dict(condition="Repeat Booking", score=50)),
        (REPEAT_CLIENT, dict(condition="Get Repeat Client", score=50)),
        (SIGNED_UP, dict(condition="Sign Up", score=5, one_time=True)),
        (
            COMPLETE_PROFILE,
            dict(condition=COMPLETE_PROFILE_TEXT, score=5, one_time=True),
        ),
        (FACIAL_PHOTO, dict(condition=FACIAL_PHOTO_TEXT, score=10, one_time=True)),
        (UPLOAD_VIDEO, dict(condition=UPLOAD_VIDEO_TEXT, score=15, one_time=True)),
        (
            BACKGROUND_CHECKED,
            dict(condition="Background Checked", score=30, one_time=True),
        ),
        (
            TUTERIA_CERTIFICATION,
            dict(condition="Pass Tuteria Certification", score=30, one_time=True),
        ),
        (CANCEL_SESSION, dict(condition="Cancel a Session", score=-20)),
        (CANCEL_BOOKING, dict(condition="Cancel a Booking", score=-30)),
        (TUTOR_CANCEL_BOOKING, dict(condition="Tutor Cancels a Booking", score=-10)),
        (
            HOW_TUTORING_WORKS,
            dict(condition=HOW_TUTORING_WORKS_TEXT, one_time=True, score=5),
        ),
    )
    condition = models.CharField(max_length=70)
    score = models.IntegerField()
    one_time = models.BooleanField(default=False)
    slug = AutoSlugField(populate_from="condition")

    def __str__(self):
        return self.condition

    def get_milestone_key(self):
        options = dict(self.OPTIONS)
        result = None
        for key, val in options.items():
            if val.get("condition") == self.condition:
                result = key
                break
        return result

    def get_absolute_url(self):
        URLS = (
            (self.BOOKED_FIRST_LESSON, reverse("home")),
            (self.COMPLETE_PROFILE, reverse("users:edit_profile")),
            (self.FACIAL_PHOTO, reverse("users:edit_media")),
            # (self.VERIFIED_ID, reverse("users:edit_verification")),
            (self.CREATED_5_SUBJECTS, reverse("users:tutor_subjects")),
            (self.UPLOAD_VIDEO, reverse("users:edit_media")),
            (self.BACKGROUND_CHECKED, reverse("users:edit_verification")),
            (self.HOW_TUTORING_WORKS, reverse("registration:how_tutoring_works")),
        )
        key = self.get_milestone_key()
        return dict(URLS)[key]

    @classmethod
    def get_milestone(cls, key):
        # ms = cache.get(key)
        # if ms is None:
        ms, _ = cls.objects.get_or_create(**cls.option(key))
        # cache.set(key,ms,timeout=60*60*5)
        return ms

    @staticmethod
    def option(key):
        return dict(Milestone.OPTIONS)[key]

    @classmethod
    def reputation_list(cls, user, profile=None):
        """Miletones displayed on User profile to complete"""
        all_reputations = cls.objects.filter(
            condition__in=[
                cls.COMPLETE_PROFILE_TEXT,
                cls.FACIAL_PHOTO_TEXT,
                # cls.VERIFIED_ID_TEXT,
                cls.UPLOAD_VIDEO_TEXT,
                cls.HOW_TUTORING_WORKS_TEXT,
            ]
        )
        todo_reputations = [
            x
            for x in all_reputations
            if x.condition
            in [cls.COMPLETE_PROFILE_TEXT, cls.FACIAL_PHOTO_TEXT, 
            # cls.VERIFIED_ID_TEXT
            ]
            # cls.get_milestone(cls.BOOKED_FIRST_LESSON)
        ]
        tutor_reputations = [
            x
            for x in all_reputations
            if x.condition
            in [
                cls.UPLOAD_VIDEO_TEXT,
                # cls.CREATED_5_SUBJECTS_TEXT
                cls.HOW_TUTORING_WORKS_TEXT,
            ]
            # cls.get_milestone(cls.BACKGROUND_CHECKED),
            # cls.get_milestone(cls.TUTERIA_CERTIFICATION)
        ]
        all_stones = user.milestones.all().prefetch_related("milestone")
        ms = [x.milestone for x in all_stones]

        def exists(x):
            u = x in ms
            return u is False

        # user_milestones = user.milestones
        not_received = list(filter(exists, todo_reputations))
        user_profile = profile or user.profile
        if not user_profile.is_tutor:
            return not_received
        null = list(filter(exists, tutor_reputations))
        resut = not_received + null
        logger.info(resut)
        return resut


@receiver(receive_review_reward)
def reward_based_on_review(sender, user, rating, giver, **kwargs):
    gave_review_reward, _ = Milestone.get_milestone(Milestone.GIVE_REVIEW)
    if rating > 3:
        rating_reward, _ = Milestone.get_milestone(Milestone.GOOD_REVIEWS)
    elif rating < 3:
        rating_reward, _ = Milestone.get_milestone(Milestone.BAD_REVIEWS)
    else:
        rating_reward = None
    if rating_reward:
        user.tuteria_points += rating_reward.score
        user.save()
    giver.tuteria_points += gave_review_reward.score
    giver.save()


@receiver(user_signed_up)
def signup_reward_for_client(sender, request, user, **kwargs):
    reward = Milestone.get_milestone(Milestone.SIGNED_UP)
    user.tuteria_points += reward.score
    user.save()
