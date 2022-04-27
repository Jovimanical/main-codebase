# -*- coding: utf-8 -*-
from test_plus.test import TestCase

from django.test import RequestFactory
from mock import patch, call, Mock
from users.tests.factories import UserFactory, PhoneNumberFactory
from external.services.service2 import (
    request_service,
    ExternalService,
    SingleRequestService,
    DepositMoneyService,
)
from external.forms.remote_forms import (
    HomeParentRequestForm,
    TutorRequestForm1,
    NigerianLanguagesForm,
)
from django.conf import settings
from users.models import Constituency
import requests
from django.http import Http404
from pricings.models import Region
from operator import itemgetter
import json


class BaseServiceTestCase(TestCase):

    def create_sample_request(self, data):
        data = requests.post(
            "{}requests/create_record/".format(settings.REQUEST_SERVICE_URL), json=data
        )
        data.raise_for_status()
        return data.json()

    def setUp(self):
        self.tutor_data = {
            "state": "Lagos",
            "vicinity": "Ikeja",
            "no_of_students": 2,
            "email": "gbozee@example.com",
            "latitude": 2.23232,
            "subject": "English Language",
            "number": "+2347035209963",
            "class_urgency": "immediately",
            "longitude": 1.00232,
            "home_address": "jowejwo ejowe joew j",
        }
        self.sample_request = self.create_sample_request(
            {
                "country": "",
                "request_type": 2,
                "gender": "",
                "hours_per_day": "3.00",
                "no_of_students": 1,
                "expectation": "I am tired of the shame not been able to speak Igbo as my father is delta igbo and mom is a yoruba woman. I was born in Lagos and we all speak my mom's language. It is a living hell when we meet people from my Dads place, it is like an abomination or a sin! It is even worse for me as a male child. I have had enough oh. I need help fast",
                "home_address": "Road 16, Ikota Villa Estate",
                "longitude": None,
                "latitude": None,
                "email": "a@o.com",
                "first_name": "Francis",
                "last_name": "Obikwu",
                "number": "+2349055080501",
                "state": "Lagos",
                "region": None,
                "vicinity": "Ikota School Ajah",
            }
        )


class ExternalServiceTestCase(BaseServiceTestCase):

    def test_constructor_can_create_request_from_email_if_passed(self):
        a = UserFactory(email="a@o.com")
        PhoneNumberFactory(
            owner=a, number="+2349055080501", primary=True, verified=True
        )
        b = ExternalService(email=a.email, create=True)
        self.assertTrue(hasattr(b, "instance"))
        self.assertEqual(b.user_service.user, a)
        self.assertIsNotNone(b.instance)
        self.assertEqual(b.instance["number"], "+2349055080501")

    def test_get_initial_data_returns_valid_result(self):
        a = UserFactory(email="ago.com")
        b = ExternalService(email=a.email, create=True)
        self.assertEqual(
            b.get_initial_data(), {"age": "2", "class_of_child": "5", "number": ""}
        )


class ExternalTestCaseAction(BaseServiceTestCase):

    def setUp(self):
        super(ExternalTestCaseAction, self).setUp()
        self.b = UserFactory(email="tutor1@example.com", slug="tutora2")
        self.form_instance = TutorRequestForm1(
            self.tutor_data,
            opts_choices={"subject": (("English Language", "English Language"),)},
        )

    def tearDown(self):
        super(ExternalTestCaseAction, self).tearDown()

    def test_extra_actions_with_tutor(self):
        self.assertTrue(self.form_instance.is_valid())
        ExternalService.extra_form_actions(self.form_instance, tutor=self.b)
        self.form_instance.cleaned_data.update(
            post_action=dict(request_type=2, tutor_slug=self.b.slug)
        )

    def test_extra_actions_when_it_is_a_parent_request(self):
        self.assertTrue(self.form_instance.is_valid())
        ExternalService.extra_form_actions(self.form_instance, is_parent=True)
        self.form_instance.cleaned_data.update(post_action=dict(is_parent_request=True))

    def test_extra_actions_when_request_is_online(self):
        self.assertTrue(self.form_instance.is_valid())
        ExternalService.extra_form_actions(self.form_instance, online=True)
        self.form_instance.cleaned_data.update(
            post_action=dict(request_type=3, status=2, class_urgency="immediately")
        )

    def test_extra_actions_when_area_is_passed(self):
        Constituency.objects.get_or_create(name="island 1", areas=["Lagos"])
        self.assertTrue(self.form_instance.is_valid())
        ExternalService.extra_form_actions(
            self.form_instance, request_subjects=["Mathematics", "french"], area="Lagos"
        )
        self.form_instance.cleaned_data.update(
            post_action=dict(request_subjects="Mathematics", area="Lagos")
        )

    def test_admin_actions_on_profile_page(self):
        ExternalService._admin_actions_on_profile_page(
            {"slug": "abiolao", "price": 2000}, self.sample_request["id"], 1
        )

    def test_save_first_form(self):
        request = Mock()
        request.user = Mock()
        request.user.is_authenticated.return_value = False
        request.POST = {
            "number": "+2348166401989",
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
        ExternalService.save_first_form(
            request,
            None,
            NigerianLanguagesForm,
            online=True,
            the_category="Nigerian Languages",
        )


class SingleRequestServiceTestCase(BaseServiceTestCase):

    def setUp(self):
        super(SingleRequestServiceTestCase, self).setUp()
        Region.initialize()
        self.m_service = request_service
        self.mock_get_instance = self.m_service.get_instance
        self.last_5_request = self.m_service.get_completed_requests
        self.get_pricings = self.m_service.get_pricings
        self.request_instance = self.sample_request

    # def test_initialization_of_service(self):
    #     self.sample_request = self.create_sample_request({
    #         "country": "",
    #         "request_type": 2,
    #         "gender": "",
    #         "hours_per_day": "3.00",
    #         "no_of_students": 1,
    #         "expectation": "I am tired of the shame not been able to speak Igbo as my father is delta igbo and mom is a yoruba woman. I was born in Lagos and we all speak my mom's language. It is a living hell when we meet people from my Dads place, it is like an abomination or a sin! It is even worse for me as a male child. I have had enough oh. I need help fast",
    #         "home_address": "Road 16, Ikota Villa Estate",
    #         "longitude": None,
    #         "latitude": None,
    #         "email": "a@o.com",
    #         "first_name": "Francis",
    #         "last_name": "Obikwu",
    #         "number": "+2349055080501",
    #         "state": "Lagos",
    #         "region": None,
    #         "vicinity": "Ikota School Ajah",
    #     })

    #     new_instance = SingleRequestService(slug=self.sample_request['slug'])
    #     self.assertIsNotNone(new_instance.instance)

    def test_initialization_raises_not_found_error(self):
        with self.assertRaises(Http404) as context:
            SingleRequestService(slug="ADESGESGESDG")

    def create_new_instance(self, data):
        default_data = {
            "country": "",
            "request_type": 2,
            "gender": "",
            "hours_per_day": "3.00",
            "no_of_students": 1,
            "expectation": "I am tired of the shame not been able to speak Igbo as my father is delta igbo and mom is a yoruba woman. I was born in Lagos and we all speak my mom's language. It is a living hell when we meet people from my Dads place, it is like an abomination or a sin! It is even worse for me as a male child. I have had enough oh. I need help fast",
            "home_address": "Road 16, Ikota Villa Estate",
            "longitude": None,
            "latitude": None,
            "email": "a@o.com",
            "slug": "UUUUUUUUUUUU",
            "first_name": "Francis",
            "last_name": "Obikwu",
            "number": "+2349055080501",
            "state": "Lagos",
            "region": None,
            "vicinity": "Ikota School Ajah",
            "is_parent_request": True,
            "request_subjects": [],
        }
        default_data.update(data)
        return self.create_sample_request(default_data)

    def test_second_request_form_context_without_user_service(self):
        new_inst = self.create_new_instance(
            {"is_parent_request": True, "request_subjects": []}
        )
        new_instance = SingleRequestService(slug=new_inst["slug"])
        result = new_instance.second_request_form_context()
        self.assertEqual(result["object"]["id"], new_inst["id"])
        self.assertEqual(result["request_instance"]["id"], new_inst["id"])
        self.assertEqual(
            result["levels"],
            [
                u"Nursery 1",
                u"Nursery 2",
                u"Primary 1",
                u"Primary 2",
                u"Primary 3",
                u"Primary 4",
                u"Primary 5",
                u"Primary 6",
                u"JSS 1",
                u"JSS 2",
                u"JSS 3",
                u"SSS 1",
                u"SSS 2",
                u"SSS 3",
                u"Beginner",
                u"Intermediate",
                u"Advanced",
            ],
        )
        self.assertEqual(
            result["rates"],
            {
                u"hour_rate": u"0.250",
                u"id": 1,
                u"one_hour_less_price_rate": u"1.500",
                u"online_prices": 4000,
                u"price_base_rate": u"0.080",
                u"student_no_rate": u"0.250",
                u"use_default": True,
            },
        )
        form = result["form"]
        self.assertEqual(form.__class__.__name__, "ParentRequestForm")

    def test_second_request_form_context_with_param_kwargs(self):
        new_inst = self.create_new_instance(
            {"is_parent_request": False, "request_subjects": ["English Language"]}
        )
        new_instance = SingleRequestService(slug=new_inst["slug"])
        result = new_instance.second_request_form_context(param=True)
        self.assertEqual(result["form"].__class__.__name__, "TutorRequestForm2")

    def test_second_request_form_context_returns_second_request_form(self):
        new_inst = self.create_new_instance(
            {"is_parent_request": False, "request_subjects": ["English Language"]}
        )
        new_instance = SingleRequestService(slug=new_inst["slug"])
        result = new_instance.second_request_form_context()
        self.assertEqual(result["form"].__class__.__name__, "TutorRequestForm2")

    def test_third_request_form_context(self):
        mock_request = Mock(referral_code="None")
        mock_request.POST = Mock(return_value={"plan": ""})
        mock_request.POST.get.return_value = {"plan": ""}
        new_inst = self.create_new_instance(
            {"is_parent_request": False, "request_subjects": ["English Language"]}
        )
        new_instance = SingleRequestService(slug=new_inst["slug"])
        result = new_instance.third_request_form_context(mock_request)
        self.assertEqual(
            sorted(result["operaMiniPlans"], key=itemgetter("heading")),
            sorted(
                [
                    {
                        u"description": u"1-5 years experienced tutor with good credentials and proven track-record",
                        u"heading": u"Plan 1",
                        u"price": 0.0,
                    },
                    {
                        u"description": u"2-6 years experienced tutor with strong credentials, relevant training and expert knowledge",
                        u"heading": u"Plan 2",
                        u"price": 0.0,
                    },
                    {
                        u"description": u"Seasoned tutor of 3-15 years from a top-most institution with excellent track-record",
                        u"heading": u"Plan 3",
                        u"price": 0.0,
                    },
                ],
                key=itemgetter("heading"),
            ),
        )
        self.assertEqual(
            result["pricing_options"],
            json.dumps(
                [
                    {
                        "status": 1,
                        "selected": False,
                        "perHour": 750,
                        "heading": "Plan 1",
                    },
                    {
                        "status": 2,
                        "selected": False,
                        "perHour": 1250,
                        "heading": "Plan 2",
                    },
                    {
                        "status": 3,
                        "selected": False,
                        "perHour": 2000,
                        "heading": "Plan 3",
                    },
                ]
            ),
        )
        self.assertEqual(
            result["p_params"],
            {
                u"price_base_rate": u"0.080",
                u"one_hour_less_price_rate": u"1.500",
                u"id": 1,
                u"hour_rate": u"0.250",
                u"use_default": True,
                u"online_prices": 4000,
                u"student_no_rate": u"0.250",
            },
        )
        self.assertEqual(
            result["basic"],
            {u"status": 1, u"selected": False, u"perHour": 750, u"heading": u"Plan 1"},
        )
        self.assertEqual(
            result["medium"],
            {u"status": 2, u"selected": False, u"perHour": 1250, u"heading": u"Plan 2"},
        )
        self.assertEqual(
            result["high"],
            {u"status": 3, u"selected": False, u"perHour": 2000, u"heading": u"Plan 3"},
        )


class DepositMoneyServiceTestCase(TestCase):

    def create_sample_request(self, data):
        data = requests.post(
            "{}requests/create_record/".format(settings.REQUEST_SERVICE_URL), json=data
        )
        data.raise_for_status()
        return data.json()

    def create_sample_deposit(self, data):
        data = requests.post(
            "{}payments/create_record/".format(settings.REQUEST_SERVICE_URL), json=data
        )
        data.raise_for_status()
        return data.json()

    def setUp(self):
        self.user = UserFactory(id=19083, email="a@o.com")
        self.factory = RequestFactory()
        self.sample_request = self.create_sample_request(
            {
                "email": "a@o.com",
                "slug": "ADESGESGESGE",
                "budget": 17500,
                "percent_discount": 0,
            }
        )
        self.sample_deposit = self.create_sample_deposit(
            {"request": self.sample_request["id"], "amount": 17500}
        )
        self.deposit_instance = DepositMoneyService(self.sample_deposit["order"])

    def test_initialization_of_depositservice_works(self):
        self.assertIsNotNone(self.deposit_instance.rq_service)
        self.assertIsNotNone(self.deposit_instance.payer)
        self.assertIsNotNone(self.deposit_instance.payer_wallet)

    def test_paystack_validation(self):
        self.deposit_instance.paystack_validation(20000)
        # deduct processing fee
        self.assertEqual(self.user.wallet.amount_available, 17500)
        self.assertEqual(self.deposit_instance.instance["made_payment"], True)

    def test_process_paystack_payment(self):
        request = self.factory.get("/james/")
        request.user = self.user
        output = self.deposit_instance.process_paystack_payment(request)
        self.assertIn("https://paystack.com/secure/", output)

    def test_reprocess_paystack_payments(self):
        old_order = self.deposit_instance.instance["order"]
        self.deposit_instance.reprocess_paystack_payment()
        self.assertNotEqual(old_order, self.deposit_instance.instance["order"])

    def test_paystack_payment_outcome(self):
        request = self.factory.get("/james/")
        request.user = self.user
        response = self.deposit_instance.paystack_payment_outcome(request)
        self.assertIn("https://paystack.com/secure/", response[0])
        # self.assertTrue(self.deposit_instance.has_been_paid())

    def test_paypal_payment_outcome(self):
        result = self.deposit_instance.paypal_payment_outcome(30)
        self.assertTrue(result)

    def test_generic_payment_outcome(self):
        request = self.factory.post("/holla/")
        request.POST = {
            "payment_status": "Completed",
            "business": "tuteriacorp-facilitator@gmail.com",
            "invoice": self.deposit_instance.instance["order"],
            "payment_gross": 30,
        }
        response = DepositMoneyService.generic_payment_outcome(request)
        self.assertEqual(response, (True, "Transaction Payment Successful!"))

    def test_can_use_credit(self):
        self.assertFalse(self.deposit_instance.can_use_credit)

    def test_update_wallet_with_amount(self):
        amount_to_be_paid = self.deposit_instance.instance["amount_to_be_paid"]
        self.deposit_instance.update_wallet_amount(0)
        self.assertEqual(
            self.deposit_instance.instance["amount_to_be_paid"], amount_to_be_paid - 0
        )

    def test_get_amount(self):
        amount_to_be_paid = self.deposit_instance.instance["amount_to_be_paid"]
        self.assertEqual(amount_to_be_paid, self.deposit_instance.get_amount)

    def test_paymentreturn_url(self):
        request = self.factory.get("haooew")
        self.assertEqual(
            self.deposit_instance.get_payment_return_url(request),
            "http://testserver/request/client-payment-completed/{}/".format(
                self.deposit_instance.instance["order"]
            ),
        )

    def test_get_paypal_form(self):
        request = self.factory.get("ehwoejwoe")
        output = self.deposit_instance.get_paypal_form(request)
        self.assertEqual(output.__class__.__name__, "PayPalPaymentsForm")

    def test_notify_admin_of_payments_made(self):
        self.deposit_instance.notify_admin_of_payments_made(
            authorization_code="hello", amount_paid=5000, condition=True
        )

    def test_get_paystack_form_parameters(self):
        request = self.factory.get("ehwoejwoe")
        request.user = self.user
        response = self.deposit_instance.get_paystack_form_parameters(request)
        self.assertEqual(response["ref"], self.deposit_instance.instance["order"])
        self.assertEqual(response["email"], "a@o.com")
        self.assertEqual(
            response["amount"], self.deposit_instance.instance["amount_to_be_paid"]
        )

    def test_get_payment_form(self):
        request = self.factory.get("ehwoejwoe")
        request.user = self.user
        response = self.deposit_instance.get_payment_form(request)
        self.assertEqual(response.__class__.__name__, "PagaPaymentForm")

    def test_get_payment_data(self):
        request = self.factory.get("ehwoejwoe")
        request.user = self.user
        response = self.deposit_instance.get_payment_data(request)
        self.assertEqual(
            response["prices"][0]["amount"],
            float(self.deposit_instance.instance["amount"]),
        )
        self.assertEqual(response["currency"], "₦".decode("utf-8"))
