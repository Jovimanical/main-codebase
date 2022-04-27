import datetime
import logging
import pdb
import json
from skills.models.models1 import TutorSkill
from django.core.paginator import PageNotAnInteger
from django.core.paginator import Paginator, EmptyPage

from django.urls import reverse
from skills import api as skill_api
from skills import models as skill_models
from skills import forms as skill_forms
from skills import price_stats
from django_quiz.quiz import models as quiz_models
from config import const
from bookings import services as booking_service
from external import services as ext_service

from django.utils.functional import cached_property

logger = logging.getLogger(__name__)


def get_tutor_skill_based_on_status(user, requested_status="active"):

    status = dict(
        suspended=skill_models.TutorSkill.SUSPENDED,
        active=skill_models.TutorSkill.ACTIVE,
        denied=skill_models.TutorSkill.DENIED,
        pending=skill_models.TutorSkill.PENDING,
        modification=skill_models.TutorSkill.MODIFICATION,
    )
    return skill_models.TutorSkill.objects.filter(
        tutor=user, status=status[requested_status]
    )


def coroutine(func):
    def start(*args, **kwargs):
        cr = func(*args, **kwargs)
        cr.next()
        return cr

    return start


def construct_url(url):
    return "%s?filter_by=%s" % (reverse("users:tutor_subjects"), url)


class PaginatorObject(object):
    def paginate(self, number=10, page=None, _list=None):
        try:
            q = _list or self.get_list()
        except AttributeError:
            q = _list
        paginator = Paginator(q, number)
        try:
            result = paginator.page(page)
        except PageNotAnInteger:
            result = paginator.page(1)
        except EmptyPage:
            result = paginator.page(paginator.num_pages)
        return paginator, result


class TutorSkillService(object):
    def __init__(self, user_email):
        self.email = user_email
        self.tutorskills = (
            skill_models.TutorSkill.objects.filter(tutor__email__iexact=user_email)
            .exclude(status=TutorSkill.FREEZE)
            .prefetch_related("exhibitions", "skillcertificate_set")
        )

    def update_failed_quizzes(self):
        pending_subjects = self.tutorskills.filter(
            status=skill_models.TutorSkill.MODIFICATION
        )
        for i in pending_subjects:
            uu = SingleTutorSkillService(get=False, instance=i)

    def exists(self):
        return self.tutorskills.exists()

    def tutor_skill_status(self, key):
        options = {
            "all": lambda x: x.status is not None,
            "active": lambda x: x.status == x.ACTIVE,
            "denied": lambda x: x.status == x.DENIED,
            "pending": lambda x: x.status == x.PENDING,
            "modification": lambda x: x.status == x.MODIFICATION,
        }
        return list(filter(options[key], self.tutorskills.all()))

    def get_subject_view_skills(self, filter_by="all", page=1):
        url_type = ["all", "active", "pending", "modification", "denied"]
        mapping = {
            "all": "",
            "active": TutorSkill.ACTIVE,
            "pending": TutorSkill.PENDING,
            "modification": TutorSkill.MODIFICATION,
            "denied": TutorSkill.DENIED,
        }
        text = [
            "Subjects <br>in Total",
            "Active",
            "Pending<br>Approval",
            "Requires<br>Modification",
            "Denied",
        ]
        filter_text = ["All", "Active", "Pending Approval", "Modification", "Denied"]
        mobile_text = ["All.", "Act.", "PA.", "Mod.", "Den."]
        u = [
            dict(
                url=construct_url(o),
                url_text=text[k],
                filter_text=filter_text[k],
                mobile_text=mobile_text[k],
                count=len(self.tutor_skill_status(o)),
                text=o,
                status=mapping[o],
            )
            for k, o in enumerate(url_type)
        ]
        raw = self.tutor_skill_status(filter_by)
        page_object, subjects = PaginatorObject().paginate(_list=raw, page=page)
        return {
            "urls": list(u),
            "failed_skills": u[2]["count"] < 10,
            "subjects": subjects,
            "page_obj": subjects,
            "raw": raw,
        }

    def skill_count(self):
        return self.tutorskills.count()

    def active(
        self,
        profile_values=None,
        form_details=False,
        no_of_students=False,
        get_all=False,
    ):
        result = self.tutorskills.active()
        if profile_values:
            result = (
                result.values(
                    "slug",
                    "heading",
                    "description",
                    "skill__name",
                    "skill__categories__name",
                )
                .distinct("skill__name")
                .order_by("skill__name")
            )
        if form_details:
            result = result.form_details()
            if not get_all:

                result = result["subjects"]
        if no_of_students:
            result = result.no_of_students() + 1
        return result

    def form_params(self, subject_hours):
        """Used in public skill page"""

        options = dict(
            subject=self.active(form_details=True),
            no_of_hours=[("", "Select Hours")]
            + [(x, x) for x in range(1, subject_hours + 1)],
            no_of_students=[(x, x) for x in range(1, self.active(no_of_students=True))],
        )

        return options

    def other_active_subjects(self, ts_id):
        return self.active().exclude(pk=ts_id)

    def found_subjects(self, subjects):
        if subjects:
            return self.tutorskills.found_subjects(subjects)
        return self.tutorskills.not_denied()

    def delete_all(self):
        """Delete all tutorskills"""
        self.tutorskills.all().delete()

    def denied(self, **kwargs):
        inst = self.tutorskills.denied()
        if kwargs.get("count"):
            return inst.count()
        return inst

    def get_skill(self, *args, **kwargs):
        if len(args) > 0:
            skill_slug = args[0]
        elif "skill_slug" in kwargs:
            skill_slug = kwargs["skill_slug"]
        else:
            skill_slug = None
        if skill_slug:
            return SingleTutorSkillService(email=self.email, skill_slug=skill_slug)
        return SingleTutorSkillService.get_or_create(
            self.email,
            kwargs["quiz_url"],
            delete_sitting=kwargs.get("delete_sitting", False),
        )

    def update_skill(self, skill_slug, data):
        s = SingleTutorSkillService(email=self.email, skill_slug=skill_slug)
        s.save_skill(data)

    def with_exhibitions(self):
        return self.active().exclude(exhibitions__image=None)[:1]

    def create_tutor_skill_from_quiz(self, quiz_url, skill_instance=None):
        result, is_new = SingleTutorSkillService.get_or_create(
            email=self.email, quiz_url=quiz_url, skill_instance=skill_instance
        )
        return result, is_new

    def start_quiz(self, quiz_url=None, skill_instance=None):
        output = True
        result, _ = self.create_tutor_skill_from_quiz(
            quiz_url=quiz_url, skill_instance=skill_instance
        )
        if result.testable:
            _, is_new = result.create_sitting()
            if not is_new:
                output = False
        return output, result.testable

    @classmethod
    def get_non_academic(cls):
        return skill_api.CategorySerializer2(
            skill_models.Category.objects.filter(
                id__in=[15, 7, 8, 9, 11, 13, 12]
            ).prefetch_related("skill_set"),
            many=True,
        ).data

    @classmethod
    def get_sub_categories(cls):
        return skill_api.SubCategorySerializer(
            skill_models.SubCategory.objects.all()
            .order_by("id")
            .prefetch_related("skill_set"),
            many=True,
        ).data

    @classmethod
    def get_subject_categories(cls):
        a = cls.get_non_academic()
        b = cls.get_sub_categories()
        return b, a

    @classmethod
    def get_cached_category_json(cls, subjects, url_params=None, **kwargs):
        if url_params and subjects:
            return const.get_cached_category_json2(subjects)
        return const.get_cached_category_json()

    @classmethod
    def get_pricing_on_subject(cls, **kwargs):
        loc = kwargs.get("address")
        try:
            l = kwargs.get("latitude")
            m = kwargs.get("longitude")
            if l:
                lat = float(l)
                lon = float(m)
            else:
                lat = None
                lon = None
        except ValueError:
            lat = None
            lon = None
        state = kwargs.get("state")
        skill = kwargs.get("skill")
        ps = kwargs.get("p_skill").lower().split(",")
        query = dict(avg=0, min=0, max=0)
        logger.info(ps)
        is_parent_request = kwargs.get("parent_request", False)
        if is_parent_request == "true":
            query = skill_models.TutorSkill.objects.location_prices(
                ps=ps, location=loc, latitude=lat, longitude=lon, state=state
            )
        else:
            if skill:
                query = (
                    skill_models.TutorSkill.objects.active()
                    .filter(skill__name__istartswith=skill)
                    .by_distance(location=loc, latitude=lat, longitude=lon, state=state)
                    .values_list("price", flat=True)
                )
                if len(query) > 0:
                    v = price_stats.PriceStat(query)
                    query = dict(avg=v.mean(), max=v.median(), min=min(v.mode()))
                else:
                    query = dict(avg=0, min=0, max=0)
        return query

    @classmethod
    def update_prices_for_tutors(cls, ids, price):
        skill_models.TutorSkill.objects.filter(tutor_id__in=ids).update(price=price)


def get_tutor_id(email):
    from users.models import User

    return User.objects.get(email=email).pk


def update_ts_with_profile_details(email, ts):
    from users.services import UserService

    a = UserService(email)
    return a.update_new_tutor_skill(ts)


class SingleTutorSkillService(object):
    instance: skill_models.TutorSkill = None

    def __init__(self, email=None, get=True, **kwargs):
        self._get_skill(email=email, get=get, **kwargs)
        self.deny_instance(**kwargs)

    def _get_skill(self, *args, **kwargs):
        if kwargs["get"]:
            if "skill_name" in kwargs and "email" in kwargs:
                self.instance = skill_models.TutorSkill.objects.filter(
                    tutor__email=kwargs["email"],
                    skill__name__iexact=kwargs["skill_name"],
                ).first()
            elif kwargs["email"]:
                self.instance = skill_models.TutorSkill.objects.get(
                    tutor__email=kwargs["email"], skill__slug=kwargs["skill_slug"]
                )
            elif "skill_slug" in kwargs:
                self.instance = skill_models.TutorSkill.objects.get(
                    tutor__slug=kwargs["user_slug"], skill__slug=kwargs["skill_slug"]
                )
            elif "pk" in kwargs:
                self.instance = skill_models.TutorSkill.objects.filter(
                    pk=int(kwargs.get("pk"))
                ).first()
            else:
                self.instance = (
                    skill_models.TutorSkill.objects.filter(
                        tutor__slug=kwargs["user_slug"], slug=kwargs["slug"]
                    )
                    .with_ratings()
                    .with_reviews()
                    .first()
                )
        else:
            self.instance = kwargs["instance"]

    def save_skill(self, data):
        for key, val in data.items():
            if hasattr(self.instance, key):
                setattr(self.instance, key, val)
        self.instance.save()

    def save_tutorskill_from_form(self, request):
        form = skill_forms.TutorEditForm(request.POST, instance=self.instance)
        attachments = request.POST.getlist("attachment")
        certificate_form = skill_forms.CertificateFormset2(
            request.POST, instance=self.instance
        )
        if form.is_valid() and certificate_form.is_valid():
            form.save(attachments=attachments)
            for c_form in certificate_form.forms:
                c_form.save()
            self.save_skill({"status": skill_models.TutorSkill.PENDING})
            return self.get_absolute_url(), None, None
        return None, form, certificate_form

    def get_update_forms(self, context=None):
        data = {
            "form": skill_forms.TutorEditForm(instance=self.instance),
            "certificate_form": skill_forms.CertificateFormset2(instance=self.instance),
        }
        if "form" in context:
            data.pop("form")
        if "certificate_form" in context:
            data.pop("certificate_form")
        return data

    def get_absolute_url(self):
        return self.instance.get_absolute_url()

    @property
    def testable(self):
        if self.instance:
            return self.get_skill().testable
        return False

    def can_be_viewed(self, current_user):
        if not current_user.is_staff and not self.instance.tutor == current_user:
            if self.instance.status != skill_models.TutorSkill.ACTIVE:
                return True, self.instance.tutor.slug
        return False, self.instance.tutor.slug

    @cached_property
    def raw_json(self):
        serializer = skill_api.TutorPublicSkillSerializer(self.instance)
        return serializer.data

    @staticmethod
    def get_or_create(
        email,
        quiz_url,
        skill_instance=None,
        skill_slug=None,
        delete_sitting=False,
        status=skill_models.TutorSkill.DENIED,
    ):
        skill = skill_instance
        if skill:
            skill = SkillService(slug=skill.slug)
        if not skill:
            skill = SkillService.get_quiz_skill(quiz_url, skill_slug=skill_slug)
        tutor_id = get_tutor_id(email)
        result, is_new = skill_models.TutorSkill.objects.get_or_create(
            tutor_id=tutor_id, skill=skill.instance
        )
        if is_new:
            result.status = status
            result = update_ts_with_profile_details(email, result)
            result.save()
        val = SingleTutorSkillService(email=email, get=False, instance=result), is_new
        if delete_sitting:
            val[0].delete_failed_quiz_sittings()
        return val

    def get_skill(self):
        return self.instance.skill

    def get_quiz(self):
        if self.instance:
            return self.get_skill().quiz
        return

    def get_status(self):
        return self.instance.status

    def create_sitting(self):
        sitting = skill_models.QuizSitting.objects.filter(
            tutor_skill=self.instance
        ).first()
        is_new = False
        if not sitting:
            is_new = True
            sitting = skill_models.QuizSitting.objects.create(
                tutor_skill=self.instance,
                started=True,
                tutor_email=self.instance.tutor.email,
            )
        # sitting, is_new = skill_models\
        #     .QuizSitting.objects.get_or_create(
        #         tutor_skill=self.instance)
        # #
        # if is_new:
        #     sitting.started = True
        #     sitting.save()
        return sitting, is_new

    def quiz_started_and_passed(self):
        sitting = self.instance.sitting.first()
        started = False
        passed = True
        if sitting:
            started = sitting.started
        if self.testable:
            if sitting:
                # if not sitting:
                #     sitting,_ = self.create_sitting()
                passed = sitting.passed
        return started, passed

    def quiz_started(self):
        sitting = self.instance.sitting.first()
        if sitting:
            return sitting.started
        return False

    def passed_quiz(self):
        if self.testable:
            sitting = self.get_sittings()
            return sitting.passed
        return True

    def completed_quiz(self):
        if self.testable:
            sitting = self.instance.sitting.first()
            return sitting.completed
        return True

    def get_sittings(self, is_new=False):
        sitting = self.instance.sitting.first()
        new = False
        if not sitting:
            sitting, _ = self.create_sitting()
            new = True
        if is_new:
            return sitting, new

        return sitting

    def validate_sitting(self, score=0):
        sitting, is_new = self.get_sittings(True)
        # no need to check if an attempt was made
        if not is_new:
            sitting.completed = True
            sitting.score = score
        sitting.save()

    def get_reviews(self, page=None):
        reviews = self.instance.valid_reviews
        return PaginatorObject().paginate(3, _list=reviews, page=page)

    @cached_property
    def get_tutor_service(self):
        from users.services import TutorService

        return TutorService(self.instance.tutor.email)

    def validate_quiz(self, response):
        if self.testable:
            try:
                score = int(float(response.get("result", 0)))
            except ValueError:
                score = 0
            self.validate_sitting(score)
            passed = score >= self.passmark
            if passed:
                self.instance.status = skill_models.TutorSkill.MODIFICATION
            else:
                self.instance.status = skill_models.TutorSkill.DENIED
                # other actions that needs to happen.
                other_info = self.instance.other_info or {}
                other_info["dateDenied"] = datetime.datetime.now().isoformat()
                # total_attempts = other_info.get('totalAttempts') or 0
                # total_attempts += 1
                # other_info['totalAttempts'] = total_attempts
                self.instance.other_info = other_info
            self.instance.save()
            return passed
        return True

    def delete_failed_quiz_sittings(self):
        pass
        # if self.instance.status is not skill_models.TutorSkill.DENIED:
        #     if not self.passed_quiz() and not self.completed_quiz() and self.quiz_started():
        #         self.instance.sitting.all().delete()

    def sittings(self):
        return self.instance.sitting.all()

    def deny_instance(self, **kwargs):
        if self.instance:
            if self.instance.status is not skill_models.TutorSkill.ACTIVE:
                if self.testable:
                    started, passed = self.quiz_started_and_passed()
                    if started and not passed:
                        # if self.quiz_started() and not self.passed_quiz():
                        self.instance.status = skill_models.TutorSkill.DENIED
                        self.instance.save()
                    # skill_models.TutorSkill.objects.filter(pk=self.instance.pk).update(
                    #     status=skill_models.TutorSkill.DENIED
                    # )

    def validate_skill(self, status=None, price=None, discount=None, **kwargs):
        if not price or not discount:
            agent = skill_models.Agent.get_or_create_agent_with_required_details(
                kwargs.get("user"), agent_type=skill_models.Agent.TUTOR
            )
            options = {
                "active": skill_models.TutorSkill.ACTIVE,
                "modify": skill_models.TutorSkill.MODIFICATION,
                "deny": skill_models.TutorSkill.DENIED,
                "reject": skill_models.TutorSkill.MODIFICATION,
            }
        try:
            self.instance.status = options[status]
            self.instance.agent = agent
        except KeyError:
            pass
        if price:
            self.instance.price = int(price)
        if discount:
            self.instance.discount = int(discount)
        self.instance.save()
        if status == "deny_tutor":
            tutor = self.get_tutor_service
            tutor.deny_application(agent=agent)

        if status == "reject":
            tutor_service = self.get_tutor_service
            tutor_service.reject_image(agent=agent)
            skill_models.TutorSkill.update_queryset(
                tutor_service.user.tutorskill_set.all(),
                status=skill_models.TutorSkill.MODIFICATION,
                agent=agent,
            )

    @property
    def get_tutor_email(self):
        return self.instance.tutor.email

    @property
    def passmark(self):
        return self.get_quiz().pass_mark

    def get_review_count(self):
        return self.instance.review_count

    def get_other_subjects(self):
        return self.get_tutor_service.ts_service.other_active_subjects(self.instance.pk)

    def delete(self):
        options = [skill_models.TutorSkill.ACTIVE, skill_models.TutorSkill.DENIED]
        name = self.instance.skill.name
        if self.instance.status not in options:
            self.instance.delete()
        return name

    def admin_actions_on_request_post(self, request_pk=None, action=3):
        return ext_service.ExternalService.admin_actions_on_profile_page(
            self.instance, request_pk, action=action
        )

    def creating_booking_post(self, user, request_json):
        return booking_service.BookingService.create_booking(
            self.instance, user, request_json
        )

    def client_actions_on_request_post(self, request):
        return self.get_tutor_service.client_actions_on_request_post(
            request, subject=self.get_skill().name
        )

    def request_form(self, request, get_form=True):
        """Fetches request form with all initial parameters.
        Returns a dictionary of the form and if a new request
        instance was created."""
        tutor = self.get_tutor_service
        if not request.user.is_staff:
            return tutor.request_form(request, get_form, subject=self.get_skill().name)
        return {}


class SkillService(object):
    instance = None

    def __init__(self, slug=None):
        self.instance = skill_models.Skill.objects.filter(slug=slug).first()

    @staticmethod
    def get_quiz(url):
        return quiz_models.Quiz.objects.get(url=url)

    @staticmethod
    def get_quiz_skill(url, **kwargs):
        a = SkillService()
        if url:
            q = SkillService.get_quiz(url)
            a.instance = q.skill_set.first()
        else:
            a.instance = skill_models.Skill.objects.get(slug=kwargs.get("skill_slug"))
        return a

    def quiz(self):
        return self.instance.quiz

    def get_active_tutors(self):
        return self.instance.active_tutors

    def get_supported_states(self):
        from skills.models import SkillWithState

        w = SkillWithState.objects.filter(skill=self.instance).values_list(
            "state", flat=True
        )
        return list(w)

    @classmethod
    def cache_helper(cls, key, query_func):
        from django.core.cache import cache

        result = cache.get(key)
        if not result:
            result = query_func()
            cache.set(key, result, timeout=60 * 60 * 24)
        return result

    @classmethod
    def cached_skills(cls):
        key = "SKILL_WITH_IMAGES"
        return cls.cache_helper(
            key,
            lambda: skill_models.Skill.objects.all()
            .active_skill_with_background_image()
            .order_by("-active_skills"),
        )

    @classmethod
    def cached_categories(cls):
        key = "ALL_CATEGORIES"
        return cls.cache_helper(key, lambda: skill_models.Category.objects.all())

    @classmethod
    def cached_skill_search(cls, query):
        key = f"SKILL_{query}"
        return cls.cache_helper(key, lambda: cls.cached_skills().search(query))

    @classmethod
    def cached_category_search(cls, query, category):
        key = f"CATEGORY_SKILL_{category}"
        return cls.cache_helper(
            key, lambda: query.filter(categories__name__istartswith=category)
        )

    @classmethod
    def cached_skill_only(cls, skill_query):
        key = f"SKILL_{skill_query}"
        return cls.cache_helper(
            key,
            lambda: skill_models.Skill.objects.filter(
                name__istartswith=skill_query
            ).first(),
        )

    @classmethod
    def cached_skill_with_tutor_count(cls, skill_query, region):
        key = f"SKILL_WITH_TUTOR_COUNT_{skill_query}_{region}"

        def callback():
            skill = cls.cached_skill_only(skill_query)
            # skill = skill_models.Skill.objects.filter(
            #     name__istartswith=skill_query).first()
            tutor_count = (
                skill_models.TutorSkill.objects.active()
                .filter(tutor__location__state=region, skill=skill)
                .distinct("pk")
                .count()
            )
            return {"skill": skill, "tutor_count": tutor_count}

        return cls.cache_helper(key, callback)

    @classmethod
    def get_active_skills_with_background_images(
        self, query=None, category=None, region="Lagos", page=None, **kwargs
    ):
        query_result = self.cached_skills()
        if query:
            query_result = self.cached_skill_search(query)
        if category:
            query_result = self.cached_category_search(query_result, category)
        pagination, result = PaginatorObject().paginate(
            _list=query_result, page=page, number=9
        )
        return {
            "tutors": result,
            "paginator": pagination,
            "region": region or "Lagos",
            "search_query": query,
            "category_query": category,
            "categories": self.cached_categories(),
        }

    @classmethod
    def skills_with_tutor(cls, query=None):
        result = skill_models.Skill.objects.with_tutor_cached(query)
        return result

    @classmethod
    def populate_nigerian_subjects(cls):
        nigerian_category, _ = skill_models.Category.objects.get_or_create(
            name="Nigerian Languages"
        )
        skill_names = [
            "Igbo Language",
            "Hausa Language",
            "Yoruba Language",
            "Ibibio Language",
            "Kalabari Language",
            "Ijaw Language",
            "Efik Language",
            "Edo Language",
            "Fulani Language",
            "Kanuri Language",
            "Tiv Language",
            "Ebira Language",
            "Annang Language",
            "Igala Language",
            "Itsekiri Language",
            "Urhobo Language",
            "Nupe Language",
        ]
        for skill in skill_names:
            the_skill, _ = skill_models.Skill.objects.get_or_create(name=skill)
            the_skill.categories.add(nigerian_category)
            the_skill.save()
