import tablib
from wallet.models import WalletTransactionType, WalletTransaction
from external.models import BaseRequestTutor
from bookings.models import Booking
from skills.models import Category, Skill
from registration.models import WorkExperience
from users.related_subjects import get_related_subjects
from django.db import models
from users.models import UserProfile, User
from . import utils


def effect_correction_on_base_request():
    requests = BaseRequestTutor.objects.filter(request_info__isnull=False,class_urgency="")
    for request in requests:
        request_details = request.request_info.get('request_details')
        
        try:
            start_date = request_details.get('start_date')
            end_date = request_details.get('end_date')
            request.class_urgency = utils.get_how_soon_should_lesson_start(start_date, end_date)
            request.save()
        except:
            pass
    print('Done')



def export_client_reviews():
    from reviews.models import SkillReview
    subjects = [
        'LSAT',
        'SAT Reading',
        'SAT Writing',
        'SAT Math',
        'IELTS',
        'GRE',
        'GMAT',
        'ACCA',
        'ICAN',
        'TOEFL',
    ]
    fields = [
        "Client Email",
        "Tutor Email",
        "Review",
        "Rating",
    ]
    dataset = tablib.Dataset(headers=fields)

    data = SkillReview.objects.reviews_from_users().filter(tutor_skill__skill__name__in=subjects)

    for r in data.iterator():
        try:
            data2 = {
                "Client Email": r.booking.user.email,
                "Tutor Email": r.tutor_skill.tutor.email,
                "Review": r.review,
                "Rating": r.score,
            }
            record = []
            for key in fields:
                record.append(data2[key])
            dataset.append(record)
        except:
            pass

    with open("client_reviews.xlsx", "wb") as f:
        f.write(dataset.export("xlsx"))
    print('Done')

def work_experience_dataset():
    fields = [
        "Full Name",
        "phone number",
        "email address",
        "Place of Work",
        "State",
        "Number of Booking",
    ]
    dataset = tablib.Dataset(headers=fields)
    data = WorkExperience.objects.filter(
        tutor__profile__application_status=UserProfile.VERIFIED
    ).filter(models.Q(name__icontains="School") | models.Q(role__icontains="Teach"))
    for r in data.iterator():
        hd = r.tutor.home_address
        number = r.tutor.primary_phone_no
        data2 = {
            "Full Name": f"{r.tutor.first_name} {r.tutor.last_name}",
            "phone number": str(number.number) if number else "",
            "email address": r.tutor.email,
            "Place of Work": r.name,
            "State": hd.state if hd else "",
            "Number of Booking": r.tutor.t_bookings.exists(),
        }
        record = []
        for key in fields:
            record.append(data2[key])
        dataset.append(record)

    with open("peace.xlsx", "wb") as f:
        f.write(dataset.export("xlsx"))


def request_details_dataset():

    fields = ["Date", "Time", "Email", "Phone number", "Subjects", "Parent request"]
    dataset = tablib.Dataset(headers=fields)

    data = BaseRequestTutor.objects.filter(status=1)

    for r in data:
        data_ = {
            "Date": r.created.date(),
            "Time": r.created.strftime("%I:%M%p"),
            "Email": r.email,
            "Phone number": r.number,
            "Subjects": r.subject_ast,
            "Parent request": r.is_parent_request,
        }

        record = []
        for key in fields:
            record.append(data_[key])

        dataset.append(record)

    with open("issued_requests.xlsx", "wb") as f:
        f.write(dataset.export("xlsx"))


def related_subjects(subj):
    value = [get_related_subjects(x) for x in subj]
    return [item for sublist in value for item in sublist]


def subject_category(subj):
    i = related_subjects(subj)
    skills = Skill.objects.filter(related_with__overlap=i)
    return set([x.categories.first().name for x in skills])


def get_p_fee(user):
    if user:
        records = user.wallet.transactions.filter(
            type=WalletTransactionType.PROCESSING_FEE
        ).first()
        if records:
            return records.created.date()


def tutors_with_bookings_dataset():
    fields = [
        "Name",
        "Gender",
        "State",
        "Number of Lessons Taught",
        "Number of bookings",
        "Amount Earned 2016",
        "Amount Earned 2017",
        "Amount Earned 2018",
    ]
    dataset = tablib.Dataset(headers=fields)
    queryset = User.objects.all().users_with_bookings()
    kks = [x.pk for x in queryset]
    transactions = (
        WalletTransaction.objects.filter(wallet__owner_id__in=kks)
        .filter(type=WalletTransactionType.EARNING)
        .values("wallet__owner_id", "amount")
    )
    for r in queryset:
        sc = r.t_bookings.completed().session_count()
        earned = r.wallet.transactions.tutor_earning()
        earning_2016 = earned.in_year(2016)
        earning_2017 = earned.in_year(2017)
        earning_2018 = earned.in_year(2018)
        data = {
            "Name": f"{r.first_name} {r.last_name}",
            "Gender": r.profile.gender if hasattr(r, "profile") else "",
            "State": r.home_address.state if r.home_address else "",
            "Number of bookings": r.bk,
            "Number of Lessons Taught": sc,
            "Amount Earned 2016": earning_2016,
            "Amount Earned 2017": earning_2017,
            "Amount Earned 2018": earning_2018,
        }
        record = []
        for key in fields:
            record.append(data[key])

        dataset.append(record)

    with open("tutor_with_booking.xlsx", "wb") as f:
        f.write(dataset.export("xlsx"))


def sample_request_data_set():
    fields = [
        "Name",
        "email",
        "phone",
        "date created",
        "time created",
        "date booked",
        "subjects requested",
        "category of subject",
        "urgency",
        "how they heard",
        "plan selected",
        "amount",
        "location",
        "state",
        "duration of lessons",
        "date processing fee was paid",
        "number of students",
        "days/wk",
        "hours per lesson",
        "parent or non-parent request",
    ]

    dataset = tablib.Dataset(headers=fields)

    valid_requests = BaseRequestTutor.objects.exclude(
        status=BaseRequestTutor.ISSUED
    ).exclude(status=BaseRequestTutor.COLD)

    for o in valid_requests.iterator():
        data = {
            "Name": f"{o.first_name} {o.last_name}",
            "email": o.email,
            "phone": o.number,
            "date created": o.created.date(),
            "time created": o.created.strftime("%I:%M%p"),
            "date booked": o.booking.created.date() if o.booking else None,
            "urgency": o.class_urgency,
            "how they heard": o.get_where_you_heard_display(),
            "plan selected": o.plan,
            "amount": o.booking.total_price if o.booking else None,
            "budget": o.budget,
            "location": o.vicinity,
            "state": o.state,
            "duration of lessons": o.get_days_per_week_display(),
            "date processing fee was paid": get_p_fee(o.user),
            "number of students": o.no_of_students,
            "days/wk": len(o.available_days) if o.available_days else None,
            "hours per lesson": o.hours_per_day,
            "parent or non-parent request": o.is_parent_request,
        }
        if o.request_subjects:
            data = {
                **data,
                **{
                    "subjects requested": "".join(o.request_subjects),
                    "category of subject": "".join(
                        subject_category(o.request_subjects)
                    ),
                },
            }
        else:
            data = {**data, **{"subjects requested": "", "category of subject": ""}}

        record = []
        for key in fields:
            record.append(data[key])
        dataset.append(record)

    with open("hello.xlsx", "wb") as f:
        f.write(dataset.export("xlsx"))
