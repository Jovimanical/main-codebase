from django.db.models.query_utils import Q
from courses.models import CourseUser
from dal import autocomplete


class CourseUserAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return CourseUser.objects.none()
        qs = CourseUser.objects.all()
        if self.q:
            conditions = Q(slug__istartswith=self.q) | Q(email__istartswith=self.q)
            qs = qs.filter(conditions)
        return qs
