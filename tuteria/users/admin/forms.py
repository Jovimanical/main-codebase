from django import forms
from django.contrib.admin.helpers import ActionForm
from django.contrib.admin.widgets import FilteredSelectMultiple

from django_quiz.quiz.models import Quiz, Question
from registration.models import Education, Guarantor, WorkExperience
from reviews.models import SkillReview, TutorMeeting
from skills.models import (
    TutorSkill,
    QuizSitting,
    SkillCertificate,
    Skill,
    states,
    SubCategory,
)
from users.models import Constituency, PhoneNumber, UserIdentification, UserProfile
from dal import autocomplete
from django.utils.translation import ugettext_lazy as _


all_states = [("", "Select state")] + [(s, s) for s in states]


class UpdateVicinityActionForm(ActionForm):
    vicinity = forms.CharField(required=False)
    latitude = forms.DecimalField(required=False)
    longitude = forms.DecimalField(required=False)
    region = forms.ModelChoiceField(required=False, queryset=Constituency.objects.all())


class PhoneNumberAutocompleteForm(forms.ModelForm):

    class Meta:
        model = PhoneNumber
        fields = "__all__"
        widgets = {"owner": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class UserIdentificationForm(forms.ModelForm):

    class Meta:
        model = UserIdentification
        fields = "__all__"
        widgets = {"user": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class CalculateDistanceForm(ActionForm):
    lat = forms.DecimalField(required=False)
    lon = forms.DecimalField(required=False)
    request_pk = forms.IntegerField(required=False)
    region = forms.ModelChoiceField(required=False, queryset=Constituency.objects.all())
    price = forms.DecimalField(required=False)


class UserProfileSpecialForm(forms.ModelForm):

    class Meta:
        model = UserProfile
        fields = "__all__"
        widgets = {"user": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class FForm(ActionForm):
    text_msg = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=3, placeholder="text_msg")),
        required=False,
    )


class QuizAdminForm(forms.ModelForm):
    """
    below is from
    http://stackoverflow.com/questions/11657682/
    django-admin-interface-using-horizontal-filter-with-
    inline-manytomany-field
    """

    class Meta:
        model = Quiz
        exclude = []

    # questions = forms.ModelMultipleChoiceField(
    #     queryset=Question.objects.all().select_subclasses(),
    #     required=False,
    #     widget=FilteredSelectMultiple(verbose_name="Questions", is_stacked=False),
    # )

    def __init__(self, *args, **kwargs):
        super(QuizAdminForm, self).__init__(*args, **kwargs)
        if self.instance.pk:
            self.fields[
                "questions"
            ].initial = self.instance.question_set.all().select_subclasses()

    def save(self, commit=True):
        quiz = super(QuizAdminForm, self).save(commit=False)
        quiz.save()
        quiz.question_set = self.cleaned_data["questions"]
        self.save_m2m()
        return quiz


class SkillReviewForm(forms.ModelForm):

    class Meta:
        model = SkillReview
        fields = "__all__"
        widgets = {
            "tutor_skill": autocomplete.ModelSelect2(url="users:skill-autocomplete"),
            "commenter": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "booking": autocomplete.ModelSelect2(url="users:booking-autocomplete"),
        }
        autocomplete_fields = ("tutor_skill", "user", "commenter", "booking")


class DateForm(ActionForm):
    the_date = forms.DateField(widget=forms.SelectDateWidget(), required=False)


class TutorMeetingForm(forms.ModelForm):

    class Meta:
        model = TutorMeeting
        fields = {
            "ts": autocomplete.ModelSelect2(url="users:skill-autocomplete"),
            "client": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "tutor": autocomplete.ModelSelect2(url="users:user-autocomplete"),
        }
        autocomplete_fields = ("client", "ts", "tutor")


class TutorSkillForm(forms.ModelForm):
    model = TutorSkill
    fields = "__all__"
    widgets = {"tutor": autocomplete.ModelSelect2(url="users:user-autocomplete")}
    autocomplete_fields = ("user",)


class QuizSittingForm(forms.ModelForm):

    class Meta:
        model = QuizSitting
        fields = "__all__"
        widgets = {
            "tutor_skill": autocomplete.ModelSelect2(url="users:skill-autocomplete")
        }


class ActionForms(object):
    pass


class EducationForm(forms.ModelForm):

    class Meta:
        model = Education
        fields = "__all__"
        widgets = {"tutor": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class GuarantorForm(forms.ModelForm):

    class Meta:
        model = Guarantor
        fields = "__all__"
        widgets = {"tutor": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class WorkExperienceForm(forms.ModelForm):
    # certificate = cloudinary_form.CloudinaryFileField(options={'upload_preset':'we_certificate'},required=False)
    def __init__(self, *args, **kwargs):
        super(WorkExperienceForm, self).__init__(*args, **kwargs)
        self.fields["name"].required = False
        self.fields["role"].required = False
        # self.fields['certificate'].required = False

    class Meta:
        model = WorkExperience
        fields = ("name", "role", "currently_work")
        label = {
            "name": _("Name of Organization"),
            "role": _("Your Role"),
            "currently_work": _("I currently work here"),
        }


class SkillCertificateForm(forms.ModelForm):

    class Meta:
        model = SkillCertificate
        fields = "__all__"
        widgets = {"ts": autocomplete.ModelSelect2(url="users:skill-autocomplete")}


class SkillForm(forms.ModelForm):

    class Meta:
        model = Skill
        fields = "__all__"
        widgets = {
            "testifier": autocomplete.ModelSelect2(url="users:user-autocomplete")
        }


class ByStateFilterForm(ActionForm):
    state = forms.ChoiceField(required=False, choices=all_states, initial="")
    status = forms.ChoiceField(
        required=False, choices=[(2, "Active"), (1, "Pending")], initial=2
    )
    market_category = forms.ChoiceField(
        required=False, choices=Skill.CHOICES, initial=Skill.SCHOOL
    )
    sub_categories = forms.ModelChoiceField(
        required=False, queryset=SubCategory.objects.all()
    )
