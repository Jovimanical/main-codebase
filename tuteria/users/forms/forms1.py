from __future__ import absolute_import, division, print_function

import datetime
import logging

from builtins import (
    super,
    # zip, round, input, int, pow, object)bytes, str, open, ,
    # range,
)
import cloudinary
from cloudinary.uploader import upload
from cloudinary.forms import CloudinaryUnsignedJsFileField, CloudinaryFileField
from crispy_forms.helper import FormHelper
from dal import autocomplete
from django import forms
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.forms import inlineformset_factory, formsets
from django.forms import SelectDateWidget
from django.utils.translation import ugettext_lazy as _
from django_countries.data import COUNTRIES
from embed_video.fields import EmbedVideoFormField
from phonenumber_field.formfields import PhoneNumberField

from referrals.models import Referral
from ..models import User, UserProfile, PhoneNumber, Location, UserIdentification
from ..tasks import populate_vicinity
from gateway_client.base import forms as gateway_forms

logger = logging.getLogger(__name__)


class UserProfileSpecialForm(forms.ModelForm):

    class Meta:
        model = UserProfile
        fields = "__all__"
        widgets = {"user": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class PhoneNumberAutocompleteForm(forms.ModelForm):

    class Meta:
        model = PhoneNumber
        fields = "__all__"
        widgets = {"owner": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class FormMixin(object):
    pass


def get_placeholder(name, t_type="text", **kwargs):
    options = dict(text=forms.TextInput, email=forms.EmailInput)
    params = kwargs
    params.update({"placeholder": _(name)})
    return options[t_type](attrs=params)


class MailingListForm(FormMixin, forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["country"].required = True

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "country", "tutor_intent"]
        widgets = {
            "email": get_placeholder("Email Address", "email"),
            "first_name": get_placeholder("First Name"),
            "last_name": get_placeholder("Surname"),
        }


class UserEditForm(forms.ModelForm):
    """Form for viewing and editing name fields in a DemoUser object.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in ["first_name", "last_name"]:
            self.fields[field].required = True
        # self.fields['username'].required = False
        self.helper = FormHelper()

    class Meta:
        model = User
        fields = ("first_name", "last_name", "tutor_intent")


class UserDumpDataForm(forms.ModelForm):
    """
    Form for viewing and editing dump field in a User Object
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["data_dump"].required = True

    class Meta:
        model = User
        fields = ("data_dump",)


def week_day(index):
    return (datetime.date(2001, 1, index)).strftime("%A")


class UserMediaMiniForm(forms.ModelForm):
    image = CloudinaryFileField(
        options={"upload_preset": "profile_pics"}, required=True
    )

    class Meta:
        model = UserProfile
        fields = ["image"]


class UserMediaForm(UserMediaMiniForm):
    image = CloudinaryUnsignedJsFileField(
        "profile_pics", required=True, label=_("Profile Pic")
    )


class UserVideoForm(forms.ModelForm):
    video = EmbedVideoFormField(required=False)
    upload_type = forms.CharField(widget=forms.HiddenInput(), initial="video")

    class Meta:
        model = UserProfile
        fields = ["video"]


class UserUploadMiniForm(forms.ModelForm):
    identity = forms.ImageField()

    class Meta:
        model = UserIdentification
        fields = ["identity"]


class UserUploadForm(UserUploadMiniForm):
    identity = CloudinaryUnsignedJsFileField(
        "identity", label=_("Profile Pic"), required=True
    )


NO_LINK_REGEX = (
    "\(([^)]+)\)\[([^\]]+)\]|\[([^\]]+)\]\(([^)]+)\)|(http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+)"
)


class VerifiedProfileForm(forms.ModelForm):

    class Meta:
        model = UserProfile
        fields = ("description",)
        labels = {"description": _("Describe Yourself to the Tuteria Community")}


class UserProfileForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["description"].required = False
        self.fields["dob"].required = False
        self.fields["gender"].choices = [("", "Gender")] + list(
            self.fields["gender"].choices
        )[1:]
        self.helper = FormHelper

    class Meta:
        model = UserProfile
        fields = ("gender", "description", "dob")
        labels = {
            "gender": _("I am"),
            "dob": _("Birth Date"),
            "description": _("Describe Yourself to the Tuteria Community"),
        }
        widgets = {
            "dob": SelectDateWidget(
                years=tuple([y for y in range(1920, datetime.date.today().year + 1)])
            )
        }
        error_messages = {"dob": {"required": "Please input your date of birth"}}

        # def save(self, commit=True):
        #     instance = super().save(commit=False)
        #     # dob = "{}/{}/{}".format(self.cleaned_data['month'], self.cleaned_data['day'],
        #     # self.cleaned_data['year'])
        #     # instance.dob = datetime.datetime.strptime(dob, "%B/%d/%Y")
        #     description = self.cleaned_data['description']
        #     if description:
        #         description = re.sub(NO_LINK_REGEX, '', description)
        #         instance.description.raw = description
        #     if commit:
        #         instance.save()
        #     return instance


class UserAdminForm(forms.ModelForm):

    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "username",
            "is_staff",
            "is_active",
            "date_joined",
            "country",
            "tutor_intent",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["country"].required = False

    def is_valid(self):
        # log.info(force_text(self.errors))
        return super().is_valid()


class PhoneNumberForm(forms.ModelForm):
    number = PhoneNumberField(label=_("PRIMARY PHONE NUMBER"))
    primary_phone_no1 = PhoneNumberField(label=_("Confirm Primary Number"))

    class Meta:
        model = PhoneNumber
        fields = ["number"]

    def __init__(self, *args, **kwargs):
        inst = kwargs.get("instance")
        super().__init__(*args, **kwargs)
        if inst:
            self.fields["primary_phone_no1"].initial = inst.number

    def clean_primary_phone_no1(self):
        no1 = self.cleaned_data.get("number")
        no2 = self.cleaned_data.get("primary_phone_no1")

        if not no2:
            msg = u"You must confirm your Primary phone number"
            raise forms.ValidationError(msg)
        if no1 != no2:
            msg = u"The numbers do not match"
            raise forms.ValidationError(msg)
        return no2

    # def clean(self):
    #     cleaned_data = super(PhoneNumberForm,self).clean()
    #     logger.info("Cleaning phone form")
    #     no1 = cleaned_data.get('number')
    #     no2 = cleaned_data.get('primary_phone_no1')

    #     if not no2:
    #         msg = u"You must confirm your Primary phone number"
    #         self.add_error('primary_phone_no1',msg)
    #     if no1 != no2:
    #         msg = u"The numbers do not match"
    #         self.add_error('primary_phone_no1',msg)
    #     return self.cleaned_data

    def save(self, user):
        instance = super().save(commit=False)
        logger.info("Phone Form")
        previous_number = user.primary_phone_no
        if previous_number:
            previous_number.primary = True
            previous_number.number = instance.number
            previous_number.verified = True
            previous_number.save()
        else:
            instance.owner = user
            instance.primary = True
            instance.verified = True
            previous_number = instance.save()

        return previous_number

    def verify(self, user):
        primary_phone_no = user.primary_phone_no
        primary_phone_no.verified = True
        primary_phone_no.save()


class BaseForm(gateway_forms.RootFormMixin, forms.ModelForm):

    @classmethod
    def get_form_instance(cls, data, instance, **kwargs):
        return cls(data, instance=instance)

    @classmethod
    def serialized_form_fields(cls):
        from django import forms

        instance = cls()
        result = {}
        for key, field in instance.fields.items():
            value = {}
            value["type"] = field.__class__.__name__
            if value["type"] == "LazyTypedChoiceField":
                value.update(type="ChoiceField")
            if isinstance(field.widget, forms.HiddenInput):
                value["hidden"] = True
            kwargs = {}
            kwargs["required"] = field.required
            if hasattr(field, "choices"):
                kwargs.update(choices=field.choices)
            if isinstance(field.widget, forms.SelectDateWidget):
                the_class = field.widget.__class__
                kwargs["widget"] = the_class.__name__
                kwargs["kwargs"] = {"years": field.widget.years}
            if value["type"] == "SimpleArrayField":
                kwargs["base_field"] = field.base_field.__class__.__name__
            if field.label:
                kwargs["label"] = str(field.label)
            value.update(kwargs=kwargs)
            errors = {}
            for kk, vv in field.error_messages.items():
                errors[kk] = str(vv)
            # value.update(error_messages=field.error_messages)
            value.update(error_messages=errors)
            result[key] = value
        return result


class UserProfileForm1(BaseForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["dob"].required = True
        self.fields["gender"].choices = [("", "Gender")] + list(
            self.fields["gender"].choices
        )[1:]

    class Meta:
        model = UserProfile
        fields = ("gender", "dob")
        labels = {"gender": _("Gender"), "dob": _("Birth Date")}
        error_messages = {"dob": {"required": "This field is required."}}


class UserEditForm1(BaseForm):
    """Form for viewing and editing name fields in a DemoUser object.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in ["first_name", "last_name", "email", "country"]:
            self.fields[field].required = True

    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "country")
        error_messages = {
            "country": {"required": "Select one of the choices provided."}
        }


class BasicProfileForm(object):

    def __init__(self):
        self.user_details = UserEditForm1()
        self.user_profile = UserProfileForm1()

    @classmethod
    def serialized_form_fields(cls):
        form_class = cls()
        user_profile_form_fields = form_class.user_profile.serialized_form_fields()
        data = dict(
            form_class.user_details.serialized_form_fields(), **user_profile_form_fields
        )
        return data


class TutorAppAboutTutorInfo1(BaseForm):
    online_experience = forms.BooleanField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["online_experience"].required = True

    class Meta:
        model = User
        fields = ("online_experience",)

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.teach_online = self.cleaned_data["online_experience"]
        if commit:
            instance.save()
        return instance


class TutorAppAboutTutorInfo2(BaseForm):
    title = forms.CharField()
    years_of_experience = forms.IntegerField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in ["years_of_experience", "title", "description"]:
            self.fields[field].required = True

    class Meta:
        model = UserProfile
        fields = ("years_of_experience", "title", "description")

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.custom_header = self.cleaned_data["title"]
        instance.years_of_teaching = self.cleaned_data["years_of_experience"]
        if commit:
            instance.save()
        return instance


class TutorPhotoInfo(BaseForm):
    image = forms.CharField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["image"].required = True

    class Meta:
        model = UserProfile
        fields = ("image",)

    def save(self, commit=True):
        instance = super().save(commit=False)
        storage_response = upload(self.cleaned_data["image"])
        img = cloudinary.CloudinaryImage(storage_response["public_id"])
        instance.image = img
        if commit:
            instance.save()
        return instance


class PhoneNumberForm1(BaseForm):
    number = PhoneNumberField(label=_("Number"))

    class Meta:
        model = PhoneNumber
        fields = ["number", "primary"]

    def __init__(self, *args, **kwargs):
        inst = kwargs.get("instance")
        super().__init__(*args, **kwargs)

    def save(self, user):
        instance = super().save(commit=False)
        instance.owner = user
        instance.save()
        return instance


def validate_phonenumber(value):
    field_value = str(value).replace(" ", "")
    if PhoneNumber.objects.filter(number=field_value).exists():
        raise ValidationError("The phone number is already registered with us.")


def validate_phonenumber1(value):
    field_value = str(value).replace(" ", "")
    if PhoneNumber.objects.filter(number=field_value).exists():
        raise ValidationError("The phone number {} is already registered with us.")


class BaseFormSet(formsets.BaseFormSet):
    owner = None

    def save(self, **kwargs):
        """
        :rtype: object
        """
        data = kwargs
        if self.owner:
            data = {"user_id": self.owner.pk}
        results = []
        # Use DB Transaction here:
        try:
            with transaction.atomic():
                for form in self.forms:
                    results.append(form.save(**data))
        except IntegrityError as e:
            raise
        return self.owner

    @property
    def errors(self):
        """
        Returns a list of form.errors for every form in self.forms.
        """
        the_errors = super().errors
        # Remove empty dictionaries from list.
        the_errors = list(filter(None, the_errors))
        # if any(the_errors):
        #     return the_errors
        # return []
        output_errors = the_errors if any(the_errors) else []
        output_errors.extend(self.non_form_errors())
        return output_errors

    @classmethod
    def serialized_form_fields(cls):
        formset = cls()
        return {
            "form": formset.form.serialized_form_fields(),
            "extra": formset.extra,
            "max_num": formset.max_num,
        }

    @classmethod
    def get_form_instance(cls, params, user, raw=False, prefix="form", **kwargs):
        if raw:
            form_data = params
        else:
            form_data = cls.to_form_data(params, prefix=prefix)
        instance = cls(form_data, prefix=prefix)
        instance.owner = user
        return instance

    @classmethod
    def to_form_data(cls, params, prefix="form"):
        result = {}
        params = params if params else []
        length_of_formset = len(params)
        result.update(
            {
                "{}-TOTAL_FORMS".format(prefix): length_of_formset,
                "{}-INITIAL_FORMS".format(prefix): 0,
                "{}-MAX_NUM_FORMS".format(prefix): "",
            }
        )
        for index, form in enumerate(params):
            for key, value in form.items():
                result["{}-{}-{}".format(prefix, index, key)] = value
        return result


class BasePhoneNumberFormSet(BaseFormSet):

    def clean(self):
        """
        Checks that no two entries have the same numbers.
        """
        if any(self.errors):
            # Don't bother validating the formset unless each form is valid on its own
            return

        errors = []
        numbers = []
        has_primary_no = False
        for form in self.forms:
            if form.cleaned_data:
                number = form.cleaned_data["number"]
                if number in numbers:
                    raise forms.ValidationError(
                        "Phone number {} should not be entered more than once".format(
                            number
                        )
                    )
                numbers.append(number)
                try:
                    validate_phonenumber1(number)
                except Exception as e:
                    errors.append(e.message.format(number))

        if errors:
            raise forms.ValidationError(errors)

    def save(self, **kwargs):
        """
        :rtype: object
        """
        # Use DB Transaction here:
        results = []
        try:
            with transaction.atomic():
                for form in self.forms:
                    results.append(form.save(user=self.owner))
        except IntegrityError as e:
            raise
        return results


PhoneNumberFormSet = forms.formset_factory(
    form=PhoneNumberForm1,
    formset=BasePhoneNumberFormSet,
    extra=2,
    max_num=5,
    validate_max=True,
)


class SignupForm(FormMixin, forms.Form):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = "opera-signupform"
        self.helper.form_class = "form"
        self.helper.form_method = "post"
        self.helper.form_action = "account_signup"

        self.helper.add_input(Submit("submit", "Submit"))

    form_name = "signup_form"

    confirm_email = forms.EmailField(
        label="Confirm Email", widget=get_placeholder("Confirm Email Address")
    )
    first_name = forms.CharField(
        max_length=30, label="First Name", widget=get_placeholder("First name")
    )
    last_name = forms.CharField(
        max_length=30, label="Last Name", widget=get_placeholder("Surname")
    )
    country = forms.ChoiceField(
        widget=forms.Select,
        # widget=CountrySelectWidget,
        choices=sorted(COUNTRIES.items()),
    )
    phone_number = PhoneNumberField(
        label=_("Phone Number"),
        error_messages={
            "invalid": "Please enter a valid phone number e.g +2348132423324 "
        },
        widget=get_placeholder("+2347035509923", id="phone_no"),
        validators=[validate_phonenumber],
    )

    address = forms.CharField(required=False, widget=get_placeholder("Your Address"))

    state = forms.ChoiceField(
        required=False, choices=Location.NIGERIAN_STATES, initial="Lagos"
    )
    referral_code = forms.CharField(required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["country"].initial = "NG"

    def signup(self, request, user):
        email = self.cleaned_data["email"]
        confirm_email = self.cleaned_data["confirm_email"]
        if email and confirm_email:
            if email != confirm_email:
                msg = "You must input the same email as before."
                logger.error("Email not the same")
                self.add_error("confirm_email", msg)
        user.first_name = self.cleaned_data["first_name"].title()
        user.last_name = self.cleaned_data["last_name"].title()
        user.country = self.cleaned_data["country"]

        logger.info(user.country)
        logger.debug(request.POST.get("tutor_intent"))
        if bool(request.POST.get("tutor_intent")):
            user.tutor_intent = True
        # user.guess_display_name()
        try:
            user.save()
            PhoneNumber.objects.create(
                owner=user, number=self.cleaned_data["phone_number"], primary=True
            )
            address = self.cleaned_data["address"]
            state = self.cleaned_data["state"]
            logger.info(address)
            if address:
                Location.objects.create(user=user, address=address, state=state)
            w = self.cleaned_data["referral_code"]
            if w:
                Referral.activate_referral(user, w.lower())

        except IntegrityError as e:
            logger.error(e)
            logger.error(user)
            logger.error(self.cleaned_data)
            raise ValidationError(
                "This email seems to exist in our database. please login or try again with a different emai"
            )


class UserHomeAddressForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        choices = kwargs.pop("user_state", None)
        super().__init__(*args, **kwargs)
        # states = [o for o in self.data.keys() if 'state' in o]
        # counter = Constituency.objects.filter(
        #     state__in=[self.data[stat] for stat in states]).values_list('id','name')
        # self.fields['region'].choices = counter
        # if choices:
        #     counter = Constituency.objects.filter(state=self.instance.state).values_list('id','name')
        #     self.fields['region'].choices = counter
        self.fields["address"].required = True
        self.fields["state"].required = True
        self.fields["vicinity"].required = True

        self.helper = FormHelper()

    # region = forms.ChoiceField(required=False, choices=())

    class Meta:
        model = Location
        fields = ["address", "state", "vicinity"]
        labels = {"address": "Home Address", "vicinity": "Town/City"}
        # widget = {
        #     'latitude':forms.HiddenInput,
        #     'longitude':forms.HiddenInput
        # }
        error_messages = {
            "address": {"required": "Please enter your home address"},
            "state": {"required": "Please select the state where you live"},
            "vicinity": {
                "required": "Please enter a town or city around where you live."
            },
        }

    # def clean(self):
    #     data = super(UserHomeAddressForm, self).clean()
    #     regions = [o for o in self.data.keys() if 'region' in o]
    #     state = data['state']
    #     allo = Constituency.objects.filter(state=state).values_list('id',flat=True)
    #     allo = map(str, allo)
    #     # import pdb
    #     # pdb.set_trace()
    #     if len(allo) > 0:
    #         if len(regions) == 0:
    #              raise forms.ValidationError("For the state you selected, you must select a region")
    #         for region in regions:
    #             if self.data[region] not in allo:
    #                 raise forms.ValidationError("For the state you selected, you must select a region")
    #     return data

    def save(self, commit=True, changed=False):
        logger.info("address form commit is %s" % commit)
        instance = super().save(commit=False)
        # instance.address = instance.address.encode('ascii','ignore')
        instance.address = instance.address
        # if self.cleaned_data.get('region'):
        #     instance.region = Constituency.objects.get(pk=int(self.cleaned_data['region']))
        # else:
        #     instance.region = None
        if commit:
            instance.save()
            logger.info("Populating Vicinity for user")
            logger.info(instance)
            user = instance.user
            if changed and user.is_tutor:
                logger.info("Address Changed")
                populate_vicinity.delay(instance.pk)
            if not instance.latitude:
                populate_vicinity.delay(instance.pk)
        return instance


class TutorAddressForm1(forms.ModelForm):
    area = forms.CharField()

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop("user", None)
        super().__init__(*args, **kwargs)
        for field in ["address", "state", "area", "vicinity", "latitude", "longitude"]:
            self.fields[field].required = True

        self.helper = FormHelper()

    class Meta:
        model = Location
        fields = ["address", "state", "vicinity", "latitude", "longitude", "area"]
        labels = {"address": "Home Address", "vicinity": "Town/City"}
        error_messages = {
            "address": {"required": "Please enter your home address"},
            "state": {"required": "Please select the state where you live"},
            "vicinity": {
                "required": "Please enter a town or city around where you live."
            },
        }

    def save(self, commit=True, changed=False):
        instance = super().save(commit=False)
        instance.user = self.user
        instance.lga = self.cleaned_data["area"]
        instance.addr_type = 2
        if commit:
            instance.save()
        return instance


class UserIdentificationForm(forms.ModelForm):

    class Meta:
        model = UserIdentification
        fields = "__all__"
        widgets = {"user": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class LocationForm(forms.ModelForm):

    class Meta:
        model = Location
        fields = "__all__"
        widgets = {"user": autocomplete.ModelSelect2(url="users:user-autocomplete")}


UserHomeAddressFormSet = inlineformset_factory(
    User, Location, form=UserHomeAddressForm, extra=1, max_num=1
)


class TutorAddressForm(UserHomeAddressForm):

    class Meta(UserHomeAddressForm.Meta):
        fields = UserHomeAddressForm.Meta.fields + ["latitude", "longitude"]
        widget = {"latitude": forms.HiddenInput, "longitude": forms.HiddenInput}

    def save(self, commit=True, changed=False):
        instance = super(UserHomeAddressForm, self).save(commit=False)
        if commit:
            instance.save()
        return instance


class CheckboxSelectMultiple(forms.CheckboxSelectMultiple):
    template_name = "external/forms/checkbox_select.html"


class SubjectPopulateForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(SubjectPopulateForm, self).__init__(*args, **kwargs)
        # self.fields['pot']

    class Meta:
        model = UserProfile
        fields = ["potential_subjects", "answers", "levels_with_exams"]


class CalendarForm(forms.Form):
    weekday = forms.CharField(widget=forms.HiddenInput, label=_("Available day"))
    time_slot = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(
            ("Morning", "Morning"),
            ("Afternoon", "Afternoon"),
            ("Evening", "Evening"),
        ),
    )


class MyBaseFormset(forms.BaseFormSet):
    new_calendar_result = []

    def clean(self):
        if any(self.errors):
            return
        calendar_result = []
        for form in self.forms:
            calendar_result.append(form.cleaned_data)
        self.new_calendar_result = [
            x for x in calendar_result if len(x.get("time_slot")) > 0
        ]
        if len(self.new_calendar_result) == 0:
            raise forms.ValidationError("You are required to update your calendar")

    def update_calender(self, user):
        from users.services import CalendarService

        CalendarService.create_calendar(user, days=self.new_calendar_result)


CalendarFormSet = forms.formset_factory(CalendarForm, formset=MyBaseFormset, extra=0)
