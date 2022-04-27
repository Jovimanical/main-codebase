from django import forms


class PayrollForm(forms.ModelForm):
    document = forms.FileField(required=True)
