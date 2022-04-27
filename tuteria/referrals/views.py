# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function

import json
import os

from braces.views import LoginRequiredMixin
from builtins import (
    super,
    # zip, round, input, int, pow, object)bytes, str, open, , range,
)
from django.contrib import messages
from django.contrib.auth.decorators import user_passes_test
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.urls import reverse

from django.http import (
    HttpResponseBadRequest,
    JsonResponse,
    HttpResponse,
    StreamingHttpResponse,
)
from django.shortcuts import redirect
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.generic import RedirectView, TemplateView, View
from kombu import Connection, Exchange, Queue
from users.forms import UserHomeAddressForm
from wallet.forms import UserPayoutForm

from .forms import ReferralApprovalForm, WalletPayoutForm
from .models import Referral, EmailInvite
from .tasks import (
    send_email_to_referree,
    send_emails_to_join_tuteria,
    email_to_request_flyer,
    send_welcome_email_to_all_referrals,
)


# Create your views here.
class ReferralHomeView(TemplateView):
    template_name = "referrals/home.html"


# class ReferralDefaultView(TemplateView):
# 	template_name =


def has_bank_and_home_address(user):
    return user.has_bank() and user.home_address is not None and user.is_referrer


class ReferralLoggedInView(LoginRequiredMixin, TemplateView):
    template_name = "referrals/home.html"

    @method_decorator(
        user_passes_test(has_bank_and_home_address, login_url="/invite/confirm/")
    )
    def dispatch(self, request, *args, **kwargs):
        return super(ReferralLoggedInView, self).dispatch(request, *args, **kwargs)

    def get_paginator2(self, ts, number=5):
        ts2 = ts or []
        paginator = Paginator(ts2, number)
        page = self.request.GET.get("page")
        try:
            result = paginator.page(page)
        except PageNotAnInteger:
            result = paginator.page(1)
        except EmptyPage:
            result = paginator.page(paginator.num_pages)
        return paginator, result

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        referral = Referral.get_instance(user)
        my_referrals = user.referrals.all()
        page_obj, result = self.get_paginator2(my_referrals, 5)
        invitess = list(user.invitations.values_list("email", flat=True))
        twitter_msg = "Get the best tutors at #Tuteria to help with any subject, skill or exam! @tuteriacorp https://www.tuteria.com/i/{}".format(
            user.slug
        )
        context.update(
            my_referrals=result,
            invitees=json.dumps(invitess),
            referral_instance=referral,
            twitter_msg=twitter_msg,
            page_obj=page_obj,
        )
        return context


class ReferralView(View):

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            if request.user.is_referrer:
                view = ReferralLoggedInView.as_view()
            else:
                view = ReferralHomeView.as_view()
        else:
            view = ReferralHomeView.as_view()
        return view(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            user = request.user
            if request.is_ajax():
                response = json.loads(request.body)
                emails = response.get("emails")
                for email in emails:
                    EmailInvite.create_new(email=email, user=user)
                send_emails_to_join_tuteria.delay(user.pk)
                messages.info(request, "Emails sent successfully")
                return redirect(reverse("request_meeting_redirect"))
        return HttpResponseBadRequest()


class UploadDetails(LoginRequiredMixin, TemplateView):
    template_name = "referrals/confirm.html"

    def get(self, request, *args, **kwargs):
        if has_bank_and_home_address(request.user):
            return redirect(reverse("request_meeting_redirect"))
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        user = self.request.user
        dictionary, bank_dict = self.get_form_kwargs(user)
        address_form = UserHomeAddressForm(request.POST, **dictionary)
        payout_form = WalletPayoutForm(request.POST, **bank_dict)
        referral_form = ReferralApprovalForm(request.POST, instance=user)
        if (
            address_form.is_valid()
            and payout_form.is_valid()
            and referral_form.is_valid()
        ):
            instance = address_form.save(commit=False)
            instance.user = user
            instance.save()
            x = payout_form.save(commit=False)
            x.user = user
            x.save()
            referral_form.save()
            send_welcome_email_to_all_referrals.delay(user.pk)
            # messages.info(request,"You have obtained the REFERRAL status on tuteria")
            return redirect(reverse("request_meeting_redirect"))
        return self.render_to_response(
            self.get_context_data(
                address_form=address_form,
                referral_form=referral_form,
                payout_form=payout_form,
            )
        )

    def get_form_kwargs(self, user):
        home_address = user.home_address
        payout = user.bank_payout
        bank_dict = dict(initial=dict(payout_type="Bank Transfer"))
        dictionary = {}
        if home_address:
            dictionary = dict(instance=home_address, user_state=home_address.state)
        if payout:
            bank_dict.update(instance=payout)
        return dictionary, bank_dict

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        dictionary, bank_dict = self.get_form_kwargs(user)
        if "address_form" not in kwargs:
            address_form = UserHomeAddressForm(**dictionary)
            context.update(address_form=address_form)
        if "payout_form" not in kwargs:
            payout_form = WalletPayoutForm(**bank_dict)
            context.update(payout_form=payout_form)
        if "referral_form" not in kwargs:
            referral_form = ReferralApprovalForm(
                instance=user, initial={"is_referrer": True}
            )
            context.update(referral_form=referral_form)
        context.update(no_of_referrals=Referral.objects.count())
        return context


class RemindUser(LoginRequiredMixin, RedirectView):
    permanent = False
    query_string = True

    def get_redirect_url(self, *args, **kwargs):
        referree = Referral.objects.filter(
            owner__email=self.request.GET.get("email")
        ).first()
        send_email_to_referree.delay(referree.pk)
        referree.date_sent = timezone.now()
        referree.save()
        messages.info(self.request, "Email sent to {}".format(referree.owner.email))
        return reverse("request_meeting_redirect")


def test_view(request):
    message_queue()
    return JsonResponse(dict(name="biola"))


def message_queue():
    media_exchange = Exchange("media", "direct", durable=True)
    video_queue = Queue("video", exchange=media_exchange, routing_key="video")
    image_queue = Queue("image", exchange=media_exchange, routing_key="image")

    # connections
    with Connection("amqp://guest:guest@localhost//") as conn:
        # produce
        producer = conn.Producer(serializer="json")
        producer.publish(
            {"name": "/tmp/lolcat1.avi", "size": 1301013},
            exchange=media_exchange,
            routing_key="video",
            declare=[video_queue],
        )
        producer.publish(
            {"name": "/tmp/lolcat22.avi", "size": 1301013},
            exchange=media_exchange,
            routing_key="image",
            declare=[image_queue],
        )


class OfflineView(LoginRequiredMixin, TemplateView):
    template_name = "referrals/offline-materials.html"

    def post(self, request, *args, **kwargs):
        Referral.objects.filter(owner_id=request.user.pk).update(offline=True)
        email_to_request_flyer.delay(request.user.ref_instance.pk)
        messages.info(
            request,
            "Thank you! Your request has been sent, a Tuteria staff will call you",
        )
        return self.render_to_response(self.get_context_data())

    def get(self, request, *args, **kwargs):
        if not hasattr(request.user, "ref_instance"):
            return redirect(reverse("home"))
        return super(OfflineView, self).get(request, *args, **kwargs)


def get_tutor_request_form(request):
    Referral.objects.filter(owner_id=int(request.GET.get("pk"))).update(
        downloaded_form=True
    )
    return redirect("/static/img/TUTERIA-TUTOR-REQUEST-FORM.pdf")
    # filename = os.path.join(os.path.dirname(os.path.abspath(__file__)), "TUTERIA-TUTOR-REQUEST-FORM.pdf")
    # chunk_size = 8192
    # wrapper = FileWrapper(open(filename),chunk_size)
    #
    # response = StreamingHttpResponse(wrapper, content_type='application/pdf')
    # response['Content-Disposition'] = 'attachment; filename=%s' % os.path.basename(filename)
    # response['Content-Length'] = os.path.getsize(filename)
    # return response
