from users.models.models1 import User
from django.contrib.postgres.fields import ArrayField, JSONField
from django.db import models
from config.utils import generate_code
from model_utils.models import TimeStampedModel
from django.conf import settings
from django.utils.translation import ugettext_lazy as _
import base64
from phonenumber_field.modelfields import PhoneNumberField


class CourseException(Exception):
    def __init__(self, *args: object) -> None:
        self.msg = args[0]
        super().__init__(*args)


# Create your models here.
class CourseUser(TimeStampedModel):
    UNPAID = 1
    PAID = 2
    Online = 1
    BankTransfer = 2
    PAYMENT_METHODS = ((0, "None"), (Online, "Online"), (BankTransfer, "Bank Transfer"))
    PAYMENT_STATUS = ((UNPAID, "UNPAID"), (PAID, "PAID"))
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="video_courses",
        null=True,
        blank=True,
    )
    slug = models.CharField(max_length=255, unique=True, null=True, db_index=True)
    exam = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    course_info = JSONField(null=True, blank=True)
    email = models.EmailField(_("email address"), blank=False, db_index=True)
    first_name = models.CharField(
        _("first name"), max_length=40, blank=True, unique=False, db_index=True
    )
    last_name = models.CharField(
        _("last name"), max_length=40, blank=True, unique=False, db_index=True
    )
    phone = PhoneNumberField(blank=True)
    status = models.IntegerField(choices=PAYMENT_STATUS, default=UNPAID)
    payment_medium = models.IntegerField(choices=PAYMENT_METHODS, default=0)
    amount = models.DecimalField(default=0, blank=True, max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(
        default=0, blank=True, max_digits=10, decimal_places=2
    )
    discount = models.IntegerField(default=0, null=True, blank=True)
    with_others = models.BooleanField(default=False)  # is split
    referrer = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="user_referred",
    )
    payment_date = models.DateTimeField(null=True, blank=True)
    where_you_heard = models.CharField(max_length=200, blank=True, default="")

    class Meta:
        verbose_name = "Video Courses Request"
        verbose_name_plural = "Video Courses Requests"

    @property
    def referrer_email(self):
        if self.referrer:
            return self.referrer.email
        return ""

    @property
    def thinkific_url(self):
        if self.user:
            return self.user.thinkific_url
        return ""

    @property
    def thinkific_id(self):
        if self.user:
            return self.user.thinkific_user_id
        return None

    @property
    def referral_credit(self):
        if self.user:
            dump = self.user.data_dump or {}
            credits = dump.get("course_credits") or 0
            return credits
        return 0

    def update_referral_credit(self, credit=0, reset=False):
        if self.user:
            new_credit = self.referral_credit + credit
            if reset:
                new_credit = 0
            dump = self.user.data_dump or {}
            dump["course_credits"] = new_credit
            self.user.data_dump = dump
            self.user.save()

    @property
    def payer_email(self):
        if self.referrer:
            if self.referrer.amount_paid > self.amount:
                return self.referrer.email
        if self.amount_paid > self.amount:
            self.email
        return None

    def __str__(self) -> str:
        return f"{self.email} {self.amount}"

    @property
    def course_detail(self):
        instance = self.course_info or {}
        courses = instance.get("info") or []
        return courses

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @classmethod
    def generate_slug(cls):
        return generate_code(cls, "slug")

    @property
    def country(self):
        return self.personal_info.get("country")

    @property
    def state(self):
        return self.personal_info.get("state")

    @property
    def personal_info(self):
        info = self.course_info.get("info") or {}
        personal_info = info.get("personalInfo") or {}
        personal_info.update({"referral_credit": self.referral_credit})
        return personal_info

    @property
    def login_code(self):
        user: User = self.user
        if user:
            return user.login_code
        return self.course_info.get("login_code")

    @property
    def plan(self):
        info = self.course_info.get("info") or {}
        return info.get("plan")

    def set_login_code(self, code=""):
        self.course_info["login_code"] = code
        self.save()

    @property
    def additional_users(self):
        return self.course_info.get("additional_users") or []

    def get_or_create_user(self, thinkific_id):
        if not self.user:
            existing: User = User.objects.filter(email__istartswith=self.email).first()
            if not existing:
                existing: User = User.objects.create(
                    email=self.email,
                    first_name=self.first_name,
                    last_name=self.last_name,
                    # country =
                )
            existing.save_thinkific_data({"user_id": thinkific_id})
            self.user = existing
            self.save()

    def action_after_making_payment(self, additional_users=[]):
        for j in additional_users:
            # check if user exists
            new_instance: User = User.objects.create(first_name=j.get("firstName"))
        pass

    @classmethod
    def create_instance(cls, personalInfo, exam: str):
        email = personalInfo.get("email")
        first_name = personalInfo.get("firstName")
        last_name = personalInfo.get("lastName")
        phone = personalInfo.get("phone", "")
        phone = f"+{phone.replace('+','')}"
        where_you_heard = personalInfo.get("medium")
        if not email:
            raise CourseException("Invalid email sent")
        if not exam:
            raise CourseException("No valid exam passed")
        conditions = models.Q(email__istartswith=email) | models.Q(
            phone__icontains=phone.lower()
        )
        created = False
        issued = CourseUser.objects.filter(
            conditions & models.Q(status=CourseUser.UNPAID, exam=exam)
        ).first()
        if not issued:
            issued = CourseUser()
        else:
            created = True
        issued.slug = issued.slug or CourseUser.generate_slug()
        issued.first_name = first_name
        issued.last_name = last_name
        issued.email = email
        issued.exam = exam
        issued.phone = phone
        issued.where_you_heard = where_you_heard or ""
        issued.course_info = {"info": {"personalInfo": personalInfo}}
        return issued, created

    @property
    def students(self):
        return len(self.additional_users) + 1
