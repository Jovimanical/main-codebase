from __future__ import absolute_import

from celery import shared_task
from django.core.exceptions import ValidationError
from ..models import Milestone
from users.models import User, UserMilestone


@shared_task
def verified_id_reward():
    verify_milestone = Milestone.get_milestone(Milestone.VERIFIED_ID)
    users = User.objects.not_rewarded_for_milestone(verify_milestone.condition)
    count = 0
    for user in users:
        if user.tuteria_verified:
            UserMilestone.objects.create(milestone=verify_milestone, user=user)
            count += 1
    print("Verified ID today is %s" % str(count))


def populate(users, milestone):
    count = 0
    for user in users:
        try:
            count += 1
            UserMilestone.objects.create(milestone=milestone, user=user)
        except ValidationError:
            count -= 1
    return count


@shared_task
def booked_first_lesson_reward():
    booked_first_lesson_milestone = Milestone.get_milestone(
        Milestone.BOOKED_FIRST_LESSON
    )
    users = User.objects.not_rewarded_for_milestone(
        booked_first_lesson_milestone.condition
    ).first_booking()
    count = populate(users, booked_first_lesson_milestone)
    print("Booked first lesson today is %s" % str(count))


@shared_task
def created_first_5_subjects():
    first_5_subject_reward = Milestone.get_milestone(Milestone.CREATED_5_SUBJECTS)
    users = User.objects.not_rewarded_for_milestone(
        first_5_subject_reward.condition
    ).first_5_verified_skills()
    count = populate(users, first_5_subject_reward)
    print("Tutors with first 5 verified skills today count is %s" % str(count))
