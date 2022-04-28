from __future__ import absolute_import, division, print_function
from builtins import (
    super,
    # zip, round, input, int, pow, object)bytes, str, open, ,
    # range,
)
import datetime
import re
import pdb
from operator import or_
from functools import reduce
from dateutil.relativedelta import relativedelta
from django.db import models

from django.db.models import IntegerField, When, Case, Sum, Count
from django.db.models.expressions import RawSQL
from django.db.models.functions import Length, Lower
from django.contrib.postgres.search import SearchVector
from ..mixins import TutorProfileMixin
from ..related_subjects import get_related_subjects

ADDRESS = 1


class SumSubquery(models.Subquery):
    template = "(SELECT SUM(%(sum_field)s) FROM (%(subquery)s) _sum)"
    output_field = models.DecimalField()

    def __init__(self, queryset, output_field=None, *, sum_field, **extra):
        extra["sum_field"] = sum_field
        super(SumSubquery, self).__init__(queryset, output_field, **extra)


class UserProfileActionsQuerySet(models.QuerySet):
    def statistics_admin(self):
        from wallet.models import WalletTransaction
        from skills.models import TutorSkill
        from bookings.models import Booking, BookingSession

        amount_earned = (
            WalletTransaction.objects.filter(
                wallet__owner_id=models.OuterRef("user_id")
            )
            .tutor_earning()
            .values("amount")
        )
        tutor_booking = (
            Booking.objects.filter(tutor_id=models.OuterRef("user_id"))
            .order_by("created")
            .values("order", "created")
        )
        no_of_hours = BookingSession.objects.filter(
            booking__tutor_id=models.OuterRef("user_id")
        ).values("no_of_hours")
        skillz = TutorSkill.objects.filter(tutor_id=models.OuterRef("user_id"))
        active = skillz.filter(status=TutorSkill.ACTIVE).values("id")
        pending = skillz.filter(status=TutorSkill.PENDING).values("id")
        modification = skillz.filter(status=TutorSkill.MODIFICATION).values("id")
        denied = skillz.filter(status=TutorSkill.DENIED).values("id")
        return (
            self.annotate(
                no_of_bookings=CountSubquery(tutor_booking, sum_field="*")
                # no_of_bookings=models.Count("user__t_bookings", distinct=True)
            )
            .annotate(
                no_of_hours=SumSubquery(no_of_hours, sum_field="no_of_hours")
                # no_of_hours=models.Sum("user__t_bookings__bookingsession__no_of_hours")
            )
            .annotate(amount_made=SumSubquery(amount_earned, sum_field="amount"))
            .annotate(active=CountSubquery(active, sum_field="*"))
            .annotate(pending=CountSubquery(pending, sum_field="*"))
            .annotate(modification=CountSubquery(modification, sum_field="*"))
            .annotate(denied=CountSubquery(denied, sum_field="*"))
            .annotate(
                first_job_date=models.Subquery(
                    tutor_booking.values("first_session")[:1]
                )
            )
            .annotate(
                job_this_month=models.Subquery(
                    tutor_booking.order_by("-created").values("created")[:1],
                    output_field=models.DateTimeField(),
                )
            )
            # .prefetch_related("user__tutorskill_set")
        )

    def mark_id_as_rejected(self):
        import cloudinary
        from users.models import UserIdentification

        public_ids = [
            x.user.identity.identity.public_id for x in self.all() if x.user.identity
        ]
        users = [x.user for x in self.all()]
        if len(public_ids) > 0:
            cloudinary.api.delete_resources(public_ids)
        UserIdentification.objects.filter(user__in=users).delete()

    def mark_id_as_verified(self):
        import cloudinary
        from rewards.models import Milestone
        from users.models import UserIdentification, User, UserMilestone

        public_ids = [
            x.user.identity.identity.public_id for x in self.all() if x.user.identity
        ]
        if len(public_ids) > 0:
            cloudinary.api.delete_resources(public_ids)

        users = [x.user for x in self.all()]
        ids = [x.id for x in users]
        UserIdentification.objects.filter(user__in=users).update(verified=True)
        User.objects.filter(id__in=ids).update(submitted_verification=True)
        reward2 = Milestone.get_milestone(Milestone.VERIFIED_ID)
        for user in users:
            if user.tuteria_verified:
                UserMilestone.objects.get_or_create(user=user, milestone=reward2)

    def mark_user_profile_as_rejected(self, delay=True):
        from users.tasks import re_upload_profile_pic
        from users.models import UserProfile
        import cloudinary

        user_ids = [x.user_id for x in self.all()]
        profiles = UserProfile.objects.filter(user_id__in=user_ids)
        public_ids = [x.image.public_id for x in profiles.all()]
        cloudinary.api.delete_resources(public_ids)
        profiles.update(image=None, image_approved=False)
        for x in user_ids:
            if delay:
                re_upload_profile_pic.delay(x)
            else:
                re_upload_profile_pic(x)
        print("send user_profile_pic_rejected")

    def notify_tutor_about_curriculum(self, delay=True):
        from registration.tasks import notify_tutor_to_update_curriculum

        for profile in self.all():
            user = profile.user
            if delay:
                notify_tutor_to_update_curriculum.delay(user.first_name, user.email)
            else:
                notify_tutor_to_update_curriculum(user.first_name, user.email)

    def verify_email_notification(self, delay=True):
        from users import tasks

        qq = [x.user_id for x in self.all()]
        if delay:
            tasks.verify_email_notification.delay(qq)
        else:
            tasks.verify_email_notification(qq)
        print("send verify_email_notification")

    def send_mail_to_verify_id(self, delay=True):
        from registration.tasks import verify_id_to_new_tutors

        for x in self.all():
            if delay:
                verify_id_to_new_tutors.delay(x.user_id)
            else:
                verify_id_to_new_tutors(x.user_id)
            print("send verify_id_to_new_tutors")

    # def tutor_statistics(self, request, queryset):
    #     state = request.GET.get('state')
    # return HttpResponseRedirect(reverse('users:tutor-stats', args=[state]))

    def send_mail_to_reupload_profile_picture(self, delay=True):
        from registration.tasks import verify_id_to_new_tutors

        for x in self.all():
            if delay:
                verify_id_to_new_tutors.delay(x.user_id, False)
            else:
                verify_id_to_new_tutors(x.user_id, False)

    def approve_email(self):
        user = self.first().user
        user.emailaddress_set.update(verified=True)

    def approve_tutor(self, verified):
        from external.models import Agent
        from users.models import TutorApplicant

        if verified:
            TutorApplicant.mark_as_verified_bulk(self.all())
        else:
            TutorApplicant.mark_as_verified_bulk(self.all(), status=False)


class TutorUserManagerQuerySet(UserProfileActionsQuerySet):
    def been_verified(self):
        return self.filter(user__identifications__verified=True)

    def by_current_step(self, current_step):
        return self.filter(data_dump__tutor_update__appData__currentStep=current_step)


class UserMilestoneQuerySet(models.QuerySet):
    def has_milestone(self, milestone):
        return self.filter(milestone=milestone).exists()


def related_subjects(subj):
    value = [get_related_subjects(x) for x in subj]
    return [item for sublist in value for item in sublist]


class AvgSubquery(models.Subquery):
    template = "(SELECT AVG(%(sum_field)s) FROM (%(subquery)s) _avg)"
    output_field = models.DecimalField()

    def __init__(self, queryset, output_field=None, *, sum_field, **extra):
        extra["sum_field"] = sum_field
        super(AvgSubquery, self).__init__(queryset, output_field, **extra)


class CountSubquery(models.Subquery):
    template = "(SELECT COUNT(%(sum_field)s) FROM (%(subquery)s) _count)"
    output_field = models.IntegerField()

    def __init__(self, queryset, output_field=None, *, sum_field, **extra):
        extra["sum_field"] = sum_field
        super(CountSubquery, self).__init__(queryset, output_field, **extra)


class CustomUserQuerySet(models.QuerySet):
    def customers(self, year=None, _from=None, to=None):
        from bookings.models import Booking, BookingSession

        tutor_booking = (
            Booking.objects.filter(user_id=models.OuterRef("id"))
            .order_by("created")
            .values("order", "created")
        )
        booking_session = (
            BookingSession.objects.filter(booking__user_id=models.OuterRef("id"))
            .order_by("booking__created")
            .values("price")
        )
        if year:
            tutor_booking = tutor_booking.filter(created__year=year)
            booking_session = booking_session.filter(booking__created__year=year)
        if _from and to:
            ff = datetime.datetime.strptime(_from, "%Y-%m-%d")
            tt = datetime.datetime.strptime(to, "%Y-%m-%d")
            tutor_booking = tutor_booking.filter(created__range=[_from, to])
            booking_session = booking_session.filter(
                booking__created__range=[_from, to]
            )
        return (
            self.annotate(od=CountSubquery(tutor_booking, sum_field="'order'"))
            .filter(od__gte=1)
            .annotate(
                session_total_amount=SumSubquery(booking_session, sum_field="price")
            )
            .annotate(
                first_booking_date=models.Subquery(tutor_booking.values("created")[:1])
            )
            .annotate(
                last_booking_date=models.Subquery(
                    tutor_booking.order_by("-created").values("created")[:1]
                )
            )
            .exclude(email="admin@wallet.com")
        )

    def new_search(self):
        from bookings.models import Booking, BookingSession
        from reviews.models import SkillReview
        from skills.models import TutorSkill

        skill_reviews = SkillReview.objects.filter(
            tutor_skill__tutor_id=models.OuterRef("id"), review_type=1
        ).values("score", "id")
        session_subquery = BookingSession.objects.filter(
            booking__tutor_id=models.OuterRef("id"), status=BookingSession.COMPLETED
        ).values("id")
        no_of_students = (
            Booking.objects.exclude(
                models.Q(status=Booking.CANCELLED)
                | models.Q(status=Booking.INITIALIZED)
            )
            .filter(tutor_id=models.OuterRef("id"))
            .order_by("user_id")
            .distinct("user_id")
            .values("user_id")
        )
        bare_skill_review_sql = (
            # lambda o: f'SELECT {o}) as "skill_rating" FROM "reviews_skillreview" U0 INNER JOIN "skills_tutorskill" U1 ON (U0."tutor_skill_id" = U1."id") WHERE (U1."tutor_id" = ("auth_user"."id") AND U0."review_type" = 1)'
            lambda o: f'SELECT {o}) as "skill_rating" FROM "reviews_skillreview" U0 LEFT OUTER JOIN "skills_tutorskill" U1 ON (U0."tutor_skill_id" = U1."id") WHERE (U1."tutor_id" = ("auth_user"."id") AND U0."review_type" = 1)'
        )
        skill_review_sql = bare_skill_review_sql('AVG(U0."score"')
        rating_count_sql = bare_skill_review_sql('COUNT(U0."id"')
        # rating_count_sql = bare_skill_review_sql("COUNT(DISTINCT ")
        lessons_taught_sql = f'SELECT COUNT(DISTINCT U0."id") as "lessonsTaught" FROM "bookings_bookingsession" U0 INNER JOIN "bookings_booking" U1 ON (U0."booking_id" = U1."order") WHERE (U1."tutor_id" = ("auth_user"."id") AND NOT ("bookings_bookingsession"."status" = 1) AND NOT ("bookings_bookingsession"."status" = 5))'

        return (
            self.prefetch_related(
                models.Prefetch(
                    "t_bookings",
                    queryset=Booking.objects.prefetch_related("bookingsession_set")
                    .filter(status=Booking.SCHEDULED)
                    .order_by("user_id")
                    .distinct("user_id"),
                    to_attr="unique_bookings",
                )
            )
            .prefetch_related(
                models.Prefetch(
                    "tutorskill_set",
                    queryset=TutorSkill.objects.select_related("skill")
                    .exclude(status=TutorSkill.DENIED)
                    .all(),
                    to_attr="user_skills",
                )
            )
            # .prefetch_related(
            #     (
            #         models.Prefetch(
            #             "t_bookings",
            #             queryset=Booking.objects.exclude(
            #                 models.Q(status=Booking.CANCELLED)
            #                 | models.Q(status=Booking.INITIALIZED)
            #             )
            #             .order_by("user_id")
            #             .distinct("user_id"),
            #             to_attr="student_arr",
            #         )
            #     )
            # )
            # .annotate(
            #     students=RawSQL(
            #         'SELECT COUNT(DISTINCT "u0"."user_id") AS "unique_client" FROM "bookings_booking" U0 WHERE U0."tutor_id" = ("auth_user"."id")',
            #         (),
            #         4,
            #     )
            # )
            # .annotate(lessonsTaught=RawSQL(lessons_taught_sql, ()))
            # .annotate(rating=RawSQL(skill_review_sql, ()))
            # .annotate(rating_count=RawSQL(rating_count_sql, ()))
            .annotate(student_arr=CountSubquery(no_of_students, sum_field="user_id"))
            .annotate(rating=AvgSubquery(skill_reviews, sum_field="score"))
            .annotate(rating_count=CountSubquery(skill_reviews, sum_field="id"))
            .annotate(lessonsTaught=CountSubquery(session_subquery, sum_field="id"))
            # .annotate(lessonsTaught=Count("t_bookings__bookingsession"))
            .response_annotation(datetime.datetime.now() - relativedelta(months=4))
            .all()
        )

    def by_current_step(self, current_step, is_array=False):
        if is_array:
            return self.filter(
                data_dump__tutor_update__appData__currentStep__in=current_step
            )
        return self.filter(data_dump__tutor_update__appData__currentStep=current_step)

    def get_new_applicants(self):
        from skills.models import TutorSkill

        return self.filter(
            data_dump__tutor_update__appData__isnull=False
        ).prefetch_related(
            models.Prefetch(
                "tutorskill_set",
                queryset=TutorSkill.objects.select_related("skill").all(),
                to_attr="user_skills",
            )
        )

    def response_annotation(self, date: datetime.datetime):
        denied_responses = f'SELECT COUNT(DISTINCT U0."id") as "requestsDeclined" FROM "connect_tutor_tutorjobresponse" U0  WHERE (U0."created" > %s) AND (U0."status"= 3) AND ("auth_user"."id" = U0."tutor_id")'
        accepted_responses = f'SELECT COUNT(DISTINCT U0."id") as "totalJobsAccepted" FROM "connect_tutor_tutorjobresponse" U0  WHERE (U0."created" > %s)  AND (U0."status"= 2) AND ("auth_user"."id" = U0."tutor_id")'
        not_responsed = f'SELECT COUNT(DISTINCT U0."id") as "requestsNotResponded" FROM "connect_tutor_tutorjobresponse" U0  WHERE (U0."created" > %s) AND (U0."status" = 4) AND ("auth_user"."id" = U0."tutor_id")'
        total_responses = f'SELECT COUNT(DISTINCT U0."id") as "totalJobsAssigned" FROM "connect_tutor_tutorjobresponse" U0  WHERE (U0."created" > %s) AND ("auth_user"."id" = U0."tutor_id")'
        # request_pending = f'SELECT COUNT(DISTINCT U0."slug") as "pending_r" FROM "external_baserequesttutor" U0  WHERE (U0."tutor_id" = ("auth_user"."id")) AND (NOT (U0."tutor_id" IS NULL) AND ((U0."status" = 4) OR (U0."status" = 5)))'
        request_pending = f'SELECT COUNT(DISTINCT U0."id") as "requestsDeclined" FROM "connect_tutor_tutorjobresponse" U0  WHERE (U0."created" > %s) AND (U0."status"= 1) AND ("auth_user"."id" = U0."tutor_id")'
        return (
            self.annotate(
                requestsDeclined=RawSQL(denied_responses, (date.isoformat(),))
            )
            .annotate(pending_to_be_booked=RawSQL(request_pending, (date.isoformat(),)))
            .annotate(totalJobsAccepted=RawSQL(accepted_responses, (date.isoformat(),)))
            .annotate(requestsNotResponded=RawSQL(not_responsed, (date.isoformat(),)))
            .annotate(totalJobsAssigned=RawSQL(total_responses, (date.isoformat(),)))
        )

    def profil_ids(self):
        from users.models import UserProfile

        _list = list(self.values_list("pk", flat=True))
        return UserProfile.objects.filter(user_id__in=_list)

    def mark_id_as_rejected(self):
        return self.profil_ids().mark_id_as_rejected()

    def mark_id_as_verified(self):
        return self.profil_ids().mark_id_as_verified()

    def mark_user_profile_as_rejected(self, **kwargs):
        return self.profil_ids().mark_user_profile_as_rejected(**kwargs)

    def verify_email_notification(self, **kwargs):
        return self.profil_ids().verify_email_notification(**kwargs)

    def send_email_to_verify_id(self, **kwargs):
        return self.profil_ids().send_email_to_verify_id(**kwargs)

    def send_mail_to_reupload_profile_picture(self, **kwargs):
        return self.profil_ids().send_mail_to_reupload_profile_picture(**kwargs)

    def approve_email(self):
        return self.profil_ids().approve_email()

    def approve_tutor(self, verified):
        return self.profil_ids().approve_tutor(verified)

    def first_booking(self):
        return self.annotate(num_orders=models.Count("orders")).filter(num_orders=1)

    def first_5_verified_skills(self):
        return (
            self.filter(tutorskill__status=2)
            .annotate(num_skills=models.Count("tutorskill"))
            .filter(num_skills__gte=5)
        )

    def with_locations(self):
        return (
            self.annotate(loc=models.Count("location"))
            .filter(loc__gt=0)
            .verified_tutors()
        )

    def verified_tutors(self):
        return self.filter(profile__application_status=TutorProfileMixin.VERIFIED)

    def new_skill_search(self, req_skills):
        o = self.skill_search(req_skills)
        return self.filter(id__in=list(set(o)))

    def in_the_same_vicinity2(self, sku, state, gender=None):
        if len(sku) == 1:
            req_skills = sku
        else:
            req_skills = sku
        return self.shared_code(req_skills, state, gender)

    def identity_verified(self):
        return (
            self.exclude(profile__image="")
            .exclude(profile__image=None)
            .exclude(socialaccount__uid=None)
            .exclude(socialaccount__uid="")
        )

    def shared_code(self, req_skills, state, gender):
        query = self.verified_tutors()  # all verified tutors
        if gender:
            query = query.filter(profile__gender=gender)  # gender of tutors
        query = query.filter(identifications__verified=True).identity_verified()
        tutors_with_skill = self.skill_search(req_skills)
        # tutors_without_skill = set(self.education_search(req_skills)).union(
        #     self.work_experience_search(req_skills)).union(
        #         self.profile_search(req_skills)).intersection(
        #             self.tutors_with_no_subjects())
        # final_query = set(tutors_with_skill).union(tutors_without_skill)
        final_query = set(tutors_with_skill)
        return (
            query.filter(id__in=list(final_query))
            .exclude(profile__blacklist=True)
            .distinct("id")
        )

    def in_the_same_vicinity(self, sku, state, gender=None):
        if len(sku) == 1:
            req_skills = related_subjects(sku)
        else:
            req_skills = sku
        return self.shared_code(req_skills, state, gender)

    def education_search(self, req_skills):
        from registration.models import Education

        education_search = [
            models.Q(course__iregex=r"\y{0}\y".format(re.escape(x.strip())))
            for x in req_skills
        ]
        return Education.objects.filter(reduce(or_, education_search)).values_list(
            "tutor", flat=True
        )

    def work_experience_search(self, req_skills):
        from registration.models import WorkExperience

        work_experience_name_search = [
            models.Q(name__iregex=r"\y{0}\y".format(re.escape(x.strip())))
            for x in req_skills
        ]
        work_experience_role_search = [
            models.Q(role__iregex=r"\y{0}\y".format(re.escape(x.strip())))
            for x in req_skills
        ]
        we_search = work_experience_name_search + work_experience_role_search
        return WorkExperience.objects.filter(reduce(or_, we_search)).values_list(
            "tutor", flat=True
        )

    def profile_search(self, req_skills):
        """
        Searches around description tutors gives and checks if the subjects exists there
        considers both the about_description and the tutor_description
        """
        about_description = [
            models.Q(
                profile__description__iregex=r"\y{0}\y".format(re.escape(x.strip()))
            )
            for x in req_skills
        ]
        tutor_description = [
            models.Q(
                profile__tutor_description__iregex=r"\y{0}\y".format(
                    re.escape(x.strip())
                )
            )
            for x in req_skills
        ]
        p_search = about_description + tutor_description
        return self.filter(reduce(or_, p_search)).values_list("id", flat=True)

    def skill_search(self, req_skills, active=False):
        from skills.models import TutorSkill

        # skill_names = ",".join(req_skills)
        # result = TutorSkill.objects.annotate(
        #     search=SearchVector("skill__name", "description")
        # ).filter(search=skill_names)
        # import pdb ; pdb.set_trace()
        skill_search = [
            models.Q(skill__name__iregex=r"\y{0}\y".format(re.escape(x.strip())))
            for x in req_skills
        ]
        # skill_search = [
        #     models.Q()
        # ]
        ts_description = [
            # models.Q(
            #     description__iregex=r"\y{0}\y".format(re.escape(x.strip())))
            # for x in req_skills
        ]
        heading_search = [
            # models.Q(heading__iregex=r"\y{0}\y".format(re.escape(x.strip())))
            # for x in req_skills
        ]
        s_search = skill_search + ts_description + heading_search
        queryset = (
            TutorSkill.objects.filter(reduce(or_, s_search))
            .exclude(status=TutorSkill.DENIED)
            .filter(status=TutorSkill.ACTIVE)
        )
        # if active:
        #     return queryset.
        return queryset.values_list("tutor_id", flat=True)

    def tutors_with_no_subjects(self):
        from users.models import User

        return (
            User.objects.annotate(s_count=models.Count("tutorskill"))
            .filter(s_count=0)
            .values_list("id", flat=True)
        )

    def t_with_no_subjects(self):
        """Actual queryset to get tutors with no subjects"""
        return (
            self.filter(profile__application_status=TutorProfileMixin.VERIFIED)
            .annotate(s_count=models.Count("tutorskill"))
            .filter(s_count=0)
        )

    def stuck_potential_tutors(self):
        return (
            self.filter(tutor_intent=True)
            .exclude(profile__application_status=TutorProfileMixin.VERIFIED)
            .exclude(profile__application_status=TutorProfileMixin.DENIED)
            .filter(drip_counter__lt=4)
        )

    # def teaches_skill(self)

    def teaches_skill(self, sku, state, gender):
        if len(sku) == 1:
            req_skills = related_subjects(sku)
        else:
            req_skills = sku
        education_search = [
            models.Q(education__course__iregex=r"\y{0}\y".format(re.escape(x.strip())))
            for x in req_skills
        ]
        work_experience_name_search = [
            models.Q(
                workexperience__name__iregex=r"\y{0}\y".format(re.escape(x.strip()))
            )
            for x in req_skills
        ]
        work_experience_role_search = [
            models.Q(
                workexperience__role__iregex=r"\y{0}\y".format(re.escape(x.strip()))
            )
            for x in req_skills
        ]
        skill_search = [
            models.Q(
                tutorskill__skill__name__iregex=r"\y{0}\y".format(re.escape(x.strip()))
            )
            for x in req_skills
        ]
        ts_description = [
            models.Q(
                tutorskill__description__iregex=r"\y{0}\y".format(re.escape(x.strip()))
            )
            for x in req_skills
        ]
        about_description = [
            models.Q(
                profile__description__iregex=r"\y{0}\y".format(re.escape(x.strip()))
            )
            for x in req_skills
        ]
        tutor_description = [
            models.Q(
                profile__tutor_description__iregex=r"\y{0}\y".format(
                    re.escape(x.strip())
                )
            )
            for x in req_skills
        ]
        state_search = models.Q(location__state=state)
        is_tutor_search = models.Q(
            profile__application_status=TutorProfileMixin.VERIFIED
        )

        or_request = (
            education_search
            + work_experience_name_search
            + work_experience_role_search
            + skill_search
            + ts_description
            + about_description
            + tutor_description
        )

        # or_request = skill_search
        # pdb.set_trace()
        # exclude_search = [models.Q(tutorskill__skill__name__iregex=r"\y{0}\y".format(re.escape(x.strip())), tutorskill__status=4)
        #                   for x in req_skills]

        qurey = self.filter(
            reduce(or_, or_request) & state_search & is_tutor_search
        ).exclude(profile__blacklist=True)

        if gender:
            return qurey.filter(profile__gender=gender).distinct("pk")

        return qurey.distinct("pk")

    def tutors_in_level(self, level):
        return self.verified_tutors().filter(profile__level=level)

    def users_with_bookings(self):
        return self.annotate(bk=models.Count("t_bookings")).filter(bk__gte=1)

    def total_earned(self):
        from wallet.models import WalletTransactionType, WalletTransaction

        categories = ["earned"]
        annotations = {}

        for category in categories:
            annotation_name = "total_{}".format(category)
            case = Case(
                When(
                    wallet__transactions__type=WalletTransactionType.EARNING,
                    then=models.F("wallet__transactions__amount"),
                ),
                default=0,
                output_field=models.DecimalField(),
            )
            annotations[annotation_name] = Sum(case)
        return self.annotate(**annotations)

    def users_who_booked_classes(self):
        return self.annotate(od=models.Count("orders", distinct=True)).filter(od__gte=1)

    def potiential_customers(self):
        from external.models import BaseRequestTutor

        xx = BaseRequestTutor.objects.users_who_placed_completed().values_list(
            "user_id", flat=True
        )
        xx = list(set(xx))
        return self.filter(id__in=xx)

    def premium_tutor_qualification(self, hours=500):
        from users.models import User

        return (
            self.filter(profile__application_status=3)
            .filter(t_bookings__bookingsession__status=3)
            .annotate(hours=Sum("t_bookings__bookingsession__no_of_hours"))
            .filter(hours__gt=hours)
        )

    def has_active_subjects(self):
        return self.annotate(
            active_skills=Sum(
                Case(When(tutorskill__status=2, then=1), output_field=IntegerField())
            )
        ).filter(active_skills__gt=0)

    def has_active_subjects22(self):
        return self.annotate(
            ac_skills=Sum(
                Case(When(tutorskill__status=2, then=1), output_field=IntegerField())
            )
        ).filter(ac_skills__gt=0)

    def annotate_active_skill(self):
        from skills.models import TutorSkill

        return (
            self.annotate(
                active_skill=models.Sum(
                    models.Case(
                        models.When(tutorskill__status=TutorSkill.ACTIVE, then=1),
                        default=models.Value(0),
                        output_field=models.IntegerField(),
                    )
                )
            )
            .with_online_requests()
            .prefetch_related(
                models.Prefetch(
                    "tutorskill_set",
                    queryset=TutorSkill.objects.select_related("skill").active(),
                    to_attr="ac",
                )
            )
        )

    def with_online_requests(self, request_type=3):
        return self.annotate(
            online_requests=models.Sum(
                models.Case(
                    models.When(
                        t_bookings__baserequesttutor__request_type=request_type, then=1
                    ),
                    default=0,
                    output_field=models.IntegerField(),
                )
            )
        )

    def get_duplicate_users(self):
        from django.db.models.functions import Lower

        return (
            self.annotate(email_lower=Lower("email"))
            .values("email_lower")
            .annotate(email_count=Count("email_lower"))
            .filter(email_count__gt=1)
        )


class LocationQuerySet(models.QuerySet):
    def home_address(self):
        return self.first()

    def without_distances(self):
        """Only tutors distances would be calculated."""
        return self.filter(user__profile__application_status=3).filter(distances="{}")

    def with_active_skills(self):
        return self.annotate(
            active_skills=Sum(
                Case(
                    When(user__tutorskill__status=2, then=1),
                    output_field=IntegerField(),
                )
            )
        ).filter(active_skills__gt=0)

    def get_vicinities(self, search_input, state):
        queryset = (
            self.annotate(vicinity_len=Length("vicinity"), vicinity1=Lower("vicinity"))
            .filter(vicinity__icontains=search_input, state__istartswith=state)
            .exclude(vicinity_len__gt=15)
            .distinct("vicinity1")
            .values("vicinity1")
        )
        return queryset

    # def nearby_locations(self, latitude, longitude, radius, use_miles=False):
    #     if use_miles:
    #         distance_unit = 3959
    #     else:
    #         distance_unit = 6371

    #     cursor = connection.cursor()

    #     sql = """SELECT id, latitude, longitude FROM users_location WHERE (%f * acos( cos( radians(%f) ) * cos( radians( latitude ) ) *
    #         cos( radians( longitude ) - radians(%f) ) + sin( radians(%f) ) * sin( radians( latitude ) ) ) ) < %d
    #         """ % (distance_unit, latitude, longitude, latitude, int(radius))
    #     cursor.execute(sql)
    #     ids = [row[0] for row in cursor.fetchall()]

    # return
    # self.filter(id__in=ids).nearby_locations2(latitude,longitude,use_miles)

    def nearby_locations(self, latitude, longitude, radius, use_miles=False, new=False):
        if use_miles:
            distance_unit = 3959
        else:
            distance_unit = 6371
        if new:
            return self.annotate(
                distance=RawSQL(
                    "havesinecal(latitude,longitude,%s,%s)",
                    (latitude, longitude)
                    # 'distance': '(%f * acos( CAST(cos( radians(%f) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(%f) ) + sin( radians(%f) ) * sin( radians( latitude ) ) ) AS INTEGER) )' % (
                    #     distance_unit, latitude, longitude, latitude)
                )
            ).filter(distance__lt=radius)
        return self.extra(
            where=["havesinecal(latitude,longitude,%s,%s) < %s"],
            params=[latitude, longitude, int(radius)],
        )

    def nearby_locations2(self, latitude=None, longitude=None, use_miles=False):
        if use_miles:
            distance_unit = 3959
        else:
            distance_unit = 6371
        return self.extra(
            select={
                "distance": "havesinecal(latitude,longitude,%f,%f)"
                % (latitude, longitude)
                # 'distance': '(%f * acos( CAST(cos( radians(%f) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(%f) ) + sin( radians(%f) ) * sin( radians( latitude ) ) ) AS INTEGER) )' % (
                #     distance_unit, latitude, longitude, latitude)
            }
        )

    def nearby_locations3(self, latitude=None, longitude=None, use_miles=False):
        if use_miles:
            distance_unit = 3959
        else:
            distance_unit = 6371
        return self.annotate(
            distance=RawSQL(
                "havesinecal(latitude,longitude,%s,%s)",
                (latitude, longitude)
                # 'distance': '(%f * acos( CAST(cos( radians(%f) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(%f) ) + sin( radians(%f) ) * sin( radians( latitude ) ) ) AS INTEGER) )' % (
                #     distance_unit, latitude, longitude, latitude)
            )
        )

    def valid_coordinates(self):
        return (
            self.exclude(latitude=None, longitude=None)
            .exclude(latitude__gt=13)
            .exclude(latitude__lt=0)
            .exclude(longitude__gt=16)
            .exclude(longitude__lt=0)
        )

    def users_with_constituencies(self, region):
        """Returns the users whose location fall within the area passed.abs
        :params area: The area to filter the location queryset
        :params user_to_filter: further limit the result by including only users in the list"""
        from users.models import Constituency

        if region:
            regions = Constituency.objects.possible_regions(region)
            return self.filter(region_id__in=regions).values_list("user_id", flat=True)
        return []
