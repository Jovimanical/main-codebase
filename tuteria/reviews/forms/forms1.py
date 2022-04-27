from dal import autocomplete
from django import forms

# from .models import BackgroundCheck,TutorMeeting
from ..models import TutorMeeting, SkillReview

from users.models import states

# class BackgroundCheckForm(forms.Form):
#     criminal_option = forms.BooleanField(required=False, widget=forms.CheckboxInput,
#                                          label=_('Criminal Background Check'))
#     address_option = forms.BooleanField(required=False, widget=forms.CheckboxInput)

#     def clean(self):
#         cleaned_data = super(BackgroundCheckForm, self).clean()
#         c_o = cleaned_data.get("criminal_option")
#         a_o = cleaned_data.get("address_option")
#         if not any([c_o, a_o]):
# Only do something if both fields are valid so far.
#             raise forms.ValidationError("Please select at least one of the two options.")

#     def save(self, user, t_d):
#         if self.cleaned_data['address_option'] and self.cleaned_data['criminal_option']:
#             inst1 = BackgroundCheck.create(check_type=BackgroundCheck.BOTH, tutor=user,
#                                            amount_paid=t_d.both_cost)
#         elif self.cleaned_data['address_option']:
#             inst1 = BackgroundCheck.create(check_type=BackgroundCheck.ADDRESS_CHECK, tutor=user,
#                                            amount_paid=t_d.address_cost)
#         else:
#             inst1 = BackgroundCheck.create(check_type=BackgroundCheck.CRIMINAL, tutor=user,
#                                            amount_paid=t_d.criminal_cost)
#         return inst1

all_states = [("", "State")] + [(s, s) for s in states]


class RequestMeetingForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(RequestMeetingForm, self).__init__(*args, **kwargs)
        self.fields["time_to_call"].required = True

    class Meta:
        model = TutorMeeting
        fields = ["time_to_call"]


class PermissionToViewAddressForm(forms.Form):
    can_view = forms.ChoiceField(widget=forms.HiddenInput(), initial="true")


class AfterMeetingForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(AfterMeetingForm, self).__init__(*args, **kwargs)
        self.fields["meeting_outcome"].required = False

    rating = forms.CharField(widget=forms.HiddenInput())

    class Meta:
        model = TutorMeeting
        fields = ["meeting_outcome"]


class TutorMeetingForm(forms.ModelForm):

    class Meta:
        model = TutorMeeting
        fields = "__all__"
        fields = {
            "ts": autocomplete.ModelSelect2(url="users:skill-autocomplete"),
            "client": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "tutor": autocomplete.ModelSelect2(url="users:user-autocomplete"),
        }
        autocomplete_fields = ("client", "ts", "tutor")


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
