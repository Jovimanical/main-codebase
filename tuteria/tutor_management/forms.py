from .models import Reference as Guarantor
from dal import autocomplete
from django import forms

class GuarantorForm(forms.ModelForm):
    class Meta:
        model = Guarantor
        fields = "__all__"
        widgets = {"tutor": autocomplete.ModelSelect2(url="users:user-autocomplete")}

