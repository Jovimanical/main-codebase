import logging
from datetime import datetime

from dateutil.relativedelta import relativedelta, MO, TU, WE, TH, FR, SA, SU
from django import forms
from django.forms import inlineformset_factory
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from registration import tasks
from registration.models import Education, WorkExperience, Schedule, Guarantor
from users.models import User, UserProfile, Location
from users.tasks import populate_vicinity

logger = logging.getLogger(__name__)


class EducationForm(forms.ModelForm):
    # certificate = cloudinary_form.CloudinaryFileField(options={'upload_preset':'education_certificate'},label='Proof of Education')
    class Meta:
        model = Education
        fields = ["school", "course", "degree"]
        # 'certificate']
        label = {
            "school": _("Institution"),
            "degree": _("Degree"),
            "course": _("Course of Study"),
            # 'others': _('Degree Name')
        }
        widget = (
            {
                "degree": forms.Select(choices=Education.DEGREE),
                "school": forms.TextInput(
                    attrs={"placeholder": "E.g Univeristy of Ibadan."}
                ),
                "course": forms.TextInput(
                    attrs={"placeholder": "E.g. Petroleum Engineering"}
                ),
            },
        )
        error_messages = {
            "school": {"required": "Please enter a school"},
            "degree": {"required": "Please select a degree"},
            "course": {"required": "Please enter the course you studied"},
        }


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


class GuarantorForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(GuarantorForm, self).__init__(*args, **kwargs)
        self.fields["first_name"].required = True
        self.fields["last_name"].required = True
        self.fields["email"].required = False
        self.fields["phone_no"].required = True
        self.fields["no_of_years"].required = True
        self.fields["organization"].required = False

    class Meta:
        model = Guarantor
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_no",
            "no_of_years",
            "organization",
        ]
        # label = {
        #     'first_name': _('Institution'),
        #     'last_name':'',
        #     'email':'',
        #     'no_of_years':'',
        #     'phone_no':''
        # }
        widget = (
            {
                "first_name": forms.TextInput(attrs={"placeholder": "First name"}),
                "last_name": forms.TextInput(attrs={"placeholder": "Last Name"}),
                "email": forms.EmailInput(attrs={"placeholder": "Email"}),
                "phone_no": forms.TextInput(attrs={"placeholder": "Phone Number"}),
            },
        )
        error_messages = {
            "first_name": {"required": "Please input your guarantor's first name"},
            "last_name": {"required": "Please input your guarantor's last name"},
            "email": {"required": "Please input your guarantor's email address"},
            "phone_no": {
                "required": "Please Input your guarantor's phone number",
                "invalid": "The format of the number should be +2348022332233",
            },
            "no_of_years": {
                "required": "Please select the number of years your guarantor knows you"
            },
        }


valid_time_formats = ["%H:%M", "%I:%M%p", "%I:%M %p"]


class ScheduleForm(forms.ModelForm):
    DAYS_OF_THE_WEEK = (
        ("", "Select Day"),
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),
        ("Sunday", "Sunday"),
    )
    day = forms.CharField(label=_("Available day"))
    start_time = forms.TimeField(
        widget=forms.TimeInput(attrs={"class": "form-control time_input"}),
        help_text="ex: 10:30AM",
        label=_("From what time"),
        input_formats=valid_time_formats,
    )
    end_time = forms.TimeField(
        widget=forms.TimeInput(attrs={"class": "form-control time_input"}),
        help_text="ex: 10:30AM",
        label=_("To what time"),
        input_formats=valid_time_formats,
    )

    def clean_day(self):
        day = self.cleaned_data.get("day", None)
        if day not in [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]:
            raise forms.ValidationError("Please Input a valid day e.g Monday")
        return day

    class Meta:
        model = Schedule
        fields = ["tutor"]

    def save(self, commit=True):
        instance = super(ScheduleForm, self).save(commit=False)
        wk = dict(
            Monday=MO,
            Tuesday=TU,
            Wednesday=WE,
            Thursday=TH,
            Friday=FR,
            Saturday=SA,
            Sunday=SU,
        )
        start_date = timezone.now() + relativedelta(
            weekday=wk[self.cleaned_data["day"]]
        )
        schedule_start = datetime.combine(start_date, self.cleaned_data["start_time"])
        schedule_end = datetime.combine(start_date, self.cleaned_data["end_time"])
        if schedule_start > schedule_end:
            start_hour = schedule_start.hour
            if start_hour < 12:
                schedule_end = schedule_end + relativedelta(hours=12)
            else:
                schedule_start = schedule_start - relativedelta(hours=12)
        elif schedule_start == schedule_end:
            schedule_end = schedule_start + relativedelta(hours=6)
        else:
            schedule_start = schedule_start
            schedule_end = schedule_end
        schedule_rec = schedule_end + relativedelta(months=4)
        data = {
            "title": self.cleaned_data["day"],
            "start_time": schedule_start,
            "end_time": schedule_end,
            "reoccur_time": schedule_rec,
            "reoccur": True,
            "commit": commit,
        }
        logger.info(data)
        event = instance.tutor.one_time_available_event(**data)
        return event


def hour_string(hour):
    if hour > 1:
        return "{} hours per day".format(hour)
    return "{} hour per day".format(hour)


def day_string(day):
    if day > 1:
        return "{} days per week".format(day)
    return "{} day per week".format(day)


def number_up_to(t_type, start_text, length):
    if t_type == "hour":
        function = hour_string
    else:
        function = day_string
    result = [(x, function(x)) for x in range(1, length)]
    result.insert(0, ("", start_text))
    return result


class TutorAddressForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(TutorAddressForm, self).__init__(*args, **kwargs)
        self.fields["address"].required = False
        self.fields["state"].required = False
        self.fields["vicinity"].required = False

    class Meta:
        model = Location
        fields = ["address", "state", "vicinity"]
        labels = {"address": "Tutoring Address"}

    def save(self, commit=True, user=None):
        instance = None
        if user:
            if self.cleaned_data["address"] and self.cleaned_data["state"]:
                user.location_set.filter(addr_type=Location.TUTOR_ADDRESS).delete()
                instance = super(TutorAddressForm, self).save(commit=False)
                instance.addr_type = Location.TUTOR_ADDRESS
                instance.user = user
            else:
                home_addr = user.home_address
                if home_addr:
                    home_addr.addr_type = Location.TUTOR_ADDRESS
                    home_addr.save()
        if commit:
            if instance:
                instance.save()
                populate_vicinity.delay(instance.pk)
        return instance


class CheckboxSelectMultiple(forms.CheckboxSelectMultiple):
    template_name = "external/forms/checkbox_select.html"


class HomeTutoringSpecificForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(HomeTutoringSpecificForm, self).__init__(*args, **kwargs)
        self.fields["curriculum_used"].required = False

    classes = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(
            ("nursery", "Nursery"),
            ("primary", "Primary"),
            ("jss", "JSS Level"),
            ("sss", "SSS Level"),
            ("undergraduate", "Undergraduates"),
            ("adult", "Adults"),
        ),
        label="Select classes you teach",
    )
    curriculum_used = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple, required=False, choices=UserProfile.CURRICULUM
    )

    class Meta:
        model = UserProfile
        fields = [
            "years_of_teaching",
            "curriculum_used",
            "curriculum_explanation",
            "classes",
        ]

        labels = {"years_of_teaching": _("How long have you been teaching?")}
        widgets = {"years_of_teaching": forms.Select}

    def clean(self):
        cleaned_data = super(HomeTutoringSpecificForm, self).clean()
        # classes = cleaned_data.get('classes')
        # if not classes:
        #     raise forms.ValidationError("You must select a class range")
        curriculum_used = cleaned_data.get("curriculum_used")
        # if 'nursery' in classes or 'primary' in classes or 'jss' in classes:
        #     if len(curriculum_used) == 0:
        #         self.add_error("curriculum_used","You must select a curriculum for the above classes.")
        #         raise forms.ValidationError("You must select a curriculum for the above classes.")
        curriculum_explanation = cleaned_data.get("curriculum_explanation")
        if curriculum_used in [2, 3]:
            if not curriculum_explanation:
                self.add_error(
                    "curriculum_explanation",
                    "Explain your understanding of the curriculum you selected",
                )
        return cleaned_data

    def save(self, commit=True):
        instance = super(HomeTutoringSpecificForm, self).save(commit=False)
        instance.classes = self.cleaned_data["classes"]
        instance.curriculum_used = self.cleaned_data["curriculum_used"]
        # instance.curriculum_used = self.cleaned_data['curriculum_user']
        # options  = [ast.literal_eval(u) for u in self.cleaned_data['class_range']]
        # instance.classes = [item for sublist in options for item in sublist]
        if commit:
            instance.save()
        return instance


class TutorDescriptionForm(HomeTutoringSpecificForm):

    def __init__(self, *args, **kwargs):
        super(TutorDescriptionForm, self).__init__(*args, **kwargs)
        self.fields["tutor_description"].required = True

    class Meta(HomeTutoringSpecificForm.Meta):
        fields = HomeTutoringSpecificForm.Meta.fields + [
            "tutor_description",
            "tutoring_address",
            "address_reason",
        ]

    def clean(self):
        cleaned_data = super(TutorDescriptionForm, self).clean()
        tutoring_address = cleaned_data.get("tutoring_address")
        address_reason = cleaned_data.get("address_reason")
        if tutoring_address == UserProfile.TUTOR_RESIDENCE:
            if not address_reason:
                self.add_error("address_reason", "This field is required")


class TutoringPreferenceForm(forms.ModelForm):
    toggle_skill = forms.BooleanField(
        widget=forms.CheckboxInput,
        required=False,
        label="Apply monthly tutoring option to all Skills?",
    )

    def __init__(self, *args, **kwargs):
        super(TutoringPreferenceForm, self).__init__(*args, **kwargs)
        self.fields["hours"].required = False
        self.fields["days"].required = False

    class Meta:
        model = UserProfile
        fields = ["allow_monthly", "days", "hours"]
        labels = {
            "allow_monthly": _("Allow Monthly Tutoring"),
            "days": _("Number of days per week"),
            "hours": _("Number of hours per day"),
            "years_of_teaching": _("How long have you been teaching?"),
        }
        widgets = {
            "days": forms.Select(choices=number_up_to("day", "Select Number", 8)),
            "hours": forms.Select(choices=number_up_to("hour", "Select Number", 6)),
            "years_of_teaching": forms.Select(
                choices=(
                    ("", "Just starting out"),
                    (2, "Less than 2 years"),
                    (5, "Between 3 to 5 years"),
                    (10, "Between 6 to 10 years"),
                    (50, "More than 10 years"),
                )
            ),
        }

    def save(self, commit=True):
        instance = super(TutoringPreferenceForm, self).save(commit=False)
        if commit:
            instance.save()
            if self.cleaned_data["toggle_skill"]:
                instance.user.tutorskill_set.update(
                    monthly_booking=instance.allow_monthly
                )
        return instance


class TutoringPreferenceForm2(HomeTutoringSpecificForm):
    toggle_skill = forms.BooleanField(
        widget=forms.CheckboxInput,
        required=False,
        label="Apply monthly tutoring option to all Skills?",
    )

    def __init__(self, *args, **kwargs):
        super(TutoringPreferenceForm2, self).__init__(*args, **kwargs)
        self.fields["hours"].required = False
        self.fields["days"].required = False

    class Meta(HomeTutoringSpecificForm.Meta):
        fields = HomeTutoringSpecificForm.Meta.fields + [
            "allow_monthly",
            "days",
            "hours",
        ]
        labels = {
            "allow_monthly": _("Allow Monthly Tutoring"),
            "days": _("Number of days per week"),
            "hours": _("Number of hours per day"),
            "years_of_teaching": _("How long have you been teaching?"),
        }
        widgets = {
            "days": forms.Select(choices=number_up_to("day", "Select Number", 8)),
            "hours": forms.Select(choices=number_up_to("hour", "Select Number", 6)),
            "years_of_teaching": forms.Select(
                choices=(
                    ("", "Just starting out"),
                    (2, "Less than 2 years"),
                    (5, "Between 3 to 5 years"),
                    (10, "Between 6 to 10 years"),
                    (50, "More than 10 years"),
                )
            ),
        }

    def save(self, commit=True):
        instance = super(TutoringPreferenceForm2, self).save(commit=False)
        if commit:
            instance.save()
            if self.cleaned_data["toggle_skill"]:
                instance.user.tutorskill_set.update(
                    monthly_booking=instance.allow_monthly
                )
        return instance


class PolicyForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(PolicyForm, self).__init__(*args, **kwargs)
        # self.fields['tutoring_distance'].required = False

    class Meta:
        model = UserProfile
        fields = [
            # 'cancellation',
            # 'tutoring_address',
            # 'tutoring_distance',
            # 'response_time',
            # 'booking_prep',
            "address_reason"
        ]
        labels = {
            "cancellation": _("Select Policy"),
            "tutoring_address": _("Where should lessons hold?"),
            # 'tutoring_distance': _('How far can you travel for lessons?'),
            # 'response_time': _('Average response time'),
            # 'booking_prep': _('Booking Preference'),
            "address_reason": _("Explain why you prefer lessons at your location"),
        }
        widgets = {}


class AgreementForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(AgreementForm, self).__init__(*args, **kwargs)
        self.fields["good_fit"].required = True
        self.fields["terms_and_conditions"].required = True

    class Meta:
        model = UserProfile
        fields = ["good_fit", "terms_and_conditions"]
        labels = {
            "good_fit": _("I agree to the Good Fit Guarantee"),
            "terms_and_conditions": _("I agree to Tuteria terms and conditions"),
        }
        widgets = {
            "good_fit": forms.CheckboxInput(attrs={}),
            "terms_and_conditions": forms.CheckboxInput(attrs={}),
        }


class TutorStatusForm(forms.ModelForm):

    class Meta:
        model = UserProfile
        fields = ["application_status"]

    def save(self, commit=True):
        model = super(TutorStatusForm, self).save(commit=False)
        if model.application_status == 3:
            tasks.tutor_application_mail.delay(status="success")

        if model.application_status == 4:
            model.date_denied = datetime.now()
            model.application_trial += 1
            if model.application_trial == 3:
                tasks.tutor_application_mail.delay(status="blocked")
            else:
                tasks.tutor_application_mail.delay(status="denied")

        if commit:
            model.save()
        return model


class InterviewForm(forms.ModelForm):

    class Meta:
        model = UserProfile
        fields = ["interview_slot"]


TOTAL_FORM_COUNT = "TOTAL_FORMS"


class SensibleFormset(forms.BaseInlineFormSet):

    def total_form_count(self):
        """Returns the total number of forms in this FormSet."""
        if (self.data or self.files) and self.is_bound:
            return self.management_form.cleaned_data[TOTAL_FORM_COUNT]
        else:
            if self.initial_form_count() > 0:
                total_forms = self.initial_form_count()
            else:
                total_forms = self.initial_form_count() + self.extra
            if total_forms > self.max_num > 0:
                total_forms = self.max_num
            return total_forms


class EduFormset(SensibleFormset):

    def __init__(self, *args, **kwargs):
        super(EduFormset, self).__init__(*args, **kwargs)
        # self.forms[0].empty_permitted = False
        for form in self.forms:
            form.empty_permitted = False


EducationFormset = inlineformset_factory(
    User,
    Education,
    form=EducationForm,
    formset=EduFormset,
    max_num=2,
    extra=1,
    validate_max=True,
)

GuarantorFormset = inlineformset_factory(
    User,
    Guarantor,
    form=GuarantorForm,
    formset=EduFormset,
    max_num=2,
    extra=1,
    validate_max=True,
)

WorkExperienceFormSet = inlineformset_factory(
    User,
    WorkExperience,
    form=WorkExperienceForm,
    formset=SensibleFormset,
    max_num=2,
    validate_max=True,
    extra=1,
)

ScheduleFormset = inlineformset_factory(
    User,
    Schedule,
    form=ScheduleForm,
    formset=SensibleFormset,
    max_num=7,
    extra=1,
    validate_max=True,
    fk_name="tutor",
)
