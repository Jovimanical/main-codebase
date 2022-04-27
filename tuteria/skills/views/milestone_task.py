from rewards.models import Milestone
from users.models import UserMilestone, User


def update_milestone(milestone, email):
    reward2 = Milestone.get_milestone(Milestone.CREATED_5_SUBJECTS)
    user = User.objects.get(email=email)
    UserMilestone.objects.get_or_create(user=user, milestone=reward2)
