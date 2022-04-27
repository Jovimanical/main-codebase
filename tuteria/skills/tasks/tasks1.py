from __future__ import absolute_import
import logging
from multiprocessing import Process
from functools import wraps

from celery import shared_task
from django.contrib.sites.models import Site
from django.core.mail import EmailMultiAlternatives
from django.db.models import Count
from django.utils import timezone
from config.mail_servers import mandrill_backend, sendgrid_backend, mailgun_backend
from users.context_processors import TuteriaDetail

# from config.utils import email_and_sms_helper
from gateway_client.email import email_and_sms_helper
from bookings.models import Booking
from ..models import TutorSkill
from users.models import User
from ..models import TutorSkill
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def run_async(func):
    """
    run_async(func)
        function decorator, intended to make "func" run in a separate
        thread (asynchronously).
        Returns the created Thread object

        E.g.:
        @run_async
        def task1():
            do_something

        @run_async
        def task2():
            do_something_too

        t1 = task1()
        t2 = task2()
        ...
        t1.join()
        t2.join()
    """

    @wraps(func)
    def async_func(*args, **kwargs):
        func_hl = Process(target=func, args=args, kwargs=kwargs)
        func_hl.start()
        return func_hl

    return async_func


@shared_task
def update_tutor_calendar(booking_id):
    booking = Booking.objects.get(pk=booking_id)
    tutor = booking.ts.tutor
    string = lambda x: "Tutor session for {} on {}".format(
        booking.user, x.start.strftime("%d/%b/%Y")
    )
    for session in booking.bookingsession_set.all():
        tutor.one_time_booking_event(
            title=string(session), start_time=session.start, end_time=session.end
        )
    print("Updated booking schedule for %s" % tutor.first_name)


@run_async
def upload_form(certificate_form):
    for certificate in certificate_form.forms:
        logger.info(certificate)
        if certificate.cleaned_data.get("award_name", None):
            certificate.save()
            logger.info("Certificate Saved")


@run_async
def upload_media(media_form):
    for media in media_form.forms:
        logger.info(media)
        if media.cleaned_data.get("image", None):
            media.save()
            logger.info("Exhibitions Saved")


@run_async
def save_skill_form(form):
    logger.info(form)
    form.save()


@shared_task
def tutorskill_to_be_retaken(email=None):
    v = (
        TutorSkill.objects.failed_skills_not_completed()
        .values_list("tutor_id", flat=True)
        .distinct("tutor_id")
    )
    for tutor in v:
        send_mail_to_retake_test.delay(tutor, email=email)


@shared_task
def to_be_retaken():
    failed_tests = TutorSkill.objects.failed_skills_not_completed().values_list(
        "pk", flat=True
    )
    return send_email_to_retake_and_delete(failed_tests)


@shared_task
def send_email_to_retake_and_delete(ts_ids, email=None):
    tutors = (
        TutorSkill.objects.filter(pk__in=ts_ids)
        .values_list("tutor_id", flat=True)
        .distinct("tutor_id")
    )
    for tutor in tutors:
        send_mail_to_retake_test(tutor, email=email)


def send_mail_helper(
    booking,
    sms_options=None,
    backend=mandrill_backend,
    from_mail="Tuteria <info@tuteria.com>",
):
    email_and_sms_helper(
        booking, sms_options=sms_options, backend=backend, from_mail=from_mail
    )


@shared_task
def send_mail_to_retake_test(tutor_id, email=None):
    v = User.objects.get(pk=tutor_id)
    tutorskills = v.tutorskill_set.failed_skills_not_completed()
    context = {
        "user": {
            "first_name": v.first_name,
            "last_name": v.last_name,
            "tutorskill_set": {
                "failed_skills_not_completed": [
                    {"skill": {"name": x}}
                    for x in tutorskills.values_list("skill__name", flat=True)
                ]
            },
        }
    }
    booking_dict = {
        "to": email or v.email,
        "title": "Please Retake Subject Test",
        "template": "retake_test",
        "context": context,
    }
    send_mail_helper(booking_dict, backend="mailgun_backend")
    # import pdb
    # pdb.set_trace()
    v.tutorskill_set.failed_skills_not_completed().delete()


@shared_task
def upload_exhibition_or_certificate(option, ts, email=None):
    tutorskills = TutorSkill.objects.filter(pk__in=ts).all()
    for tutorskill in tutorskills:
        exhibition_email(tutorskill, option, email=email)


@shared_task
def exhibition_email(tutorskill, option, email=None):
    context = {
        "ts": {
            "tutor": {
                "first_name": tutorskill.tutor.first_name,
                "last_name": tutorskill.tutor.last_name,
            },
            "skill": {"name": tutorskill.skill.name, "slug": tutorskill.skill.slug},
        }
    }
    booking_dict = {"to": email or tutorskill.tutor.email, "context": context}
    if option == "exhibit":
        booking_dict.update(
            {
                "title": "Please upload exhibits for {}".format(tutorskill.skill.name),
                "template": "upload_exhibit",
            }
        )
    if option == "certificate":
        booking_dict.update(
            {
                "title": "Please upload a certification for {}".format(
                    tutorskill.skill.name
                ),
                "template": "upload_certificate",
            }
        )
    send_mail_helper(booking_dict, backend="mandrill_backend")


@shared_task
def requires_modification_email(email=None):
    users_ids = TutorSkill.objects.require_modification().values_list(
        "tutor_id", flat=True
    )
    users = User.objects.filter(id__in=users_ids).all()
    for x in users:
        single_mail(x, email=email)


def single_mail(tutor, email=None):
    tutorskills = tutor.tutorskill_set.require_modification()

    data = {
        "first_name": tutor.first_name,
        "last_name": tutor.last_name,
        "tutorskill_set": {
            "require_modification": [
                dict(skill=dict(name=x))
                for x in tutorskills.values_list("skill__name", flat=True)
            ]
        },
    }

    context = {"user": data}
    booking_dict = {
        "to": email or tutor.email,
        "context": context,
        "title": "Please review your subjects",
        "template": "requires_modification_email",
    }
    send_mail_helper(booking_dict, backend="mandrill_backend")


@shared_task
def email_to_take_quiz(pk, email=None):
    user = User.objects.get(pk=pk)
    user_details = {"first_name": user.first_name, "last_name": user.last_name}
    subjects = user.skills_with_quiz_not_taken()
    ss = list(subjects.values_list("skill__name", flat=True))
    context = {"user": user_details, "ss": ss}
    booking_dict = {
        "to": email or user.email,
        "context": context,
        "title": "You need to take a test urgently",
        "template": "take_quiz",
    }
    TutorSkill.objects.filter(
        id__in=list(subjects.values_list("id", flat=True))
    ).update(modified=timezone.now())
    send_mail_helper(booking_dict, backend="mandrill_backend")


@shared_task
def email_to_modify_skill(pk, email=None, notice_24_hour=False):
    tutor_skill = TutorSkill.objects.get(pk=pk)
    user = tutor_skill.tutor
    user_details = {"first_name": user.first_name, "last_name": user.last_name}
    subject = tutor_skill.skill.name
    context = {"user": user_details, "subject": subject}
    tutor_skill_dict = {
        "to": email or user.email,
        "context": context,
    }
    if notice_24_hour:
        tutor_skill_dict.update(
            {
                "title": "Profile Deactivation in few hours.",
                "template": "tutor_skill_require_modification_in_24_hour",
            }
        )
        from_mail = "Tuteria <digest@tuteria.com>"
    else:
        tutor_skill_dict.update(
            {
                "title": f"You need to modify your subject ({subject})",
                "template": "tutor_skill_require_modification",
            }
        )
        from_mail = "Tuteria <help@tuteria.com>"
    send_mail_helper(
        tutor_skill_dict,
        backend="mandrill_backend",
        from_mail=from_mail,
    )


@shared_task
def email_to_populate_skill_content(pk, email=None):
    tutor_skill = TutorSkill.objects.get(pk=pk)
    user = tutor_skill.tutor
    user_details = {"first_name": user.first_name, "last_name": user.last_name}
    subject = tutor_skill.skill.name
    context = {"user": user_details, "subject": subject}
    tutor_skill_dict = {
        "to": email or user.email,
        "context": context,
    }
    tutor_skill_dict.update(
        {
            "title": "Please submit your experience",
            "template": "reminder_to_populate_skill_content",
        }
    )
    from_mail = "Tuteria <digest@tuteria.com>"
    send_mail_helper(
        tutor_skill_dict,
        backend="mandrill_backend",
        from_mail=from_mail,
    )


@shared_task
def email_on_decision_taken_on_subject(pk, email=None, approved=False):
    tutor_skill = TutorSkill.objects.get(pk=pk)
    user = tutor_skill.tutor
    user_details = {"first_name": user.first_name, "last_name": user.last_name}
    subject = tutor_skill.skill.name
    context = {"user": user_details, "subject": subject}
    tutor_skill_dict = {
        "to": email or user.email,
        "context": context,
    }

    if approved:
        tutor_skill_dict.update(
            {
                "title": "",
                "template": "email_on_subject_approved_decision",
            }
        )
    else:
        tutor_skill_dict.update(
            {
                "title": "",
                "template": "email_on_subject_denied_decision",
            }
        )

    from_mail = "Tuteria <help@tuteria.com>"
    send_mail_helper(
        tutor_skill_dict,
        backend="mandrill_backend",
        from_mail=from_mail,
    )


@shared_task
def background_task_to_delete_unquized_subjects():
    subjects_with_content = (
        TutorSkill.objects.filter(status=TutorSkill.MODIFICATION)
        .exclude(skill__quiz=None)
        .exclude(heading=None)
        .annotate(taken_quiz=Count("sitting"))
        .filter(taken_quiz=0)
    )
    for ts in subjects_with_content:
        days = timezone.now() - ts.modified
        if days.days > 8:
            ts.delete()


def send_postmark_email(tutors):
    response = requests.post(
        f"{settings.CDN_SERVICE}/api/notify-to-retake-test",
        json={"tutors": tutors},
    )
    if response.status_code < 400:
        print(f"Successfully sent messages")

    return False


@shared_task
def notify_to_retake_quiz(time_elapsed=24):
    tutors = TutorSkill.objects.all().skills_to_retake_quiz(time_elapsed)
    print(tutors)
    send_postmark_email(tutors)
