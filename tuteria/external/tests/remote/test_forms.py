from test_plus.test import TestCase, RequestFactory
from external.forms import remote_forms
from external.forms import forms1 as local_forms
from django import forms
from pricings.models import Region
from decimal import Decimal
import requests
from django.conf import settings


class HomeParentRequestFormTestCase(TestCase):

    def test_remote_and_local_have_the_same_fields(self):
        old_instance = local_forms.HomeParentRequestForm()
        new_instance = remote_forms.HomeParentRequestForm()
        self.assertEqual(
            sorted(old_instance.fields.keys()), sorted(new_instance.fields.keys())
        )
        self.assertTrue(new_instance.fields["state"].required)
        self.assertTrue(new_instance.fields["vicinity"].required)
        self.assertTrue(new_instance.fields["home_address"].required)
        self.assertTrue(new_instance.fields["email"].required)
        self.assertEqual(
            new_instance.fields["longitude"].widget.__class__, forms.HiddenInput
        )
        self.assertEqual(
            new_instance.fields["latitude"].widget.__class__, forms.HiddenInput
        )

    def test_remote_and_local_produce_the_same_error_messages(self):
        data = {"state": "Lagos", "vicinity": "Ikeja"}
        old_instance = local_forms.HomeParentRequestForm(data)
        new_instance = remote_forms.HomeParentRequestForm(data)
        self.assertFalse(old_instance.is_valid())
        self.assertFalse(new_instance.is_valid())
        self.assertEqual(old_instance.errors, new_instance.errors)
        data.update(
            {
                "no_of_students": 2,
                "email": "gbozee@example.com",
                "latitude": 2.23232,
                "number": "+2347035209963",
                "class_urgency": "immediately",
                "longitude": 1.00232,
                "home_address": "jowejwo ejowe joew j",
            }
        )
        old_instance = local_forms.HomeParentRequestForm(data)
        new_instance = remote_forms.HomeParentRequestForm(data)
        self.assertTrue(old_instance.is_valid())
        self.assertTrue(new_instance.is_valid())

    def test_takes_an_instance_object(self):
        new_instance = remote_forms.HomeParentRequestForm(
            instance={
                "no_of_students": 2,
                "email": "gbozee@example.com",
                "latitude": 2.23232,
                "number": "+2347035209963",
                "class_urgency": "immediately",
                "longitude": 1.00232,
                "home_address": "jowejwo ejowe joew j",
            }
        )
        self.assertFalse(new_instance.is_valid())


class TutorRequestForm1TestCase(TestCase):

    def test_remote_and_local_have_the_same_fields(self):
        old_instance = local_forms.TutorRequestForm1()
        new_instance = remote_forms.TutorRequestForm1()
        self.assertEqual(
            sorted(old_instance.fields.keys()), sorted(new_instance.fields.keys())
        )
        self.assertTrue(new_instance.fields["state"].required)
        self.assertTrue(new_instance.fields["vicinity"].required)
        self.assertTrue(new_instance.fields["home_address"].required)
        self.assertTrue(new_instance.fields["email"].required)
        self.assertEqual(
            new_instance.fields["longitude"].widget.__class__, forms.HiddenInput
        )
        self.assertEqual(
            new_instance.fields["latitude"].widget.__class__, forms.HiddenInput
        )

    def test_remote_and_local_produce_the_same_error_messages(self):
        data = {"state": "Lagos", "vicinity": "Ikeja"}
        opts_choices = {"subject": (("English Language", "English Language"),)}
        old_instance = local_forms.TutorRequestForm1(data, opts_choices=opts_choices)
        new_instance = remote_forms.TutorRequestForm1(data, opts_choices=opts_choices)
        self.assertFalse(old_instance.is_valid())
        self.assertFalse(new_instance.is_valid())
        self.assertEqual(old_instance.errors, new_instance.errors)
        data.update(
            {
                "no_of_students": 2,
                "email": "gbozee@example.com",
                "latitude": 2.23232,
                "subject": "English Language",
                "number": "+2347035209963",
                "class_urgency": "immediately",
                "longitude": 1.00232,
                "home_address": "jowejwo ejowe joew j",
            }
        )
        old_instance = local_forms.TutorRequestForm1(data, opts_choices=opts_choices)
        new_instance = remote_forms.TutorRequestForm1(data, opts_choices=opts_choices)
        self.assertTrue(old_instance.is_valid())
        self.assertTrue(new_instance.is_valid())


class SecondFormTestCase(TestCase):

    def create_sample_request(self, data):
        data = requests.post(
            "{}requests/create_record/".format(settings.REQUEST_SERVICE_URL), json=data
        )
        data.raise_for_status()
        return data.json()

    def setUp(self):
        self.b_request = self.create_sample_request(
            {
                "request_type": 1,
                "no_of_students": 1,
                "expectation": "Literacy and fluency in written and spoken igbo.",
                "home_address": "Graceland Estate, Ajah",
                "longitude": "3.5816073",
                "latitude": "6.4693736",
                "first_name": "Victor",
                "last_name": "Kalu",
                "number": "+2348166401989",
                "region": None,
                "vicinity": "Lagos",
                "where_you_heard": "6",
                "class_urgency": "2_weeks",
                "slug": "UHLYU11YN3OW",
                "is_parent_request": False,
            }
        )
        self.data = {
            "school": "",
            u"available_days": [u"Monday", u"Thursday", u"Sunday"],
            "days_per_week": "2",
            "request_subjects": "",
            "jss_level": [u"JSS 1"],
            "nursery": [u"nursery_Elementary Mathematics", u"nursery_Phonics"],
            "nursery_level": [u"Pre-Nursery"],
            "jss": [u"jss_Business Studies", u"jss_Agricultural Science"],
            "curriculum": u"3",
            u"hours_per_day": u"3",
            u"csrfmiddlewaretoken": u"x18do661iV5ymBoL1jutZpynnT6ivHhC",
            "time_of_lesson": u"3:30pm",
        }


class ParentRequestFormTestCase(SecondFormTestCase):

    def setUp(self):
        super(ParentRequestFormTestCase, self).setUp()
        Region.initialize()

    def test_remote_and_local_have_the_same_fields(self):
        old_instance = local_forms.ParentRequestForm()
        new_instance = remote_forms.ParentRequestForm(instance=self.b_request)
        self.assertEqual(
            sorted(old_instance.fields.keys()), sorted(new_instance.fields.keys())
        )

    def test_form_without_user_details_can_be_submitted_correctly(self):
        request_form = remote_forms.ParentRequestForm(
            self.data, instance=self.b_request
        )
        request_form.is_valid()
        self.assertEqual(request_form.errors, {})

    def test_form_throws_error_when_pricing_exists_for_region_but_not_selected(self):
        new_data = self.create_sample_request(
            {
                "request_type": 1,
                "no_of_students": 1,
                "expectation": "Literacy and fluency in written and spoken igbo.",
                "home_address": "Graceland Estate, Ajah",
                "longitude": "3.5816073",
                "latitude": "6.4693736",
                "first_name": "Victor",
                "last_name": "Kalu",
                "number": "+2348166401989",
                "region": None,
                "vicinity": "Lagos",
                "where_you_heard": "6",
                "class_urgency": "2_weeks",
                "slug": "UHLYU11YN3OW",
                "is_parent_request": False,
                "state": "Lagos",
            }
        )
        request_form = remote_forms.ParentRequestForm(self.data, instance=new_data)
        self.assertFalse(request_form.is_valid())
        self.assertEqual(
            request_form.errors["region"][0], "Please select a region closest to you"
        )

    def test_form_saves_pricing_selection_when_available_for_a_state(self):
        new_data = self.b_request.copy()
        new_data.update(state="Lagos")
        self.data.update({"region": "Island 1"})
        request_form = remote_forms.ParentRequestForm(self.data, instance=new_data)
        request_form.is_valid()
        self.assertEqual(request_form.errors, {})
        new_request = request_form.save()
        self.assertEqual(new_request["region"], "Island 1")


class TutorRequestForm2TestCase(SecondFormTestCase):

    def test_form_doesnt_throw_error_when_it_is_not_a_parent_request_form(self):
        self.data.update(
            {
                "home_address": "20 Irabor Street",
                "state": "Lagos",
                "expectation": "This is for my child",
                "vicinity": "Ikeja",
                "possible_subjects": ["French"],
            }
        )
        request_form = remote_forms.TutorRequestForm2(
            self.data, instance=self.b_request, subjects=[("French", "French")]
        )
        request_form.is_valid()
        self.assertEqual(request_form.errors, {})


class SecondRequestFormTestCase(SecondFormTestCase):

    def setUp(self):
        super(SecondRequestFormTestCase, self).setUp()
        Region.initialize()
        self.b_request.update(state="Lagos")

    def test_second_form_throws_error_when_region_is_passed(self):
        self.data.update({"region": "Island 1"})
        request_form = remote_forms.SecondRequestForm(
            self.data, instance=self.b_request
        )
        request_form.is_valid()
        self.assertTrue(request_form.is_valid())

    def test_second_form_do_not_throw_error(self):
        request_form = remote_forms.SecondRequestForm(
            self.data, instance=self.b_request
        )
        self.assertTrue(request_form.is_valid())


class PricingFormTestCase(SecondFormTestCase):

    def setUp(self):
        super(PricingFormTestCase, self).setUp()
        self.user_details = {
            "first_name": u"Abiola",
            "last_name": u"Oyeniyi",
            "number": u"+2348166408697",
            "primary_phone_no1": u"+2348166408697",
            "gender": "M",
            u"where_you_heard": u"4",
        }
        self.data = {
            u"available_days": "Monday,Thursday,Sunday",
            "budget": 35000,
            "plan": "Regular",
            "expectation": "Lorejo wjewo ejowj eojweo jwoej owej owej",
            u"hours_per_day": u"3",
            "no_of_students": 2,
        }

    def test_forms_has_user_info_fields(self):
        request_form = remote_forms.PriceAdjustForm()
        for field in [
            "first_name",
            "last_name",
            "number",
            "primary_phone_no1",
            "gender",
            "where_you_heard",
        ]:
            self.assertIn(field, request_form.fields.keys())

    def test_assert_form_submits_when_data_is_valid(self):
        self.data.update(self.user_details)
        price_form = remote_forms.PriceAdjustForm(self.data, instance=self.b_request)
        price_form.is_valid()
        self.assertEqual(price_form.errors, {})
        data = price_form.save()
        self.assertEqual(data["status"], 2)

    def test_form_is_invalid(self):
        price_form = remote_forms.PriceAdjustForm(self.data, instance=self.b_request)
        self.assertFalse(price_form.is_valid())

    def test_old_data_is_used_when_not_passed(self):
        self.b_request = self.create_sample_request(
            {
                "request_type": 1,
                "no_of_students": 1,
                "expectation": "Literacy and fluency in written and spoken igbo.",
                "home_address": "Graceland Estate, Ajah",
                "longitude": "3.5816073",
                "latitude": "6.4693736",
                "first_name": "Victor",
                "last_name": "Kalu",
                "number": "+2348166401989",
                "region": None,
                "vicinity": "Lagos",
                "where_you_heard": "6",
                "class_urgency": "2_weeks",
                "slug": "UHLYU11YN3OW",
                "is_parent_request": False,
                "state": "Lagos",
                "hours_per_day": 3,
                "no_of_students": 2,
                "available_days": ["Monday", "Thursday", "Sunday"],
            }
        )
        self.data = {
            "budget": 35000,
            "plan": "Regular",
            "expectation": "Lorejo wjewo ejowj eojweo jwoej owej owej",
            # 'hours_per_day': "",
            # 'no_of_students':"",
        }
        self.data.update(self.user_details)
        price_form = remote_forms.PriceMiniForm(self.data, instance=self.b_request)
        price_form.is_valid()
        self.assertEqual(price_form.errors, {})
        self.b_request = price_form.save()
        self.assertEqual(Decimal(self.b_request["hours_per_day"]), 3)
        self.assertEqual(self.b_request["no_of_students"], 2)
        self.assertEqual(
            self.b_request["available_days"], ["Monday", "Thursday", "Sunday"]
        )


class OnlineFormTestCase(TestCase):

    def create_sample_request(self, data):
        data = requests.post(
            "{}requests/create_record/".format(settings.REQUEST_SERVICE_URL), json=data
        )
        data.raise_for_status()
        return data.json()

    def setUp(self):
        from skills.models import Category, Skill

        self.nigerian_category = Category.objects.create(name="Nigerian Languages")
        s = Skill.objects.create(name="Yoruba Language")
        s.categories.add(self.nigerian_category)
        s.save()
        self.b_request = self.create_sample_request(
            dict(email="a@o.com", slug="234ABCDEFDED")
        )
        self.data = {
            "possible_subjects": "Yoruba Language",
            "first_name": "Abiola",
            "the_timezone": "GMT-0",
            "online_id": "gbozee@gmail.com",
            "expectation": "jfowje owjeo wjeoj weojw ",
            "email": u"gbozee@gmail.com",
            "no_of_students": "1",
            "country": "NG",
            "country_state": u"London",
        }

    def test_form_can_be_submitted_correctly(self):
        request_form = remote_forms.NigerianLanguagesForm(
            self.data, instance=self.b_request, category=self.nigerian_category
        )
        self.assertTrue(request_form.is_valid())

    def test_validation_runs_as_expected(self):
        data = {}
        request_form = remote_forms.NigerianLanguagesForm(
            data, instance=self.b_request, category=self.nigerian_category
        )
        self.assertFalse(request_form.is_valid())
        self.assertEqual(len(request_form.errors.keys()), 8)

    def test_form_saves_record_correctly(self):
        request_form = remote_forms.NigerianLanguagesForm(
            self.data, instance=self.b_request, category=self.nigerian_category
        )
        self.assertTrue(request_form.is_valid())
        self.b_request = request_form.save()
        self.assertEqual(self.b_request["country_state"], "London")
        self.assertEqual(self.b_request["country"], "NG")
        self.assertEqual(
            self.b_request["expectation"], self.data["expectation"].strip()
        )
        self.assertEqual(self.b_request["the_timezone"], self.data["the_timezone"])
        self.assertEqual(self.b_request["request_type"], 3)
        self.assertEqual(self.b_request["request_subjects"], ["Yoruba Language"])

    def test_form_with_academic_subjects(self):
        from skills.models import Category, Skill

        nigerian_category = Category.objects.create(name="School Subjects")
        s = Skill.objects.create(name="General Mathematics")
        s.categories.add(nigerian_category)
        s.save()
        self.data.update({"possible_subjects": "General Mathematics"})
        request_form = remote_forms.NigerianLanguagesForm(
            self.data, instance=self.b_request, category=nigerian_category
        )
        self.assertTrue(request_form.is_valid())
        self.b_request = request_form.save()
        self.assertEqual(self.b_request["country_state"], "London")
        self.assertEqual(self.b_request["country"], "NG")
        self.assertEqual(
            self.b_request["expectation"], self.data["expectation"].strip()
        )
        self.assertEqual(self.b_request["the_timezone"], self.data["the_timezone"])
        self.assertEqual(self.b_request["request_type"], 3)
        self.assertEqual(self.b_request["request_subjects"], ["Basic Mathematics"])
