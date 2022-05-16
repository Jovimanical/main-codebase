import os
import pdb
from dal import autocomplete
from django import forms
from config.utils import get_static_data
from tutor_management.models import TutorSkill
from users.models import states, User, StateWithRegion
from .models import RequestPool
from .tasks import send_mail_to_admin_on_application_status


class CheckboxSelectMultiple(forms.CheckboxSelectMultiple):
    template_name = "external/forms/checkbox_select.html"


class AdminRequestPoolForm(forms.ModelForm):
    model = RequestPool
    fields = "__all__"
    widgets = {
        "req": autocomplete.ModelSelect2(url="baserequesttutor-autocomplete"),
        "tutor": autocomplete.ModelSelect2(url="users:user-autocomplete"),
    }


class RequestWithRelations(object):
    def __init__(
        self, request_subject_name, user=None, tuteria_subjects=None, clean=True
    ):
        from skills.models import Skill

        self.name = request_subject_name
        self.relations = []
        self.user = user
        if user:
            self.relations = user.tutorskill_set.exact_relation(
                request_subject_name, clean=clean
            ).values_list("skill__name", flat=True)

        self.skill_relations = Skill.objects.exact_relation(
            request_subject_name
        ).values_list("name", flat=True)
        self.tuteria_subjects = tuteria_subjects
        self.implied_name = None
        if tuteria_subjects:
            self.subject_to_create()
            self.implied_name = self.return_tuteria_name()
            if len(self.relations) == 0 and self.implied_name:
                self.relations = user.tutorskill_set.exact_relation(
                    self.implied_name, clean=clean
                ).values_list("skill__name", flat=True)
            if len(self.skill_relations) == 0 and self.implied_name:
                self.skill_relations = Skill.objects.exact_relation(
                    self.implied_name
                ).values_list("name", flat=True)
            self.subject_to_create()

    def subject_to_create(self):
        name_only = [x["name"] for x in self.tuteria_subjects]
        self.relations = [o for o in self.relations if o in ", ".join(name_only)]
        self.skill_relations = [
            o for o in self.skill_relations if o in ", ".join(name_only)
        ]
        if self.user:
            denied_tutor_subjects = (
                self.user.tutorskill_set.exclude_denied_and_pending()
            )
            self.skill_relations = [
                o for o in self.skill_relations if o not in denied_tutor_subjects
            ]

    def return_tuteria_name(self):
        result = None
        for i in self.tuteria_subjects:
            found = False
            for j in i["subjects"]:
                if self.name.lower() in j["name"].lower():
                    result = i["name"]
                    found = True
                if found:
                    break
            if found:
                break
        return result

    @property
    def suggested(self):
        # returns the subject name if it exists or the first related subjects
        if self.relations:
            if self.name in self.relations:
                return self.name
            if self.implied_name:
                if self.implied_name in self.relations:
                    return self.implied_name
            return self.relations[0]
        if self.skill_relations:
            if self.name in self.skill_relations:
                return self.name
            if self.implied_name:
                if self.implied_name in self.skill_relations:
                    return self.implied_name
            return self.skill_relations[0]

    @classmethod
    def build_tutor_subject_condition(
        cls, user, request_subjects, tuteria_subjects=None
    ):
        instances = [
            cls(x, user=user, tuteria_subjects=tuteria_subjects, clean=False)
            for x in request_subjects
        ]
        related_subjects = [x for y in instances for x in y.relations]
        skills = list(set([x for x in related_subjects if x]))
        cleaned = user.tutorskill_set.filter(skill__name__in=skills).values(
            "skill__name", "heading"
        )
        skills_with_heading = [
            {"heading": x["heading"], "name": x["skill__name"]} for x in cleaned
        ]
        return skills_with_heading

    @classmethod
    def found_tutor_subject_conditions(
        cls, user, request_subjects, tuteria_subjects=None
    ):
        if not tuteria_subjects:
            tuteria_subjects = cls.get_tuteria_subjects()
        instances = [
            cls(x, user=user, tuteria_subjects=tuteria_subjects, clean=False)
            for x in request_subjects
        ]
        related_subjects = [x for y in instances for x in y.relations]
        skills = list(set([x for x in related_subjects if x]))
        cleaned = user.tutorskill_set.filter(skill__name__in=skills).values(
            "skill__name", "status"
        )
        skills_with_heading = [
            {"status": x["status"], "name": x["skill__name"]} for x in cleaned
        ]
        related_subjects = []
        for i in instances:
            for j in i.relations:
                placed = False
                for k in skills_with_heading:
                    if k["name"] == j and k["status"] in [
                        TutorSkill.ACTIVE,
                        TutorSkill.PENDING,
                    ]:
                        placed = True
                        related_subjects.append(i)
                        break
                if placed:
                    break

        return [x.name for x in related_subjects]

    @classmethod
    def get_request_subjects(cls, user, request_subjects):
        tuteria_subjects = cls.get_tuteria_subjects()
        instances = [
            cls(x, user=user, tuteria_subjects=tuteria_subjects, clean=False)
            for x in request_subjects
        ]
        if len(instances) == 1:
            return [x.name for x in instances if x.suggested and x.suggested == x.name]
        return [x.name for x in instances if x.suggested]

    @classmethod
    def get_tuteria_subjects(cls):
        static_data = get_static_data()
        tuteria_subjects = [
            {"name": x["name"], "subjects": x["subjects"]}
            for x in static_data.get("tuteriaSubjects") or []
        ]
        return tuteria_subjects

    @classmethod
    def rewrite_tuteria_subjects(cls, subjects, tuteria_subjects):
        found = [
            x["subjects"][0]["name"] for x in tuteria_subjects if x["name"] in subjects
        ]
        if found:
            return found
            # return [x["name"] for y in found for x in y["subjects"]]
        return subjects


class RequestPoolForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        days_available = kwargs.pop("days_available", ())
        choices2 = kwargs.pop("teachable_subjects", ())
        self.youser = kwargs.pop("user", ())
        request_instance = kwargs.pop("request_instance", None)
        super(RequestPoolForm, self).__init__(*args, **kwargs)
        self.fields["subjects"].choices = choices2
        self.subject_selected = choices2

    subjects = forms.MultipleChoiceField(
        widget=CheckboxSelectMultiple, required=True, choices=(), label="Subjects"
    )
    # agree = forms.BooleanField(
    #     label="I confirm that I am okay with the distance and price"
    # )

    class Meta:
        model = RequestPool
        fields = [
            "subjects",
            "cost",
            # "remarks"
        ]

    def tutor_has_created_subject_with_content(self, tutor_subjects):
        return True

    def clean_subjects(self):
        subjects = self.cleaned_data.get("subjects")
        if len(subjects) == 0:
            raise forms.ValidationError("You must select at least one subject!")
        return subjects

    def clean(self):
        cleaned_data = super(RequestPoolForm, self).clean()
        subjects = cleaned_data.get("subjects") or []
        result_set = [
            RequestWithRelations(
                x,
                self.youser,
                tuteria_subjects=RequestWithRelations.get_tuteria_subjects(),
            )
            for x in subjects
        ]
        filtered_result = list(filter(lambda x: len(x.relations) > 0, result_set))
        length = len(subjects)
        if len(filtered_result) == 0:
            raise forms.ValidationError(
                (
                    "You haven't added any relevant subject for this job.\n"
                    "If you have, ensure you have taken the test and written \n"
                    "a description on the subject and the status of the subject is PENDING. before making an application."
                )
            )
            # if length <= 2:
        if length <= 10:
            if len(filtered_result) != length:
                raise forms.ValidationError(
                    "You must have created all the subjects you selected."
                )
        # if length > 3:
        #     if length == 3:
        #         if len(filtered_result) < 1:
        #             raise forms.ValidationError("You must have created at least one of the subjects you selected")
        #     if 3 < length < 6:
        #         if len(filtered_result) < 2:
        #             raise forms.ValidationError("You must have created at least two of the subjects you selected")
        #     if length >= 6:
        #         if len(filtered_result) < 3:
        #             raise forms.ValidationError("You must have created at least three of the subjects you selected")
        return cleaned_data

        # def save


all_states = [("", "Select state")] + [(s, s) for s in states]


class RequestJobFilterForm(forms.Form):
    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        state = self.initial.get("state")
        if state:
            queryset = StateWithRegion.objects.filter(
                state__istartswith=state
            ).values_list("region", flat=True)
            if queryset:
                vicinity_choices = [("", "Select vicinity")] + [
                    (s, s) for s in queryset
                ]
                self.fields["vicinity"] = forms.ChoiceField(
                    required=False,
                    choices=vicinity_choices,
                    initial=self.initial.get("vicinity", ""),
                )

    q = forms.CharField(required=False)
    longitude = forms.CharField(required=False, widget=forms.HiddenInput)
    latitude = forms.CharField(required=False, widget=forms.HiddenInput)
    state = forms.ChoiceField(required=False, choices=all_states, initial="")
    vicinity = forms.CharField(required=False)
    gender = forms.ChoiceField(
        required=False,
        choices=(
            ("", "Select Gender"),
            ("A", "Any Gender"),
            ("M", "Male"),
            ("F", "Female"),
        ),
    )


class RequestConfirmationForm(forms.Form):
    # From = forms.CharField(required=False)
    Body = forms.CharField(required=False, widget=forms.HiddenInput)

    def confirm_availability(self, pool):
        production = os.getenv("DJANGO_CONFIGURATION", "")
        TEST = False if production == "Production" else True
        if not TEST:
            send_mail_to_admin_on_application_status.delay(
                pool.tutor_id, pool.req_id, **self.cleaned_data
            )
        # pdb.set_trace()
        if (
            "yes" in self.cleaned_data["Body"].lower()
            or "accept" in self.cleaned_data["Body"].lower()
        ):
            pool.confirm()
        else:
            pool.reject()

    # def confirm_availability(self):
    #     if TEST:
    #         pool = RequestPool.objects.get(pk=2132)
    #     else:
    #         user = User.objects.filter(phonenumber__number=self.cleaned_data['From']).first()
    #         pool = RequestPool \
    #             .objects \
    #             .filter(tutor=user,request_status=1,approved=False) \
    #             .first()
    #     if pool:
    #         if not TEST:
    #             send_mail_to_admin_on_application_status.delay(user.id,pool.req_id, **self.cleaned_data)
    #         if 'yes' in self.cleaned_data['Body'].lower() or 'accept' in self.cleaned_data['Body'].lower():
    #             pool.confirm()
    #         else:
    #             pool.reject()


class RequestSmsConfirmationForm(forms.Form):
    text = forms.CharField()
    when = forms.DateTimeField()
    sender = forms.CharField()
    receiver = forms.CharField()

    def confirm_availability(self):
        production = os.getenv("DJANGO_CONFIGURATION", "")
        TEST = False if production == "Production" else True
        if TEST:
            slug = self.cleaned_data["text"].split("slug=")[1]
            if slug:
                pool = RequestPool.objects.filter(req__slug__iexact=slug).last()
            else:
                pool = RequestPool.objects.last()
        else:
            number = "+{}".format(self.cleaned_data["sender"])
            user = User.objects.filter(phonenumber__number=number).first()
            pool = RequestPool.objects.filter(
                tutor=user, request_status=1, approved=False
            ).first()
        if pool:
            # if not TEST:
            #     send_mail_to_admin_on_application_status.delay(user.id,pool.req_id, **self.cleaned_data)
            if (
                "yes" in self.cleaned_data["text"].lower()
                or "accept" in self.cleaned_data["text"].lower()
            ):
                pool.confirm()
            else:
                pool.reject()
