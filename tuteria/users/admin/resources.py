from django.utils.functional import cached_property
from import_export import resources

from skills.models import TutorSkill
from users.models import PhoneNumber, User


class PhoneNumberResource(resources.ModelResource):

    class Meta:
        model = PhoneNumber
        fields = ["number"]


class TutorResource(resources.ModelResource):
    booking_count = resources.Field()
    total_earned = resources.Field()
    full_name = resources.Field()
    state = resources.Field()
    phonenumber = resources.Field()

    class Meta:
        model = User
        fields = ["email"]

    def dehydrate_state(self, user):
        states = [x["state"] for x in self.locations if x["user_id"] == user.id]
        return states[0] if len(states) > 0 else ""

    def dehydrate_phonenumber(self, user):
        vv = [x["number"] for x in self.phonenumbers if x["owner_id"] == user.pk]
        return vv[0] if len(vv) > 0 else ""

    def dehydrate_full_name(self, user):
        return "{} {}".format(user.first_name, user.last_name)

    def dehydrate_booking_count(self, user):
        return user.bk

    @cached_property
    def all_users(self):
        from users.models import UserProfile

        return [
            x.pk
            for x in self.get_queryset().filter(
                profile__application_status=UserProfile.VERIFIED
            )
        ]

    @cached_property
    def locations(self):
        from users.models import Location

        return Location.objects.filter(user_id__in=self.all_users).values(
            "state", "user_id"
        )

    @cached_property
    def phonenumbers(self):
        from users.models import PhoneNumber

        return (
            PhoneNumber.objects.filter(primary=True)
            .filter(owner_id__in=self.all_users)
            .values("owner_id", "number")
        )

    @cached_property
    def transactions(self):
        from wallet.models import WalletTransactionType, WalletTransaction

        return (
            WalletTransaction.objects.filter(wallet__owner_id__in=self.all_users)
            .filter(type=WalletTransactionType.EARNING)
            .values("wallet__owner_id", "amount")
        )

    def dehydrate_total_earned(self, user):
        valid = [
            x["amount"] for x in self.transactions if x["wallet__owner_id"] == user.pk
        ]
        return sum(valid)


class TutorSkillResource(resources.ModelResource):
    phone_number = resources.Field()

    class Meta:
        model = TutorSkill
        fields = []

    def dehydrate_phone_number(self, book):
        return book.tutor.primary_phone_no.number
