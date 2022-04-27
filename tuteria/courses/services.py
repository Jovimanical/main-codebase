import typing

from django.utils import timezone
from courses.models import CourseException, CourseUser
from users.models import User
from config.utils import Result
from django.utils.crypto import get_random_string

from django.db import models


class CourseService:
    @classmethod
    def get_course_info(cls, slug):
        issued: CourseUser = CourseUser.objects.filter(slug=slug).first()
        if not issued:
            return Result(
                errors={"msg": "Instance with slug does not exist"}, status_code=400
            )
        return Result(
            data={
                "slug": issued.slug,
                "personalInfo": issued.personal_info,
                "id": issued.thinkific_id,
                "paymentInfo": {
                    "status": issued.get_status_display(),
                    "amount": to_places(issued.amount),
                    "amount_paid": to_places(issued.amount_paid),
                    "discount": issued.discount,
                },
                "plan": issued.plan,
                "referrers": issued.additional_users,
            }
        )

    @classmethod
    def format_response(cls, instance: CourseUser):
        return {
            "slug": instance.slug,
            "personalInfo": instance.personal_info,
            "url": instance.thinkific_url,
            "id": instance.thinkific_id,
            "courses": [
                {
                    "slug": x.slug,
                    "plan": x.plan,
                    "paymentInfo": {
                        "status": x.get_status_display(),
                        "amount": to_places(x.amount),
                        "amount_paid": to_places(x.amount_paid),
                        "discount": x.discount,
                    },
                }
                for x in CourseUser.objects.filter(email=instance.email).all()
            ],
            "referrers": instance.additional_users,
        }

    @classmethod
    def update(self, body):
        slug = body.get("slug")
        additional_users = body.get("additional_users") or []
        payment_info = body.get("paymentInfo") or {}
        plan = body.get("plan") or {}
        thinkific = body.get("thinkific") or []
        instance: CourseUser = CourseUser.objects.filter(slug=slug).first()
        if not instance:
            return Result(errors={"msg": "Course request with slug does not exists"})
        # when to update payment
        if additional_users:
            instance.course_info["additional_users"] = additional_users
        date_payed = timezone.now()
        referral = body.get("referral") or {}
        if referral:
            code = referral.get("code")
            discount = referral.get("discount") or 0
            existing_user: CourseUser = CourseUser.objects.filter(
                phone=f"+{code.replace('+','')}"
            ).first()
            can_use = False
            if existing_user:
                # check if user hasn't used code before
                used = CourseUser.objects.filter(
                    email=instance.email, referrer=existing_user
                ).exists()
                if not used:
                    can_use = True
            if can_use:
                instance.referrer = existing_user
                existing_user.update_referral_credit(discount)
                instance.amount = instance.amount - discount
                instance.discount = discount
                instance.save()

        if payment_info:
            instance.amount_paid = payment_info.get("amount_paid") or 0
            instance.amount = payment_info.get("amount") or instance.amount
            opt = {"online": 1, "bank transfer": 2}
            try:
                instance.payment_medium = opt[payment_info.get("payment_medium")]
            except KeyError:
                instance.payment_medium = 1
            instance.discount = payment_info.get("discount") or 0
            instance.status = CourseUser.PAID
            instance.payment_date = date_payed
        if plan:
            instance.course_info["info"]["plan"] = plan
        instance.save()
        if payment_info:
            # create additional_users
            for i in instance.additional_users:
                v, _ = CourseUser.create_instance(i, instance.exam)
                v_plan = i.get("plan")
                v.amount = v_plan.get("amount")
                v.discount = v_plan.get("discount") or 0
                v.course_info = {"info": {**v.course_info["info"], **i}}
                v.status = CourseUser.PAID
                v.payment_date = date_payed
                v.with_others = True
                v.referrer = instance
                v.save()

        if thinkific:
            key_value_pair = {x["email"]: x["id"] for x in thinkific}
            emails = [x["email"] for x in thinkific]
            instances: typing.List[CourseUser] = CourseUser.objects.filter(
                email__in=emails, status=CourseUser.PAID
            ).all()
            for i in instances:
                _id = key_value_pair[i.email]
                i.get_or_create_user(_id)

        instance: CourseUser = CourseUser.objects.get(pk=instance.pk)
        return Result(data=self.format_response(instance))

    @classmethod
    def authenticate_login_code(self, body):
        email = body.get("email")
        code = body.get("code")
        found = email or code
        value = "email" if not email else "code"
        if not found:
            return Result(errors={"msg": f"No {value} passed"}, status_code=400)
        found_user: User = User.objects.filter(email__iexact=email).first()
        if not found_user:
            # check if the email/phone number has placed a request before
            instance: CourseUser = CourseUser.objects.filter(
                status=CourseUser.UNPAID, email__iexact=email
            ).first()
            if not instance:
                return Result(errors={"msg": "Could not find user"}, status_code=400)
            if instance.login_code.upper() != code.upper():
                return Result(errors={"msg": "Invalid code"}, status_code=400)
            instance.set_login_code()
            return Result(data=self.format_response(instance))
        if not found_user:
            return Result(errors={"msg": "Could not find user"}, status_code=400)
        instance = found_user.video_courses.first()
        if not instance:
            return Result(
                errors={"msg": "User doesn't have any course"}, status_code=400
            )
        found_user.data_dump = {**(found_user.data_dump or {}), "login_code": code}
        found_user.save()
        return Result(data=self.format_response(instance))

    @classmethod
    def generate_login_code(self, body):
        email = body.get("email")
        number = body.get("number")
        found = email or number
        if not found:
            return Result(errors={"msg": "No email or number passed"}, status_code=400)
        condition = models.Q(email__iexact=email) | models.Q(phone__iexact=number)
        found_user: User = User.objects.filter(email__iexact=email).first()
        code = get_random_string(6)
        if not found_user:
            # check if the email/phone number has placed a request before
            instance: CourseUser = CourseUser.objects.filter(
                condition & models.Q(status=CourseUser.UNPAID)
            ).first()
            if not instance:
                return Result(errors={"msg": "Could not find user"}, status_code=400)
            instance.set_login_code(code)
            return Result(data={"code": code, "email": instance.email})
        if not found_user:
            return Result(errors={"msg": "Could not find user"}, status_code=400)

        found_user.save_login_code(code)
        return Result(data={"code": code, "email": found_user.email})

    @classmethod
    def initialize(self, body):
        personalInfo = body.get("personalInfo")
        exam = body.get("exam")
        try:
            issued, created = CourseUser.create_instance(personalInfo, exam)
        except CourseException as e:
            return Result(errors={"msg": e.msg}, status_code=400)
        if created:
            pass
        issued.course_info = {"info": body}
        plan_info = body.get("plan")
        amount = plan_info.get("amount") or 0
        issued.amount = amount
        issued.save()
        return Result(
            data={
                "slug": issued.slug,
                "personalInfo": issued.personal_info,
                "paymentInfo": {
                    "status": issued.get_status_display(),
                    "amount": to_places(issued.amount),
                    "amount_paid": to_places(issued.amount_paid),
                    "discount": issued.discount,
                },
                "plan": plan_info,
            }
        )


def to_places(number):
    return float("%.2f" % number)
