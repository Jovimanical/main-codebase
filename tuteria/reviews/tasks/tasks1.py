from __future__ import absolute_import

from decimal import Decimal

from celery import shared_task
from django.contrib.sites.models import Site

from ..models import TutorMeeting
from users.context_processors import TuteriaDetail

# from config.utils import email_and_sms_helper
from gateway_client.email import email_and_sms_helper
from config.mail_servers import mandrill_backend


def send_mail_helper(booking, sms_options=None, backend="mandrill_backend"):
    email_and_sms_helper(booking, sms_options=sms_options, backend=backend)


@shared_task
def intent_to_request_tutor_emails(email=None):
    """task to run on request that were initialized but not scheduled"""
    for booking in TutorMeeting.objects.stale_requests():
        booking.delete()
    print("Removed all stale requests to meet tutors")


@shared_task
def send_mail_to_client_and_tutor_on_successful_booking(
    booking_id, amount_paid, email=None, transaction_id=None
):
    """Mail sent to client and tutor on successful request placed placed"""
    booking = TutorMeeting.objects.get(pk=booking_id)
    booking_detailed = {
        "tutor": {
            "first_name": booking.tutor.first_name,
            "last_name": booking.tutor.last_name,
            "get_full_name": booking.tutor.get_full_name(),
            "location": booking.tutor.location,
            "primary_phone_no": {"number": str(booking.tutor.primary_phone_no.number)},
        },
        "order": booking.order,
        "paid_amount": float(booking.paid_amount),
        "get_absolute_url": booking.get_absolute_url(),
        "user": {
            "first_name": booking.client.first_name,
            "last_name": booking.client.last_name,
        },
        "client": {
            "first_name": booking.client.first_name,
            "last_name": booking.client.last_name,
        },
        "ts": {
            "tutor": {"first_name": booking.ts.tutor.first_name},
            "skill": {"name": booking.ts.skill.name},
        },
    }

    sms_options_tutor = {
        "sender": booking.tutor.primary_phone_no,
        "body": (
            "Tuteria- ! {} a client in your area wants to meet with you for {}."
            "Pls go to tuteria.com/dashboard right now for full details"
        ).format(booking.client.first_name, booking.ts.skill.name),
        "receiver": str(booking.tutor.primary_phone_no.number),
    }
    booking_dict_tutor = {
        "to": email or booking.tutor.email,
        "title": "You have a meeting request ",
        "template": "tutor_request_to_meet_notice",
        "context": {
            "booking": booking_detailed,
            "amount": float(amount_paid),
            "transaction_id": transaction_id,
        },
    }
    booking_dict_client = {
        "to": email or booking.client.email,
        "title": "Meeting request details with %s " % booking.ts.tutor.first_name,
        "template": "client_request_to_meet_notice",
        "context": {
            "booking": booking_detailed,
            "amount": float(amount_paid),
            "transaction_id": transaction_id,
            "form": {"transaction_id": transaction_id},
        },
    }

    send_mail_helper(booking_dict_tutor, sms_options=sms_options_tutor)
    if booking.wallet_amount <= Decimal(0):
        send_mail_helper(booking_dict_client)
