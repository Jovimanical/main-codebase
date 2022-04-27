import json
from users.models import User
from external.models import BaseRequestTutor, Agent
from pricings.models import Pricing, Region
from pytest_django import asserts
from external.subjects_2 import construct_expectation, parse_subjects
import pytest
from django.shortcuts import reverse


def create_user(**kwargs):
    user = User.objects.create(**kwargs)
    return user


def create_request(**kwargs):
    rq = BaseRequestTutor.objects.create(**kwargs)
    return rq


@pytest.fixture
def post_request():
    location_details = lambda x: {
        "methodOfDelivery": x,
        "country": "Nigeria",
        "state": "Lagos",
        "region": "Ikoyi",
    }
    child_with_special_needs = lambda x, expectation, need: {
        **x,
        "expectation": expectation,
        "special_needs": need,
    }
    single_child = lambda needs: [
        child_with_special_needs(
            {
                "firstName": "Abiola",
                "gender": "male",
                "classDetail": {
                    "class": "Nursery 1",
                    "purpose": "Early Child Education",
                    "subjects": ["Literacy & Numeracy", "Phonics"],
                },
            },
            "aoej aoej ajoei jaoiej oaieae aeo jaoe jao",
            "",
        )
    ]
    multiple_children = single_child("") + [
        {
            "firstName": "Shola",
            "gender": "female",
            "classDetail": {
                "class": "Primary 1",
                "purpose": "Lower Primary Education",
                "subjects": ["Primary Math"],
            },
            "expectation": "best child",
            "special_needs": "",
        }
    ]
    contact_details = {
        "title": "Mr.",
        "firstName": "Abiola",
        "lastName": "Oyeniyi",
        "email": "gboze@gmail.com",
        "phone": "2347035209922",
        "preferredComms": {"channel": "whatsapp", "number": "2347035209922"},
        "medium": "From a friend",
    }
    lesson_schedule = lambda days, hours, duration, plan, teacherKind, rate: {
        "lessonDays": days,
        "lessonHours": hours,
        "lessonTime": "4:00 PM",
        "lessonDuration": duration,
        "lessonUrgency": "",
        "lessonPlan": plan,
        "hourlyRate": rate,
        "extraStudentFx": 0.2,
        "premiumFx": 1.4,
        "teacherKind": teacherKind,
    }

    def split_requests(a, tO, names):
        return {
            "teacherOption": tO,
            "purposes": [a["classDetail"]["purpose"]],
            "class": [a["classDetail"]["class"]],
            "names": names,
            "specialNeeds": [],
            "subjectGroup": a["classDetail"]["subjects"],
            "forTeacher": [a],
        }

    def _post_request(
        child_count=1,
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
        about_child = single_child(special_needs)
        teacherOption = "One teacher"
        if child_count > 1:
            about_child = multiple_children
            teacherOption = "Specialized Teachers"
        names = [x["firstName"] for x in about_child]
        data = {
            "locationDetails": location_details(request_type),
            "aboutChildDetails": {
                "childDetails": about_child,
                "splitRequests": [
                    split_requests(x, teacherOption, names) for x in about_child
                ],
            },
            "selectTeacherDetails": {
                "teacherOption": teacherOption,
                "teacherGender": teacherGender,
                "curriculum": ["British"],
            },
            "contactDetails": contact_details,
            "lessonSchedule": lesson_schedule(
                days, hours, duration, plan, teacherOption, rate
            ),
        }
        return data

    return _post_request


@pytest.fixture
def previous_single_request(client, post_request):
    def _previous_single_request(agent=None, **kwargs):
        data = post_request(**kwargs)
        response = client.post(
            "/new-flow/save-home-tutoring-request",
            json.dumps({"requestData": data, **kwargs}),
            content_type="application/json",
        )
        assert response.status_code == 200
        rq = BaseRequestTutor.objects.first()
        assert BaseRequestTutor.objects.count() == 1
        if agent:
            rq.agent = agent
            rq.status = BaseRequestTutor.COMPLETED
            rq.save()

        return rq

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



def test_expectation_construction_single_child(post_request):
    data = post_request()
    rq_data = data["aboutChildDetails"]["splitRequests"][0]
    result = construct_expectation(rq_data)
    assert result == (
        f"TeacherOption: One teacher\n "
        f"class: Nursery 1\n name: Abiola\n gender: male\n "
        f"goal: Early Child Education\n expectation: aoej aoej ajoei jaoiej oaieae aeo jaoe jao\n"
    )


def test_expectation_construction_multiple_child(post_request):
    data = post_request(child_count=1)
    rq_data = data["aboutChildDetails"]["splitRequests"][0]
    rq_data["forTeacher"].append(
        {
            "firstName": "Shola",
            "gender": "female",
            "classDetail": {
                "class": "Primary 1",
                "purpose": "Lower Primary Education",
                "subjects": ["Literacy & Numeracy", "Phonics"],
            },
            "expectation": "best child",
            "special_needs": "",
        }
    )
    result = construct_expectation(rq_data)
    assert result == (
        f"TeacherOption: One teacher\n "
        f"class: Nursery 1\n name: Abiola\n gender: male\n "
        f"goal: Early Child Education\n expectation: aoej aoej ajoei jaoiej oaieae aeo jaoe jao\n\n "
        f"class: Primary 1\n name: Shola\n gender: female\n "
        f"goal: Lower Primary Education\n expectation: best child\n"
    )


def test_expectation_construction_premium_tutor(post_request):
    data = post_request()
    rq_data = data["aboutChildDetails"]["splitRequests"][0]
    result = construct_expectation(rq_data, "premium")
    assert result == (
        f"TeacherOption: One teacher\n PREMIUM TUTOR REQUEST\n "
        f"class: Nursery 1\n name: Abiola\n gender: male\n "
        f"goal: Early Child Education\n expectation: aoej aoej ajoei jaoiej oaieae aeo jaoe jao\n"
    )


def test_expectation_construction_special_needs(post_request):
    data = post_request(special_needs="Dyslexia")
    rq_data = data["aboutChildDetails"]["splitRequests"][0]
    rq_data["forTeacher"][0]["special_needs"] = "Dyslexia"
    result = construct_expectation(rq_data)
    assert result == (
        f"TeacherOption: One teacher\n "
        f"class: Nursery 1\n name: Abiola\n gender: male\n specialNeeds: Dyslexia\n "
        f"goal: Early Child Education\n expectation: aoej aoej ajoei jaoiej oaieae aeo jaoe jao\n"
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

