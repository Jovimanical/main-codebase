# -*- coding: utf-8 -*-
from __future__ import absolute_import
from collections import Counter

from celery import shared_task
from django.utils import timezone
from django.contrib.sites.models import Site
from django.core.mail import EmailMultiAlternatives

from dateutil.relativedelta import relativedelta
from users.context_processors import TuteriaDetail
from gateway_client.email import email_and_sms_helper

# from config.utils import email_and_sms_helper
from config.mail_servers import mailgun_backend
from users.models import User
from referrals.models import Referral


@shared_task
def send_email_to_referree(pk, email=None, the_time=None):
    deadline = the_time
    if not deadline:
        deadline = timezone.now() + relativedelta(days=7)
    ref = Referral.objects.get(pk=pk)
    booking_dict = {
        "to": email or ref.owner.email,
        "title": "Have you checked out Tuteria now?",
        "template": "referral-reminder",
        "context": {
            "referral": {
                "owner": {"slug": ref.owner.slug},
                "referred_by": {
                    "first_name": ref.referred_by.first_name,
                    "last_name": ref.referred_by.last_name,
                },
            },
            "deadline": deadline.isoformat(),
        },
    }
    # ref.date_sent = timezone.now()
    # ref.save()
    email_and_sms_helper(
        booking_dict,
        from_mail="{} {} <invitation@tuteria.com>".format(
            ref.referred_by.first_name, ref.referred_by.last_name
        ),
    )


@shared_task
def free_credit_notification(ref, email=None):
    referral2 = Referral.objects.filter(pk=ref).first()
    if referral2:
        user = referral2.owner
        booking_dict = {
            "to": email or user.email,
            "title": "N1,500 loaded to your wallet!",
            "template": "referral-new-user",
            "context": {
                "referral": {
                    "owner": {
                        "first_name": referral2.owner.first_name,
                        "last_name": referral2.owner.last_name,
                    },
                    "referred_by": {
                        "first_name": referral2.referred_by.first_name,
                        "last_name": referral2.referred_by.last_name,
                    },
                }
            },
        }
        email_and_sms_helper(
            booking_dict, from_mail="Tuteria Community <invitation@tuteria.com>"
        )


@shared_task
def referral_recieved_today():
    count = Counter()
    today_referrals = Referral.objects.new_referrals()
    user_ids = (
        x.referred_by_id for x in today_referrals if x.referred_by_id is not None
    )
    for y in user_ids:
        count[y] += 1
    for u, z in count.items():
        send_no_of_referral_notice(u, z)


def send_no_of_referral_notice(user_id, number):
    user = User.objects.get(pk=user_id)
    booking_dict = {
        "to": user.email,
        "title": "You have new referrals!",
        "template": "new-referral-notice",
        "context": {
            "user": {"first_name": user.first_name, "last_name": user.last_name},
            "number": number,
        },
    }
    email_and_sms_helper(
        booking_dict, from_mail="Tuteria Community <invitation@tuteria.com>"
    )


@shared_task
def send_emails_to_join_tuteria(pk, email=None):
    user = User.objects.get(pk=pk)
    x = user.invitations.filter(email_sent=False).all()
    for invite in x:
        send_invitation(invite, email=email)
    x.update(email_sent=True)


def send_invitation(invite, email=None, the_time=None):
    deadline = the_time
    if not deadline:
        deadline = timezone.now() + relativedelta(days=7)
    booking_dict = {
        "to": email or invite.email,
        "title": "Have you heard about Tuteria?",
        "template": "email_to_join_tuteria",
        "context": {
            "invite": {
                "get_absolute_url": invite.get_absolute_url(),
                "user": {
                    "first_name": invite.user.first_name,
                    "last_name": invite.user.last_name,
                },
            },
            "deadline": deadline.isoformat(),
        },
    }
    email_and_sms_helper(
        booking_dict,
        from_mail="{} {} <invitation@tuteria.com>".format(
            invite.user.first_name, invite.user.last_name
        ),
    )


@shared_task
def send_email_on_referral_earned(pk, action, amount=0, email=None):
    referral2 = Referral.objects.get(pk=pk)
    referral2_details = {
        "referred_by": {
            "first_name": referral2.referred_by.first_name,
            "last_name": referral2.referred_by.last_name,
        },
        "owner": {
            "first_name": referral2.owner.first_name,
            "last_name": referral2.owner.last_name,
        },
    }
    booking_dict = {
        "to": email or referral2.referred_by.email,
        "title": "Thanks for your referral!",
        "template": "referral-completed",
        "context": {"referral": referral2_details, "amount": amount, "action": action},
    }
    email_and_sms_helper(booking_dict, from_mail="Tuteria <invitation@tuteria.com>")


@shared_task
def send_welcome_email_to_all_referrals(pk):
    referral2 = Referral.objects.get(owner_id=pk)

    booking_dict = {
        "to": referral2.owner.email,
        "title": "Welcome on Board!",
        "template": "referral-welcome",
        "context": {
            "referral": {
                "owner": {
                    "first_name": referral2.owner.first_name,
                    "last_name": referral2.owner.last_name,
                }
            }
        },
    }
    if referral2.owner.recieve_email:
        email_and_sms_helper(
            booking_dict, from_mail="Tuteria Referrals <automated@tuteria.com>"
        )


@shared_task
def notice_for_all_referrals(pk):
    referral2 = Referral.objects.get(pk=pk)
    booking_dict = {
        "to": referral2.owner.email,
        "title": "Updated Referral Earning Structure",
        "template": "referral-structure",
        "context": {
            "referral": {
                "owner": {
                    "first_name": referral2.owner.first_name,
                    "last_name": referral2.owner.last_name,
                },
                "offline_code": referral2.offline_code,
            }
        },
    }
    email_and_sms_helper(booking_dict, from_mail="Tuteria <automated@tuteria.com>")


@shared_task
def email_to_request_flyer(pk):
    request = Referral.objects.get(pk=pk)
    user = request.owner
    msg = EmailMultiAlternatives(
        "New flyer request from {}".format(request.owner.email),
        "New Flyer Request from {} \nPhone No: {}\n Full Name:{} ".format(
            user.email,
            user.primary_phone_no,
            "%s %s" % (user.first_name, user.last_name),
        ),
        "Tuteria <{}>".format(user.email),
        ["tunde@tuteria.com"],
        connection=mailgun_backend,
    )
    msg.send()
    print("Message sent")
