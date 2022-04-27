from dal import autocomplete
from taggit.models import Tag

from .models import Category, Skill, TutorSkill
from django.db.models import Q


class TutorSkillAutocomplete(autocomplete.Select2QuerySetView):

    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated:
            return TutorSkill.objects.none()

        qs = TutorSkill.objects.all()
        if self.q:
            conditions = Q(skill__name__istartswith=self.q) | Q(
                tutor__email__istartswith=self.q
            )

            qs = qs.filter(conditions)

        return qs


class SkillAutocomplete(autocomplete.Select2QuerySetView):

    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        if not self.request.user.is_authenticated:
            return Skill.objects.none()

        qs = TutorSkill.objects.all()
        if self.q:
            conditions = Q(name__istartswith=self.q)
            qs = qs.filter(conditions)

        return qs
