import asyncio
from asyncio import tasks
from decimal import Decimal
from dateutil.parser import parse as date_parse
from django.utils.crypto import get_random_string
from external.services.services1 import SingleRequestService
from skills.services import TutorSkillService
import typing
import json
import datetime
from django.conf import settings
from external.models import Agent, BaseRequestTutor, generate_code
from users.services import CustomerService
from users.models import (
    User,
    UserProfile,
    Location,
    PhoneNumber,
    UserIdentification,
    StateWithRegion,
)
from dateutil.relativedelta import relativedelta
from connect_tutor.models import RequestPool, TutorJobResponse
from django.db.models import Q, Prefetch, Avg, Count, OuterRef, Subquery
from django.db.models.expressions import RawSQL
from skills.models import TutorSkill, SkillCertificate, SubjectExhibition
from registration.models import Education, WorkExperience, Guarantor
from wallet.models import WalletTransaction
from reviews.models import SkillReview
from django.utils import timezone
from external.tasks import magic_link_password, send_notice_to_both_tutor_and_client
from bookings.models import BookingSession, Booking
import requests
import time
from django.core.cache import cache
from config.utils import Result, get_static_data
from external.subjects_2 import (
    mapping,
    create_requests_from_response,
    parse_subjects,
    construct_expectation,
    update_schedule_info,
)


class AgentStatistics:
    @classmethod 
    def general_performance(cls, year=None):
        revenue_with_tutor_earning = WalletTransaction.objects.get_revenue_with_tutor_earning(year)
        _year = year 
        if _year == 'undefined':
            _year = None
        customers = User.objects.customers(year=_year).count()
        return Result(data=[
                { "label": "Revenue", "value": "${:,}".format(revenue_with_tutor_earning['revenue']) },
                { "label": "Tutor Earnings", "value": "${:,}".format(revenue_with_tutor_earning['earnings']) },
                { "label": "Unique Clients", "value": "{:,}".format(customers) },
                { "label": "Total tutors", "value": "71,887" },
                { "label": "Lesson booked", "value": "71,887" },
                { "label": "Hours taught", "value": "71,887" },])
    @classmethod
    def performances(cls, body):
        _from = body.get("from")
        to = body.get("to")
        client_agents = Agent.objects.filter(type=Agent.CLIENT)
        customer_success = Agent.objects.filter(type=Agent.CUSTOMER_SUCCESS)
        if _from and to:
            client_result = client_agents.request_statistics([_from, to]).values(
                "email",
                "name",
                "total_payed_requests",
                "sum_of_payed_requests",
                "pending_requests_count",
                "completed_requests_count",
                "pending_amount",
                "completed_amount",
            )
            customer_success_esult = customer_success.booking_statistics(
                [_from, to]
            ).values("email", "name", "total_bookings_count", "total_amount_made")
            return Result(
                data={
                    "sales": [
                        {
                            **x,
                            "sum_of_payed_requests": float(
                                x["sum_of_payed_requests"] or 0
                            ),
                            "pending_amount": float(x["pending_amount"] or 0),
                            "completed_amount": float(x["completed_amount"] or 0),
                        }
                        for x in client_result
                    ],
                    "customer_success": [
                        {**x, "total_amount_made": float(x["total_amount_made"] or 0)}
                        for x in customer_success_esult
                    ],
                }
            )
        return Result(error={"msg": "missing from & to parameters"}, status_code=400)


def parse_curriculum(curriculum_value):
    curriculum_options = {
        "Nigerian": "1",
        "British": "2",
        "American": "3",
        "Montessori": "7",
        "EYFS": "8",
        "Not Sure": "",
    }
    curriculum = curriculum_value
    if len(curriculum) == 0:
        curriculum = curriculum_options["Not Sure"]
    else:
        curriculum = [x for x in curriculum if x]
        if "British" in curriculum:
            return "1"
        if "American" in curriculum:
            return "2"
        curriculum = curriculum_options[curriculum[-1]]
    return curriculum


class LoginService:
    @classmethod
    def generate_login_code(self, body):
        email = body.get("email")
        # number = body.get("number")
        found = email
        # found = email or number
        if not found:
            return Result(errors={"msg": "No email passed"}, status_code=400)
        found_user: User = User.objects.filter(email__iexact=email).first()
        code = get_random_string(6)
        if not found_user:
            return Result(errors={"msg": "Could not find user"}, status_code=400)

        found_user.save_login_code(code)
        return Result(data={"code": code, "email": found_user.email})

    @classmethod
    def request_user_login(cls, data, _process=False):
        process = _process
        if data.get("email"):
            user: typing.Optional[User] = User.objects.filter(
                email__iexact=data["email"]
            ).first()
            pending_requests = (
                BaseRequestTutor.objects.filter(email__iexact=data["email"])
                .exclude(state=None, country=None)
                .first()
            )
            if user:
                preferredComms = {}
                if user.data_dump:
                    preferredComms = user.data_dump.get("preferredComms") or {}
                location = user.home_address
                phone = user.primary_phone_no
                if phone:
                    phone = str(phone.number)
                country = user.country
                state = None
                if location:
                    state = location.state
                if country:
                    country = country.name
                if pending_requests:
                    if not state:
                        state = pending_requests.state
                    if not country:
                        if pending_requests.country:
                            country = str(pending_requests.country.name)
                if data.get("password"):
                    if user.check_password(data["password"]):
                        process = True
                if process:
                    return {
                        "personal_info": {
                            "email": user.email,
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                        },
                        "profile_info": {
                            "phone": phone,
                            "preferredComms": preferredComms,
                        },
                        "location": {"state": state, "country": str(country)},
                    }

    @classmethod
    def get_user_by_telegram(cls, telegram_id):
        instance: typing.Optional[User] = User.objects.filter(
            data_dump__tutor_update__telegram_id=telegram_id
        ).first()
        if not instance:
            return Result(errors={"msg": "No user found"})
        response = cls.tutor_login(
            {"email": instance.email}, _process=True, is_telegram=True
        )
        return Result(data=response)

    @classmethod
    def tutor_login(cls, data, _process=False, is_telegram=False):
        process = _process
        if data.get("email"):
            user: typing.Optional[User] = User.objects.filter(
                email__iexact=data["email"]
            ).first()
            if user:
                # if tutor_update key exists in the data_dump. means we have begun the process
                # so it is save to return it.
                result = {}
                if user.data_dump:
                    result = user.data_dump.get("tutor_update") or {}
                exists = result.get("personalInfo")
                if not exists:
                    # scanning through all the information we have about the tutor to get
                    # all the relevant information.
                    personal_info = {}
                    teaching_profile = {}
                    tutor_profile = user.profile
                    # if tutor_profile.application_status == UserProfile.VERIFIED:
                    if tutor_profile:
                        location = user.home_address
                        phone = user.primary_phone_no
                        if phone:
                            phone = str(phone.number).replace("+", "")
                        country = user.country
                        state = ""
                        address = ""
                        vicinity = ""
                        region = ""
                        if location:
                            state = location.state or ""
                            address = location.address or ""
                            vicinity = location.vicinity or ""
                            region = location.lga or ""
                        if country:
                            country = str(country.name)
                        else:
                            country = str(country)
                        personal_info = {
                            "gender": tutor_profile.get_gender_display().lower() or "",
                            "firstName": user.first_name,
                            "lastName": user.last_name,
                            "email": user.email,
                            "country": country,
                            "state": state,
                            "address": address,
                            "vicinity": vicinity,
                            "region": region,
                            "phone": phone,
                        }
                        teaching_profile = {
                            "curriculums": tutor_profile.curriculum_display() or []
                        }
                        dob = tutor_profile.dob
                        if dob:
                            personal_info["dateOfBirth"] = dob.strftime("%Y-%m-%d")
                        educations = [
                            {"school": x.school, "course": x.course, "degree": x.degree}
                            for x in user.education_set.all()
                        ]
                        workHistories = [
                            {
                                "company": x.name,
                                "role": x.role,
                                "isCurrent": x.currently_work,
                                "isTeachingRole": "teacher" in x.role.lower()
                                or "teaching" in x.role.lower(),
                            }
                            for x in user.workexperience_set.all()
                        ]
                        image = tutor_profile.image
                        identity = {}
                        if image:
                            identity["profilePhoto"] = image.public_id
                        user_identity = user.identity
                        if user_identity:
                            if user_identity.verified:
                                identity["isIdVerified"] = True
                        transactions = WalletTransaction.objects.filter(
                            wallet__owner=user
                        )
                        total_earned = sum(
                            transactions.earned().sum_up_all_transactions().values()
                        )
                        agreement = {"amountEarned": float(total_earned), "taxP": 5}
                        result = {
                            "personalInfo": personal_info,
                            "educationWorkHistory": {
                                "educations": educations,
                                "workHistories": workHistories,
                            },
                            "teachingProfile": teaching_profile,
                            "agreement": agreement,
                            "identity": identity,
                            "slug": user.slug,
                            "pk": user.pk,
                        }

                        if user.data_dump:
                            user.data_dump["tutor_update"] = result
                        else:
                            user.data_dump = {"tutor_update": result}
                        user.save()
                if data.get("code"):
                    if (user.login_code or "").upper() == data["code"].upper():
                        # verify email of the user
                        from allauth.account.models import EmailAddress

                        if not user.email_verified:
                            instance = EmailAddress.objects.filter(
                                email=user.email
                            ).first()
                            if not instance:
                                EmailAddress.objects.get_or_create(
                                    email=user.email, verified=True, user=user
                                )
                            else:
                                instance.verified = True
                                instance.save()
                        process = True
                if data.get("password"):
                    if user.check_password(data["password"]):
                        process = True
                if process:
                    # update the last_visit field
                    if not is_telegram:
                        user.last_visit = timezone.now()
                        user.save()
                    result[
                        "application_status"
                    ] = user.profile.get_application_status_display()
                    result["email_verified"] = user.email_verified
                    result["pk"] = user.pk
                    # get ratings and number of clients taught
                    result["unique_clients"] = user.t_bookings.different_client_count()
                    result["ratings"] = user.my_reviews.average_score()
                    as_applicant = user.as_applicant()
                    if as_applicant:
                        result["application_url"] = as_applicant.get_application_link
                    return result

    @classmethod
    def update_personal_info(cls, user, personalInfo):
        user.first_name = personalInfo.get("firstName")
        user.last_name = personalInfo.get("lastName")
        user.email = personalInfo.get("email")
        phone = personalInfo.get("phone")
        country_code = personalInfo.get("country_code")
        if country_code:
            user.country = country_code
        user.save()
        if phone:
            user.update_phone_number(phone)
        location = user.home_address
        if location:
            location.address = personalInfo.get("address")
            location.state = personalInfo.get("state")
            location.vicinity = personalInfo.get("vicinity")
            location.lga = personalInfo.get("region")
            location.save()
        else:
            location = Location.objects.create(
                address=personalInfo.get("address"),
                state=personalInfo.get("state"),
                vicinity=personalInfo.get("vicinity"),
                lga=personalInfo.get("region"),
                user=user,
            )

        profile = user.profile
        gender = "M" if personalInfo.get("gender").lower() == "male" else "F"
        profile.gender = gender
        dateOfBirth = personalInfo.get("dateOfBirth")
        dob = profile.dob
        if dateOfBirth:
            dob = datetime.datetime.strptime(
                personalInfo.get("dateOfBirth"), "%Y-%m-%d"
            )
            dob = dob.date()
        profile.dob = dob
        profile.save()

    @classmethod
    def update_education_and_work_histories(cls, user, eduWorkHistories):
        # delete any tutor previous education and work histories
        Education.objects.filter(tutor=user).delete()
        WorkExperience.objects.filter(tutor=user).delete()

        for education in eduWorkHistories["educations"]:
            Education.objects.create(
                tutor=user,
                school=education["school"],
                course=education["course"],
                degree=education["degree"],
            )
        for work_e in eduWorkHistories["workHistories"]:
            WorkExperience.objects.create(
                tutor=user,
                name=work_e["company"],
                role=work_e["role"],
                currently_work=work_e["isCurrent"],
            )
        if eduWorkHistories.get("guarantors"):
            Guarantor.objects.filter(tutor=user).delete()
            for gr in eduWorkHistories["guarantors"]:
                Guarantor.objects.create(
                    tutor=user,
                    email=gr["email"],
                    first_name=gr.get("full_name") or gr.get("fullName"),
                    verified=True,
                    phone_no=gr["phone"],
                    organization=gr["occupation"],
                )

    @classmethod
    def update_tutor_identity(cls, user, identity):
        if identity.get("profilePhotoId"):
            profile = user.profile
            if profile.image:
                profile.image.public_id = identity['profilePhotoId']
            else:
                UserProfile.objects.filter(user=user).update(
                    image=identity["profilePhotoId"]
                )
        if not identity.get("isIdVerified"):
            files = (identity.get("uploadStore") or {}).get("files")
            if files:
                # delete any old verification by the user
                UserIdentification.objects.filter(user=user).delete()
                UserIdentification.objects.create(user=user, identity=files[0]["url"])
        else:
            exists = UserIdentification.objects.filter(user=user).exists()
            if not exists:
                UserIdentification.objects.create(user=user, verified=True)

    @classmethod
    def update_tutor_price(cls, slug, data, _process=False):
        if slug:
            user: typing.Optional[User] = User.objects.filter(
                slug__iexact=slug.strip()
            ).first()
            if user and user.data_dump:
                user_dump = user.data_dump or {}
                tutor_dump = user_dump.get("tutor_update") or {}
                pricingInfo = tutor_dump.get("pricingInfo") or {}
                pricingInfo.update(**data)
                tutor_dump["pricingInfo"] = pricingInfo
                user.data_dump = {**(user.data_dump or {}), "tutor_update": tutor_dump}
                user.save()
                return tutor_dump

    @classmethod
    def update_payment_info(cls, user, payment_info):
        from wallet.models import UserPayout

        if payment_info:
            if (
                payment_info.get("accountNumber")
                and payment_info.get("bankName")
                and payment_info.get("accountName")
            ):
                existing_payout = UserPayout.objects.filter(user=user).first()
                if not existing_payout:
                    existing_payout = UserPayout()
                existing_payout.user = user
                existing_payout.account_id = payment_info["accountNumber"]
                existing_payout.bank = payment_info["bankName"]
                existing_payout.account_name = payment_info["accountName"]
                existing_payout.save()
                if payment_info.get("taxId"):
                    user.save_tax_info(payment_info["taxId"])

    @classmethod
    def update_tutor_info(cls, slug, data, _process=False):
        from tutor_management.models import TutorApplicantTrack

        if slug:
            user: typing.Optional[User] = User.objects.filter(
                slug__iexact=slug.strip()
            ).first()
            if user:
                user_dump = user.data_dump or {}
                tutor_dump = user_dump.get("tutor_update") or {}
                tutor_dump.update(**data)
                user.data_dump = {**(user.data_dump or {}), "tutor_update": tutor_dump}
                user.save()
                user.to_mailing_list()
                condition = _process
                if tutor_dump.get("others"):
                    if tutor_dump["others"].get("submission"):
                        condition = True
                if condition:
                    # at this point, we would need to process the tutor information.
                    if data.get("personalInfo"):
                        personalInfo = tutor_dump.get("personalInfo")
                        cls.update_personal_info(user, personalInfo)
                    if data.get("educationWorkHistory"):
                        educationWorkHistories = tutor_dump.get("educationWorkHistory")
                        cls.update_education_and_work_histories(
                            user, educationWorkHistories
                        )
                    if data.get("identity"):
                        identity = tutor_dump.get("identity")
                        cls.update_tutor_identity(user, identity)
                    if data.get("paymentInfo"):
                        payment_info = tutor_dump.get("paymentInfo")
                        cls.update_payment_info(user, payment_info)
                return tutor_dump


# {
#   searchSubject: 'Primary Math',
#   subjectGroup: 'Primary Math,Primary English,Literacy & Numeracy,Phonics,Handwriting',
#   specialNeeds: '',
#   curriculum: 'Nigerian,British,American',
#   class: 'Primary 5,Preschool',
#   lessonDays: 'Monday,Wednesday,Friday,Saturday',
#   lessonTime: '4:00 PM',
#   region: 'Lekki',
#   state: 'Lagos',
#   vicinity: 'Agungi',
#   country: 'Nigeria'
# }


class TutorRevampService:
    @classmethod
    def get_subjects(cls, params):
        tutor_email = params.get("email")
        raw = params.get("raw")
        page = params.get("page", 1)
        filter_by = params.get("filter_by", "all")
        instance = TutorSkillService(tutor_email)
        instance.update_failed_quizzes()
        revamp_profile = User.objects.filter(email__iexact=tutor_email).first()
        data = instance.get_subject_view_skills(filter_by=filter_by, page=page)
        pricing_info = revamp_profile.revamp_data("pricingInfo") or {}
        hourlyRates = pricing_info.get("hourlyRates") or {}
        # extraStudentDiscount = pricing_info.get("additionalStudentDiscount") or {}
        all_subjects = data["subjects"].object_list
        if raw:
            all_subjects = data["raw"]
        subjects = {
            "object_list": [
                {
                    "pk": x.pk,
                    "skill": {"name": x.skill.name},
                    "status": x.status,
                    "heading": x.heading,
                    "description": x.description,
                    "price": hourlyRates.get(x.skill.name) or x.price,
                    "has_updated_price": hourlyRates.get(x.skill.name) is not None,
                    "exhibitions": [
                        {
                            "image": y.image.public_id,
                            "caption": y.caption,
                            "url": y.cloudinary_image,
                        }
                        for y in x.exhibitions.all()
                    ],
                    "sittings": [
                        {
                            "started": y.started,
                            "score": y.score,
                            "completed": y.completed,
                        }
                        for y in x.sitting.all()
                    ],
                    "certifications": [
                        {
                            "award_name": j.award_name,
                            "award_institution": j.award_institution,
                        }
                        for j in x.skillcertificate_set.all()
                    ],
                    "other_info": x.other_info or {},
                }
                for x in all_subjects
            ],
            "paginator": {
                "count": data["subjects"].paginator.count,
                "num_pages": data["subjects"].paginator.num_pages,
                "per_page": data["subjects"].paginator.per_page,
            },
        }
        data.update(**subjects)
        del data["page_obj"]
        del data["subjects"]
        del data["raw"]
        return Result(data=data)

    @classmethod
    def delete_subject(cls, data):
        pk = data.get("pk")
        tutor_slug = data.get("tutor_slug")
        instance = TutorSkill.objects.filter(pk=pk).first()
        revamp_profile = User.objects.filter(slug=tutor_slug).first()
        if instance and revamp_profile:
            if instance.tutor == revamp_profile:
                pricing_info = revamp_profile.revamp_data("pricingInfo") or {}
                pricing_info.pop(instance.skill.name, None)
                LoginService.update_tutor_info(
                    revamp_profile.slug, {"pricingInfo": pricing_info}
                )
                # remove skill from price_info
                instance.delete()
                return Result(data={"valid": True})
        return Result(errors={"msg": "Invalid tutorskill or tutor_slug passed"})

    @classmethod
    def save_subject_info(cls, data):
        pk = data.get("pk")
        skill = data.get("skill")
        heading = data.get("heading")
        description = data.get("description")
        price = data.get("price")
        certifications = data.get("certifications") or []
        exhibitions = data.get("exhibitions") or []
        other_info = data.get("other_info") or {}
        tuteria_status = data.get("tuteriaStatus")
        instance = TutorSkill.objects.filter(pk=pk).first()
        if instance:
            existing = instance.other_info or {}
            existing.update(**other_info)
            instance.other_info = existing
            instance.heading = heading
            instance.description = description
            instance.price = price or instance.price
            instance.status = TutorSkill.PENDING
            if other_info.get("status") in ["not-started", "in-progress"]:
                instance.status = TutorSkill.MODIFICATION
            if other_info.get("status") == "denied":
                instance.status = TutorSkill.DENIED
            if other_info.get("status") == "active":
                instance.status = TutorSkill.ACTIVE
            instance.save()
            # TutorSkill.objects.filter(pk=pk).update(
            # )
            if certifications:
                SkillCertificate.objects.filter(ts_id=pk).delete()
                SkillCertificate.objects.bulk_create(
                    [SkillCertificate(ts_id=pk, **x) for x in certifications]
                )
            if exhibitions:
                SubjectExhibition.objects.filter(ts_id=pk).delete()
                SubjectExhibition.objects.bulk_create(
                    [SubjectExhibition(ts_id=pk, **x) for x in exhibitions]
                )

            if skill and skill.get("name") and price:
                tutor = instance.tutor
                pricingInfo = tutor.revamp_data("pricingInfo") or {"hourlyRates": {}}
                additionalStudentInfo = pricingInfo.get("extraStudents", {}) or {}
                pricingInfo["hourlyRates"][skill["name"]] = price
                if instance.other_info.get("extraStudents"):
                    additionalStudentInfo[skill["name"]] = instance.other_info[
                        "extraStudents"
                    ]
                    pricingInfo["extraStudents"] = additionalStudentInfo

                LoginService.update_tutor_info(tutor.slug, {"pricingInfo": pricingInfo})
            instance.tutor.to_mailing_list()
            return Result(data={"valid": True})
        return Result(errors={"msg": "Tutorskill with pk passed do not exist"})

    @classmethod
    def get_related_subjects(cls, params, raw=False):
        from connect_tutor.forms import RequestWithRelations

        email = params.get("email")
        request_slug = params.get("request_slug")
        tutor = User.objects.filter(email__iexact=email).first()
        request: BaseRequestTutor = BaseRequestTutor.objects.filter(
            slug__iexact=request_slug
        ).first()
        if not request:
            if raw:
                return False
            return Result(errors={"msg": "Missing parameters"}, status_code=400)
        static_data = get_static_data()
        tuteria_subjects = [
            {"name": x["name"], "subjects": x["subjects"]}
            for x in static_data.get("tuteriaSubjects") or []
        ]
        result_set = [
            RequestWithRelations(x, user=tutor, tuteria_subjects=tuteria_subjects)
            for x in request.request_subjects
        ]
        result = [
            {
                "suggested": x.suggested,
                "subject": x.name,
                "skill_related": x.skill_relations,
                "implied": x.implied_name,
            }
            for x in result_set
        ]
        unique_suggested = set([x["suggested"] for x in result])
        rr = []
        for i in unique_suggested:
            jj = [x for x in result if x["suggested"] == i]
            if jj:
                rr.append(jj[0])
        if raw:
            return rr
        return Result(data=rr)

    @classmethod
    def check_tutor_qualification_status(cls, tutor: User, request_slug, kind=1):
        from connect_tutor.forms import RequestWithRelations

        request: BaseRequestTutor = BaseRequestTutor.objects.filter(
            slug__iexact=request_slug
        ).first()
        static_data = get_static_data()
        tuteria_subjects = [
            {"name": x["name"], "subjects": x["subjects"]}
            for x in static_data.get("tuteriaSubjects") or []
        ]
        if kind == 1:
            skills = tutor.tutorskill_set.related_subject(
                request.request_subjects
            ).values_list("skill__name", flat=True)
        elif kind == 2:
            skills = RequestWithRelations.build_tutor_subject_condition(
                tutor, request.request_subjects, tuteria_subjects=tuteria_subjects
            )
        else:
            skills = RequestWithRelations.found_tutor_subject_conditions(
                tutor, request.request_subjects, tuteria_subjects=tuteria_subjects
            )
        return skills


class HomeTutoringRequestService:
    @classmethod
    def add_tutor_to_pool(cls, data):
        from skills.services import SingleTutorSkillService

        slug = data.get("slug")
        tutor = data.get("tutor")
        rq: BaseRequestTutor = BaseRequestTutor.objects.get(slug=slug)
        if not rq or not tutor:
            return Result(errors={"msg": "Invalid data passed"}, status_code=400)
        search_filter = {}
        if "email" in tutor:
            search_filter["email"] = tutor["email"]
        if "userId" in tutor:
            search_filter["slug"] = tutor["userId"]
        if not search_filter:
            return Result(
                errors={"msg": "missing email or slug of tutor"}, status_code=400
            )
        subject = tutor.get("subject") or {}
        tutor = User.objects.filter(**search_filter).first()
        if not tutor:
            return Result(errors={"msg": "Invalid tutor_id passed"}, status_code=400)
        tuteriaSubject = subject.get("tuteriaName")
        instance = SingleTutorSkillService(email=tutor.email, skill_name=tuteriaSubject)
        tutor_skill = instance.instance
        if not instance.instance:
            return Result(errors={"msg": "Skill not available by tutor"})
        # check if tutor already exists in pool
        if not rq.request.filter(tutor_id=tutor.pk).exists():
            instance.admin_actions_on_request_post(rq.pk, 1, cost=subject["hourlyRate"])
            # get the connected instance and update the subject
            rq.request.update(subjects=rq.request_subjects + [tutor_skill.skill.name])
        return Result(data={})

    @classmethod
    def generic_bulk_fetch(cls, data):
        kind = data.get("kind")
        params = data.get("params")

        if kind not in ["requests", "tutors", "tutor_responses"] and not params:
            return Result(errors={"msg": "Invalid params passed"}, status_code=400)
        if kind == "requests":
            return cls.fetch_requests_with_condition(params)
        if kind == "tutors":
            return cls.fetch_users_with_conditions(params)
        if kind == "tutor_responses":
            return cls.fetch_responses_with_conditions(params)
        return Result(errors={"msg": "Invalid params sent"}, status_code=400)

    @classmethod
    def fetch_responses_with_conditions(cls, data):
        status = data.get("status")
        if not status:
            return Result(errors={"msg": "Invalid params sent"}, status_code=400)
        options = {
            "pending": 1,
            "accepted": 2,
            "rejected": 3,
            "no_response": 4,
            "applied": 5,
            "replaced": 6,
        }
        try:
            dd = options[status]
        except KeyError as e:
            return Result(error={"msg": "Invalid status sent"}, status_code=400)
        responses = TutorJobResponse.objects.after_period(dd, datetime.datetime.now())
        result = [cls.tutor_job_info(x, False) for x in responses if x.tutor]
        return Result(data=result)

    @classmethod
    def fetch_users_with_conditions(cls, data):
        _type = data.get("type")
        if not _type:
            return Result(errors={"msg": "Invalid params sent"}, status_code=400)

        tutors = cls.considered_tutors()
        tutors = [
            {
                "email": x.email,
                "first_name": x.first_name,
                "slug": x.slug,
                "personalInfo": x.revamp_data("personalInfo"),
            }
            for x in tutors
            if (
                x.revamp_data("availability", "availabilityStatus")
                or {"isAvailable": True}
            ).get("isAvailable")
            == True
        ]
        return Result(data=list(tutors))

    @classmethod
    def fetch_requests_with_condition(cls, data):
        hours = data.get("hours")
        status_display = data.get("status")

        options = {
            "completed": BaseRequestTutor.COMPLETED,
            "pending": BaseRequestTutor.PENDING,
        }
        try:
            status = options[status_display]
        except KeyError as e:
            status = None
        if hours and status:
            query = BaseRequestTutor.objects.filter(
                status=status, related_request=None
            ).hours_elapsed(hours)
            valid_requests = [x for x in query if x.is_new_home_request]
            result = [
                {
                    **cls.get_request_info(o).data,
                    "agent": {
                        "id": o.agent.id,
                        "title": o.agent.title,
                        "name": o.agent.name,
                        "phone_number": str(o.agent.phone_number),
                        "email": o.agent.email,
                        "image": o.agent.profile_pic,
                        "slack_id": o.agent.slack_id,
                    },
                }
                for o in valid_requests
            ]
            return Result(data=result)

        return Result(errors={"msg": "Invalid hour or status sent"}, status_code=400)

    @classmethod
    def book_lessons(cls, body):
        from bookings.models import Booking, callback_async

        slug = body.get("slug")
        sessions = body.get("sessions")
        remark = body.get("remark") or ""
        try:
            instance = SingleRequestService(slug=slug)
            main_request = instance.instance
        except Exception as e:
            return Result(errors={"msg": "Missing slug or sessions"}, status_code=400)
        tutor = main_request.tutor
        payment_info = main_request.payment_info
        if not payment_info:
            return Result(
                errors={"msg": "No payment information found"}, status_code=400
            )
        try:
            payment_info = payment_info["lessonPayments"][0]
        except KeyError as e:
            pass
        skill = payment_info["tutor"]["subject"]["tuteriaName"]
        amount_paid = payment_info["lessonFee"]
        tutorskill = TutorSkill.objects.filter(
            tutor=main_request.tutor, skill__name=skill
        ).first()
        if not tutorskill:
            return Result(
                errors={"msg": f"No active Tutorskill matching {skill}"},
                status_code=400,
            )
        user_wallet = main_request.user.wallet
        if (user_wallet.total_available_balance) < amount_paid:
            return Result(
                errors={"msg": "Client balance less than booking"}, status_code=400
            )
        booking_order = instance.create_booking_by_tutor(
            sessions, tutorskill, remark=remark
        )
        if not booking_order:
            return Result(errors={"msg": "Could not create booking"}, status_code=400)
        booking = Booking.objects.get(pk=booking_order)
        # update wallet_amount in booking to match request
        # check users wallet and update accordingly
        vv = 0
        if 0 < user_wallet.credits < booking.total_price:
            vv = user_wallet.credits
            user_wallet.credits = 0
            user_wallet.save()
        new_paid = booking.total_price - vv
        transport_fare = payment_info.get("transportFare") or 0
        booking.wallet_amount = Decimal(new_paid) + Decimal(transport_fare)
        if tutor.is_premium:
            booking.booking_level = 75
        else:
            booking.booking_level = 70
        booking.tutor_discount = main_request.tutor_discount
        booking.tuteria_discount = main_request.tuteria_discount
        booking.transport_fare = transport_fare
        booking.witholding_tax = 5  # 5% withholding tax initially for tutors.
        booking.save()
        # call the action to update the booking to scheduled
        callback_async(booking, amount_paid, transaction_id=main_request.slug)
        booking = Booking.objects.get(
            pk=booking_order
        )  # fetch again to get updated info
        main_request.status = BaseRequestTutor.BOOKED
        main_request.booking = booking
        main_request.save()
        # update the parent request status if one of the split is booked
        if main_request.related_request:
            BaseRequestTutor.objects.filter(pk=main_request.related_request.pk).update(
                status=BaseRequestTutor.BOOKED
            )
        # when the wallet balance is used as a discount. in any other scenario, it
        # shouldn't run
        main_request.user.deduct_from_wallet(float("%.2f" % booking.total_price))
        main_request.user.wallet.sync_amount_available()
        main_request.user.wallet.sync_session_with_bookings()
        return Result(
            data={
                "from": booking.first_session.isoformat(),
                "to": booking.last_session.isoformat(),
                "bookingUrl": booking.get_tutor_l_absolute_url(),
            }
        )

    @classmethod
    def get_discount_stats(cls, body):
        slug = body.get("slug", "")
        code = body.get("discountCode", "")
        stats = BaseRequestTutor.get_discount_stats(slug, code)
        return Result(data=stats)

    @classmethod
    def parse_webhook(cls, body):
        contact = body.get("contact")
        conversation = body.get("conversation")
        request_instances = BaseRequestTutor.get_request_from_conversation(
            conversation.get("id"), contact.get("phone")
        )
        for i in request_instances:
            print(i.email)
            i.save_whatsapp_info({"contact": contact, "conversation": conversation})
        agents: typing.List[Agent] = set(
            [x.agent for x in request_instances if x.agent]
        )

        received_messages = [
            f"{x['message']} received at {date_parse(x['created']).strftime('%Y-%m-%d %I:%M')}"
            for x in conversation["messages"]
            if x["direction"] == "received"
        ]
        for i in agents:
            if i.slack_id:
                response = requests.post(
                    f"{settings.NOTIFICATION_SERVICE_URL}/send_slack_notification",
                    json={
                        "agentId": i.slack_id,
                        "message": "Whatsapp messages from {}\n\n{}\nadmin_link:{}".format(
                            contact["phone"],
                            "\n".join(received_messages),
                            f"http://www.tuteria.com{request_instances[0].link_to_admin_for_request()}",
                        ),
                    },
                )
                if response.status_code >= 400:
                    print(response.text)
        return Result(data={"status": True})

    @classmethod
    def send_notification_to_tutor(cls, slug, data, kind=""):
        main_request = BaseRequestTutor.objects.filter(slug=slug).first()
        if main_request:
            pass

    @classmethod
    def update_days_selected(cls, request: BaseRequestTutor):
        if request.is_new_home_request:
            tutor_slug = request.tutor.slug
            request_info = request.request_info
            tutor_info = request_info.get("tutor_info")
            client_details = request_info.get("client_request")
            lesson_details = client_details.get("lessonDetails")
            lesson_schedule = lesson_details.get("lessonSchedule")
            splitRequests = client_details.get("splitRequests") or []
            new_info = [x for x in splitRequests if x.get("tutorId") == tutor_slug]
            if new_info:
                new_info = new_info[0]
                tutor_info = new_info
                if not tutor_info.get("lessonDays"):
                    tutor_info["lessonDays"] = lesson_schedule.get("lessonDays") or []
                    tutor_info["lessonTime"] = lesson_schedule.get("lessonTime")
                    tutor_info["lessonHours"] = lesson_schedule.get("lessonHours")
                    tutor_info["lessonUrgency"] = lesson_schedule.get("lessonUrgency")
                    tutor_info["lessonDuration"] = lesson_schedule.get("lessonDuration")
                if not new_info.get("lessonDays"):
                    new_info = tutor_info
            client_details["splitRequests"] = splitRequests
            request_info["tutor_info"] = tutor_info
            request_info["client_request"] = client_details
            request.request_info = request_info
            request.save()

    @classmethod
    def successful_online_payment(cls, slug, amount_paid, kind="payment", deduct=False):
        # tutor to be notified of payment also client
        main_request = BaseRequestTutor.objects.filter(slug=slug).first()
        if main_request:
            if kind == "payment":
                main_request.deposit_payment_to_wallet(amount_paid, deduct=deduct)
            else:
                main_request = main_request.paid_speaking_fee(amount_paid)
            return Result(
                data={
                    "slug": main_request.slug,
                    "status": main_request.get_status_display(),
                }
            )
        return Result(errors={"msg": "No request with slug passed"}, status_code=400)

    @classmethod
    def get_request_info(cls, rq: BaseRequestTutor, as_parent=False):
        # data = rq.request_info or {}
        # request_info = data.get('client_request') or {}
        request_data = rq.client_request
        if as_parent:
            parent = rq.related_request
            if parent:
                request_data = parent.client_request
        walletBalance = 0
        if rq.user:
            walletBalance = rq.wallet_balance_available(True)
        return Result(
            data={
                "requestData": request_data,
                "paymentInfo": {
                    **rq.payment_info,
                    "walletBalance": walletBalance,
                    "paidSpeakingFee": rq.paid_fee,
                },
                "status": rq.get_status_display(),
                "slug": rq.slug,
                "created": rq.created.isoformat(),
            }
        )

    @classmethod
    def create_user(cls, instance):
        user = User.objects.filter(email=instance.email).first()
        if not user:
            user, password = CustomerService.create_user_instance(
                email=instance.email,
                first_name=instance.first_name,
                last_name=instance.last_name,
                background_check_consent=instance.is_parent_request,
                number=instance.number,
                address=instance.home_address,
                state=instance.state,
                longitude=instance.longitude,
                latitude=instance.latitude,
                vicinity=instance.vicinity,
                country=instance.country,
                # region=instance.region
            )
        return user

    @classmethod
    def issue_request(cls, data):
        email = data.get("email")
        phone = data.get("phone")
        country = data.get("country")
        country_code = data.get("country_code")
        discountCode = data.pop("discountCode", "")
        if not all([phone, country]):
            return Result(status_code=400, errors={"msg": "Missing params"})
        raw_number = f"+{phone.replace('+','')}"
        # if raw_number.startswith("234"):
        #     raw_number = phone.replace("234","+234")
        base_queryset = BaseRequestTutor.objects.filter(
            number__icontains=raw_number.lower(),
            is_parent_request=True,
            # email__iexact=email.lower(),
        )
        issued = base_queryset.filter(
            status=BaseRequestTutor.ISSUED,
        )
        if issued.exists():
            issued.delete()
        base_queryset.filter(
            status=BaseRequestTutor.COMPLETED,
            request_info__client_request__isnull=False,
            remarks=None,
        ).delete()
        existing = base_queryset.filter(
            status=BaseRequestTutor.COMPLETED,
            request_info__client_request__isnull=False,
        ).first()
        used = discountCode
        if discountCode:
            requests_with_code = BaseRequestTutor.objects.filter(
                request_info__paymentInfo__discountCode=discountCode
            ).filter(number__contains=phone)
            # check if any request already has the code that is still issued or completed
            # if so, the discount code is valid if they are all removed. else the discount
            # code is invalid.
            statuses = [
                x.status in [BaseRequestTutor.ISSUED, BaseRequestTutor.COMPLETED]
                for x in requests_with_code
            ]
            if statuses:
                if all(statuses):
                    for i in requests_with_code:
                        i.request_info["paymentInfo"]["discountCode"] = ""
                        i.save()
                else:
                    discountCode = ""

        slug = BaseRequestTutor.generate_slug()
        # agent = Agent.get_agent()
        request_info = {"client_request": {"contactDetails": data}}
        if discountCode:
            request_info["paymentInfo"] = {"discountCode": discountCode}
        if existing:
            main_request = existing
        else:
            main_request = BaseRequestTutor.objects.create(
                slug=slug,
                request_info=request_info,
                request_type=1,
                is_parent_request=True,
                status=BaseRequestTutor.ISSUED,
                number=raw_number,
                # agent=agent,
            )
        request_info = cls.get_request_info(main_request)
        return Result(
            data={
                **request_info.data,
                # **main_request.client_request,
                # "slug": main_request.slug,
                # "status": main_request.get_status_display(),
                "validDiscount": used == discountCode
                # "agent": {
                #     "title": agent.title,
                #     "name": agent.name,
                #     "phone_number": str(agent.phone_number),
                #     "email": agent.email,
                #     "image": "agent.image",
                # },
            }
        )

    @classmethod
    def update_request_data(cls, slug, data):
        key = data.get("key")
        value = data.get("data")
        main_request = BaseRequestTutor.objects.filter(slug=slug).first()
        if not main_request:
            return Result(errors={"msg": "Invalid slug"}, status_code=400)
        existing_detail = main_request.client_request.get(key)
        if not existing_detail:
            return Result(errors={"msg": "invalid key value"}, status_code=400)
        existing_detail.update(value)
        main_request.update_client_request(key, existing_detail)
        main_request.save()
        return Result(data={"requestData": main_request.client_request})

    @classmethod
    def update_request(cls, slug, data, paymentInfo, send_notice=True, is_admin=False):
        location_details = data.get("contactDetails") or {}
        splitRequests = data.get("splitRequests")
        lesson_schedule = (data.get("lessonDetails") or {}).get("lessonSchedule")
        filters = data.get("filters") or {}
        # clean all issued parent request instance
        main_request = BaseRequestTutor.objects.get(slug=slug)
        previous_client_request = main_request.client_request
        if lesson_schedule:
            previous_client_request["lessonDetails"] = data["lessonDetails"]
        # handle is_admin
        update_schedule_info(main_request, lesson_schedule)
        main_request.update_client_request("splitRequests", splitRequests)
        previous_payment_info = main_request.payment_info
        discountCode = previous_payment_info.get("discountCode") or paymentInfo.get(
            "discountCode"
        )
        timeSubmitted = previous_payment_info.get("timeSubmitted") or paymentInfo.get(
            "timeSubmitted"
        )
        couponDiscount = previous_payment_info.get("couponDiscount") or paymentInfo.get(
            "couponDiscount"
        )
        previous_info = main_request.payment_info or {}

        main_request.request_info = {
            **main_request.request_info,
            "client_request": previous_client_request,
            "paymentInfo": {
                **previous_info,
                **paymentInfo,
                "discountCode": discountCode,
                "timeSubmitted": timeSubmitted,
                "couponDiscount": couponDiscount,
            },
        }
        main_request.available_days = paymentInfo["daysRequested"]
        main_request.hours_per_day = paymentInfo["hoursOfLesson"]
        main_request.budget = paymentInfo["totalTuition"] + paymentInfo["totalDiscount"]
        if len(splitRequests) == 1:
            # check if tutor is connected to request and only then is the tutor
            # added
            tutor_id = splitRequests[0].get("tutorId")
            if tutor_id:
                tutor = User.objects.filter(slug=tutor_id).first()
                main_request.tutor = tutor
                TutorJobResponse.get_instance(main_request, tutor)
        STATUS = BaseRequestTutor.COMPLETED
        if send_notice:
            STATUS = BaseRequestTutor.PENDING
        main_request.status = STATUS
        main_request.save()
        slugs = []
        if len(splitRequests) > 1:
            split_slugs = BaseRequestTutor.objects.filter(related_request=main_request)
            for o, i in enumerate(split_slugs):
                slugs.append(i.slug)
                if i.request_info.get("tutor_info_index") is not None:
                    index = i.request_info.get("tutor_info_index")
                    i.request_info["tutor_info"] = splitRequests[index]
                    try:
                        p_info = paymentInfo["lessonPayments"][index]
                        i.request_info["paymentInfo"] = p_info
                        i.budget = p_info["lessonFee"]
                        tutor = User.objects.filter(
                            slug=splitRequests[index]["tutorId"]
                        ).first()
                        i.tutor = tutor
                        TutorJobResponse.get_instance(i, tutor)
                    except IndexError as e:
                        print(e)
                    except KeyError as e:
                        print(e)
                update_schedule_info(i, lesson_schedule, splitRequests[o])
                if not is_admin:
                    i.status = STATUS
                i.save()
                # send notice to tutor
                if send_notice:
                    send_notice_to_both_tutor_and_client.delay(i.slug)
        return Result(
            data={
                "requestData": main_request.client_request,
                "paymentInfo": main_request.payment_info,
                "slug": main_request.slug,
                "status": main_request.get_status_display(),
                "splits": sorted(slugs),
            }
        )

    @classmethod
    def initialize_request(cls, data, slug, update_raw=True, is_admin=False):
        location_details = data.get("contactDetails") or {}
        splitRequests = data.get("splitRequests")
        child_details = data.get("childDetails")
        contact_details = data.get("contactDetails") or {}
        lesson_schedule = (data.get("lessonDetails") or {}).get("lessonSchedule")
        filters = data.get("filters") or {}
        if not all(
            [
                location_details,
                splitRequests,
                child_details,
                contact_details,
                lesson_schedule,
                filters,
            ]
        ):
            return Result(status_code=400, errors={"msg": "Missing params"})
        email = contact_details.get("email")
        # clean all issued parent request instance
        issued = BaseRequestTutor.objects.filter(
            slug__iexact=slug,
            status__in=[
                BaseRequestTutor.ISSUED,
                BaseRequestTutor.COMPLETED,
                BaseRequestTutor.PENDING,
                BaseRequestTutor.PAYED,
            ],
        ).first()
        if not issued:
            return Result(status_code=400, errors={"msg": "Request not found"})
        # handle is_admin information.
        first_name = f"{contact_details['title']} {contact_details['firstName']}"
        last_name = contact_details["lastName"]
        phone = f"+{contact_details['phone']}"
        where_you_heard = contact_details["medium"]
        if where_you_heard:
            values = dict(BaseRequestTutor.WHERE_YOU_HEARD_CHOICES)
            for key, value in values.items():
                if value == where_you_heard:
                    where_you_heard = key
        home_address = location_details.get("address", "")
        # when we support different countries, would need to review this
        state = location_details.get("state", "")
        vicinity = location_details.get("region", "")
        region = location_details.get("vicinity", "")
        delivery_method = filters.get("lessonType") or "physical"
        request_type = 1
        gender_options = {"anyone": "", "male": "M", "female": "F"}
        no_of_students = len(child_details)
        gender = ""
        curriculum = parse_curriculum(splitRequests[0]["curriculum"])
        if delivery_method.lower() == "online":
            request_type = 3
        expectation = ""
        if len(splitRequests) == 1:
            expectation = construct_expectation(
                splitRequests[0], lesson_schedule.get("lessonPlan")
            )
        request_subjects = []
        if len(splitRequests) == 1:
            request_subjects = splitRequests[0]["subjectGroup"]
        classes = []
        tutor_info = {}
        if len(splitRequests) == 1:
            classes = splitRequests[0]["class"]
            tutor_info = splitRequests[0]
        agent = Agent.get_agent()
        existing = {"client_request": data, "tutor_info": tutor_info}
        previous = BaseRequestTutor.objects.filter(slug=slug).first()
        if previous:
            ext = previous.payment_info or {}
            existing["paymentInfo"] = ext
            if previous.agent:
                agent = previous.agent
        if not is_admin:
            STATUS = BaseRequestTutor.ISSUED  # temp changed from completed to issued
        else:
            STATUS = previous.status
        BaseRequestTutor.objects.filter(slug=slug).update(
            request_info=existing,
            expectation=expectation,
            request_type=request_type,
            is_parent_request=True,
            curriculum=curriculum,
            gender=gender,
            no_of_students=no_of_students,
            vicinity=vicinity,
            state=state,
            home_address=home_address,
            where_you_heard=where_you_heard,
            region=region,
            number=phone,
            first_name=first_name,
            last_name=last_name,
            status=STATUS,
            email=email,
            request_subjects=request_subjects,
            classes=classes,
            agent=agent,
        )
        main_request = BaseRequestTutor.objects.get(slug=slug)
        previous_status = main_request.status

        user = cls.create_user(main_request)
        main_request.user = user
        update_schedule_info(main_request, lesson_schedule)
        main_request.status = STATUS
        main_request.save()
        slugs = []
        if update_raw:
            if len(splitRequests) > 1:
                split_slugs = BaseRequestTutor.objects.filter(
                    related_request=main_request
                )
                if previous_status != BaseRequestTutor.PAYED:
                    if split_slugs.count() > 0:
                        BaseRequestTutor.objects.filter(
                            related_request=main_request
                        ).delete()
                    create_requests_from_response(splitRequests, data, main_request)
                    classes = []
                    request_subjects = []
                    slugs = []
                    split_slugs = BaseRequestTutor.objects.filter(
                        related_request=main_request
                    )
                    for o, i in enumerate(split_slugs):
                        classes.append(i.classes)
                        request_subjects.append(i.request_subjects)
                        slugs.append(i.slug)
                        i.agent = main_request.agent
                        i.status = main_request.status
                        i.user = main_request.user
                        if i.request_info.get("tutor_info_index") is not None:
                            index = i.request_info.get("tutor_info_index")
                            i.curriculum = parse_curriculum(
                                splitRequests[index]["curriculum"]
                            )
                            i.request_info["tutor_info"] = splitRequests[index]

                        update_schedule_info(i, lesson_schedule, splitRequests[o])
                        i.save()

                    main_request.valid_request = False
                    main_request.classes = [x for o in classes for x in o]
                    main_request.request_subjects = list(
                        sorted(list({x for o in request_subjects for x in o}))
                    )
                    main_request.save()
        rr = cls.get_request_info(main_request).data
        return Result(
            data={
                **rr,
                "status": main_request.get_status_display(),
                "slug": main_request.slug,
                "splits": slugs,
            }
        )

    @classmethod
    def considered_tutors(cls):
        queryset = User.objects.filter(
            profile__application_status=UserProfile.VERIFIED
        ).filter(data_dump__tutor_update__others__approved=True)
        return queryset

    @classmethod
    def build_availability_filter(cls, days, slot):
        filters = {
            f"data_dump__tutor_update__availability__availability__{x}__contains": [
                slot
            ]
            for x in days
        }
        return filters

    @classmethod
    def build_region_filter(cls, region: str, radius: float, state=None, country=None):
        return StateWithRegion.build_region_filter(
            region, radius, state=state, country=country
        )

    @classmethod
    def build_class_and_curriculum_filter(cls, class_of_child, curriculum):
        filters = {
            "data_dump__tutor_update__teachingProfile__classGroup__contains": class_of_child,
            "data_dump__tutor_update__teachingProfile__curriculums__contains": curriculum,
        }
        if not curriculum:
            filters.pop(
                "data_dump__tutor_update__teachingProfile__curriculums__contains", None
            )
        return filters

    @classmethod
    def build_subject_group_filter(
        cls, search_subject, subject_group, use_related=False
    ):
        queryset = TutorSkill.objects.exclude(
            status__in=[TutorSkill.DENIED, TutorSkill.SUSPENDED]
        )
        request_subjects = [*subject_group, search_subject]
        # import pdb; pdb.set_trace()
        # if use_related:
        #     skills = TutorSkill.objects.related_subject(request_subjects).values_list(
        #         "tutor_id", flat=True
        #     )
        #     return {"id__in": list(set(skills))}
        with_search_subject = queryset.exact_relation(search_subject).values_list(
            "tutor_id", flat=True
        )
        # with_search_subject = (
        #     queryset.filter(skill__name__iexact=search_subject)
        #     .filter(status=TutorSkill.ACTIVE)
        #     .values_list("tutor_id", flat=True)
        # )
        with_subject_group = queryset.exact_relation(
            subject_group, is_array=True, clean=False
        ).values_list("tutor_id", flat=True)
        # with_subject_group = queryset.filter(skill__name__in=subject_group).values_list(
        #     "tutor_id", flat=True
        # )
        if not with_subject_group:
            with_subject_group = with_search_subject

        return {
            "id__in": list(
                # set(with_search_subject).union(set(with_subject_group))
                set(with_search_subject).intersection(set(with_subject_group))
            )
        }

    @classmethod
    def clean_search_params(cls, params):
        non_empty = lambda o: [u for u in o.split(",") if u != ""]
        search_subject = params.get("searchSubject")
        subject_group = [
            x for x in non_empty(params.get("searchGroup", "")) if x != search_subject
        ]
        curriculum = non_empty(params.get("curriculum", ""))
        class_of_child = non_empty(params.get("class", ""))
        lesson_days = non_empty(params.get("lessonDays", ""))
        lesson_time = params.get("lessonTime")
        region = params.get("region")
        state = params.get("state")
        vicinity = params.get("vicinity")
        country = params.get("country")
        radius = params.get("radius")
        slot = params.get("slot")
        use_related = True
        time_range = non_empty(params.get("time_range", ""))
        hourly_times = non_empty(params.get("hourlyTimes", ""))
        if isinstance(radius, str):
            radius = float(radius)
        return dict(
            lesson_days=lesson_days,
            radius=radius,
            region=region,
            state=state,
            slot=slot,
            class_of_child=class_of_child,
            curriculum=curriculum,
            search_subject=search_subject,
            vicinity=vicinity,
            subject_group=subject_group,
            time_range=time_range,
            hourly_times=hourly_times,
            use_related=use_related,
        )

    @classmethod
    def get_search_result(cls, params):
        search_params = cls.clean_search_params(params)
        return cls.search_queryset(**search_params)

    @classmethod
    def create_booking_for_pool_tutor(cls, slug, data):
        from external.services import SingleRequestService

        instance: BaseRequestTutor = BaseRequestTutor.objects.filter(
            slug__iexact=slug
        ).first()
        selectedTutor = data.get("tutor")
        amount = data.get("amount")
        if not instance:
            return Result(errors={"msg": "Request not found"}, status_code=400)
        _service = SingleRequestService(instance=instance, tutor_slug=selectedTutor)
        if not _service.selected_tutor:
            return Result(errors={"msg": "No tutor with slug passed"}, status_code=400)
        order = _service.create_booking(amount=amount)
        return Result(data=order)

    @classmethod
    def update_payment_made_for_pool_tutor(cls, slug, data):
        amount_paid = data.get("amount")
        instance: BaseRequestTutor = BaseRequestTutor.objects.filter(
            slug__iexact=slug
        ).first()
        if not instance or not amount_paid:
            return Result(errors={"msg": "Request not found"}, status_code=400)
        instance.update_payment_and_status(amount_paid)
        return Result(data={"msg": True})

    @classmethod
    def in_search_format(cls, tutor_slugs):
        tutorskills = (
            TutorSkill.objects.select_related("skill")
            .exclude(status=TutorSkill.DENIED)
            .filter(tutor__slug__in=tutor_slugs)
            .all()
        )
        queryset = User.objects.filter(slug__in=tutor_slugs)
        result = cls.additional_fields_to_queryset(queryset, 0, "", tutorskills)
        return result, tutorskills

    @classmethod
    def tutors_who_applied_for_job(cls, slug: str):
        instance: BaseRequestTutor = BaseRequestTutor.objects.filter(
            slug__iexact=slug
        ).first()
        if not instance:
            return Result(errors={"msg": "Request not found"}, status_code=400)
        approved_tutors: typing.List[RequestPool] = RequestPool.objects.filter(
            req=instance
        ).all()
        tutor_slugs = [x.tutor.slug for x in approved_tutors]
        result, tutorskills = cls.in_search_format(tutor_slugs)

        def get_result(slug):
            uu = [x for x in result if x["userId"] == slug]
            if uu:
                return uu[0]

        result = [
            {
                **get_result(x.tutor.slug),
                "subject": {
                    **cls.parse_subject(
                        x.tutor,
                        tutorskills,
                        search_subject=x.default_subject,
                    ),
                    "hourlyRate": float("%.2f" % x.cost),
                },
                # "totalAmount": x.tutor_budget,
                # "lessons": x.no_of_lessons,
            }
            for x in approved_tutors
        ]
        return Result(data=result)

    @classmethod
    def update_request_pool(cls, slug: str, params, request):
        budget = params.get("budget")
        applicants = params.get("applicants")
        send_profile = params.get("send_profile")
        split = params.get("split")
        instance: BaseRequestTutor = BaseRequestTutor.objects.filter(slug=slug).first()
        if not instance or not all([budget, applicants]):
            return Result(error={"msg": "Missing record or invalid parameters passed"})
        # create the request pool records
        # reset all the approved status of all pool records
        RequestPool.objects.filter(req=instance).update(approved=False)
        for i in applicants:
            if i.get("tutor_slug"):
                tutor = User.objects.get(slug=i["tutor_slug"])
                rp, _ = RequestPool.objects.get_or_create(req=instance, tutor=tutor)
                rp.subjects = (
                    [i["default_subject"]] if split else instance.request_subjects
                )
                rp.default_subject = i["default_subject"]
                rp.cost = i["cost"]
                rp.other_info = {
                    "budget": i["lessonFee"],
                    "no_of_lessons": i["lessons"],
                }
                rp.approved = True
                rp.save()
        # update the budget value of the request
        instance.budget = budget
        instance.save()
        # send mail to client to view profile.
        _inst = SingleRequestService(instance=instance)
        if send_profile:
            _inst.add_tutors_to_client_pool2(request)
        return Result(data={"status": True})

    @classmethod
    def specific_tutor_search(cls, params):
        tutor_email = params.get("email")
        default_subject = params.get("default_subject")
        instance = User.objects.filter(
            Q(email=tutor_email) | Q(slug=tutor_email)
        ).first()
        if not instance:
            return Result(error={"msg": "Tutor not found"}, status_code=400)
        tutor_slugs = [instance.slug]
        result, tutorskills = cls.in_search_format(tutor_slugs)
        result = [
            {
                **x,
                "subject": {
                    **cls.parse_subject(
                        instance, tutorskills, search_subject=default_subject
                    )
                },
            }
            for x in result
        ]
        return Result(data=result)

    @classmethod
    def tutors_selected_for_job(cls, slug: str):
        instance: BaseRequestTutor = BaseRequestTutor.objects.filter(
            slug__iexact=slug
        ).first()
        if not instance:
            return Result(errors={"msg": "Request not found"}, status_code=400)
        approved_tutors: typing.List[RequestPool] = instance.approved_tutors()
        tutor_slugs = [x.tutor.slug for x in approved_tutors]
        tutorskills = (
            TutorSkill.objects.select_related("skill")
            .exclude(status=TutorSkill.DENIED)
            .filter(tutor__slug__in=tutor_slugs)
            .all()
        )
        queryset = User.objects.filter(slug__in=tutor_slugs)
        result = cls.additional_fields_to_queryset(queryset, 0, "", tutorskills)

        def get_result(slug):
            uu = [x for x in result if x["userId"] == slug]
            if uu:
                return uu[0]

        result = [
            {
                **get_result(x.tutor.slug),
                "subject": cls.parse_subject(
                    x.tutor,
                    tutorskills,
                    search_subject=x.default_subject,
                ),
                "totalAmount": x.tutor_budget,
                "lessons": x.no_of_lessons,
            }
            for x in approved_tutors
        ]
        agent: Agent = instance.agent
        agent_info = {
            "id": agent.id,
            "title": agent.title,
            "name": agent.name,
            "phone_number": str(agent.phone_number),
            "email": agent.email,
            "image": agent.profile_pic,
            "slack_id": agent.slack_id,
        }
        request_info, split_count = instance.get_request_info(True)
        first_search = [x for x in result if x]
        return Result(
            data={
                "serverInfo": {
                    "agent": agent_info,
                    "created": instance.created.isoformat(),
                    "modified": instance.modified.isoformat(),
                    "status": instance.get_status_display(),
                    "tutorRequestInfo": instance.build_split_detail(),
                    "rawRequest": {
                        "budget": float("%.2f" % instance.budget),
                        "hourlyRate": float("%.2f" % instance.per_hour()),
                    },
                },
                "tutors": first_search,
                "requestInfo": request_info,
                "agent": agent_info,
                "split_count": split_count,
            }
        )

    @classmethod
    def search_queryset(
        cls,
        lesson_days=None,
        radius=None,
        region=None,
        state=None,
        vicinity=None,
        country=None,
        slot=None,
        class_of_child=None,
        curriculum=None,
        search_subject=None,
        subject_group=None,
        use_related=False,
        **kwargs,
    ):
        availability_filter = cls.build_availability_filter(lesson_days, slot)
        # availability_filter = {}
        vicinity_filter = {
            "data_dump__tutor_update__personalInfo__vicinity__icontains": vicinity
        }
        if region:
            with_distance, region_filter = cls.build_region_filter(
                region, radius, state=state, country=country
            )
        else:
            with_distance = 0
            region_filter = {
                # "data_dump__tutor_update__personalInfo__country": country,
                "data_dump__tutor_update__teachingProfile__onlineProfile__acceptsOnline": True,
            }
        class_curriculum_filter = cls.build_class_and_curriculum_filter(
            class_of_child, curriculum  # to fix
        )
        subject_group_filter = cls.build_subject_group_filter(
            search_subject, subject_group, use_related=use_related
        )
        # queryset = User.objects.filter(profile__application_status=UserProfile.VERIFIED)
        queryset = User.objects.filter(data_dump__tutor_update__others__approved=True)
        result = (
            queryset.filter(Q(**subject_group_filter))
            # .filter(Q(**class_curriculum_filter))
            .filter(Q(**region_filter) | Q(**vicinity_filter))
            .filter(Q(**availability_filter))
            .filter(data_dump__tutor_update__pricingInfo__hourlyRates__isnull=False)
        ).filter(
            Q(
                data_dump__tutor_update__availability__availabilityStatus__isAvailable=True
            )
            | Q(data_dump__tutor_update__availability__availabilityStatus__isnull=True)
        )

        # import pdb; pdb.set_trace()
        tutor_ids = result.values_list("pk", flat=True)
        tutorskills = (
            TutorSkill.objects.select_related("skill")
            .exclude(status=TutorSkill.DENIED)
            .filter(tutor_id__in=list(tutor_ids), price__gt=0)
            .all()
        )
        if region:
            # tutors with state to exclude
            excluders = User.objects.filter(
                data_dump__tutor_update__availability__exemptedAreas__contains=region
            ).values_list("pk", flat=True)
            tutorskills = tutorskills.exclude(tutor_id__in=list(excluders))
        result = cls.additional_fields_to_queryset(
            result, with_distance, search_subject, tutorskills
        )
        return result

    @classmethod
    def selected_tutors_data(cls, request: BaseRequestTutor, params):
        if request.vicinity:
            with_distance, _ = cls.build_region_filter(
                request.vicinity,
                params["radius"],
                state=request.state,
                country=params["country"],
            )
        else:
            with_distance = 0
        tutorskills = (
            TutorSkill.objects.select_related("skill")
            .exclude(status=TutorSkill.DENIED)
            .filter(tutor__slug__in=list(params["tutors"]))
            .all()
        )
        queryset = User.objects.filter(slug__in=params["tutors"])
        return cls.additional_fields_to_queryset(
            queryset, with_distance, params["search_subject"], tutorskills
        )

    @classmethod
    def tutor_job_info(cls, tutorJob: TutorJobResponse, skip=False):
        result = {}
        if not skip:
            result = {**tutorJob.req.client_request}
            parent = tutorJob.req.related_request
            if parent:
                result = {**parent.client_request}
        return {
            **result,
            "slug": tutorJob.req.slug,
            "status": tutorJob.req.get_status_display(),
            "tutor_info": tutorJob.req.request_info_for_tutor,
            "paymentInfo": tutorJob.req.payment_info,
            "created": tutorJob.req.created.isoformat(),
            "agent": {
                "name": tutorJob.req.agent.name,
                "phone_number": str(tutorJob.req.agent.phone_number),
                "image": tutorJob.req.agent.profile_pic,
                "slack_id": tutorJob.req.agent.slack_id,
            }
            if tutorJob.req.agent
            else {},
            "tutorResponse": {
                "tutor_name": tutorJob.tutor.first_name,
                "tutor_id": tutorJob.tutor.slug,
                "id": tutorJob.pk,
                "status": tutorJob.get_status_display(),
                "responseTime": tutorJob.response_time,
                **(tutorJob.data_dump or {}),
                "created": tutorJob.created.isoformat(),
            },
        }

    @classmethod
    def get_tutor_jobs(cls, slug):
        tutor = User.objects.filter(
            slug=slug, profile__application_status=UserProfile.VERIFIED
        ).first()
        if not tutor:
            return Result(errors="Tutor does not exist")
        tutoring_jobs = TutorJobResponse.objects.filter(tutor=tutor).all()
        result = [cls.tutor_job_info(x) for x in tutoring_jobs if x.tutor]
        return Result(data=result)

    @classmethod
    def save_tutor_response(cls, data):
        tutor_slug = data.get("tutor_slug")
        tutor_response = data.get("tutorResponse") or {}
        pk = tutor_response.pop("id", None)
        status = tutor_response.pop("status", None)
        responseTime = tutor_response.pop("responseTime", 0) or 0
        request_slug = data.get("slug")
        instance = TutorJobResponse.objects.filter(
            tutor__slug=tutor_slug, req__slug=request_slug
        ).first()
        if not instance:
            return Result(errors="Invalid tutor or id passed")
        if status not in ["accepted", "declined", "no_response"]:
            return Result(errors="Invalid status passed.")
        result = TutorJobResponse.update_tutor_response(
            pk=instance.pk, status=status, responseTime=responseTime, **tutor_response
        )
        return Result(
            data={
                "id": result.pk,
                "status": result.get_status_display(),
                "responseTime": result.response_time,
                **result.data_dump,
            }
        )

    @classmethod
    def get_tutor_reviews(cls, slug):
        reviews = (
            SkillReview.objects.select_related("commenter", "tutor_skill__skill")
            .filter(
                tutor_skill__tutor__slug=slug, review_type=SkillReview.USER_TO_TUTOR
            )
            .annotate(lessonsBooked=Count("booking__bookingsession", distinct=True))
        )
        certifications = (
            SkillCertificate.objects.filter(ts__tutor__slug=slug)
            .exclude(
                Q(award_name="")
                | Q(award_name__isnull=True)
                | Q(award_institution="")
                | Q(award_institution__isnull=True)
            )
            .order_by("award_name")
            .distinct("award_name")
        )
        return reviews, certifications

    @classmethod
    def additional_fields_to_queryset(
        cls, queryset, with_distance, search_subject, tutorskills
    ):

        bare_skill_review_sql = (
            # lambda o: f'SELECT {o}) as "skill_rating" FROM "reviews_skillreview" U0 INNER JOIN "skills_tutorskill" U1 ON (U0."tutor_skill_id" = U1."id") WHERE (U1."tutor_id" = ("auth_user"."id") AND U0."review_type" = 1)'
            lambda o: f'SELECT {o}) as "skill_rating" FROM "reviews_skillreview" U0 LEFT OUTER JOIN "skills_tutorskill" U1 ON (U0."tutor_skill_id" = U1."id") WHERE (U1."tutor_id" = ("auth_user"."id") AND U0."review_type" = 1)'
        )
        skill_review_sql = bare_skill_review_sql('AVG(U0."score"')
        rating_count_sql = bare_skill_review_sql('COUNT(U0."id"')
        # rating_count_sql = bare_skill_review_sql("COUNT(DISTINCT ")
        lessons_taught_sql = f'SELECT COUNT(DISTINCT U0."id") as "lessonsTaught" FROM "bookings_bookingsession" U0 INNER JOIN "bookings_booking" U1 ON (U0."booking_id" = U1."order") WHERE (U1."tutor_id" = ("auth_user"."id") AND NOT ("bookings_bookingsession"."status" = 1) AND NOT ("bookings_bookingsession"."status" = 5))'
        result: typing.List[User] = queryset.new_search()
        # result: typing.List[User] = (
        #     queryset.prefetch_related(
        #         Prefetch(
        #             "t_bookings",
        #             queryset=Booking.objects.prefetch_related("bookingsession_set")
        #             .filter(status=Booking.SCHEDULED)
        #             .order_by("user_id")
        #             .distinct("user_id"),
        #             to_attr="unique_bookings",
        #         )
        #     )
        #     .prefetch_related(
        #         (
        #             Prefetch(
        #                 "t_bookings",
        #                 queryset=Booking.objects.exclude(
        #                     Q(status=Booking.CANCELLED) | Q(status=Booking.INITIALIZED)
        #                 )
        #                 .order_by("user_id")
        #                 .distinct("user_id"),
        #                 to_attr="student_arr",
        #             )
        #         )
        #     )
        #     # .annotate(
        #     #     students=RawSQL(
        #     #         'SELECT COUNT(DISTINCT "u0"."user_id") AS "unique_client" FROM "bookings_booking" U0 WHERE U0."tutor_id" = ("auth_user"."id")',
        #     #         (),
        #     #         4,
        #     #     )
        #     # )
        #     .annotate(lessonsTaught=RawSQL(lessons_taught_sql, ()))
        #     .annotate(rating=RawSQL(skill_review_sql, ()))
        #     .annotate(rating_count=RawSQL(rating_count_sql, ()))
        #     .annotate(lessonsTaught=Count("t_bookings__bookingsession"))
        #     .response_annotation(datetime.datetime.now() - relativedelta(months=4))
        #     .all()
        # )

        def get_sessions(o):
            return [x for y in o for x in y.bookingsession_set.all()]

        def get_from_dump(x, parent):
            uu = x.data_dump
            if uu:
                pp = uu.get("tutor_update") or {}
                return pp.get(parent) or {}
            return {}

        return [
            {
                "userId": x.slug,
                "email": x.email,
                "firstName": x.first_name,
                "lastName": x.last_name,
                "gender": "male" if x.profile.gender == "M" else "female",
                "photo": x.cloudinary_image,
                "level": "premium"
                if get_from_dump(x, "others").get("premium")
                else "regular",
                "delivery": x.delivery,
                "dateOfBirth": get_from_dump(x, "personalInfo").get("dateOfBirth")
                or "",
                "phone": get_from_dump(x, "personalInfo").get("phone") or "",
                "requestPending": x.pending_to_be_booked,
                "requestsDeclined": x.requestsDeclined,
                "totalJobsAssigned": x.totalJobsAssigned,
                "totalJobsAccepted": x.totalJobsAccepted,
                "requestsNotResponded": x.requestsNotResponded,
                "activeBookings": [
                    {
                        "startDate": j.first_session.strftime("%Y-%m-%d")
                        if j.first_session
                        else "",
                        "endDate": j.last_session.strftime("%Y-%m-%d")
                        if j.last_session
                        else "",
                        "schedule": list(
                            {
                                f'{k.start.strftime("%A")}: {k.start.strftime("%-I%p")} - {k.end.strftime("%-I%p")}'
                                for k in j.bookingsession_set.all()
                            }
                        ),
                    }
                    for j in x.unique_bookings
                ],
                "distance": x.determine_distance(with_distance) if with_distance else 0,
                "rating": x.rating,
                "ratingCount": x.rating_count,
                "isIdVerified": get_from_dump(x, "identity").get("isIdVerified")
                or False,
                "isBackgroundChecked": True,
                "videoIntro": None,
                "students": x.student_arr,
                "lessonsTaught": x.lessonsTaught,
                "newTutorDiscount": x.revamp_data("pricingInfo", "newTutorDiscount")
                or 0,
                "isNewTutor": x.date_joined >= datetime.datetime(2022, 1, 1),
                "country": x.revamp_data("personalInfo", "country") or "",
                "state": x.revamp_data("personalInfo", "state") or "",
                "region": x.revamp_data("personalInfo", "region") or "",
                "vicinity": x.revamp_data("personalInfo", "vicinity") or "",
                "specialNeedExpertise": x.revamp_data("teachingProfile", "specialNeeds")
                or [],
                "examsExperience": cls.get_examExperiences(
                    x, tutor_skills=x.get_tutor_skills(tutorskills)
                ),
                "curriculum": cls.get_curriculums(
                    x, tutor_skills=x.get_tutor_skills(tutorskills)
                ),
                "levelsTaught": cls.get_levelsTaught(
                    x, tutor_skills=x.get_tutor_skills(tutorskills)
                ),
                "entranceSchools": cls.get_entranceSchools(
                    x, tutor_skills=x.get_tutor_skills(tutorskills)
                ),
                "education": x.revamp_data("educationWorkHistory", "educations") or [],
                "workHistory": x.revamp_data("educationWorkHistory", "workHistories")
                or [],
                "certification": [],
                "subject": cls.parse_subject(
                    x, tutorskills, search_subject=search_subject
                ),
                "subjectList": [y.skill.name for y in x.get_tutor_skills(tutorskills)],
                "testimonials": [],
                **x.availability_info(),
            }
            for x in result
        ]

    @classmethod
    def get_curriculums(
        cls, instance: User, tutor_skills: typing.List[TutorSkill] = ()
    ):
        curriculums = instance.revamp_data("teachingProfile", "curriculums") or []
        if curriculums:
            return curriculums
        merged = [(x.curriculum_used or []) for x in tutor_skills]
        return list(set([x for y in merged for x in y]))

    @classmethod
    def get_levelsTaught(
        cls, instance: User, tutor_skills: typing.List[TutorSkill] = ()
    ):
        levels_taught = instance.revamp_data("teachingProfile", "classGroup") or []
        if levels_taught:
            return levels_taught
        merged = [x.levels_taught for x in tutor_skills]
        return list(set([x for y in merged for x in y]))

    @classmethod
    def get_entranceSchools(
        cls, instance: User, tutor_skills: typing.List[TutorSkill] = ()
    ):
        schools = (instance.revamp_data("teachingProfile", "examExperience") or {}).get(
            "schools"
        ) or []
        if schools:
            return schools
        merged = [x.schools_taught for x in tutor_skills]
        return list(set([x for y in merged for x in y]))

    @classmethod
    def get_examExperiences(
        cls, instance: User, tutor_skills: typing.List[TutorSkill] = ()
    ):
        exams = (instance.revamp_data("teachingProfile", "examExperience") or {}).get(
            "exams"
        ) or []
        if exams:
            return exams
        merged = [x.actual_exams for x in tutor_skills]
        return list(set([x for y in merged for x in y]))

    @classmethod
    def parse_subject(cls, instance: User, tutorskills, search_subject=None):
        x = instance
        hourlyRate = x.revamp_data("pricingInfo", "hourlyRates") or {}
        extraStudents = x.revamp_data("pricingInfo", "extraStudents") or {}
        key = search_subject
        if not key:
            key = list(hourlyRate.keys())
            if len(key) > 0:
                key = key[0]
        if not isinstance(key, str):
            key = ""
        hourlyRate = hourlyRate.get(key) or 0
        extraStudents = extraStudents.get(key) or 0
        return {
            "hourlyRate": float(hourlyRate),
            "discountForExtraStudents": (
                x.revamp_data("pricingInfo", "discountForExtraStudents") or 0
            ),
            "extraStudents": extraStudents,
            **x.get_search_skill(tutorskills, search_subject, float(hourlyRate)),
        }


class GroupRequestService:
    @classmethod
    def get_unpaid_request(cls, email, amount=None):
        data = (
            BaseRequestTutor.objects.filter(
                email=email, request_info__paymentInfo__isnull=False
            )
            .exclude(status=BaseRequestTutor.PAYED)
            .first()
        )
        return data

    @classmethod
    def get_bank_details(
        self, email, key="ravepay_dev", permanent=True, account_name="Tuteria Limited"
    ):
        PAYMENT_API = "https://payments-three.now.sh"
        response = requests.post(
            f"{PAYMENT_API}/generate-account-no/{key}",
            json={
                "client_email": email,
                "permanent": permanent,
                "account_name": account_name,
            },
        )
        if response.status_code < 400:
            result = response.json()
            return {
                "status": True,
                "data": {
                    "bank": result["data"]["bankname"],
                    "account_no": result["data"]["accountnumber"],
                    "ref": result["data"]["orderRef"],
                },
            }
        return {"status": False, "msg": "Error when creating account number"}

    @classmethod
    def ensure_bank_details(self, email, **kwargs):
        times = 3
        while times > 0:
            result = self.get_bank_details(email, **kwargs)
            if not result["status"]:
                times -= 1
                time.sleep(3)
            else:
                break
        return result

    @classmethod
    def create_request_instance(self, request_fields, user, data):
        instance = BaseRequestTutor()
        for key, value in request_fields.items():
            setattr(instance, key, value)
        instance.slug = generate_code(BaseRequestTutor, "slug")
        if not instance.last_name:
            instance.last_name = ""
        instance.save()
        if user:
            instance.user = user
        else:
            _user, password = CustomerService.create_user_instance(
                email=instance.email,
                first_name=instance.first_name,
                last_name=instance.last_name,
                background_check_consent=instance.is_parent_request,
                number=instance.number,
                address=instance.home_address,
                state=instance.state,
                longitude=instance.longitude,
                latitude=instance.latitude,
                vicinity=instance.vicinity,
                country=instance.country,
                # region=instance.region
            )
            password = (data.get("personalInfo") or {}).get("password")
            if password:
                _user.set_password(data["personalInfo"]["password"])
            _user.save()
            instance.user = _user
        instance.status = BaseRequestTutor.PENDING
        instance.save()
        return instance

    @classmethod
    def initialize_request(cls, data, email=None) -> Result:

        user_email = email
        if not email:
            user_email = data["personalInfo"]["email"]
        user = None
        subject = data["classInfo"]["related_subject"]
        budget = data["classInfo"]["totalFee"]
        agent = Agent.get_agent(kind=Agent.GROUP)
        # if "ielts" not in subject.lower():
        #     agent = Agent.get_agent()
        # if "tef" not in subject.lower():
        #     agent = Agent.get_agent()
        medium = ""
        where_you_heards = [
            x[0]
            for x in BaseRequestTutor.WHERE_YOU_HEARD_CHOICES
            if x[1].lower() == data["requestInfo"]["medium"].lower()
        ]
        if where_you_heards:
            medium = where_you_heards[0]
        students = (
            data["requestInfo"].get("students")
            or data["requestInfo"].get("children")
            or []
        )
        request_fields = {
            "request_type": 5,
            "is_parent_request": False,
            "request_subjects": [subject],
            "request_info": data,
            "budget": budget,
            "no_of_students": len(students),
            "where_you_heard": medium,
            "agent": agent,
        }
        if user_email:
            user = User.objects.filter(email__iexact=user_email).first()
            if user:
                location = user.home_address
                phone = user.primary_phone_no
                if phone:
                    phone = str(phone.number)
                else:
                    phone = data["personalInfo"]["phone"]
                if not phone.startswith("+"):
                    phone = "+" + phone
                state = ""
                vicinity = ""
                region = ""
                address = ""
                if location:
                    state = location.state
                    vicinity = location.vicinity
                    region = location.region
                    address = location.address
                    # if state.lower() == "abuja":
                    #     obj = Agent.get_abuja_agent()
                    #     if obj:
                    #         agent = obj
                    #         request_fields.update(agent=agent)
                request_fields.update(
                    first_name=user.first_name,
                    last_name=user.last_name,
                    email=user.email,
                    country=user.country,
                    number=phone,
                    home_address=address,
                    state=state,
                    vicinity=vicinity,
                    # region=region,
                )
            else:
                phone_no = data["personalInfo"]["phone"]
                if not phone_no.startswith("+"):
                    phone_no = "+" + phone_no
                request_fields.update(
                    email=user_email,
                    first_name=data["personalInfo"]["firstName"],
                    last_name=data["personalInfo"]["lastName"],
                    home_address=data["personalInfo"]["address"],
                    state=data["personalInfo"]["state"],
                    country=data["personalInfo"]["country"],
                    vicinity=data["personalInfo"]["vicinity"],
                    region=data["personalInfo"].get("region"),
                    number=phone_no,
                )
        else:
            phone_no = data["personalInfo"]["phone"]
            if not phone_no.startswith("+"):
                phone_no = "+" + phone_no
            request_fields.update(
                email=user_email,
                first_name=data["personalInfo"]["firstName"],
                last_name=data["personalInfo"]["lastName"],
                home_address=data["personalInfo"]["address"],
                state=data["personalInfo"]["state"],
                country=data["personalInfo"]["country"],
                vicinity=data["personalInfo"]["vicinity"],
                region=data["personalInfo"].get("region"),
                number=phone_no,
            )
        # fetch all requests that match the new flow
        existing_records = BaseRequestTutor.objects.filter(
            email__iexact=user_email,
            request_type=5,
            request_info__classInfo__related_subject=subject,
        ).exclude(status=BaseRequestTutor.PAYED)
        if (
            len(existing_records) == 0
        ):  # when none previously exists create request with info
            instance = cls.create_request_instance(request_fields, user, data)
        else:
            courseId = data["classInfo"]["courseID"]
            similar_course = existing_records.filter(
                request_info__classInfo__courseID=courseId
            ).first()
            if not similar_course:
                # create requests
                instance = cls.create_request_instance(request_fields, user, data)
            else:
                instance = similar_course
                BaseRequestTutor.objects.filter(
                    email=instance.email, pk=instance.pk
                ).update(created=timezone.now(), **request_fields)
                instance = BaseRequestTutor.objects.get(pk=instance.pk)
            if "personalInfo" in data:
                # changed logic so thqt all request is treated as new.
                password = data["personalInfo"].get("password")
                if not password:
                    for key, value in request_fields.items():
                        setattr(instance, key, value)
                    instance.save()
                else:
                    instance.status = BaseRequestTutor.ISSUED
                    instance.save()
                    callback_url = (
                        (data.get("redirect_url") or "") + "&slug=" + instance.slug
                    )
                    return Result(
                        errors={
                            "callback_url": callback_url,
                            "email": instance.email,
                            "msg": f"An account with {instance.email} already exists. An email has been sent to log in.",
                        },
                        status_code=403,
                    )
        # check for existing bank payment info by user
        with_bank_info = BaseRequestTutor.objects.filter(
            email=instance.email, request_info__paymentInfo__isnull=False
        ).first()
        if with_bank_info:
            instance.request_info["paymentInfo"] = with_bank_info.request_info[
                "paymentInfo"
            ]
            instance.save()
        # if not email:
        #     user_exists = BaseRequestTutor.objects.filter().exclude(user=None).exists()

        #     if not user_exists:
        #         # create user
        #         pass
        cls.update_request_to_admin_friendly(instance)
        return Result(
            data={
                "classSelected": data["classInfo"]["classSelected"],
                "bookingID": instance.slug,
                "status": instance.get_status_display(),
                "registrationInfo": data["requestInfo"],
            }
        )

    @classmethod
    def update_request_to_admin_friendly(cls, model_instance: BaseRequestTutor):
        if model_instance.is_batched:
            request_info = model_instance.request_info
            class_info = request_info.get("classInfo")
            model_instance.no_of_students = model_instance.no_of_students + 1
            model_instance.status = BaseRequestTutor.PENDING
            if class_info:
                key = f"Course_{class_info['courseID']}-{class_info['classSelected']}"
                course_instance = cache.get(key)
                if not course_instance:
                    course_instance = GoogleSheetHelper.get_summary_info(
                        class_info["courseID"], class_info["classSelected"]
                    )
                    cache.set(key, course_instance, 60 * 60 * 24)
                if model_instance.no_of_students > 1:
                    students = request_info["requestInfo"].get(
                        "children"
                    ) or request_info["requestInfo"].get("students")
                    if course_instance:
                        course_instance["students"] = students
                if course_instance:
                    course_instance["payment_info"] = (
                        request_info.get("paymentInfo") or {}
                    )
                    request_info["admin_info"] = course_instance
                    model_instance.request_info = request_info
                    summary = course_instance["summary"] or {}
                    model_instance.vicinity = (
                        summary.get("venue")
                        if not summary.get("is_online")
                        else "Online"
                    )
                    model_instance.save()

    @classmethod
    def construct_summary(cls, model_instance: BaseRequestTutor):
        summary = ""
        if model_instance.is_batched:
            info = model_instance.request_info.get("admin_info")
            if info:
                summary = ""
                if info.get("summary"):
                    if info["summary"].get("name"):
                        summary = (
                            f"Name: {info['summary']['name']}\n "
                            f"lesson Price: {info['summary']['lesson_price']}"
                        )
                if model_instance.no_of_students > 1:

                    def callback(s):
                        first_name = s.get("firstName")
                        last_name = s.get("lastName")
                        age = s.get("age")
                        klass = s.get("class")
                        gender = s.get("gender")
                        email = s.get("email")
                        phone = s.get("phone")

                        text = f"{first_name} "
                        if last_name:
                            text += f"{last_name}\n"
                        if age:
                            text += f"Age:{age},\n"
                        if klass:
                            text += f"Class:{klass},\n"
                        if email:
                            text += f"{email} "
                        if phone:
                            text += f"{phone}"
                        return text

                    summary += f" Students: {','.join([callback(x) for x in info['students']])}\n"
                if info.get("payment_info"):
                    summary += f"\nPayment Info: {str(info['payment_info'])}\n"
                request_info = model_instance.request_info.get("requestInfo")
                if request_info.get("upsell"):
                    summary += f" Upsell: {str({'name': request_info['upsell']['option'], 'price': request_info['upsell']['price']})}"
        return summary

    @classmethod
    def get_tutor_info(cls, model_instance: BaseRequestTutor):
        if model_instance.is_batched:
            info = model_instance.request_info.get("admin_info")
            if info:
                if info.get("summary", {}):
                    return info["summary"]["tutors"]

    @classmethod
    def get_start_date(cls, model_instance: BaseRequestTutor):
        if model_instance.is_batched:
            info = model_instance.request_info.get("admin_info")
            if info:
                return info["summary"]["start_date"]

    @classmethod
    def get_request_sheet(cls, course_id, class_selected):
        pass

    @classmethod
    def email_data_from_request(cls, request: BaseRequestTutor):
        skill = request.request_subjects[0]
        request_info = request.request_info
        tutor = request_info["admin_info"]["summary"].get("tutors")
        raw_data = GoogleSheetHelper.get_course(request_info["classInfo"]["courseID"])
        curriculum_link = raw_data["data"]["learningAids"]["lessonPlan"]
        summary = request_info["admin_info"]["summary"]
        students = [
            {
                "email": request.email,
                "phone": str(request.number),
                "lastName": request.last_name,
                "firstName": request.first_name,
            }
        ]
        if request_info["admin_info"].get("students"):
            students.extend(request_info["admin_info"]["students"])
        context = [
            (
                {
                    "skill": skill,
                    "lesson_plan": request_info["requestInfo"].get("venue"),
                    "schedule": {
                        "summary": summary["name"],
                        "duration": "",
                        "start_date": summary["start_date"],
                        "date_summary": f"{summary['start_date']} - {summary['end_date']}",
                    },
                    "no_of_student": request.no_of_students,
                    "client": {
                        "full_name": f"{x['firstName']} {x['lastName']}",
                        "phone_no": x["phone"],
                    },
                    "venue": request_info["admin_info"]["summary"]["venue"] or "Online",
                    "tutor": {"name": f"{tutor}", "phone_no": ""},
                    "curriculum_link": curriculum_link,
                },
                x["email"],
            )
            for x in students
        ]
        return context


async def loop_helper(callback):
    loop = asyncio.get_event_loop()
    future = loop.run_in_executor(None, callback)
    return await future


class GoogleSheetHelper:
    COURSE_API = "http://sheet.tuteria.com:8020"
    COURSE_SHEET_API = "https://docs.google.com/spreadsheets/d/1Tnz8AP0cJjZO4JPCln2nyP3r7F3lIhM7fr8VrJ3ZLQo/edit?usp=sharing"

    @classmethod
    def fetch_sheet(cls, sheet):
        response = requests.post(
            f"{cls.COURSE_API}/read-single",
            json={"link": cls.COURSE_SHEET_API, "sheet": sheet},
        )
        if response.status_code < 400:
            return response.json()

    @classmethod
    def get_all_courses(cls):
        response = cls.fetch_sheet("Courses")
        if response and response.get("status"):
            data = [
                {"courseID": x["courseID"], "data": json.loads(x["data"])}
                for x in response["data"]
            ]
            return data
        return []

    @classmethod
    def get_classes(cls, courseID: str):
        response = cls.fetch_sheet("Classes")
        if response and response.get("status"):

            def parse(d):
                return json.loads(d["data"])

            return [
                parse(x)
                for x in response["data"]
                if x["courseID"].lower() == courseID.lower()
            ]
        return []

    @classmethod
    def get_course(cls, course_id):
        async def get_course_async(courseID):
            results = await asyncio.gather(
                loop_helper(lambda: cls.get_all_courses()),
                loop_helper(lambda: cls.get_classes(courseID)),
            )
            course = [
                x for x in results[0] if x["courseID"].lower() == courseID.lower()
            ]
            if course:
                course = course[0]
                course["classes"] = results[1]
                return course
            return {}

        loop = asyncio.new_event_loop()
        result = loop.run_until_complete(get_course_async(course_id))
        return result

    @classmethod
    def get_summary_info(cls, course_id, class_id):
        course_info = cls.get_course(course_id)
        if course_info:
            class_instance = [
                x
                for x in course_info.get("classes") or []
                if x["classID"].lower() == class_id.lower()
            ]
            upsell_info = []
            if course_info["data"].get("upsell"):
                _upsell = course_info["data"]["upsell"]
                upsell_info = [
                    {"name": x["option"], "price": x["price"]}
                    for x in _upsell["registration"]
                ]
            summary_info = {}
            if class_instance:
                class_instance = class_instance[0]
                start_date = class_instance["startDate"]
                end_date = class_instance["endDate"]
                is_online = bool(class_instance.get("online"))
                tutors = ",".join([x["name"] for x in class_instance["tutors"]])
                venue = None
                if not is_online:
                    venue = class_instance["offline"]["venue"]["region"]
                summary_info = {
                    "name": class_instance["name"],
                    "lesson_price": class_instance["price"],
                    "start_date": start_date,
                    "end_date": end_date,
                    "is_online": is_online,
                    "venue": venue,
                    "tutors": tutors,
                }
            return {"summary": summary_info, "upsell_info": upsell_info}
