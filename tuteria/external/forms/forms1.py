# -*- coding: utf-8 -*-
import json
import logging
import math
import datetime
import pytz
import urllib
from decimal import Decimal
from django.utils.safestring import mark_safe
from dal import autocomplete
from config import utils
from django import forms
from django.utils.translation import ugettext as _
from django.contrib.postgres import forms as ps_forms
from django.utils import timezone
from external.subjects import create_requests_from_response, parse_get_tutor
from external.tasks import email_notification_on_patnership
from registration.forms import number_up_to
from skills.models import ranger, TutorSkill, Category
from users.models import states
from pricings.models import Region
from functools import reduce

from ..models import BaseRequestTutor, Agent, RequestTutor, Patner, PriceDeterminator

distance_phone = [(x, "< %skm" % x) for x in range(5, 36, 5)]
distance_phone.insert(0, ("", "Select"))
distance_large = [(x, "less than %skm" % x) for x in range(5, 36, 5)]
distance_large.insert(00, ("", "Select"))

minimum_prices = [
    ("", "Minimum"),
    (100, u"₦100/hr"),
    (500, u"₦500/hr"),
    (1000, u"₦1000/hr"),
    (1500, u"₦1500/hr"),
    (2000, u"₦2000/hr"),
    (2500, u"₦2500/hr"),
    (3000, u"₦3000/hr"),
]

maximum_price = [("", "Max price")]
new_max = [
    ("", "Max price"),
    (500, u"₦500/hr"),
    (1000, u"₦1000/hr"),
    (1500, u"₦1500/hr"),
    (2000, u"₦2500/hr"),
    (3000, u"₦3000/hr"),
    (4000, u"₦4000/hr"),
    (5000, u"₦5000/hr"),
    (50000, u"₦5000+/hr"),
]

days_per_weeks = [
    ("", "Select No"),
    (1, "1 day per week"),
    (2, "2 days per week"),
    (3, "3 days per week"),
    (4, "4 days per week"),
    (5, "5 days per week"),
    (6, "6 days per week"),
    (7, "7 days per week"),
]
all_states = [("", "Select state")] + [(s, s) for s in states]

logger = logging.getLogger(__name__)


class TutorSkillFilterForm(forms.Form):
    location = forms.CharField(required=False)
    distance = forms.ChoiceField(required=False)
    age = forms.ChoiceField(required=False, choices=RequestTutor.AGES)
    # start_rate = forms.IntegerField(widget=forms.HiddenInput, required=False)
    # start_rate = forms.ChoiceField(choices=minimum_prices, required=False)
    # end_rate = forms.IntegerField(widget=forms.HiddenInput, required=False)
    end_rate = forms.ChoiceField(choices=new_max, required=False)
    gender = forms.ChoiceField(
        required=False, choices=(("", "Select"), ("M", "Male"), ("F", "Female"))
    )
    longitude = forms.CharField(required=False, widget=forms.HiddenInput)
    latitude = forms.CharField(required=False, widget=forms.HiddenInput)
    query = forms.CharField(widget=forms.HiddenInput)
    region = forms.ChoiceField(required=False, choices=all_states, initial="")
    is_teacher = forms.BooleanField(required=False)
    days_per_week = forms.ChoiceField(choices=days_per_weeks, required=False)
    curriculum_used = forms.ChoiceField(
        choices=BaseRequestTutor.CURRICULUM, required=False
    )
    classes = forms.ChoiceField(
        choices=(
            ("", "Select Class"),
            ("nursery", "Nursery"),
            ("primary", "Primary"),
            ("jss", "JSS Level"),
            ("sss", "SSS Level"),
            ("undergraduate", "Undergraduates"),
            ("adult", "Adults"),
        )
    )
    years_of_teaching = forms.ChoiceField(
        choices=(
            ("", "Just starting out"),
            (2, "Less than 2 years"),
            (5, "Between 3 to 5 years"),
            (10, "Between 6 to 10 years"),
            (50, "More than 10 years"),
        )
    )

    def __init__(self, **kwargs):
        choice = distance_large
        if "choice_type" in kwargs:
            if kwargs["choice_type"]:
                choice = distance_phone
            kwargs.pop("choice_type", None)
        super(TutorSkillFilterForm, self).__init__(**kwargs)
        self.fields["distance"].choices = choice


valid_time_formats = [
    "%H:%M",
    "%I:%M%p",
    "%I:%M:%p",
    "%I:%M %p",
    "%I%p",
    "%I:%M:%S",
    "%I:%M:%S %p",
]


class RequestTutorForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        # first call parent's constructor
        super(RequestTutorForm, self).__init__(*args, **kwargs)
        # there's a `fields` property now
        self.fields["hours_per_day"].required = False

    class Meta:
        model = BaseRequestTutor
        fields = [
            "expectation",
            "budget",
            "gender",
            "no_of_students",
            "tutoring_location",
            "hours_per_day",
        ]

        widgets = {
            "expectation": forms.Textarea,
            "budget": forms.Select(choices=new_max, attrs={"class": "form-control"}),
            "no_of_students": forms.Select(
                choices=ranger(6, " student"), attrs={"class": "form-control"}
            ),
            "tutoring_address": forms.Select(attrs={"class": "form-control"}),
            # 'days': forms.Select(choices=number_up_to('day', "Select Number", 8)),
            "hours": forms.Select(choices=number_up_to("hour", "Select Number", 6)),
            # 'booking_option': forms.RadioSelect
        }
        labels = {
            "expectation": _("What do you hope to accomplish with this tutoring?")
        }
        help_texts = {
            # 'description': _('Some useful help text.'),
        }


STATE_OPTIONS = {
    "Abia": dict(vicinity="Ohafia", name="Chinedu", image=""),
    "Adamawa": dict(vicinity="Yola", name="Ishaya", image=""),
    "Akwa Ibom": dict(vicinity="Eket", name="Unyime", image=""),
    "Anambra": dict(vicinity="Akwa", name="Chinedu", image=""),
    "Bayelsa": dict(vicinity="Okaka", name="Tobore", image=""),
    "Bauchi": dict(vicinity="Misau", name="Ishaya", image=""),
    "Benue": dict(vicinity="Gboko", name="Emeka", image=""),
    "Borno": dict(vicinity="Borno", name="Ishaya", image=""),
    "Cross River": dict(vicinity="Ikom", name="Uwem", image=""),
    "Delta": dict(vicinity="Asaba", name="Allen", image=""),
    "Edo": dict(vicinity="Uniben", name="Samson", image=""),
    "Ebonyi": dict(vicinity="Onicha", name="Emeka", image=""),
    "Ekiti": dict(vicinity="Ikere", name="Adetola", image=""),
    "Enugu": dict(vicinity="Awgu", name="Chinedu", image=""),
    "Gombe": dict(vicinity="Dukku", name="Ishaya", image=""),
    "Imo": dict(vicinity="Oguta", name="Chinedu", image=""),
    "Jigawa": dict(vicinity="Dutse", name="Ishaya", image=""),
    "Kaduna": dict(vicinity="Ebonyi", name="Ishaya", image=""),
    "Kano": dict(vicinity="Ebonyi", name="Ishaya", image=""),
    "Katsina": dict(vicinity="Zaria", name="Ishaya", image=""),
    "Kebbi": dict(vicinity="Jega", name="Ishaya", image=""),
    "Kogi": dict(vicinity="Okene", name="Victor", image=""),
    "Kwara": dict(vicinity="Tanke", name="Victor", image=""),
    "Lagos": dict(vicinity="Ajah", name="Chinedu", image=""),
    "Nassawara": dict(vicinity="Lafia", name="Ishaya", image=""),
    "Niger": dict(vicinity="Bida", name="Ishaya", image=""),
    "Ogun": dict(vicinity="Sagamu", name="Adewale", image=""),
    "Ondo": dict(vicinity="Akure", name="Adewale", image=""),
    "Osun": dict(vicinity="Iwo", name="Adewale", image=""),
    "Oyo": dict(vicinity="Ibadan", name="Adewale", image=""),
    "Plateau": dict(vicinity="Bassa", name="Hassan", image=""),
    "Rivers": dict(vicinity="Okrika", name="Kingsley", image=""),
    "Sokoto": dict(vicinity="Kwawe", name="Ishaya", image=""),
    "Taraba": dict(vicinity="Kurmi", name="Ishaya", image=""),
    "Yobe": dict(vicinity="Bade", name="Ishaya", image=""),
    "Zamfara": dict(vicinity="Gusau", name="Ishaya", image=""),
    "Abuja": dict(vicinity="Wuse 2", name="Ahmed", image=""),
}


class RequestForm(forms.ModelForm):
    class Meta:
        model = BaseRequestTutor
        fields = "__all__"
        widgets = {"user": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class CheckboxSelectMultiple(forms.CheckboxSelectMultiple):
    template_name = "external/forms/checkbox_select.html"


class BareRequestForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(BareRequestForm, self).__init__(*args, **kwargs)
        self.fields["class_urgency"].required = True
        # self.fields['hours_per_day'].empty_label = None
        # self.fields['hours_per_day'].required = True
        self.fields["email"].required = True
        self.fields["number"].required = True

    class Meta:
        model = BaseRequestTutor
        fields = ["no_of_students", "class_urgency", "email", "number"]

    def save(self, commit=False):
        instance = super(BareRequestForm, self).save(commit=False)
        instance.slug = utils.generate_code(BaseRequestTutor, key="slug")
        if commit:
            instance.save()
        return instance


class BaseRequestForm(BareRequestForm):
    def __init__(self, *args, **kwargs):
        super(BaseRequestForm, self).__init__(*args, **kwargs)
        self.fields["latitude"].required = False
        self.fields["longitude"].required = False
        self.fields["home_address"].required = True
        # self.fields['time_to_call'].required = False
        # self.fields['time_to_call'].initial = "3"
        self.fields["state"].required = True
        self.fields["vicinity"].required = True

    class Meta(BareRequestForm.Meta):
        fields = BareRequestForm.Meta.fields + [
            "home_address",
            # 'time_to_call',
            "latitude",
            "longitude",
            "state",
            "vicinity",
        ]
        widgets = {
            "longitude": forms.HiddenInput,
            "latitude": forms.HiddenInput,
            "number": forms.TextInput(
                attrs={
                    "placeholder": "Enter Phone Number",
                    "class": "form-control",
                    "minlength": "10",
                    "maxlength": 11,
                }
            ),
            "home_address": forms.TextInput(
                attrs={
                    "placeholder": "E.g. 24 Bode Thomas Street, Surulere",
                    "class": "form-control",
                }
            ),
            "email": forms.TextInput(attrs=dict(placeholder="Email address")),
        }
        labels = {
            "age": _("Age range of child"),
            "hours_per_day": _("No. of hours per lesson"),
            # 'time_to_call': _('Best time to call'),
        }


class HomeParentRequestForm(BaseRequestForm):
    pass
    # def __init__(self, *args, **kwargs):
    #     super(HomeParentRequestForm, self).__init__(*args, **kwargs)
    #     self.fields['class_of_child'].required = True
    #     self.fields['age'].required = True
    #     # self.fields['class_of_child'].initial = "5"
    #     # self.fields['age'].initial = "2"
    #     # self.fields['hours_per_day'].initial = ""

    # class Meta(BaseRequestForm.Meta):
    #     fields = BaseRequestForm.Meta.fields + ['age', 'class_of_child']


class HomeSkillRequestForm(BaseRequestForm):
    def __init__(self, *args, **kwargs):
        super(HomeSkillRequestForm, self).__init__(*args, **kwargs)
        self.fields["tutoring_location"].required = True
        # self.fields['hours_per_day'].initial = ""
        self.fields["request_subjects"].required = False
        self.fields["tutoring_location"].initial = "neutral"

    class Meta(BaseRequestForm.Meta):
        fields = BaseRequestForm.Meta.fields + ["tutoring_location", "request_subjects"]


class BaseSecondForm(forms.ModelForm):
    def __init(self, *args, **kwargs):
        super(BaseSecondForm, self).__init__(*args, **kwargs)
        self.fields["region"].required = False

    available_days = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=True,
        choices=(),
        label="Preferred Days of lesson",
        error_messages={"required": "Please select a day when you would be available"},
    )

    def clean(self):
        cleaned_data = super(BaseSecondForm, self).clean()

        region = cleaned_data["region"]
        # if self.__class__ == ParentRequestForm:
        #     states_with_region = (
        #         Region.objects.exclude(state="")
        #         .exclude(state=None)
        #         .values_list("state", flat=True)
        #     )
        #     as_set = list(set(states_with_region))
        #     # if hasattr(self, 'instance') and not region:
        #     if self.instance.state in as_set:
        #         if not region:
        #             self.add_error("region", "Please select a region closest to you")

        # if region:
        #     region_is_valid = Region.validate_region(region, self.instance.state, False)
        #     # import pdb
        #     # pdb.set_trace()
        #     if not region_is_valid:
        #         self.add_error("region", "Please select a region closest to you")
        return cleaned_data

    class Meta:
        model = BaseRequestTutor
        fields = [
            "available_days",
            "region",
            "days_per_week",
            "hours_per_day",
            "class_of_child",
            "classes",
        ]

    def save(self, commit=True):
        instance = super(BaseSecondForm, self).save(commit=False)
        if commit:
            instance.save()
            instance.determine_validity()
        return instance


class SpecificSecondRequestForm(BaseSecondForm):
    actual_price = None

    time_of_lesson = forms.CharField(
        widget=forms.TextInput(
            attrs={"class": "form-control time_input", "placeholder": "11:30 AM"}
        ),
        help_text="ex: 10:30AM",
        label=_("From what time"),
    )

    # input_formats=valid_time_formats)

    def __init__(self, *args, **kwargs):
        self.actual_price = kwargs.pop("actual_price", None)
        price = kwargs.pop("prices", None)
        choices = (
            ("Monday", "Monday"),
            ("Tuesday", "Tuesday"),
            ("Wednesday", "Wednesday"),
            ("Thursday", "Thursday"),
            ("Friday", "Friday"),
            ("Saturday", "Saturday"),
            ("Sunday", "Sunday"),
        )
        super(SpecificSecondRequestForm, self).__init__(*args, **kwargs)
        self.fields["available_days"].choices = choices

    def clean(self):
        cleaned_data = super(SpecificSecondRequestForm, self).clean()
        hours_per_day = cleaned_data.get("hours_per_day")
        if not hours_per_day:
            self.add_error("hours_per_day", "Please select the number of hours.")
        available_days = cleaned_data.get("available_days")
        if available_days is None:
            raise forms.ValidationError("Please select a date")
        return cleaned_data

    class Meta(BaseSecondForm.Meta):
        fields = BaseSecondForm.Meta.fields + ["time_of_lesson"]
        widgets = {
            "subjects": forms.TextInput(attrs=dict(placeholder="Any other subjects?"))
        }
        error_messages = {
            # 'budget': {"invalid": "Please enter a valid budget. Only numbers no commas"},
            "time_of_lesson": {
                "invalid": "Please set a valid time. E.g. 5:00pm not 5pm"
            }
        }


class SecondRequestForm(SpecificSecondRequestForm):
    class Meta(SpecificSecondRequestForm.Meta):
        fields = SpecificSecondRequestForm.Meta.fields

    def clean(self):
        cleaned_data = super(BaseSecondForm, self).clean()
        region = cleaned_data["region"]
        if region:
            region_is_valid = Region.validate_region(region, self.instance.state, False)
            # import pdb
            # pdb.set_trace()
            if not region_is_valid:
                self.add_error("region", "Please select a region closest to you")
        return cleaned_data


class ParentRequestForm(SpecificSecondRequestForm):
    nursery = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(
            ("nursery_Elementary Mathematics", "Elementary Math"),
            ("nursery_Elementary English", "Elementary English"),
            ("nursery_Literacy & Numeracy", "Literacy & Numeracy"),
            ("nursery_Phonics", "Phonics & Orals"),
            ("nursery_General Nursery", "All Nursery Subjects"),
        ),
        label="Nursery",
    )
    primary = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(
            ("primary_Basic Mathematics", "Basic Mathematics"),
            ("primary_English Language", "English Language"),
            ("primary_Basic Sciences", "Basic Sciences"),
            ("primary_Verbal Reasoning", "Verbal Reasoning"),
            ("primary_Quantitative Reasoning", "Quant. Reasoning"),
            ("primary_Computer Education", "Computer Education"),
        ),
        label="Primary",
    )
    jss = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(
            ("jss_General Mathematics", "Mathematics"),
            ("jss_English Language", "English Language"),
            ("jss_Basic Sciences", "Basic Sciences"),
            ("jss_Business Studies", "Business Studies"),
            ("jss_Computer Science", "Computer Science"),
            ("jss_Basic Technology", "Basic Technology"),
            ("jss_Agricultural Science", "Agricultural Science"),
        ),
        label="JSS",
    )
    sss = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(
            ("sss_General Mathematics", "Mathematics"),
            ("sss_English Language", "English Language"),
            ("sss_Physics", "Physics"),
            ("sss_Further Mathematics", "Further Mathematics"),
            ("sss_Chemistry", "Chemistry"),
            ("sss_Literature in English", "Literature in English"),
            ("sss_Economics", "Economics"),
            ("sss_Commerce", "Commerce"),
            ("sss_Accounting", "Accounting"),
            ("sss_Government", "Government"),
            ("sss_Computer Science", "Computer Science"),
            ("sss_Technical Drawing", "Technical Drawing"),
            ("sss_Biology", "Biology"),
            ("sss_Agricultural Science", "Agricultural Science"),
            ("sss_Geography", "Geography"),
        ),
        label="SSS",
    )
    music_language = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(
            ("French Language", "French"),
            ("Spanish Language", "Spanish"),
            ("Piano", "Piano"),
            ("Drums", "Drums"),
            ("Guitar", "Guitar"),
            ("Saxophone", "Saxophone"),
            ("Yoruba Language", "Yoruba"),
            ("Hausa Language", "Hausa"),
            ("Igbo Language", "Igbo"),
        ),
        label="Nursery",
    )
    music_level = forms.ChoiceField(
        widget=forms.RadioSelect,
        required=False,
        choices=(
            ("Beginner", "Beginner"),
            ("Intermediate", "Intermediate"),
            ("Advanced", "Advanced"),
        ),
        label="Level",
    )
    nursery_level = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(
            ("Pre-Nursery", "Pre-Nursery"),
            ("Nursery 1", "Nursery 1"),
            ("Nursery 2", "Nursery 2"),
        ),
    )

    primary_level = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=[("Primary %s" % x, "Primary %s" % x) for x in range(1, 7)],
    )

    jss_level = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(("JSS 1", "JSS 1"), ("JSS 2", "JSS 2"), ("JSS 3", "JSS 3")),
    )

    sss_level = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(("SSS 1", "SSS 1"), ("SSS 2", "SSS 2"), ("SSS 3", "SSS 3")),
    )

    def __init__(self, *args, **kwargs):
        super(ParentRequestForm, self).__init__(*args, **kwargs)
        self.fields["request_subjects"].required = False
        self.fields["region"].required = False
        self.fields["curriculum"].initial = ""

    class Meta(SpecificSecondRequestForm.Meta):
        fields = SpecificSecondRequestForm.Meta.fields + [
            "request_subjects",
            "curriculum",
        ]
        labels = {
            "request_subjects": _("Others"),
            "curriculum": _("Curriculum used"),
            "gender": _("Do you prefer a male or female tutor?"),
        }

    def clean(self):
        cleaned = super(ParentRequestForm, self).clean()
        nursery = cleaned.get("nursery", [])
        primary = cleaned.get("primary", [])
        jss = cleaned.get("jss", [])
        sss = cleaned.get("sss", [])
        music_language = cleaned.get("music_language", [])
        nursery_level = cleaned.get("nursery_level", [])
        primary_level = cleaned.get("primary_level", [])
        jss_level = cleaned.get("jss_level", [])
        sss_level = cleaned.get("sss_level", [])
        music_level = cleaned.get("music_level", [])
        total_length = reduce(
            lambda x, y: x + len(y), [nursery, primary, jss, sss, music_language], 0
        )
        if total_length == 0:
            self.add_error(
                "request_subjects", "Please enter a subject or select one above"
            )
        if len(nursery) > 0:
            if (
                len(
                    set(nursery_level).intersection(
                        set(["Pre-Nursery", "Nursery 1", "Nursery 2"])
                    )
                )
                == 0
            ):
                self.add_error(
                    "request_subjects",
                    "Please select both subject and level for Nursery.",
                )
        else:
            if (
                len(
                    set(nursery_level).intersection(
                        set(["Pre-Nursery", "Nursery 1", "Nursery 2"])
                    )
                )
                > 0
            ):
                self.add_error(
                    "request_subjects",
                    "Please select both subject and level for Nursery.",
                )
        if len(primary) > 0:
            if (
                len(
                    set(primary_level).intersection(
                        set(["Primary %s" % x for x in range(1, 7)])
                    )
                )
                == 0
            ):
                self.add_error(
                    "request_subjects",
                    "Please select both subject and level for Primary.",
                )
        else:
            if (
                len(
                    set(primary_level).intersection(
                        set(["Primary %s" % x for x in range(1, 7)])
                    )
                )
                > 0
            ):
                self.add_error(
                    "request_subjects",
                    "Please select both subject and level for Primary.",
                )
        if len(jss) > 0:
            if (
                len(
                    set(jss_level).intersection(
                        set(["JSS %s" % x for x in range(1, 4)])
                    )
                )
                == 0
            ):
                self.add_error(
                    "request_subjects", "Please select both subject and level for JSS."
                )
        else:
            if (
                len(
                    set(jss_level).intersection(
                        set(["JSS %s" % x for x in range(1, 4)])
                    )
                )
                > 0
            ):
                self.add_error(
                    "request_subjects", "Please select both subject and level for JSS."
                )
        if len(sss) > 0:
            if (
                len(
                    set(sss_level).intersection(
                        set(["SSS %s" % x for x in range(1, 4)])
                    )
                )
                == 0
            ):
                self.add_error(
                    "request_subjects", "Please select both subject and level for SSS."
                )
        else:
            if (
                len(
                    set(sss_level).intersection(
                        set(["SSS %s" % x for x in range(1, 4)])
                    )
                )
                > 0
            ):
                self.add_error(
                    "request_subjects", "Please select both subject and level for SSS."
                )
        if len(music_language) > 0:
            if (
                len(
                    set([music_level]).intersection(
                        set(["Beginner", "Intermediate", "Advanced"])
                    )
                )
                == 0
            ):
                self.add_error(
                    "request_subjects",
                    "Please select both subject and level for Music & Language.",
                )
        else:
            if (
                len(
                    set([music_level]).intersection(
                        set(["Beginner", "Intermediate", "Advanced"])
                    )
                )
                > 0
            ):
                self.add_error(
                    "request_subjects",
                    "Please ensure that you selected both a subject and a class in the nursery category",
                )
        return cleaned

    def fix_result(self):
        return (
            [x.split("nursery_")[1] for x in self.cleaned_data["nursery"]]
            + [x.split("primary_")[1] for x in self.cleaned_data["primary"]]
            + [x.split("jss_")[1] for x in self.cleaned_data["jss"]]
            + [x.split("sss_")[1] for x in self.cleaned_data["sss"]]
            + [x for x in self.cleaned_data["music_language"]]
        )

    def save(self, default=True, commit=True):
        instance = super(ParentRequestForm, self).save(commit=False)

        # if self.cleaned_data['music_lan']
        total_subjects = (
            self.cleaned_data["nursery"]
            + self.cleaned_data["primary"]
            + self.cleaned_data["jss"]
            + self.cleaned_data["sss"]
            + self.cleaned_data["music_language"]
        )
        # cleaned_subjects = [x.split()]
        total_classes = (
            self.cleaned_data["nursery_level"]
            + self.cleaned_data["primary_level"]
            + self.cleaned_data["jss_level"]
            + self.cleaned_data["sss_level"]
            + [self.cleaned_data["music_level"]]
        )
        clss = [uu for uu in total_classes if uu]
        if not default:
            create_requests_from_response(total_subjects, clss, instance)
            # import pdb; pdb.set_trace()
        instance.classes = total_classes
        instance.request_subjects = self.fix_result()
        if commit:
            instance.determine_validity()
            # u = parse_get_tutor(total_subjects)
            # if len(u) == 1:

            instance.save()
        return instance


class TutorRequestForm1(BareRequestForm):
    def __init__(self, *args, **kwargs):
        options = kwargs.pop("opts_choices", None)
        super(TutorRequestForm1, self).__init__(*args, **kwargs)
        # self.fields['request_subjects'].required = False
        self.fields["latitude"].required = False
        self.fields["longitude"].required = False
        self.fields["home_address"].required = True
        self.fields["state"].required = True
        self.fields["vicinity"].required = True

        if options:
            self.fields["subject"].choices = options["subject"]

    subject = forms.ChoiceField(
        widget=forms.Select, required=True, choices=(), label="Subjects"
    )

    class Meta(BareRequestForm.Meta):
        fields = BareRequestForm.Meta.fields + [
            "home_address",
            "tutoring_location",
            "latitude",
            "longitude",
            "state",
            "vicinity",
        ]

        widgets = {
            "number": forms.TextInput(
                attrs={
                    "placeholder": "Enter Phone Number",
                    "class": "form-control",
                    "minlength": "10",
                    "maxlength": 11,
                }
            ),
            "longitude": forms.HiddenInput,
            "latitude": forms.HiddenInput,
            "home_address": forms.TextInput(
                attrs={
                    "placeholder": "E.g. 24 Bode Thomas Street, Surulere",
                    "class": "form-control",
                }
            ),
        }

    def save(self, commit=True):
        instance = super(TutorRequestForm1, self).save(commit=False)
        instance.request_subjects = [self.cleaned_data["subject"]]
        if commit:
            instance.save()
        return instance


class NewParentRequestForm(SecondRequestForm):
    possible_subjects = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=False,
        choices=(
            ("General Mathematics", "Mathematics"),
            ("English Language", "English Language"),
            ("Commerce", "Commerce"),
            ("French Language", "French"),
            ("Music Theory", "Music"),
            ("Physics", "Physics"),
            ("Chemistry", "Chemistry"),
            ("Principles of Accounting", "Accounting"),
            ("IELTS", "IELTS"),
            ("Government", "Government"),
            ("Biology", "Biology"),
            ("TOEFL", "TOEFL Exam"),
            ("SAT Math", "SAT Math"),
            ("Home Economics", "Home Economics"),
            ("Basic Sciences", "Basic Sciences"),
            ("Geography", "Geography"),
            ("Further Mathematics", "Further Math"),
            ("Elementary Mathematics", "Elementary Math"),
            ("Elementary English", "Elementary English"),
            ("GRE", "GRE"),
            ("GMAT", "GMAT"),
        ),
        label="Subjects",
    )

    def __init__(self, *args, **kwargs):
        super(NewParentRequestForm, self).__init__(*args, **kwargs)
        self.fields["request_subjects"].required = False
        self.fields["curriculum"].initial = ""

    class Meta(SecondRequestForm.Meta):
        fields = SecondRequestForm.Meta.fields + [
            "request_subjects",
            "curriculum",
            "school",
        ]
        labels = {
            "request_subjects": _("Others"),
            "curriculum": _("Curriculum used"),
            "gender": _("Do you prefer a male or female tutor?"),
        }

    def clean(self):
        cleaned_data = super(NewParentRequestForm, self).clean()
        possible_subjects = cleaned_data.get("possible_subjects", [])
        request_subjects = cleaned_data.get("request_subjects", [])
        total_length = len(possible_subjects) + len(request_subjects)
        if total_length == 0:
            self.add_error(
                "request_subjects", "Please enter a subject or select one above"
            )
        return cleaned_data

    def save(self, commit=True):
        instance = super(NewParentRequestForm, self).save(commit=False)
        instance.request_subjects.extend(self.cleaned_data["possible_subjects"])
        if commit:
            instance.determine_validity()
            instance.save()
        return instance


class TutorRequestForm2(NewParentRequestForm):
    def __init__(self, *args, **kwargs):
        choices2 = kwargs.pop("subjects", ())
        choices7 = kwargs.pop("prices", ())
        choices3 = kwargs.pop("classes", ())
        self.fixed_price = kwargs.pop("fixed_price", None)
        super(TutorRequestForm2, self).__init__(*args, **kwargs)
        self.fields["possible_subjects"].choices = choices2
        # self.fields['classes'].choices = choices3
        # self.fields['latitude'].required = False
        # self.fields['longitude'].required = False
        # self.fields['home_address'].required = True
        # self.fields['vicinity'].required = True
        self.fields["region"].required = False

    other_tutors = forms.BooleanField(initial=True, required=False)

    class Meta(SecondRequestForm.Meta):
        fields = SecondRequestForm.Meta.fields + [
            # 'home_address', 'state',
            "request_subjects",
            "curriculum",
            "school",
            "expectation",
            "first_name",
            "last_name",
            "where_you_heard"
            # 'latitude', 'longitude', 'vicinity'
        ]

    def clean(self):
        cleaned_data = super(BaseSecondForm, self).clean()
        possible_subjects = cleaned_data.get("possible_subjects", [])
        total_length = len(possible_subjects)
        if total_length == 0:
            self.add_error(
                "possible_subjects", "Please enter a subject or select one above"
            )
        available_days = cleaned_data.get("available_days")
        if available_days is None:
            raise forms.ValidationError("Please select a date")
        return cleaned_data


def geocode(address):
    address = urllib.quote_plus(address)
    maps_api_url = "?".join(
        [
            "http://maps.googleapis.com/maps/api/geocode/json",
            urllib.urlencode({"address": address, "sensor": False}),
        ]
    )
    response = urllib.urlopen(maps_api_url)
    data = json.loads(response.read().decode("utf8"))
    if data["status"] == "OK":
        lat = data["results"][0]["geometry"]["location"]["lat"]
        lng = data["results"][0]["geometry"]["location"]["lng"]
        return Decimal(lat), Decimal(lng)
    return None, None


class ReferralTutorRequestForm(forms.ModelForm):
    class Meta:
        model = BaseRequestTutor
        fields = (
            "hours_per_day",
            "no_of_students",
            "expectation",
            "home_address",
            "longitude",
            "latitude",
            "email",
            "first_name",
            "last_name",
            "number",
            "time_to_call",
            "state",
            "vicinity",
            "where_you_heard",
            "days_per_week",
            "available_days",
            "classes",
            "request_subjects",
            "curriculum",
            "school",
            "time_of_lesson",
            "gender",
        )


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


def create_form(json_val):
    class XForm(forms.Form):
        def __init__(self, *args, **kwargs):
            super(XForm, self).__init__(*args, **kwargs)
            for key, value in json_val["v"]:
                pass


class PriceMiniForm(forms.ModelForm):
    """Django form confirming the status of a request. Any request that
        proceeds beyond this point is valid."""

    referral_code = forms.CharField(widget=forms.HiddenInput, required=False)
    primary_phone_no1 = forms.CharField(
        label=_("Please re-type phome Number"),
        widget=forms.TextInput(
            attrs=dict(placeholder="Confirm Phone Number", maxlength=14, minlength=10)
        ),
    )

    class Meta:
        model = BaseRequestTutor
        fields = [
            "budget",
            "expectation",
            "gender",
            "where_you_heard",
            "number",
            "first_name",
            "last_name",
            "plan",
        ]
        widgets = {
            "available_days": forms.HiddenInput,
            "hours_per_day": forms.HiddenInput,
            "no_of_students": forms.HiddenInput,
            "first_name": forms.TextInput(attrs=dict(placeholder="First name")),
            "last_name": forms.TextInput(attrs=dict(placeholder="Last name")),
            "number": forms.TextInput(
                attrs={
                    "placeholder": "Phone number. e.g. (08034209932)",
                    "class": "form-control",
                    "minlength": "10",
                    "maxlength": 14,
                }
            ),
        }

    def __init__(self, *args, **kwargs):
        super(PriceMiniForm, self).__init__(*args, **kwargs)
        for field in ["budget", "first_name", "last_name", "number", "expectation"]:
            self.fields[field].required = True
            if self.instance:
                if self.instance.number:
                    self.initial["number"] = self.instance.number.as_national.replace(
                        " ", ""
                    )

    def clean_primary_phone_no1(self):
        no1 = self.cleaned_data.get("number")
        no2 = self.cleaned_data.get("primary_phone_no1")
        if not no2:
            msg = u"You must confirm your Primary phone number"
            raise forms.ValidationError(msg)
        if str(no1) != str(no2):
            msg = u"The phone numbers do not match"
            raise forms.ValidationError(msg)
        return no2

    def save(self, commit=True):
        instance = super(PriceMiniForm, self).save(commit=False)
        instance.status = instance.COMPLETED
        if commit:
            instance.save()
        return instance


class PriceAdjustForm(PriceMiniForm):
    class Meta(PriceMiniForm.Meta):
        fields = PriceMiniForm.Meta.fields + [
            "plan",
            "available_days",
            "hours_per_day",
            "no_of_students",
        ]
        widgets = {
            "budget": forms.HiddenInput,
            "plan": forms.HiddenInput,
            "available_days": forms.HiddenInput,
            "hours_per_day": forms.HiddenInput,
            "no_of_students": forms.HiddenInput,
            "first_name": forms.TextInput(attrs=dict(placeholder="First name")),
            "last_name": forms.TextInput(attrs=dict(placeholder="Last name")),
            "number": forms.TextInput(
                attrs={
                    "placeholder": "Phone number. e.g. (08034209932)",
                    "class": "form-control",
                    "minlength": "10",
                    "maxlength": 14,
                }
            ),
        }

    def __init__(self, *args, **kwargs):
        choices = (
            ("Monday", "Monday"),
            ("Tuesday", "Tuesday"),
            ("Wednesday", "Wednesday"),
            ("Thursday", "Thursday"),
            ("Friday", "Friday"),
            ("Saturday", "Saturday"),
            ("Sunday", "Sunday"),
        )
        super(PriceAdjustForm, self).__init__(*args, **kwargs)
        self.fields["available_days"].choices = choices
        for field in ["budget", "hours_per_day", "no_of_students", "available_days"]:
            self.fields[field].required = True
        self.fields["expectation"].required = True

    def clean(self):
        cleaned_data = super(PriceAdjustForm, self).clean()
        available_days = cleaned_data.get("available_days") or []
        no_of_days = len(available_days)
        if no_of_days == 0:
            self.add_error("available_days", "Please select at least a day")
        return cleaned_data

    # def save(self, commit=True):
    #     instance = super(PriceAdjustForm, self).save(commit=False)
    #     instance.status = instance.COMPLETED
    #     if commit:
    #         instance.save()
    #     return instance


def determine_offset_distance(tz):
    return tz.utcoffset().total_seconds() / 3600


class TimezoneSupport:
    def __init__(self, zone):
        self.instance = datetime.datetime.now(pytz.timezone(zone))
        self.host_instance = timezone.now()
        self.zone = zone

    def calculate_offset_difference(self):
        tz2 = determine_offset_distance(self.host_instance)
        return self.relative_to_gmt() - tz2

    @property
    def relative_to_gmt(self):
        return determine_offset_distance(self.instance)

    def to_time(self):
        if int(self.relative_to_gmt) != self.relative_to_gmt:
            x, y = math.modf(self.relative_to_gmt)
            to_30 = round(x, 2) * 60
            return "%s:%s" % (abs(int(y)), abs(int(to_30)))
        return abs(int(self.relative_to_gmt))

    def __str__(self):
        if self.relative_to_gmt > 0:
            return "GMT+%s" % self.to_time()
        return "GMT-%s" % self.to_time()

    @classmethod
    def to_string(cls, value):
        return "%s (%s)" % (str(cls(value)), value)

    @classmethod
    def gettimezone(cls, gmt):
        as_gmt = [cls(w) for w in pytz.all_timezones]
        the_gmt = [str(x) for x in as_gmt]
        value = the_gmt.index(gmt)
        return as_gmt[value]


class NigerianLanguagesForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        category = kwargs.pop("category", None)
        nigerian_category = category
        self.selected_cat = nigerian_category
        super(NigerianLanguagesForm, self).__init__(*args, **kwargs)
        # nigerian_category, _ = Category.objects.get_or_create(
        #     name='Nigerian Languages')
        self.fields["possible_subjects"].choices = [("", "Select Language")] + list(
            nigerian_category.skill_set.values_list("name", "name")
        )
        # import pdb
        # pdb.set_trace()
        self.fields["no_of_students"].choices = [
            (x, "{} student{}".format(x, "s" if x > 1 else "")) for x in [1, 2, 3, 4, 5]
        ]
        self.fields["country"].choices = [("", "Select Country")] + list(
            self.fields["country"].choices
        )
        self.fields["the_timezone"].choices = [("", "Select Timezone")] + list(
            set(
                [
                    (str(TimezoneSupport(x)), TimezoneSupport.to_string(x))
                    for x in pytz.all_timezones
                ]
            )
        )
        for x in [
            "no_of_students",
            "country",
            "the_timezone",
            "first_name",
            "email",
            "expectation",
            "country_state",
            "online_id",
        ]:
            self.fields[x].required = True
        if category:
            if category != "Nigerian Languages":
                self.fields["class_of_child"].required = False
                self.fields["possible_subjects"].required = False
            else:
                self.fields["possible_subjects"].required = True

    possible_subjects = forms.ChoiceField(choices=(), required=False)
    the_timezone = forms.ChoiceField(choices=())

    class Meta:
        model = BaseRequestTutor
        fields = [
            "expectation",
            "no_of_students",
            "the_timezone",
            "email",
            "first_name",
            "online_id",
            "country",
            "country_state",
            "class_of_child",
        ]

    def save(self, commit=True):
        instance = super(NigerianLanguagesForm, self).save(commit=False)
        instance.request_type = 3

        if self.selected_cat.name == "Nigerian Languages":
            instance.request_subjects = [self.cleaned_data["possible_subjects"]]
        else:
            instance.request_subjects = ["Basic Mathematics"]
            # instance.request_subjects = ["Yoruba Language"]
        instance.slug = utils.generate_code(BaseRequestTutor, key="slug")
        if commit:
            instance.save()
        return instance


class AgentForm(forms.ModelForm):
    class Meta:
        model = Agent
        fields = "__all__"
        widgets = {"user": autocomplete.ModelSelect2(url="users:user-autocomplete")}


NURSERY = "Phonics, Literacy & Numeracy etc. (Nursery)"
PRIMARY = "Math, English, Science, Quantitatives, Verbal (Primary)"
MATHEMATICS_JSS_SSS = "General Mathematics (JSS - SSS)"
ENGLISH_JSS_SSS = "English Language (JSS - SSS)"
BUSINESS_S = "Business Studies (JSS)"
BASIC_TECHNOLOGY = "Basic Technology (JSS)"
PHYSICS = "Physics (SSS)"
CHEMISTRY = "Chemistry (SSS)"
BIOLOGY = "Biology (SSS)"
ACCOUNTING = "Accounting (SSS)"
FURTHER_MATHEMATICS = "Further Mathematics (SSS)"
GOVERNMENT = "Government (SSS)"
COMMERCE = "Commerce (SSS)"


class PrimeRequestForm(forms.ModelForm):
    multiple_teachers = forms.BooleanField(required=False)
    subjects = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple,
        required=True,
        choices=(
            (NURSERY, NURSERY),
            (PRIMARY, PRIMARY),
            (MATHEMATICS_JSS_SSS, MATHEMATICS_JSS_SSS),
            (ENGLISH_JSS_SSS, ENGLISH_JSS_SSS),
            (BUSINESS_S, BUSINESS_S),
            (BASIC_TECHNOLOGY, BASIC_TECHNOLOGY),
            (PHYSICS, PHYSICS),
            (CHEMISTRY, CHEMISTRY),
            (BIOLOGY, BIOLOGY),
            (ACCOUNTING, ACCOUNTING),
            (FURTHER_MATHEMATICS, FURTHER_MATHEMATICS),
            (GOVERNMENT, GOVERNMENT),
            (COMMERCE, COMMERCE),
        ),
    )
    lesson_occurence = forms.IntegerField(
        widget=forms.Select(
            choices=(
                ("", "Select Lesson Frequency"),
                (1, "Once a week"),
                (2, "Twice a week "),
                (3, "Thrice a week "),
                (4, "Four times a week "),
                (5, "Five times a week"),
                (6, "Six times a week"),
                (7, "Seven times a week"),
            )
        )
    )
    time_of_lesson = forms.ChoiceField(
        choices=(
            ("", "Select Time of lesson"),
            ("10am", "Mornings (8am - 12pm)"),
            ("2pm", "Afternoons (12pm - 4pm)"),
            ("5pm", "Evenings (4pm - 8pm)"),
        )
    )
    no_of_students = forms.IntegerField(
        widget=forms.Select(
            choices=(
                ("", "Select Number of Student"),
                (1, "One Child"),
                (2, "Two Children"),
                (3, "Three Children"),
                (4, "Four Children"),
            )
        )
    )

    class Meta:
        model = BaseRequestTutor
        fields = [
            "no_of_students",
            "hours_per_day",
            "days_per_week",
            "time_of_lesson",
            "gender",
            "expectation",
            "first_name",
            "last_name",
            "email",
            "number",
            "home_address",
            "state",
            "where_you_heard",
        ]

    def __init__(self, *args, **kwargs):
        if len(args) > 0:
            data = args[0]
            data.update(number=get_phone_number(data.get("number", "")))
            args = (data,)
        super(PrimeRequestForm, self).__init__(*args, **kwargs)
        for field in [
            "no_of_students",
            "lesson_occurence",
            "hours_per_day",
            "days_per_week",
            "expectation",
            "first_name",
            "email",
            "number",
            "home_address",
            "state",
        ]:
            self.fields[field].required = True

        for field in ["gender", "time_of_lesson"]:
            self.fields[field].required = False

    def clean_subjects(self):
        subjects = self.cleaned_data["subjects"]
        if len(subjects) > 3:
            raise forms.ValidationError("You selected more than 3 subjects")
        return subjects

    def get_classes(self):
        classes = [
            s[s.find("(") + 1 : s.find(")")] for s in self.cleaned_data["subjects"]
        ]
        without_group = [s for s in classes if s != "JSS - SSS"]
        if len(classes) != len(without_group):
            without_group.extend(["JSS", "SSS"])
        return list(set(without_group))

    def get_subjects(self):
        def rr(s, word):
            return s.replace(word, "").replace("(", "").replace(")", "").strip()

        result = [
            rr(s, s[s.find("(") + 1 : s.find(")")])
            for s in self.cleaned_data["subjects"]
        ]
        options = {
            "Phonics, Literacy & Numeracy etc.": ["Phonics", "Literacy & Numeracy"],
            "Math, English, Science, Quantitatives, Verbal": [
                "Basic Mathematics",
                "English Language",
                "Basic Sciences",
                "Quantitative Reasoning",
                "Verbal Reasoning",
            ],
        }

        def evaluate(text):
            try:
                obj = options[text]
            except KeyError:
                obj = [text]
            return obj

        return [a for o in result for a in evaluate(o)]

    def save(self, commit=True):
        instance = super(PrimeRequestForm, self).save(commit=False)
        instance.slug = utils.generate_code(BaseRequestTutor, key="slug")
        instance.request_subjects = self.get_subjects()
        instance.available_days = self.autopopulate_days()
        instance.budget = self.calculate_price()
        instance.classes = self.get_classes()
        instance.request_type = 4
        instance.status = BaseRequestTutor.COMPLETED
        if commit:
            instance.save()
        return instance

    def autopopulate_days(self):
        occ = self.cleaned_data["lesson_occurence"]
        weekdays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        if occ > 0:
            return weekdays[:occ]
        return []

    def get_prices(self):
        return PriceDeterminator.create_prime_rates()

    def calculate_price(self):
        data = self.cleaned_data
        multiple_teachers = data["multiple_teachers"]
        multiplier = 2 if multiple_teachers else 1
        state = data["state"]
        hours = data["hours_per_day"]
        frequency = data["lesson_occurence"]
        student_no = data["no_of_students"]
        how_long = data["days_per_week"]
        months = 4 if how_long > 3 else how_long
        classes = self.get_classes()
        set_a, set_b = self.get_prices()
        if state in ["Lagos", "Abuja", "Rivers"]:
            per_hour = set_a.nursery_price
            if "JSS" in classes or "SSS" in classes:
                per_hour = set_a.jss_price
            if student_no >= 3:
                per_hour = set_a.nursery_student_price
                if "JSS" in classes or "SSS" in classes:
                    per_hour = set_a.jss_student_price
        else:
            per_hour = set_b.nursery_price
            if "JSS" in classes or "SSS" in classes:
                per_hour = set_b.jss_price
            if student_no >= 3:
                per_hour = set_b.nursery_student_price
                if "JSS" in classes or "SSS" in classes:
                    per_hour = set_b.jss_student_price
        if hours < 2:
            hours = 2
        kid_price = per_hour * months * hours * frequency
        if student_no < 3:
            return round(kid_price, -1) * multiplier
        return round(kid_price * student_no * multiplier, -1)


def get_phone_number(previous_number):
    if previous_number.startswith("+234"):
        previous_number = previous_number[4:]
    if previous_number.startswith("0"):
        previous_number = previous_number[1:]
    return "+234{}".format(previous_number)


class DeterminePriceEarnableForm(forms.Form):
    # region = forms.FloatField(required=False)
    number_of_weeks = forms.IntegerField(required=False)
    days_per_week = forms.IntegerField(required=False)
    number_of_tutors = forms.IntegerField(required=False)
    number_of_hour = forms.IntegerField(required=False)
    hourly_rate = forms.IntegerField(required=False)
    number_of_students = forms.IntegerField(required=False)
    number_of_days = forms.IntegerField(required=False)
    plan = forms.CharField(max_length=255)
    state = forms.CharField(max_length=255)
