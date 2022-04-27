from test_plus.test import TestCase
from skills.tests.factories import (
    SkillFactory,
    TutorSkillFactory,
    SkillWithStateFactory,
    CategoryFactory,
)
from users.tests.factories import UserFactory, LocationFactory, RegionFactory
from skills.models import TutorSkill
from mock import patch, call
from pricings.models import Region


class ParentRequestFlowTestCase(TestCase):
    base_url = ""

    def setUp(self):
        Region.initialize()

    def test_visits_parent_url_to_place_request(self):
        url = self.base_url + "/home-tutors-in-nigeria/"
        response = self.client.post(
            url,
            data={
                "home_address": "Gwagwalada Road",
                "vicinity": "Gwagwalada",
                "state": "Abuja",
                "class_urgency": "immediately",
                "no_of_students": 2,
                "number": "07035209976",
                "tutoring_location": 1,
                "email": "gbozee@example.com",
            },
        )
        self.response_302(response)
        second_url = response.url
        # Test the second page loads without any issue
        response = self.client.get(second_url)
        self.response_200(response)
        response = self.post(
            second_url,
            data={
                "classes": [],
                "class_of_child": u"",
                "school": u"",
                "sss_level": [],
                "days_per_week": u"3",
                "region": u"Zone C",
                "curriculum": u"3",
                "primary_level": [],
                "request_subjects": [],
                "sss": [],
                "primary": [],
                "available_days": [u"Monday", u"Thursday"],
                "jss_level": [],
                "nursery": [u"nursery_Elementary Mathematics", u"nursery_Phonics"],
                "music_language": [],
                "music_level": u"",
                "nursery_level": [u"Nursery 1"],
                "jss": [],
                "hours_per_day": u"2.5",
                "time_of_lesson": u"5:30pm",
            },
        )
        self.response_302(response)
        pricing_url = response.url
        response = self.client.get(pricing_url)
        self.response_200(response)
        response = self.client.post(
            pricing_url,
            data={
                "first_name": u"Abiola",
                "last_name": u"Oyeniyi",
                "gender": u"",
                "available_days": [u"Monday", u"Thursday"],
                "number": "+2347035209976",
                "expectation": u"j wjoe jow jeowje wje jweo jwoje ojew ojwe o",
                "no_of_students": 1,
                "plan": u"Plan 2",
                "budget": "26300",
                "referral_code": u"",
                "primary_phone_no1": u"+2347035209976",
                "hours_per_day": "2.5",
                "where_you_heard": u"",
            },
        )
        self.response_302(response)
        payment_url = response.url


class SkillRequestTestCase(TestCase):
    base_url = ""

    def setUp(self):
        self.user = UserFactory(teach_online=True, email="a@o.com")
        region = RegionFactory(name="Island 1", state="Lagos", areas=["Surulere"])
        LocationFactory(user=self.user, region=region)
        a_cat = CategoryFactory(name="Nigerian Languages")
        self.skill = SkillFactory(name="Yoruba Language", slug="yoruba-language")
        self.skill.categories.add(a_cat)
        SkillWithStateFactory(skill=self.skill, online=True)
        self.patcher = patch("external.views.oldview.PayStack")
        self.mock_util = self.patcher.start()
        self.mock_paystack = self.mock_util.return_value

    def tearDown(self):
        self.patcher.stop()

    def test_visit_skill_url_to_place_request_no_online_tutors(self):
        url = self.base_url + "/yoruba-language-tutors/"
        response = self.client.post(
            url,
            data={
                "home_address": "Gwagwalada Road",
                "vicinity": "Gwagwalada",
                "state": "Abuja",
                "class_urgency": "immediately",
                "no_of_students": 2,
                "number": "07035209976",
                "tutoring_location": "user",
                "email": "gbozee@example.com",
            },
        )
        self.response_302(response)
        second_url = response.url
        self.assertIn("request/second-step/", second_url)

    def test_visit_skill_url_when_online_tutors(self):
        ts = TutorSkillFactory(
            skill=self.skill, status=TutorSkill.ACTIVE, tutor=self.user
        )
        url = self.base_url + "/yoruba-language-tutors/"
        response = self.client.post(
            url,
            data={
                "home_address": "Gwagwalada Road",
                "vicinity": "Surulere",
                "state": "Lagos",
                "area": "Surulere",
                "class_urgency": "immediately",
                "no_of_students": 2,
                "number": "07035209976",
                "email": "gbozee@example.com",
                "tutoring_location": "user",
            },
        )
        # import pdb; pdb.set_trace()
        self.response_302(response)
        second_url = response.url
        self.assertIn("request/select-tutor", second_url)
        response = self.client.get(second_url)
        self.response_200(response)
        context_data = response.context_data
        self.assertIn("object", context_data.keys())
        instance = context_data["object"]
        try:
            instance_slug = instance["slug"]
        except Exception:
            instance_slug = instance.slug

        tutors = context_data.get("ts_skills")
        self.assertEqual(len(tutors), 1)
        tutor = tutors[0]
        new_url = self.reverse(
            "users:with_skill_in_url", tutor.tutor.slug, ts.pk, instance_slug
        )
        response = self.client.get(new_url)
        new_url = response.url
        response = self.client.post(
            new_url,
            data={
                "days_per_week": u"3",
                "hours_per_day": u"2.5",
                "available_days": [u"Monday", u"Thursday"],
                "first_name": "Abiola",
                "classes": "Nursery 1",
                "request_subjects": ["Yoruba Language"],
                "possible_subjects": "Yoruba Language",
                "last_name": "Johnny",
                "expectation": "joewjw ojow ejowe jowej w",
                "time_of_lesson": u"5:30pm",
            },
        )
        self.response_302(response)
        payment_url = response.url
        processing_fee_url = self.reverse("client_request_completed", instance_slug)
        response = self.client.get(processing_fee_url)
        self.response_200(response)
        paystack_validation_url = self.reverse(
            "validate_paystack", instance_slug, "ADESGES"
        )

        self.mock_paystack.validate_transaction.return_value = {
            "amount_paid": 20000,
            "authorization_code": "SSESGS",
        }
        respnse = self.client.get(paystack_validation_url)
        self.mock_paystack.validate_transaction.assert_called_once_with("ADESGES")
        self.response_200(response)
        response = self.client.get(payment_url)
        instance = response.context_data["object"]
        try:
            instance_order = instance["order"]
        except Exception:
            instance_order = instance.order

        payment_validation_url = self.reverse(
            "validate_paystack", instance_order, "SESGES"
        )
        response = self.client.get(payment_validation_url)
        self.response_200(response)
        self.assertTrue(response.json()["status"])

    def test_visit_online_parent_request(self):
        url = self.base_url + "/nigerian-languages/"
        ts = TutorSkillFactory(
            skill=self.skill, status=TutorSkill.ACTIVE, tutor=self.user
        )
        response = self.client.post(
            url,
            data={
                "possible_subjects": "Yoruba Language",
                "country": "US",
                "country_state": "New York",
                "the_timezone": "GMT-8",
                "first_name": "Dotun",
                "online_id": "xfactor",
                "no_of_students": 2,
                "email": "gbozee@example.com",
                "expectation": "jeowje ojwe owjeow jeojew owej ",
            },
        )
        self.response_302(response)
        second_url = response.url
        response = self.client.get(second_url)
        self.response_200(response)
        context_data = response.context_data
        self.assertIn("object", context_data.keys())
        instance = context_data["object"]
        try:
            instance_slug = instance["slug"]
        except Exception:
            instance_slug = instance.slug
        tutors = context_data.get("ts_skills")
        self.assertEqual(len(tutors), 1)
        new_url = self.reverse(
            "dollar_online_payment", tutors[0].tutor.slug, instance_slug
        )
        response = self.client.get(new_url)
        self.response_302(response)
        payment_url = response.url
        processing_fee_url = self.reverse("client_request_completed", instance_slug)
        response = self.client.get(processing_fee_url)
        self.response_200(response)
        paystack_validation_url = self.reverse(
            "validate_paystack", instance_slug, "ADESGES"
        )

        self.mock_paystack.validate_transaction.return_value = {
            "amount_paid": 1000000,
            "authorization_code": "SSESGS",
        }
        respnse = self.client.get(paystack_validation_url)
        self.mock_paystack.validate_transaction.assert_called_once_with("ADESGES")
        self.response_200(response)
        response = self.client.get(payment_url)
        instance = response.context_data["object"]
        try:
            instance_order = instance["order"]
        except Exception:
            instance_order = instance.order
        payment_validation_url = self.reverse(
            "validate_paystack", instance_order, "SESGES"
        )
        response = self.client.get(payment_validation_url)
        # import pdb; pdb.set_trace()
        self.response_200(response)
        self.assertTrue(response.json()["status"])
