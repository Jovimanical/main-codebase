# coding=utf-8
import datetime
import logging
import re
from decimal import Decimal
from operator import or_
from functools import reduce
from unittest import result
from autoslug.utils import slugify
from cloudinary.models import CloudinaryField
from dateutil.relativedelta import relativedelta
from django.contrib.postgres.fields import ArrayField
from django.urls import reverse
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator,
    MaxLengthValidator,
    MinLengthValidator,
)
from django.db import models, connection
from django.dispatch import receiver

# Create your models here.
from django.db.models import Q, Sum, IntegerField, When, Case, Max
from django_extensions.db.fields import AutoSlugField
from django_extensions.db.models import TimeStampedModel
from django.contrib.postgres.fields import JSONField
from geopy.distance import vincenty
from taggit.managers import TaggableManager
from django_quiz.quiz.models import Quiz
from ..mixins import TutorSkillMixin
from ..price_stats import PriceStat
from users.models import User, Location, UserProfile, states
from users.related_subjects import get_related_subjects
from external.models import Agent
from ..sql import *
from config import signals
from django.core.cache import cache
from django.utils import timezone
from django.contrib.postgres.fields.jsonb import KeyTextTransform
from config.functions import TO_Timestamp, Age, DatePart

# Get an instance of a logger
logger = logging.getLogger(__name__)


class SubCategory(models.Model):
    choices = (
        ("Academic Subjects", "Academic Subjects"),
        ("Exams & Languages", "Exams & Languages"),
        ("Non Academic Subjects", "Non Academic Subjects"),
    )
    name = models.CharField(max_length=70)
    section = models.CharField(max_length=70, choices=choices, blank=True, null=True)
    questions = JSONField(default=[], blank=True)

    class Meta:
        verbose_name_plural = "SubCategories"

    def __str__(self):
        return self.name

    def skill_names(self):
        return [x.name for x in self.skill_set.all()]


# class SubCategoryQuestion(models.Model):
#     KIND_CHOICES = (
#         (1, 'Yes or no question'),
#         (2, 'Open-ended question'),
#     )
#     category = models.ForeignKey(SubCategory,related_name='questions')
#     kind = models.IntegerField(choices=KIND_CHOICES,default=1)
#     question = models.TextField()
#     answer = models.TextField()


def found_subjects(instance, subjects):
    subjects_related = [y.lower() for y in related_subjects(subjects)]
    s = [
        x
        for x in instance
        if len(list(set(x.skill.related_with).intersection(subjects_related))) > 0
    ]
    return s


class CategoryManager(models.Manager):
    def skills_with_test(self):
        return self.get_queryset().exclude(skill__quiz_id=None)

    def with_skills_prefetched(self):
        return self.get_queryset().prefetch_related(
            models.Prefetch(
                "skill_set", queryset=Skill.objects.all(), to_attr="skill_names"
            )
        )

    def with_active_skills(self, state):
        return (
            self.get_queryset()
            .filter(skill__tutorskill__tutor__location__state__istartswith=state)
            .annotate(
                active_skills=Sum(
                    Case(
                        When(skill__tutorskill__status=TutorSkill.ACTIVE, then=1),
                        # default=Value(0),
                        output_field=IntegerField(),
                    )
                )
            )
            .filter(active_skills__gte=1)
            .order_by("priority")
        )


class Category(models.Model):
    slug = AutoSlugField(populate_from="name")
    name = models.CharField(max_length=70)
    priority = models.IntegerField(default=11)
    caption = models.CharField(max_length=70, null=True, blank=True)
    featured = models.BooleanField(default=False)
    image = models.CharField(max_length=70, null=True, blank=True)

    objects = CategoryManager()

    def __str__(self):
        return self.name

    class Meta:
        ordering = ("priority",)
        verbose_name_plural = "Categories"

    def get_absolute_url(self):
        return reverse("category_detail", args=[self.slug])

    def first_10(self):
        return (
            self.skill_set.all()
            .with_active_skills()
            .order_by("-featured", "-active_skills")[:11]
        )

    def get_first_10_skills(self):
        """Get the first 10 skills for display"""
        # count = self.skill_set.count()
        query = self.first_10()
        if len(query) >= 10:
            first = query[:5]
            second = query[5:10]
        else:
            first = query[:5]
            second = query[5 : len(query)]
        return dict(first=first, second=second)


class QuizSittingQuerySet(models.QuerySet):
    def retake_quiz(self, delay=True):
        from skills.tasks import send_mail_to_retake_test

        for ts in self.all():
            if delay:
                send_mail_to_retake_test(ts.tutor_skill.tutor_id)
            else:
                send_mail_to_retake_test(ts.tutor_skill.tutor_id)
        self.delete()


class QuizSitting(TimeStampedModel):
    tutor_skill = models.ForeignKey(
        "skills.TutorSkill", related_name="sitting", on_delete=models.CASCADE
    )
    started = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    tutor_email = models.CharField(max_length=254, blank=True, null=True)
    objects = QuizSittingQuerySet.as_manager()

    @property
    def passed(self):
        return self.score >= self.tutor_skill.skill.quiz.pass_mark

        # def state(self):
        #     return self.tutor_skill.tutor.

    def __repr__(self):
        return "<QuizSitting: %s>" % self.score


class SkillQuerySet(models.QuerySet):
    def with_tag(self, query):
        return self.filter(tags__name__istartswith=query)

    def search(self, query):
        s = TutorSkill.objects.filter(tags__name__istartswith=query).values_list(
            "skill_id", flat=True
        )
        q2 = Skill.objects.filter(name__istartswith=query).values_list("id", flat=True)
        y = list(s) + list(q2)
        n = list(set(y))
        return self.filter(id__in=n)
        q1 = Q(tutorskill__tags__name__istartswith=query)
        q2 = Q(name__istartswith=query)
        return self.filter(q2 | q1).with_active_skills()

    def skills_with_tutors(self):
        return self.annotate(tutor_count=models.Count("tutorskill"))

    def with_minimum_price(self):
        return self.annotate(price=models.Min("tutorskill__price"))

    def with_actual_price(self):
        return self.extra(
            select={
                "price": "SELECT MIN(*) "
                + "FROM skills_skill "
                + "WHERE <your_app>_book.publisher_id = "
                + "<your_app>_publisher.id AND "
                + "rating > 3.0"
            }
        )

    def with_active_skills(self, status=None):
        status = status if status else TutorSkill.ACTIVE
        return self.annotate(
            active_skills=Sum(
                Case(
                    When(tutorskill__status=status, then=1),
                    # default=Value(0),
                    output_field=IntegerField(),
                )
            )
        )

    def with_tutor(self):
        # return
        # self.annotate(no_tutors=models.Count('tutorskill')).filter(no_tutors__gte=1)
        return self.with_active_skills().filter(active_skills__gte=1)

    def by_state(self, state, status=None):
        return self.filter(
            tutorskill__tutor__location__state=state,
            tutorskill__tutor__location__addr_type=Location.TUTOR_ADDRESS,
        ).with_active_skills(status)

    def active_skill(self):
        return self.filter(tutorskill__status=2)

    def active_skill_with_background_image(self):
        return (
            self.active_skill()
            .with_minimum_price()
            .exclude(background_image="")
            .with_active_skills()
        )

    def exact_relation(self, subject):
        skill_search = [
            models.Q(name__icontains=x) for x in related_subjects([subject])
        ]
        return self.filter(reduce(or_, skill_search))


class SkillManager(models.Manager):
    def get_queryset(self):
        return SkillQuerySet(self.model, using=self._db)

    def skills_used_in_form(self):
        return (
            self.get_queryset().order_by("categories__id").values_list("name", "name")
        )

    def last_skills_in_categories(self):
        last_categories_id = Category.objects.annotate(
            skill_ids=Max("skill")
        ).values_list("skill_ids", flat=True)
        return self.get_queryset().filter(pk__in=last_categories_id)

    def with_tag(self, query):
        return self.get_queryset().select_related("tutorskill").with_tag(query)

    def with_tutor(self):
        return self.get_queryset().with_tutor()

    def get_from_cache(self, cache_key, **kwargs):
        result = cache.get(cache_key)
        if not result:
            from ..api import SkillSerializer

            result = self.with_tutor().select_related("quiz").filter(**kwargs)
            result = SkillSerializer(result, many=True).data
            cache.set(cache_key, result, 60 * 60 * 60)
        return result

    def with_tutor_cached(self, query=""):
        cache_key = "SKILL_WITH_TUTOR"
        kwargs = {}
        if query:
            cache_key = "SKILL_WITH_TUTOR_{}".format(query)
            kwargs = {"name__icontains": query}
        return self.get_from_cache(cache_key, **kwargs)

    def allowed_skills_preselect(self, user, category_slug, potential_subjects=[]):
        skills = (
            TutorSkill.objects.filter(tutor=user)
            .exclude(status=TutorSkill.DENIED)
            .exclude(status=TutorSkill.ACTIVE)
            .values_list("skill_id", flat=True)
        )
        return (
            self.get_queryset()
            .select_related("quiz")
            .filter(name__in=potential_subjects)
            .filter(id__in=skills)
            .filter(categories__slug=category_slug)
            .all()
        )

    def skill_with_quizzes(self, user):
        raw = (
            TutorSkill.objects.filter(tutor=user)
            .exclude(status=TutorSkill.DENIED)
            .exclude(status=TutorSkill.ACTIVE)
        )
        # only interested in skills that haven't been tested yet but have tests
        skills = [x.skill_id for x in raw if not x.quiz_sitting]
        result = self.get_queryset().select_related("quiz").filter(id__in=skills).all()

        return result

    def allowed_skills(self, skills_id, category_slug):
        if type(skills_id) == list:
            return (
                self.get_queryset()
                .select_related("quiz")
                .exclude(id__in=skills_id)
                .filter(categories__slug=category_slug)
                .all()
            )
        else:

            skills = (
                TutorSkill.objects.filter(tutor=skills_id)
                .exclude(status=TutorSkill.DENIED)
                .exclude(status=TutorSkill.ACTIVE)
                .values_list("skill_id", flat=True)
            )
            return (
                self.get_queryset()
                .select_related("quiz")
                .exclude(id__in=skills)
                .filter(categories__slug=category_slug)
                .all()
            )

    def skills_with_tutors(self):
        return self.get_queryset().skills_with_tutors()

    def exact_relation(self, subject):
        return self.get_queryset().exact_relation(subject)


class Skill(models.Model):
    SCHOOL = 1
    EXAMS = 2
    LANGUAGES = 3
    SKILLS = 4
    CHOICES = (
        (SCHOOL, "School"),
        (EXAMS, "Exams"),
        (LANGUAGES, "Languages"),
        (SKILLS, "Skills"),
    )
    slug = AutoSlugField(populate_from="name")
    name = models.CharField(max_length=70)
    categories = models.ManyToManyField(Category)
    subcategories = models.ManyToManyField(SubCategory, blank=True)
    quiz = models.ForeignKey(Quiz, null=True, blank=True, on_delete=models.SET_NULL)
    featured = models.BooleanField(default=False)
    tags = TaggableManager(blank=True)
    duration = models.IntegerField(default=6)
    # fields for marketing pages
    background_image = models.CharField(max_length=100, blank=True)
    heading = models.CharField(max_length=150, default="", blank=True)
    caption = models.CharField(max_length=200, default="", blank=True)
    subheading = models.CharField(max_length=150, default="", blank=True)
    description = models.TextField(max_length=400, blank=True)
    testimonial = models.TextField(max_length=400, blank=True, default="")
    testifier = models.ForeignKey(
        "users.User", null=True, blank=True, on_delete=models.SET_NULL
    )
    short_name = models.CharField(max_length=10, blank=True, default="")
    related_with = ArrayField(models.CharField(max_length=70), blank=True, null=True)
    market_category = models.IntegerField(null=True, blank=True, choices=CHOICES)
    objects = SkillManager()

    testable = property(lambda self: self.quiz is not None)
    quiz_url = property(lambda self: self.quiz.url if self.quiz else "")
    passmark = property(lambda self: self.quiz.pass_mark if self.quiz else 0)
    is_new = property(lambda self: self.quiz.is_new if self.quiz else False)

    def __str__(self):
        return self.name

    @property
    def questions(self):
        if self.testable:
            return self.quiz.get_questions()
        return []

    @property
    def get_heading(self):
        return self.heading or "Learn {}".format(self.name)

    @property
    def get_subheading(self):
        return self.subheading or "Get an experienced {} tutor in your area".format(
            self.name
        )

    @property
    def get_background_image(self):
        return self.background_image or "sample.jpg"

    @property
    def get_caption(self):
        return (
            self.caption
            or "Hire a qualified tutor for {} to help you improve understanding and achieve your goals.".format(
                self.name
            )
        )

    @property
    def get_short_name(self):
        return self.short_name or self.name

    @property
    def get_description(self):
        return (
            self.description
            or "Helping you master the nitty-gritty of {} is our passion. Whether you're a beginner or an advanced student, or if you simply need help to strengthen specific areas of the subject, our experienced and fully vetted tutors will help you reach your goals and produce amazing results.".format(
                self.name
            )
        )

    @property
    def has_testimonial(self):
        return len(self.testimonial) > 0

    @property
    def active_tutors(self):
        return self.tutorskill_set.active().count()

    def get_all_tags(self):
        # return
        # self.tutorskill_set.exclude(tags__name=None).filter(status=TutorSkill.ACTIVE)
        return self.tutorskill_set.exclude(tags__name=None).filter(
            status=TutorSkill.ACTIVE
        )

    def link_tutor_skill_tags(self):
        sk_with_tags = self.tags.values("name")
        tags = []
        for t in sk_with_tags:
            w = t["name"].lower()
            if not w in tags:
                tags.append(w)

        return filter(lambda x: len(x) > 4, tags)[:8]

    @classmethod
    def parent_subjects(cls):
        return cls.objects.filter(subcategories__section=SubCategory.choices[0][0])

    @classmethod
    def all_parent_subjects(cls):
        return cls.parent_subjects().values_list("name", flat=True)

    @classmethod
    def populate_initial_pricing(cls):
        from pricings.models import Region

        for o in Skill.objects.all():
            opts = (
                TutorSkill.objects.filter(skill=o)
                .active()
                .aggregate(
                    min=models.Min("price"),
                    max=models.Max("price"),
                    avg=models.Avg("price"),
                )
            )
            if all(opts.values()):
                Region.create_instance(
                    o.name, opts["avg"], opts["avg"] + 500, opts["max"]
                )


def tt(val):
    return "s" if val > 1 else ""


def ranger(limit, placeholder="", placeholder2=""):
    return tuple(
        (d, "{}{} {}".format(d, placeholder + tt(d), placeholder2))
        for d in range(1, limit)
    )


class SkillWithState(models.Model):
    skill = models.ForeignKey(
        Skill, related_name="with_states", on_delete=models.CASCADE
    )
    state = models.CharField(
        choices=Location.NIGERIAN_STATES, max_length=20, null=True, blank=True
    )
    online = models.BooleanField(default=False)

    def __str__(self):
        return "%s %s" % (self.skill.name, self.state)

    def __repr__(self):
        return "<SkillWithState %s %s>" % (self.skill.name, self.state)


FEATURED_CATEGORIES = {
    "mathematics": {
        "tags": [
            "General Mathematics",
            "Algebra",
            "SAT Math",
            "Basic Math",
            "Further Mathematics",
        ],
        "title": "Mathematics & Further Math",
        "image": "math1.jpg",
        "slug": "mathematics",
    },
    "english": {
        "tags": [
            "English Language",
            "Letter Writing",
            "English Grammar",
            "Literature in English",
        ],
        "title": "English Language",
        "image": "english1.png",
        "slug": "english",
    },
    "exam-preparation": {
        "tags": [
            "TOEFL",
            "SAT Writing",
            "SAT Reading",
            "GRE",
            "IELTS",
            "GMAT",
            "SAT Math",
        ],
        "title": "Exam Preparation",
        "image": "exam1.jpg",
        "slug": "exam-preparation",
    },
    "music": {
        "tags": [
            "Guitar",
            "Violin",
            "Piano",
            "Music Theory",
            "Saxophone",
            "Voice Training",
        ],
        "title": "Music & Instruments",
        "image": "music1.jpg",
        "slug": "music",
    },
    "science": {
        "tags": ["Physics", "Biology", "Chemistry", "Geography", "Genetics", "Anatomy"],
        "title": "Science Subjects",
        "image": "sciences1.jpg",
        "slug": "science",
    },
    "business-commercial": {
        "tags": [
            "Economics",
            "Accounting",
            "Commerce",
            "Government",
            "Business Studies",
        ],
        "title": "Business & Commercial",
        "image": "business1.jpg",
        "slug": "business-commercial",
    },
}


def get_q_objects(skill):
    q1 = Q(skill__name__icontains=skill)
    q2 = Q(tags__name__icontains=skill)
    last_letter = skill[-1]
    if last_letter == "s":
        q3 = Q(skill__name__icontains=skill[:-1])
        q4 = Q(tags__name__icontains=skill[:-1])
        return q1, q2, q3, q4
    return q1, q2


def process_age(age):
    min_age = 35
    if age <= 24:
        min_age = 18
    if 24 < age <= 30:
        min_age = 25
    if 30 < age < 35:
        min_age = 31

    today_age = datetime.date.today() - relativedelta(years=age)
    today_min_age = datetime.date.today() - relativedelta(years=min_age)
    return today_age.strftime("%Y-%m-%d"), today_min_age.strftime("%Y-%m-%d")


def sql_query_for_param(param):
    return 'UPPER("skills_skill"."name"::text) LIKE UPPER(%s)'


def get_tuteria_name(s: str, tuteria_subjects):
    result = None
    for i in tuteria_subjects:
        found = False
        for j in i["subjects"]:
            if s.lower() in j["name"].lower():
                result = i["name"]
                found = True
            if found:
                break
        if found:
            break
    return result


def related_subjects(subj, tuteria_subjects=None):
    if tuteria_subjects:
        pairs = [get_tuteria_name(s, tuteria_subjects) for s in subj]
        subj = list(set(subj + [x for x in pairs if x]))
    if subj:
        value = [get_related_subjects(x) for x in subj]
        return [item for sublist in value for item in sublist]
    return []


# def editors(self):
# return self.filter(role='E')
class TutorSkillQuerySet(models.QuerySet):
    def add_date_denied(self):
        return (
            self.annotate(totalAttempts=KeyTextTransform("totalAttempts", "other_info"))
            .annotate(extractedDate=KeyTextTransform("dateDenied", "other_info"))
            .annotate(dateDenied=TO_Timestamp("extractedDate"))
            .annotate(interval=Age("dateDenied"))
            .annotate(seconds_filter=DatePart("interval"))
            .annotate(hours_filter=models.F("seconds_filter") / 3600)
        )

    def skills_to_retake_quiz(self, hours=24, as_query=False, totalAttempts=2):
        working_set = (
            TutorSkill.objects.filter(
                status=4,
                other_info__dateDenied__isnull=False,
                other_info__totalAttempts__lt=totalAttempts,
            )
            .add_date_denied()
            .filter(hours_filter__gt=hours, hours_filter__lt=hours + 1)
            .distinct("tutor_id")
        )
        if as_query:
            return working_set
        return [
            {{"email": x[0], "firstName": x[1]}}
            for x in working_set.values_list("tutor__email", "tutor__first_name")
        ]

    def taken_tests_but_no_content(self):
        ranges = self.exclude(status=TutorSkill.ACTIVE).exclude(
            status=TutorSkill.DENIED
        )
        return (
            ranges.annotate(sitting_count=models.Count("sitting"))
            .filter(sitting_count__gt=0)
            .filter(models.Q(heading="") | models.Q(heading=None))
        )

    def form_details(self):
        values = self.values("skill__name", "price")
        return {
            "subjects": [(v["skill__name"], v["skill__name"]) for v in values],
            "prices": values,
        }

    def subjects(self):
        return self.values_list("skill__name", "skill__name")

    def no_of_students(self):
        return self.aggregate(models.Max("max_student"))["max_student__max"] or 0

    def has_denied_related_subject(self, request):
        skill_search = [
            models.Q(skill__name__icontains=x)
            # for x in related_subjects(request)]
            for x in request
        ]
        return self.filter(
            reduce(or_, skill_search) & Q(status=TutorSkill.DENIED)
        ).exists()

    def related_subject(self, request):
        #  models.Q(name__icontains=x) for x in related_subjects([subject])
        skill_search = [
            models.Q(skill__name__icontains=x) for x in related_subjects(request)
        ]
        rr = [x.lower() for x in request]
        condition1 = models.Q(skill__related_with__overlap=rr)
        condition2 = reduce(or_, skill_search)
        return self.filter(condition1 | condition2).exclude(status=TutorSkill.DENIED)
        # return self.filter(skill__related_with__overlap=rr).exclude(
        #     status=TutorSkill.DENIED
        # )
        # return self.filter(reduce(or_,
        # skill_search)).exclude(status=TutorSkill.DENIED)

    def actual_prices(self):
        return self.aggregate(
            count=models.Count("pk"),
            avg_price=models.Avg("price"),
            min_price=models.Min("price"),
            max_price=models.Max("price"),
        )

    def exact_relation(self, subject, clean=True, is_array=False):
        subject_array = subject if is_array else [subject]
        skill_search = [
            models.Q(skill__name__icontains=x) for x in related_subjects(subject_array)
        ]
        queryset = (
            self.filter(reduce(or_, skill_search))
            .exclude(status=TutorSkill.DENIED)
            .exclude(status=TutorSkill.SUSPENDED)
        )
        if clean:
            return queryset.exclude(status=TutorSkill.MODIFICATION).exclude(
                heading=None, description=None
            )
        return queryset

    def exclude_denied_and_pending(self):
        return self.filter(
            status__in=[TutorSkill.DENIED, TutorSkill.SUSPENDED]
        ).values_list("skill__name", flat=True)

    def all_prices(self):
        result = self.actual_prices()
        if result["avg_price"] != None:
            return dict(
                avg=result["avg_price"],
                min=(Decimal(result["avg_price"]) + Decimal(result["min_price"])) / 2,
                max=(Decimal(result["avg_price"]) + Decimal(result["max_price"])) / 2,
                count=result["count"],
            )
        return dict(avg=0, max=0, min=0, count=0)

    def by_age(self, age):
        min_age = 35
        if age <= 24:
            min_age = 18
        if 24 < age <= 30:
            min_age = 25
        if 30 < age < 35:
            min_age = 31

        today_age = datetime.date.today() - relativedelta(years=age)
        today_min_age = datetime.date.today() - relativedelta(years=min_age)
        less_than = Q(tutor__profile__dob__gte=today_age)
        greater_than = Q(tutor__profile__dob__lte=today_min_age)
        return self.filter(less_than & greater_than)

    def compound_query(self, tags):
        new_param = [sql_query_for_param(t) for t in tags]
        params = ["{}%".format(param) for param in tags]
        return ACTIVE_PARAM + "(" + " OR ".join(new_param) + ") ", params

    def by_age2(self, age):
        min_age = 35
        if age <= 24:
            min_age = 18
        if 24 < age <= 30:
            min_age = 25
        if 30 < age < 35:
            min_age = 31

        today_age = datetime.date.today() - relativedelta(years=age)
        today_min_age = datetime.date.today() - relativedelta(years=min_age)
        query = AGE_PARAM
        params = [today_age.strftime("%Y-%m-%d"), today_min_age.strftime("%Y-%m-%d")]
        return query, params

    def less_than_price(self, price):
        return self.filter(price__lte=price)

    def less_than_price2(self, price):
        return END_RATE_PARAM, [price]

    def greater_than_price(self, price):
        return self.filter(price__gte=price)

    def greater_than_price2(self, price):
        return START_RATE_PARAM, [price]

    def by_gender(self, gender):
        """Get Tutor Skills filtered by gender"""
        return self.filter(tutor__profile__gender=gender)

    def by_gender2(self, gender):
        """Get Tutor Skills filtered by gender"""
        return GENDER_PARAM, [gender]

    def by_address(self, param):
        coordinate = Location.get_coordinate(param)

    def by_days_per_week(self, days):
        return DAYS_PER_WEEK_PARAM, [days]

    def by_address_type(self):
        return self.filter(tutor__location__addr_type=Location.TUTOR_ADDRESS)

    def by_tags(self, tag_name):
        return TAG_PARAM + ")", ["%{}%".format(tag_name)]

    def by_skill(self, skill):
        list_of_qs = []
        when_split = filter(lambda x: len(x) >= 4, skill.split(" "))
        result = []
        # if (len(when_split) > 1):
        #     result = [list(get_q_objects(s)) for s in when_split]
        #     list_of_qs.extend([item for sublist in result for item in sublist])
        list_of_qs.extend(get_q_objects(skill))
        query = list_of_qs.pop()
        for item in list_of_qs:
            query |= item
        return self.filter(query)

    def by_skill2(self, skill, is_search=True):
        if is_search:
            return SEARCH_PARAM, ["%{}%".format(skill), "%{}%".format(skill)]
        return ACTIVE_PARAM + SKILL_PARAM, ["{}%".format(skill)]

    def by_distance(
        self,
        location=None,
        latitude=None,
        longitude=None,
        radius=15,
        state="Lagos",
        **kwargs
    ):
        if location or (latitude and longitude):
            subquery = Location.objects.by_distance(
                location=location,
                latitude=latitude,
                longitude=longitude,
                radius=radius,
                state=state,
            )
            return self.filter(tutor__location__in=subquery)
        return self.filter(tutor__location__state__istartswith=state)

    def by_distance2(self, location=None, latitude=None, longitude=None, distance=30):
        query = ""
        params = []
        if location or (latitude and longitude):
            qr = Location.objects.by_distance2(
                location=location, latitude=latitude, longitude=longitude
            )
            if qr[0]:
                query = (
                    POSTGRES_FUNCTIONS
                    + CATEGORY_SELECT
                    + LOCATION_BASED_SELECT
                    + JOINS
                    + COORDINATE_PARAM
                )
                params.extend(qr)
                params.extend([qr[0], qr[1], qr[0], distance])
        return query, params

    def by_classes(self, classes):
        cl = classes
        if type(classes) == list:
            cl = ",".join(classes)
        return CLASSES_PARAMS, ["{%s}" % (cl)]

    def by_years_of_experience(self, year):
        return YEARS_OF_TEACHING, [year]

    def by_curriculum_used(self, curriculum):
        ul = curriculum
        if type(curriculum) == list:
            ul = ",".join(curriculum)
        return CURRICULUM_USED, ["{%s}" % (ul)]

    def by_state(self, state):
        return self.filter(tutor__location__state__istartswith=state)

    def by_state2(self, state):
        query = POSTGRES_FUNCTIONS + CATEGORY_SELECT + JOINS + REGION_PARAM
        params = [state]
        return query, params

    def can_edit(self):
        return self.select_related("sitting").exclude(sitting__completed=False)

    def active(self):
        return self.filter(status=TutorSkill.ACTIVE)

    def with_skill_and_match_tutors(self, skill_name, include_tutors=[]):
        queryset = self.filter(skill__name__iexact=skill_name)
        if len(include_tutors) > 0:
            queryset = queryset.filter(tutor_id__in=list(include_tutors))
        return queryset.values_list("tutor_id", flat=True)

    def valid_subjects(self):
        return self.exclude(status=TutorSkill.DENIED)

    def found_subjects(self, subjects):
        subjects_related = [y.lower() for y in related_subjects(subjects)]
        s = [
            x
            for x in self.valid_subjects()
            if len(list(set(x.skill.related_with).intersection(subjects_related))) > 0
        ]
        return s

    def not_denied(self):
        return self.exclude(status=TutorSkill.DENIED)

    def by_teachers(self):
        """Queryset that returns tutorskill taught by tutors who are teachers"""
        return self.filter(tutor__is_teacher=True)

    def by_teachers2(self):
        """Queryset that returns tutorskill taught by tutors who are teachers"""
        return IS_TEACHER_PARAM

    def reviews_count(self):
        return self.annotate(rc=models.Count("reviews__id", distinct=True))

    def from_search3(self, skill, radius=15, category_query=False, **kwargs):
        age = kwargs.get("age", None)
        end_rate = kwargs.get("end_rate", None)
        start_rate = kwargs.get("start_rate", None)
        gender = kwargs.get("gender", None)
        set_region = kwargs.get("set_region", False)
        region = (
            kwargs.get("region", "Lagos")
            if set_region
            else kwargs.get("region", "Lagos")
        )
        location = kwargs.get("location", None)
        latitude = kwargs.get("latitude", None)
        longitude = kwargs.get("longitude", None)
        is_teacher = kwargs.get("is_teacher", None)
        distance = kwargs.get("distance", radius)
        tags = kwargs.get("tags", None)
        days_per_week = kwargs.get("days", None)
        days = kwargs.get("days_per_week", None)
        classes = kwargs.get("classes", None)
        years_of_teaching = kwargs.get("years_of_teaching", None)
        curriculum_used = kwargs.get("curriculum_used", None)
        set_for_request = kwargs.get("days_per_week")
        try:
            distance = int(distance)
        except ValueError:
            distance = radius
        except TypeError:
            distance = radius

        query = ""
        params = []
        if location:
            result = self.by_distance2(
                location, latitude, longitude, distance=int(distance)
            )
            query += result[0]
            params.extend(result[1])
        else:
            r = region or "Lagos"
            result1 = self.by_state2(r)
            query += result1[0]
            params.extend(result1[1])
        if age:
            result2 = self.by_age2(int(age))
            query += "AND " + result2[0]
            params.extend(result2[1])
        if end_rate:
            result3 = self.less_than_price2(int(end_rate))
            query += "AND " + result3[0]
            params.extend(result3[1])
        if start_rate:
            result4 = self.greater_than_price2(int(start_rate))
            query += "AND " + result4[0]
            params.extend(result4[1])
        if gender:
            result5 = self.by_gender2(gender)
            query += "AND " + result5[0]
            params.extend(result5[1])
        if is_teacher:
            query += "AND " + self.by_teachers2()
        if tags:
            result6 = self.by_tags(tags)
            query += "AND " + result6[0]
            params.extend(result6[1])
        if days_per_week or days:
            v = days_per_week or days
            result9 = self.by_days_per_week(v)
            query += "AND " + result9[0]
            params.extend(result9[1])
        if classes:
            result10 = self.by_classes(classes)
            query += "AND " + result10[0]
            params.extend(result10[1])
        if years_of_teaching:
            result12 = self.by_years_of_experience(years_of_teaching)
            query += "AND " + result12[0]
            params.extend(result12[1])
        if curriculum_used:
            result11 = self.by_curriculum_used(curriculum_used)
            query += "AND " + result11[0]
            params.extend(result11[1])
        if category_query:
            result7 = self.compound_query(skill)
            query += "AND " + result7[0] + GROUP_BY
            params.extend(result7[1])
        else:
            result7 = self.by_skill2(skill, is_search=kwargs.get("is_search", True))
            query += "AND " + result7[0] + GROUP_BY
            params.extend(result7[1])
        return query, params

    def for_skill(self, skill, **kwargs):
        return self.from_search3(
            skill, radius=15, set_region=False, is_search=False, **kwargs
        )

    def for_category(self, skill, **kwargs):
        """The skill is actually a list of tags."""
        return self.from_search3(skill, category_query=True, set_region=False, **kwargs)

    def for_client_request(self):
        """Tutors that have been marked as request for clients"""
        return self.filter(set_for_request=True)

    def display_for_skill(self, *args, **kwargs):
        return self.filter(marked_for_display=True).filter(skill__name__in=args)[:4]

    def get_query_for_price(self, rq, **kwargs):
        v = rq.state
        rs = rq.request_subjects or kwargs.get("ps") or {}
        if len(rs) > 0:
            # pdb.set_trace()
            if rq.latitude:
                r1 = self.filter(skill__name__in=rs)
                r1 = r1.by_distance(
                    latitude=rq.latitude, longitude=rq.longitude, state=rq.state
                ).aggregate(models.Min("price"))
            else:
                r1 = {}
            r2 = (
                self.filter(skill__name__in=rs)
                .by_distance(state=rq.state)
                .aggregate(models.Min("price"))
            )
            if r1.get("price__min"):
                r = r1
            else:
                r = r2
            return r
        return self.by_distance(state=rq.state).aggregate(models.Min("price"))

    def get_price(self, rq=None, ps=None, **kwargs):
        base_price = 800
        if rq.state in ["Lagos", "Abuja", "Rivers"]:
            base_price = 1000
        if rq:
            r = self.get_query_for_price(rq, ps=ps)
            if r.get("price__min"):
                if r.get("price__min") < base_price:
                    #     return r.get('price__min')
                    # else:
                    return base_price
        else:
            if kwargs.get("days_per_week") < 3:
                return (
                    float(min_price)
                    * kwargs.get("hours_per_day")
                    * len(kwargs.get("available_days") or [1])
                    * kwargs.get("days_per_week")
                    * kwargs.get("no_of_students")
                )
            return (
                float(min_price)
                * kwargs.get("hours_per_day")
                * 4
                * len(kwargs.get("available_days") or [1])
                * kwargs.get("no_of_students")
            )

        return base_price * rq.no_of_students

    def failed_skills_not_completed(self):
        return self.denied().filter(sitting__completed=False)

    def denied(self):
        return self.filter(status=TutorSkill.DENIED)

    def considered(self):
        return self.exclude(status=TutorSkill.MODIFICATION).exclude(
            status=TutorSkill.DENIED
        )

    def total_rating(self):
        oo = self.with_ratings().aggregate(
            tst=models.Sum("rating_sum"), rct=models.Sum("review_count")
        )
        return (oo.get("tst") or 0) / (oo.get("rct") or 1)

    def with_ratings(self):
        return self.annotate(
            rating_sum=models.Sum(
                models.Case(
                    models.When(
                        reviews__review_type=1, then=models.F("reviews__score")
                    ),
                    default=0.0,
                    output_field=models.DecimalField(),
                )
            )
        ).annotate(
            review_count=models.Sum(
                models.Case(
                    models.When(reviews__review_type=1, then=1),
                    default=0,
                    output_field=models.IntegerField(),
                )
            )
        )
        # .annotate(rating=models.F('rating_sum')/models.F('review_count'))

    def with_online_requests(self, request_type=3):
        return self.annotate(
            online_requests=models.Sum(
                models.Case(
                    models.When(
                        bookings__baserequesttutor__request_type=request_type, then=1
                    ),
                    default=0,
                    output_field=models.IntegerField(),
                )
            )
        )

    def with_reviews(self):
        from reviews.models import SkillReview

        return self.prefetch_related(
            models.Prefetch(
                "reviews",
                queryset=SkillReview.objects.select_related("commenter__profile")
                .filter(review_type=1)
                .prefetch_related("commenter__location_set"),
                to_attr="valid_reviews",
            )
        )

    def reject_exhibition_pictures(self):
        import cloudinary

        ts_ids = [x.id for x in self.all()]
        exhibition_list = SubjectExhibition.objects.filter(ts_id__in=ts_ids)
        public_ids = [x.image.public_id for x in exhibition_list.all()]
        cloudinary.api.delete_resources(public_ids)
        exhibition_list.delete()

    def require_modification(self, delay=True, agent=None):
        from skills.tasks import email_to_modify_skill

        tutor_skill_ids = self.values_list("id", flat=True)
        self.update_queryset(self, status=TutorSkill.MODIFICATION, agent=agent)
        for tutor_skill_id in tutor_skill_ids:
            if delay:
                email_to_modify_skill.delay(tutor_skill_id)
            else:
                email_to_modify_skill(tutor_skill_id)

    def deny_skill(self, delay=True, agent=None):
        from skills.tasks import email_on_decision_taken_on_subject

        tutor_skill_ids = self.values_list("id", flat=True)
        self.update_queryset(self, status=TutorSkill.DENIED, agent=agent)

        for tutor_skill_id in tutor_skill_ids:
            if delay:
                email_on_decision_taken_on_subject.delay(tutor_skill_id)
            else:
                email_on_decision_taken_on_subject(tutor_skill_id)

    def update_queryset(self, queryset, **kwargs):
        data = {**kwargs, **{"modified": timezone.now()}}
        return queryset.update(**data)

    def retake_quiz(self, delay=True):
        from skills.tasks import send_mail_to_retake_test

        for ts in self.all():
            if delay:
                send_mail_to_retake_test(ts.tutor_id)
            else:
                send_mail_to_retake_test(ts.tutor_id)

    def approve_skill(self, delay=True, agent=None):
        from skills.tasks import email_on_decision_taken_on_subject

        tutor_skill_ids = self.values_list("id", flat=True)
        self.update_queryset(self, status=TutorSkill.ACTIVE, agent=agent)

        for tutor_skill_id in tutor_skill_ids:
            if delay:
                email_on_decision_taken_on_subject.delay(tutor_skill_id, approved=True)
            else:
                email_on_decision_taken_on_subject(tutor_skill_id, approved=True)


def dictfetchall(cursor):
    "Returns all rows from a cursor as a dict"
    desc = cursor.description
    return [dict(zip([col[0] for col in desc], row)) for row in cursor.fetchall()]


class TutorSkillManager(models.Manager):
    def api_search(self):
        from bookings.models import Booking

        return (
            self.get_queryset()
            .active()
            .select_related("tutor__profile", "tutor__user_calendar", "skill")
            .with_ratings()
            .with_reviews()
            .prefetch_related(
                "exhibitions", "tutor__education_set", "tutor__workexperience_set"
            )
            .prefetch_related(
                "tutor__location_set",
                "tutor__t_bookings__bookingsession_set",
                "tutor__tutorskill_set__skill",
            )
            .prefetch_related("tutor__user_calendar__days")
        )
        # .prefetch_related(models.Prefetch('bookings__bookingsession_set',
        # queryset=BookingSession.objects.completed(),to_attr="hours_taught"))
        # .annotate(hours_taught=models.Sum('bookings__bookingsession__no_of_hours'))

    def get_queryset(self):
        return TutorSkillQuerySet(self.model, using=self._db)

    def has_denied_related_subject(self, request):
        return self.get_queryset().has_denied_related_subject(request)

    def get_price(self, rq=None, **kwargs):
        return self.get_queryset().active().get_price(rq, **kwargs)

    def related_subject(self, request):
        return self.get_queryset().related_subject(request)

    def failed_skills_not_completed(self):
        return self.get_queryset().failed_skills_not_completed()

    def median_cost(self, rq):
        rs = rq.request_subjects or []
        r1 = (
            self.get_queryset()
            .active()
            .filter(skill__name__in=rs)
            .by_distance(latitude=rq.latitude, longitude=rq.longitude, state=rq.state)
            .values_list("price", flat=True)
        )
        r2 = (
            self.get_queryset()
            .active()
            .filter(skill__name__in=rs)
            .by_distance(state=rq.state)
            .values_list("price", flat=True)
        )
        if len(r1) > 0:
            return PriceStat(r1).median()
        if len(r2) > 0:
            return PriceStat(r2).median()
        return 0

    def exact_relation(self, subject, clean=True):
        return self.get_queryset().exact_relation(subject, clean=clean)

    def exclude_denied_and_pending(self):
        return self.get_queryset().exclude_denied_and_pending()

    def with_exhibition(self):
        return self.active().exclude(exhibitions__image=None)[:1]

    def test(self, latitude, longitude, distance=3):
        from haystack.query import SearchQuerySet
        from haystack.utils.geo import Point
        from haystack.utils.geo import Point, D

        ninth_and_mass = Point(float(longitude), float(latitude))
        # Within a two kilometers.
        max_dist = D(km=distance)
        return SearchQuerySet().dwithin("location", ninth_and_mass, max_dist)

    def get_all_skill_pricings(self, *args, **kwargs):
        from haystack.query import SearchQuerySet
        from haystack.utils.geo import Point
        from haystack.utils.geo import Point, D

        queryset = (
            self.get_queryset()
            .considered()
            .filter(skill__related_with__overlap=[o.lower() for o in kwargs["ps"]])
        )
        if kwargs.get("latitude"):
            ninth_and_mass = Point(
                float(kwargs["longitude"]), float(kwargs["latitude"])
            )
            # Within a two kilometers.
            max_dist = D(km=10)
            sqs = SearchQuerySet().dwithin("location", ninth_and_mass, max_dist)
            users_in_location = [x.user_id for x in sqs]
            return queryset.filter(tutor_id__in=users_in_location).values_list(
                "price", flat=True
            )

        return queryset.by_distance(
            latitude=kwargs["latitude"],
            longitude=kwargs["longitude"],
            state=kwargs["state"],
        ).values_list("price", flat=True)

    def location_prices(self, *args, **kwargs):
        """Fetch the average, maximum and minimum price for tutors that fall in the area"""
        base_price = 800
        if "ps" in kwargs:
            state = kwargs.get("state")
            if state in ["Lagos", "Abuja", "Rivers"]:
                base_price = 1000
            r1 = self.get_all_skill_pricings(*args, **kwargs)
            r2 = (
                self.get_queryset()
                .considered()
                .filter(skill__name__in=kwargs["ps"])
                .by_distance(state=kwargs["state"])
                .values_list("price", flat=True)
            )
            # pdb.set_trace()
            if len(r1) > 0:
                s = PriceStat(r1)
                minn = min(s.mode())
                # maximum = s.original_max()
                maximum = max(s.mean(), max(s.mode()), s.median())
                mean = s.mean()
                diff2 = mean - minn
                diff = maximum - minn
                if minn < base_price:
                    minn = base_price
                    mean = minn + diff2
                    maximum = minn + diff
                # else:
                #     minn = Decimal(800)
                return dict(avg=mean, min=minn, max=maximum)
            if len(r2) > 0:
                s = PriceStat(r2)
                minn = min(s.mode())
                mean = s.mean()
                # maximum = s.original_max()
                maximum = max(s.mean(), max(s.mode()), s.median())
                diff2 = mean - minn
                diff = maximum - minn
                if minn < base_price:
                    minn = base_price
                    mean = minn + diff2
                    maximum = minn + diff
                # else:
                #     minn = Decimal(800)
                return dict(avg=mean, min=minn, max=maximum)
        return dict(avg=0, min=base_price, max=0)

    def can_edit(self):
        return self.get_queryset().can_edit()

    def by_distance(self, **kwargs):
        return self.get_queryset().by_distance(**kwargs)

    def by_age(self, age):
        return self.get_queryset().by_age(age)

    def by_address_type(self):
        return self.get_queryset().by_address_type()

    def by_teachers(self):
        return self.get_queryset().by_teachers()

    def by_gender(self, gender):
        return self.get_queryset().by_gender(gender)

    def less_than_price(self, price):
        return self.get_queryset().less_than_price(price)

    def greater_than_price(self, price):
        return self.get_queryset().greater_than_price(price)

    def from_search2(self, skill, radius=30, **kwargs):
        age = kwargs.get("age", None)
        end_rate = kwargs.get("end_rate", None)
        start_rate = kwargs.get("start_rate", None)
        gender = kwargs.get("gender", None)
        region = kwargs.get("region", "Lagos")
        location = kwargs.get("location", None)
        latitude = kwargs.get("latitude", None)
        longitude = kwargs.get("longitude", None)
        is_teacher = kwargs.get("is_teacher", None)
        distance = kwargs.get("distance", radius)
        tags = kwargs.get("tags", None)
        try:
            distance = int(distance)
        except ValueError:
            distance = radius
        except TypeError:
            distance = radius

        query = self.active().by_skill(skill)
        if location:
            query = query.by_distance(
                location, latitude, longitude, radius=int(distance)
            )
        else:
            query = query.by_state(region)
        if age:
            query = query.by_age(int(age))
        if end_rate:
            query = query.less_than_price(int(end_rate))
        if start_rate:
            query = query.greater_than_price(int(start_rate))
        if gender:
            query = query.by_gender(gender)
        if is_teacher:
            query = query.by_teachers()
        if tags:
            query = query.by_tags(tags)

        return query.reviews_count()

    def from_search(self, skill, radius=15, **kwargs):
        query, params = self.get_queryset().from_search3(skill, radius, **kwargs)
        cursor = connection.cursor()
        cursor.execute(query, params)
        result = dictfetchall(cursor)
        set_for_request = kwargs.get("set_for_request")
        if set_for_request:
            v = [u["id"] for u in result]
            TutorSkill.objects.filter(id__in=v).update(set_for_request=True)
        return result

    def active(self):
        return self.get_queryset().active()

    def pending(self):
        return self.get_queryset().filter(status=TutorSkill.PENDING)

    def suspended(self):
        return self.get_queryset().filter(status=TutorSkill.SUSPENDED)

    def denied(self):
        return self.get_queryset().filter(status=TutorSkill.DENIED)

    def require_modification(self):
        return self.get_queryset().filter(status=TutorSkill.MODIFICATION)

    def with_skill_or_tag(self, skill):
        return self.get_queryset().by_skill(skill)

    def with_reviews(self, tutor_skills):
        return (
            self.get_queryset()
            .filter(id__in=tutor_skills.values_list("id"))
            .annotate(rc=models.Count("reviews"))
            .values("tutor_id", "rc")
        )

    def from_region(self, region=None):
        query = self.get_queryset().all()
        if region:
            query = query.by_state(region)
        return query

    def with_category_or_skill(self, param=None, **kwargs):
        if param:
            query, params = self.get_queryset().for_skill(param, **kwargs)
            cursor = connection.cursor()
            cursor.execute(query, params)
            r = dictfetchall(cursor)

            return r
        return []

    def featured_category_search(self, slug, **kwargs):
        selected_category = FEATURED_CATEGORIES.get(slug)
        tags = selected_category["tags"]
        query, params = self.get_queryset().for_category(tags, **kwargs)
        cursor = connection.cursor()
        cursor.execute(query, params)
        return dictfetchall(cursor)


class TutorTaskManager(models.Manager):
    def get_queryset(self):
        return TutorSkillQuerySet(self.model, using=self._db)

    def get_first_four_active_tutorskill(self, skill):
        return self.get_queryset().active().filter(skill=skill).reviews_count()[:4]

    def get_any_four_tutor_teaching_skill(self, skills):
        l = [Skill.objects.get(name=s).pk for s in skills]
        return self.get_queryset.active().filter(skill_id__in=l).reviews_count()[:4]


class TutorSkill(TutorSkillMixin, TimeStampedModel):
    DISCOUNT = tuple(
        (d, "{}%".format(d)) for d in [0, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    )

    PENDING = 1
    ACTIVE = 2
    SUSPENDED = 3
    DENIED = 4
    MODIFICATION = 5
    FREEZE = 6
    STATUS = (
        (ACTIVE, "Active"),
        (SUSPENDED, "Suspended"),
        (PENDING, "Pending Approval"),
        (DENIED, "Denied"),
        (MODIFICATION, "Require Modification"),
        (FREEZE, "Freee Subject"),
    )

    tutor = models.ForeignKey(User, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    heading = models.CharField(max_length=100, null=True, db_index=True)
    slug = AutoSlugField(populate_from="heading", max_length=100)
    description = models.TextField(validators=[MinLengthValidator(300)])
    tags = TaggableManager(blank=True)
    agent = models.ForeignKey(Agent, null=True, blank=True, on_delete=models.SET_NULL)
    # pricing details
    price = models.DecimalField(default=500.00, max_digits=10, decimal_places=2)
    discount = models.IntegerField(
        default=0,
        choices=DISCOUNT,
        validators=[MaxValueValidator(50), MinValueValidator(0)],
    )

    max_student = models.IntegerField(default=1, choices=ranger(6, " student"))

    monthly_booking = models.BooleanField(default=True)
    hours_per_day = models.IntegerField(
        default=1, choices=ranger(6, "hr", "per day"), null=True, blank=True
    )
    days_per_week = models.IntegerField(
        default=1, choices=ranger(8, "day", "per week"), null=True, blank=True
    )
    marked_for_display = models.BooleanField(default=False)
    # subject image
    image = CloudinaryField(max_length=100, null=True, blank=True)
    image_denied_on = models.DateTimeField(null=True, blank=True)
    # rating for each skill
    # rating = RatingField(range=5, weight=5)
    other_info = JSONField(default={}, blank=True)
    status = models.IntegerField(default=MODIFICATION, choices=STATUS)
    set_for_request = models.BooleanField(default=False)
    remark = models.TextField(null=True, blank=True)
    # academic_profile = models.BooleanField(default=False)
    approved = models.NullBooleanField()
    objects = TutorSkillManager()
    c_tasks = TutorTaskManager()

    @property
    def preliminaryQuestions(self):
        return (self.other_info or {}).get("preliminaryQuestions") or []

    @property
    def classes_taught(self):
        if len(self.preliminaryQuestions) > 0:
            classes = [
                x for x in self.preliminaryQuestions if x.get("key") == "classes"
            ]
            if classes:
                return classes[0].get("value") or []
        return []

    @property
    def levels_taught(self):
        profile: UserProfile = self.tutor.profile
        if len(self.classes_taught) > 0:
            return self.classes_taught
        classes = profile.classes or []
        if len(classes) > 0:
            return classes
        return []

    @property
    def curriculums(self):
        if len(self.preliminaryQuestions) > 0:
            curriculums = [
                x for x in self.preliminaryQuestions if x.get("key") == "curriculums"
            ]
            if curriculums:
                return curriculums[0].get("value") or []
        return []

    @property
    def curriculum_used(self):
        if len(self.curriculums) > 0:
            return self.curriculums
        profile: UserProfile = self.tutor.profile
        if len(profile.curriculum_used or []) > 0:
            return profile.curriculum_display()

    @property
    def exam_speciality(self):
        def parse_item(u):
            key, value = u.split(":")
            exams = value.split(",")
            return {"group": key, "exams": exams}

        if len(self.preliminaryQuestions) > 0:
            exam_speciality = [
                x
                for x in self.preliminaryQuestions
                if x.get("key") == "exam_speciality"
            ]
            if exam_speciality:
                value = exam_speciality[0]
                return [parse_item(o) for o in value.get("value", [])]
        return []

    @property
    def actual_exams(self):
        exams = [x["exams"] for x in self.exam_speciality]
        return [x for y in exams for x in y]

    @property
    def schools_taught(self):
        if len(self.preliminaryQuestions) > 0:
            schools_taught = [
                x for x in self.preliminaryQuestions if x.get("key") == "schools_taught"
            ]
            if schools_taught:
                return schools_taught[0]["value"].split(",")
        return []

    @staticmethod
    def create_temp(tutor, skill):
        ts, status = TutorSkill.objects.get_or_create(tutor=tutor, skill=skill)
        ts.monthly_booking = tutor.profile.allow_monthly
        ts.hours_per_day = tutor.profile.hours
        ts.days_per_week = tutor.profile.days
        ts.save()
        return ts

    @property
    def skill_exhibitions(self):
        return [x.image.url for x in self.exhibitions.all() if x.image]

    @property
    def quiz_sitting(self):
        result = QuizSitting.objects.filter(tutor_skill_id=self.pk)
        return result.first()
        # return [{
        #     'started': x.started,
        #     'completed': x.completed,
        #     'score': x.score
        # } for x in result]

    @property
    def status_display(self):
        return self.get_status_display()

    @classmethod
    def update_queryset(cls, queryset, **kwargs):
        data = {**kwargs, **{"modified": timezone.now()}}
        return queryset.update(**data)

    def generate_slug(self):
        flags = [",!.;?:'[]()&%<>`*+@#$^~=|"]
        if self.heading:
            sentences = re.split("([.!?] *)", self.heading)
            result = "".join([each.capitalize() for each in sentences])
            new_v = (
                result.replace("I will", "")
                .replace("I am", "")
                .lower()
                .replace(".", "")
                .strip()
                .replace(" ", "-")
                .replace("--", "-")
                .replace("!", "")
                .replace("?", "")
                .replace(";", "")
                .replace(":", "")
                .replace("'", "")
                .replace(".", "")
                .replace("!", "")
                .replace(";", "")
                .replace(":", "")
                .replace("[", "")
                .replace("]", "")
                .replace("(", "")
                .replace(")", "")
                .replace("%", "")
                .replace("&", "")
                .replace("~", "")
                .replace("*", "")
                .replace("`", "")
                .replace('"', "")
                .replace(",", "")
                .replace("\u2764", "")
                .replace('"', "")
                .replace(",", "")
                .replace("/", "")
                .replace("\r", "")
                .replace("\n", "")
                .replace("'", "")
            )
            return slugify(new_v)

            # return val.translate(None,''.join(flags))
            # return ''.join(c for c in val if c not in flags)
            # .replace("'",'').replace('?','') \
            # .replace('.','').replace('!','').replace(';','').replace(':','').replace('[','') \
            # .replace(']','').replace('(','').replace(')').replace('%','').replace('&','')
        return None

    def get_skill_status_verb(self):
        verb = None
        if self.status == self.ACTIVE:
            verb = "activated"
        elif self.status == self.DENIED:
            verb = "denied"
        elif self.status == self.MODIFICATION:
            verb = "modification requested"
        elif self.status == self.FREEZE:
            verb = "freezed"
        elif self.image == None:
            verb = "image rejected"
        return verb

    def get_distance_text(self, coordinate):
        distance = self.get_distance(coordinate)
        if distance < 1000:
            return "~ {}m".format(distance)
        else:
            return "~ {}km".format(distance / 1000.0)

    def get_distance(self, coordinate):
        mine = self.tutor.location_set.home_address()
        if type(coordinate) == str:
            cc = Location.get_coordinate(coordinate)
            address = dict(latitude=cc.latitude, longitude=cc.longitude)
        else:
            address = coordinate
        result = vincenty(
            (mine.latitude, mine.longitude),
            (Decimal(address["latitude"]), Decimal(address["longitude"])),
        ).kilometers
        return int(result)

    def get_absolute_url(self):
        return reverse(
            "users:tutor_public_skill_profile", args=[self.tutor.slug, self.slug]
        )

    def update_tutor_prices(self):
        pricingInfo = self.tutor.revamp_data("pricingInfo") or {"hourlyRates", {}}
        pricingInfo["hourlyRates"][self.skill.name] = float("%.2f" % self.price)
        self.tutor.update_revamp_data({"pricingInfo": pricingInfo})

    @property
    def public_url(self):
        return self.get_absolute_url()

    def save(self, *args, **kwargs):
        self.slug = self.generate_slug()
        return super(TutorSkill, self).save(*args, **kwargs)

    def monthly_calendar(self):
        return self.tutor.monthly_calendar(self.hours_per_day)

    @property
    def get_response_time(self):
        rt = self.tutor.profile.response_time
        if rt > 0:
            time = rt
        else:
            time = 1
        return dict(UserProfile.RESPONSE_TIME).get(time)

    class Meta:
        unique_together = ("tutor", "skill")

    def __str__(self):
        return "%s ;; %s" % (self.skill.name, self.tutor.email)

    def __str__(self):
        return "%s ;; %s" % (self.skill.name, self.tutor.email)


class SubjectExhibition(models.Model):
    ts = models.ForeignKey(
        TutorSkill, related_name="exhibitions", on_delete=models.CASCADE
    )
    image = CloudinaryField(max_length=100, null=True, blank=True)
    caption = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return "%s" % (self.ts.tutor.email,)

    @property
    def cloudinary_image(self):
        import cloudinary

        if self.image:
            instance = cloudinary.CloudinaryImage(public_id=self.image.public_id)
            return instance.build_url(format="jpb")
        return ""


class SkillCertificateManager(models.Manager):
    def active(self):
        return self.get_queryset().exclude(award_name=None, award_institution=None)


class SkillCertificate(models.Model):
    award_name = models.CharField(max_length=70, null=True, blank=True)
    award_institution = models.CharField(max_length=100, null=True, blank=True)
    ts = models.ForeignKey(TutorSkill, on_delete=models.CASCADE)
    objects = SkillCertificateManager()

    def __str__(self):
        if self.award_name:
            return "Award Name: %s\nAward Institution: %s\n" % (
                self.award_name,
                self.award_institution,
            )
        return self.ts.tutor.email

    @property
    def display_string(self):
        if self.award_name:
            return u"%s,%s" % (self.award_name, self.award_institution)


class PendingTutorSkillManager(TutorSkillManager):
    def get_queryset(self):
        return (
            super(PendingTutorSkillManager, self)
            .get_queryset()
            .filter(status=TutorSkill.PENDING)
        )


class PendingTutorSkill(TutorSkill):
    objects = PendingTutorSkillManager()

    class Meta:
        proxy = True


class ApprovedTutorSkillManager(TutorSkillManager):
    def get_queryset(self):
        return super(ApprovedTutorSkillManager, self).get_queryset().active()


class ApprovedTutorSkill(TutorSkill):
    objects = ApprovedTutorSkillManager()

    class Meta:
        proxy = True


class TutorSkillForClientManager(TutorSkillManager):
    def get_queryset(self):
        return (
            super(TutorSkillForClientManager, self).get_queryset().for_client_request()
        )


class TutorSkillForClient(TutorSkill):
    objects = TutorSkillForClientManager()

    class Meta:
        proxy = True


@receiver(signals.create_subjects)
def on_create_subject_callback(sender, tutor_id, subjects, **kwargs):
    from .. import tasks

    user = User.objects.get(pk=tutor_id)
    if subjects and len(subjects) > 0:
        skills = Skill.objects.filter(name__in=subjects)
        for s in skills:
            TutorSkill.create_temp(user, s)
