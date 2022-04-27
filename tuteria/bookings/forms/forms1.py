import logging
from dal import autocomplete

from django import forms
from django.conf import settings

from django.core.validators import MinValueValidator, MaxValueValidator

from ..models import BookingSession, Booking
from reviews.models import SkillReview
from ..services import TutorSkillService

logger = logging.getLogger(__name__)


class BookingSessionForm(forms.ModelForm):

    class Meta:
        model = BookingSession
        fields = ["start", "price", "student_no", "no_of_hours"]


BookingFormset = forms.inlineformset_factory(
    Booking, BookingSession, fields=("start", "price", "student_no", "no_of_hours")
)


class SessionSubmissionForm(forms.ModelForm):
    lesson_taught = forms.BooleanField(widget=forms.HiddenInput, required=False)

    class Meta:
        model = BookingSession
        fields = ["issue"]

    def save(self, commit=True):
        inst = super(SessionSubmissionForm, self).save(commit=False)
        inst.status = BookingSession.COMPLETED
        if commit:
            inst.save()
        return inst


RES_CHOICES = ["cancelled", "rescheduled"]


class ResolutionForm(forms.ModelForm):

    class Meta:
        model = BookingSession
        fields = ["cancellation_reason"]


class RequestToCancelForm(forms.ModelForm):

    class Meta:
        model = Booking
        fields = ["cancellation_message"]


class PagaResponseForm(forms.Form):
    status = forms.CharField()
    reference_number = forms.CharField(required=False)
    fee = forms.DecimalField(required=False)
    key = forms.CharField()
    reference = forms.CharField(required=False)
    exchange_rate = forms.CharField(required=False)
    currency = forms.CharField(required=False)
    customer_account = forms.CharField(required=False)
    process_code = forms.CharField(required=False)
    total = forms.DecimalField()
    invoice = forms.CharField()
    test = forms.BooleanField(required=False)
    message = forms.CharField(required=False)
    transaction_id = forms.CharField(required=False)

    def clean(self):
        cleaned_data = super(PagaResponseForm, self).clean()
        status = cleaned_data.get("status")
        key = cleaned_data.get("key")
        logger.info(status)
        if status != "SUCCESS":
            # Only do something if both fields are valid so far.
            raise forms.ValidationError("This Booking Failed.")
        if key != settings.PAGA_KEY:
            raise forms.ValidationError("Does not belong to Tuteria")
        return cleaned_data


class PagaPaymentForm(forms.Form):
    account_number = forms.CharField(widget=forms.HiddenInput)
    description = forms.CharField(widget=forms.HiddenInput)
    subtotal = forms.CharField(widget=forms.HiddenInput)
    phoneNumber = forms.CharField(widget=forms.HiddenInput)
    email = forms.CharField(widget=forms.HiddenInput)
    tax = forms.CharField(widget=forms.HiddenInput)
    surcharge = forms.CharField(widget=forms.HiddenInput)
    surcharge_description = forms.CharField(widget=forms.HiddenInput)
    quantity = forms.CharField(widget=forms.HiddenInput)
    product_code = forms.CharField(widget=forms.HiddenInput)
    invoice = forms.CharField(widget=forms.HiddenInput)
    return_url = forms.CharField(widget=forms.HiddenInput)
    test = forms.CharField(widget=forms.HiddenInput, initial=True)


class BookingReviewForm(forms.Form):
    rating = forms.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(5)], required=False
    )
    review = forms.CharField(
        widget=forms.Textarea(attrs=dict(rows=5, cols=30, placeholder="Review")),
        required=False,
    )

    def save(self, booking, booking_type=None, ip_address=None):
        inst = self.cleaned_data
        ts = TutorSkillService.get_ts(booking.ts)
        if inst.get("rating"):
            if booking_type == SkillReview.USER_TO_TUTOR:
                booking.user.post_review(
                    ts, inst["review"], inst["rating"], booking=booking
                )
                booking.reviewed = True
                booking.save()
            elif booking_type == SkillReview.TUTOR_TO_USER:
                booking.ts.post_review(
                    booking.user, inst["review"], inst["rating"], booking=booking
                )
            else:
                SkillReview.objects.create(
                    tutor_skill=ts,
                    commenter=booking.user,
                    review=inst["review"],
                    review_type=SkillReview.USER_TO_TUTOR,
                    score=inst["rating"],
                    booking=booking,
                )
        return inst.get("rating")


class BookingForm(forms.ModelForm):

    class Meta:
        model = Booking
        fields = "__all__"
        widgets = {
            "ts": autocomplete.ModelSelect2(url="users:skill-autocomplete"),
            "user": autocomplete.ModelSelect2(url="users:user-autocomplete"),
            "cancel_initiator": autocomplete.ModelSelect2(
                url="users:user-autocomplete"
            ),
            "tutor": autocomplete.ModelSelect2(url="users:user-autocomplete"),
        }


class BookingSessionForm(forms.ModelForm):

    class Meta:
        model = BookingSession
        fields = "__all__"
        widgets = {
            "booking": autocomplete.ModelSelect2(url="users:booking-autocomplete")
        }
