import logging

# from allauth.account.forms import LoginForm, SignupForm, ResetPasswordForm
from braces.views import LoginRequiredMixin
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth import login
from django.db.models import Avg
from django.http import HttpResponseRedirect, Http404, JsonResponse
from django.shortcuts import redirect
from django.utils.functional import cached_property
from django.core.exceptions import ObjectDoesNotExist


# Create your views here.
from django.views.generic import DetailView, TemplateView, RedirectView, View
from rest_framework.renderers import JSONRenderer
from ..models import Booking
from ..forms import (
    BookingReviewForm,
    SessionSubmissionForm,
    ResolutionForm,
    RequestToCancelForm,
)
from users.models import User
from users import services as user_service
from bookings import services

logger = logging.getLogger(__name__)


class BookingSessionUpdateView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        self.object = services.BookingSessionService(self.kwargs["pk"])
        inst = self.object.submit_session(request)
        if inst:
            messages.success(request, "%s marked as completed" % str(inst))
        else:
            messages.error(request, "Errors encountered when processing this booking")
        return redirect(self.object.get_booking_url())


class BookingPageMixin(object):
    model = Booking
    slug_field = "order"
    slug_url_kwarg = "order_id"

    def get_object(self):
        self.booking_service = services.SingleBookingService(
            self.kwargs.get("order_id")
        )
        return self.booking_service.instance

    def get_sessions_data(self):
        data = self.booking_service.get_sessions(serialized=True)
        renderer = JSONRenderer()
        return renderer.render(data)

    def current_not_cancelled_session_data(self):
        data = self.booking_service.get_sessions(
            serialized=True, status="can_be_cancelled"
        )
        renderer = JSONRenderer()
        return renderer.render(data)


class ResolutionUpdateView(LoginRequiredMixin, BookingPageMixin, DetailView):
    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        status, no, url = self.booking_service.cancel_sessions(request)
        if status:
            messages.success(request, "This booking has been cancelled")
        else:
            messages.success(request, "%s lessons marked as cancelled" % len(no))
        return redirect(url)


class TutorCancelRequestView(LoginRequiredMixin, BookingPageMixin, DetailView):
    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        order, url = self.booking_service.tutor_cancel_booking(request)
        if order:
            messages.info(
                request, "Request to cancel booking #%s has been sent to client" % order
            )
        return redirect(url)


class ClientConfirmRequestView(LoginRequiredMixin, BookingPageMixin, DetailView):
    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        url = self.booking_service.client_responds_to_cancellation()
        messages.info(request, "Booking is now cancelled")
        return redirect(url)


class BookingPageView(LoginRequiredMixin, BookingPageMixin, DetailView):
    template_name = "bookings/booking_page.html"

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        if request.user.is_staff:
            self.booking_service.admin_actions_on_booking(**request.POST.dict())
        return self.render_to_response(self.get_context_data(**kwargs))

    def get_context_data(self, **kwargs):
        context = super(BookingPageView, self).get_context_data(**kwargs)
        if self.request.user.is_authenticated:
            context.update(
                user_service=user_service.UserService(self.request.user.email)
            )
        context.update(self.booking_service.booking_view_context(self.request))
        return context

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if not request.user.is_staff:
            messages.warning(request, "You did not place this request")
            return redirect(reverse("home"))
        return super(BookingPageView, self).get(request, *args, **kwargs)


class InternalBookingMixin(LoginRequiredMixin, BookingPageMixin):
    def form_valid(self, form, _type="client"):
        self.booking_service.after_review_given(form, _type, self.request)
        return HttpResponseRedirect(self.get_success_url())

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form))

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        form = BookingReviewForm(request.POST)
        if form.is_valid():
            return self.form_valid(form)
        return self.form_invalid(form)


class BookingListMixin(LoginRequiredMixin):
    @cached_property
    def user_profile(self):
        a = user_service.UserService(self.request.user.email)
        return a.profile

    def is_tutor(self):
        return False

    def get_context_data(self, **kwargs):
        context = super(BookingListMixin, self).get_context_data(**kwargs)
        self.booking_service = services.BookingService(
            email=self.request.user.email, tutor=self.is_tutor()
        )
        filter_by = self.request.GET.get("filter_by", "new")
        page = self.request.GET.get("page", 1)
        context.update(
            self.booking_service.get_booking_view_skills(
                filter_by=filter_by, page=int(page)
            )
        )
        context["profile"] = self.user_profile
        return context


class BookingListView(BookingListMixin, TemplateView):
    template_name = "bookings/booking_list.html"


class ManageBookingListView(BookingListMixin, TemplateView):
    template_name = "bookings/manage_booking_list.html"

    def is_tutor(self):
        return True


class RequestBookingPage(RedirectView):
    permanent = False
    query_string = True
    #

    def get_redirect_url(self, *args, **kwargs):
        try:
            rq = services.SingleBookingService(kwargs["order_id"])
        except ObjectDoesNotExist:
            raise Http404("Booking does not exist")
        booking_url = reverse("users:user_booking_summary", args=[kwargs["order_id"]])
        tutor_booking_url = reverse(
            "users:tutor_booking_summary", args=[kwargs["order_id"]]
        )
        email = self.request.GET.get("email")
        if email:
            user_email = User.objects.filter(email=email).first()
            if user_email:
                user = self.login_user(user_email)
                if user is not None:
                    if rq.instance.tutor == user:
                        return tutor_booking_url
                    return booking_url

        if self.request.user.is_authenticated:
            return booking_url
        return "%s?next=%s" % (reverse("account_login"), booking_url)

    def login_user(self, user):
        user.backend = "django.contrib.auth.backends.ModelBackend"
        login(self.request, user)
        return user


class BookingDetailView(InternalBookingMixin, DetailView):
    template_name = "bookings/booking_summary.html"
    # template_name = 'emails/booking_marked_as_complete.html'
    booking_type = 1

    def get_success_url(self):
        return reverse("users:user_booking_summary", args=[self.object.order])

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        if self.booking_service.is_tutor_viewing_page(self.request.user):
            return redirect(self.booking_service.get_tutor_absolute_url())
        return super(InternalBookingMixin, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(BookingDetailView, self).get_context_data(**kwargs)
        form = BookingReviewForm()
        json_booking_sessions = self.get_sessions_data()
        res_form = ResolutionForm()
        context["object"] = self.object
        if context.get("form") is None:
            context.update(
                form=form,
                booking=self.object,
                sessions_js=json_booking_sessions,
                res_form=res_form,
            )
        return context

    def form_valid(self, form):
        messages.info(self.request, "Thanks for the review!")
        return super(BookingDetailView, self).form_valid(form=form)


# Todo: wrap page with decorator for only scheduled bookings
class ManageBookingDetailView(InternalBookingMixin, TemplateView):
    template_name = "bookings/booking_summary_tutor.html"
    booking_type = 2

    def get_success_url(self):
        return self.booking_service.get_tutor_absolute_url()

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        # pdb.set_trace()
        if not self.booking_service.is_tutor_viewing_page(self.request.user):
            messages.info(request, "You are not the tutor involved in this booking")
            return redirect(reverse("home"))
        milestone_url = self.booking_service.has_reviewed_how_tutoring_works()
        if milestone_url:
            return redirect(milestone_url)
        return super(ManageBookingDetailView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ManageBookingDetailView, self).get_context_data(**kwargs)
        form = BookingReviewForm()
        form.fields["review"].required = True
        form.fields["rating"].required = True
        session_form = SessionSubmissionForm()
        cancellation_form = RequestToCancelForm(instance=self.object)
        context.update(session_form=session_form, cancellation_form=cancellation_form)
        if context.get("form") is None:
            context.update(form=form)
        context["object"] = self.object
        return context

    def form_valid(self, form):
        messages.info(self.request, "Tutor Review received!")
        return super(ManageBookingDetailView, self).form_valid(form=form, _type="tutor")


def get_hourly_rate(request):
    """
    Post parameter consist of skill as well as the state
    returns a dictionary containing the following
    {
      "amount": "<avg amount for subject>"
    }
    """
    # get how many bookings in a week
    skill = "letters-numbers"
    bookings_in_a_week = 4
    location_bookings = [
        x.pk
        for x in Booking.objects.all()
        if x.tutor.location_set.all().first().state == "Ekiti"
    ]

    if not location_bookings:
        location_bookings = [
            x.pk
            for x in Booking.objects.all()
            if x.tutor.location_set.all().first().state == "Lagos"
        ]

    bookings = Booking.objects.filter(
        ts__skill__slug=skill, order__in=location_bookings
    )
    if not bookings:
        bookings = Booking.objects.filter(order__in=location_bookings)
    if not bookings:
        bookings = Booking.objects.filter(
            ts__skill__slug="letters-numbers", order__in=location_bookings
        )
    avg_booking_price = bookings.aggregate(total_price=Avg("bookingsession__price"))

    result = {"amount": avg_booking_price.get("total_price", 0) * bookings_in_a_week}
    # params = PerHourForm(request.POST)
    # result = {}
    # if params.is_valid():
    #     result = params.save()
    # return JsonResponse(result)
    return JsonResponse(result)
