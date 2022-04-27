from dal import autocomplete
from .models import WalletTransaction, Wallet, UserPayout
from django.db.models import Q


class Base(autocomplete.Select2QuerySetView):
    model = None
    search_fields = []

    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated:
            return self.model.objects.none()

        qs = self.model.objects.all()
        if self.q:
            conditions = Q()
            for o in self.search_fields:
                conditions | Q(**{"{}__istartswith".format(o): self.q})

            qs = qs.filter(conditions)

        return qs


class WalletTransactionAutocomplete(Base):
    model = WalletTransaction
    search_fields = ["booking__order", "wallet__owner__email"]


class WalletAutoComplete(Base):
    model = Wallet
    search_fields = ["owner__email"]


class UserPayoutAutoComplete(Base):
    model = UserPayout
    search_fields = ["user__email"]
