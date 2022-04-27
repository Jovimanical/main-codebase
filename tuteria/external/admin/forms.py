from dal import autocomplete
from django import forms
from django.utils.translation import ugettext as _
from django.contrib.admin.helpers import ActionForm
from django.forms import SelectDateWidget

from external.models import Agent, BaseRequestTutor


class ParentRequestForm(forms.ModelForm):
    class Meta:
        model = BaseRequestTutor
        widgets = {
            "related_request": autocomplete.ModelSelect2(
                url="baserequesttutor-autocomplete"
            ),
            "user": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "tutor": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "ts": autocomplete.ModelSelect2(url="users:skill-autocomplete"),
            "booking": autocomplete.ModelSelect2(url="users:booking-autocomplete"),
        }
        fields = "__all__"


REMARK_STATUS = (
    ("Follow up on profile sent", _("Follow up on profile sent")),
    ("Will make payment later", _("Will make payment later")),
    ("To negotiate a different Price", _("To negotiate a different Price")),
)


class FForm2(ActionForm):
    remarks = forms.ChoiceField(
        choices=REMARK_STATUS, widget=forms.RadioSelect, required=False
    )


class FForm(ActionForm):
    remarks = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=2, placeholder="remarks")), required=False
    )
    amount = forms.DecimalField(
        widget=forms.TextInput(attrs=dict(size=7, placeholder="amount")), required=False
    )
    dop = forms.DateField(widget=SelectDateWidget, required=False)
    text_msg = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=3, placeholder="text_msg")),
        required=False,
    )
    agent = forms.ModelChoiceField(required=False, queryset=Agent.objects.all())
    email = forms.CharField(
        required=False, widget=forms.TextInput(attrs=dict(placeholder="email"))
    )


class AgentFForm(ActionForm):
    agent = forms.ModelChoiceField(required=False, queryset=Agent.objects.all())


class PriceDeterminantForm(ActionForm):
    """Action form to update data for the single price determinant"""

    state = forms.ChoiceField(
        choices=BaseRequestTutor.NIGERIAN_STATES + [("Others", "Others")],
        required=False,
    )
    state_percentage = forms.IntegerField(required=False)
    no_of_hours = forms.ChoiceField(
        choices=((1, 1), (1.5, 1.5), (2, 2)), required=False
    )
    hour_percentage = forms.IntegerField(required=False)
    plan = forms.ChoiceField(
        choices=[(f"Plan {o}", f"Plan {o}") for o in [1, 2, 3]], required=False
    )
    plan_percentage = forms.IntegerField(required=False)
