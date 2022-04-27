# -*- coding: utf-8 -*-
from __future__ import absolute_import
import copy
import logging
from decimal import Decimal
import requests
from celery import shared_task
from django.contrib.auth import authenticate
from django.contrib.sites.models import Site
from django.core.mail import EmailMultiAlternatives

from config.mail_servers import mandrill_backend, sendgrid_backend, mailgun_backend
from users.context_processors import TuteriaDetail
from config.utils import PayStack
from gateway_client.email import email_and_sms_helper
from django.conf import settings
from bookings import models

logger = logging.getLogger(__name__)
# Todo


@shared_task
def send_email_to_review_tutor(booking_id, email=None):
    """Task for email sent to client to review tutor"""
    async_send_email_to_review_tutor(booking_id, email)


def async_send_email_to_review_tutor(booking_id, email=None):
    """Task for email sent to client to review tutor"""
    booking = models.Booking.objects.get(pk=booking_id)
    linkedin_url, twitter_url, facebook_url = get_social_urls(booking.user)

    context = {
        "sender": {
            "get_referral_instance": {
                "offline_code": booking.user.get_referral_instance().offline_code
            }
        },
        "booking": {
            "get_tutor": {
                "first_name": booking.get_tutor.first_name,
                "last_name": booking.get_tutor.last_name,
            },
            "user": {
                "first_name": booking.user.first_name,
                "last_name": booking.user.last_name,
            },
        },
        "linkedin_url": linkedin_url,
        "facebook_url": facebook_url,
        "twitter_url": twitter_url,
    }

    booking_dict = {
        "to": email or booking.user.email,
        "title": "Reminder: Your Lesson starts in one hour",
        "template": "one_hour_reminder_tutor",
        "context": context,
    }
    send_mail_helper(booking_dict)


@shared_task
def update_bookings_status():
    count = 0
    for booking in models.Booking.objects.get_initialized_bookings():
        if booking.elapsed_date:
            booking.status_to_completed()
            count += 1


@shared_task
def add(x, y):
    return x + y


def construct_mail(booking, email=None):
    linkedin_url, twitter_url, facebook_url = get_social_urls(booking.user)
    tutor = booking.get_tutor
    client = booking.user
    skill = booking.skill_display()

    context = {
        "booking": {
            "user": {"first_name": client.first_name, "last_name": client.last_name},
            "get_tutor": {"first_name": tutor.first_name, "last_name": tutor.last_name},
        },
        "linkedin_url": linkedin_url,
        "facebook_url": facebook_url,
        "twitter_url": twitter_url,
    }
    context2 = copy.deepcopy(context)
    sms_options2 = {
        "sender": tutor.primary_phone_no,
        "body": (
            "Hi {}! Your {} lesson with {} begins in about 3 "
            "hours. Hope you are well prepared? Give this your best shot. Tuteria"
        ).format(tutor.first_name, skill, client.first_name),
        "receiver": str(tutor.primary_phone_no.number),
    }

    sms_options = {
        "sender": client.primary_phone_no,
        "body": (
            "Hi {}! Your {} lesson(s) with {} begins in about 3 hours. "
            "Hope everything is set? We'll be in touch at the end. Tuteria"
        ).format(client.first_name, skill, tutor.first_name),
        "receiver": str(booking.user.primary_phone_no.number),
    }
    booking_dict = {
        "to": email or booking.get_tutor.email,
        "title": "Reminder: Your Lesson starts in about 3 hours",
        "template": "one_hour_reminder_tutor",
        "context": context2,
    }
    booking_dict2 = {
        "to": email or booking.user.email,
        "title": "Reminder: Your Lesson starts in about 3 hours",
        "template": "one_hour_reminder_client",
        "context": context,
    }
    context.update(
        sender={
            "get_referral_instance": {
                "offline_code": client.get_referral_instance().offline_code
            }
        }
    )
    send_mail_helper(booking_dict2, sms_options=sms_options)
    context2.update(
        sender={
            "get_referral_instance": {
                "offline_code": tutor.get_referral_instance().offline_code
            }
        }
    )
    linkedin_url, twitter_url, facebook_url = get_social_urls(booking.get_tutor)
    context2.update(
        linkedin_url=linkedin_url, facebook_url=facebook_url, twitter_url=twitter_url
    )
    booking_dict.update(context=context2)

    send_mail_helper(booking_dict, sms_options=sms_options2)


@shared_task
def trigger_email_notification_one_hour(email=None):
    """Mails sent to bookings that would be taught within the hour"""
    counter = 0
    for booking in models.Booking.objects.get_bookings_within_the_hour():
        # trigger email to both user and tutor
        construct_mail(booking, email=email)
        counter += 1
    print("Notification on subject for the next hour ")


def send_mail(subject, text, html, to):
    from_mail = "Help Center <help@tuteria.com>"
    msg = EmailMultiAlternatives(
        subject, text, from_mail, [to], connection=mandrill_backend
    )
    msg.attach_alternative(html, "text/html")
    msg.send()


@shared_task
def send_mail_to_client_and_tutor_on_successful_booking(
    booking_id, amount_paid, email=None, transaction_id=None
):
    """Mail sent to client and tutor on successful booking placed"""
    booking = models.Booking.objects.get(pk=booking_id)
    if not booking.first_session:
        booking.compute_first_session()
    
    booking_dict = {
        "skill_display": booking.skill_display(),
        "due_date": booking.due_date().isoformat(),
        "get_tutor": {
            "email": booking.get_tutor.email,
            "vicinity": booking.get_tutor.vicinity,
            "first_name": booking.get_tutor.first_name,
            "last_name": booking.get_tutor.last_name,
            "location": booking.get_tutor.location,
            "get_full_name": booking.get_tutor.get_full_name(),
            "primary_phone_no": {
                "number": str(booking.get_tutor.primary_phone_no.number)
            },
        },
        "discount_percent": booking.discount_percent,
        "student_no": booking.student_no,
        "get_absolute_url": booking.get_absolute_url(),
        "get_tutor_absolute_url": booking.get_tutor_absolute_url(),
        "total_price": float(booking.total_price),
        "first_session": booking.first_session.isoformat(),
        "get_price": float(booking.get_price()),
        "tutor_pricing": float(booking.tutor_pricing()),
        "sessions_count": float(booking.bookingsession_set.count()),
        "bank_price": float(booking.bank_price),
        "real_price": float(booking.real_price),
        "total_hours": float(booking.total_hours),
        "user": {
            "email": booking.user.email,
            "vicinity": booking.user.vicinity,
            "first_name": booking.user.first_name,
            "location": booking.user.location,
            "get_full_name": booking.user.get_full_name(),
        },
        "last_session": booking.last_session.isoformat(),
        "order": booking.order,
    }
    sms_options_tutor = {
        "sender": booking.get_tutor.primary_phone_no,
        "body": (
            "{} in {} has hired you for {} lessons. "
            "Go to tuteria.com/dashboard immediately for full details!"
        ).format(
            booking.user.first_name, booking.user.vicinity, booking.skill_display()
        ),
        "receiver": str(booking.get_tutor.primary_phone_no.number),
    }
    booking_dict_tutor = {
        "to": email or booking.get_tutor.email,
        "title": "Congrats! You have a new booking with %s " % booking.user.first_name,
        "template": "tutor_subject_notice",
        "context": {
            "booking": booking_dict,
            "amount": float(booking.tutor_pricing()),
            "transaction_id": transaction_id,
        },
    }
    linkedin_url, twitter_url, facebook_url = get_social_urls(booking.user)

    booking_dict_client = {
        "to": email or booking.user.email,
        "title": "Thanks for your booking with %s " % booking.get_tutor.first_name,
        "template": "client_subject_notice",
        "context": {
            "booking": booking_dict,
            "amount": float(amount_paid),
            "transaction_id": transaction_id,
            "sender": {
                "get_referral_instance": {
                    "offline_code": booking.user.get_referral_instance().offline_code
                }
            },
            "linkedin_url": linkedin_url,
            "facebook_url": facebook_url,
            "twitter_url": twitter_url,
        },
    }
    send_mail_helper(
        booking_dict_tutor,
        # sms_options=sms_options_tutor
    )
    user = booking.user
    password = user.first_name.lower() + user.last_name.lower()
    user1 = authenticate(email=user.email, password=password)
    if user1 is not None:
        same_password = True
    else:
        same_password = False
    a = booking_dict_client["context"]
    a.update(password=password, same_password=same_password)
    booking_dict_client.update(context=a)
    send_mail_helper(booking_dict_client)
    base_request = booking.baserequesttutor_set.count()
    if base_request > 0:
        from bookings import tasks

        tasks.send_email_to_notify_remaining_tutors_not_selected(booking.order)
    booking.tutor.to_mailing_list()
    # tasks.charge_client_again(booking.order)
    exists, assigned = booking.get_vid_and_agent(booking)


@shared_task
def post_process_booking(booking_id):
    booking = models.Booking.objects.get(pk=booking_id)
    booking.move_money_to_wallet_session()


@shared_task
def send_mail_to_client_on_delivered_booking(booking_id, email=None):
    """Mail and sms sent to client to notify him to come and close the booking"""
    booking = models.Booking.objects.get(pk=booking_id)

    text = (
        "{} has submitted the lessons and left a review. "
        "Please check your email to review and confirm lessons submitted. Thanks! "
    )
    sms_options = {
        "sender": booking.user.primary_phone_no,
        "body": text.format(booking.get_tutor.first_name),
        "receiver": str(booking.user.primary_phone_no.number),
    }
    booking_dict = {
        "to": email or booking.user.email,
        "title": "%s has delivered your lessons. Please review "
        % booking.get_tutor.first_name,
        "template": "booking_completed_tutor",
        "context": {
            "booking": {
                "user": {
                    "first_name": booking.user.first_name,
                    "last_name": booking.user.last_name,
                },
                "get_tutor": {
                    "first_name": booking.get_tutor.first_name,
                    "last_name": booking.get_tutor.last_name,
                },
                "get_absolute_url": booking.get_absolute_url(),
            }
        },
    }
    send_mail_helper(booking_dict)
    # send_mail_helper(booking_dict, sms_options=sms_options)


@shared_task
def send_mail_to_tutor_on_closed_booking(booking_id, email=None):
    """Mail and sms sent to client to notify him to come and close the booking"""
    booking = models.Booking.objects.get(pk=booking_id)
    booking_dict = {
        "to": email or booking.get_tutor.email,
        "title": u"You have just earned \u20A6{}".format(booking.tutor_fee()),
        "template": "booking_marked_as_complete",
        "context": {
            "booking": {
                "tutor_fee": float(booking.tutor_fee()),
                "skill_display": booking.skill_display(),
                "user": {
                    "first_name": booking.user.first_name,
                    "last_name": booking.user.last_name,
                },
                "get_tutor": {
                    "first_name": booking.get_tutor.first_name,
                    "last_name": booking.get_tutor.last_name,
                },
            }
        },
    }
    send_mail_helper(booking_dict)


@shared_task
def send_mail_on_single_session_cancelled(session_id, email=None):
    """Mail and sms sent to tutor about a session that was cancelled"""
    booking = models.BookingSession.objects.get(pk=session_id).booking
    sms_options = {
        "sender": booking.get_tutor.primary_phone_no,
        "body": (
            "{} has just cancelled one or more sessions from the {} booking. "
            "Please check your email for full details. Tuteria"
        ).format(booking.user.first_name, booking.skill_display()),
        "receiver": str(booking.get_tutor.phone_number_details),
    }
    booking_dict = {
        "to": email or booking.get_tutor.email,
        "title": "Session Cancellation Notice",
        "template": "session_cancelled",
        "context": {
            "booking": {
                "skill_display": booking.skill_display(),
                "user": {
                    "first_name": booking.user.first_name,
                    "last_name": booking.user.last_name,
                },
                "get_tutor": {
                    "first_name": booking.get_tutor.first_name,
                    "last_name": booking.get_tutor.last_name,
                },
                "get_tutor_absolute_url": booking.get_tutor_absolute_url(),
            }
        },
    }
    send_mail_helper(booking_dict)
    # send_mail_helper(booking_dict, sms_options=sms_options)


@shared_task
def send_mail_on_booking_cancelled(booking_id, email=None):
    """Mail and sms sent to tutor to notify him about cancelled booking"""
    booking = models.Booking.objects.get(pk=booking_id)

    sms_options = {
        "sender": booking.get_tutor.phone_number_details,
        "body": (
            "{} has just cancelled the {} booking. Please check your email for full details. "
            "We apologize for this. Tuteria"
        ).format(booking.user.first_name, booking.skill_display()),
        "receiver": str(booking.get_tutor.phone_number_details),
    }
    context = {
        "booking": {
            "get_tutor": {
                "first_name": booking.get_tutor.first_name,
                "last_name": booking.get_tutor.last_name,
            },
            "get_tutor_absolute_url": booking.get_tutor_absolute_url(),
            "user": {
                "first_name": booking.user.first_name,
                "last_name": booking.user.last_name,
            },
            "skill_display": booking.skill_display(),
            "created": booking.created.isoformat(),
        }
    }
    booking_dict = {
        "to": email or booking.get_tutor.email,
        "title": "Booking Cancellation Notice",
        "template": "booking_cancelled",
        "context": context,
    }
    send_mail_helper(booking_dict)
    # send_mail_helper(booking_dict, sms_options=sms_options)


@shared_task
def send_mail_on_tutor_request_to_cancel_booking(booking_id, email=None):
    """Mail and sms sent to client to notify him about cancelled booking to be issued by the tutor"""
    booking = models.Booking.objects.get(pk=booking_id)
    sms_options = {
        "sender": booking.user.primary_phone_no,
        "body": (
            "{} requests your permission to cancel the {} booking, and left a reason. "
            "Pls visit tuteria.com/dashboard to confirm. We're sorry for this. Tuteria"
        ).format(booking.get_tutor.first_name, booking.skill_display()),
        "receiver": str(booking.user.primary_phone_no.number),
    }
    context = {
        "booking": {
            "user": {
                "first_name": booking.user.first_name,
                "last_name": booking.user.last_name,
            },
            "get_tutor": {
                "first_name": booking.get_tutor.first_name,
                "last_name": booking.get_tutor.last_name,
            },
            "skill_display": booking.skill_display(),
            "cancellation_message": booking.cancellation_message,
            "get_absolute_url": booking.get_absolute_url(),
        }
    }
    booking_dict = {
        "to": email or booking.get_tutor.email,
        "title": "Booking Cancellation Request",
        "template": "tutor_booking_cancel_request",
        "context": context,
    }
    send_mail_helper(booking_dict)
    # send_mail_helper(booking_dict, sms_options=sms_options)


@shared_task
def update_delivered_bookings_to_completed_after_3_days(days=1):
    count = 0
    for booking in models.Booking.objects.delivered():
        if booking.can_be_closed(days=days):
            booking.client_confirmed()
            count += 1
    print("Closed {} bookings".format(count))


@shared_task
def async_update_delivered_bookings_to_completed_after_3_days(days=1):
    count = 0
    for booking in models.Booking.objects.delivered():
        if booking.can_be_closed(days=days):
            booking.async_client_confirmed_admin()
            count += 1
    print("Closed {} bookings".format(count))


def send_mail_helper(
    booking,
    sms_options=None,
    backend="sendgrid_backend",
    from_mail="Tuteria <care@tuteria.com>",
    **kwargs
):
    email_and_sms_helper(
        booking, sms_options=sms_options, backend=backend, from_mail=from_mail, **kwargs
    )


def email_to_update_level(tutor, previous_level, level):
    context = {
        "tutor": {
            "first_name": tutor.first_name,
            "last_name": tutor.last_name,
            "profile": {"level": level},
        }
    }
    booking_dict = {"to": tutor.email, "template": "level_update", "context": context}
    if previous_level != level:
        if level == 1:
            booking_dict.update(title="Congratulations! You are now on Level 1!")
        if level == 2:
            booking_dict.update(title="You've been upgraded to Level 2!")
        if level == 3:
            booking_dict.update(title="Awesome! You're now a Role Model Tutor!")
        if level == 4:
            booking_dict.update(title="You're Officially a Tuteria Superstar!")
        if level > 1:
            send_mail_helper(booking_dict, backend="sendgrid_backend")


@shared_task
def send_mail_to_admin_on_bank_payment(booking_id):
    booking = models.Booking.objects.get(pk=booking_id)
    context = {
        "booking": booking,
        "site": Site.objects.get_current(),
        "tuteria_details": TuteriaDetail(),
    }
    user_details = booking.user
    booking_dict = {
        "to": "bank@tuteria.com",
        "title": "Bank Transfer Request for %s %s (%s)"
        % (user_details.first_name, user_details.last_name, user_details.email),
        "template": "bank_to_admin_request",
        "context": context,
    }
    send_mail_helper(booking_dict, backend=sendgrid_backend)


@shared_task
def update_levels_of_users():
    pass
    # from users.models import User

    # xx = User.objects.users_with_bookings()
    # for tutor in xx:
    #     previous_level = tutor.profile.level
    #     tutor.update_level()
    #     level = tutor.profile.level
    #     email_to_update_level(tutor, previous_level, level)
    # print("updated {} tutor's level today".format(xx.count()))


@shared_task
def booking_to_be_expired_soon():
    bookings = models.Booking.objects.active().get_booking_ending_soon()
    for booking in bookings:
        if booking.user.wallet.amount_available < booking.total_price:
            send_mail_to_tutor_on_booking_expiring(booking)
            send_mail_to_client_on_booking_expiring(booking)
        send_mail_to_admin_on_booking_expiring(booking)


def mail_to_be_sent_for_expiered_bookings_in_3_days(booking):
    sms_options = {
        "sender": booking.user.primary_phone_no,
        "body": (
            "Please be reminded that lessons with {} ends in 3 days. "
            "We'll call you for feedback, to know if we would continue for the next period."
        ).format(booking.get_tutor.first_name),
        "receiver": str(booking.user.primary_phone_no.number),
    }
    send_mail_helper(None, sms_options=sms_options)


@shared_task
def booking_to_be_expired_soon_in_3_days():
    bookings = models.Booking.objects.active().get_booking_ending_soon(days=3)
    for booking in bookings:
        mail_to_be_sent_for_expiered_bookings_in_3_days(booking)


def send_mail_to_admin_on_booking_expiring(booking):
    msg = EmailMultiAlternatives(
        "FollowUp: {} & {} Lessons ends in 6 days".format(
            booking.get_tutor.first_name, booking.user.first_name
        ),
        """ Tutor: {}, {}, {}<br> Client: {} {}, {}, {} <br> Booking ID: {} <br>
    End Date: {} PS: Follow up emails have been sent to both parties.""".format(
            booking.get_tutor.first_name,
            str(booking.get_tutor.primary_phone_no),
            booking.get_tutor.email,
            booking.user.first_name,
            booking.user.last_name,
            str(booking.user.primary_phone_no),
            booking.user.email,
            booking.order,
            booking.last_session,
        ),
        "Tuteria <care@tuteria.com>",
        ["care@tuteria.com"],
        connection=mailgun_backend,
    )
    msg.send()
    print("Message sent")


def send_mail_to_tutor_on_booking_expiring(booking, email=None):
    linkedin_url, twitter_url, facebook_url = get_social_urls(booking.get_tutor)
    context = {
        "booking": {
            "get_tutor": {
                "first_name": booking.get_tutor.first_name,
                "last_name": booking.get_tutor.last_name,
            },
            "user": {
                "first_name": booking.user.first_name,
                "last_name": booking.user.last_name,
            },
        },
        "linkedin_url": linkedin_url,
        "sender": {
            "get_referral_instance": {
                "offline_code": booking.get_tutor.get_referral_instance().offline_code
            }
        },
        "twitter_url": twitter_url,
        "facebook_url": facebook_url,
    }
    booking_dict = {
        "to": email or booking.get_tutor.email,
        "title": "Lessons with {} ends in 6 days".format(booking.user.first_name),
        "template": "tutor_booking_expiring",
        "context": context,
    }
    send_mail_helper(booking_dict)


def get_social_urls(user):
    from django.utils.http import urlquote
    from django.urls import reverse

    meta_title = u"Get ₦1,500 off your first lesson!"
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


def send_mail_to_client_on_booking_expiring(booking, email=None):
    user = booking.user
    linkedin_url, twitter_url, facebook_url = get_social_urls(user)
    context = {
        "booking": {
            "user": {
                "first_name": booking.user.first_name,
                "last_name": booking.user.last_name,
                "get_referral_instance": {
                    "offline_code": booking.user.get_referral_instance().offline_code
                },
            },
            "get_tutor": {
                "first_name": booking.get_tutor.first_name,
                "last_name": booking.get_tutor.last_name,
            },
            "tutor": {"profile": {"gender": booking.get_tutor.profile.gender}},
        },
        "sender": {
            "get_referral_instance": {
                "offline_code": booking.user.get_referral_instance().offline_code
            }
        },
        "linkedin_url": linkedin_url,
        "twitter_url": twitter_url,
        "facebook_url": facebook_url,
    }

    booking_dict = {
        "to": email or booking.user.email,
        "title": "Lessons with {} ends in 6 days".format(booking.get_tutor.first_name),
        "template": "client_booking_expiring",
        "context": context,
    }
    send_mail_helper(booking_dict)


@shared_task
def notify_admin_to_make_payment_to_tutor(email):
    msg = EmailMultiAlternatives(
        "Tutor Withdrawal notice {}".format(email),
        "Withdrawal Notice",
        "Tuteria <care@tuteria.com>",
        ["care@tuteria.com"],
        connection=sendgrid_backend,
    )
    msg.send()
    print("Message sent")


@shared_task
def send_email_to_notify_remaining_tutors_not_selected(bo):
    booking_order = models.Booking.objects.get(pk=bo)
    from connect_tutor.models import RequestPool

    other_users = RequestPool.objects.notify_other_tutors(booking_order)
    for applicant in other_users:
        # Todo send email to other applicants
        pass


@shared_task
def charge_client_again(booking_id, email=None):
    booking = models.Booking.objects.get(pk=booking_id)
    email = booking.user.email
    customer_code = booking.user.paystack_customer_code
    authorization_code = booking.user.wallet.authorization_code
    if customer_code and authorization_code:
        value = PayStack().recurrent_charge(
            dict(
                authorization_code=authorization_code,
                email=email,
                amount=booking.total_price * 100,
            )
        )
        logger.info(value)
        if not value:
            msg = EmailMultiAlternatives(
                "Failed Recurrent Billing for %s" % booking.user.email,
                "Failed Recurrent Billing for %s" % booking.user.email,
                "Tuteria <care@tuteria.com>",
                ["care@tuteria.com", "gbozee@gmail.com"],
                connection=sendgrid_backend,
            )
            msg.send()
            print("Message sent")
        if value:
            booking.wallet_transactions.update(amount_paid=booking.total_price)
            # send mail to user on payment made


@shared_task
def send_email_on_payment_delay_notice(ids=[], email=None):
    for id in ids:
        booking_dict = {
            "to": email or id,
            "title": "Delay in Payment",
            "template": "delayed_payments",
            "context": {},
        }
        send_mail_helper(
            booking_dict, sms_options=None, from_mail="Tuteria <care@tuteria.com>"
        )


@shared_task
def send_mail_to_clients_on_amount_owed(ids=None, email=None):
    from wallet.models import WalletTransaction

    if ids:
        debtors = (
            WalletTransaction.objects.transaction_not_paid()
            .filter(id__in=ids)
            .values_list("wallet__owner", flat=True)
        )
    else:
        debtors = WalletTransaction.objects.transaction_not_paid().values_list(
            "wallet__owner", flat=True
        )
    print(debtors)
    debtors = list(set(debtors))
    print(debtors)
    debtors = (
        models.Booking.objects.active()
        .filter(user_id__in=debtors)
        .order_by("user_id")
        .distinct("user_id")
    )
    # debtors = User.objects.filter(id__in=list(debtors))
    print(debtors)
    for x in debtors:
        # print(x.weeks_elapsed())
        # if x.weeks_elapsed() in [2, 4] or
        if ids is not None:
            x = x.user
            email_on_payment_reminder(x, email=email)


@shared_task
def new_email_on_payment_reminder(the_email=None, **x):
    from users.models import PhoneNumber

    tuteria_details = TuteriaDetail()
    booking_dict = {
        "to": the_email or x["email"],
        "title": "Lessons Payment Reminder",
        "template": "lesson-payment",
        "context": {
            "user": {"first_name": x["first_name"]},
            "wallet": {"total_amount_owing": x["total_owed"]},
        },
    }
    primary_number = PhoneNumber.objects.filter(owner__email=x["email"]).first()
    sms_options = {
        "sender": primary_number.number,
        "body": (
            "Hello {}, please be reminded to pay the outstanding"
            " lesson fee of N{}.Bank Details: GTB, Tuteria Limited, {}. Thanks"
        ).format(x["first_name"], x["total_owed"], tuteria_details.gt["account"]),
        "receiver": str(primary_number.number),
    }
    print("Lesson Payment Reminder")
    send_mail_helper(
        booking_dict, sms_options=sms_options, from_mail="Tuteria <care@tuteria.com>"
    )
    print("Lesson Payment Reminder Sent")


def email_on_payment_reminder(x, email=None):
    tuteria_details = TuteriaDetail()
    booking_dict = {
        "to": email or x.email,
        "title": "Lessons Payment Reminder",
        "template": "lesson-payment",
        "context": {
            "user": {"first_name": x.first_name},
            "wallet": {"total_amount_owing": x.wallet.total_amount_owing},
        },
    }
    sms_options = {
        "sender": x.primary_phone_no,
        "body": (
            "Hello {}, please be reminded to pay the outstanding"
            " lesson fee of N{}.Bank Details: GTB, Tuteria Limited, {}. Thanks"
        ).format(
            x.first_name, x.wallet.total_amount_owing, tuteria_details.gt["account"]
        ),
        "receiver": str(x.primary_phone_no.number),
    }
    print("Lesson Payment Reminder")
    send_mail_helper(
        booking_dict, sms_options=sms_options, from_mail="Tuteria <care@tuteria.com>"
    )
    print("Lesson Payment Reminder Sent")


@shared_task
def reminder_to_contact_clients():
    models.Booking.reminder_to_contact_clients()
