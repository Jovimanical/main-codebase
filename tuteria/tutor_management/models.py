import typing
from django.db import models
from django.dispatch import receiver
from config.utils import post_to_cdn_service
from config.signals import tutor_applicant_email_list
from users.tasks.tasks1 import post_to_email_list
from users.models import (
    User,
    UserProfile,
    VerifiedTutor as VerifiedTutorProfile,
    PhoneNumber as OldPhoneNumber,
    UserIdentification as OldUserIdentification,
)
from skills.models import (
    TutorSkill as OldTutorSkill,
    QuizSitting as OldQuizSitting,
    Skill as OldSkill,
)
from django.contrib.postgres.fields import ArrayField, JSONField
from users.models.managers import NewApplicantUserManager, TutorManager
import datetime
from django.utils import timezone
from cloudinary import CloudinaryImage
from registration.models import Guarantor
import requests
from django.conf import settings
from external.new_group_flow.services import LoginService
import copy
from datetime import datetime

# Create your models here.


def tuteria_cdn_action(path, payload):
    new_payload = copy.deepcopy(payload)
    if settings.TEST_EMAIL:
        if "email" in payload.get("payload", {}):
            new_payload["payload"]["email"] = settings.TEST_EMAIL
    response = requests.post(f"{settings.CDN_SERVICE}/api/{path}", json=new_payload)
    if response.status_code < 400:
        result = response.json()
        return result["data"]


class QuizSitting(OldQuizSitting):
    class Meta:
        proxy = True
        app_label = "tutor_management"


class Skill(OldSkill):
    class Meta:
        proxy = True
        app_label = "tutor_management"
        verbose_name = "Tuteria Skill"


class TutorSkill(OldTutorSkill):
    class Meta:
        proxy = True
        app_label = "tutor_management"


class UserIdentification(OldUserIdentification):
    class Meta:
        proxy = True
        app_label = "tutor_management"


class PhoneNumber(OldPhoneNumber):
    class Meta:
        proxy = True
        app_label = "tutor_management"


class VerifiedTutor(VerifiedTutorProfile):

    # job_this_month = models.DateTimeField()
    class Meta(VerifiedTutorProfile.Meta):
        proxy = True
        app_label = "tutor_management"
        verbose_name = "Verified Tutors Profile"


# class VerifiedTutorWithRecentJob(UserProfile):
#     # profile = models.OneToOneField(
#     #     UserProfile,
#     #     primary_key=True,
#     #     related_name="with_job",
#     #     db_column="user_id",
#     #     on_delete=models.CASCADE,
#     # )
#     job_this_month = models.DateTimeField()
#     objects = models.Manager()

#     class Meta:
#         managed = False
#         app_label = "tutor_management"
#         db_table = "profile_with_recent_job"


class VerifiedTutorWithSkill(User):
    class Meta(User.Meta):
        proxy = True
        app_label = "tutor_management"
        verbose_name = "Verified Tutor with skill"

    objects = TutorManager()


class TutorRevamp(User):
    class Meta(User.Meta):
        proxy = True
        app_label = "tutor_management"
        verbose_name = "Tutor revamp"


class Reference(Guarantor):
    class Meta:
        proxy = True
        app_label = "tutor_management"


class TutorApplicantTrack(User):
    objects = NewApplicantUserManager()

    class Meta:
        proxy = True
        app_label = "tutor_management"

    def location_country(self):
        return self.personal_info.get("locationCountry")

    @property
    def lesson_type(self):
        return self.availability.get("preferredLessonType") or []

    location_country.short_description = "country"

    def resolve_field(self, key, default=""):
        personal_info = self.personal_info
        if personal_info:
            value = key
            if type(value) != list:
                value = [key]
            if "phone" in value:
                return f"phone: {personal_info.get('phone')or ''}\n\n whatsapp:{personal_info.get('whatsappNumber')or''}"
            return " ".join([personal_info.get(x) or "" for x in value])
        return default

    @property
    def age(self):
        dob = self.resolve_field("dateOfBirth")
        if dob:
            as_date = datetime.datetime.strptime(dob, "%Y-%m-%d")
            now = timezone.now()
            return now.year - as_date.year

    @property
    def current_step(self):
        return self.app_data.get("currentStep")

    @property
    def application_step(self):
        return self.app_data.get("currentEditableForm")

    def the_email(self):
        return f"<span>{self.email} ({self.slug})</span>"

    the_email.allow_tags = True

    @property
    def app_data(self):
        return self.revamp_data("appData") or {}

    @property
    def personal_info(self):
        return self.revamp_data("personalInfo")

    @property
    def payment_info(self):
        return self.revamp_data("paymentInfo") or {}

    @property
    def availability(self):
        return self.revamp_data("availability") or {}

    @property
    def schedule_info(self):
        availability = self.availability.get("availability") or {}
        return availability

    @property
    def identity(self):
        return self.revamp_data("identity") or {}

    @property
    def admin_remarks(self):
        return self.revamp_data("admin_remarks") or []

    @property
    def get_application_link(self):
        return f"{settings.BECOME_TUTOR_URL}/api/hijack-tutor?email={self.resolve_field('email')}&accessCode=TUTOR_SUCCESS_ACCESS&current_step={self.current_step}"

    def add_remark_action(self, payload):
        all_remarks = self.admin_remarks
        all_remarks.append({**payload, "created": timezone.now().isoformat()})
        self.update_revamp_data({"admin_remarks": all_remarks})

    def tutor_remarks(self):
        result = []
        for remark in self.admin_remarks:
            date_time_obj = datetime.strptime(remark["created"], "%Y-%m-%dT%H:%M:%S.%f")
            remark_date = date_time_obj.strftime("%d %b, %Y, %I:%M %p")
            result.append({**remark, "created": remark_date})
        return result

    tutor_remarks.short_description = "remarks"
    tutor_remarks.allow_tags = True

    def save_tutor_info(self):
        self.update_revamp_data({})

    def profile_pic(self):
        url = self.identity.get("profilePhoto")
        public_id = self.identity.get("profilePhotoId")
        if url and public_id:
            image = CloudinaryImage(public_id=public_id).image(
                width=50, height=50, crop="fill", gravity="faces"
            )
            return '<a href="{}" target="_blank">{}</a>'.format(url, image)
        return ""

    profile_pic.allow_tags = True

    def identity_pic(self):
        vv = self.user_identity_info
        if vv:
            url = vv["url"]
            image = CloudinaryImage(public_id=vv["name"]).image(
                width=50, height=50, crop="fill"
            )
            return '<a href="{}" target="_blank">{}</a>'.format(url, image)
        return ""

    @property
    def user_identity_info(self):
        upload_store = self.identity.get("uploadStore")
        if upload_store:
            files = upload_store["files"]
            if len(files) > 0:
                return files[0]
        return None

    @property
    def tutor_id_verified(self):
        id_verified = self.identity.get("isIdVerified")
        return id_verified

    @property
    def educations(self):
        return self.revamp_data("educationWorkHistory", "educations", [])

    @property
    def work_experiences(self):
        return self.revamp_data("educationWorkHistory", "workHistories", [])

    @property
    def uploaded_files(self):
        upload_store = self.identity.get("uploadStore") or {}
        return upload_store.get("files") or []

    @property
    def agreement(self):
        return self.revamp_data("agreement") or {}

    @property
    def guarantors(self):
        guarantors = self.revamp_data("educationWorkHistory", "guarantors", [])
        if len(guarantors) > 0:
            return guarantors
        return None

    def guarantors_approved(self):
        return self.revamp_data("guarantors_verified", default=False)

    def verify_guarantors(self):
        self.update_revamp_data({"guarantors_verified": True})

    def update_guarantors(self, guarantors: typing.List[typing.Any]):
        existing = self.revamp_data("educationWorkHistory")
        existing["guarantors"] = guarantors
        self.update_revamp_data({"educationWorkHistory": existing})

    def notify_to_update_guarantors(self):
        others = self.app_data
        others["currentStep"] = "verify"
        self.update_revamp_data({"app_data": others})
        result = tuteria_cdn_action(
            "approval",
            {
                "action": "reject-guarantor",
                "payload": {
                    **self.personal_info,
                    "guarantorUploadUrl": f"{settings.BECOME_TUTOR_URL}/verify",
                },
                "media_format": settings.MEDIA_FORMAT,
            },
        )
        if not result:
            raise Exception("Email not sent")

    @property
    def email_is_verified(self):
        pass

    @property
    def teaching_profile(self):
        pass

    @property
    def others(self):
        return self.revamp_data("others") or {}

    @property
    def video_intro(self):
        video_summary = self.others.get("videoSummary")
        if video_summary:
            url = video_summary.get("url")
            id = video_summary.get("id")
            if url and id:
                return video_summary
        return False

    @property
    def video_verified(self):
        video_verified = self.others.get("videoVerified")
        return video_verified

    @property
    def approved(self):
        approved = self.others.get("approved")
        submission = self.others.get("submission")
        return approved and submission

    def approve_applicant(self):
        current_step = self.determine_next_current_step()
        self.update_revamp_data(
            {"others": {**self.others, "approved": True, "submission": True}}
        )
        self.notify_to_update_step(None, current_step, sendMail=False)
        result = LoginService.update_tutor_info(
            self.slug, self.data_dump["tutor_update"], _process=True
        )
        if not result:
            raise Exception("Error Approving tutor")
        self.remove_video_and_identity_resources("approve-tutor")
        self.profile.approve_teaching_status()
        self.to_mailing_list()

    def remove_video_and_identity_resources(self, action):
        video_public_id = ""
        identity_public_id = ""
        video_summary = self.video_intro
        identity = self.user_identity_info
        if video_summary:
            video_public_id = video_summary["id"]
        if identity:
            identity_public_id = identity["name"]
        result = tuteria_cdn_action(
            "approval",
            {
                "public_id": {
                    "video": video_public_id,
                    "identity": identity_public_id,
                },
                "action": action,
                "payload": self.personal_info,
                "media_format": settings.MEDIA_FORMAT,
                "addNewSubjectsUrl": self.get_application_link,
            },
        )
        if not result:
            raise Exception("Email not sent")

    def deny_applicant(self):
        self.deny_teaching_status(True)
        self.remove_video_and_identity_resources("deny-tutor")
        self.to_mailing_list()

    def approve_identity(self):
        identity = self.identity
        identity["isIdVerified"] = True
        self.update_revamp_data({"identity": identity})

    def update_video_as_approved(self):
        others = self.others
        others["videoVerified"] = True
        self.update_revamp_data({"others": others})

    def reject_identity(self):
        app_data = self.app_data
        identity = self.identity
        params = self.user_identity_info
        if params:
            result = tuteria_cdn_action(
                "approval",
                {
                    "action": "reject-identity",
                    "public_id": params["name"],
                    "payload": {
                        **self.personal_info,
                        "identityUploadUrl": f"{settings.BECOME_TUTOR_URL}/verify",
                    },
                    "media_format": settings.MEDIA_FORMAT,
                },
            )
            if not result:
                raise Exception("Email not sent")
        identity.pop("uploadStore", None)
        identity.pop("isIdVerified", None)
        app_data["currentStep"] = "verify"
        self.update_revamp_data({"identity": identity, "app_data": app_data})

    def notify_to_update_step(self, application_step, current_step, sendMail=True):
        others = self.app_data
        if current_step:
            others["currentStep"] = current_step
        if application_step:
            others["currentEditableForm"] = application_step
        self.update_revamp_data({"app_data": others})
        self.to_mailing_list()
        if sendMail:
            result = tuteria_cdn_action(
                "approval",
                {
                    "action": "update-step",
                    "public_id": None,
                    "payload": {
                        **self.personal_info,
                        "currentStep": current_step,
                        "application_step": application_step,
                        "completeRegistrationUrl": f"{settings.BECOME_TUTOR_URL}/{current_step}",
                    },
                },
            )
            if not result:
                raise Exception("Email not sent")

    def reupload_video(self):
        app_data = self.app_data
        others = self.others
        video_summary = self.video_intro
        if video_summary:
            result = tuteria_cdn_action(
                "approval",
                {
                    "action": "reject-video",
                    "public_id": video_summary["id"],
                    "payload": {
                        **self.personal_info,
                        "videoUploadUrl": f"{settings.BECOME_TUTOR_URL}/verify",
                    },
                    "media_format": settings.MEDIA_FORMAT,
                },
            )
            if not result:
                raise Exception("Email not sent")
        others.pop("videoSummary", None)
        app_data["currentStep"] = "verify"
        self.update_revamp_data({"others": others, "app_data": app_data})

    def determine_completed_steps(self):
        from skills.models.models1 import TutorSkill

        personal_info_completed = lambda: all(
            [
                self.personal_info.get(x)
                for x in [
                    "firstName",
                    "lastName",
                    "nationality",
                    "email",
                    "gender",
                    "dateOfBirth",
                    "phone",
                    "whatsappNumber",
                ]
            ]
        )
        location_info_completed = (
            lambda: all(
                [
                    self.personal_info.get(x)
                    for x in ["country", "state", "region", "address", "vicinity"]
                ]
            )
            and len(self.lesson_type) > 0
        )

        education_completed = lambda: len(self.educations) > 0
        work_experience_completed = lambda: len(self.work_experiences) >= 0
        identity_completed = lambda: all(
            [self.identity.get(o) for o in ["profilePhoto", "isIdVerified"]]
        ) or all(
            [
                self.identity.get("profilePhoto"),
                len(self.uploaded_files) > 0,
            ]
        )
        schedule_completed = lambda: any(
            [len(o) > 0 for o in self.schedule_info.values()]
        ) and all(
            [self.availability.get(o) for o in ["maxDays", "maxHours", "maxStudents"]]
        )
        agreement_completed = lambda: all(
            [
                self.agreement.get(x)
                for x in [
                    "lessonPercent",
                    "paymentDate",
                    "taxCompliance",
                    "contractAgreement",
                ]
            ]
        )
        payment_completed = lambda: all(
            [
                self.payment_info.get(o)
                for o in ["bankName", "accountName", "accountNumber"]
            ]
        )
        subject_completed = (
            lambda: len(
                [
                    x
                    for x in self.user_skills
                    if x.status not in [TutorSkill.DENIED, TutorSkill.FREEZE]
                ]
            )
            > 0
        )
        new_development_completed = lambda: self.others.get("newDevelopment")
        guarantor_completed = lambda: len((self.guarantors or [])) > 0
        video_summary_completed = lambda: all(
            (self.others.get("videoSummary") or {}).get(x) for x in ["id", "url"]
        )
        return {
            "personal-info": personal_info_completed(),
            "location-info": location_info_completed(),
            "education-history": education_completed(),
            "work-history": work_experience_completed(),
            "subject-selection": subject_completed(),
            "verification-info": identity_completed(),
            "payment-info": payment_completed(),
            "schedule-info": schedule_completed(),
            "agreement-info": agreement_completed(),
            "new-development-info": new_development_completed(),
            "guarantors-info": guarantor_completed(),
            "video-summary": video_summary_completed(),
        }

    def update_applicant_to_complete(self):
        updated = False
        if self.current_step != "complete":
            status = self.determine_completed_steps()
            if all(
                [
                    status[x]
                    for x in [
                        "personal-info",
                        "education-history",
                        "work-history",
                        "subject-selection",
                        "verification-info",
                        "video-summary",
                    ]
                ]
            ):
                self.notify_to_update_step(None, "complete", sendMail=False)
                updated = True
        return updated

    def determine_next_current_step(self):
        status = self.determine_completed_steps()
        options = {
            "preferences": all(
                [status[x] for x in ["location-info", "schedule-info", "payment-info"]]
            ),
            "terms": all(
                [
                    status[x]
                    for x in [
                        "guarantors-info",
                        "new-development-info",
                        "agreement-info",
                    ]
                ]
            )
            and self.email_verified,
        }
        current_step = "preferences"
        if options["preferences"]:
            current_step = "terms"
        if options["preferences"] and options["terms"]:
            current_step = "application-verified"
        return current_step

    def update_verified_tutors_current_step(self):
        current_step = self.determine_next_current_step()
        self.notify_to_update_step(None, current_step, sendMail=False)

    def add_to_applicant_list(self):
        post_to_email_list.delay(self.pk, "tutor-applicant")


class NewTutorApplicant(TutorApplicantTrack):
    objects = NewApplicantUserManager()

    class Meta:
        proxy = True
        app_label = "tutor_management"
