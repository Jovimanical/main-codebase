from __future__ import absolute_import
import typing
import urllib
import copy
import itertools
import asyncio

from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.urls import reverse
from django.template.loader import render_to_string
from django.utils import timezone
from django.contrib.sites.models import Site
from users.context_processors import TuteriaDetail
from config.mail_servers import mandrill_backend, mailgun_backend

# from config.utils import email_and_sms_helper
from gateway_client.email import email_and_sms_helper
from users.models import User, states
from external.models import BaseRequestTutor, DepositMoney
from users.levels import TuteriaLevel
from config.utils import send_telegram_notification


class RequestWithTutors(object):
    def __init__(self, request: BaseRequestTutor):
        self.request = request.pk
        # d = request.tutors_suggested().values_list('pk',flat=True)
        d = request.tutors_suggested()
        ff = [
            x.pk
            for x in d
            if not x.tutorskill_set.has_denied_related_subject(request.request_subjects)
        ]
        # self.users = [u for u in d]
        self.users = ff
        # BaseRequestTutor.objects.filter(pk=self.request).update(emailed_tutors=self.users)
        if len(self.users) == 0:
            send_email_to_admin_on_no_tutor_found(request)


@shared_task
def send_email_to_related_tutors(pks, email=None):
    # s = BaseRequestTutor.objects.filter(pk__in=pks).exclude(
    #     request_info__client_request__isnull=False
    # )
    s: typing.List[BaseRequestTutor] = BaseRequestTutor.objects.filter(pk__in=pks)
    # construct how the telegram message would look like
    # u = []
    # for zzz in s:
    #     a = RequestWithTutors(zzz)
    #     u.append(dict(request=a.request, users=a.users))
    # all_tutors_found = iter(
    #     set(itertools.chain(*[z["users"] for z in map(evaluate, s)]))
    # )
    # for first_tutor in all_tutors_found:
    #     result = split_and_return(u, first_tutor)
    #     send_mail_to_tutors_in_state_teaching.delay(result, email=email)
    # BaseRequestTutor.objects.filter(pk__in=[pks]).update(email_sent=True)
    for x in s:
        jobs = x.build_telegram_job_description()
        payload = {
            "data": jobs,
            "action": "send-channel-message",
        }
        # if jobs.get("link"):
        #     payload["data"]["reply_markup"] = {
        #         "inline_keyboard": [
        #             [{"text": jobs["link"]["label"], "url": jobs["link"]["url"]}]
        #         ]
        #     }
        send_telegram_notification(payload)
    # jobs = "\n\n".join([x.build_telegram_job_description() for x in s])
    # telegram_text = "{}".format(jobs)
    # return send_telegram_notification(telegram_text, "MarkdownV2")


def send_multiple_emails():
    def main():
        pass

    loop = asyncio.get_event_loop()
    tasks = []
    # I'm using test server localhost, but you can use any url
    url = "http://localhost:8080/{}"
    for i in range(5):
        task = asyncio.ensure_future(hello(url.format(i)))
        tasks.append(task)
    loop.run_until_complete(asyncio.wait(tasks))


@shared_task
def emails_sent_to_tutors_who_fall_in_the_list_of_subjects(email=None):
    """Get all current request which hasnt been sent email, group by state
    and send email in bulk for each state."""
    # for s in states:
    break_emails_into_users_and_send_request(None, email=email)


def evaluate(x):
    u = RequestWithTutors(x)
    return dict(request=u.request, users=u.users)


def get_tutors_and_email_set(state):
    s = (
        BaseRequestTutor.objects.to_be_requested(state)
        # .exclude(email_sent=True)
        .exclude(request_info__client_request__isnull=False)
    )
    u = []
    for zzz in s:
        a = RequestWithTutors(zzz)
        u.append(dict(request=a.request, users=a.users))
    # u =
    # [dict(request=RequestWithTutors(v).request,users=RequestWithTutors(v).users
    # for v in s]
    all_tutors_found = iter(
        set(itertools.chain(*[z["users"] for z in map(evaluate, s)]))
    )
    tutors_with_email = []
    for first_tutor in all_tutors_found:
        # u = (dict(request=RequestWithTutors(v).request,users=Requ for v in s)
        result = split_and_return(u, first_tutor)
        tutors_with_email.append(result)
    return tutors_with_email


@shared_task
def break_emails_into_users_and_send_request(state=None, email=None):
    # for result in get_tutors_and_email_set(state):
    s = (
        BaseRequestTutor.objects.to_be_requested(state)
        .exclude(email_sent=True)
        .exclude(request_info__client_request__isnull=False)
    )
    u = []
    for zzz in s:
        a = RequestWithTutors(zzz)
        u.append(dict(request=a.request, users=a.users))
    # u =
    # [dict(request=RequestWithTutors(v).request,users=RequestWithTutors(v).users
    # for v in s]
    all_tutors_found = iter(
        set(itertools.chain(*[z["users"] for z in map(evaluate, s)]))
    )
    for first_tutor in all_tutors_found:
        # u = (dict(request=RequestWithTutors(v).request,users=Requ for v in s)
        result = split_and_return(u, first_tutor)
    # send_mail_to_tutors_in_state_teaching(result, email=email)
    send_mail_to_tutors_in_state_teaching.delay(result, email=email)
    BaseRequestTutor.objects.to_be_requested(state).update(email_sent=True)


def split_and_return(returned_result, tutor):
    belong_to_request = []
    for i, d in enumerate(returned_result):
        if tutor in d["users"]:
            belong_to_request.append(copy.copy(d["request"]))
            d["users"].remove(tutor)
    return (tutor, list(set(belong_to_request)))


@shared_task
def send_mail_to_tutors_in_state_teaching(result, email=None):
    user: User = User.objects.get(pk=result[0])
    requests: typing.List[BaseRequestTutor] = (
        BaseRequestTutor.objects.filter(id__in=result[1])
        .exclude(request_info__client_request__isnull=False)
        .all()
    )
    my_region = user.revamp_data("personalInfo", "region")
    if my_region:
        suggested_requests: typing.List[
            BaseRequestTutor
        ] = BaseRequestTutor.objects.to_be_requested(None, 30).by_region(my_region)
    else:
        suggested_requests = BaseRequestTutor.objects.none()
    considered_requests = []
    # check the content of the email
    for r in requests:
        if r.in_vicinity().filter(region__istartswith=my_region):
            considered_requests.append(r)
    timer = timezone.now()
    dates = ""
    if 0 < timer.hour < 11:
        dates = "Morning"
    if 11 < timer.hour < 17:
        dates = "Afternoon"
    if 17 < timer.hour <= 23:
        dates = "Evening"
    # Oruma responsible for this.
    if len(considered_requests) > 0:
        email_for_new_tutor_opportunity(
            user,
            considered_requests,
            dates,
            email=email,
            suggested_requests=suggested_requests,
        )


def email_for_new_tutor_opportunity(
    user, requests, dates, email=None, suggested_requests=()
):
    new_requests = [
        {
            "first_name": x.first_name,
            "last_name": x.last_name,
            "is_parent_request": x.is_parent_request,
            "request_subjects": x.request_subjects,
            "expectation": x.expectation,
            "get_vicinity": x.get_vicinity(),
            "budget": float(x.budget),
            "request_detail_url": x.request_detail_url(),
            "created": x.created.isoformat(),
        }
        for x in requests
    ]
    related_requests = [
        {
            "first_name": x.first_name,
            "last_name": x.last_name,
            "is_parent_request": x.is_parent_request,
            "request_subjects": x.request_subjects,
            "expectation": x.expectation,
            "get_vicinity": x.get_vicinity(),
            "budget": float(x.budget),
            "request_detail_url": x.request_detail_url(),
            "created": x.created.isoformat(),
        }
        for x in suggested_requests
    ]
    context = {
        "user": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "earning_percent": user.earning_percent(),
        },
        "requests": new_requests,
        "related_requests": related_requests,
        "dates": dates,
    }

    booking_dict = {
        "to": email or user.email,
        "title": "New Tutoring Opportunity",
        "template": "request_blast",
        "context": context,
    }
    email_and_sms_helper(
        booking_dict,
        # sms_options=sms_options,
        backend="mandrill_backend",
        from_mail="Tuteria <no-reply@tuteria.com>",
    )


@shared_task
def mail_to_tutor_on_request_application(request_pk, user_id, email=None):
    user = User.objects.get(pk=user_id)
    request = BaseRequestTutor.objects.get(pk=request_pk)
    context = {
        "user": {"first_name": user.first_name, "last_name": user.last_name},
        "request": {
            "first_name": request.first_name,
            "last_name": request.last_name,
            "request_subjects": request.request_subjects,
            "expectation": request.expectation,
            "per_hour": request.per_hour(),
            "get_vicinity": request.get_vicinity(),
            "state": request.state,
            "slug": request.slug,
        },
    }

    booking_dict = {
        "to": email or user.email,
        "title": "Interested in this tutoring opportunity?",
        "template": "manual_email_to_tutors",
        "context": context,
    }
    email_and_sms_helper(
        booking_dict,
        backend="mailgun_backend",
        from_mail="Tuteria <no-reply@tuteria.com>",
    )
    request.email_sent = True

    request.save()


def send_email_to_admin_on_no_tutor_found(request):
    # msg = EmailMultiAlternatives("No tutor found for request #{} with subjects {} ".format(request.slug, ','.join(x for x in request.request_subjects)),
    #  "No suggested tutor found", "Tuteria <automated@tuteria.com>", [
    #  "godwin@tuteria.com"],
    #  connection=mandrill_backend)
    # msg.send()
    # request.email_sent = True
    # request.save()
    pass


@shared_task
def send_mail_to_update_skills(tutor_id, request_id, subjects, email=None):
    user = User.objects.get(pk=tutor_id)
    request = BaseRequestTutor.objects.get(pk=request_id)
    context = {
        "user": {"first_name": user.first_name, "last_name": user.last_name},
        "subjects": subjects,
        "request": {"get_vicinity": request.get_vicinity()},
    }

    booking_dict = {
        "to": email or user.email,
        "title": "Please attend to this urgently",
        "template": "update_skill_tutor",
        "context": context,
    }
    sms_options = {
        "sender": str(user.primary_phone_no.number),
        "body": "Hi {}, we CAN'T send ur profile to the client till you add the needed subjects. Please check ur email right away and treat urgently.".format(
            user.first_name
        ),
        "receiver": str(user.primary_phone_no.number),
    }
    email_and_sms_helper(
        booking_dict,
        sms_options=sms_options,
        backend="mailgun_backend",
        from_mail="Tuteria <info@tuteria.com>",
    )


@shared_task
def send_mail_to_tutors_to_update_exhibitions(
    tutor_id, request_id, subjects, email=None
):
    user = User.objects.get(pk=tutor_id)
    request = BaseRequestTutor.objects.get(pk=request_id)
    context = {
        "user": {"first_name": user.first_name, "last_name": user.last_name},
        "subjects": subjects,
        "request": {"get_vicinity": request.get_vicinity()},
    }

    booking_dict = {
        "to": email or user.email,
        "title": "Please attend to this urgently",
        "template": "update_exhibition_tutor",
        "context": context,
    }
    sms_options = {
        "sender": str(user.primary_phone_no.number),
        "body": "Hi {}, we CAN'T send your profile to the client till you upload some images. Please check your email right away and treat urgently".format(
            user.first_name
        ),
        "receiver": str(user.primary_phone_no.number),
    }
    email_and_sms_helper(
        booking_dict,
        sms_options=sms_options,
        backend="mailgun_backend",
        from_mail="Tuteria <info@tuteria.com>",
    )


@shared_task
def add(a, b):
    return a * b


@shared_task
def send_mail_to_admin_on_application_status(tutor_id, req_id, **kwargs):
    # /**from connect_tutor.models import RequestPool
    # tutor = User.objects.get(id=tutor_id)
    # req = BaseRequestTutor.objects.get(id=tutor_id)
    # msg = EmailMultiAlternatives(
    # "Tutor {}<{}> has responded with `{}` for the request job {}".format(
    # tutor.first_name, tutor.email, kwargs.get('Body'),
    # req.slug),
    # "Sms Response on Availability", "Tuteria <automated@tuteria.com>", [
    # "info@tuteria.com"],
    # connection=mandrill_backend)
    # msg.send()
    print("Message sent")
