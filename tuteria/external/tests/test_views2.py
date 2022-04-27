import datetime
import json
from decimal import Decimal
from mock import patch, call
from test_plus.test import TestCase, RequestFactory

from django.test import override_settings

from config.settings.common import Common
from django.http import QueryDict
from . import factories
from users.tests.factories import UserFactory, LocationFactory, PhoneNumberFactory
from external.forms import ParentRequestForm
from external.models import BaseRequestTutor, PriceDeterminator
from skills.tests.factories import (
    TutorSkillFactory,
    SkillFactory,
    models as skill_models,
)
from pricings.models import Pricing, Region
from mock import patch
from django.shortcuts import reverse
import pytz
from pricings.tests.factories import RegionFactory


@override_settings(
    INSTALLED_APPS=Common.INSTALLED_APPS, MIDDLEWARE_CLASSES=Common.MIDDLEWARE_CLASSES
)
class OveriddenTestCase(TestCase):
    pass


class RequestPostTestCase(OveriddenTestCase):

    def setUp(self):
        self.agent = factories.AgentFactory()
        self.agent2 = factories.AgentFactory()
        rr = RegionFactory(name="Island 1", state="Lagos")
        # self.price_determinant = PriceDeterminator.objects.create(
        #     states={"Lagos": 100}, plans={"Plan 1": 100, "Plan 2": 150, "Plan 3": 250}
        # )
        pricing_factory = factories.PricingFactory(base_price=2000)
        self.region_factory = factories.RegionFactory(
            name="default pricing",
            for_parent=True,
            areas=["Island", "Ikotun"],
            state="Oyo",
        )

        self.price_determinant2 = PriceDeterminator.objects.create(
            states={"Oyo": 100, "Lagos": 100},
            plans={"Plan 1": 100, "Plan 2": 150, "Plan 3": 250},
        )
        # self.region_factory.prices.add(pricing_factory)

        self.user = UserFactory(email="a@o.com")
        self.b_request = factories.BaseRequestTutorFactory(
            email="jonny@example.com",
            available_days=[],
            days_per_week=2,
            hours_per_day=2,
            slug="234ABCDEFDED",
            is_parent_request=True,
            state="Lagos",
        )
        # Region.initialize()
        self.user_details = {
            "last_name": "Oyeniyi",
            "available_days": ["Monday", "Thursday", "Sunday"],
            "number": "+2348166408697",
            "days_per_week": "2",
            "first_name": "Abiola",
            "hours_per_day": "3",
            "where_you_heard": "4",
            "gender": "M",
            "primary_phone_no1": "+2348166408697",
        }
        self.data = {
            "school": "",
            "available_days": ["Monday", "Thursday", "Sunday"],
            "days_per_week": "2",
            "region": "Island 1",
            "request_subjects": "",
            "jss_level": ["JSS 1"],
            "nursery": ["nursery_Elementary Mathematics", "nursery_Phonics"],
            "nursery_level": ["Pre-Nursery"],
            "jss": ["jss_Business Studies", "jss_Agricultural Science"],
            "curriculum": "3",
            "hours_per_day": "3",
            "time_of_lesson": "3:30pm",
        }

    def test_when_parentrequest_form_is_submitted(self):
        url = self.reverse("request_tutor_skill", self.b_request.slug)
        self.post(url, data=self.data)

        self.response_302()
        instance = BaseRequestTutor.objects.get(pk=self.b_request.pk)
        self.assertEquals(instance.status, BaseRequestTutor.ISSUED)
        expected_url = (
            self.reverse("request_pricing_view", instance.slug) + "?referral_code=None"
        )
        self.assertRedirects(
            self.last_response, expected_url, status_code=302, target_status_code=200
        )

    def test_when_parentrequest_form_is_submitted_without_days_per_week_set(self):
        url = self.reverse("request_tutor_skill", self.b_request.slug)
        self.data.pop("days_per_week")
        self.post(url, data=self.data)

        self.response_302()
        instance = BaseRequestTutor.objects.get(pk=self.b_request.pk)
        self.assertEquals(instance.status, BaseRequestTutor.ISSUED)
        expected_url = (
            self.reverse("request_pricing_view", instance.slug) + "?referral_code=None"
        )
        self.assertRedirects(
            self.last_response, expected_url, status_code=302, target_status_code=200
        )

    def test_when_tutor_request_form_is_submitted(self):
        self.b_request.is_parent_request = False
        self.b_request.request_type = 2
        self.b_request.save()
        tutor = UserFactory(email="b@o.com", slug="samadina")
        skills = TutorSkillFactory.create_5_skills(tutor)
        PhoneNumberFactory(owner=tutor, primary=True)

        self.data.pop("region", None)
        self.data.update(
            home_address="Alimosho zone",
            vicinity="Ipaja",
            possible_subjects=skills[0].skill.name,
        )

        url = self.reverse("users:request_second_step", tutor.slug, self.b_request.slug)
        self.post(url, data=self.data)
        self.response_302()

        instance = BaseRequestTutor.objects.get(pk=self.b_request.pk)
        self.assertEquals(instance.status, BaseRequestTutor.ISSUED)
        self.assertIsNone(instance.user)
        self.assertEquals(instance.budget, 0)
        expected_url = (
            self.reverse("request_pricing_view", instance.slug) + "?referral_code=None"
        )
        self.assertRedirects(
            self.last_response, expected_url, status_code=302, target_status_code=200
        )

    def test_price_form_renders_correctly_in_template(self):
        url = self.reverse("request_pricing_view", self.b_request.slug)

        self.add_subject("ICAN")
        self.get(url)
        self.response_200()
        form = self.get_context("object")
        referral_code = self.get_context("referral_code")
        self.assertEquals(form, self.b_request)
        self.assertEquals(referral_code, "")

    def add_subject(self, subject):
        self.b_request.request_subjects = [subject]
        self.b_request.save()

    def test_pricing_view_returns_form_with_errors_when_invalid(self):
        self.add_subject("ICAN")
        url = self.reverse("request_pricing_view", self.b_request.slug)
        data = {
            "first_name": "Abiola",
            "last_name": "Oyeniyi",
            "gender": "",
            "available_days": "Monday,Thursday,Friday",
            "number": "07009976",
            "expectation": (
                '\r\nTell us your goal\r\n\r\nPlease what is your specific goal for this lesson? Be as detailed as poss ible. \r\nE.g. "I want to prepare my son for SAT exams, he needs help with the Math section" or "I want to learn how to play the piano as a beginner" or',
                ' "I need help with assignments for my kids especially in English"',
            ),
            "no_of_students": "1",
            "plan": "Regular",
            "budget": "15600",
            "referral_code": "",
            "primary_phone_no1": "",
            "hours_per_day": "1.5",
            "where_you_heard": "",
        }
        self.post(url, data=data)
        self.response_200()
        form = self.get_context("form")
        self.assertEqual(
            form.errors, {"primary_phone_no1": ["The phone numbers do not match"]}
        )

    @patch("external.services.ex_tasks.email_sent_after_completing_request.delay")
    @patch("external.services.ex_tasks.new_request_notification.delay")
    def test_price_form_is_submitted(
        self, new_request_notification, completed_requests
    ):
        self.add_subject("ICAN")
        url = self.reverse("request_pricing_view", self.b_request.slug)
        data = {
            "first_name": "Abiola",
            "last_name": "Oyeniyi",
            "gender": "",
            "available_days": "Monday,Thursday,Friday",
            "number": "07035209976",
            "expectation": (
                '\r\nTell us your goal\r\n\r\nPlease what is your specific goal for this lesson? Be as detailed as poss ible. \r\nE.g. "I want to prepare my son for SAT exams, he needs help with the Math section" or "I want to learn how to play the piano as a beginner" or',
                ' "I need help with assignments for my kids especially in English"',
            ),
            "no_of_students": "1",
            "plan": "Regular",
            "budget": "15600",
            "referral_code": "",
            "primary_phone_no1": "07035209976",
            "hours_per_day": "1.5",
            "where_you_heard": "",
        }
        # response = self.client.post(url, data=json.dumps(self.user_details),
        #                             content_type='application/json',
        #                             HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        #                             # extra={
        #                             #   'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest',
        #                             #     'CONTENT_TYPE': 'application/json'}
        #                             )
        self.post(url, data=data)
        self.response_302()
        instance = BaseRequestTutor.objects.get(pk=self.b_request.pk)
        self.assertEquals(instance.status, BaseRequestTutor.COMPLETED)
        self.assertEquals(instance.budget, 15600)
        self.assertEquals(instance.hours_per_day, Decimal(1.5))
        self.assertEquals(instance.plan, "Regular")
        self.assertEquals(instance.no_of_students, 1)
        self.assertIsNotNone(instance.expectation)
        self.assertEqual(instance.available_days, ["Monday", "Thursday", "Friday"])
        self.assertEqual(instance.first_name, self.user_details["first_name"])
        self.assertEqual(str(instance.number), "+2347035209976")
        self.assertEqual(instance.user.last_name, self.user_details["last_name"])
        expected_url = self.reverse("redirect_completion", instance.slug)
        self.assertEqual(expected_url, self.last_response.url)

    def test_discount_is_added_to_session_when_visited(self):
        self.b_request.request_subjects = ["ICAN"]
        self.b_request.save()
        url = self.reverse("request_pricing_view", self.b_request.slug)
        session = self.client.session
        session["the_request_url"] = url
        session.save()
        discount_url = self.reverse("discount_giver")
        response = self.client.get(discount_url)
        self.response_302(response)
        self.last_response = response
        self.assertRedirects(response, url, status_code=302, target_status_code=200)
        # import pdb
        # pdb.set_trace()
        self.assertTrue("discount_received" in self.client.session)
        discount = self.client.session["discount_received"]
        self.assertEqual(10, discount)

    def test_referral_code_is_valid_check_offline_code(self):
        factories.ReferralFactory(offline_code="ACDEF")
        url = (
            self.reverse("validate_referral_code", self.b_request.slug)
            + "?referral_code=ACDEF"
        )
        response = self.get(url)
        self.response_200()
        data = response.json()
        self.assertTrue(data["status"])


class PricingViewTestCase(OveriddenTestCase):

    def setUp(self):
        self.region_factory = factories.RegionFactory(
            name="default pricing",
            for_parent=True,
            areas=["Island", "Ikotun"],
            state="Oyo",
        )
        self.b_request = factories.BaseRequestTutorFactory(
            email="jonny@example.com",
            available_days=[],
            days_per_week=2,
            request_subjects=["ICAN"],
            hours_per_day=2,
            slug="BVYR7MY4MZEH",
            is_parent_request=True,
            state="Lagos",
        )

        self.data = {"primary_phone_no1": "+234554678768", "number": "089752472"}

    def test_page_doesnot_throw_error_when_request_available_days_is_none(self):

        resp = self.post(
            self.reverse("request_pricing_view", self.b_request.slug), data=self.data
        )
        self.assertEqual(resp.status_code, 200)

    def test_page_works_fine_when_request_available_days_is_set(self):
        self.b_request.save()
        self.data.update({"available_days": ["monday"]})
        resp = self.post(
            self.reverse("request_pricing_view", self.b_request.slug), data=self.data
        )
        self.assertEqual(resp.status_code, 200)

    def test_page_works_fine_and_it_doesnt_throw_a_type_error_exception(self):
        BaseRequestTutor.objects.filter(slug=self.b_request.slug).update(
            hours_per_day=None, available_days=["moday"]
        )
        b_request = BaseRequestTutor.objects.get(slug=self.b_request.slug)
        resp = self.get(
            f'{self.reverse("request_pricing_view", b_request.slug)}?referral_code=None',
            data=self.data,
        )
        self.assertEqual(resp.status_code, 200)


class RequestPaymentViewTestCase(OveriddenTestCase):

    def setUp(self):
        self.user = UserFactory(email="peter@example.com")
        self.deposit = factories.DepositFactory(order="LTQ1OOAOT71L", user=self.user)

    def test_request_payment_page_return_200(self):
        with self.login(email=self.user.email, password="password"):
            resp = self.get("/request/payment/LTQ1OOAOT71L/")
            self.assertEqual(resp.status_code, 200)

    def test_request_payment_page_does_not_throw_error_when_deposit_money_object_does_not_exit(
        self
    ):
        with self.login(email=self.user.email, password="password"):
            resp = self.get("/request/payment/LTQ1OOAOT71LR/")
            self.assertEqual(resp.status_code, 404)


class SkillRequestViewTestCase(OveriddenTestCase):

    def setUp(self):
        self.user = UserFactory(email="peter@example.com")
        self.user2 = UserFactory(email="peter2@example.com")
        self.phone = PhoneNumberFactory(owner=self.user)
        self.skill = SkillFactory(slug="english-lang")
        self.t = TutorSkillFactory(tutor=self.user2, skill=self.skill)

    def test_skill_request_page_return_200(self):
        with self.login(email=self.user.email, password="password"):
            resp = self.get(
                reverse("skill_only_view", args=[self.t.skill.slug]) + "?region=lagos"
            )
            self.assertEqual(resp.status_code, 302)

    def test_skill_request_page_does_not_throw_error_500_error_when_some_character_are_pass_to_the_url(
        self
    ):
        with self.login(email=self.user.email, password="password"):
            resp = self.get(
                reverse("skill_only_view", args=[self.t.skill.slug]) + '?region="/"'
            )
            self.assertEqual(resp.status_code, 404)
