import datetime
import json
import pytest
from decimal import Decimal
from mock import patch, call
from test_plus.test import TestCase, RequestFactory

from django.test import override_settings

from config.settings.common import Common
from django.http import QueryDict

from external.tests import factories
from users.tests.factories import UserFactory, LocationFactory
from external.forms import ParentRequestForm
from external.models import BaseRequestTutor
from skills.tests.factories import (
    TutorSkillFactory,
    SkillFactory,
    models as skill_models,
)
from pricings.models import Pricing, Region
from mock import patch
from django.shortcuts import reverse
import pytz


class RequestViewTestCase(TestCase):

    def setUp(self):
        self.user = UserFactory(email="a@o.com")
        self.b_request = factories.BaseRequestTutorFactory(
            email=self.user.email,
            slug="234ABCDEFDED",
            is_parent_request=True,
            state="Lagos",
        )
        pricing_factory = factories.PricingFactory(base_price=2000)
        self.region_factory = factories.RegionFactory(
            areas=["Island", "Ikotun"], state="Lagos"
        )
        self.region_factory.prices.add(pricing_factory)

    def test_form_renders_correctly_in_template(self):
        url = self.reverse("request_tutor_skill", self.b_request.slug)
        self.get(url)
        self.response_200()
        form = self.get_context("form")
        self.assertIsInstance(form, ParentRequestForm)


class OnlineRequestTestCase(TestCase):

    def setUp(self):
        nigerian_category = skill_models.Category.objects.create(
            name="Nigerian Languages"
        )
        academic_category = skill_models.Category.objects.create(name="School Subjects")
        s = SkillFactory(name="Yoruba Language")
        y = SkillFactory(name="Igbo Language")
        z = SkillFactory(name="English Language")
        s.categories.add(nigerian_category)
        y.categories.add(nigerian_category)
        z.categories.add(academic_category)
        a = TutorSkillFactory(skill=s, status=skill_models.TutorSkill.ACTIVE)
        LocationFactory(user=a.tutor)
        b = TutorSkillFactory(skill=s, status=skill_models.TutorSkill.ACTIVE)
        LocationFactory(user=b.tutor)
        c = TutorSkillFactory(skill=s, status=skill_models.TutorSkill.ACTIVE)
        LocationFactory(user=c.tutor)
        d = TutorSkillFactory(skill=z, status=skill_models.TutorSkill.ACTIVE)
        LocationFactory(user=d.tutor)
        s.save()
        self.data = {
            "possible_subjects": "Yoruba Language",
            "first_name": "Abiola",
            "the_timezone": "GMT-0",
            "online_id": "gbozee@gmail.com",
            "expectation": "jfowje owjeo wjeoj weojw ",
            "email": u"gbozee@gmail.com",
            "no_of_students": "1",
            "country": "US",
            "country_state": u"London",
        }

    def test_when_form_is_submitted_with_no_erros(self):
        url = self.reverse("language_lessons")
        self.post(url, data=self.data)
        self.response_302()
        instance = BaseRequestTutor.objects.first()
        self.assertIsNotNone(instance.user)
        self.assertEquals(instance.status, BaseRequestTutor.ISSUED)
        self.assertEqual(instance.request_type, 3)
        self.assertIsNotNone(instance.slug)
        expected_url = (
            self.reverse("request_tutor_skill_online", instance.slug)
            + "?referral_code="
        )
        self.assertRedirects(
            self.last_response, expected_url, status_code=302, target_status_code=200
        )
        self.get(expected_url)
        self.response_200()
        self.assertContext("object", instance)
        self.assertContext("teach_all_subject", True)
        self.assertContext("currency", "$")

    def test_when_academic_online_form_is_submitted_with_no_erros(self):
        url = self.reverse("online_lessons")
        self.data.update({"possible_subjects": "English Language"})
        self.post(url, data=self.data)
        self.response_302()
        instance = BaseRequestTutor.objects.first()
        self.assertIsNotNone(instance.user)
        self.assertEquals(instance.status, BaseRequestTutor.ISSUED)
        self.assertEqual(instance.request_type, 3)
        self.assertIsNotNone(instance.slug)
        expected_url = (
            self.reverse("request_tutor_skill_online", instance.slug)
            + "?referral_code="
        )
        self.assertRedirects(
            self.last_response, expected_url, status_code=302, target_status_code=200
        )
        self.get(expected_url)
        self.response_200()
        self.assertContext("object", instance)
        self.assertContext("teach_all_subject", True)
        self.assertContext("currency", "$")

    def test_when_no_tutors_are_found(self):
        url = self.reverse("language_lessons")
        new_data = self.data
        new_data.update({"possible_subjects": "Igbo Language"})
        self.post(url, data=new_data)
        self.response_302()
        instance = BaseRequestTutor.objects.first()
        self.assertIsNotNone(instance.user)
        self.assertEqual(instance.user.country, "US")
        self.assertEquals(instance.status, BaseRequestTutor.COMPLETED)
        expected_url = (
            self.reverse("online_request_completed", instance.slug) + "?referral_code="
        )
        self.assertRedirects(
            self.last_response, expected_url, status_code=302, target_status_code=200
        )


class RequestPostTestCase(TestCase):

    def setUp(self):
        self.user = UserFactory(email="a@o.com")
        self.b_request = factories.BaseRequestTutorFactory(
            email="jonny@example.com",
            available_days=[],
            slug="234ABCDEFDED",
            is_parent_request=True,
            state="Lagos",
        )
        Region.initialize()
        self.user_details = {
            "last_name": u"Oyeniyi",
            u"available_days": [u"Monday", u"Thursday", u"Sunday"],
            "number": u"+2348166408697",
            "days_per_week": "2",
            "first_name": u"Abiola",
            u"hours_per_day": u"3",
            u"where_you_heard": u"4",
            "gender": "M",
            "primary_phone_no1": u"+2348166408697",
        }
        self.data = {
            "school": "",
            u"available_days": [u"Monday", u"Thursday", u"Sunday"],
            "days_per_week": "2",
            "region": "Island 1",
            "request_subjects": "",
            "jss_level": [u"JSS 1"],
            "nursery": [u"nursery_Elementary Mathematics", u"nursery_Phonics"],
            "nursery_level": [u"Pre-Nursery"],
            "jss": [u"jss_Business Studies", u"jss_Agricultural Science"],
            "curriculum": u"3",
            u"hours_per_day": u"3",
            "time_of_lesson": u"3:30pm",
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

    def test_when_tutor_request_form_is_submitted(self):
        self.b_request.is_parent_request = False
        self.b_request.request_type = 2
        self.b_request.save()
        tutor = UserFactory(email="b@o.com", slug="samadina")
        skills = TutorSkillFactory.create_5_skills(tutor)
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
            u"first_name": u"Abiola",
            u"last_name": u"Oyeniyi",
            u"gender": u"",
            u"available_days": u"Monday,Thursday,Friday",
            u"number": u"07009976",
            u"expectation": (
                u'\r\nTell us your goal\r\n\r\nPlease what is your specific goal for this lesson? Be as detailed as poss ible. \r\nE.g. "I want to prepare my son for SAT exams, he needs help with the Math section" or "I want to learn how to play the piano as a beginner" or',
                ' "I need help with assignments for my kids especially in English"',
            ),
            u"no_of_students": u"1",
            u"plan": u"Regular",
            u"budget": u"15600",
            u"referral_code": u"",
            "primary_phone_no1": "",
            u"hours_per_day": u"1.5",
            u"where_you_heard": u"",
        }
        self.post(url, data=data)
        self.response_200()
        form = self.get_context("form")
        self.assertEqual(
            form.errors, {"primary_phone_no1": [u"The phone numbers do not match"]}
        )

    @patch("external.services.ex_tasks.email_sent_after_completing_request.delay")
    @patch("external.services.ex_tasks.new_request_notification.delay")
    def test_price_form_is_submitted(
        self, new_request_notification, completed_requests
    ):
        self.add_subject("ICAN")
        url = self.reverse("request_pricing_view", self.b_request.slug)
        data = {
            u"first_name": u"Abiola",
            u"last_name": u"Oyeniyi",
            u"gender": u"",
            u"available_days": u"Monday,Thursday,Friday",
            u"number": u"07035209976",
            u"expectation": (
                u'\r\nTell us your goal\r\n\r\nPlease what is your specific goal for this lesson? Be as detailed as poss ible. \r\nE.g. "I want to prepare my son for SAT exams, he needs help with the Math section" or "I want to learn how to play the piano as a beginner" or',
                ' "I need help with assignments for my kids especially in English"',
            ),
            u"no_of_students": u"1",
            u"plan": u"Regular",
            u"budget": u"15600",
            u"referral_code": u"",
            u"primary_phone_no1": u"07035209976",
            u"hours_per_day": u"1.5",
            u"where_you_heard": u"",
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

    @pytest.mark.webtest
    def test_referral_code_is_valid_check_offline_code(self):
        factories.ReferralFactory(offline_code="ACDEF")
        url = (
            self.reverse("validate_referral_code", self.b_request.slug)
            + "?referral_code=ACDEF"
        )
        self.get(url)
        self.response_200()
        data = self.last_response.json()
        self.assertTrue(data["status"])

    @pytest.mark.webtest
    def test_referral_code_is_valid_check_referral_code(self):
        factories.ReferralFactory(referral_code="ABI32322")
        url = (
            self.reverse("validate_referral_code", self.b_request.slug)
            + "?referral_code=ABI32322"
        )
        self.get(url)
        self.response_200()
        data = self.last_response.json()
        self.assertTrue(data["status"])

    @pytest.mark.webtest
    def test_referral_code_is_invalid(self):
        url = (
            self.reverse("validate_referral_code", self.b_request.slug)
            + "?referral_code=ACDEF"
        )
        self.get(url)
        self.response_200()
        data = self.last_response.json()
        self.assertFalse(data["status"])


class PrimeRequestViewTestCase(TestCase):

    def setUp(self):
        self.url = url = self.reverse("prime-request")

    def test_when_form_is_submitted_with_no_erros(self):
        data = self.default_form_data()
        response = self.post(self.url, data=data)
        self.assertIn("request/payment/", response.url)
        record = BaseRequestTutor.objects.last()
        self.assertIsNotNone(record.slug)
        self.assertEqual(
            record.request_subjects,
            [
                "Phonics",
                "Literacy & Numeracy",
                "Basic Mathematics",
                "English Language",
                "Basic Sciences",
                "Quantitative Reasoning",
                "Verbal Reasoning",
            ],
        )
        self.assertEqual(record.classes, ["Nursery", "Primary"])
        self.assertEqual(record.budget, 25000)
        self.assertEqual(record.available_days, ["Monday", "Tuesday", "Wednesday"])
        self.assertEqual(record.request_type, 4)

    def test_when_form_is_submitted_with_errors(self):
        data = self.default_form_data()
        data["subjects"].extend(
            ["Chemistry (SSS)", "Commerce (SSS)", "English Language (JSS - SSS)"]
        )
        response = self.post(self.url, data=data)
        self.response_200(response)
        form = response.context_data["form"]
        self.assertEqual(form.errors["subjects"], ["You selected more than 3 subjects"])

    def default_form_data(self, **kwargs):
        data = {
            "no_of_students": "1",
            "hours_per_day": "2",
            "days_per_week": "4",
            "lesson_occurence": "3",
            "multiple_teachers": False,
            "subjects": [
                "Phonics, Literacy & Numeracy etc. (Nursery)",
                "Math, English, Science, Quantitatives, Verbal (Primary)",
            ],
            "time_of_lesson": "2pm",
            "first_name": "Danny",
            "gender": "M",
            "expectation": "lorem*2323j23 2jo32 o32j o23j2",
            "last_name": "Devator",
            "email": "danny@example.com",
            "number": "07035209922",
            "home_address": "20 Irabor Street Ikeja",
            "state": "Lagos",
        }
        data.update(kwargs)
        return data


class MockRequest:

    def __init__(self, response, **kwargs):
        self.response = response
        self.overwrite = False
        if kwargs.get("overwrite"):
            self.overwrite = True
        self.status_code = kwargs.get("status_code", 200)

    @classmethod
    def raise_for_status(cls):
        pass

    def json(self):
        if self.overwrite:
            return self.response
        return {"data": self.response}


from hubspot.models import HubspotOwner


class TestHubspotWebHookTestCase(TestCase):

    def setUp(self):
        u = HubspotOwner.objects.create(email="a@example.com", hubspot_id=23)
        ag = factories.AgentFactory(email=u.email)
        a = factories.BaseRequestTutorFactory(
            booking=None,
            email="one@example.com",
            slug="234ABCDEFDE1",
            is_parent_request=True,
            state="Lagos",
            agent=ag,
            hubspot_deal_id=21,
        )
        b = factories.BaseRequestTutorFactory(
            email="two@example.com",
            booking=None,
            slug="234ABCDEFDE2",
            is_parent_request=True,
            state="Lagos",
            agent=ag,
            hubspot_deal_id=20,
        )
        c = factories.BaseRequestTutorFactory(
            email="three@example.com",
            booking=None,
            slug="234ABCDEFDE3",
            is_parent_request=True,
            agent=ag,
            state="Lagos",
        )
        d = factories.BaseRequestTutorFactory(
            booking=None,
            email="four@example.com",
            slug="234ABCDEFDE34",
            is_parent_request=True,
            state="Lagos",
            sent_reminder=True,
            agent=ag,
            hubspot_deal_id=28,
        )
        BaseRequestTutor.objects.filter(pk__in=[a.pk, b.pk, c.pk, d.pk]).update(
            modified=datetime.datetime(2017, 10, 12, 1, 2, 30),
            created=datetime.datetime(2017, 10, 10, 1, 2, 30),
        )
        self.patcher = patch("hubspot.requests.post")
        self.mock_post = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_records_in_db_are_created_correctley(self):
        self.assertEqual(BaseRequestTutor.objects.count(), 4)
        self.assertEqual(BaseRequestTutor.objects.follow_up().count(), 2)

    def test_reminder_sent_to_contact_about_deal(self):
        self.mock_post.return_value = MockRequest({}, status_code=200, overwrite=True)
        response = self.client.post(
            reverse("hubspot:mailgun_open"),
            data={
                "event": "opened",
                "recipient": "Biola",
                "timestamp": (
                    datetime.datetime(2017, 10, 14, 1, 2, 30, tzinfo=pytz.utc)
                    - datetime.datetime(1970, 1, 1, tzinfo=pytz.utc)
                ).total_seconds(),
                "tag": "fhello_world",
            },
        )
        self.assertTrue(self.mock_post.called)
        self.assertEqual(self.mock_post.call_count, 4)

    def test_clicked_event_is_triggered(self):
        self.mock_post.return_value = MockRequest({}, status_code=200, overwrite=True)
        self.client.post(
            reverse("hubspot:mailgun_open"),
            data={
                "event": "clicked",
                "recipient": "Biola",
                "timestamp": (
                    datetime.datetime(2017, 10, 14, 1, 2, 30, tzinfo=pytz.utc)
                    - datetime.datetime(1970, 1, 1, tzinfo=pytz.utc)
                ).total_seconds(),
                "tag": "fhello_world",
            },
        )
        self.assertTrue(self.mock_post.called)
        self.assertEqual(self.mock_post.call_count, 2)

    def test_only_one_is_called_on_opened_email(self):
        BaseRequestTutor.objects.filter(email="one@example.com").update(
            modified=datetime.datetime(2017, 10, 13, 1, 2, 30)
        )
        response = self.client.post(
            reverse("hubspot:mailgun_open"),
            data={
                "event": "opened",
                "recipient": "Biola",
                "timestamp": (
                    datetime.datetime(2017, 10, 14, 1, 2, 30, tzinfo=pytz.utc)
                    - datetime.datetime(1970, 1, 1, tzinfo=pytz.utc)
                ).total_seconds(),
                "tag": "fhello_world",
            },
        )
        self.assertTrue(self.mock_post.called)
        self.assertEqual(self.mock_post.call_count, 3)


@override_settings(
    INSTALLED_APPS=Common.INSTALLED_APPS, MIDDLEWARE_CLASSES=Common.MIDDLEWARE_CLASSES
)
class DeterminePriceEarnableTestCase(TestCase):

    def test_price_earnable(self):
        url = reverse("determine_price_earnable")
        data = {
            "number_of_weeks": 4,
            "days_per_week": 3,
            "number_of_tutors": 1,
            "number_of_hour": 2,
            "hourly_rate": 3750,
            "number_of_students": 1,
            "number_of_days": 2,
            "plan": "plan-3",
            "state": "lagos",
        }
        response = self.client.post(url, data)
        # import pdb; pdb.set_trace()
        # self.assertEqual(response.content, b'{"real_hour": 11250.0, "real price": 50300999.99999999, "price": 4527089999999.999}')
