from dal import autocomplete
from .models import Booking
from django.db.models import Q


class BookingAutocomplete(autocomplete.Select2QuerySetView):

    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated:
            return Booking.objects.none()

        qs = Booking.objects.all()
        if self.q:
            conditions = Q(ts__skill__name__istartswith=self.q) | Q(
                ts__tutor__email__istartswith=self.q
            )

            qs = qs.filter(conditions)

        return qs
