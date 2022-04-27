import json
from users.models import User, UserProfile
from external.models import BaseRequestTutor, Agent
from pricings.models import Pricing, Region
from pytest_django import asserts
from external.subjects_2 import construct_expectation, parse_subjects
import pytest
from django.shortcuts import reverse
from django.test import Client


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
            # "couponDiscount": 0,
            "discountCode": "",
            # "discountRemoved": 0,
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
            user = User.objects.create(slug=i, email=f"tutor-{i}@example.com")
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
    def _previous_issued_request(
        country="Nigeria", discountCode="", **kwargs
    ) -> BaseRequestTutor:
        create_agent()
        assert BaseRequestTutor.objects.count() == 0
        response = client.post(
            "/new-flow/issue-new-home-tutoring-request",
            json.dumps({"country": country, "discountCode": discountCode, **kwargs}),
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
        if discountCode:
            assert rq.payment_info["discountCode"] == discountCode
        return rq

    return _previous_issued_request


@pytest.fixture
def previous_single_request(client, post_request, create_issued_request):
    def _previous_single_request(discountCode=None, **kwargs):
        data = post_request(**kwargs)
        rq = create_issued_request(
            phone=data["contactDetails"]["phone"],
            customerType="parent",
            discountCode=discountCode,
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
def previous_pending_single_request(
    client,
    payment_info,
    new_split_requests,
    create_tutor_instances,
    previous_single_request,
):
    def _previous_pending_single_request(discountCode=""):
        p_info = payment_info()
        no_of_tutors = p_info["activeTeacherIDs"]
        request_data = new_split_requests(no_of_tutors)
        create_tutor_instances(no_of_tutors)
        assert UserProfile.objects.filter(
            application_status=UserProfile.VERIFIED
        ).count() == len(no_of_tutors)
        previous_single_request(discountCode=discountCode)
        rq = BaseRequestTutor.objects.first()
        response = client.post(
            f"/new-flow/update-home-tutoring-request/{rq.slug}",
            json.dumps({"requestData": request_data, "paymentInfo": p_info}),
            content_type="application/json",
        )
        return response, p_info, no_of_tutors

    return _previous_pending_single_request


@pytest.fixture
def previous_pending_multiple_request(
    client,
    payment_info,
    new_split_requests,
    create_tutor_instances,
    previous_single_request,
):
    def _previous_pending_multiple_request():
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
        return response, p_info, no_of_tutors

    return _previous_pending_multiple_request


@pytest.mark.django_db
def test_existing_pending_requests_gets_updated_without_changing_the_status(
    client, previous_pending_single_request
):
    response, p_info, no_of_tutors = previous_pending_single_request()
    base_rq = BaseRequestTutor.objects.first()
    assert base_rq.status == BaseRequestTutor.PENDING
    assert base_rq.amount_to_be_paid == p_info["totalTuition"]
    # assert "couponDiscount" not in base_rq.payment_info
    assert "gatewayFee" not in base_rq.payment_info
    assert "monthsPaid" not in base_rq.payment_info
    assert "discountRemoved" not in base_rq.payment_info
    new_p_info = {
        **p_info,
        "couponDiscount": 300,
        "gatewayFee": 500,
        "monthsPaid": 2,
        "discountRemoved": 400,
    }
    new_response = client.post(
        f"/new-flow/update-home-tutoring-request/{base_rq.slug}",
        json.dumps({"requestData": base_rq.client_request, "paymentInfo": new_p_info}),
        content_type="application/json",
    )
    assert new_response.status_code == 200
    base_rq = BaseRequestTutor.objects.first()
    assert base_rq.payment_info["couponDiscount"] == 300
    assert base_rq.payment_info["gatewayFee"] == 500
    assert base_rq.payment_info["monthsPaid"] == 2
    assert base_rq.payment_info["discountRemoved"] == 400
    assert base_rq.tuteria_discount == 500
    assert base_rq.tutor_discount == 2700
    assert base_rq.status == BaseRequestTutor.PENDING
    amount_to_be_paid = base_rq.amount_to_be_paid
    response = client.get(
        f"/new-flow/successful-online-payment/{base_rq.slug}?amount={amount_to_be_paid}&act_code=TuteriaPermit2233"
    )
    assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.get(slug=base_rq.slug)
    assert base_rq.status == BaseRequestTutor.PAYED
    wallet = base_rq.user.wallet
    assert wallet.amount_available == amount_to_be_paid
    transaction = base_rq.request_transactions.first()
    assert float("%.2f" % transaction.total) == float("%.2f" % amount_to_be_paid)


@pytest.mark.django_db
def test_update_single_parent_issued_request(
    previous_pending_single_request,
    mocker,
):
    # mocked_call_to_tutor = mocker.patch("")
    response, p_info, no_of_tutors = previous_pending_single_request(
        discountCode="FIVE2"
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
    assert base_rq.req_instance.count() == 1
    assert base_rq.req_instance.first().status == 1
    assert base_rq.tutor.responses.count() == 1
    assert base_rq.tutor.responses.first().status == 1
    assert response.json() == {
        "status": True,
        "data": {
            "slug": base_rq.slug,
            "requestData": base_rq.client_request,
            "paymentInfo": {
                **p_info,
                "timeSubmitted": None,
                "couponDiscount": None,
                "discountCode": "FIVE2",
            },
            "splits": [],
        },
    }
    assert base_rq.budget == base_rq.full_payment
    assert base_rq.status == BaseRequestTutor.PENDING
    assert base_rq.agent is not None


@pytest.mark.django_db
def test_getting_the_agent_assigned_to_a_request(client, previous_single_request):
    previous_single_request()
    rq = BaseRequestTutor.objects.filter(related_request=None).first()
    response = client.get(f"/new-flow/home-tutoring-request/{rq.slug}")
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "slug": rq.slug,
            "requestData": rq.client_request,
            "paymentInfo": {
                **rq.payment_info,
                "walletBalance": 0,
                "paidSpeakingFee": rq.paid_fee,
            },
            "status": rq.get_status_display(),
            "splits": [],
            "tutor_responses": [],
            "agent": {
                "title": "",
                "name": "agent1",
                "phone_number": "+234703509999",
                "email": "agent1@example.com",
                "image": "",
                "slack_id": "",
            },
            "created": rq.created.isoformat(),
            "modified": rq.modified.isoformat(),
        },
    }
    # also test for when request has split


@pytest.mark.django_db
def test_update_multiple_child_parent_issued_request(
    previous_pending_multiple_request,
):
    response, p_info, no_of_tutors = previous_pending_multiple_request()
    # assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.filter(related_request=None).first()
    related = BaseRequestTutor.objects.exclude(related_request=None).all()
    assert response.json() == {
        "status": True,
        "data": {
            "requestData": base_rq.client_request,
            "paymentInfo": {**p_info, "timeSubmitted": None, "couponDiscount": None},
            "slug": base_rq.slug,
            "splits": sorted([x.slug for x in related]),
        },
    }
    assert base_rq.budget == p_info["totalTuition"] + p_info["totalDiscount"]
    assert base_rq.status == BaseRequestTutor.PENDING
    assert base_rq.agent is not None
    for i, o in enumerate(related):
        assert o.related_request == base_rq
        assert o.status == BaseRequestTutor.PENDING
        info = p_info["lessonPayments"][o.tutor_info_index]
        assert o.payment_info == info
        assert o.budget == info["lessonFee"]
        assert o.tutor.slug == no_of_tutors[o.tutor_info_index]
        assert o.req_instance.count() == 1
        assert o.req_instance.first().status == 1
        assert o.tutor.responses.count() == 1
        assert o.tutor.responses.first().status == 1


@pytest.mark.django_db
def test_parent_request_flow_multiple_split(
    client, previous_single_request, post_request
):
    BaseRequestTutor.objects.all().delete()
    raw_data = post_request(no_of_split=2)
    response = previous_single_request(no_of_split=2)
    assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.filter(related_request=None).first()
    related = base_rq.get_split_request()
    assert response.json() == {
        "status": True,
        "data": {
            **base_rq.client_request,
            "slug": base_rq.slug,
            "status": base_rq.get_status_display(),
            "splits": list([x.slug for x in related]),
        },
    }
    assert BaseRequestTutor.objects.exclude(related_request=None).count() == 2
    assert BaseRequestTutor.objects.count() == 3
    classes = []
    request_subjects = []
    for i, o in enumerate(related):
        classes.append(o.classes[0])
        request_subjects.append(o.request_subjects)
        assert o.related_request == base_rq
        assert o.status == BaseRequestTutor.COMPLETED
        assert o.client_request.get("childDetails") is not None
        assert o.request_info_for_tutor == raw_data["splitRequests"][o.tutor_info_index]
    assert set(base_rq.classes) == {"Primary 2"}
    assert base_rq.request_subjects == list(sorted(["Primary Math", "Phonics"]))
    assert base_rq.status == BaseRequestTutor.COMPLETED
    assert base_rq.request_info_for_tutor == raw_data["splitRequests"]


@pytest.mark.django_db
def test_new_parent_request_flow_single_split_request(
    client, previous_single_request, post_request
):
    assert BaseRequestTutor.objects.count() == 0
    raw_data = post_request()
    response = previous_single_request(discountCode="FIVE2")
    assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.first()
    assert base_rq.payment_info["discountCode"] == "FIVE2"
    assert response.json() == {
        "status": True,
        "data": {
            **base_rq.client_request,
            "slug": base_rq.slug,
            "splits": [],
            "status": "completed",
        },
    }
    assert BaseRequestTutor.objects.count() == 1
    assert base_rq.status == BaseRequestTutor.COMPLETED
    assert base_rq.state == "Lagos"
    assert base_rq.vicinity == "Lekki Phase 1"
    assert base_rq.email == "gbozee@example.com"
    assert base_rq.number == "+2347035209976"
    assert base_rq.is_parent_request
    assert base_rq.request_subjects == [
        "Primary Math",
        "Primary English",
        "Phonics",
        "Checkpoint Math",
        "Checkpoint English",
        "Checkpoint Science",
    ]
    assert base_rq.get_curriculum_display() == "Nigerian Curriculum"
    assert base_rq.first_name == "Mr. Abiola"
    assert base_rq.last_name == "Oyeniyi"
    assert base_rq.gender == ""
    assert base_rq.request_type == 1
    assert base_rq.classes == ["Primary 2", "JSS 2"]
    assert base_rq.is_new_home_request
    assert not base_rq.valid_request
    assert base_rq.where_you_heard == "12"
    assert base_rq.expectation == (
        f"TeacherOption: Specialized teachers\n "
        f"class: Primary 2\n name: John\n gender: male\n "
        f"specialNeeds: None\n goal: Lower Primary Education\n expectation: ja oejao jeoaj wojao\n\n "
        f"class: JSS 2\n name: Shola\n gender: female\n "
        f"specialNeeds: None\n goal: Cambridge Checkpoint\n expectation: ja oejao jeoaj wojao\n"
    )
    assert base_rq.request_info_for_tutor == raw_data["splitRequests"][0]


def test_expectation_construction_single_child(post_request):
    data = post_request()
    rq_data = data["splitRequests"][0]
    result = construct_expectation(rq_data)
    assert result == (
        f"TeacherOption: Specialized teachers\n "
        f"class: Primary 2\n name: John\n gender: male\n "
        f"specialNeeds: None\n goal: Lower Primary Education\n expectation: ja oejao jeoaj wojao\n\n "
        f"class: JSS 2\n name: Shola\n gender: female\n "
        f"specialNeeds: None\n goal: Cambridge Checkpoint\n expectation: ja oejao jeoaj wojao\n"
    )


def test_subject_mapping_works_as_expected():
    assert parse_subjects(["Literacy & Numeracy", "Phonics"]) == [
        "Literacy & Numeracy",
        "Phonics",
    ]
    assert parse_subjects(["ACT Math", "Edexcel Economics", "General Knowledge"]) == [
        "Social Studies",
        "Economics",
        "SAT Math",
    ]
    assert parse_subjects(["accounting", "ib biology"]) == [
        "Biology",
        "Principles of Accounting",
    ]


@pytest.mark.django_db
def test_request_after_landing_page(client: Client, create_issued_request):
    base_rq = create_issued_request(phone="2347032223322", customerType="parent")
    assert base_rq.status == BaseRequestTutor.ISSUED
    assert base_rq.is_split == False
    assert str(base_rq.number) == "+2347032223322"
    assert base_rq.is_parent_request
    assert base_rq.request_type == 1
    assert base_rq.is_new_home_request
    assert not base_rq.valid_request
    assert base_rq.user_country == "Nigeria"
    assert base_rq.client_request["contactDetails"]["customerType"] == "parent"

    # placing a new request should only ensure that a single base request tutor for said
    # client is created.
    response = client.post(
        "/new-flow/issue-new-home-tutoring-request",
        json.dumps(
            {
                # "email": "gbozee@example.com",
                "country": "Nigeria",
                "customerType": "parent",
                "phone": "2347032223322",
                "discountCode": "FIVE2",
            }
        ),
        "application/json",
    )
    assert response.status_code == 200
    assert BaseRequestTutor.objects.count() == 1
    base_rq = BaseRequestTutor.objects.first()
    assert base_rq.payment_info == {"discountCode": "FIVE2"}


@pytest.mark.django_db
def test_when_speaking_fee_is_made_online(
    client: Client, previous_pending_single_request
):
    response, payment_info, no_of_tutors = previous_pending_single_request()
    base_rq = BaseRequestTutor.objects.get(slug=response.json()["data"]["slug"])
    assert not base_rq.paid_fee
    fee_paid = 3000
    response = client.get(
        f"/new-flow/speaking-fee-payment/{base_rq.slug}?amount={fee_paid}&speaking_code=TuteriaPermit2233"
    )
    assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.get(slug=base_rq.slug)
    assert base_rq.status == BaseRequestTutor.MEETING
    assert base_rq.paid_fee
    transaction = base_rq.request_transactions.first()
    assert transaction.total == fee_paid


@pytest.mark.django_db
def test_when_speaking_fee_is_made_online_multiple(
    client: Client, previous_pending_multiple_request
):
    response, payment_info, no_of_tutors = previous_pending_multiple_request()
    base_rq = BaseRequestTutor.objects.filter(related_request=None).first()
    assert BaseRequestTutor.objects.count() == 3
    assert not base_rq.paid_fee
    related = base_rq.get_split_request()
    for i in related:
        assert not i.paid_fee
    fee_paid = 5000
    response = client.get(
        f"/new-flow/speaking-fee-payment/{base_rq.slug}?amount={fee_paid}&speaking_code=TuteriaPermit2233"
    )
    assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.get(slug=base_rq.slug)
    related = base_rq.get_split_request()
    first = related.first()
    last = related.last()
    assert base_rq.status == BaseRequestTutor.MEETING
    for i in related:
        assert i.status == BaseRequestTutor.MEETING
    transaction = base_rq.request_transactions.first()
    assert transaction.total == fee_paid


@pytest.mark.django_db
def test_when_payment_is_made_online(client: Client, previous_pending_single_request):
    response, payment_info, no_of_tutors = previous_pending_single_request()
    base_rq = BaseRequestTutor.objects.get(slug=response.json()["data"]["slug"])
    amount_to_be_paid = base_rq.amount_to_be_paid
    response = client.get(
        f"/new-flow/successful-online-payment/{base_rq.slug}?amount={amount_to_be_paid}&act_code=TuteriaPermit2233"
    )
    assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.get(slug=base_rq.slug)
    assert base_rq.status == BaseRequestTutor.PAYED
    wallet = base_rq.user.wallet
    assert wallet.amount_available == amount_to_be_paid
    transaction = base_rq.request_transactions.first()
    assert transaction.total == amount_to_be_paid
    assert base_rq.wallet_balance_available() == amount_to_be_paid


@pytest.mark.django_db
def test_when_payment_is_made_online_multiple(
    client: Client, previous_pending_multiple_request
):
    response, payment_info, no_of_tutors = previous_pending_multiple_request()
    base_rq = BaseRequestTutor.objects.filter(related_request=None).first()
    amount_to_be_paid = base_rq.amount_to_be_paid
    assert BaseRequestTutor.objects.count() == 3
    response = client.get(
        f"/new-flow/successful-online-payment/{base_rq.slug}?amount={amount_to_be_paid}&act_code=TuteriaPermit2233"
    )
    assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.get(slug=base_rq.slug)
    related = base_rq.get_split_request()
    first = related.first()
    last = related.last()
    assert base_rq.status == BaseRequestTutor.PAYED
    for i in related:
        assert i.status == BaseRequestTutor.PAYED
    assert (base_rq.full_payment) == first.full_payment + last.full_payment
    wallet = base_rq.user.wallet
    assert amount_to_be_paid == base_rq.full_payment - base_rq.total_discount
    assert wallet.amount_available == amount_to_be_paid
    transaction = base_rq.request_transactions.first()
    assert transaction.total == amount_to_be_paid


@pytest.mark.django_db
def test_whatsapp_webhook(client: Client, previous_pending_single_request):
    payload_data = {
        "type": "message.created",
        "sender": "+2347035209976",
        "conversationId": "0d50f4ddb8bc4476a6b4583b1bfb2896",
        "conversationStatus": "active",
        "content": {"text": "Hi"},
        "createdAt": "2021-05-18T15:07:43Z",
    }
    response, _, _ = previous_pending_single_request()
    base_rq = BaseRequestTutor.objects.first()
    assert not base_rq.last_conversation_id
    rq = BaseRequestTutor.get_request_from_conversation("", payload_data["sender"])
    assert rq == base_rq
    assert base_rq.whatsapp_number == payload_data["sender"]
    response = client.post(
        f"/new-flow/whatsapp-webhook",
        json.dumps(payload_data),
        content_type="application/json",
    )
    assert response.status_code == 200
    base_rq = BaseRequestTutor.objects.first()
    # base_rq.save_whatsapp_conversation_id(payload_data["conversationId"])
    assert base_rq.last_conversation_id == payload_data["conversationId"]

    rq = BaseRequestTutor.get_request_from_conversation(
        payload_data["conversationId"], ""
    )
    assert rq.slug == base_rq.slug


@pytest.mark.django_db
def test_update_generic_request(client: Client, previous_pending_single_request):
    _, _, _ = previous_pending_single_request()
    base_rq = BaseRequestTutor.objects.first()
    assert base_rq.client_request["contactDetails"]["preferredComms"] == {
        "channel": "whatsapp",
        "number": "2347035209976",
    }
    response = client.post(
        f"/new-flow/generic-home-tutoring-request-update/{base_rq.slug}",
        json.dumps(
            {
                "key": "contactDetails",
                "data": {
                    "preferredComms": {"channel": "whatsapp", "number": "2347035209922"}
                },
            }
        ),
        content_type="application/json",
    )
    assert response.status_code == 200
    new_base_rq = BaseRequestTutor.objects.get(slug=base_rq.slug)
    assert new_base_rq.client_request["contactDetails"]["preferredComms"] == {
        "channel": "whatsapp",
        "number": "2347035209922",
    }


@pytest.mark.django_db
def test_discount_stats(client: Client, previous_pending_single_request):
    _, _, _ = previous_pending_single_request()
    base_rq = BaseRequestTutor.objects.first()
    response = client.post(
        f"/new-flow/discount-stats",
        json.dumps({"discountCode": "TUTERIAC", "slug": base_rq.slug}),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {"has_used": False, "total_used": 0},
    }
    base_rq.request_info["paymentInfo"]["discountCode"] = "TUTERIAC"
    base_rq.save()
    response = client.post(
        f"/new-flow/discount-stats",
        json.dumps({"discountCode": "TUTERIAC", "slug": base_rq.slug}),
        content_type="application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {"has_used": False, "total_used": 1},
    }


# implement discount code.
# 1. creating new codes.
# 2. For each user using a code. validate
# a. The time of the code is still valid
# b. The number of use count is less than the limit used.
# c. If the client has used the code before.
# 3. A way to be able to tell the number of users that have used a code successfully.