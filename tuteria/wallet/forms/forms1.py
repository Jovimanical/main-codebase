from dal import autocomplete
from django import forms

from ..models import UserPayout, Wallet, RequestToWithdraw, WalletTransaction


class UserPayoutForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        choices = UserPayout.PAYOUT_TYPES
        if "filters" in kwargs:
            # payout_options = kwargs.get("filters")
            # # has_paga = payout_options.filter(payout_type=UserPayout.PAGA).exists()
            # has_bank = payout_options.filter(payout_type=UserPayout.BANK_TRANSFER).exists()
            # if not has_bank:
            #     choices = (
            #         (UserPayout.BANK_TRANSFER, 'Bank Transfer'),
            #     )
            # # if has_bank:
            # #     choices = (
            # #         (UserPayout.PAGA, 'Paga'),
            # #     )
            kwargs.pop("filters")
        super(UserPayoutForm, self).__init__(*args, **kwargs)
        self.fields["bank"].required = False
        self.fields["account_name"].required = False
        self.fields["payout_type"].choices = choices
        # if self.instance:
        #     self.fields['bank'].initial = self.instance.bank
        #     self.fields['account_name'].initial = self.instance.account_name
        #     self.fields['account_id'].initial = self.instance.account_id

    class Meta:
        model = UserPayout
        fields = ["payout_type", "bank", "account_name", "account_id"]

    def clean_account_id(self):
        payout_type = self.cleaned_data.get("payout_type")
        account_id = self.cleaned_data.get("account_id")
        account_name = self.cleaned_data.get("account_name")
        bank = self.cleaned_data.get("bank")
        if not payout_type:
            msg = u"Please select a payout type."
            raise forms.ValidationError(msg)
        if payout_type == UserPayout.BANK_TRANSFER:
            if len(account_id) != 10:
                msg = u"Ensure you input your NUBAN account number (10 digits)"
                raise forms.ValidationError(msg)
            try:
                valid_digits = int(account_id)
            except ValueError:
                msg = u"Invalid account number"
                raise forms.ValidationError(msg)
            if not account_name:
                msg = u"Please input your account name for the account number you added"
                raise forms.ValidationError(msg)
            if not bank:
                msg = u"Please select your bank"
                raise forms.ValidationError(msg)
        # if payout_type == UserPayout.PAGA:
        #     if len(account_id) != 5:
        #         msg = u"Your PAGA ID is invalid. Please input a valid PAGA ID"
        #         raise forms.ValidationError(msg)
        return account_id


class WalletForm(forms.ModelForm):

    class Meta:
        model = Wallet
        fields = "__all__"
        widgets = {"owner": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class WalletTransactionForm(forms.ModelForm):

    class Meta:
        model = WalletTransaction
        fields = "__all__"
        widgets = {
            "wallet": autocomplete.ModelSelect2(url="users:wallet-autocomplete"),
            "booking": autocomplete.ModelSelect2(url="users:booking-autocomplete"),
            "request_made": autocomplete.ModelSelect2(url="baserequesttutor-autocomplete")
        }


class PayoutForm(forms.ModelForm):

    class Meta:
        model = UserPayout
        fields = "__all__"
        widgets = {"user": autocomplete.ModelSelect2(url="users:user-autocomplete")}


class RequestToWithdrawForm(forms.ModelForm):

    class Meta:
        model = RequestToWithdraw
        fields = "__all__"
        widgets = {
            "user": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "payout": autocomplete.ModelSelect2(url="users:userpayout-autocomplete"),
        }
