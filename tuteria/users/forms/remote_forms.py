from gateway_client.tutor import TutorAPIClient as TutorService
from gateway_client.base.forms import DynamicFormMixin
from django import forms
from config.utils import RemoteFormMixin
from django.conf import settings


class DynamicForms(DynamicFormMixin, RemoteFormMixin, forms.Form):

    def __init__(self, *args, **kwargs):
        form_instance = kwargs.pop("instance", None)
        initial = kwargs.pop("initial", {})
        if form_instance:
            initial.update(form_instance)
        service = TutorService(url=settings.TUTOR_SERVICE_URL)
        super(DynamicForms, self).__init__(service, *args, initial=initial, **kwargs)

    def get_FormField(self, FormField):
        return FormField.get(self.form_name)

    # def get_validation_results(self, data):
    #     validations = super(DynamicForms, self).get_validation_results(data)
    #     import pdb
    #     pdb.set_trace()
    #     return validations[self.form_name]['errors']


class UserEditForm(DynamicForms):
    extra_form_args = {"form_type": "edit_profile_form", "form_name": "form"}
    form_name = "form"
    detail_key = "username"

    tutor_intent = forms.BooleanField(required=False)
