from __future__ import absolute_import

import logging
from multiprocessing.pool import ThreadPool
from django.contrib.humanize.templatetags.humanize import intcomma
from celery import shared_task
from config.mail_servers import sendgrid_backend

# from config.utils import email_and_sms_helper
from gateway_client.email import email_and_sms_helper
from django.contrib.sites.models import Site
from users.context_processors import TuteriaDetail
from users.location_api import DistanceCalculator
from users.models import Location
from users.models import User, UserProfile

from ..models import EventProxy, OccurrenceProxy, PhishyUser, Guarantor, Schedule

logger = logging.getLogger(__name__)


@shared_task
def add(x, y):
    return x + y


@shared_task
def mul(x, y):
    return x * y


@shared_task
def xsum(numbers):
    return sum(numbers)


# periodic task
@shared_task
def update_denied_user_status(timeout=90):
    users = UserProfile.objects.filter(application_status=4).all()
    for user in users:
        user.update_status_based_on_timer(timeout=timeout)


@shared_task
def tutor_application_mail(status):
    print("Send mail to user on status")
    pass


@shared_task
def check_for_duplicate_uses():
    for user in User.objects.all():
        check_if_user_is_phisy(user.pk)


@shared_task
def check_if_user_is_phisy(user_id):
    me = User.objects.filter(pk=user_id).first()
    exists = PhishyUser.objects.filter(user=me).exists()
    if exists is False:
        if hasattr(me, "profile"):
            if me.profile.dob:
                dob = me.profile.dob
                exists = (
                    User.objects.filter(
                        profile__dob__year=dob.year,
                        profile__dob__month=dob.month,
                        profile__dob__day=dob.day,
                    )
                    .exclude(pk=user_id)
                    .exclude(profile__dob=None)
                    .filter(last_name=me.last_name)
                    .values_list("pk", flat=True)
                )
                if len(exists) > 0:
                    bb = [PhishyUser(user_id=a) for a in exists]
                    PhishyUser.objects.bulk_create(bb)


@shared_task
def bulk_distance_calculator():
    locations = Location.objects.without_distances()
    for loc in locations:
        distance_calculator(loc.user, loc.id)
        print("%s distance calculated" % loc.user.first_name)
    print("distance uploading completed")


@shared_task
def distance_calculator(email, address_id=None):
    # location
    user = User.objects.get(email=email)
    if address_id:
        address = user.location_set.get(id=address_id)
    else:
        address = user.location_set.first()
    if address.vicinity:
        return
    location = address.get_coordinate()

    pool = ThreadPool(processes=1)
    async_5km = pool.apply_async(DistanceCalculator, (location,))
    re5km = DistanceCalculator(location)
    print("distances less than 5000 fetched")
    # kwarg10 = dict(distance=10000)
    # async_10km = pool.apply_async(DistanceCalculator,(location,),kwarg10)
    re10km = DistanceCalculator(location, distance=10000)
    print("distances between 5000 and 10000 fetched")
    # kwarg15 = dict(distance=15000)
    # async_15km = pool.apply_async(DistanceCalculator,(location,),kwarg15)
    re15km = DistanceCalculator(location, distance=15000)
    print("distances between 10000 and 15000 fetched")
    # kwarg20 = dict(distance=20000)
    # async_20km = pool.apply_async(DistanceCalculator,(location,),kwarg20)
    re20km = DistanceCalculator(location, distance=20000)
    print("distances between 15000 and 20000 fetched")
    # kwarg25 = dict(distance=25000)
    # async_25km = pool.apply_async(DistanceCalculator,(location,),kwarg25)
    re25km = DistanceCalculator(location, distance=25000)
    print("distances greater than 20000 fetched")
    # re5km = async_5km.get()
    # print("distances less than 5000 fetched")
    # re10km = async_10km.get()
    # print("distances between 5000 and 10000 fetched")
    # re15km = async_15km.get()
    # print("distances between 10000 and 15000 fetched")
    # re20km = async_20km.get()
    # print("distances between 15000 and 20000 fetched")
    # re25km = async_25km.get()
    # print("distances greater than 20000 fetched")
    result = {
        "near": re5km.results(),
        "not far": re10km.results(),
        "quite far": re15km.results(),
        "far": re20km.results(),
        "very far": re25km.results(),
    }
    address.distances = result
    address.save()
    return result


@shared_task
def send_mail_to_marked_as_verified_tutors():
    for tutor in UserProfile.objects.marked_as_verified():
        tutor.application_status = UserProfile.VERIFIED
        tutor.save()
        # send mail
        send_mail_async.delay(
            "verified", "You have been verified as a tutor", profile_id=tutor.id
        )
        print("Mail sent to verified user %s" % tutor.user)
    print("Email sending complete")


@shared_task
def notify_tutor_to_update_curriculum(username, email):
    context = {"user": {"first_name": username}}
    booking_dict = {
        "to": email,
        "context": context,
        "template": "update_curriculum_email",
        "title": "Please update the information on your curriculum column",
    }
    email_and_sms_helper(booking_dict, backend="mailgun_backend")


@shared_task
def tutor_to_update_price(first_name, email,slug):
    context = {
        "first_name": first_name,
        "link_1": f"https://www.tuteria.com/api/tutors/price-redirect?slug={slug}",
        "link_2": f"http://tutor-search.tuteria.com:3007/api/tutors/price-redirect?slug={slug}",
    }
    booking_dict = {
        "to": email,
        "context": context,
        "template": "new-price-update",
        "title": "Important Update to Your Pricing",
    }
    email_and_sms_helper(
        booking_dict,
        backend="sendgrid_backend",
        from_mail="Godwin (CEO, Tuteria) <account@tuteria.com>",
    )


@shared_task
def sms_to_tutors_to_apply(user_id, request_pk):
    from external.models import BaseRequestTutor

    tutor = User.objects.get(pk=user_id)
    r = BaseRequestTutor.objects.get(pk=request_pk)
    t = TuteriaDetail()
    sms_options = {
        "sender": tutor.first_name,
        "body": "Tuteria! NEW client at {} from N{}/hr."
        "Pls review Now if interested. www.tuteria.com{} or text {}".format(
            r.vicinity, r.per_hour(), r.job_absolute_url(), t.phone_number
        ),
        "receiver": str(tutor.primary_phone_no.number),
    }
    email_and_sms_helper(sms_options=sms_options)


@shared_task
def sms_to_create_subjects(user_id):
    tutor = User.objects.get(pk=user_id)
    sms_options = {
        "sender": tutor.first_name,
        "body": "Tuteria: {}, log into ur account now & add subjects. Tutors have earned over N{} & you're left out. Go here now: www.tuteria.com/subjects/new".format(
            tutor.first_name,
            intcomma(round(tutor.wallet.total_amount_earned_by_tutors, 2), False),
        ),
        "receiver": str(tutor.primary_phone_no.number),
    }
    email_and_sms_helper(None, sms_options=sms_options)


@shared_task
def email_to_verified_tutor(user_id, status=True, email=None, phone_number=None):
    tutor = User.objects.get(pk=user_id)
    sms_options = None
    if status and (phone_number or tutor.primary_phone_no):
        sms_options = {
            "sender": status,
            "body": "Hello {}! You have been approved to tutor with Tuteria. Go to {} now to start adding your subjects and prices.".format(
                tutor.first_name, "www.tuteria.com/subjects"
            ),
            "receiver": phone_number or str(tutor.primary_phone_no.number),
        }

    context = {"user": {"first_name": tutor.first_name, "last_name": tutor.last_name}}
    booking_dict = {"to": email or tutor.email, "context": context}
    if status:
        booking_dict.update(
            template="successful_application",
            title="Congrats! Your application was approved",
        )
    else:
        booking_dict.update(
            template="unsuccessful_application", title="Your Application with Tuteria"
        )
    email_and_sms_helper(
        booking_dict, sms_options=sms_options, backend="sendgrid_backend"
    )


@shared_task
def reactivate_valid_denied_users():
    for tutor in UserProfile.objects.ninety_days_passed_users():
        tutor.application_status = UserProfile.NOT_APPLIED
        tutor.date_denied = None
        tutor.save()

        print("Mail sent to denied user %s" % tutor.user)
    print("Email sending complete")


@shared_task
def update_location_model(location_id):
    location = Location.objects.get(pk=location_id)
    location.update_model_fields()


@shared_task
def remove_occurrences_that_have_expired():
    OccurrenceProxy.actions.remove_occurrences_that_have_expired()
    # now = timezone.now()
    # Occurrence.objects.filter(end__lt=now).delete()


@shared_task
def send_email_blast_to_update_calendar():
    for schedule in Schedule.objects.month_ago():
        send_calendar_mail(schedule)
    print("Completed")


def send_calendar_mail(schedule):
    context = {
        "schedule": {
            "tutor": {
                "first_name": schedule.tutor.first_name,
                "last_name": schedule.tutor.last_name,
            }
        }
    }
    booking_dict = {
        "to": schedule.tutor.email,
        "context": context,
        "template": "update_calendar_notice",
        "title": "Please update your calendar",
    }
    email_and_sms_helper(booking_dict, backend="sendgrid_backend")


@shared_task
def remove_events_that_have_expired():
    # now = timezone.now()
    EventProxy.actions.remove_expired_events()
    # Event.objects.filter(Q(end__lt=now, end_recurring_period=None) |
    # Q(end_recurring_period__lt=now)).delete()


# def email_and_sms_helper(booking, sms_options=None):
#     if sms_options:
#         backend = TwilioRestClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
#         if sms_options['sender']:
#             message = backend.messages.create(
#                 body=sms_options['body'],
#                 # Message body, if any
#                 to=sms_options['receiver'],
#                 # from_="+15105551234",
#                 from_=settings.TWILIO_DEFAULT_CALLERID,
#             )
#             print(message.sid)
#             logger.info(message.sid)
#     text = render_to_string("emails/{}.txt".format(booking['template']), booking['context'])
#     html = render_to_string("emails/{}.html".format(booking['template']), booking['context'])
#     from_mail = "Tuteria <automated@tuteria.com>"
#     msg = EmailMultiAlternatives(booking['title'], text, from_mail, [booking['to']],
#                                  backend=sendgrid_backend)
#     msg.attach_alternative(html, "text/html")
#     msg.send()
#     print("Message sent!")


@shared_task
def notification_on_guarantor_delete(pk, email=None):
    q = Guarantor.objects.get(pk=pk)
    context = {
        "instance": {
            "tutor": {"first_name": q.tutor.first_name, "last_name": q.tutor.last_name},
            "first_name": q.first_name,
            "last_name": q.last_name,
        }
    }
    booking_dict = {
        "to": email or q.tutor.email,
        "context": context,
        "template": "guarantor_delete_notice",
        "title": "Your guarantor was not approved",
    }
    email_and_sms_helper(booking_dict, backend="sendgrid_backend")
    q.delete()


@shared_task
def verify_id_to_new_tutors(pk, verfiy_type=True, email=None):
    x = User.objects.get(pk=pk)
    context = {"user": {"first_name": x.first_name, "last_name": x.last_name}}
    booking_dict = {"to": email or x.email, "context": context}
    if verfiy_type:
        booking_dict.update(
            {
                "template": "reupload_id",
                "title": "Please verify your ID to receive clients",
            }
        )
    else:
        booking_dict.update(
            {"template": "reupload_image", "title": "Why we can't send you clients yet"}
        )
    email_and_sms_helper(booking_dict, backend="sendgrid_backend")


@shared_task
def action_after_approval(pks, status):
    for o in UserProfile.objects.filter(pk__in=pks):
        UserProfile.mark_as_verified(o, status)


@shared_task
def deduct_writing_fee_task(ids, amount=5000):
    from users.models import User

    for ww in User.objects.filter(pk__in=ids):
        ww.wallet.deduct_writing_fee(amount)
        context = {"user": {"first_name": ww.first_name, "last_name": ww.last_name}}
        booking_dict = {"to": ww.email, "context": context}
        booking_dict.update(
            {"template": "writing-deduction-notice", "title": "Writing Fee Charge"}
        )
        email_and_sms_helper(booking_dict, backend="mailgun")
