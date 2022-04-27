import json
import logging
import os

from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from django.conf import settings
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.generic import DetailView, RedirectView, ListView
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.decorators import method_decorator

from braces.views import LoginRequiredMixin, JSONResponseMixin

from ..forms import RequestMeetingForm, AfterMeetingForm
from ..models import TutorMeeting
from bookings.forms import PagaPaymentForm, PagaResponseForm
from users.views import UserMixin
from skills.models import TutorSkill
from users.models import UserProfile
from django_quiz.api import QuestionSerializer
from django_quiz.quiz.models import Quiz

logger = logging.getLogger(__name__)


class UserPendingReviewList(UserMixin, DetailView):
    template_name = "users/reviews/home.html"

    def get_context_data(self, **kwargs):
        context = super(UserPendingReviewList, self).get_context_data(**kwargs)
        bookings_without_reviews = self.object.orders.pending_review()
        context.update(bookings=bookings_without_reviews)
        return context


# Meeting View
class TutorClientMeetingListView(LoginRequiredMixin, ListView):
    template_name = "reviews/users/list_of_meetings.html"
    model = TutorMeeting

    def get_queryset(self, **kwargs):
        # return self.request.user.meetings.filter(state=TutorMeeting.PAYED,led_to_booking=False)
        return self.request.user.meetings.filter(
            led_to_booking=False, met_with_client=False
        )


class CloseMeetingView(LoginRequiredMixin, JSONResponseMixin, DetailView):
    model = TutorMeeting
    Func = lambda user: user.profile.terms_and_conditions
    slug_field = "order"
    slug_url_kwarg = "order_id"
    template_name = "reviews/users/meeting_detail.html"

    @method_decorator(user_passes_test(Func, login_url="/request-to-meet/agreement/"))
    def dispatch(self, request, *args, **kwargs):
        return super(CloseMeetingView, self).dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.object.tutor != request.user:
            messages.warning(request, "You are not authorized to view this request.")
            return redirect(reverse("client_meetings"))
        return super(CloseMeetingView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        can_view = request.POST.get("can_view", False)
        if can_view in ["true", "True"]:
            self.object.viewed_by_tutor = True
            self.object.save()
            return redirect(self.object.get_absolute_url())
        else:
            form = AfterMeetingForm(request.POST, instance=self.object)
            if form.is_valid():
                inst = form.save(commit=False)
                rating_text = ". Rating is %s" % request.POST.get("rating", 0)
                inst.meeting_outcome += rating_text
                inst.met_with_client = True
                inst.save()
                messages.info(
                    request, "Thanks for successfully informing us about the meeting."
                )
                return redirect(self.object.get_absolute_url())
        return self.render_to_response(
            self.get_context_data(object=self.object, form=form, a_form=form)
        )

    def form_valid(self, form):
        form.save()
        return self.render_to_json_response({"saved": True}, status=200)

    def get_context_data(self, **kwargs):
        context = super(CloseMeetingView, self).get_context_data(**kwargs)
        context["form"] = AfterMeetingForm(instance=self.object)
        return context

        # def render_to_response(self, context, **response_kwargs):
        # return self.render_to_json_response(context, **response_kwargs)


class PrepareRequestToMeetView(LoginRequiredMixin, RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        tutor_skill = TutorSkill.objects.get(pk=kwargs.get("pk"))
        client = self.request.user
        if client.request_meetings.has_hired_tutor_before(tutor_skill.tutor):
            messages.warning(
                self.request, "You have already requested to meet this tutor before."
            )
            return tutor_skill.get_absolute_url()
        if not client.request_meetings.permitted_to_request_tutor_skill(tutor_skill):
            messages.warning(
                self.request,
                "You have exceeded the maximum number of request to meet tutors.",
            )
            return tutor_skill.get_absolute_url()
        if client.request_meetings.has_been_offered_by_admin():
            messages.warning(
                self.request, "You are not allowed to request a tutor anymore"
            )
            return tutor_skill.get_absolute_url()
        if client == tutor_skill.tutor:
            messages.warning(self.request, "You can not issue a request to your self")
            return tutor_skill.get_absolute_url()
        rtm = client.request_meetings.get_request_instance(tutor_skill, client)
        return reverse("request_meeting", args=[rtm.order])


class RequestMeetingMixin(LoginRequiredMixin):
    model = TutorMeeting
    slug_field = "order"
    slug_url_kwarg = "order_id"


class RequestMeetingView(RequestMeetingMixin, DetailView):
    template_name = "reviews/request_to_meet.html"

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.object.made_payment:
            messages.info(request, "You have already made payment for this request.")
            return redirect(reverse("users:profile", args=[self.object.tutor.slug]))
        return self.render_to_response(self.get_context_data(object=self.object))

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        form = RequestMeetingForm(request.POST, instance=self.object)
        logger.info(request.POST)
        if form.is_valid():
            form.save()
            return redirect(
                reverse("request_meeting", kwargs={"order_id": self.object.order})
            )
        messages.error(request, "Please ensure you fill out the details on the form")
        return self.render_to_response(self.get_context_data(form=form, **kwargs))

    def get_context_data(self, **kwargs):
        context = super(RequestMeetingView, self).get_context_data(**kwargs)
        hiring_for_the_same_subject = self.request.user.request_meetings.is_valid_instance_for_not_collecting_payment_again(
            self.object.ts
        )
        if not "form" in context:
            context["form"] = RequestMeetingForm()
        context["paga_form"] = self.get_payment_form()
        context.update(hiring_for_the_same_subject=hiring_for_the_same_subject)
        return context

    def get_payment_form(self):
        production = os.getenv("DJANGO_CONFIGURATION", "")
        TEST = False if production == "Production" else True
        initial = {
            "email": self.request.user.email,
            "account_number": self.request.user.id,
            "subtotal": self.object.gateway_price,
            "phoneNumber": "",
            "description": "Requesting to meet %s for %s"
            % (self.object.ts.tutor.first_name, self.object.ts.skill.name),
            "surcharge": self.object.service_fee,
            "surcharge_description": "Bank Charge",
            "product_code": "",
            "quantity": "",
            "invoice": self.object.order,
            "test": TEST,
            "return_url": self.request.build_absolute_uri(
                reverse("paid_to_request_to_meet", args=[self.object.order])
            ),
        }
        return PagaPaymentForm(initial=initial)


@login_required
def process_payment_from_previous_request(request, order_id):
    """Successful on if the same skill has been requested twice"""
    request_order = get_object_or_404(TutorMeeting, order=order_id)
    ts = request_order.ts
    req = request.POST.get("p_method")
    if (
        request.user.request_meetings.is_valid_instance_for_not_collecting_payment_again(
            request_order.ts
        )
        and req == order_id
    ):
        return redirect(reverse("paid_to_request_to_meet", args=[request_order.order]))
    messages.info(request, "Sorry you need to make a new payment")
    return redirect(ts.get_absolute_url())


class RequestMeetingRedirectView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        requested_meeting = get_object_or_404(TutorMeeting, order=kwargs["order_id"])
        status = self.request.POST.get("status")
        status_message = self.get_status_message(status)
        if requested_meeting.wallet_amount > 0:
            form = PagaResponseForm(
                dict(
                    invoice=requested_meeting.order,
                    status="SUCCESS",
                    key=settings.PAGA_KEY,
                    total=0,
                )
            )
        else:
            form = PagaResponseForm(self.request.POST)
        if form.is_valid():
            requested_meeting.post_payment(
                transaction_id=form.cleaned_data["transaction_id"],
                amount_paid=form.cleaned_data["total"],
            )
            return reverse("request_meeting_completed", args=[requested_meeting.order])
        messages.error(
            self.request, "Transaction Payment Failed. {}".format(status_message[1])
        )
        return reverse("request_meeting", args=[requested_meeting.order])

    def get_status_message(self, status):
        if status == "SUCCESS":
            return (
                "Transaction Successful",
                "Reason: Your payment completed successfully",
            )
        if status == "ERROR_TIMEOUT":
            return "Transaction Failed", "Reason: The transaction timed out."
        if status == "ERROR_INSUFFICIENT_BALANCE":
            return (
                "Transaction Failed",
                "Reason: Insufficient Funds.  Please Fund account and Try again",
            )
        if status == "ERROR_INVALID _CUSTOMER_ACCOUNT":
            return (
                "Transaction Failed",
                (
                    "Reason: Transaction could not be authorised. Please contact Paga customer"
                    "service or send a mail to service@mypaga.com"
                ),
            )
        if status == "ERROR_CANCELLED":
            return "Transaction Failed", "Reason: No transaction record"
        if status == "ERROR_BELOW_MINIMUM":
            return (
                "Transaction Failed",
                "Reason: Your transaction amount is below the required minimum transaction amount of N100",
            )
        if status == "ERROR_ABOVE_MAXIMUM":
            return (
                "Transaction Failed",
                "Reason: Your transaction amount is above the maximum transaction amount of N300000",
            )
        if status == "ERROR_AUTHENTICATION":
            return (
                "Transaction Failed",
                "Reason: Authentication Error. Please try again with valid credentials",
            )
        # ERROR_UNKNOWN
        return "Transaction Failed", "Reason: Error processing transaction. "


class RequestMeetingSummary(RequestMeetingMixin, DetailView):
    template_name = "reviews/request_to_meet_completed.html"


class RequestMeetingSuccessful(DetailView):
    pass


# Background Check views


@login_required
def request_background_check(request, username):
    form = PhoneNumberForm(request.POST)

    return render(request, "users/background_check/request.html", {})


@login_required
def give_consent(request):
    request.user.background_check_consent = True
    request.user.save()
    return redirect(reverse("users:edit_verification"))


@login_required
def process_background_check(request):
    return redirect(reverse("users:edit_verification"))


class BackgroundPaymentCompleteRedirectView(RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        booking = get_object_or_404(BackgroundCheck, order=kwargs["order_id"])
        if int(booking.bank_price) == 0:
            form = PagaResponseForm(
                dict(
                    invoice=booking.order,
                    status="SUCCESS",
                    key=settings.PAGA_KEY,
                    total=0,
                )
            )
        else:
            form = PagaResponseForm(self.request.POST)
        if form.is_valid():
            booking.process_payment()
            messages.success(self.request, "Background Check Payment successful")
            return booking.get_absolute_url()
        messages.error(self.request, "Booking Payment Failed")
        return reverse("users:confirm_request_and_pay")


@login_required
def confirm_request(request, order_id):
    if order_id == "new":
        form = BackgroundCheckForm(request.POST)
        if form.is_valid() is False:
            messages.error(
                request, "Please select at least one background check option"
            )
            return redirect("users:edit_verification")
        t_d = TuteriaDetail()
        inst1 = form.save(request.user, t_d)
    else:
        inst1 = get_object_or_404(BackgroundCheck, order=order_id)
    initial = {
        "email": inst1.tutor.email,
        "account_number": inst1.tutor.id,
        "subtotal": inst1.gateway_price,
        "phoneNumber": inst1.tutor.phone_number_details,
        "description": "Background Check on %s payment " % (inst1.tutor.first_name),
        "invoice": inst1.order,
        "return_url": request.build_absolute_uri(
            reverse("background_redirect", args=[inst1.order])
        ),
    }
    payment_form = PagaPaymentForm(initial=initial)
    can_use_wallet = request.user.wallet.amount_available >= inst1.amount_paid
    inst1.update_amount_to_be_paid()
    # create instance
    return render(
        request,
        "users/background_check/confirm-request.html",
        {"paga_form": payment_form, "object": inst1, "can_use_wallet": can_use_wallet},
    )


@user_passes_test(
    lambda user: user.profile.application_status == UserProfile.VERIFIED,
    login_url="/dashboard/",
)
def how_request_to_meet_works(request):
    q = get_object_or_404(Quiz, url="request-to-meet-client-quiz")
    questions = QuestionSerializer(q.get_questions(), many=True).data
    return render(
        request,
        "reviews/landing.html",
        dict(questions=json.dumps(questions, cls=DjangoJSONEncoder)),
    )


@login_required
def verify_quiz(request):
    next_url = request.GET.get("next", None)
    UserProfile.objects.filter(user=request.user).update(terms_and_conditions=True)
    if next_url:
        return redirect(next_url)
    messages.info(
        request,
        "You can successfully view info about clients requesting to meet with you.",
    )
    return reverse("users:dashboard")
