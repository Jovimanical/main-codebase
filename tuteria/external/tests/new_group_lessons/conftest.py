import pytest
import datetime
from django.test import Client
from users.models import User, Location, PhoneNumber, UserIdentification, UserProfile
from external.models import BaseRequestTutor, Agent
import json
from registration.models import Education, WorkExperience


@pytest.fixture
def create_admin():
    def _create_admin():
        admin = User.objects.create(
            email="john@example.com",
            username="john@example.com",
            first_name="John",
            is_superuser=True,
        )
        admin.set_password("password101")
        admin.save()
        return admin

    return _create_admin


@pytest.fixture
def create_user():
    def _create_user(is_tutor=False):
        sample_user = User.objects.create(
            email="james@example.com",
            first_name="GB",
            last_name="shola",
            username="james@example.com",
            country="NG",
        )
        sample_user.set_password("password101")
        sample_user.save()
        if is_tutor:
            profile = sample_user.profile
            profile.gender = "M"
            profile.application_status = 3
            profile.dob = datetime.date(2000, 5, 10)
            profile.save()
            PhoneNumber.objects.create(
                owner=sample_user, number="+23470358823323", primary=True
            )
            Location.objects.create(
                state="Lagos", address="Adeniyi Jones", user=sample_user
            )
            profile = sample_user.profile
            profile.curriculum_used = ["1", "2"]  # Nigerian and British
            profile.save()
            Education.objects.create(
                tutor=sample_user,
                school="Eleja School",
                course="Systems Engineering",
                degree="B.Sc",
                verified=True,
            )
            WorkExperience.objects.create(
                tutor=sample_user,
                verified=True,
                name="Tuteria Limited",
                role="Teacher",
                currently_work=True,
            )
            UserIdentification.objects.create(user=sample_user, verified=True)
        return sample_user

    return _create_user


@pytest.fixture
def class_info():
    def _class_info(course_id, class_id, related_subject="IELTS"):
        return {
            "courseID": course_id,
            "related_subject": "IELTS",
            "classSelected": class_id,
            "totalFee": 40000,
            "currency": "",
            "currency_symbol": "₦",
        }

    return _class_info
    # "₦": { "₵": 50, S: 2, $: 200, "£": 250, "€": 250 },


@pytest.fixture
def request_info():
    def _request_info(**kwargs):
        return {
            "venue": "offline",
            "students": [],
            "children": [],
            "upsell": {},
            "medium": "From a friend",
            "paymentMethod": "",
            "paymentOption": "",
            **kwargs,
        }

    return _request_info


@pytest.fixture
def create_request(client: Client, class_info, request_info):
    def _create_request():
        sample_obj = {
            "personalInfo": {
                "firstName": "Godwin",
                "lastName": "Benson",
                "email": "busybenson@example.com",
                "phone": "2347035209976",
                "preferredComms": {"channel": "whatsapp", "number": "2347035209976"},
                "address": "20 Agede Street",
                "vicinity": "Agungi",
                "region": "Lekki",
                "state": "Lagos",
                "country": "NG",
                "password": "password101",
            },
            "classInfo": class_info("course11", "YorubaClass2"),
            "requestInfo": request_info(),
        }
        response = client.post(
            "/new-flow/initialize-request", json.dumps(sample_obj), "application/json"
        )
        slug = response.json()["data"]["bookingID"]
        request = BaseRequestTutor.objects.filter(slug=slug).first()
        return request

    return _create_request


@pytest.fixture
def create_agent():
    def _create_agent():
        sample_agent = Agent.objects.bulk_create(
            [
                Agent(
                    email="agent1@example.com",
                    name="agent1",
                    phone_number="+234703509999",
                ),
                Agent(email="agent2@example.com", name="agent2", type=Agent.GROUP),
            ]
        )

    return _create_agent