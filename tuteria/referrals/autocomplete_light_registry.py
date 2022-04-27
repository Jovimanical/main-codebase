from dal import autocomplete
from .models import Referral

from django.db.models import Q


class ReferralAutocomplete(autocomplete.Select2QuerySetView):

    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated:
            return Referral.objects.none()

        qs = Referral.objects.all()
        if self.q:
            conditions = Q(manager__owner__email__istartswith=self.q)

            qs = qs.filter(conditions)

        return qs
