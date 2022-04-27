import factory

from .models import TutorMeeting


class TutorMeetingFactory(factory.DjangoModelFactory):

    class Meta:
        model = TutorMeeting

    user = factory.SubFactory("users.factories.UserFactory")
