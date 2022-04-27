import datetime
import json

import pytest
from bookings.models.models1 import Booking
from connect_tutor.models import TutorJobResponse
from django.shortcuts import reverse
from django.test import Client
from external.models import Agent, BaseRequestTutor
from external.subjects_2 import construct_expectation, parse_subjects
from pricings.models import Pricing, Region
from pytest_django import asserts
from skills.models.models1 import Category, Skill, TutorSkill
from users.models import User, UserProfile
from wallet.models import WalletTransaction
from wallet.models.models1 import Wallet


def create_user(**kwargs):
    user = User.objects.create(**kwargs)
    return user


def create_request(**kwargs):
    rq = BaseRequestTutor.objects.create(**kwargs)
    return rq


def get_child_detail_with_split(no_of_teacher=1):
    child_1_subject = ["Primary Math", "Primary English", "Phonics"]
    child_2_subject = [
        "Checkpoint Math",
        "Checkpoint English",
        "Checkpoint Science",
    ]
    child_details = [
        {
            "name": "",
            "firstName": "John",
            "gender": "male",
            "classDetail": {
                "class": "Primary 2",
                "purpose": "Lower Primary Education",
                "subjects": child_1_subject,
            },
            "curriculum": ["Montessori", "British", "Nigerian"],
            "learningNeed": "Falling behind",
            "expectation": "ja oejao jeoaj wojao",
            "special_needs": "None",
        },
        {
            "name": "",
            "firstName": "Shola",
            "gender": "female",
            "classDetail": {
                "class": "JSS 2",
                "purpose": "Cambridge Checkpoint",
                "subjects": child_2_subject,
            },
            "curriculum": ["British"],
            "learningNeed": "Falling behind",
            "expectation": "jaoe joawej oaje oiajew oaj",
            "special_needs": "None",
        },
    ]
    split_requests = []
    if no_of_teacher == 1:
        split_requests = [
            {
                "teacherOption": "Specialized teachers",
                "purposes": ["Lower Primary Education"],
                "class": ["Primary 2", "JSS 2"],
                "names": ["John", "Shola"],
                "specialNeeds": ["None"],
                "learningNeed": ["Falling behind"],
                "curriculum": ["Montessori", "British", "Nigerian"],
                "subjectGroup": child_1_subject + child_2_subject,
                "forTeacher": [
                    {
                        "name": "",
                        "firstName": x["firstName"],
                        "gender": x["gender"],
                        "classDetail": x["classDetail"],
                        "curriculum": ["Montessori", "British", "Nigerian"],
                        "learningNeed": "Falling behind",
                        "expectation": "ja oejao jeoaj wojao",
                        "special_needs": "None",
                    }
                    for x in child_details
                ],
                "searchSubject": "Phonics",
                "lessonDays": [
                    "Monday",
                    "Thursday",
                    "Friday",
                    "Tuesday",
                    "Wednesday",
                ],
            }
        ]
    else:
        split_requests = [
            {
                "teacherOption": "Specialized teachers",
                "purposes": ["Lower Primary Education"],
                "class": ["Primary 2"],
                "names": ["John"],
                "specialNeeds": ["None"],
                "learningNeed": ["Falling behind"],
                "curriculum": ["Montessori", "British", "Nigerian"],
                "subjectGroup": ["Phonics"],
                "forTeacher": [
                    {
                        "name": "",
                        "firstName": "John",
                        "gender": "male",
                        "classDetail": {
                            "class": "Primary 2",
                            "purpose": "Lower Primary Education",
                            "subjects": ["Phonics"],
                        },
                        "curriculum": ["Montessori", "British", "Nigerian"],
                        "learningNeed": "Falling behind",
                        "expectation": "ja oejao jeoaj wojao",
                        "special_needs": "None",
                    }
                ],
                "searchSubject": "Phonics",
                "lessonDays": ["Friday", "Monday", "Tuesday"],
            },
            {
                "teacherOption": "Specialized teachers",
                "purposes": ["Lower Primary Education"],
                "class": ["Primary 2"],
                "names": ["John"],
                "specialNeeds": ["None"],
                "learningNeed": ["Falling behind"],
                "curriculum": ["Montessori", "British", "Nigerian"],
                "subjectGroup": ["Primary Math"],
                "forTeacher": [
                    {
                        "name": "",
                        "firstName": "John",
                        "gender": "male",
                        "classDetail": {
                            "class": "Primary 2",
                            "purpose": "Lower Primary Education",
                            "subjects": ["Primary Math"],
                        },
                        "curriculum": ["Montessori", "British", "Nigerian"],
                        "learningNeed": "Falling behind",
                        "expectation": "ja oejao jeoaj wojao",
                        "special_needs": "None",
                    }
                ],
                "searchSubject": "Primary Math",
                "lessonDays": ["Thursday", "Wednesday"],
            },
        ]
    return {"childDetails": child_details, "splitRequests": split_requests}


@pytest.fixture
def payment_info():
    tutors = [
        {
            "tutor": {
                "userId": "tutorId5",
                "subject": {
                    "hourlyRate": 4000,
                    "hourlyDiscount": 0,
                    "discountForExtraStudents": 10,
                    "name": "Phonics",
                    "tuteriaName": "Phonics",
                },
                "level": "premium",
                "newTutorDiscount": 0,
                "distance": 40,
                "firstName": "Dayo",
                "lastName": "Benson",
                "photo": "http://res.cloudinary.com/tuteria/image/upload/v1505975502/profile_pics/wwzaguocpas5q3cld44y.jpg",
            },
            "students": 2,
            "lessons": 16,
            "lessonRate": 8000,
            "lessonFee": 140800,
            "perStudentFee": 128000,
            "extraStudent": 12800,
            "firstBookingDiscount": 3000,
            "name": "Dayo",
            "distance": 40,
            "transportFare": 16000,
        },
        {
            "tutor": {
                "userId": "tutorId9",
                "subject": {
                    "hourlyRate": 5000,
                    "hourlyDiscount": 0,
                    "name": "Primary Math",
                    "tuteriaName": "Basic Mathematics",
                    "discountForExtraStudents": 10,
                },
                "level": "premium",
                "newTutorDiscount": 0,
                "distance": 32,
                "firstName": "Adeleke",
                "lastName": "Benson",
                "photo": "https://uifaces.co/our-content/donated/gPZwCbdS.jpg",
            },
            "students": 1,
            "lessons": 8,
            "lessonRate": 10000,
            "lessonFee": 80000,
            "perStudentFee": 80000,
            "extraStudent": 0,
            "firstBookingDiscount": 0,
            "name": "Adeleke",
            "distance": 32,
            "transportFare": 4800,
        },
    ]

    def _payment_info(no_of_split=1):
        selected_tutors = tutors
        if no_of_split == 1:
            selected_tutors = [tutors[0]]
        tuitionFee = sum(x["lessonFee"] for x in selected_tutors)
        transportFare = sum(x["transportFare"] for x in selected_tutors)
        return {
            "lessonPayments": selected_tutors,
            "totalTuition": tuitionFee + transportFare - 3000,
            "tuitionFee": tuitionFee,
            "totalLessons": sum(x["lessons"] for x in selected_tutors),
            "totalDiscount": 3000,
            "couponDiscount": 0,
            "discountCode": "",
            "discountRemoved": 0,
            "transportFare": transportFare,
            "isBillableDistance": True,
            "activeTeacherIDs": [x["tutor"]["userId"] for x in selected_tutors],
            "daysRequested": ["Monday", "Wednesday", "Friday", "Saturday"],
            "daysSelected": ["Monday", "Wednesday", "Friday", "Saturday"],
            "hoursOfLesson": 2,
        }

    return _payment_info


@pytest.fixture
def new_split_requests(post_request):
    def _new_split_request(tutor_ids, **kwargs):
        result = post_request(**kwargs)
        return {
            **result,
            "splitRequests": [
                {**x, "tutorId": tutor_ids[i]}
                for i, x in enumerate(result["splitRequests"])
            ],
        }

    return _new_split_request


@pytest.fixture
def create_tutor_instances():
    def _create_tutor_instances(slugs):
        # clean existing tutors
        # pk_counter = 700
        for j, i in enumerate(slugs):
            user = User.objects.create(
                slug=i,
                email=f"tutor-{i}@example.com",
                data_dump={"tutor_update": {"pricingInfo": {"hourlyRates": {}}}},
            )
            profile = user.profile
            profile.application_status = UserProfile.VERIFIED
            profile.save()
            User.objects.filter(email=user.email).update(slug=i)

    return _create_tutor_instances


@pytest.fixture
def post_request():
    def _post_request(
        no_of_split=1,
        request_type="inperson",
        special_needs="",
        teacherGender="anyone",
        days=[],
        hours="1_hour",
        duration="4_weeks",
        plan="",
        rate=[],
        **kwargs,
    ):
        data = {
            **get_child_detail_with_split(no_of_split),
            "teacherKind": "One teacher"
            if no_of_split == 1
            else "Specialized teachers",
            "lessonDetails": {
                "lessonSchedule": {
                    "lessonDays": [
                        "Monday",
                        "Thursday",
                        "Friday",
                        "Tuesday",
                        "Wednesday",
                    ],
                    "lessonHours": 1,
                    "lessonTime": "4:00 PM",
                    "lessonDuration": 4,
                    "lessonUrgency": "In a few days",
                    "lessonPlan": "",
                    "hourlyRate": [],
                    "extraStudentFx": 0.2,
                    "premiumFx": 1.4,
                    "teacherKind": "",
                },
                "lessonType": "physical",
            },
            "contactDetails": {
                "vicinity": "Lekki",
                "state": "Lagos",
                "country": "Nigeria",
                "region": "Lekki Phase 1",
                "title": "Mr.",
                "firstName": "Abiola",
                "lastName": "Oyeniyi",
                "email": "gbozee@example.com",
                "phone": "2347035209976",
                "preferredComms": {"channel": "whatsapp", "number": "2347035209976"},
                "medium": "Instagram",
            },
            "subjectDetails": {
                "name": "hometutoring",
                "shortName": "hometutoring",
            },
            "filters": {
                "gender": ["male", "female"],
                "sortBy": "Recommended",
                "showPremium": False,
                "minPrice": 0,
                "maxPrice": 0,
                "lessonType": "physical",
                "educationDegrees": [],
                "educationCountries": [],
                "educationGrades": [],
                "maxAge": 0,
                "minExperience": "",
            },
        }

        return data

    return _post_request


@pytest.fixture
def create_issued_request(client, create_agent):
    def _previous_issued_request(country="Nigeria", **kwargs) -> BaseRequestTutor:
        create_agent()
        assert BaseRequestTutor.objects.count() == 0
        response = client.post(
            "/new-flow/issue-new-home-tutoring-request",
            json.dumps({"country": country, **kwargs}),
            "application/json",
        )
        assert response.status_code == 200
        rq = BaseRequestTutor.objects.first()
        # assert response.json() == {
        #     "status": True,
        #     "data": {
        #         "slug": rq.slug,
        #         "contactDetails": {
        #             "country": "Nigeria",
        #             **kwargs,
        #         },
        #         "status": rq.get_status_display(),
        #         # "agent": {
        #         #     "title": "",
        #         #     "name": "agent1",
        #         #     "phone_number": "+234703509999",
        #         #     "email": "agent1@example.com",
        #         #     "image": "",
        #         # },
        #     },
        # }
        return rq

    return _previous_issued_request


@pytest.fixture
def previous_single_request(client, post_request, create_issued_request):
    def _previous_single_request(**kwargs):
        data = post_request(**kwargs)
        rq = create_issued_request(
            phone=data["contactDetails"]["phone"], customerType="parent"
        )
        response = client.post(
            f"/new-flow/save-home-tutoring-request/{rq.slug}",
            json.dumps({"requestData": data, **kwargs}),
            content_type="application/json",
        )
        assert response.status_code == 200

        return response

    return _previous_single_request


@pytest.fixture
def previous_multiple_request(client, post_request):
    def _previous_multiple_request(child_count=2, total_count=3):
        data = post_request(child_count=child_count)
        response = client.post(
            "/new-flow/save-home-tutoring-request",
            json.dumps({"requestData": data}),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert (
            BaseRequestTutor.objects.filter(status=BaseRequestTutor.ISSUED).count()
            == total_count
        )

    return _previous_multiple_request


@pytest.fixture
def previous_pending_multiple_request(
    client,
    payment_info,
    new_split_requests,
    create_tutor_instances,
    previous_single_request,
    create_tutor_skill,
):
    def _previous_pending_multiple_request():
        p_info = payment_info(2)
        no_of_tutors = p_info["activeTeacherIDs"]
        request_data = new_split_requests(no_of_tutors, no_of_split=2)
        create_tutor_instances(no_of_tutors)
        create_tutor_skill(no_of_tutors)
        assert UserProfile.objects.filter(
            application_status=UserProfile.VERIFIED
        ).count() == len(no_of_tutors)
        previous_single_request(no_of_split=2)

        rq = BaseRequestTutor.objects.filter(related_request=None).first()
        response = client.post(
            f"/new-flow/update-home-tutoring-request/{rq.slug}",
            json.dumps({"requestData": request_data, "paymentInfo": p_info}),
            content_type="application/json",
        )
        assert response.status_code == 200
        base_rq = BaseRequestTutor.objects.filter(related_request=None).first()
        related = BaseRequestTutor.objects.exclude(related_request=None).all()
        return response, p_info, no_of_tutors

    return _previous_pending_multiple_request


@pytest.fixture
def create_tutor_skill():
    def _create_tutor_skill(tutor_arr):
        tutors = User.objects.filter(slug__in=tutor_arr).all()
        category = Category.objects.create(name="Category")
        s1 = Skill.objects.create(name="Phonics")
        s2 = Skill.objects.create(name="Basic Mathematics")
        s1.categories.add(category)
        s2.categories.add(category)
        TutorSkill.objects.create(
            tutor=tutors[0],
            skill=s1,
            status=TutorSkill.ACTIVE,
            heading="",
            description="",
        )
        if len(tutors) > 1:
            TutorSkill.objects.create(
                tutor=tutors[1],
                skill=s2,
                status=TutorSkill.ACTIVE,
                heading="",
                description="",
            )

    return _create_tutor_skill


@pytest.fixture
def create_single_pending_request(
    client,
    post_request,
    previous_single_request,
    new_split_requests,
    payment_info,
    create_tutor_instances,
    create_tutor_skill,
):
    def _create_single_completed_request():
        p_info = payment_info()
        no_of_tutors = p_info["activeTeacherIDs"]
        request_data = new_split_requests(no_of_tutors)
        create_tutor_instances(no_of_tutors)
        create_tutor_skill(no_of_tutors)
        assert UserProfile.objects.filter(
            application_status=UserProfile.VERIFIED
        ).count() == len(no_of_tutors)
        previous_single_request()
        rq = BaseRequestTutor.objects.first()
        response = client.post(
            f"/new-flow/update-home-tutoring-request/{rq.slug}",
            json.dumps({"requestData": request_data, "paymentInfo": p_info}),
            content_type="application/json",
        )
        assert response.status_code == 200
        base_rq = BaseRequestTutor.objects.first()
        assert base_rq.user is not None
        assert base_rq.user.first_name == base_rq.first_name
        assert base_rq.available_days == p_info["daysRequested"]
        assert base_rq.hours_per_day == p_info["hoursOfLesson"]
        assert base_rq.days_per_week == 4
        assert base_rq.time_of_lesson == "4:00 PM"
        assert str(base_rq.user.primary_phone_no.number) == str(base_rq.number)
        assert base_rq.tutor == User.objects.get(slug=no_of_tutors[0])
        assert base_rq.tutor.tutorskill_set.count() == 1
        # assert response.json() == {
        #     "status": True,
        #     "data": {
        #         "slug": base_rq.slug,
        #         "requestData": base_rq.client_request,
        #         "paymentInfo": {**p_info, "timeSubmitted": None},
        #         "splits": [],
        #     },
        # }
        assert base_rq.budget == p_info["totalTuition"] + p_info["totalDiscount"]
        assert base_rq.status == BaseRequestTutor.PENDING
        assert base_rq.agent is not None
        return no_of_tutors, base_rq

    return _create_single_completed_request


@pytest.fixture
def create_multiple_pending_request(
    client,
    post_request,
    previous_single_request,
    new_split_requests,
    payment_info,
    create_tutor_instances,
):
    def _create_multiple_pending_request():
        p_info = payment_info(2)
        no_of_tutors = p_info["activeTeacherIDs"]
        request_data = new_split_requests(no_of_tutors, no_of_split=2)
        create_tutor_instances(no_of_tutors)
        assert UserProfile.objects.filter(
            application_status=UserProfile.VERIFIED
        ).count() == len(no_of_tutors)
        previous_single_request(no_of_split=2)

        rq = BaseRequestTutor.objects.filter(related_request=None).first()
        response = client.post(
            f"/new-flow/update-home-tutoring-request/{rq.slug}",
            json.dumps({"requestData": request_data, "paymentInfo": p_info}),
            content_type="application/json",
        )
        assert response.status_code == 200
        base_rq = BaseRequestTutor.objects.filter(related_request=None).first()
        related = BaseRequestTutor.objects.exclude(related_request=None).all()
        assert response.json() == {
            "status": True,
            "data": {
                "requestData": base_rq.client_request,
                "paymentInfo": p_info,
                "slug": base_rq.slug,
                "splits": list([x.slug for x in related]),
            },
        }
        assert base_rq.budget == p_info["totalTuition"]
        assert base_rq.status == BaseRequestTutor.PENDING
        assert base_rq.agent is not None
        for i, o in enumerate(related):
            assert o.related_request == base_rq
            assert o.status == BaseRequestTutor.PENDING
            info = p_info["lessonPayments"][o.tutor_info_index]
            assert o.payment_info == info
            assert o.budget == info["lessonFee"]
            assert o.tutor.slug == no_of_tutors[o.tutor_info_index]

    return _create_multiple_pending_request


@pytest.mark.django_db
def test_single_tutor_response_to_jobs(client, create_single_pending_request):
    tutor_slugs, base_rq = create_single_pending_request()
    tutor = User.objects.get(slug=tutor_slugs[0])
    response = client.get(
        f"/new-flow/tutoring-jobs?t_slug={tutor.slug}",
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": [
            {
                **base_rq.client_request,
                "agent": {
                    "image": base_rq.agent.profile_pic,
                    "name": base_rq.agent.name,
                    "phone_number": str(base_rq.agent.phone_number),
                },
                "slug": base_rq.slug,
                "status": base_rq.get_status_display(),
                "created": base_rq.created.isoformat(),
                "tutor_info": base_rq.request_info_for_tutor,
                "paymentInfo": base_rq.payment_info,
                "tutorResponse": {
                    "id": base_rq.req_instance.first().pk,
                    "status": "pending",
                    "responseTime": 0,
                },
            }
        ],
    }


@pytest.mark.django_db
def test_tutor_response_to_a_particular_job(
    client, create_single_pending_request, mocker
):
    tutor_slugs, base_rq = create_single_pending_request()
    tutor = User.objects.get(slug=tutor_slugs[0])
    response_instance = base_rq.req_instance.first()
    response = client.post(
        f"/new-flow/tutoring-jobs",
        json.dumps(
            {
                "tutor_slug": tutor.slug,
                "slug": base_rq.slug,
                "tutorResponse": {
                    # "id": response_instance.pk,
                    "status": "accepted",
                    "comment": "",
                    "reason": "",
                    "dateSubmitted": "2021-04-08T15:00:00",
                    "responseTime": 0,
                    "callFeedback": {},
                    "bookingStage": {
                        "current": "get_contact",
                        "stages": [
                            {
                                "stage": "pending_response",
                                "duration": "2021-04-08T15:00:00",
                            },
                        ],
                    },
                },
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["id"] == base_rq.req_instance.first().pk
    assert data["status"] == "accepted"
    assert data["reason"] == ""
    assert data["comment"] == ""
    assert data["responseTime"] >= 0
    assert data["dateSubmitted"] != ""
    assert data["bookingStage"] == {
        "current": "get_contact",
        "stages": [
            {
                "stage": "pending_response",
                "duration": "2021-04-08T15:00:00",
            },
        ],
    }
    assert data["callFeedback"] == {}


@pytest.mark.django_db
def test_tutor_booking_a_job_for_a_paricular_request_single(
    client, create_single_pending_request, mocker
):
    mocked_call = mocker.patch(
        "bookings.tasks.send_mail_to_client_and_tutor_on_successful_booking.delay"
    )
    tutor_slugs, base_rq = create_single_pending_request()
    tutor = User.objects.get(slug=tutor_slugs[0])
    tutor.set_password("password10011")
    tutor.save()
    response_instance = base_rq.req_instance.first()
    assert base_rq.booking is None
    sessions = [
        {
            "startDate": "2021-05-24",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-05-28",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-05-31",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-04",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-07",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-11",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-14",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-18",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
    ]
    # ensure balance exists in user wallet and is greater than cost of booking else booking fails
    base_rq.deposit_payment_to_wallet(base_rq.amount_to_be_paid)
    user_wallet = base_rq.user.wallet
    # user_wallet.deposit_new_payment_to_wallet(base_rq, base_rq.amount_to_be_paid)
    assert base_rq.wallet_balance_available() == base_rq.amount_to_be_paid
    assert user_wallet.amount_available == base_rq.amount_to_be_paid
    assert user_wallet.credits == base_rq.total_discount
    assert user_wallet.credits > 0
    assert user_wallet.total_available_balance == base_rq.full_payment
    response = client.post(
        f"/new-flow/create-booking",
        json.dumps({"slug": base_rq.slug, "sessions": sessions}),
        content_type="application/json",
    )
    assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.filter(slug=base_rq.slug).first()
    booking = base_rq.booking
    assert booking is not None
    assert response.json() == {
        "status": True,
        "data": {
            "from": booking.first_session.isoformat(),
            "to": booking.last_session.isoformat(),
            "bookingUrl": booking.get_tutor_l_absolute_url(),
        },
    }
    # testing that the link sent would log the tutor in automatically.
    response = client.get(booking.get_tutor_l_absolute_url())
    assert response.status_code == 302
    assert response.url == booking.get_tutor_absolute_url()

    assert booking.status == Booking.SCHEDULED
    assert booking.bookingsession_set.count() == len(sessions)
    assert booking.total_price == base_rq.lesson_fee
    transactions = WalletTransaction.objects.filter(booking=booking).all()
    user_wallet = base_rq.user.wallet
    assert user_wallet.credits == 0
    assert (
        user_wallet.amount_in_session
        == booking.total_price + base_rq.transport_fare - base_rq.total_discount
    )
    assert user_wallet.amount_available == 0
    assert (
        base_rq.wallet_balance_available()
        == base_rq.amount_to_be_paid - booking.total_price
    )
    assert mocked_call.called
    # account for when tutor is to be paid


@pytest.mark.django_db
def test_tutor_booking_a_job_for_a_particular_request_multiple(
    client, previous_pending_multiple_request, mocker
):
    mocked_call = mocker.patch(
        "bookings.tasks.send_mail_to_client_and_tutor_on_successful_booking.delay"
    )
    previous_pending_multiple_request()
    base_rq = BaseRequestTutor.objects.filter(related_request=None).first()
    related = BaseRequestTutor.objects.exclude(related_request=None).all()
    assert base_rq.booking is None
    for i in related:
        assert i.booking is None
    first = related.first()
    second = related.last()
    sessions = [
        {
            "startDate": "2021-05-24",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-05-28",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-05-31",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-04",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-07",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-11",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-14",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
        {
            "startDate": "2021-06-18",
            "startTime": "5:30 PM",
            "price": 8800,
            "students": 1,
            "hours": 2,
        },
    ]
    # ensure balance exists in user wallet and is greater than cost of booking else booking fails
    user_wallet = base_rq.user.wallet
    user_wallet.deposit_new_payment_to_wallet(base_rq, base_rq.amount_to_be_paid)
    assert user_wallet.amount_available == 238600
    assert user_wallet.credits == base_rq.total_discount
    assert user_wallet.credits > 0
    assert user_wallet.total_available_balance == base_rq.full_payment
    response = client.post(
        f"/new-flow/create-booking",
        json.dumps({"slug": first.slug, "sessions": sessions}),
        content_type="application/json",
    )
    assert response.status_code == 200
    first = BaseRequestTutor.objects.filter(slug=first.slug).first()
    booking = first.booking
    assert booking is not None
    assert response.json() == {
        "status": True,
        "data": {
            "from": booking.first_session.isoformat(),
            "to": booking.last_session.isoformat(),
            "bookingUrl": booking.get_tutor_l_absolute_url(),
        },
    }
    assert booking.status == Booking.SCHEDULED
    assert booking.bookingsession_set.count() == len(sessions)
    assert booking.total_price == first.lesson_fee
    assert first.tutor_discount == 3000
    assert first.transport_fare == 16000
    assert booking.tutor_discount == 3000
    assert booking.tutor == first.tutor
    tutor = booking.tutor
    assert tutor.wallet.transactions.count() == 0

    transactions = WalletTransaction.objects.filter(booking=booking).all()
    user_wallet = base_rq.user.wallet
    assert user_wallet.credits == 0
    assert (
        user_wallet.amount_in_session
        == booking.total_price + first.transport_fare - base_rq.total_discount
    )
    assert user_wallet.amount_available == second.full_payment
    assert mocked_call.called
    # when tutor is to be paid.
    user_wallet.pay_tutor(booking, tutor.wallet, has_penalty=True)
    tutor_wallet = Wallet.objects.get(pk=tutor.wallet.pk)
    assert tutor_wallet.transactions.count() == 3
    assert (
        tutor_wallet.amount_available
        == booking.amount_earned()
        - booking.witholding_tax_amount()
        + booking.transport_fare
    )
    assert base_rq.user.wallet.amount_in_session == 0


@pytest.mark.django_db
def test_request_job_response_model_fields(create_tutor_instances, mocker):
    create_tutor_instances(["tutor-1", "tutor-2"])
    current_date = datetime.datetime(2020, 10, 12, 2, 3)
    for i in User.objects.filter(profile__application_status=UserProfile.VERIFIED):
        r1 = BaseRequestTutor.objects.create(slug=i.slug)
        rr = TutorJobResponse.get_instance(r1, i)
        TutorJobResponse.objects.filter(pk=rr.pk).update(created=current_date)

    assert TutorJobResponse.objects.filter(created=current_date).count() == 2
    assert (
        TutorJobResponse.objects.pending(
            datetime.datetime(2020, 10, 11), days=0
        ).count()
        == 0
    )
    assert (
        TutorJobResponse.objects.pending(datetime.datetime(2020, 10, 14)).count() == 2
    )
    assert TutorJobResponse.objects.filter(status=TutorJobResponse.PENDING).count() == 2
    mocked = mocker.patch("connect_tutor.models.timezone.now")
    mocked.return_value = datetime.datetime(2020, 10, 14)
    TutorJobResponse.change_status_to_not_applied()
    assert TutorJobResponse.objects.filter(status=TutorJobResponse.PENDING).count() == 0
    assert (
        TutorJobResponse.objects.filter(status=TutorJobResponse.NO_RESPONSE).count()
        == 2
    )
    first_tutor = TutorJobResponse.objects.filter(tutor__slug="tutor-1").first()
    result = TutorJobResponse.update_tutor_response(
        pk=first_tutor.pk,
        status="accepted",
        comment="I am available at the requested times",
        reason="",
    )
    assert result.status == TutorJobResponse.ACCEPTED
    assert result.comment == "I am available at the requested times"
    assert result.modified > result.created
    # assert result.response_time == (result.modified - result.created).seconds
    second_tutor = TutorJobResponse.objects.filter(tutor__slug="tutor-2").first()
    result2 = TutorJobResponse.update_tutor_response(
        pk=second_tutor.pk,
        status="declined",
        comment="I won't be available for more jobs in the future",
    )
    assert result2.status == TutorJobResponse.REJECTED
    assert result2.comment == "I won't be available for more jobs in the future"
    assert result.modified > result.created
    # assert result.response_time == (result.modified - result.created).seconds
    assert TutorJobResponse.objects.filter(tutor__slug="tutor-2").count() == 1
    result = User.objects.filter(pk=result2.tutor_id).response_annotation(
        # result = BaseRequestTutor.objects.filter(pk=result2.req_id).alternate_response_annotation(
        datetime.datetime(2009, 10, 14)
    )
    for o in result:
        assert o.requestsDeclined == 1
        assert o.totalJobsAssigned == 1
        assert o.totalJobsAccepted == 0
        assert o.requestsNotResponded == 0


@pytest.mark.django_db
def test_get_tutor_subjects(
    client, payment_info, create_tutor_instances, create_tutor_skill
):
    p_info = payment_info()
    no_of_tutors = p_info["activeTeacherIDs"]
    create_tutor_instances(no_of_tutors)
    create_tutor_skill(no_of_tutors)
    tutor = User.objects.filter(
        profile__application_status=UserProfile.VERIFIED
    ).first()
    response = client.post(
        f"/new-flow/tutor-subjects",
        json.dumps({"email": tutor.email}),
        content_type="application/json",
    )
    data = response.json()
    skill = data["data"]["object_list"][0]
    assert skill["skill"] == {"name": "Phonics"}
    pricingInfo = tutor.revamp_data("pricingInfo")
    assert pricingInfo == {"hourlyRates": {}}
    response = client.post(
        f"/new-flow/save-tutor-subjects",
        json.dumps(
            {
                "pk": skill["pk"],
                "skill": skill["skill"],
                "heading": "I am a master in pheonics",
                "description": "I am the best teacher in the world",
                "price": 5000,
                "certifications": [
                    {
                        "award_name": "Eleja Schools",
                        "award_institution": "University of Lagos",
                    }
                ],
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 200
    tutor = User.objects.get(pk=tutor.pk)
    pricingInfo = tutor.revamp_data("pricingInfo")
    assert pricingInfo["hourlyRates"] == {"Phonics": 5000}
    assert tutor.tutorskill_set.pending().count() == 1
    assert tutor.tutorskill_set.count() == 1
