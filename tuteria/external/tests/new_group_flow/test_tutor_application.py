import pytest
from external.new_group_flow.services import LoginService
from tutor_management.models import TutorApplicantTrack
from users.models import User, UserProfile


@pytest.fixture
def create_user():
    def _create_user():
        instance, _ = User.objects.get_or_create(
            email="john@example.com", first_name="John", last_name="Example"
        )
        return instance

    return _create_user


@pytest.mark.django_db
def test_updating_tutor_info(create_user):
    user_instance: User = create_user()
    payload = {
        "pk": user_instance.pk,
        "slug": user_instance.slug,
        "others": {
            "loading": False,
            "premium": False,
            "canApply": False,
            "isDeluxe": False,
            "inProbation": False,
            "videoSummary": {"id": "", "url": ""},
            "videoVerified": False,
            "newDevelopment": False,
        },
        "appData": {
            "currentStep": "verify",
            "receiveJobs": True,
            "dateSubmitted": "2022-05-25T22:38:11.302Z",
            "currentEditableForm": "",
        },
        "identity": {
            "canApply": False,
            "uploadStore": {"files": []},
            "isIdVerified": False,
            "profilePhoto": "https://res.cloudinary.com/tuteria/image/upload/v1653518849/profile_pics/giftj3-profile.png",
            "profilePhotoId": "profile_pics/giftj3-profile",
        },
        "agreement": {"taxP": 5, "amountEarned": 0},
        "paymentInfo": {"country": "Nigeria"},
        "availability": {"exemptedAreas": [], "preferredLessonType": ["online"]},
        "personalInfo": {
            "email": user_instance.email,
            "phone": "2347019324363",
            "state": "Anambra",
            "gender": "female",
            "medium": "From a friend",
            "region": "Idemili South",
            "address": "Agep filling station street",
            "country": "Nigeria",
            "canApply": False,
            "lastName": "John",
            "vicinity": "Oba ",
            "firstName": user_instance.first_name,
            "alternateNo": "",
            "dateOfBirth": "1998-02-24",
            "nationality": "Nigeria",
            "country_code": "NG",
            "subscription": True,
            "whatsappNumber": "2348104908581",
            "locationCountry": "Nigeria",
            "primaryLanguage": "English",
            "supportedCountryAccount": "Nigeria",
        },
        "teachingProfile": {"curriculums": []},
        "educationWorkHistory": {
            "canApply": False,
            "educations": [
                {
                    "grade": "Distinction",
                    "proof": {"id": "", "url": ""},
                    "course": "Biology education",
                    "degree": "B.Ed",
                    "school": "Nnamdi azikiwe university",
                    "country": "Nigeria",
                    "endYear": "2024",
                    "startYear": "2021",
                    "speciality": "Biological and Physical Sciences",
                }
            ],
            "guarantors": [],
            "workHistories": [
                {
                    "role": "Primary social Teacher",
                    "proof": {"id": "", "url": ""},
                    "company": "Vessel of honour school",
                    "endYear": "2021",
                    "isCurrent": False,
                    "startYear": "2019",
                    "showOnProfile": True,
                    "isTeachingRole": True,
                }
            ],
        },
    }
    LoginService.update_tutor_info(user_instance.slug, payload, _process=False)
    
    profile = UserProfile.objects.get(user=user_instance)
    assert profile.image.public_id is None

    applicant:TutorApplicantTrack = user_instance.as_applicant()
    assert applicant is not None
    
    applicant.update_profile_picture()
    profile = UserProfile.objects.get(user=applicant)
    assert profile.image.public_id == payload["identity"]["profilePhotoId"]
