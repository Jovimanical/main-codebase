import pdb
from mock import patch, call
from test_plus.test import TestCase, RequestFactory
import factories
from users.tests.factories import UserFactory
from external import forms, models
from pricings.models import Region
from skills.models import Category, Skill


class BaseRequestTestCase(TestCase):

    def setUp(self):
        self.user = UserFactory(email="a@o.com")
        self.b_request = factories.BaseRequestTutorFactory(
            email=self.user.email, slug="234ABCDEFDED", is_parent_request=True
        )

    def test_request_accepts_decimal_as_hour_rate(self):
        self.b_request.hours_per_day = 1.5
        self.b_request.save()
        self.b_request = models.BaseRequestTutor.objects.get(pk=self.b_request.pk)
        self.assertEqual(self.b_request.hours_per_day, 1.5)


class ParentRequestFormTestCase(BaseRequestTestCase):

    def setUp(self):
        Region.initialize()
        self.user = UserFactory(email="a@o.com")
        self.b_request = factories.BaseRequestTutorFactory(
            email=self.user.email, slug="234ABCDEFDED", is_parent_request=True
        )

        self.user_details = {
            "first_name": u"Abiola",
            "last_name": u"Oyeniyi",
            "number": u"+2348166408697",
            "primary_phone_no1": u"+2348166408697",
            "gender": "M",
            u"where_you_heard": u"4",
        }
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

    def test_form_can_be_submitted_correctly(self):
        self.data.update(self.user_details)
        request_form = forms.ParentRequestForm(self.data, instance=self.b_request)
        self.assertTrue(request_form.is_valid())

    def test_form_without_user_details_can_be_submitted_correctly(self):
        request_form = forms.ParentRequestForm(self.data, instance=self.b_request)
        request_form.is_valid()
        self.assertEqual(request_form.errors, {})

    def test_form_saves_pricing_selection_when_available_for_a_state(self):
        self.b_request.state = "Lagos"
        self.b_request.save()
        self.data.update({"region": "Island 1"})
        request_form = forms.ParentRequestForm(self.data, instance=self.b_request)
        request_form.is_valid()
        self.assertEqual(request_form.errors, {})
        request_form.save()
        new_request = models.BaseRequestTutor.objects.get(pk=self.b_request.pk)
        self.assertEqual(new_request.region, "Island 1")

    def test_form_throws_error_when_pricing_exists_for_region_but_not_selected(self):
        self.b_request.state = "Lagos"
        self.b_request.save()
        request_form = forms.ParentRequestForm(self.data, instance=self.b_request)
        self.assertFalse(request_form.is_valid())
        self.assertEqual(
            request_form.errors["region"][0], "Please select a region closest to you"
        )

    def test_form_doesnt_throw_error_when_it_is_not_a_parent_request_form(self):
        self.data.update(
            {
                "home_address": "20 Irabor Street",
                "state": "Lagos",
                "vicinity": "Ikeja",
                "possible_subjects": ["French"],
            }
        )
        request_form = forms.TutorRequestForm2(
            self.data, instance=self.b_request, subjects=[("French", "French")]
        )
        request_form.is_valid()
        self.assertEqual(request_form.errors, {})

    def test_second_form_do_not_throw_error(self):
        self.b_request.state = "Lagos"
        self.b_request.save()
        request_form = forms.SecondRequestForm(self.data, instance=self.b_request)
        self.assertTrue(request_form.is_valid())

    def test_form_throws_error_when_no_region_for_academic_single_subject(self):
        self.b_request.state = "Lagos"
        self.b_request.save()
        self.data.update({"region": "Island 1"})
        request_form = forms.SecondRequestForm(self.data, instance=self.b_request)
        request_form.is_valid()
        self.assertTrue(request_form.is_valid())
        # self.assertEqual(request_form.errors['region'][
        #                  0], "Please select a region closest to you")

    def test_second_form_throws_error_when_region_is_passed(self):
        self.b_request.state = "Lagos"
        self.b_request.save()
        self.data.update({"region": "Island 1"})
        request_form = forms.SecondRequestForm(self.data, instance=self.b_request)
        # import pdb
        # pdb.set_trace()
        request_form.is_valid()
        self.assertTrue(request_form.is_valid())
        # self.assertEqual(request_form.errors['region'][
        #                  0], "Please select a region closest to you")

    def test_form_saves_successfullly_even_when_no_pricing_is_attached(self):
        self.b_request.state = "Osun"
        self.b_request.save()
        request_form = forms.ParentRequestForm(self.data, instance=self.b_request)
        request_form.is_valid()
        self.assertEqual(request_form.errors, {})
        request_form.save()
        new_request = models.BaseRequestTutor.objects.get(pk=self.b_request.pk)
        self.assertEqual(new_request.region, "")
        self.assertEqual(new_request.status, new_request.ISSUED)


class PricingFormTestCase(BaseRequestTestCase):

    def setUp(self):
        self.user = UserFactory(email="a@o.com")
        self.b_request = factories.BaseRequestTutorFactory(
            email=self.user.email,
            slug="234ABCDEFDED",
            is_parent_request=True,
            region="Island 1",
        )
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
        request_form = forms.PriceAdjustForm()
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
        price_form = forms.PriceAdjustForm(self.data, instance=self.b_request)
        price_form.is_valid()
        self.assertEqual(price_form.errors, {})
        data = price_form.save()
        self.assertEqual(data.status, data.COMPLETED)

    def test_form_is_invalid(self):
        price_form = forms.PriceAdjustForm(self.data, instance=self.b_request)
        self.assertFalse(price_form.is_valid())

    def test_old_data_is_used_when_not_passed(self):
        self.b_request.hours_per_day = 3
        self.b_request.no_of_students = 2
        self.b_request.available_days = "Monday,Thursday,Sunday".split(",")
        self.b_request.save()
        self.data = {
            "budget": 35000,
            "plan": "Regular",
            "expectation": "Lorejo wjewo ejowj eojweo jwoej owej owej",
            # 'hours_per_day': "",
            # 'no_of_students':"",
        }
        self.data.update(self.user_details)
        price_form = forms.PriceMiniForm(self.data, instance=self.b_request)
        price_form.is_valid()
        self.assertEqual(price_form.errors, {})
        self.b_request = price_form.save()
        self.assertEqual(self.b_request.hours_per_day, 3)
        self.assertEqual(self.b_request.no_of_students, 2)
        self.assertEqual(
            self.b_request.available_days, ["Monday", "Thursday", "Sunday"]
        )


class OnlineFormTestCase(TestCase):

    def setUp(self):
        self.user = UserFactory(email="a@o.com")
        self.nigerian_category = Category.objects.create(name="Nigerian Languages")
        s = Skill.objects.create(name="Yoruba Language")
        s.categories.add(self.nigerian_category)
        s.save()
        self.b_request = factories.BaseRequestTutorFactory(
            email=self.user.email, slug="234ABCDEFDED"
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
        request_form = forms.NigerianLanguagesForm(
            self.data, instance=self.b_request, category=self.nigerian_category
        )
        self.assertTrue(request_form.is_valid())

    def test_validation_runs_as_expected(self):
        data = {}
        request_form = forms.NigerianLanguagesForm(
            data, instance=self.b_request, category=self.nigerian_category
        )
        self.assertFalse(request_form.is_valid())
        self.assertEqual(len(request_form.errors.keys()), 9)

    def test_form_saves_record_correctly(self):
        request_form = forms.NigerianLanguagesForm(
            self.data, instance=self.b_request, category=self.nigerian_category
        )
        request_form.is_valid()
        self.b_request = request_form.save()
        self.assertEqual(self.b_request.country_state, "London")
        self.assertEqual(self.b_request.country, "NG")
        self.assertEqual(self.b_request.expectation, self.data["expectation"].strip())
        self.assertEqual(self.b_request.the_timezone, self.data["the_timezone"])
        self.assertEqual(self.b_request.request_type, 3)
        self.assertEqual(self.b_request.request_subjects, ["Yoruba Language"])

    def test_form_with_academic_subjects(self):
        nigerian_category = Category.objects.create(name="School Subjects")
        s = Skill.objects.create(name="General Mathematics")
        s.categories.add(nigerian_category)
        s.save()
        self.data.update({"possible_subjects": "General Mathematics"})
        request_form = forms.NigerianLanguagesForm(
            self.data, instance=self.b_request, category=nigerian_category
        )
        request_form.is_valid()
        self.b_request = request_form.save()
        self.assertEqual(self.b_request.country_state, "London")
        self.assertEqual(self.b_request.country, "NG")
        self.assertEqual(self.b_request.expectation, self.data["expectation"].strip())
        self.assertEqual(self.b_request.the_timezone, self.data["the_timezone"])
        self.assertEqual(self.b_request.request_type, 3)
        self.assertEqual(self.b_request.request_subjects, ["General Mathematics"])


from external.forms import PrimeRequestForm


class PrimeFormTestCase(TestCase):

    def setUp(self):
        pass

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
            "time_of_lesson": "10am",
            "first_name": "Danny",
            "gender": "M",
            "expectation": "lorem*2323j23 2jo32 o32j o23j2",
            "last_name": "Devator",
            "email": "danny@example.com",
            "number": "07035209922",
            "home_address": "20 Irabor Street Ikeja",
            "state": "Lagos",
            "where_you_heard": 11,
        }
        data.update(kwargs)
        return data

    def test_all_fields_throw_validation_errors_if_not_specified(self):
        form = PrimeRequestForm({})
        form.is_valid()
        fields = [
            "no_of_students",
            "lesson_occurence",
            "subjects",
            "hours_per_day",
            "days_per_week",
            "expectation",
            "first_name",
            "email",
            "number",
            "home_address",
            "state",
        ]
        for field in fields:
            self.assertIn(field, form.errors)
        self.assertEqual(len(form.errors.values()), len(fields))

    def test_classes_of_student_can_be_determined_from_subjects_selected(self):
        data = self.default_form_data()
        form = PrimeRequestForm(data)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.get_classes(), ["Nursery", "Primary"])
        data.update(
            subjects=[
                "Chemistry (SSS)",
                "Commerce (SSS)",
                "English Language (JSS - SSS)",
            ]
        )
        form = PrimeRequestForm(data)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.get_classes(), ["SSS", "JSS"])

    def test_subjects_ared_saved_correctly(self):
        data = self.default_form_data()
        data.update(
            subjects=[
                "Chemistry (SSS)",
                "Commerce (SSS)",
                "English Language (JSS - SSS)",
            ]
        )
        form = PrimeRequestForm(data)
        self.assertTrue(form.is_valid())
        self.assertEqual(
            form.get_subjects(), ["Chemistry", "Commerce", "English Language"]
        )

    def test_at_most_3_subjects_are_selected_and_not_more(self):
        data = self.default_form_data()
        data["subjects"].extend(
            ["Chemistry (SSS)", "Commerce (SSS)", "English Language (JSS - SSS)"]
        )
        form = PrimeRequestForm(data)
        self.assertFalse(form.is_valid())
        self.assertEqual(form.errors["subjects"], ["You selected more than 3 subjects"])

    def test_actual_available_days_are_populated_from_occurence(self):
        data = self.default_form_data()
        form = PrimeRequestForm(data)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.autopopulate_days(), ["Monday", "Tuesday", "Wednesday"])

    def test_correct_price_is_generated_for_lagos_A(self):
        data = self.default_form_data(state="Lagos")
        self.generate_result(data, 25000)
        data["state"] = "Abuja"
        self.generate_result(data, 25000)
        data["state"] = "Rivers"
        self.generate_result(data, 25000)

    def generate_result(self, data, value):
        form = PrimeRequestForm(data)
        self.assertTrue(form.is_valid())
        self.assertEqual(form.calculate_price(), value)

    def test_when_number_of_days_is_increased_for_setA(self):
        data = self.default_form_data(lesson_occurence=4)
        self.generate_result(data, 33330)

    def test_when_number_of_days_is_increased_for_setB(self):
        data = self.default_form_data(lesson_occurence=4, state="Ogun")
        self.generate_result(data, 26670)

    def test_when_number_of_hours_is_increased_beyond_2_hours_setA(self):
        data = self.default_form_data(hours_per_day="3", state="Osun")
        self.generate_result(data, 30000)

    def test_when_number_of_hours_is_increased_beyond_2_hours_setB(self):
        data = self.default_form_data(hours_per_day="3")
        self.generate_result(data, 37500)

    def test_ensure_the_price_of_1_and_one_half_hours_is_the_same(self):
        data = self.default_form_data(state="Lagos", hours_per_day="1")
        self.generate_result(data, 25000)
        data["hours_per_day"] = "1.5"
        self.generate_result(data, 25000)
        data["state"] = "Ogun"
        self.generate_result(data, 20000)
        data["hours_per_day"] = "1"
        self.generate_result(data, 20000)

    def test_price_is_the_same_for_one_or_two_kids(self):
        data = self.default_form_data(state="Lagos", no_of_students="1")
        self.generate_result(data, 25000)
        data["no_of_students"] = "2"
        self.generate_result(data, 25000)
        data["state"] = "Ogun"
        self.generate_result(data, 20000)
        data["no_of_students"] = "1"
        self.generate_result(data, 20000)

    def test_if_days_are_reduced_or_increased_price_is_calculated_accordingly(self):
        data = self.default_form_data(
            hours_per_day="3", lesson_occurence=2, days_per_week=3
        )
        self.generate_result(data, 18750)
        data.update(
            hours_per_day="4",
            lesson_occurence="7",
            days_per_week="8",
            no_of_student2="1",
        )
        self.generate_result(data, 116670)

    def test_if_more_than_two_teachers_are_selected_price_is_x2_the_cost_of_one(self):
        data = self.default_form_data(state="Lagos", multiple_teachers="on")
        self.generate_result(data, 50000)
        data["no_of_students"] = "3"
        self.generate_result(data, 80000)
        data["multiple_teachers"] = ""
        self.generate_result(data, 40000)

        data["no_of_students"] = "4"
        self.generate_result(data, 53330)
        data["no_of_students"] = "2"
        data["subjects"].append("English Language (JSS - SSS)")
        self.generate_result(data, 30000)
        data["state"] = "Ogun"
        self.generate_result(data, 25000)

    def test_the_price_for_three_students_in_setA(self):
        data = self.default_form_data(state="Lagos", no_of_students="3")
        self.generate_result(data, 40000)
        data["subjects"].append("English Language (JSS - SSS)")
        self.generate_result(data, 45000)
        data["no_of_students"] = "1"
        self.generate_result(data, 30000)

    def test_the_price_for_three_students_in_setB(self):
        data = self.default_form_data(state="Ogun", no_of_students="3")
        self.generate_result(data, 32000)
        data["multiple_teachers"] = "on"
        self.generate_result(data, 64000)
        data["subjects"].append("English Language (JSS - SSS)")
        self.generate_result(data, 75000)
        data["no_of_students"] = "2"
        self.generate_result(data, 50000)

    def test_request_is_successfully_created(self):
        data = self.default_form_data()
        form = PrimeRequestForm(data)
        self.assertTrue(form.is_valid())
        record = form.save()
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

    def test_price_values_are_valid(self):
        data = self.default_form_data()
        form = PrimeRequestForm(data)
        self.assertTrue(form.is_valid())
        set_a, set_b = form.get_prices()
        self.assertEqual(round(set_a.nursery_price, 2), 1041.67)
        self.assertEqual(round(set_a.nursery_student_price, 2), 555.55)
        self.assertEqual(set_a.jss_price, 1250)
        self.assertEqual(set_a.jss_student_price, 625)
        self.assertEqual(round(set_b.nursery_price, 2), 833.37)
        self.assertEqual(round(set_b.nursery_student_price, 2), 444.44)
        self.assertEqual(round(set_b.jss_price, 2), 1041.67)
        self.assertEqual(round(set_b.jss_student_price, 2), 520.84)
