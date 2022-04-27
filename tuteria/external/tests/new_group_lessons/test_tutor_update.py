import pytest
import datetime
import json
from django.test import Client
from users.models import User, Location, PhoneNumber, UserIdentification, UserProfile
from external.models import BaseRequestTutor
from external.services import SingleRequestService
from django.core.signing import b64_encode
from registration.models import Education, WorkExperience


def saved_data():
    return {
        "personalInfo": {
            "email": "james@example.com",
            "firstName": "GB",
            "lastName": "shola",
            "country": "Nigeria",
            "state": "Lagos",
            "dateOfBirth": "2000-05-10",
            "gender": "male",
            "address": "Adeniyi Jones",
            "phone": "23470358823323",
            "vicinity": "",
            "region": "",
        },
        "educationWorkHistory": {
            "educations": [
                {
                    "school": "Eleja School",
                    "course": "Systems Engineering",
                    "degree": "B.Sc",
                }
            ],
            "workHistories": [
                {
                    "company": "Tuteria Limited",
                    "role": "Teacher",
                    "isCurrent": True,
                    "isTeachingRole": True,
                }
            ],
        },
        "identity": {"isIdVerified": True},
        "teachingProfile": {"curriculums": ["Nigerian", "British"]},
        "agreement": {"amountEarned": 0.0, "taxP": 5},
    }


@pytest.mark.django_db
def test_tutor_update_login(client: Client, create_user, mocker):
    sample_user = create_user(is_tutor=True)

    response = client.post(
        "/new-flow/login",
        json.dumps(
            {"email": "james@example.com", "password": "password101", "is_tutor": True}
        ),
        "application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            **saved_data(),
            "slug": sample_user.slug,
            "application_status": "VERIFIED",
        },
    }
    # implement password_less login
    mocked_random = mocker.patch("external.new_group_flow.services.get_random_string")
    mocked_random.return_value = "AjcDw"

    response = client.post(
        "/new-flow/login",
        json.dumps({"email": "james@example.com", "is_tutor": True}),
        "application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {"code": "AjcDw", "email": "james@example.com"},
    }
    # authenticate with invalid code
    response = client.post(
        "/new-flow/login",
        json.dumps({"email": "james@example.com", "code": "ssseww", "is_tutor": True}),
        "application/json",
    )
    assert response.status_code == 400
    assert response.json() == {
        "status": False,
        "errors": "Invalid email or password or code",
    }
    # authenticated with valid code
    response = client.post(
        "/new-flow/login",
        json.dumps({"email": "james@example.com", "code": "AjcDw", "is_tutor": True}),
        "application/json",
    )
    assert response.json() == {
        "status": True,
        "data": {
            **saved_data(),
            "slug": sample_user.slug,
            "application_status": "VERIFIED",
        },
    }


@pytest.mark.django_db
def test_tutor_update_sections(client: Client, create_user, create_admin):
    sample_user = create_user(is_tutor=True)
    admin = create_admin()
    sample_user.data_dump = {"tutor_update": saved_data()}
    sample_user.save()
    # update personal info
    personal_info = {
        "email": sample_user.email,
        "firstName": "Jones",
        "lastName": "Ishola",
        "country": "Nigeria",
        "state": "Lagos",
        "dateOfBirth": "2003-05-10",
        "gender": "female",
        "address": "Adeniyi Jones",
        "vicinity": "Agege",
        "region": "Dopemu",
    }
    response = client.post(
        f"/new-flow/tutor/{sample_user.slug}/update",
        json.dumps({"personalInfo": personal_info}),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    result = {**saved_data(), "personalInfo": personal_info}
    assert response.json() == {"status": True, "data": result}
    user = User.objects.get(email=personal_info["email"])
    assert user.data_dump["tutor_update"] == result
    # update education and workHistories
    education_work = {
        "educations": [
            {
                "school": "Ikeja Grammar school",
                "country": "Nigeria",
                "course": "Chemistry",
                "degree": "B.Sc",
                "startYear": "2006",
                "endYear": "2020",
                "grade": "First Class",
            }
        ],
        "workHistories": [
            {
                "company": "Tuteria Limited",
                "role": "CEO",
                "isTeachingRole": False,
                "startYear": "2015",
                "endYear": "2020",
                "isCurrent": True,
                "showOnProfile": True,
                "classGroup": [],
            }
        ],
    }
    # education and workhistory update
    response = client.post(
        f"/new-flow/tutor/{sample_user.slug}/update",
        json.dumps({"educationWorkHistory": education_work}),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    result = {
        **saved_data(),
        "personalInfo": personal_info,
        "educationWorkHistory": education_work,
    }
    assert response.json() == {"status": True, "data": result}
    user = User.objects.get(email=personal_info["email"])
    assert user.data_dump["tutor_update"] == result
    # teaching profile update
    teaching_profile = {
        "classGroup": ["Lower Primary", "Pre-primary"],
        "curriculums": ["British", "Nigerian"],
        "examExperience": {
            "exams": [
                "Common Entrance Exam",
                "Cambridge Checkpoint",
                "13+ Entrance Exam",
            ],
            "schools": ["Greensprings", "Grange"],
        },
        "specialNeeds": ["ADD/ADHD", "Dyslexia"],
        "tutorDisabilities": ["ADD/ADHD"],
        "onlineProfile": {
            "acceptsOnline": True,
            "hasComputer": True,
            "hasInternet": True,
        },
    }
    response = client.post(
        f"/new-flow/tutor/{sample_user.slug}/update",
        json.dumps({"teachingProfile": teaching_profile}),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    result = {
        **saved_data(),
        "personalInfo": personal_info,
        "educationWorkHistory": education_work,
        "teachingProfile": teaching_profile,
    }
    assert response.json() == {"status": True, "data": result}
    user = User.objects.get(email=personal_info["email"])
    assert user.data_dump["tutor_update"] == result

    # identity update
    identity = {
        "profilePhoto": "profile_pics/npvpoctdcpwwuhs4k1do",
        "profilePhotoId": "profile_pics/npvpoctdcpwwuhs4k1do",
        "isIdVerified": False,
        "uploadStore": {
            "files": [
                {"name": "sample.png", "url": "profile_pics/npvpoctdcpwwuhs4k1do"}
            ]
        },
    }
    response = client.post(
        f"/new-flow/tutor/{sample_user.slug}/update",
        json.dumps({"identity": identity}),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    result = {
        **saved_data(),
        "personalInfo": personal_info,
        "educationWorkHistory": education_work,
        "teachingProfile": teaching_profile,
        "identity": identity,
    }
    assert response.json() == {"status": True, "data": result}
    user = User.objects.get(email=personal_info["email"])
    assert user.data_dump["tutor_update"] == result

    agreement = {"lessonPercent": True, "amountEarned": 567_650, "taxP": 5}
    response = client.post(
        f"/new-flow/tutor/{sample_user.slug}/update",
        json.dumps({"agreement": agreement}),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    result = {
        **saved_data(),
        "personalInfo": personal_info,
        "educationWorkHistory": education_work,
        "teachingProfile": teaching_profile,
        "identity": identity,
        "agreement": agreement,
    }
    assert response.json() == {"status": True, "data": result}
    user = User.objects.get(email=personal_info["email"])
    assert user.data_dump["tutor_update"] == result
    other_data = {"newDevelopment": True, "submission": True}
    response = client.post(
        f"/new-flow/tutor/{sample_user.slug}/update",
        json.dumps({"others": other_data}),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    result = {
        **saved_data(),
        "personalInfo": personal_info,
        "educationWorkHistory": education_work,
        "teachingProfile": teaching_profile,
        "identity": identity,
        "agreement": agreement,
        "others": other_data,
    }
    assert response.json() == {"status": True, "data": result}
    user = User.objects.get(email=personal_info["email"])
    assert user.data_dump["tutor_update"] == result
    assert user.email == personal_info["email"]
    assert user.first_name == personal_info["firstName"]
    assert user.last_name == personal_info["lastName"]
    home_address = user.home_address
    assert home_address.state == personal_info["state"]
    assert home_address.address == personal_info["address"]
    assert home_address.vicinity == personal_info["vicinity"]
    assert home_address.lga == personal_info["region"]
    assert user.profile.dob == datetime.date(2003, 5, 10)
    # education udpate
    user_educations = user.education_set.all()
    user_work_histories = user.workexperience_set.all()
    assert [
        {"school": x.school, "course": x.course, "degree": x.degree}
        for x in user_educations
    ] == [
        {"school": x["school"], "course": x["course"], "degree": x["degree"]}
        for x in education_work["educations"]
    ]
    assert [
        {"company": x.name, "role": x.role, "isCurrent": x.currently_work}
        for x in user_work_histories
    ] == [
        {"company": x["company"], "role": x["role"], "isCurrent": x["isCurrent"]}
        for x in education_work["workHistories"]
    ]
    # # teaching profile update
    # profile = user.profile
    # assert profile.curriculum_display() == ["British", "Nigerian"]
    # identity update
    profile = UserProfile.objects.get(user=user)
    assert profile.image.public_id == identity["profilePhoto"]
    identification = user.identity
    assert not identification.verified
    assert identification.identity.public_id == "profile_pics/npvpoctdcpwwuhs4k1do"
