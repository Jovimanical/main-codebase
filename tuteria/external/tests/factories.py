import factory
from users.tests.factories import UserFactory
from bookings.tests.factories import BookingFactory


class ReferralFactory(factory.django.DjangoModelFactory):
    owner = UserFactory()

    class Meta:
        model = "referrals.Referral"


class AgentFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = "external.Agent"


class PriceDeterminatorFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = "external.PriceDeterminator"


class BaseRequestTutorFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    booking = factory.SubFactory(BookingFactory)
    number = "+2347035209976"

    class Meta:
        model = "external.BaseRequestTutor"


class PricingFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = "pricings.Pricing"


class RegionFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: "name{0}".format(n))

    class Meta:
        model = "pricings.Region"


class DepositFactory(factory.django.DjangoModelFactory):
    request = factory.SubFactory(BaseRequestTutorFactory)

    class Meta:
        model = "external.DepositMoney"
