from dal import autocomplete
from .models import User
from django.db.models import Q


class UserAutocomplete(autocomplete.Select2QuerySetView):

    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated:
            return User.objects.none()

        qs = User.objects.all()
        if self.q:
            conditions = (
                Q(email__istartswith=self.q)
                | Q(first_name__istartswith=self.q)
                | Q(last_name__istartswith=self.q)
            )

            qs = qs.filter(conditions)

        return qs
