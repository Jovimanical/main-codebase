from django import forms
from users.models import User
from wallet.forms import UserPayoutForm


class ReferralApprovalForm(forms.ModelForm):
    recieve_email = forms.BooleanField(required=False)
    is_referrer = forms.BooleanField(widget=forms.HiddenInput, initial=True)

    class Meta:
        model = User
        fields = ["is_referrer", "recieve_email"]


class WalletPayoutForm(UserPayoutForm):

    def clean_account_id(self):
        account_id = self.cleaned_data.get("account_id")
        return account_id
