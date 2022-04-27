from django.contrib.auth.hashers import make_password
from django.db.models.signals import post_save
import factory

from .models import UserProfile, User, create_user_profile


class UserProfileFactory(factory.DjangoModelFactory):

    class Meta:
        model = UserProfile

    user = factory.SubFactory("users.factories.UserFactory", profile=None)


class UserFactory(factory.DjangoModelFactory):

    class Meta:
        model = User

    first_name = "Standard"
    last_name = "User"
    # Emails must be unique - so use a sequence here:
    email = factory.Sequence(lambda n: "user.{}@test.test".format(n))
    password = make_password("pass")

    profile = factory.RelatedFactory(UserProfileFactory, "user")

    @factory.post_generation
    def tutorskill_set(self, create, extracted, **kwargs):
        pass

    @classmethod
    def _generate(cls, create, attrs):
        """Override the default _generate() to disable the post-save signal."""

        # Note: If the signal was defined with a dispatch_uid, include that in both calls.
        post_save.disconnect(create_user_profile, User)
        user = super(UserFactory, cls)._generate(create, attrs)
        post_save.connect(create_user_profile, User)
        return user
