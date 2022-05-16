# -*- coding: utf-8 -*-
from __future__ import absolute_import
import asyncio
import typing

from django.contrib.auth import authenticate
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.contrib.sites.models import Site
from django.conf import settings
import requests
from users.context_processors import TuteriaDetail
from config.mail_servers import mailgun_backend

# from config.utils import email_and_sms_helper, send_mail_helper, days_elapsed
from config.utils import send_mail_helper, days_elapsed
from gateway_client.email import email_and_sms_helper
from ..models import BaseRequestTutor, DepositMoney, Patner, Agent


def get_social_urls(user):
    from django.utils.http import urlquote
    from django.urls import reverse

    meta_title = "Get ₦1,500 off your first lesson!"
    site = Site.objects.get_current()
    meta_description = (
        "Click here now to join {} on Tuteria and get the best tutors"
        " in your area for any subject, skill or exam."
    ).format(user.first_name)
    rquest_url = site.domain + reverse("users:referral_signup", args=[user.slug])
    linkedin_url = (
        "https://www.linkedin.com/shareArticle?mini=true&"
        "url=https://%s&title=%s&description=%s&submitted-url=https://%s"
    ) % (rquest_url, meta_title, meta_description, rquest_url)

    twitter_msg = "Get the best tutors at #Tuteria to help with any subject, skill or exam! @tuteriacorp https://www.tuteria.com/i/{}".format(
        user.slug
    )
    twitter_url = "https://twitter.com/home?status=%s" % (urlquote(twitter_msg),)
    facebook_url = "https://www.facebook.com/sharer/sharer.php?u=https://%s" % (
        rquest_url
    )
    return linkedin_url, twitter_url, facebook_url


@shared_task
def print_one():
    print("1233jojiojwioejiwjeiowjeiojwiojwiojwoiejoiwe")
    print(32_423_232_323_232_323 * 392_839_223_289_323_832 * 323_232_323)


@shared_task
def remove_useless_request_from_admin():
    pass
    # BaseRequestTutor.objects.filter(
    #     status=BaseRequestTutor.ISSUED, class_urgency=""
    # ).delete()


@shared_task
def email_sent_after_completing_request(pk, email=None):
    # emails to be sent to users who have completed requests.
    user = BaseRequestTutor.objects.get(pk=pk)
    password = user.first_name.lower() + user.last_name.lower()
    user1 = authenticate(email=user.email, password=password)
    if user1 is not None:
        same_password = True
    else:
        same_password = False

    agent = user.get_agent
    agent_string = {
        "first_name": agent.user.first_name,
        "last_name": agent.user.last_name,
        "title": agent.title,
        "email": agent.email,
        "phone_number": str(agent.phone_number),
    }

    context = {
        "request_instance": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "state": user.state,
            "slug": user.slug,
            "email": user.email,
            "agent_string": agent_string,
            "budget": user.budget,
            "service_fee": 3000
        },
        "same_password": same_password,
        "agent_string": agent_string,
        "password": password,
    }
    # Todo: set sms details

    booking_dict = {
        "to": email or user.email,
        "title": "Thanks {}, we've received your request".format(user.first_name),
        "template": "request_tutor_completed",
        "context": context,
    }

    sms_options2 = {
        "sender": str(user.number),
        "body": (
            "Hi {}, ! We've received your request for "
            "{} Lessons in {}. Expect our "
            "response shortly. Got questions? Call us: {}. Thank you!"
        ).format(
            user.first_name,
            user.request_subjects[0],
            # "s",
            user.state,
            agent.phone_number,
        ),
        "receiver": str(user.number),
    }

    email_and_sms_helper(
        booking_dict,
        # sms_options=sms_options2,
        backend="mailgun_backend",
        from_mail="Tuteria <automated@tuteria.com>",
    )
    # if user.tutor:
    #     send_email_notification_to_tutor_on_request(user, email=None)


def send_email_notification_to_tutor_on_request(user, email=None):
    context = {
        "request_instance": {
            "slug": user.slug,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "get_vicinity": user.get_vicinity(),
            "tutor": {"first_name": user.tutor.first_name, "email": user.tutor.email},
            "request_subjects": user.request_subjects,
        }
    }
    # Todo: set sms details

    booking_dict = {
        "to": email or user.tutor.email,
        "title": "New Client Request",
        "template": "tutor_notify_request",
        "context": context,
    }
    email_and_sms_helper(
        booking_dict,
        backend="mailgun_backend",
        from_mail="Tuteria <automated@tuteria.com>",
    )


@shared_task
def magic_link_password(email, link):
    booking = {
        "to": email,
        "context": {"password_reset_url": link},
        "template": "new-flow-magic-link",
        "title": "Here is your login link",
    }
    email_and_sms_helper(
        booking, backend="sendgrid_backend", from_mail="Tuteria <automated@tuteria.com>"
    )


@shared_task
def email_on_large_deposit(pk, email=None):
    user = DepositMoney.objects.get(pk=pk)
    context = {
        "deposit": {
            "user": {
                "first_name": user.user.first_name,
                "last_name": user.user.last_name,
                "wallet": {
                    "amount_available": float(user.user.wallet.amount_available)
                },
            },
            "discount_used": float(user.discount_used()),
            "amount_top_up": float(user.amount_top_up()),
            "order": user.order,
            "created": user.created.isoformat(),
        }
    }
    booking_dict = {
        "to": email or user.user.email,
        "title": "Receipt for Discount Lesson Purchase",
        "template": "large_deposits",
        "context": context,
    }
    email_and_sms_helper(booking_dict, backend="mailgun_backend")


@shared_task
def generic_email_send(pk, email=None):
    user = BaseRequestTutor.objects.get(pk=pk)
    context = {"user": {"first_name": user.first_name, "last_name": user.last_name}}
    booking_dict = {
        "to": email or user.email,
        "title": "Is your Child Prepared for the New Academic Year?",
        "template": "school_resume",
        "context": context,
    }
    email_and_sms_helper(booking_dict, backend="mailgun_backend")


@shared_task
def new_request_notification(pk):
    request = BaseRequestTutor.objects.get(pk=pk)
    agent = request.agent or Agent.get_agent()
    msg = EmailMultiAlternatives(
        "New request #{} amount{}  name{} number{}".format(
            request.pk,
            request.budget,
            "%s %s" % (request.first_name, request.last_name),
            request.number,
        ),
        "New Request",
        "Tuteria <automated@tuteria.com>",
        [agent.email],
        connection=mailgun_backend,
    )
    msg.send()
    print("Message sent")


@shared_task
def send_notification_to_client(pk, email=None):
    if email:
        user = BaseRequestTutor.objects.filter(email=email).first()
    else:
        user = BaseRequestTutor.objects.get(pk=pk)
    context = {
        "request_instance": {
            "get_absolute_url": user.get_absolute_url(),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "ts": {"skill": {"name": user.ts.skill.name}},
            "hours_per_day": user.hours_per_day,
            "tutor": {
                "first_name": user.tutor.first_name,
                "last_name": user.tutor.last_name,
            },
            "booking": {
                "bookingsession_set": list(
                    user.booking.bookingsession_set.values_list("pk", flat=True)
                ),
                "total_price": float(user.booking.total_price),
            },
        }
    }
    # Todo: set sms details
    # sms_options2 = {
    #     'sender': tutor.primary_phone_no,
    #     'body': "Lesson Notice {}".format(
    #         user.first_name),
    #     'receiver': str(user.number),
    # }
    booking_dict = {
        "to": email or user.email,
        "title": "Payment Invoice for Lesson Request {}".format(user.booking.order),
        "template": "booking_payment_request_to_client",
        "context": context,
    }
    email_and_sms_helper(
        booking_dict, backend="mailgun_backend", from_mail="Tuteria <info@tuteria.com>"
    )


@shared_task
def send_issued_email_to_client(pk, email=None):
    base_req = BaseRequestTutor.objects.get(pk=pk)
    first_name = "Friend"

    if base_req.user:
        first_name = base_req.user.first_name
    elif base_req.first_name:
        first_name = base_req.first_name
    else:
        pass
    context = {
        "user": {
            "first_name": first_name,
            "requested_subject": base_req.req_sub() or "a subject",
        }
    }

    booking_dict = {
        "to": email or base_req.email or base_req.user.email,
        "title": "You made a booking on tuteria?",
        "template": "issued_request_reminder",
        "context": context,
    }

    sms_options_tutor = {
        "sender": str(base_req.number),
        "body": (
            "Looking for a very good tutor near you?"
            "Call Tuteria on 09094526878 or chat with us here: bit.ly/WhatsappTuteria"
        ),
        "receiver": str(base_req.number),
    }
    email_and_sms_helper(
        booking_dict,
        backend="sendgrid_backend",
        # sms_options=sms_options_tutor,
        from_mail="Tuteria <info@tuteria.com>",
    )


@shared_task
def send_email_to_client_and_admin_to_make_payment_of_booking(email=None):
    rqs = BaseRequestTutor.objects.filter(
        status=BaseRequestTutor.PENDING
    ).get_requests_to_be_paid_tomorrow()
    for rq in rqs:
        mail_to_client_and_amdin_to_pay(rq, email=email)


def mail_to_client_and_amdin_to_pay(rq, email=None):
    x = rq.payment_date
    if x:
        x = x.isoformat()
    context = {
        "request_instance": {
            "slug": rq.slug,
            "first_name": rq.first_name,
            "last_name": rq.last_name,
            "number": str(rq.number),
            "email": rq.email,
            "payment_date": x,
            "booking": {
                "total_price": float(rq.booking.total_price),
                "order": rq.booking.order,
            },
        }
    }
    booking_dict = {
        "to": email or rq.email,
        "title": "Re: Lesson Payment Notice",
        "template": "client_reminder_to_make_payment",
        "context": context,
    }

    sms_options_tutor = {
        "sender": rq.number,
        "body": (
            "Hi {}! We've just sent you an email to see the recommended "
            "tutors. Please check right away or call Godwin on 09094526878 if "
            "you didn't get it."
        ).format(rq.first_name),
        "receiver": str(rq.number),
    }
    admin_dict = {
        "to": email or "info@tuteria.com",
        "title": "PaymentTime: {}, N{}".format(rq.first_name, rq.booking.total_price),
        "template": "admin_reminder_to_make_payment",
        "context": context,
    }
    email_and_sms_helper(
        booking_dict,
        # sms_options=sms_options_tutor,
        backend="mailgun_backend",
        from_mail="Tuteria <info@tuteria.com>",
    )
    email_and_sms_helper(admin_dict, backend="mailgun_backend")


@shared_task
def send_phone_numbers_to_clients(pk):
    user = BaseRequestTutor.objects.get(pk=pk)
    tuteria_details = TuteriaDetail()
    sms_options_tutor = {
        "sender": user.number,
        "body": (
            "Here's our bank details. "
            "GTB: Tuteria Limited, {} "
            "UBA: Tuteria Limited, {}."
            "Zenith: Tuteria Limited, {}"
        ).format(
            tuteria_details.gt["account"],
            tuteria_details.uba["account"],
            tuteria_details.zenith["account"],
        ),
        "receiver": str(user.number),
    }
    # email_and_sms_helper(sms_options=sms_options_tutor)


def mail_sender(user:BaseRequestTutor, subject, approved_tutors, multiple, title, tutor=None):
    from referrals.models import Referral

    password = user.first_name.lower() + user.last_name.lower()
    user1 = authenticate(email=user.email, password=password)
    r = Referral.get_instance(user.user)

    agent = user.get_agent
    request_instance = {
        "no_of_students": user.no_of_students,
        "budget": float(user.budget),
        "no_of_month_to_display": user.no_of_month_to_display(),
        "user": {"ref_instance": {"percent_discount": r.percent_discount}},
        "get_agent": {"name": agent.name, "phone_number": str(agent.phone_number)},
        "first_name": user.first_name,
        "last_name": user.last_name,
        "get_vicinity": user.vicinity,
        "get_hours_per_day_display": float(user.hours_per_day),
        "available_days": user.available_days,
        "request": {"approved_tutors": approved_tutors},
        "get_absolute_url": user.get_absolute_url(),
        "email": user.email,
    }

    if user1 is not None:
        same_password = True
    else:
        same_password = False

    passcontext = {
        "request_instance": request_instance,
        "same_password": same_password,
        "password": password,
        "multiple": multiple,
        "subjects": subject,
    }
    # if tutor:
    #     passcontext.update(tutor=tutor)
    booking_dict = {
        "to": user.email,
        "template": "tutor_profile_to_client",
        "title": title,
        "context": passcontext,
    }
    sms_options_tutor = {
        "sender": user.number,
        "body": "Hi {}! Pls click here to view the tutors we got for you: {}. Check your mail for details or call {}".format(
            user.first_name,
            "http://www.tuteria.com%s" % (user.get_absolute_url()),
            agent.phone_number,
        ),
        "receiver": str(user.number),
    }
    email_and_sms_helper(
        booking_dict,
        # sms_options=sms_options_tutor,
        backend="mailgun_backend",
        from_mail="Tuteria <info@tuteria.com>",
        client_type="twilio",
    )


@shared_task
def send_profile_to_client(pk, email=None):
    from config.utils import easms

    user = BaseRequestTutor.objects.get(pk=pk)
    # password = user.first_name.lower() + user.last_name.lower()
    # user1 = authenticate(email=user.email, password=password)
    # if user1 is not None:
    #    same_password = True
    # else:
    #    same_password = False

    # context = {'request_instance': user,
    #           'same_password': same_password, 'password': password}

    # booking_dict = {
    #    'to': email or user.email,
    #    'template': "tutor_profile_to_client",
    # }
    tutors = user.approved_tutors()
    teach_all_subject = user.approved_tutors_teach_all_subjects()
    ts_skills = user.approved_tutors().all().order_by("-recommended")
    if teach_all_subject:
        if len(ts_skills) > 1:
            multiple = False
        else:
            multiple = True
    else:
        multiple = True
    tutor = None
    if multiple:
        tutor_names = [x.tutor.first_name for x in tutors]
        # string = ""P
        # for i, v in enumerate(tutor_names):
        #     string += "{}".format(v)
        #     if tutor_names[i] != tutor_names[-2]:
        #         string += ', '
        title = " Re: Please review {}, Home Tutors around {}".format(
            ", ".join(tutor_names), user.vicinity
        )
        # booking_dict['title'] = title
        # context['multiple'] = True
    else:
        tutor = tutors[0]
        title = "Re: Please review {} Tutor in {}".format(
            ", ".join(tutor.subjects), tutor.tutor.location
        )
        # booking_dict['title'] = title
        # context.update(multiple=False, tutor=tutor,
        #               subjects=", ".join(tutor.subjects))
    subjects = ""
    if tutor:
        subjects = ", ".join(tutor.subjects)
    mail_sender(
        user,
        subjects,
        list(user.approved_tutors().values_list("tutor__first_name", flat=True)),
        multiple,
        title,
        tutor=tutor,
    )

    # booking_dict['context'] = context

    # sms_options_tutor = {
    #     'sender': user.number,
    #     'body': "Hi {}! Pls click here to view the tutors we got for you: {}. Check your mail for details or call 08179323580"
    #     .format(user.first_name, "http://www.tuteria.com%s" % (user.get_absolute_url())),
    #     'receiver': str(user.number),
    # }
    # easms(booking_dict, sms_options=sms_options_tutor, backend="mailgun_backend",
    #       from_mail="Tuteria <info@tuteria.com>", client_type='twilio')


@shared_task
def send_email_on_new_booking(deposit_pk, email=None):
    deposit = DepositMoney.objects.get(pk=deposit_pk)
    request = deposit.request
    sms_options_tutor = {
        "sender": request.number,
        "body": "Hi {}, we've scheduled lessons for the next period and sent you an email link. Please check your email to confirm. Thanks. 09094526878".format(
            request.first_name
        ),
        "receiver": str(request.number),
    }
    password = request.first_name.lower() + request.last_name.lower()
    user1 = authenticate(email=request.email, password=password)
    if user1 is not None:
        same_password = True
    else:
        same_password = False
    booking_dict_tutor = {
        "to": email or request.email,
        "title": "Recurrent Lesson Payment",
        "template": "reschedule_class",
        "context": {
            "deposit": {
                "order": deposit.order,
                "request": {
                    "first_name": request.first_name,
                    "last_name": request.last_name,
                    "email": request.email,
                },
            },
            "password": password,
            "same_password": same_password,
        },
    }
    email_and_sms_helper(
        booking=booking_dict_tutor,
        # sms_options=sms_options_tutor
    )


@shared_task
def send_mail_to_admin_on_client_payment(pk):
    request = DepositMoney.objects.get(pk=pk)
    msg = EmailMultiAlternatives(
        "Payment Made by #{} amount{} for request with slug #{}".format(
            request.user.email, request.amount, request.request.slug
        ),
        "Payment Just Made",
        "Tuteria <automated@tuteria.com>",
        ["clients@tuteria.com"],
        connection=mailgun_backend,
    )
    msg.send()
    print("Message sent")


def send_email_on_payment_made(req):
    pass


@shared_task
def send_notification_of_processing_fee_to_client(pk, email=None):
    """Email and sms sent to client after making payment of processing fee"""
    request = BaseRequestTutor.objects.get(pk=pk)

    sms_options_tutor = {
        "sender": request.number,
        "body": "Processing Fee notification notice {}".format(request.first_name),
        "receiver": str(request.number),
    }
    a = TuteriaDetail()
    booking_dict_tutor = {
        "to": email or request.email,
        "title": "Processing Fee Payment for Request ID: %s" % request.id,
        "template": "processing_fee_notice",
        "context": {
            "request_instance": {
                "first_name": request.first_name,
                "last_name": request.last_name,
                "slug": request.slug,
                "created": request.created.isoformat(),
                "processing_fee": float(a.processing_fee),
            }
        },
    }

    email_and_sms_helper(
        booking=booking_dict_tutor,
        # sms_options=sms_options_tutor
    )


@shared_task
def send_second_processing_fee_notification_notice(pk, email=None):
    """Email and sms reminder sent to client after making payment of processing fee"""
    request = BaseRequestTutor.objects.get(pk=pk)
    a = TuteriaDetail()
    sms_options_tutor = {
        "sender": request.number,
        "body": "Hi {}, pls be reminded to pay the N{} processing fee so we can proceed to get your tutor: GTB, {}, {}. Helpline: {}".format(
            request.first_name,
            float(a.processing_fee),
            a.gt["name"],
            a.gt["account"],
            a.mobile_number,
        ),
        "receiver": str(request.number),
    }
    booking_dict_tutor = {
        "to": email or request.email,
        "title": "Processing Fee Payment to Get a Tutor",
        "template": "email-to-pay-processing-fee",
        "context": {
            "user": {"first_name": request.first_name, "last_name": request.last_name},
            "settings": {"PROCESSING_FEE": float(a.processing_fee)},
        },
    }

    email_and_sms_helper(
        booking=booking_dict_tutor,
        #  sms_options=sms_options_tutor
    )


@shared_task
def follow_up_mail_after_finding_tutors(pk, email=None):
    """Email sent to get client to follow up on the booking"""
    request = BaseRequestTutor.objects.get(pk=pk)

    booking_dict_tutor = {
        "to": email or request.email,
        "title": "Re: I need your feedback. What do you think?",
        "template": "follow_up",
        "context": {
            "request_instance": {
                "first_name": request.first_name,
                "last_name": request.last_name,
                "slug": request.slug,
            }
        },
    }
    email_and_sms_helper(booking=booking_dict_tutor)


def first_email_blast():
    requests = BaseRequestTutor.objects.get_drip_request()
    for r in requests:
        if days_elapsed(r.created):
            email_drip_for_request(r, number=1)
    print(requests.count())


def second_email_blast():
    requests = BaseRequestTutor.objects.get_drip_request(counter=1)
    for r in requests:
        if days_elapsed(r.created, 48):
            email_drip_for_request(r, number=2)
    print(requests.count())


def third_email_blast():
    requests = BaseRequestTutor.objects.get_drip_request(counter=2)
    for r in requests:
        if days_elapsed(r.created, 120):
            email_drip_for_request(r, number=3)
    print(requests.count())


def generic_blast_function(
    queryset, condition, increment, custom_function=None, discount=5, email=None
):
    for r in queryset:
        if custom_function:
            custom_function(r)
        counter = 0
        if days_elapsed(r.payment_date, condition):
            r.update_percent_discount(discount)
            email_drip_for_pending_request(r, number=increment, email=email)
            counter += 1
        print(counter)
    print(queryset.count())


# def email_drip_for_pending_request(request, number=4, email=None):
#     context = {'req_instance': {
#         'first_name': request.first_name,
#         'last_name': request.last_name,
#         'request_subjects': request.request_subjects,

#         'get_absolute_url': request.get_absolute_url()}
#     }
#     first_drip = {
#         'to': email or request.email,
#         'template': "request_pending_first_drip",
#         'context': context,
#         'title': "{}, here's 10% off your lesson cost!".format(request.first_name),
#     }

#     second_drip = {
#         'to': email or request.email,
#         'title': "Don't procrastinate - take 15% off lesson fee",
#         'template': "request_pending_second_drip",
#         'context': context
#     }
#     third_drip = {
#         'to': email or request.email,
#         'title': "Last Chance - Take 20% Off!",
#         'template': "request_pending_third_drip",
#         'context': context
#     }
#     if number == 4:
#         email_and_sms_helper(booking=first_drip,
#                              from_mail="Tuteria <info@tuteria.com>")
#     if number == 5:
#         email_and_sms_helper(booking=second_drip,
#                              from_mail="Tuteria <info@tuteria.com>")
#     if number == 6:
#         email_and_sms_helper(booking=third_drip,
#                              from_mail="Tuteria <info@tuteria.com>")

#     request.drip_counter += 1
#     request.save()


def o(x):
    if not x.payment_date:
        x.drip_counter = 3
        x.update_payment_date_to_today()


def first_pending_email_blast(queryset=None, email=None):
    """Using drip_counter used for issued requests. Starts at number below or equals to 3.
    Offer them 10% off."""
    requests = BaseRequestTutor.objects.get_pending_drip_request().filter(
        drip_counter__lt=4
    )
    if queryset:
        requests = requests.filter(id__in=queryset)
    generic_blast_function(
        requests, 10 * 24, 4, discount=10, custom_function=o, email=email
    )


def second_pending_email_blast(queryset=None, email=None):
    """Get all pending tutors with a drip_counter of 4 and offer them 15% off"""
    requests = BaseRequestTutor.objects.get_pending_drip_request().filter(
        drip_counter=4
    )
    if queryset:
        requests = requests.filter(id__in=queryset)
    generic_blast_function(requests, 15 * 24, 5, discount=15, email=email)


def third_pending_email_blast(queryset=None, email=None):
    """Get all pending tutors with a drip counter of 5 and offer them 20% off"""
    requests = BaseRequestTutor.objects.get_pending_drip_request().filter(
        drip_counter=5
    )
    if queryset:
        requests = requests.filter(id__in=queryset)
    generic_blast_function(requests, 20 * 24, 6, discount=20, email=email)


@shared_task
def drip_messager_pending(queryset=None, email=None):
    first_pending_email_blast(queryset, email)
    second_pending_email_blast(queryset, email)
    third_pending_email_blast(queryset, email)


def email_drip_for_request(request, number=1, email=None):
    context = {
        "req_instance": {
            "first_name": request.first_name,
            "last_name": request.last_name,
            "is_parent_request": request.is_parent_request,
            "request_subjects": request.request_subjects,
            "slug": request.slug,
        }
    }
    first_drip = {
        "to": email or request.email,
        "template": "request_first_drip",
        "context": context,
    }
    if request.is_parent_request:
        first_drip["title"] = "Need a home tutor in {}?".format(request.get_vicinity())
    else:
        if len(request.request_subjects) > 0:
            first_drip["title"] = "Need a tutor for {} in your area?".format(
                request.request_subjects[0]
            )
        else:
            first_drip["title"] = "Need a tutor in your area?"

    second_drip = {
        "to": email or request.email,
        "title": "Get N1500 off your first lesson!",
        "template": "request_second_drip",
        "context": context,
    }
    third_drip = {
        "to": email or request.email,
        "title": "Get THE BEST tutors in your area!",
        "template": "request_third_drip",
        "context": context,
    }
    if number == 1:
        email_and_sms_helper(booking=first_drip, from_mail="Tuteria <info@tuteria.com>")
    if number == 2:
        email_and_sms_helper(
            booking=second_drip, from_mail="Tuteria <info@tuteria.com>"
        )
    if number == 3:
        email_and_sms_helper(booking=third_drip, from_mail="Tuteria <info@tuteria.com>")

    request.drip_counter += 1
    request.save()


@shared_task
def drip_messager():
    first_email_blast()
    second_email_blast()
    third_email_blast()


def send_postmark_email(tutors: typing.List[BaseRequestTutor], drip_no: int):
    response = requests.post(
        f"{settings.CDN_SERVICE}/api/drip-messenger",
        json={"tutors": [x.drip_info for x in tutors], "drip_no": f"drip_{drip_no}"},
    )
    if response.status_code < 400:
        result = response.json()
        print(
            f"Successfully sent drip messages with type drip_{drip_no} for {len(tutors)}"
        )
        return drip_no
    return False


async def send_postmark_email_sync(tutors: typing.List[BaseRequestTutor], drip_no: int):
    return await loop_helper(lambda: send_postmark_email(tutors, drip_no))


def sync_call(future):
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(future)


async def loop_helper(callback):
    loop = asyncio.get_event_loop()
    future = loop.run_in_executor(None, callback)
    return await future


@shared_task
def new_request_drip_messenger():
    print("Running drip action")
    tutors = BaseRequestTutor.objects.fall_in_new_drip()
    results = sync_call(
        asyncio.gather(
            *[send_postmark_email_sync(x, i + 1) for i, x in enumerate(tutors)]
        )
    )
    for r in zip(tutors, results):
        BaseRequestTutor.update_drip_status(r[0], r[1])


@shared_task
def delete_after_all_email_blast():
    pass
    # requests = BaseRequestTutor.objects.get_drip_request(counter=3)
    # for r in requests:
    #     sms_options_tutor = {
    #         'sender': r.number,
    #         'body': """
    #         Do you need a very good tutor near you to master any subject, skill or exam?
    #         Then go to www.tuteria.com or call 090-945-26878 now to get the very best.
    #         """,
    #         'receiver': str(r.number),
    #     }
    #     send_mail_helper(sms_options=sms_options_tutor)
    #     r.delete()


@shared_task
def send_text_message(ids, body):
    requests = BaseRequestTutor.objects.filter(id__in=ids)
    for r in requests:
        sms_options = {
            "sender": r.number,
            "body": "Dear %s, %s" % (r.first_name, body),
            "receiver": str(r.number),
        }
        # send_mail_helper(sms_options=sms_options)


@shared_task
def send_sms(pk, email=None):
    r = BaseRequestTutor.objects.get(pk=pk)
    sms_options_tutor = {
        "sender": email or r.number,
        "body": """
        Hi {}, when should your lessons start? See the tutor here: www.tuteria.com{}. 
        Pls call 08179323580 to get started.
        """.format(
            r.first_name, r.get_absolute_url()
        ),
        "receiver": email or str(r.number),
    }
    # send_mail_helper(sms_options=sms_options_tutor)


# Todo


@shared_task
def email_notification_on_patnership(pk, email=None):
    patner = Patner.objects.get(pk=pk)
    msg = EmailMultiAlternatives(
        "Partnership Proposal, {}, {}".format(patner.company_name, patner.state),
        patner.body,
        ["godwin@tuteria.com"],
        connection=mailgun_backend,
    )
    msg.send()
    print("Message sent")


@shared_task
def delete_all_request_whose_bookings_are_closed():
    """Deletes all tutor applicants for requests that have been closed,
    Also deletes related request whose main request has its booking closed."""
    from bookings.models import Booking
    from connect_tutor.models import RequestPool

    reqs = BaseRequestTutor.objects.filter(
        status=BaseRequestTutor.PAYED, booking__status=Booking.COMPLETED
    ).values_list("pk", flat=True)
    RequestPool.objects.filter(req_id__in=reqs).delete()
    x = BaseRequestTutor.objects.filter(id__in=reqs)
    for u in x:
        u.get_split_request().delete()


@shared_task
def emails_to_former_customers(request_id, email=None):
    request = BaseRequestTutor.objects.get(pk=request_id)
    booking_dict_tutor = {
        "to": email or request.email,
        "title": "Hi %s, how are your kids performing now?" % request.first_name,
        "template": "re-engage-old-clients",
        "context": {
            "req_instance": {
                "first_name": request.first_name,
                "last_name": request.last_name,
            }
        },
    }

    email_and_sms_helper(
        booking=booking_dict_tutor, from_mail="Info <info@tuteria.com>"
    )


@shared_task
def email_blast_to_all_clients(request_id, email=None):
    request = BaseRequestTutor.objects.get(pk=request_id)
    booking_dict_tutor = {
        "to": email or request.email,
        "title": "Happy Children's Day %s!" % request.first_name,
        "template": "childrens-day",
        "context": {},
    }
    send_mail_helper(booking=booking_dict_tutor, from_mail="Tuteria <info@tuteria.com>")


@shared_task
def daily_sales_analytics():
    Agent.daily_upload()


@shared_task
def daily_tutor_success_analytics():
    Agent.daily_upload(tutor_agent=True)


@shared_task
def notify_client_and_tutors_on_new_group_lessons(pk):
    from external.new_group_flow.services import GroupRequestService

    request = BaseRequestTutor.objects.get(pk=pk)
    skill = request.request_subjects[0]
    context_array = GroupRequestService.email_data_from_request(request)
    for i in context_array:
        client_email = i[1]
        if settings.DEBUG:
            client_email = "gbozee@gmail.com"
        client_dict = {
            "to": client_email,
            "template": "group_lesson_to_client",
            "title": f"You've joined the {skill} Group Lesson",
            "context": i[0],
        }
        email_and_sms_helper(
            booking=client_dict,
            from_mail="Tuteria <info@tuteria.com>",
            url=settings.NOTIFICATION_SERVICE_URL,
        )


@shared_task
def email_to_notify_tutor_and_client_on_group_lessons(pk):
    request = BaseRequestTutor.objects.get(pk=pk)
    skill = request.request_subjects[0]
    request_info = request.request_info
    # import pdb; pdb.set_trace()
    tutor = request_info["request_details"].get("tutor")
    context = {
        "skill": skill,
        "lesson_plan": request_info["request_details"].get("lesson_plan"),
        "schedule": request_info["request_details"].get("schedule"),
        "no_of_student": request.no_of_students,
        "client": {
            "full_name": f"{request.first_name} {request.last_name}",
            "phone_no": str(request.number),
        },
        "venue": request_info["request_details"].get("venue"),
        "tutor": {
            "name": f"{tutor['first_name']} {tutor['last_name']}",
            "phone_no": tutor["phone_no"],
        },
        "curriculum_link": request_info["request_details"].get("curriculum_link"),
    }
    client_email = request.email
    if settings.DEBUG:
        client_email = "gbozee@gmail.com"
    client_dict = {
        "to": client_email,
        "template": "group_lesson_to_client",
        "title": f"You've joined the {skill} Group Lesson",
        "context": context,
    }
    tutor_email = tutor["email"]
    if settings.DEBUG:
        tutor_email = "gbozee@gmail.com"
    tutor_dict = {
        "to": tutor_email,
        "title": f"New Student for {skill} Group Lesson",
        "template": "group_lesson_to_tutor",
        "context": context,
    }
    email_and_sms_helper(
        booking=client_dict,
        from_mail="Tuteria <info@tuteria.com>",
        url=settings.NOTIFICATION_SERVICE_URL,
    )
    email_and_sms_helper(
        booking=tutor_dict,
        from_mail="Tuteria <info@tuteria.com>",
        url=settings.NOTIFICATION_SERVICE_URL,
    )


class SchedulerService:
    PAUSED = "paused"
    RUNNING = "running"

    def __init__(self):
        self.host = settings.SCHEDULER_HOST_URL
        self.bot_name = "bot"

    def build_bot_config(self, bot_name=None):
        return {}

    def post_helper(self, path, params):
        return requests.post(
            f"{self.host}/scheduler/{path}",
            json={**params, **self.build_bot_config()},
        )

    def create_job(self, params, path, method="POST", bot_name=None):
        response = self.post_helper(
            f"/jobs/create",
            {
                "endpoint": f"https://www.tuteria.com/{path}",
                "method": method,
                **params,
            },
            bot_name=bot_name,
        )
        if response.status_code < 400:
            result = response.json()
            return result["data"]
        response.raise_for_status()
        return {}


@shared_task
def send_notice_to_both_tutor_and_client(slug: str):
    base_request = BaseRequestTutor.objects.filter(slug=slug).first()
    scheduler = SchedulerService()
    notification_info = base_request.send_notification_to_tutor_on_job()
    send_email_and_sms_to_tutor_on_new_job(**notification_info)
    current_time = timezone.now() + relativedelta(minutes=+1)
    scheduler.create_job(
        {"job": {}, "trigger": {"run_date": current_time}},
        f"send-notification-to-client/{base_request.slug}",
        method="POST",
    )


@shared_task
def send_email_and_sms_to_tutor_on_new_job(**notification_info):
    tutor_dict = {
        "to": client_email,
        "template": "group_lesson_to_client",
        "title": f"You've joined the {skill} Group Lesson",
        "context": context,
    }


@shared_task
def update_applicant_records():
    from external.models import CombinedTutorData

    print("Starting view update")
    duration = CombinedTutorData.refresh()
    print(f"Completed view update took {duration.seconds} seconds")
