import json
from pdb import set_trace
import statistics
import typing
import cloudinary
import requests
from django.conf import settings
from django.utils import timezone
from django.db import models
from config import const
from config.signals import create_subjects
from external.new_group_flow.services import (
    LoginService,
    TutorRevampService,
    HomeTutoringRequestService,
)
from skills.models.models1 import QuizSitting, Skill, TutorSkill
from skills.services import SingleTutorSkillService
from users.models.models1 import User, PhoneNumber
from users.services import UserService
from django_quiz.quiz.models import Quiz
from config.utils import get_static_data


class Result:
    def __init__(self, msg="", errors=None, data=None, status_code=200):
        self.errors = errors
        self.data = data
        self.msg = msg
        self.status_code = status_code


class Constants:
    SUBJECTS = "subjects"
    PERSONAL_INFO = "personal-info"
    LOCATION_INFO = "location-info"
    VERIFICATION = "verification"
    EDUCATION_HISTORY = "education-history"
    WORK_HISTORY = "work-history"
    TEACHING_PROFILE = "teaching-profile"
    PROFILE_PHOTO = "verification-info"
    JOBS = "jobs"
    SCHEDULE_INFO = "schedule-info"
    GUARANTOR_INFO = "guarantor-info"
    UPLOAD_PROOF = "upload-proof"
    POST_APPLICATION = "post-application"


def get_service_config(media_format):
    response = requests.get(
        f"{settings.CDN_SERVICE}/api/get-cloudinary-details?media_format={media_format}"
    )
    if response.status_code < 400:
        result = response.json()
        return result["data"]
    return {}


def get_quiz_data(payload):
    response = requests.post(
        f"{settings.CDN_SERVICE}/api/generate-quiz",
        json={**payload, "total_questions": 15},
    )
    if response.status_code < 400:
        result = response.json()
        d = result["data"]
        return d


def get_subjects_data(user: User):
    static_data = get_static_data()
    allowedQuizes = const.cached_category_skills(user)
    subjects = TutorRevampService.get_subjects({"email": user.email, "raw": True})
    allowedQuizes = [x for x in allowedQuizes if x.get("testable")]
    response = requests.post(
        f"{settings.CDN_SERVICE}/api/subject-data",
        json={
            "subjects": subjects.data["object_list"],
            "allowedQuizzes": allowedQuizes,
        },
    )
    if response.status_code < 400:
        result = response.json()
        d = result["data"]
        return {
            "tutorSubjects": d["skills"],
            "tuteriaSubjects": static_data.get("tuteriaSubjects") or [],
            "supportedCountries": static_data.get("supportedCountries") or [],
            "preferences": static_data.get("preferences") or [],
            "groups": [],
        }
    return {}


def build_cloudinary_url(public_id):
    result = requests.post(
        f"{settings.CDN_SERVICE}/api/get-cloudinary-url",
        json={"public_id": public_id, "media_format": settings.MEDIA_FORMAT},
    )
    if result.status_code < 400:
        j = result.json()
        return j["data"]
    return ""


def get_tutor_jobs_data(user: User):
    jobs = HomeTutoringRequestService.get_tutor_jobs(user.slug)
    response = requests.post(
        f"{settings.CDN_SERVICE}/api/tutor-jobs",
        json={"slug": user.slug, "jobs": jobs.data},
    )
    if response.status_code < 400:
        result = response.json()
        return result["data"]
    return []


class NewTutorFlowService:
    @classmethod
    def make_non_testable_subject_testable(cls, data):
        subjects = data.get("subjects") or []

        with_quiz = [x["quiz"] for x in subjects]
        without_quiz = [x["name"] for x in subjects]
        merged = with_quiz + without_quiz
        all_skill_with_quizzes = Skill.objects.filter(name__in=merged)
        rr = []
        for i in subjects:
            name = [x for x in all_skill_with_quizzes if x.name == i["name"]]
            quiz = [x for x in all_skill_with_quizzes if x.name == i["quiz"]]
            if name and quiz:
                name = name[0]
                quiz = quiz[0]
                name.quiz = quiz.quiz
                name.save()
                rr.append(name)
        return Result(data=[{"name": x.name, "quiz_url": x.quiz_url} for x in rr])

    @classmethod
    def get_profile_info(cls, user: User, key: str):
        result = LoginService.tutor_login({"email": user.email}, True)
        response = {}
        if key == Constants.VERIFICATION:
            response = {
                x: result.get(x) for x in ["educationWorkHistory", "identity", "slug"]
            }
        if key == Constants.PERSONAL_INFO:
            static_data = get_static_data()
            static_data["countries"] = static_data.get("allCountries") or []
            static_data["regions"] = static_data.get("allRegions") or []
            tutor_info = {x: result.get(x, {}) for x in ["personalInfo", "appData"]}
            response = {"tutorInfo": tutor_info, "staticData": static_data}
        if key == Constants.LOCATION_INFO:
            static_data = get_static_data()
            static_data["countries"] = static_data["allCountries"]
            static_data["regions"] = static_data["allRegions"]
            tutor_info = {
                x: result.get(x, {})
                for x in ["personalInfo", "availability", "slug", "appData"]
            }
            response = {"tutorInfo": tutor_info, "staticData": static_data}
        if key == Constants.EDUCATION_HISTORY:
            static_data = get_static_data()
            static_data["countries"] = static_data["allCountries"]
            static_data["regions"] = static_data["allRegions"]
            tutor_info = {x: result.get(x) for x in ["educationWorkHistory"]}
            response = {"tutorInfo": tutor_info, "staticData": static_data}
        if key == Constants.WORK_HISTORY:
            tutor_info = {x: result.get(x) for x in ["educationWorkHistory"]}
            response = {"tutorInfo": tutor_info}
        if key == Constants.TEACHING_PROFILE:
            tutor_info = {x: result.get(x) for x in ["teachingProfile"]}
            response = {"tutorInfo": tutor_info}
        if key == Constants.PROFILE_PHOTO:
            tutor_info = {
                x: result.get(x, {}) for x in ["identity", "personalInfo", "appData"]
            }
            image_field = user.cloudinary_image
            if image_field:
                tutor_info["identity"]["profilePhoto"] = image_field.replace(
                    "http:/", "https:/"
                )
            response = {"tutorInfo": {"slug": user.slug, **tutor_info}}
        if key == Constants.SCHEDULE_INFO:
            tutor_info = {x: result.get(x, {}) for x in ["availability"]}
            response = {"tutorInfo": tutor_info}
        if key == Constants.SUBJECTS:
            # we need to update the status of subjects not completed
            pending_subjects = user.tutorskill_set.require_modification()
            for i in pending_subjects:
                uu = SingleTutorSkillService(get=False, instance=i)
            subject_data = get_subjects_data(user)
            static_data = get_static_data()
            education_work_history = result.get("educationWorkHistory") or []
            static_data["regions"] = static_data["allRegions"]
            formatted_static_data = {
                x: static_data.get(x) for x in ["regions", "educationData", "pricing"]
            }
            tutor_info = {
                x: result.get(x)
                for x in ["educationWorkHistory", "personalInfo", "others"]
            }
            response = {
                "educationWorkHistory": education_work_history,
                "subjectData": subject_data,
                "staticData": formatted_static_data,
                "tutorInfo": tutor_info,
            }
        if key == Constants.POST_APPLICATION:
            static_data = get_static_data()
            static_data["countries"] = static_data["allCountries"]
            static_data["regions"] = static_data["allRegions"]
            tutor_info = {
                x: result.get(x)
                for x in [
                    "personalInfo",
                    "paymentInfo",
                    "agreement",
                    "others",
                ]
            }
            response = {"tutorInfo": tutor_info, "staticData": static_data}
        if key == Constants.JOBS:
            tutor_info = {x: result.get(x) for x in ["personalInfo", "others"]}
            jobs = get_tutor_jobs_data(user)
            return {"tutorInfo": tutor_info, "jobs": jobs}
        return response

    @classmethod
    def generate_quiz(cls, passed_payload):
        payload = passed_payload["subjectInfo"]
        quiz_data = get_quiz_data({"transform": False, **payload})
        result = Quiz.bulk_create_subject_quiz_info(quiz_data)
        new_result = get_quiz_data(
            {"transform": True, "quizzes": [dict(s) for s in result], **payload}
        )
        return Result(data=new_result)

    @classmethod
    def get_related_subjects(cls, params):
        return TutorRevampService.get_related_subjects(params)

    @classmethod
    def populate_related_subjects(cls, params):
        process = params.get("process")
        subjects_to_add = params.get("subjects_to_add")
        tutor = params.get("tutor")
        if tutor:
            if not isinstance(tutor, User):
                tutor = User.objects.get(email=params["email"])
            return Result(
                data=TutorRevampService.check_tutor_qualification_status(
                    tutor, params["request_slug"], kind=3
                )
            )
        result = TutorRevampService.get_related_subjects(params, raw=process)
        if process:
            subjects = [x["suggested"] for x in result]
            if subjects_to_add:
                subjects = [
                    x["suggested"] for x in result if x["subject"] in subjects_to_add
                ]
            cls.update_subjects_to_teach(
                {"email": params["email"], "subjects": subjects}
            )
            tutor = User.objects.get(email=params["email"])
            tutor_info = cls.get_profile_info(tutor, Constants.SUBJECTS)
            tutor_info["subjectData"]["jobSubjects"] = [
                x for x in result if x["suggested"] in subjects
            ]
            return Result(data=tutor_info)
            return [x for x in result if x["suggested"] in subjects]
        return result

    @classmethod
    def delete_media(cls, payload):
        response = requests.post(
            f"{settings.CDN_SERVICE}/api/delete-media",
            json={
                "id": payload["id"],
                "kind": payload.get("kind", "image"),
                "media_format": settings.MEDIA_FORMAT,
            },
        )
        if response.status_code < 400:
            result = response.json()
            return Result(data=result)
        return Result(errors={"msg": "Error deleting media"}, status_code=400)

    @classmethod
    def save_subjects(cls, payload, user: User):
        subjects = cls.update_subjects_to_teach(payload)
        if subjects.data:
            result = get_subjects_data(user)
            return Result(data=result)
        return subjects

    @classmethod
    def process_quiz_completion(cls, payload):
        grading = payload["grading"]
        flagged = payload.get("flagged") or []
        if len(flagged) > 0:
            requests.post(
                f"{settings.CDN_SERVICE}/api/flag-questions", json={"flagged": flagged}
            )
        grouped_grading = {
            "name": payload["name"],
            "email": payload["email"],
            "passed": [],
            "failed": [],
        }
        for i in grading["result"]:
            if i.get("passed"):
                grouped_grading["passed"].append(
                    {"score": i.get("score"), "skill": i.get("subject")}
                )
            else:
                grouped_grading["failed"].append(
                    {"score": i.get("score"), "skill": i.get("subject")}
                )
        return cls.update_quiz(grouped_grading)

    @classmethod
    def process_spell_check(cls, payload):
        response = requests.post(
            f"{settings.CDN_SERVICE}/api/spell-checker",
            json={"checks": payload["checks"]},
        )
        if response.status_code < 400:
            result = response.json()
            return Result(data=result)
        return Result(errors={"msg": "Error running spell check"}, status_code=400)

    @classmethod
    def update_tutor_info(cls, user: User, post_data):
        response = LoginService.update_tutor_info(
            slug=user.slug, data=post_data, _process=True
        )
        if response:
            return Result(data=response)
        return Result(errors={"msg": "Could not save tutor data"})

    @classmethod
    def update_tutor_response(cls, post_data, user: User):
        result = HomeTutoringRequestService.save_tutor_response(post_data)
        return result

    @classmethod
    def post_action(cls, raw_data, user: User, files=None):
        post_data = raw_data
        if not files:
            post_data = raw_data["data"]
        else:
            post_data = raw_data.dict()
        options = {
            "/api/tutors/spell-check": lambda: cls.process_spell_check(post_data),
            "/api/tutors/save-subject-info": lambda: TutorRevampService.save_subject_info(
                post_data
            ),
            "/api/tutors/delete-media": lambda: cls.delete_media(post_data),
            "/api/tutors/select-subjects": lambda: cls.save_subjects(
                {"email": user.email, "subjects": post_data["subjects"]}, user
            ),
            "/api/quiz/begin": lambda: cls.bulk_begin_quiz(
                {"email": user.email, "post_data": post_data}
            ),
            "/api/tutors/save-tutor-info": lambda: cls.update_tutor_info(
                user, post_data
            ),
            "/api/exam/complete": lambda: cls.process_quiz_completion(
                {**post_data, "email": user.email}
            ),
            "/api/quiz/generate": lambda: cls.generate_quiz(post_data),
            "/api/tutors/delete-tutor-subject": lambda: cls.delete_subjects(
                {"email": user.email, "ids": post_data["ids"]}
            ),
            "/api/home-tutoring/update-tutor-response": lambda: cls.update_tutor_response(
                post_data, user
            ),
            "/api/tutors/validate-personal-info": lambda: cls.validate_personal_info(
                {"email": user.email, "data": post_data}
            ),
            "/api/tutors/populate-subject-for-job": lambda: cls.populate_related_subjects(
                {
                    "email": user.email,
                    "request_slug": post_data.get("request_slug"),
                    "subjects_to_add": post_data.get("subjects_to_add"),
                    "process": post_data.get("process"),
                    "tutor": user if post_data.get("tutor") else None,
                }
            ),
        }
        if files:
            kind = post_data.pop("kind")
            service_config = get_service_config(settings.MEDIA_FORMAT)
            post_data["server_config"] = json.dumps(service_config)
            result = requests.post(
                f"{settings.MEDIA_SERVICE}/media/{settings.MEDIA_FORMAT}/upload",
                files={kind: files["media"]},
                data=post_data,
                proxies={"http": "", "https": ""},
            )
            if result.status_code < 400:
                rr = result.json()
                data = rr["data"]
                if data.get("full_response"):
                    r = data["full_response"]
                    quality = (
                        r.get("quality_analysis", {"focus": 0}).get("focus") >= 0.2
                    )
                    uu = {
                        "public_id": r["public_id"],
                        "bytes": r["bytes"],
                        "url": r["secure_url"],
                        "has_face": True,
                        "quality": True,
                    }
                    # if post_data.get("transform"):
                    #     c_url = build_cloudinary_url(uu["public_id"])
                    #     if c_url:
                    #         uu["url"] = c_url

                    return Result(data=uu)

            return Result(errors={"msg": "Error uploading document"})
        else:
            result = options[raw_data["path"]]()
            return result

    @classmethod
    def delete_subjects(cls, body):
        email = body.get("email")
        tutor_skill_id = body.get("ids") or []
        tutor = User.objects.filter(email__iexact=email).first()
        if not tutor:
            return Result(errors={"msg": "invalid tutor"})
        ts: typing.List[TutorSkill] = tutor.tutorskill_set.filter(
            pk__in=tutor_skill_id
        ).all()
        if not ts:
            return Result(errors={"msg": "Invalid tutor skill"})
        for j in ts:
            if j.heading and j.description:
                j.status == TutorSkill.FREEZE
                j.save()
            else:
                j.delete()
        return Result(data={"msg": "success"})

    @classmethod
    def validate_personal_info(cls, body, user: User = None):
        email = body.get("email")
        data = body.get("data")
        errors = {}
        if email.lower() != data["email"].lower():
            errors["email"] = "Email change attempted"
        if data.get("phone"):
            # check if phonenumber already exists
            exists = PhoneNumber.objects.filter(number__icontains=data["phone"]).first()
            if exists and exists.owner:
                if exists.owner.email.lower() != email.lower():
                    errors["phone"] = "Phone number exists"
        return Result(data=errors)

    @classmethod
    def login_tutor(cls, body):
        email = body.get("email")
        telegram_id = body.get("telegram_id")

        other_details = body.get("other_details") or {}
        tutor: User = User.objects.filter(
            models.Q(email__iexact=email) | models.Q(slug__iexact=email)
        ).first()
        if tutor:
            email = tutor.email
            body['email'] = email
        auto_login = body.get("auto_login")
        is_admin = body.get("is_admin")
        verify_email = body.get("verify_email")
        if telegram_id:
            return LoginService.get_user_by_telegram(telegram_id)
        if not tutor and not is_admin:
            # create tutor
            password = other_details.pop("password", None)
            # implemented signup date.
            tutor = User.objects.create(
                email=email, date_joined=timezone.now(), **other_details
            )
            if password:
                tutor.set_password(password)
                tutor.save()
            auto_login = True
        if tutor:
            if not tutor.tutor_verified and not is_admin:
                tutor.profile.began_application()
        if auto_login:
            result = LoginService.tutor_login(body, True)
        else:
            result = LoginService.tutor_login(body)
        if not result:
            if "code" in body:
                return Result(errors={"msg": "Invalid code"}, status_code=400)
            return LoginService.generate_login_code(body)
        # verify email of user
        if verify_email and tutor:
            if not tutor.email_verified:
                tutor.verify_email()
        return Result(data=result)

    @classmethod
    def complete_tutor_application(cls, body):
        email = body.get("email")
        tutor: User = User.objects.filter(email__iexact=email).first()
        if not tutor:
            return Result(errors={"msg": "No tutor with email exists"}, status_code=400)
        profile = tutor.profile
        profile.application_status = 2
        profile.save()
        return Result(data=LoginService.tutor_login(body, True))

    @classmethod
    def begin_quiz(cls, body):
        email = body.get("email")
        subjects = body.get("subjects")
        tutor: User = User.objects.filter(email__iexact=email).first()
        if not tutor:
            return Result(errors={"msg": "No tutor with email exists"}, status_code=400)
        instances = Skill.objects.filter(name__in=subjects).all()
        us = UserService(tutor.email)
        for i in instances:
            us.ts_service.start_quiz(skill_instance=i)
        return Result(data={"msg": "success"})

    @classmethod
    def bulk_begin_quiz(cls, body):
        email = body.get("email")
        post_data = body.get("post_data")
        payload = post_data.get("payload")
        subject_data = post_data.get("subject_data")
        result = cls.begin_quiz({"email": email, "subjects": payload["subjects"]})
        TutorRevampService.save_subject_info(subject_data)
        return result

    @classmethod
    def update_subjects_to_teach(cls, body):
        email = body.get("email")
        subjects = body.get("subjects")
        tutor: User = User.objects.filter(email__iexact=email).first()
        if not tutor:
            return Result(errors={"msg": "No tutor with email exists"}, status_code=400)
        create_subjects.send(sender=cls, tutor_id=tutor.pk, subjects=subjects)
        return TutorRevampService.get_subjects({"email": email, "raw": True})

    @classmethod
    def update_retake_status(cls, body):
        email = body.get("email")
        subjects = body.get("subjects")
        tutor: User = User.objects.filter(email__iexact=email).first()
        if not tutor:
            return Result(errors={"msg": "No tutor with email exists"}, status_code=400)
        existing_taken_subjects = [
            x for x in tutor.tests_taken if x["skill"] not in subjects
        ]
        tutor.update_test_taken(existing_taken_subjects)
        # also remove sitting instance for actual subjects
        QuizSitting.objects.filter(
            tutor_skill__tutor=tutor, tutor_skill__skill__name__in=subjects
        ).delete()
        return Result(data=const.cached_category_skills(tutor))

    @classmethod
    def update_quiz(cls, body):
        email = body.get("email")
        name = body.get("name")
        passed = body.get("passed") or []
        failed = body.get("failed") or []
        tutor: User = User.objects.filter(email__iexact=email).first()
        if not tutor:
            return Result(errors={"msg": "No tutor with email exists"}, status_code=400)
        existing_taken_subjects = (
            tutor.tests_taken
            + [
                {"skill": x["skill"], "score": x["score"], "passed": True}
                for x in passed
            ]
            + [
                {"skill": x["skill"], "score": x["score"], "passed": False}
                for x in failed
            ]
        )
        tutor.update_test_taken(existing_taken_subjects)
        if name:
            instance = SingleTutorSkillService(email=tutor.email, skill_name=name)
            instance.validate_quiz(
                {
                    "result": statistics.mean(
                        [x["score"] for x in passed] + [x["score"] for x in failed]
                    )
                }
            )
        return Result(data=tutor.data_dump.get("tutor_update"))
