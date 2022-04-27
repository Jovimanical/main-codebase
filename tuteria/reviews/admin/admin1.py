from django.contrib import admin
from django.utils.translation import ugettext_lazy as _
from django.contrib.admin.helpers import ActionForm
from ..models import SkillReview, TutorMeeting
from ..forms import TutorMeetingForm, SkillReviewForm, forms


class DateForm(ActionForm):
    the_date = forms.DateField(widget=forms.SelectDateWidget(), required=False)


# Register your models here.
@admin.register(SkillReview)
class ReviewAdmin(admin.ModelAdmin):
    form = SkillReviewForm
    list_display = ["tutor", "commenter", "score", "modified", "review"]
    search_fields = [
        "tutor_skill__tutor__email",
        "booking__order",
        "commenter__email",
        "booking__user__email",
    ]
    actions = ["update_modified_date_of_review"]
    action_form = DateForm

    def tutor(self, obj):
        return obj.tutor_skill.tutor

    def update_modified_date_of_review(self, request, queryset):
        form = self.action_form(request.POST)
        form.is_valid()
        if form.cleaned_data["the_date"]:
            queryset.update(modified=form.cleaned_data["the_date"])


class TutorMeetingFilter(admin.SimpleListFilter):
    title = "Filters"
    parameter_name = "met_with_client"

    def lookups(self, request, model_admin):
        return (
            ("met_with_client", _("Met with client")),
            ("led_to_booking", _("Led to booking")),
        )

    def queryset(self, request, queryset):
        if self.value() == "met_with_client":
            return queryset.filter(met_with_client=True)
        if self.value() == "led_to_booking":
            return queryset.filter(led_to_booking=True)
        return queryset


@admin.register(TutorMeeting)
class TutorMeetingAdmin(admin.ModelAdmin):
    list_display = ["client", "tutor", "amount_paid", "ts", "time_to_call"]
    form = TutorMeetingForm
    list_filter = (TutorMeetingFilter,)
