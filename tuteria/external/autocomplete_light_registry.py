from dal import autocomplete
from .models import BaseRequestTutor
from django.db.models import Q


class BaseRequestTutorAutocomplete(autocomplete.Select2QuerySetView):

    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated:
            return BaseRequestTutor.objects.none()

        qs = BaseRequestTutor.objects.all()
        if self.q:
            conditions = Q(slug__istartswith=self.q) | Q(email__istartswith=self.q)

            qs = qs.filter(conditions)

        return qs
