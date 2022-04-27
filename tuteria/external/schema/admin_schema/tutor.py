import graphene
from graphene.types.generic import GenericScalar
from users.models import User, UserProfile, UserIdentification
from skills.models import TutorSkill, SubjectExhibition
from registration.models import Education, WorkExperience
from ..utils import createGrapheneClass
from users.services import UserService
from django.db.models import Q, Count, Sum
from .. import utils

TuteriaTutors = createGrapheneClass(
    "TuteriaTutors",
    [
        ("slug", str),
        ("profile_pic", str),
        ("full_name", str),
        ("email", str),
        ("dob", str),
        ("gender", str),
        ("state", str),
        ("verified", bool),
        ("email_verified", bool),
        ("identification", "json"),
        ("phone_no", str),
        ("years_of_experience", str),
        ("tutor_description", str),
        ("educations", "json"),
        ("work_experiences", "json"),
        ("locations", "json"),
        ("potential_subjects", "json"),
        ("levels_with_exam", "json"),
        ("answers", "json"),
        ("classes", "json"),
        ("curriculum_used", "json"),
        ("curriculum_explanation", str),
    ],
)


class TutorApprovalMutation(utils.BaseMutation):
    fields = [("user", graphene.Field(TuteriaTutors))]
    form_fields = {
        "email": graphene.String(required=True),
        "verified": graphene.Boolean(required=True),
        "test": graphene.Boolean(required=False)
    }

    def callback(self, **kwargs):
        verified = kwargs.get("verified")
        email = kwargs.get("email")
        test = kwargs.get('test')
        if not test:
            UserProfile.objects.filter(
                user__email=email).approve_tutor(verified)
        user = (UserProfile.objects.filter(Q(user__email=email))
                .select_related("user").prefetch_related(
                    "user__education_set", "user__location_set",
                    "user__workexperience_set")).first()
        return {"user": get_extra_details(user)}


class TutorActionMutation(utils.BaseMutation):
    fields = [("status", bool), ("errors", "json")]
    form_fields = {
        "email": graphene.String(required=True),
        "action": graphene.String(required=True),
        'test': graphene.Boolean(required=False)
    }

    def callback(self, **kwargs):
        email_queryset = UserProfile.objects.filter(
            user__email=kwargs.get("email"))
        options = {
            "approve_email": lambda: email_queryset.approve_email(),
            "notify_about_email": lambda: email_queryset.verify_email_notification(False),
            "reject_profile_pic": lambda: email_queryset.mark_user_profile_as_rejected(
                False
            ),
            "approve_identification": lambda: email_queryset.mark_id_as_verified(),
            "reject_identification": lambda: email_queryset.mark_id_as_rejected(),
            "upload_profile_pic_email": lambda: email_queryset.send_mail_to_reupload_profile_picture(
                delay=False
            ),
            "upload_verification_email": lambda: email_queryset.send_mail_to_verify_id(
                delay=False
            ),
            "curriculum_update": lambda: email_queryset.notify_tutor_about_curriculum(),
            "freeze_profile": lambda: email_queryset.update(application_status=UserProfile.FROZEN),
            "unfreeze_profile": lambda: email_queryset.update(application_status=UserProfile.VERIFIED)
        }
        action = options[kwargs.get("action")]
        should_test = kwargs.get('test')
        if not should_test:
            action()
        return {"status": True}


def transform_user(profile):
    url, img = UserService.get_class_profile_pic(
        profile, width=150, height=150, as_image=True)
    id_url = lambda x: UserService.get_certificate(
        identity=x, width=100, height=100, as_image=True
    )[0]
    # id_ = None
    # if hasattr(profile.user, 'identifications'):
    id_ = profile.user.identifications.first()
    return {
        "slug": profile.user.slug,
        "identification": {
            "link": id_url(id_.identity),
            "verified": id_.verified
        } if id_ else None,
        "profile_pic": url,
        "full_name": f"{profile.user.first_name} {profile.user.last_name}",
        "email": profile.user.email,
        "dob": profile.dob,
        "gender": profile.gender,
        "state": profile.user.state,
        "verified": profile.application_status == UserProfile.VERIFIED,
        "email_verified": profile.user.email_verified,
    }


SingleSkillType = createGrapheneClass('SingleSkillType', [("name", str)])
QuizType = createGrapheneClass('QuizType',
                               [('started', bool), ('score', float),
                                ('completed', bool), ('passed', bool)])

SingleTutorSkillType = createGrapheneClass(
    "SingleTutorSkillType",
    [("heading", str), ('description', str), ('status_display', str),
     ('pk', int), ('slug', str), ('price', float),
     ('skill', graphene.Field(SingleSkillType)),
     ('quiz_sitting', graphene.Field(QuizType)), ('skill_exhibitions', 'json'),
     ('public_url', str), ('active_bookings', graphene.Float(),
                           lambda x: x.tutor.active_bookings()),
     ('hours_taught', graphene.Float(), lambda x: x.no_of_hours_taught)],
)


class SkillAdminActionMutation(utils.BaseMutation):
    fields = [("skill", graphene.Field(SingleTutorSkillType))]
    form_fields = {
        "pk": graphene.Int(required=True),
        "action": graphene.String(required=True),
        "test": graphene.Boolean(required=False)
    }

    def callback(self, **kwargs):
        ts_queryset = TutorSkill.objects.filter(pk=kwargs.get("pk"))
        options = {
            "approve_skill":
            lambda: ts_queryset.approve_skill(delay=False),
            "deny_skill":
            lambda: ts_queryset.deny_skill(delay=False),
            "require_modification_skill":
            lambda: ts_queryset.require_modification(delay=False),
            "delete_exhibitions":
            lambda: ts_queryset.reject_exhibition_pictures(),
            "retake_test":
            lambda: ts_queryset.retake_quiz(delay=False),
        }
        action = options[kwargs.get("action")]
        should_test = kwargs.get('test')
        if not should_test:
            action()
        return {
            "skill": TutorSkill.objects.filter(pk=kwargs.get("pk")).first()
        }


def get_extra_details(profile):
    existing = transform_user(profile)
    user = profile.user
    remaining = {
        "phone_no":
        user.primary_phone_no.number,
        "years_of_experience":
        profile.get_years_of_teaching_display(),
        "tutor_description":
        profile.tutor_description,
        "educations": [{
            "school": x.school,
            "course": x.course,
            "degree": x.degree
        } for x in user.education_set.all()],
        "work_experiences": [{
            "name": x.name,
            "role": x.role
        } for x in user.workexperience_set.all()],
        "locations": [{
            "address": x.address,
            "state": x.state,
            "vicinity": x.vicinity
        } for x in user.location_set.all()],
        "potential_subjects":
        profile.potential_subjects,
        "levels_with_exam":
        profile.levels_with_exams,
        "answers":
        profile.answers,
        "classes":
        profile.classes,
        "curriculum_used":
        profile.curriculum_used,
        "curriculum_explanation":
        profile.curriculum_explanation,
    }
    return {**existing, **remaining}


class TutorVerification(graphene.ObjectType):
    tutor_detail = graphene.Field(
        TuteriaTutors,
        slug=graphene.String(required=False),
        email=graphene.String(required=False),
    )
    all_unverified_tutors = graphene.List(
        lambda: TuteriaTutors,
        new_applicants=graphene.Boolean(required=False),
        verified_tutors=graphene.Boolean(required=False),
        result_size=graphene.Int(required=False),
        email_exclude=graphene.List(graphene.String, required=False),
    )
    all_skills = graphene.List(
        lambda: SingleTutorSkillType,
        status=graphene.String(required=False),
        email=graphene.String(required=True))

    # tutor_detail =

    def resolve_all_skills(self, info, **kwargs):
        tutorskills = TutorSkill.objects.select_related('skill').filter(
            tutor__email=kwargs['email'])
        return tutorskills

    def resolve_all_unverified_tutors(self, info, **kwargs):
        print(kwargs)

        aa = UserProfile.objects.select_related("user").annotate(
            verified_count=Count("user__identifications"))
        if kwargs.get("email_exclude"):
            aa = aa.exclude(user__email__in=kwargs["email_exclude"])
        applicants = aa.filter(application_status=UserProfile.PENDING)
        verified_tutors = aa.filter(
            application_status=UserProfile.VERIFIED).filter(
                Q(verified_count=0)
                | Q(user__identifications__verified=False)
                | Q(image=None)
                | Q(user__emailaddress__verified=False))
        if kwargs.get("new_applicants"):
            aa = applicants
        elif kwargs.get("verified_tutors"):
            aa = verified_tutors
        else:
            aa = applicants | verified_tutors
        size = kwargs.get('result_size') or 50
        transform = [transform_user(a) for a in aa[:size]]
        return transform

    def resolve_tutor_detail(self, info, **kwargs):
        email = kwargs.get("email")
        slug = kwargs.get("slug")
        result = (UserProfile.objects.filter(
            Q(user__email=email) | Q(user__slug=slug))
                  .select_related("user").prefetch_related(
                      "user__education_set", "user__location_set",
                      "user__workexperience_set")).first()
        return get_extra_details(result)


class Query(object):
    tutor_verification_endpoint = graphene.Field(TutorVerification)

    def resolve_tutor_verification_endpoint(self, info, **kwargs):
        return TutorVerification()


class Mutation(object):
    admin_actions = TutorActionMutation.Field()
    approve_tutor = TutorApprovalMutation.Field()
    skill_admin_actions = SkillAdminActionMutation.Field()
