from django import forms
from django.conf import settings
from gateway_client.client_requests import RequestService
from gateway_client.base.forms import DynamicFormMixin
from phonenumber_field.formfields import PhoneNumberField
from users.models import states
from .forms1 import CheckboxSelectMultiple
from django.contrib.postgres.forms import SimpleArrayField
from users.models import states
from django.utils.translation import ugettext as _
from config.utils import RemoteFormMixin
from external.models import Patner

all_states = [("", "Select state")] + [(s, s) for s in states]


class DynamicForms(DynamicFormMixin, RemoteFormMixin, forms.Form):
    extra_form_args = {}

    def _for_check_boxes(self, field_data):
        old_kwargs = field_data["kwargs"]
        old_kwargs.update(widget=CheckboxSelectMultiple)
        field_data.update(kwargs=old_kwargs)
        return field_data

    def service_clean(self, cleaned_data):
        for key, value in cleaned_data.items():
            if value.__class__.__name__ == "PhoneNumber":
                cleaned_data.update({key: str(value)})
            if value.__class__.__name__ == "Decimal":
                cleaned_data.update({key: "{}".format(value)})
        # if cleaned_data.get('number'):
        #     data.update(number=str(data['number']))
        return cleaned_data

    def pre_save_form(self):
        if self.cleaned_data.get("number"):
            self.cleaned_data["number"] = str(self.cleaned_data["number"])


class BaseFirstRemoteForm(DynamicForms):

    def __init__(self, *args, **kwargs):
        form_instance = kwargs.pop("instance", None)
        initial = kwargs.pop("initial", {})
        if form_instance:
            number = initial.get("number")
            initial.update(form_instance)
            if number:
                initial.update(number=number)
        instance = RequestService(url=settings.REQUEST_SERVICE_URL)
        super(BaseFirstRemoteForm, self).__init__(
            instance, *args, initial=initial, **kwargs
        )
        self.fields["number"].widget = forms.TextInput(
            attrs={
                "placeholder": "Enter Phone Number",
                "class": "form-control",
                "minlength": "10",
                "maxlength": 11,
            }
        )
        self.fields["email"].widget = forms.TextInput(
            attrs=dict(placeholder="Email address")
        )
        self.fields["home_address"].widget = forms.TextInput(
            attrs={
                "placeholder": "E.g. 24 Bode Thomas Street, Surulere",
                "class": "form-control",
            }
        )
        self.fields["state"] = forms.ChoiceField(
            choices=[("", "Select state")] + [(s, s) for s in states]
        )


class HomeParentRequestForm(BaseFirstRemoteForm):
    extra_form_args = {"form_type": "parent_home_form"}


class HomeSkillRequestForm(HomeParentRequestForm):
    pass


class TutorRequestForm1(BaseFirstRemoteForm):
    extra_form_args = {"form_type": "tutor_home_form"}

    def __init__(self, *args, **kwargs):
        options = kwargs.pop("opts_choices", None)
        super(TutorRequestForm1, self).__init__(*args, **kwargs)
        if options:
            self.fields["subject"] = forms.ChoiceField(
                choices=options["subject"],
                widget=forms.Select,
                required=True,
                label="Subjects",
            )


class BaseSecondRemoteForm(DynamicForms):

    def __init__(self, *args, **kwargs):
        form_instance = kwargs.pop("instance", None)
        initial = kwargs.pop("initial", {})
        initial.update(form_instance)
        self.state = None
        instance = RequestService(url=settings.REQUEST_SERVICE_URL)
        if form_instance:
            self.state = form_instance.get("state")
            kwargs.update(request_slug=form_instance["id"])
        super(BaseSecondRemoteForm, self).__init__(
            instance, *args, initial=initial, **kwargs
        )


class SecondRequestForm(BaseSecondRemoteForm):
    extra_form_args = {"form_type": "regular_second_form"}


class ParentRequestForm(BaseSecondRemoteForm):
    extra_form_args = {"form_type": "parent_second_form"}

    def __init__(self, *args, **kwargs):
        super(ParentRequestForm, self).__init__(*args, **kwargs)
        self.fields["music_level"].widget = CheckboxSelectMultiple()


class TutorRequestForm2(BaseSecondRemoteForm):
    extra_form_args = {"form_type": "tutor_second_form"}

    def __init__(self, *args, **kwargs):
        choices2 = kwargs.pop("subjects", ())
        choices7 = kwargs.pop("prices", ())
        choices3 = kwargs.pop("classes", ())
        self.fixed_price = kwargs.pop("fixed_price", None)
        super(TutorRequestForm2, self).__init__(*args, **kwargs)
        self.fields["possible_subjects"].choices = choices2
        self.fields["expectation"].widget = forms.Textarea()


class PriceMiniForm(DynamicForms):
    extra_form_args = {"form_type": "featured_pricing_form"}

    def __init__(self, *args, **kwargs):
        form_instance = kwargs.pop("instance", None)
        initial = kwargs.pop("initial", {})
        instance = RequestService(url=settings.REQUEST_SERVICE_URL)
        if form_instance:
            initial.update(form_instance)
            if initial.get("number"):
                initial.update(number=initial["number"].replace("+234", "0"))
            kwargs.update(request_slug=form_instance["id"])
        super(PriceMiniForm, self).__init__(instance, *args, initial=initial, **kwargs)
        self.fields["expectation"].widget = forms.Textarea()


class PriceAdjustForm(PriceMiniForm):
    extra_form_args = {"form_type": "pricing_form"}

    def __init__(self, *args, **kwargs):
        super(PriceAdjustForm, self).__init__(*args, **kwargs)
        self.fields["available_days"].widget = forms.HiddenInput()

    def save(self, **kwargs):
        self.cleaned_data.update(
            available_days=",".join(self.cleaned_data["available_days"])
        )
        return super(PriceAdjustForm, self).save(**kwargs)


class NigerianLanguagesForm(DynamicForms):
    extra_form_args = {"form_type": "online_form"}

    def __init__(self, *args, **kwargs):
        form_instance = kwargs.pop("instance", None)
        initial = kwargs.pop("initial", {})
        if form_instance:
            initial.update(form_instance)

        instance = RequestService(url=settings.REQUEST_SERVICE_URL)
        category = kwargs.pop("category", None)
        self.selected_cat = category
        super(NigerianLanguagesForm, self).__init__(
            instance, *args, initial=initial, **kwargs
        )
        self.fields["possible_subjects"] = forms.ChoiceField(
            choices=[("", "Select Language")]
            + list(self.selected_cat.skill_set.values_list("name", "name")),
            required=False,
        )
        if category:
            if category.name != "Nigerian Languages":
                self.fields["class_of_child"].required = False
                self.fields["possible_subjects"].required = False
            else:
                self.fields["possible_subjects"].required = True

    def save(self, **kwargs):
        new_kwargs = kwargs
        if self.selected_cat:
            new_kwargs.update(category=self.selected_cat.name)
        return super(NigerianLanguagesForm, self).save(**new_kwargs)


class PatnershipForm(forms.ModelForm):

    class Meta:
        model = Patner
        fields = ["name", "email", "company_name", "state", "body"]
        widgets = {
            "company_name": forms.TextInput(
                attrs={"placeholder": "Company name", "class": "form-control"}
            ),
            "name": forms.TextInput(
                attrs={"placeholder": "Name", "class": "form-control"}
            ),
            "body": forms.Textarea(
                attrs={
                    "placeholder": "How can we work together?",
                    "class": "form-control",
                }
            ),
            "email": forms.TextInput(attrs=dict(placeholder="Active Email address")),
        }
        labels = {
            "company_name": _("Company Name"),
            "body": _("How can we Work Together"),
            "email": _("Active Email"),
        }

    def save(self, commit=True):
        instance = super(PatnershipForm, self).save(commit=False)
        if commit:
            instance.save()
            email_notification_on_patnership.delay(instance.pk)
        return instance
