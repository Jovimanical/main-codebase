from django.http import JsonResponse
from users.models import User
from django.db import models
from bookings.models import Booking
from dateutil.parser import parse
from wallet.models import Wallet, WalletTransaction, WalletTransactionType
import datetime
import time
import calendar


def mkDateTime(dateString, strFormat="%Y-%m-%d"):
    # Expects "YYYY-MM-DD" string
    # returns a datetime object
    eSeconds = time.mktime(time.strptime(dateString, strFormat))
    return datetime.datetime.fromtimestamp(eSeconds)


def formatDate(dtDateTime, strFormat="%Y-%m-%d"):
    # format a datetime object as YYYY-MM-DD string and return
    return dtDateTime.strftime(strFormat)


def mkFirstOfMonth(dtDateTime):
    # what is the first day of the current month
    # format the year and month + 01 for the current datetime, then form it back
    # into a datetime object
    return mkDateTime(formatDate(dtDateTime, "%Y-%m-01"))


def mkLastOfMonth(dtDateTime):
    dYear = dtDateTime.strftime("%Y")  # get the year
    dMonth = str(
        int(dtDateTime.strftime("%m")) % 12 + 1
    )  # get next month, watch rollover
    dDay = "1"  # first day of next month
    nextMonth = mkDateTime(
        "%s-%s-%s" % (dYear, dMonth, dDay)
    )  # make a datetime obj for 1st of next month
    delta = datetime.timedelta(seconds=1)  # create a delta of 1 second
    return nextMonth - delta


def amount(status=3):
    return models.Sum(
        models.Case(
            models.When(status=status, then=models.F("bookingsession__price")),
            default=0,
            output_field=models.DecimalField(),
        )
    )


def count_by_category(queryset):
    categories = queryset.values_list(
        "ts__skill__categories__name", flat=True
    ).distinct()
    skills = queryset.values_list("ts__skill__name", flat=True).distinct()

    def working_q_set(q_set):
        return q_set.aggregate(
            count=models.Count("pk",distinct=True),
            hours=models.Sum('bookingsession__no_of_hours'),
            all_b_total=models.Sum("bookingsession__price"),
        )

    options = lambda u, _list: [
        {x: working_q_set(queryset.filter(**{u: x}))} for x in set(_list) if x
    ]
    categoriies_sum = options("ts__skill__categories__name", categories)
    skills_sum = options("ts__skill__name", skills)
    return categoriies_sum, skills_sum


def count(status=3):
    return models.Sum(
        booking_status(
            "bookingsession__status",
            [models.When(bookingsession__status=status, then=1)],
            0,
            models.IntegerField(),
        )
    )


def total_booked(queryset, key="bookingsession__price"):
    return queryset.aggregate(cc=models.Sum(key))["cc"]


def annotate_aggregate(queryset, key):
    return queryset.annotate(cc=models.Count(key)).aggregate(oo=models.Sum("cc"))["oo"]


options = [models.When(bookingsession__status=3, then=1)]

# [
#         models.When(**{key: x[0]}, then=models.Value(x[1]))
#         for x in Booking.BOOKING_STATUS
#     ]


def booking_status(
    key,
    options=None,
    default=models.Value("initialized"),
    output_field=models.CharField(),
):
    return models.Case(*options, default=default, output_field=output_field)


def get_client_details(field="created", year=2018, skill_only=False):
    days = [
        (datetime.date(year, x, 1), mkLastOfMonth(datetime.date(year, x, 1)))
        for x in range(1, datetime.date.today().month)
    ]
    booked_lessons = [Booking.objects.filter(**{f"{field}__range": x}) for x in days]
    completed_lessons = [
        x.filter(status__in=[Booking.COMPLETED, Booking.DELIVERED])
        for x in booked_lessons
    ]
    new_conditions = ~models.Q(baserequesttutor=None) | models.Q(
        remark__icontains="NEW CLIENT"
    )
    new_booking = [x.filter(new_conditions) for x in booked_lessons]
    recurring = [x.exclude(new_conditions) for x in booked_lessons]
    month_transactions = [
        WalletTransaction.objects.filter(created__range=x) for x in days
    ]
    paid_to_tutors = [
        x.filter(type=WalletTransactionType.WITHDRAWAL_COMPLETED)
        for x in month_transactions
    ]
    paid_by_client = [
        x.filter(type=WalletTransactionType.TUTOR_HIRE) for x in month_transactions
    ]
    earned_by_tutors = [
        x.filter(type=WalletTransactionType.EARNING) for x in month_transactions
    ]
    processing_fee = [
        x.filter(
            type=WalletTransactionType.PROCESSING_FEE,
            transaction_type=WalletTransactionType.INCOME,
        )
        for x in month_transactions
    ]

    def result(oo, key):
        dd = count_by_category(oo)
        total_category = sum([list(x.values())[0]["count"] for x in dd[0]])
        skill_count = sum([list(x.values())[0]["count"] for x in dd[1]])
        total_skill = sum([list(x.values())[0]["all_b_total"] for x in dd[1] if list(x.values())[0]["all_b_total"]])
        return {
            f"{key}_category": dd[0],
            f"{key}_skills": dd[1],
            "total_category_count": total_category,
            "total_skill_count": skill_count,
            "total_skill_value": total_skill,
        }

    def actual_data(x):
        if skill_only:
            return {
                **result(completed_lessons[x], "completed"),
                **result(booked_lessons[x], "booked"),
            }
        ddd = {
            "booked_count": booked_lessons[x].count(),
            "completed_count": completed_lessons[x].count(),
            "total_booked": total_booked(booked_lessons[x]),
            "total_completed": completed_lessons[x].aggregate(t_amount=amount())[
                "t_amount"
            ],
            "total_booked_lessons": annotate_aggregate(
                booked_lessons[x], "bookingsession"
            ),
            "total_completed_lessons": completed_lessons[x].aggregate(t_count=count())[
                "t_count"
            ],
            "no_of_new_bookings": new_booking[x].count(),
            "total_from_new_bookings": total_booked(new_booking[x]),
            "no_of_recurrent_bookings": recurring[x].count(),
            "total_from_recurring": total_booked(recurring[x]),
            "no_of_withdrawals": paid_to_tutors[x].count(),
            "amount_paid_to_tutors": total_booked(paid_to_tutors[x], "amount"),
            "no_of_transactions": paid_by_client[x].count(),
            "amount_paid_by_clients": total_booked(paid_by_client[x], "amount"),
            "no_of_earnings_by_tutors": earned_by_tutors[x].count(),
            "total_earned_by_tutors": total_booked(earned_by_tutors[x], "amount"),
            "no_of_processing_fee": processing_fee[x].count(),
            "total_processing_fee": total_booked(processing_fee[x], "amount"),
        }
        return ddd

    results = [
        {calendar.month_name[x + 1]: {**actual_data(x)}}
        for x, i in enumerate(booked_lessons)
    ]
    return results

