from __future__ import unicode_literals
import re
import json
from django.conf import settings

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import (
    MaxValueValidator,
    validate_comma_separated_integer_list,
)
from django.utils.translation import ugettext as _
from django.utils.timezone import now
from django.utils.encoding import python_2_unicode_compatible
from model_utils.managers import InheritanceManager

from django.contrib.postgres.fields import ArrayField, JSONField

AUTH_USER_MODEL = getattr(settings, "AUTH_USER_MODEL", "auth.User")


class CategoryManager(models.Manager):
    def new_category(self, category):
        new_category = self.create(category=re.sub("\s+", "-", category).lower())

        new_category.save()
        return new_category


@python_2_unicode_compatible
class Category(models.Model):

    category = models.CharField(
        verbose_name=_("Category"), max_length=250, blank=True, unique=True, null=True
    )

    objects = CategoryManager()

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")

    def __str__(self):
        return self.category


@python_2_unicode_compatible
class SubCategory(models.Model):

    sub_category = models.CharField(
        verbose_name=_("Sub-Category"), max_length=250, blank=True, null=True
    )

    category = models.ForeignKey(
        Category,
        null=True,
        blank=True,
        verbose_name=_("Category"),
        on_delete=models.SET_NULL,
    )

    objects = CategoryManager()

    class Meta:
        verbose_name = _("Sub-Category")
        verbose_name_plural = _("Sub-Categories")

    def __str__(self):
        return self.sub_category + " (" + self.category.category + ")"


@python_2_unicode_compatible
class Quiz(models.Model):

    title = models.CharField(verbose_name=_("Title"), max_length=60, blank=False)

    description = models.TextField(
        verbose_name=_("Description"),
        blank=True,
        help_text=_("a description of the quiz"),
    )

    url = models.SlugField(
        max_length=60,
        blank=False,
        help_text=_("a user friendly url"),
        verbose_name=_("user friendly url"),
    )

    category = models.ForeignKey(
        Category,
        null=True,
        blank=True,
        verbose_name=_("Category"),
        on_delete=models.SET_NULL,
    )

    random_order = models.BooleanField(
        blank=False,
        default=False,
        verbose_name=_("Random Order"),
        help_text=_(
            "Display the questions in " "a random order or as they " "are set?"
        ),
    )

    max_questions = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name=_("Max Questions"),
        help_text=_("Number of questions to be answered on each attempt."),
    )

    answers_at_end = models.BooleanField(
        blank=False,
        default=False,
        help_text=_(
            "Correct answer is NOT shown after question."
            " Answers displayed at the end."
        ),
        verbose_name=_("Answers at end"),
    )

    exam_paper = models.BooleanField(
        blank=False,
        default=False,
        help_text=_(
            "If yes, the result of each"
            " attempt by a user will be"
            " stored. Necessary for marking."
        ),
        verbose_name=_("Exam Paper"),
    )

    single_attempt = models.BooleanField(
        blank=False,
        default=False,
        help_text=_(
            "If yes, only one attempt by"
            " a user will be permitted."
            " Non users cannot sit this exam."
        ),
        verbose_name=_("Single Attempt"),
    )

    pass_mark = models.SmallIntegerField(
        blank=True,
        default=0,
        help_text=_("Percentage required to pass exam."),
        validators=[MaxValueValidator(100)],
    )

    success_text = models.TextField(
        blank=True,
        help_text=_("Displayed if user passes."),
        verbose_name=_("Success Text"),
    )

    fail_text = models.TextField(
        verbose_name=_("Fail Text"), blank=True, help_text=_("Displayed if user fails.")
    )

    draft = models.BooleanField(
        blank=True,
        default=False,
        verbose_name=_("Draft"),
        help_text=_(
            "If yes, the quiz is not displayed"
            " in the quiz list and can only be"
            " taken by users who can edit"
            " quizzes."
        ),
    )

    data_dump = JSONField(null=True, blank=True)

    @classmethod
    def bulk_create_subject_quiz_info(cls, data):
        from skills.models import Skill, Category as SkillCategory
        from skills.api import SkillWithQuizSerializer

        to_create = data
        skillz = Skill.objects.filter(name__in=[x["skill"] for x in data]).all()
        if skillz:
            to_create = [x for x in data if x["skill"] not in [y.name for y in skillz]]
            for y in skillz:
                if not y.is_new:
                    to_create.append(y)
        if to_create:
            result = [cls.create_subject_and_quiz(x) for x in data]
        skillz = Skill.objects.filter(name__in=[x["skill"] for x in data]).all()
        return SkillWithQuizSerializer(skillz, many=True).data

    @classmethod
    def create_subject_and_quiz(cls, data):
        from skills.models import Skill, Category as SkillCategory
        from django_quiz.multichoice.models import Question, Answer, MCQuestion
        from skills.api import SkillSerializer

        skill_exists = Skill.objects.filter(name=data["skill"]).first()
        if not skill_exists:
            category = SkillCategory.objects.get(name="Academic Subjects")
            skill_exists: Skill = Skill.objects.create(name=data["skill"])
            skill_exists.categories.add(category)
        if skill_exists.quiz:
            skill_exists.quiz.get_questions().delete()
            skill_exists.quiz.delete()
        # create quiz instance
        quiz_instance = cls.objects.create(
            title=data["skill"],
            url=data["url"],
            category_id=2,
            pass_mark=data["pass_mark"],
            data_dump={"created": True},
        )
        # add quiz to skill
        skill_exists.quiz = quiz_instance
        skill_exists.save()
        # add questions
        instances = [MCQuestion.clean_q(**x) for x in data["questions"]]
        answers = [x[1] for x in instances]
        created = []
        for i in instances:
            i[0].save()
            created.append(i[0])
        # created = Question.objects.bulk_create([x[0] for x in instances])
        # m_created = MCQuestion.objects.bulk_create(
        #     [MCQuestion(question_ptr_id=x.id) for x in created]
        # )
        th = Question.quiz.through
        quiz_ids = th.objects.bulk_create(
            [th(quiz=skill_exists.quiz, question=x) for x in created]
        )
        Answer.objects.bulk_create(Answer.build_answers(created, answers))
        return SkillSerializer(skill_exists).data

    @property
    def is_new(self):
        return (self.data_dump or {}).get("created")

    def save(self, force_insert=False, force_update=False, *args, **kwargs):
        self.url = re.sub("\s+", "-", self.url).lower()

        self.url = "".join(
            letter for letter in self.url if letter.isalnum() or letter == "-"
        )

        if self.single_attempt is True:
            self.exam_paper = True

        if self.pass_mark > 100:
            raise ValidationError("%s is above 100" % self.pass_mark)

        super(Quiz, self).save(force_insert, force_update, *args, **kwargs)

    class Meta:
        verbose_name = _("Quiz")
        verbose_name_plural = _("Quizzes")

    def __str__(self):
        return self.title

    def get_questions(self):
        uu = self.question_set.all()
        return self.question_set.all().select_subclasses()

    @property
    def get_max_score(self):
        return self.get_questions().count()

    def anon_score_id(self):
        return str(self.id) + "_score"

    def anon_q_list(self):
        return str(self.id) + "_q_list"

    def anon_q_data(self):
        return str(self.id) + "_data"


class ProgressManager(models.Manager):
    def new_progress(self, user):
        new_progress = self.create(user=user, score="")
        new_progress.save()
        return new_progress


class Progress(models.Model):
    """
    Progress is used to track an individual signed in users score on different
    quiz's and categories

    Data stored in csv using the format:
        category, score, possible, category, score, possible, ...
    """

    user = models.OneToOneField(
        AUTH_USER_MODEL, verbose_name=_("User"), on_delete=models.CASCADE
    )

    score = models.CharField(
        validators=[validate_comma_separated_integer_list],
        max_length=1024,
        verbose_name=_("Score"),
    )

    objects = ProgressManager()

    class Meta:
        verbose_name = _("User Progress")
        verbose_name_plural = _("User progress records")

    @property
    def list_all_cat_scores(self):
        """
        Returns a dict in which the key is the category name and the item is
        a list of three integers.

        The first is the number of questions correct,
        the second is the possible best score,
        the third is the percentage correct.

        The dict will have one key for every category that you have defined
        """
        score_before = self.score
        output = {}

        for cat in Category.objects.all():
            to_find = re.escape(cat.category) + r",(\d+),(\d+),"
            #  group 1 is score, group 2 is highest possible

            match = re.search(to_find, self.score, re.IGNORECASE)

            if match:
                score = int(match.group(1))
                possible = int(match.group(2))

                try:
                    percent = int(round((float(score) / float(possible)) * 100))
                except:
                    percent = 0

                output[cat.category] = [score, possible, percent]

            else:  # if category has not been added yet, add it.
                self.score += cat.category + ",0,0,"
                output[cat.category] = [0, 0]

        if len(self.score) > len(score_before):
            # If a new category has been added, save changes.
            self.save()

        return output

    def update_score(self, question, score_to_add=0, possible_to_add=0):
        """
        Pass in question object, amount to increase score
        and max possible.

        Does not return anything.
        """
        category_test = Category.objects.filter(category=question.category).exists()

        if any(
            [
                item is False
                for item in [
                    category_test,
                    score_to_add,
                    possible_to_add,
                    isinstance(score_to_add, int),
                    isinstance(possible_to_add, int),
                ]
            ]
        ):
            return _("error"), _("category does not exist or invalid score")

        to_find = (
            re.escape(str(question.category)) + r",(?P<score>\d+),(?P<possible>\d+),"
        )

        match = re.search(to_find, self.score, re.IGNORECASE)

        if match:
            updated_score = int(match.group("score")) + abs(score_to_add)
            updated_possible = int(match.group("possible")) + abs(possible_to_add)

            new_score = ",".join(
                [str(question.category), str(updated_score), str(updated_possible), ""]
            )

            # swap old score for the new one
            self.score = self.score.replace(match.group(), new_score)
            self.save()

        else:
            #  if not present but existing, add with the points passed in
            self.score += ",".join(
                [str(question.category), str(score_to_add), str(possible_to_add), ""]
            )
            self.save()

    def show_exams(self):
        """
        Finds the previous quizzes marked as 'exam papers'.
        Returns a queryset of complete exams.
        """
        return Sitting.objects.filter(user=self.user, complete=True)


class SittingManager(models.Manager):
    def new_sitting(self, user, quiz):
        if quiz.random_order is True:
            question_set = quiz.question_set.all().select_subclasses().order_by("?")
        else:
            question_set = quiz.question_set.all().select_subclasses()

        question_set = question_set.values_list("id", flat=True)
        if quiz.max_questions and quiz.max_questions < len(question_set):
            question_set = question_set[: quiz.max_questions]

        questions = ",".join(map(str, question_set)) + ","

        new_sitting = self.create(
            user=user,
            quiz=quiz,
            question_order=questions,
            question_list=questions,
            incorrect_questions="",
            current_score=0,
            complete=False,
            user_answers="{}",
        )
        return new_sitting

    def user_sitting(self, user, quiz):
        if (
            quiz.single_attempt is True
            and self.filter(user=user, quiz=quiz, complete=True).exists()
        ):
            return False

        try:
            sitting = self.get(user=user, quiz=quiz, complete=False)
        except Sitting.DoesNotExist:
            sitting = self.new_sitting(user, quiz)
        except Sitting.MultipleObjectsReturned:
            sitting = self.filter(user=user, quiz=quiz, complete=False)[0]
        return sitting


class Sitting(models.Model):
    """
    Used to store the progress of logged in users sitting a quiz.
    Replaces the session system used by anon users.

    Question_order is a list of integer pks of all the questions in the
    quiz, in order.

    Question_list is a list of integers which represent id's of
    the unanswered questions in csv format.

    Incorrect_questions is a list in the same format.

    Sitting deleted when quiz finished unless quiz.exam_paper is true.

    User_answers is a json object in which the question PK is stored
    with the answer the user gave.
    """

    user = models.ForeignKey(
        AUTH_USER_MODEL, verbose_name=_("User"), on_delete=models.CASCADE
    )

    quiz = models.ForeignKey(Quiz, verbose_name=_("Quiz"), on_delete=models.CASCADE)

    question_order = models.CharField(
        validators=[validate_comma_separated_integer_list],
        max_length=1024,
        verbose_name=_("Question Order"),
    )

    question_list = models.CharField(
        validators=[validate_comma_separated_integer_list],
        max_length=1024,
        verbose_name=_("Question List"),
    )

    incorrect_questions = models.CharField(
        validators=[validate_comma_separated_integer_list],
        max_length=1024,
        blank=True,
        verbose_name=_("Incorrect questions"),
    )

    current_score = models.IntegerField(verbose_name=_("Current Score"))

    complete = models.BooleanField(
        default=False, blank=False, verbose_name=_("Complete")
    )

    user_answers = models.TextField(
        blank=True, default="{}", verbose_name=_("User Answers")
    )

    start = models.DateTimeField(auto_now_add=True, verbose_name=_("Start"))

    end = models.DateTimeField(null=True, blank=True, verbose_name=_("End"))

    objects = SittingManager()

    class Meta:
        permissions = (("view_sittings", _("Can see completed exams.")),)

    def get_first_question(self):
        """
        Returns the next question.
        If no question is found, returns False
        Does NOT remove the question from the front of the list.
        """
        if not self.question_list:
            return False

        first, _ = self.question_list.split(",", 1)
        question_id = int(first)
        return Question.objects.get_subclass(id=question_id)

    def remove_first_question(self):
        if not self.question_list:
            return

        _, others = self.question_list.split(",", 1)
        self.question_list = others
        self.save()

    def add_to_score(self, points):
        self.current_score += int(points)
        self.save()

    @property
    def get_current_score(self):
        return self.current_score

    def _question_ids(self):
        return [int(n) for n in self.question_order.split(",") if n]

    @property
    def get_percent_correct(self):
        dividend = float(self.current_score)
        divisor = len(self._question_ids())
        if divisor < 1:
            return 0  # prevent divide by zero error

        if dividend > divisor:
            return 100

        correct = int(round((dividend / divisor) * 100))

        if correct >= 1:
            return correct
        else:
            return 0

    def mark_quiz_complete(self):
        self.complete = True
        self.end = now()
        self.save()

    def add_incorrect_question(self, question):
        """
        Adds uid of incorrect question to the list.
        The question object must be passed in.
        """
        if len(self.incorrect_questions) > 0:
            self.incorrect_questions += ","
        self.incorrect_questions += str(question.id) + ","
        if self.complete:
            self.add_to_score(-1)
        self.save()

    @property
    def get_incorrect_questions(self):
        """
        Returns a list of non empty integers, representing the pk of
        questions
        """
        return [int(q) for q in self.incorrect_questions.split(",") if q]

    def remove_incorrect_question(self, question):
        current = self.get_incorrect_questions
        current.remove(question.id)
        self.incorrect_questions = ",".join(map(str, current))
        self.add_to_score(1)
        self.save()

    @property
    def check_if_passed(self):
        return self.get_percent_correct >= self.quiz.pass_mark

    @property
    def result_message(self):
        if self.check_if_passed:
            return self.quiz.success_text
        else:
            return self.quiz.fail_text

    def add_user_answer(self, question, guess):
        current = json.loads(self.user_answers)
        current[question.id] = guess
        self.user_answers = json.dumps(current)
        self.save()

    def get_questions(self, with_answers=False):
        question_ids = self._question_ids()
        questions = sorted(
            self.quiz.question_set.filter(id__in=question_ids).select_subclasses(),
            key=lambda q: question_ids.index(q.id),
        )

        if with_answers:
            user_answers = json.loads(self.user_answers)
            for question in questions:
                question.user_answer = user_answers[str(question.id)]

        return questions

    @property
    def questions_with_user_answers(self):
        return {q: q.user_answer for q in self.get_questions(with_answers=True)}

    @property
    def get_max_score(self):
        return len(self._question_ids())

    def progress(self):
        """
        Returns the number of questions answered so far and the total number of
        questions.
        """
        answered = len(json.loads(self.user_answers))
        total = self.get_max_score
        return answered, total


@python_2_unicode_compatible
class Question(models.Model):
    """
    Base class for all question types.
    Shared properties placed here.
    """

    quiz = models.ManyToManyField(Quiz, verbose_name=_("Quiz"), blank=True)

    category = models.ForeignKey(
        Category,
        verbose_name=_("Category"),
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
    )

    sub_category = models.ForeignKey(
        SubCategory,
        verbose_name=_("Sub-Category"),
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
    )

    figure = models.ImageField(
        upload_to="uploads/%Y/%m/%d", blank=True, null=True, verbose_name=_("Figure")
    )

    content = models.CharField(
        max_length=3000,
        blank=False,
        help_text=_("Enter the question text that " "you want displayed"),
        verbose_name=_("Question"),
    )

    explanation = models.TextField(
        max_length=2000,
        blank=True,
        help_text=_(
            "Explanation to be shown " "after the question has " "been answered."
        ),
        verbose_name=_("Explanation"),
    )

    data_dump = JSONField(null=True, blank=True)

    objects = InheritanceManager()

    @property
    def comprehension(self):
        return (self.data_dump or {}).get("comprehension")

    @property
    def image(self):
        return (self.data_dump or {}).get("image")

    @property
    def is_latex(self):
        return (self.data_dump or {}).get("is_latex") or False

    @property
    def options_layout(self):
        return (self.data_dump or {}).get("options_layout") or "vertical"

    class Meta:
        verbose_name = _("Question")
        verbose_name_plural = _("Questions")
        ordering = ["category"]

    def __str__(self):
        return self.content

    @classmethod
    def clean_q(cls, **data):
        if not data.get('answer'):
            import pdb; pdb.set_trace()
        answer = data["answer"]
        options = [
            {"content": data["optionA"], "correct": answer.lower() == "optiona"},
            {"content": data["optionB"], "correct": answer.lower() == "optionb"},
            {"content": data["optionC"], "correct": answer.lower() == "optionc"},
            {"content": data["optionD"], "correct": answer.lower() == "optiond"},
        ]
        return (
            cls(
                content=data["question"],
                data_dump={
                    "comprehension": data.get("pretext"),
                    "image": data.get("image"),
                    "options_layout": data.get("options_layout"),
                    "is_latex": data.get("is_latex"),
                },
            ),
            options,
        )
