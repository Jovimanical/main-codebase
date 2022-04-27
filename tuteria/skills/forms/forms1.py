from dal import autocomplete
from django.utils.translation import ugettext as _
from cloudinary import forms as cloudinary_form
from django import forms
from django.forms import inlineformset_factory

# from multiupload.fields import MultiFileField, MultiFileInput
# from parsley.decorators import parsleyfy
from taggit.forms import TagField
from ..models import TutorSkill, Category, Skill, SkillCertificate, SubjectExhibition
from django.contrib.admin.helpers import ActionForm

form_attrs = {"class": "form-control", "required": "true"}


# @parsleyfy
class TutorSubjectForm(forms.Form):
    category = forms.ModelChoiceField(
        queryset=Category.objects.all(),
        required=False,
        empty_label="Select Category",
        widget=forms.Select(attrs={"class": "form-control"}),
    )
    skill = forms.ModelChoiceField(
        queryset=Skill.objects.none(),
        widget=forms.Select(attrs=form_attrs),
        empty_label="Select Skill",
    )

    def save(self, user):
        tutor_skill, _ = TutorSkill.objects.get_or_create(
            tutor=user, skill=self.cleaned_data["skill"]
        )
        tutor_skill.monthly_booking = user.profile.allow_monthly
        tutor_skill.save()
        return tutor_skill


# @parsleyfy
class TutorEditForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(TutorEditForm, self).__init__(*args, **kwargs)
        self.fields["monthly_booking"].required = False
        # self.fields['hours_per_day'].required = False
        # self.fields['days_per_week'].required = False
        self.fields["tags"].required = False

    image = cloudinary_form.CloudinaryUnsignedJsFileField(
        "subject_thumbnail", required=False
    )
    tags = TagField()
    # attachments = cloudinary_form.CloudinaryUnsignedJsFileField('subject_thumbnail',attrs={'multiple':2}, required=False)

    class Meta:
        model = TutorSkill
        fields = [
            "heading",
            "description",
            "tags",
            "price",
            "max_student",
            "discount",
            "monthly_booking",
        ]
        widgets = {"heading": forms.Textarea(attrs={"rows": 2})}
        labels = {"description": _("Describe Your Experience")}
        parsley_extras = {
            "heading": {"maxlength": "70"},
            "description": {"minlength": "300", "maxlength": "1150"},
            "teaching_method": {"minlength": "300", "maxlength": "1200"},
        }

    def save(self, commit=True, attachments=None):
        super(TutorEditForm, self).save(commit=commit)
        if self.cleaned_data["image"]:
            self.instance.image = self.cleaned_data["image"]
            self.instance.save()
        if len(attachments) > 0:
            ex = SubjectExhibition.objects.filter(ts=self.instance).all()
            if len(ex) >= len(attachments):
                for e in range(len(attachments)):
                    SubjectExhibition.objects.filter(pk=ex[e].pk).update(
                        image=attachments[e]
                    )
                    # ex[e].image = attachments[e]
                    # ex[e].save()
            else:
                total = SubjectExhibition.objects.filter(ts=self.instance)
                if total.count() == 1:
                    total.first().delete()
                else:
                    total.delete()
                for each in attachments:
                    s = SubjectExhibition.objects.create(ts=self.instance, image=each)
                    SubjectExhibition.objects.filter(pk=s.pk).update(image=each)
                    # att.save()

        return self.instance


# @parsleyfy
class SubjectDescriptionForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(SubjectDescriptionForm, self).__init__(*args, **kwargs)
        self.fields["heading"].required = True
        self.fields["description"].required = True

    tags = TagField(required=False)
    image = cloudinary_form.CloudinaryFileField(
        options={"upload_preset": "subject_thumbnail"}, required=False
    )

    class Meta:
        model = TutorSkill
        fields = ["heading", "description", "tags", "image"]
        widgets = {"heading": forms.Textarea(attrs={"rows": 2})}

        parsley_extras = {
            "heading": {"maxlength": "70"},
            "description": {"minlength": "300", "maxlength": "800"},
            # 'teaching_method': {
            #     'minlength': "300",
            #     'maxlength': "1200"
            # },
        }
        help_texts = {
            "heading": _(
                'Write a great headline for your subject in 70 characters or less. Example: "I teach in-depth Music Theory to help students compose quality music." Please only use alphabets and numbers, avoid using unnecessary punctuations.'
            ),
            "description": _(
                "Talk about your experience and teaching style. Be as detailed as possible so clients can learn more about you before booking lessons. Should be at least 300 characters. Please write professionally, with correct spellings and grammar. Your subject will be reviewed for high quality before being approved."
            ),
            "tags": _("Some useful help text."),
            "image": _("Some useful help text."),
        }

        # def save(self, commit=True,skill):


class SkillCertificateForm2(forms.ModelForm):

    class Meta:
        model = SkillCertificate
        fields = ["award_name", "award_institution"]

    def save(self, commit=True):
        instance = super(SkillCertificateForm2, self).save(commit=False)
        if instance and instance.award_name and instance.award_institution:
            instance.award_name = instance.award_name
            instance.award_institution = instance.award_institution
            instance.save()


class SkillCertificateForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(SkillCertificateForm, self).__init__(*args, **kwargs)
        # self.fields['award_proof'].required = False
        # self.empty_permitted = False

    # award_proof = cloudinary_form.CloudinaryFileField(options={"upload_preset": 'subject_certificate'}, required=False)

    class Meta:
        model = SkillCertificate
        fields = ["award_name", "award_institution"]

    def save(self, commit=True):
        instance = super(SkillCertificateForm, self).save(commit=False)
        instance.award_name = instance.award_name
        instance.award_institution = instance.award_institution
        instance.save()


CertificateFormset2 = inlineformset_factory(
    TutorSkill,
    SkillCertificate,
    form=SkillCertificateForm2,
    max_num=2,
    extra=1,
    validate_max=True,
    fk_name="ts",
)

CertificateFormset = inlineformset_factory(
    TutorSkill,
    SkillCertificate,
    form=SkillCertificateForm,
    max_num=2,
    extra=1,
    validate_max=True,
    fk_name="ts",
)


class ExhibitionForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(ExhibitionForm, self).__init__(*args, **kwargs)
        self.empty_permitted = False

    image = cloudinary_form.CloudinaryFileField(
        options={"upload_preset": "exhibitions"}, required=False
    )

    class Meta:
        model = SubjectExhibition
        fields = ["image"]


ExhibitionFormset = inlineformset_factory(
    TutorSkill,
    SubjectExhibition,
    form=ExhibitionForm,
    max_num=2,
    extra=1,
    validate_max=True,
    fk_name="ts",
)


# @parsleyfy
class SubjectPriceForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(SubjectPriceForm, self).__init__(*args, **kwargs)
        self.fields["monthly_booking"].required = False
        # self.fields['hours_per_day'].required = False
        # self.fields['days_per_week'].required = False
        self.fields["price"].required = True
        self.fields["max_student"].required = True
        self.fields["discount"].required = True

    class Meta:
        model = TutorSkill
        fields = ["price", "max_student", "discount", "monthly_booking"]
        # 'hours_per_day', 'days_per_week']

        help_texts = {
            "price": _(
                "Set your price per hour for one student. Hint: consider reducing your price to attract clients to you initially. You can always increase it later."
            ),
            "max_student": _(
                "What is the maximum number of students you can teach at once?"
            ),
            "discount": _(
                "Will you offer a discount for group lessons involving more than one student? If offered, discounts only apply from the second student"
            ),
            "monthly_booking": _(
                "If you don't want to accept monthly tutoring, please uncheck this box"
            ),
        }


# @parsleyfy
class SubjectMediaForm(forms.ModelForm):
    image = cloudinary_form.CloudinaryUnsignedJsFileField(
        "subject_thumbnail", required=False
    )

    class Meta:
        model = TutorSkill
        fields = ["image"]

    def save(self, commit=True, attachments=None):
        super(SubjectMediaForm, self).save(commit=commit)
        if len(attachments) > 0:
            SubjectExhibition.objects.filter(ts=self.instance).delete()
            for each in attachments:
                att = SubjectExhibition(ts=self.instance, image=each)
                att.save()

        return self.instance


class TutorSkillForm(forms.ModelForm):
    model = TutorSkill
    fields = "__all__"
    widgets = {"tutor": autocomplete.ModelSelect2(url="users:user-autocomplete")}
    autocomplete_fields = ("user",)


class SubjectExhibitionForm(forms.ModelForm):

    class Meta:
        model = SubjectExhibition
        fields = "__all__"
        widgets = {"ts": autocomplete.ModelSelect2(url="users:skill-autocomplete")}


class FForm(ActionForm):
    msg = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=3, placeholder="Remark")), required=False
    )
    amount = forms.DecimalField(required=False)
