from __future__ import absolute_import
from allauth.socialaccount.models import SocialToken
from allauth.account.models import EmailAddress
import logging
import time
from allauth.utils import build_absolute_uri
from celery import shared_task
from datetime import datetime
from django.core import mail
from django.utils import timezone
from django.template import Context
from django.template.loader import get_template, render_to_string
from django.template import TemplateDoesNotExist
from django.urls import reverse
from django.db.models import IntegerField, When, Case, Sum
import requests
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import pytz
from django.conf import settings
from ..models import Location, UserProfile, User
from ..social_networks import FacebookProvider
from config.utils import days_elapsed, PayStack, post_to_cdn_service, send_mail_helper
from gateway_client.email import email_and_sms_helper
from config.mail_servers import mandrill_backend, mailgun_backend
from django.contrib.sites.models import Site
from django.core.mail import EmailMultiAlternatives

try:
    from django.utils.encoding import force_text
except ImportError:
    from django.utils.encoding import force_unicode as force_text

logger = logging.getLogger(__name__)


def format_date(field):
    if field:
        return field.strftime("%B %d, %y")
    return ""


@shared_task
def post_to_email_list(pk, kind="verified-tutor"):
    from tutor_management.models import TutorApplicantTrack
    from wallet.models import WalletTransaction

    _tutor = User.objects.get(pk=pk)
    if kind == "tutor-applicant":
        _tutor: TutorApplicantTrack = TutorApplicantTrack.objects.get(pk=pk)
    if kind == "tutor-applicant":
        payload = {
            "first_name": _tutor.first_name,
            "email": _tutor.personal_info.get("email"),
            "country": str(_tutor.country) or "ng",
            "state": _tutor.personal_info.get("state"),
            "last_name": _tutor.last_name,
            "last_login_date": format_date(_tutor.last_login),
            "date_signed_up": format_date(_tutor.date_joined),
            "gender": _tutor.personal_info.get("gender"),
            "application_step": _tutor.application_step,
            "current_step": _tutor.current_step,
            "completed_steps": [
                key
                for key, value in _tutor.determine_completed_steps().items()
                if value
            ],
        }
    else:
        payload = {
            "first_name": _tutor.first_name,
            "email": _tutor.email,
            "country": str(_tutor.country),
            "state": _tutor.revamp_data("personalInfo", "state"),
            "last_name": _tutor.last_name,
            "gender": _tutor.revamp_data("personalInfo", "gender"),
            "application_step": "select-subjects",
            "current_step": "select-subject",
            "application_status": _tutor.profile.get_application_status_display(),
            "active_subjects": [x.skill.name for x in _tutor.active_skills],
            "pending_subjects": [x.skill.name for x in _tutor.pending_skills],
            "modification_subjects": [
                x.skill.name for x in _tutor.require_modification_skills
            ],
            "denied_subjects": [x.skill.name for x in _tutor.denied_skills],
            "suspended_subjects": [x.skill.name for x in _tutor.suspended_skills],
            "no_of_bookings": str(_tutor.t_bookings.count()),
            "amount_earned": str(
                WalletTransaction.objects.filter(wallet__owner=_tutor.pk)
                .tutor_earning()
                .aggregate_amount()["t_amount"]
            ),
            "last_login_date": format_date(_tutor.last_login),
            "date_signed_up": format_date(_tutor.date_joined),
            "dob": format_date(datetime.strptime(
                _tutor.revamp_data("personalInfo", "dateOfBirth"), "%Y-%m-%d"
            )),
            "date_verified": format_date(_tutor.profile.date_approved),
            "tax_id": _tutor.tax_id,
        }
    post_to_cdn_service("/sendy/api", {"action": kind, "data": payload})


@shared_task
def generate_coordinates_for_address():
    locations = Location.objects.using("replica").all()
    for location in locations:
        location.save(using="default")
        print("%s %s" % (location.longitude, location.latitude))
    print("Coordinate complete")


@shared_task
def populate_vicinity_for_address(refresh=False, distances=False):
    locations = Location.objects.using("replica").all()
    if refresh:
        for location in locations:
            location.vicinity = None
            location.save(using="default")
    for location in locations:
        if location.vicinity is None:
            try:
                location.get_vicinity(distances=distances)
            except GeocoderTimedOut:
                location.get_vicinity(distances=distances)
    print("Vicinity population complete")


@shared_task
def upgrade_token(provider, token_id):
    social_token = SocialToken.objects.get(id=token_id)
    if provider == "facebook":
        fbb = FacebookProvider()
        fbb.upgrade_token(social_token)
        print("Successful Upgrade")


@shared_task
def populate_vicinity(location_id):
    location = Location.objects.filter(pk=location_id).first()
    if location:
        if not location.latitude:
            try:
                location.populate_lat_lng()
            except GeocoderTimedOut:
                time.sleep(2)
                location.populate_lat_lng()
            except GeocoderServiceError:
                time.sleep(2)
                location.populate_lat_lng()


@shared_task
def email_confirmation_signup(email, context):

    booking = {
        "to": email,
        "context": context,
        "template": "email_confirmation_signup",
        "title": "Please confirm your email address",
    }
    if "password_reset_url" in context:
        booking.update(
            template="password_reset_key", title="Please reset your password"
        )
    email_and_sms_helper(
        booking, backend="sendgrid_backend", from_mail="Tuteria <automated@tuteria.com>"
    )


@shared_task
def welcome_email(email):
    user = User.objects.get(email=email)
    context = {"user": {"first_name": user.first_name, "last_name": user.last_name}}
    # text = render_to_string("emails/tutor_welcome_email.txt",context)
    booking = {
        "to": user.email,
        "template": "welcome_email",
        "context": context,
        "title": "Welcome to Tuteria!",
    }
    email_and_sms_helper(
        booking, backend="mailgun_backend", from_mail="Tuteria <info@tuteria.com>"
    )
    print("Message sent!")


@shared_task
def email_to_all_verified_tutors(email):

    from django.contrib.auth import authenticate

    user = User.objects.get(email=email)
    password = user.first_name.lower() + user.last_name.lower()
    user1 = authenticate(email=user.email, password=password)
    if user1 is not None:
        same_password = True
    else:
        same_password = False
    context = {
        "user": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        },
        "same_password": same_password,
        "password": password,
    }
    booking = {
        "to": email,
        "template": "final_subject_notice",
        "title": "Getting Clients on Tuteria",
        "context": context,
    }
    from_mail = "Tuteria <info@tuteria.com>"

    email_and_sms_helper(booking, from_mail=from_mail)
    print("Message sent!")


@shared_task
def send_text_message(ids, body):
    users = User.objects.filter(id__in=ids)
    for r in users:
        sms_options = {
            "sender": str(r.primary_phone_no),
            "body": "%s" % (body),
            "receiver": str(r.primary_phone_no),
        }
        send_mail_helper(sms_options=sms_options)


def format_email_subject(self, subject):
    return force_text(subject)


@shared_task
def email_to_update_social_media(email):
    from ..context_processors import TuteriaDetail

    user = User.objects.get(email=email)
    context = {"user": {"first_name": user.first_name, "last_name": user.last_name}}
    booking = {
        "to": user.email,
        "template": "tutor_update_media",
        "title": "You're missing out on getting clients!",
        "context": context,
    }
    email_and_sms_helper(booking, from_mail="Tuteria <info@tuteria.com>")
    print("Message sent!")


@shared_task
def re_upload_profile_pic(user_id):
    user = User.objects.get(pk=user_id)
    context = {"user": {"first_name": user.first_name}}
    booking = {
        "to": user.email,
        "template": "re_upload_profile_pic",
        "title": "Please re-upload profile picture",
        "context": context,
    }
    email_and_sms_helper(
        booking, backend="mandrill_backend", from_mail="Tuteria <help@tuteria.com>"
    )

    print("Message sent!")


@shared_task
def email_to_create_subject(email):
    user = User.objects.get(email=email)
    context = {"user": {"first_name": user.first_name, "last_name": user.last_name}}
    booking = {
        "to": email,
        "template": "tutor_create_subject",
        "title": "You are missing out on getting clients.",
        "context": context,
    }
    email_and_sms_helper(booking, from_mail="Tuteria <info@tuteria.com>")
    print("Message sent!")


@shared_task
def send_email_to_users_without_skill():
    for u in User.objects.annotate(
        active_skills=Sum(
            Case(When(tutorskill__status=2, then=1), output_field=IntegerField())
        )
    ).filter(active_skills=None):
        email_to_create_subject(u.email)


@shared_task
def verify_email_notification(user_ids, email=None):
    users = User.objects.filter(id__in=user_ids)
    for user in users:
        send_one_email(user, email=email)


def send_one_email(user, email=None):
    tt = email or user.email
    email_address = EmailAddress.objects.filter(email=tt).first()
    if email_address:
        email_address.send_confirmation()
        print("Message sent!")


@shared_task
def potentital_tutors_not_applied(email=None):
    users = User.objects.potentital_tutors_not_applied()
    for user in users:
        send_second_email(user, email=None)


def send_second_email(user, email=None):
    context = {"user": {"first_name": user.first_name, "last_name": user.last_name}}
    booking = {
        "to": user.email,
        "template": "become_a_tutor",
        "title": "Complete your tutor application",
        "context": context,
    }
    email_and_sms_helper(booking, from_mail="Tuteria <info@tuteria.com>")
    print("Message sent!")


@shared_task
def create_paystack_customer(user_id):
    user = User.objects.get(pk=user_id)
    if not user.paystack_customer_code:
        data = dict(
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=str(user.primary_phone_no),
        )
        user.paystack_customer_code = PayStack().create_customer(data)
        user.save()


@shared_task
def drip_messages_to_old_stuck_users():
    """
    Emails to be sent to users who are stuck in the registration
    process. Also determines new users from very old users
    """
    queryset = User.objects.stuck_potential_tutors()
    for user in queryset:
        if user.drip_counter == 0:
            if 6 <= user.hours_elapsed_from_signup <= 10:
                first_email_blast(user)
            else:
                first_email_blast(user)
        if user.drip_counter == 1:
            if 30 <= user.hours_elapsed_from_signup <= 71:
                second_email_blast(user, 30)
            else:
                second_email_blast(user)
        if user.drip_counter == 2:
            if 72 <= user.hours_elapsed_from_signup <= 143:
                third_email_blast(user, 72)
            else:
                third_email_blast(user)
        if user.drip_counter == 3:
            if 144 <= user.hours_elapsed_from_signup:
                fourth_email_blast(user, 144, sms=True)
            else:
                fourth_email_blast(user)


@shared_task
def drip_messages_to_tutors_with_no_subjects():
    """
    Emails to be sent to tutors who haven't created
    subjects.
    """
    queryset = User.objects.tutors_with_no_subjects()
    for user in queryset:
        if user.drip_counter == 0:
            if user.profile.date_approved:
                if 6 <= user.hours_from_being_verified <= 10:
                    first_email_blast(user, email_type="tutor")
            else:
                first_email_blast(user, email_type="tutor")
        if user.drip_counter == 1:
            if 30 <= user.hours_from_being_verified <= 71:
                second_email_blast(user, 30, email_type="tutor")
            else:
                second_email_blast(user, email_type="tutor")
        if user.drip_counter == 2:
            if 72 <= user.hours_from_being_verified <= 143:
                third_email_blast(user, 72, email_type="tutor")
            else:
                third_email_blast(user, email_type="tutor")
        if user.drip_counter == 3:
            if 144 <= user.hours_from_being_verified:
                fourth_email_blast(user, 144, sms=True, email_type="tutor")
            else:
                fourth_email_blast(user, email_type="tutor")


def first_email_blast(user, email_type="user"):
    email_drip_to_tutor(user, number=1, email_type=email_type)
    User.objects.filter(pk=user.pk).update(drip_date=timezone.now(), drip_counter=1)


def second_email_blast(user, date_elapsed=3 * 24, email_type="user"):
    if days_elapsed(user.drip_date, hours=date_elapsed):
        email_drip_to_tutor(user, number=2, email_type=email_type)
        User.objects.filter(pk=user.pk).update(drip_date=timezone.now(), drip_counter=2)


def third_email_blast(user, date_elapsed=8 * 24, email_type="user"):
    if days_elapsed(user.drip_date, hours=date_elapsed):
        email_drip_to_tutor(user, number=3, email_type=email_type)
        User.objects.filter(pk=user.pk).update(drip_date=timezone.now(), drip_counter=3)


def fourth_email_blast(user, date_elapsed=14 * 24, sms=False, email_type="user"):
    if days_elapsed(user.drip_date, hours=date_elapsed):
        email_drip_to_tutor(user, number=4, sms=sms, email_type=email_type)
        User.objects.filter(pk=user.pk).update(drip_date=timezone.now(), drip_counter=4)


def email_drip_to_tutor(user, number=1, email=None, sms=False, email_type="user"):
    from users.context_processors import TuteriaDetail

    total_amount_earned = float(round(user.wallet.total_amount_earned_by_tutors, 0))
    not_interested_url = "http://www.tuteria.com{}".format(
        reverse("users:not_interested_in_tutoring")
    )
    amount_earned_last_week = round(user.wallet.amount_earned_last_week_by_tutors, 0)
    context = {
        "user": {"first_name": user.first_name, "last_name": user.last_name},
        "amount_earned_last_week": amount_earned_last_week,
        "total_amount_earned": total_amount_earned,
        "not_interested_url": not_interested_url,
    }
    first_drip = {
        "title": "Complete your application today!",
        "to": email or user.email,
        "template": "tutor-drip-1",
        "context": context,
    }
    if email_type != "user":
        first_drip.update(
            {
                "template": "subject-drip-1",
                "title": "Add your subjects now to start receiving clients",
            }
        )
    second_drip = {
        "to": email or user.email,
        "title": "You are losing money on Tuteria!",
        "template": "tutor-drip-2",
        "context": context,
    }
    if email_type != "user":
        second_drip.update(
            {"template": "subject-drip-2", "title": "You are losing money on Tuteria!"}
        )
    third_drip = {
        "to": email or user.email,
        "title": "How to get your first client",
        "template": "tutor-drip-3",
        "context": context,
    }
    if email_type != "user":
        third_drip.update(
            {
                "template": "subject-drip-3",
                "title": "This is how to get your first client",
            }
        )
    fourth_drip = {
        "to": email or user.email,
        "title": "Finish your application now!",
        "template": "tutor-drip-4",
        "context": context,
    }
    if email_type != "user":
        fourth_drip.update(
            {"template": "subject-drip-4", "title": "Add a Subject Now!"}
        )
    from_mail = "Tuteria <automated@tuteria.com>"
    if number == 1:
        email_and_sms_helper(booking=first_drip, from_mail=from_mail)
    if number == 2:
        email_and_sms_helper(booking=second_drip, from_mail=from_mail)
    if number == 3:
        email_and_sms_helper(booking=third_drip, from_mail=from_mail)
    if number == 4:
        params = dict(booking=fourth_drip, from_mail=from_mail)
        if sms and email_type == "user" and user.primary_phone_no:
            # fourth_sms = {
            #     'sender':user.primary_phone_no,
            #     'body':('{}, complete your application on Tuteria now'
            #         ' & earn N50k-N100k/month as a private tutor. '
            #         'Click this link to login & finish up now: bit.ly/finishup').format(user.first_name),
            #     'receiver':str(user.primary_phone_no.number)
            # }
            # params.update(sms_options=fourth_sms)
            pass
        email_and_sms_helper(**params)
