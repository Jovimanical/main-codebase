from unittest.mock import patch, call
from test_plus.test import TestCase
from decimal import Decimal
from external import services
from . import factories
from users.tests.factories import UserFactory, LocationFactory, PhoneNumberFactory
from pricings.models import Region
from external.models import BaseRequestTutor, PriceDeterminator
from users.models import User
from connect_tutor.models import RequestPool
from skills.tests.factories import TutorSkillFactory, SkillFactory
from bookings.models import Booking


class ExternalService(TestCase):

    def test_constructor_can_create_request_from_email_if_passed(self):
        a = UserFactory(email="a@o.com")
        b = services.ExternalService(email=a.email, create=True)
        self.assertTrue(hasattr(b, "instance"))
        self.assertEqual(b.user_service.user, a)
        self.assertIsNotNone(b.instance)


class RequestServiceTestCase(TestCase):

    def test_can_fetch_list_of_created_requests(self):
        a = UserFactory(email="a@o.com")
        r = factories.BaseRequestTutorFactory(
            email=a.email,
            booking=None,
            user=None,
            tutor=None,
            request_subjects=["English"],
        )
        b = services.RequestService("a@o.com")
        self.assertEqual(len(b.all(placed_only=False)), 1)

    @patch("external.services.PayPalPaymentsForm")
    @patch("external.services.ex_models.get_dollar_rate")
    def test_get_paypal_form_is_called(self, mc_dollar_rate, mc_form):
        mc_dollar_rate.return_value = {"USDNGN": 100}
        l = lambda url: url
        others = {"item_name": "Payment for lesson", "custom": "Request Payment"}
        urls = ["request_complete_redirect", "request_cancelled_redirect"]
        invoice = "ABCDEFGH"
        response = {
            "return_url": self.reverse(urls[0], order=invoice),
            "cancel_return": self.reverse(urls[1], order=invoice),
            "notify_url": self.reverse("paypal-ipn"),
            "amount": 3.0,
            "business": "tuteriacorp-facilitator@gmail.com",
            "invoice": invoice,
            "item_name": others["item_name"],
            "custom": others["custom"],
            "image": "https://www.paypalobjects.com/en_US/i/btn/x-click-but6.gif",
        }
        result = services.get_paypal_form(l, invoice, 300, urls, others)
        mc_form.assert_called_with(initial=response)

    @patch("external.services.b.forms.PagaPaymentForm")
    def test_get_paga_form(self, mc_form):
        l = lambda url: url
        response = {
            "email": "a@example.com",
            "account_number": 1,
            "subtotal": 300,
            "phoneNumber": "",
            "description": "Hello world",
            "surcharge": 0,
            "product_code": "",
            "surcharge_description": "Booking Fee",
            "invoice": "12345",
            "test": True,
            "quantity": "",
            "return_url": self.reverse("processing_fee_redirect", slug="12345"),
        }
        services.get_paga_form(
            l,
            "a@example.com",
            1,
            300,
            "Hello world",
            "12345",
            "processing_fee_redirect",
        )
        mc_form.assert_called_once_with(initial=response)

    def test_has_referral_instance(self):
        a = UserFactory(email="a@o.com")
        factories.ReferralFactory(owner=a, offline_code="ADESE")
        r = factories.BaseRequestTutorFactory(
            email=a.email,
            slug="ADEDESFESFDS",
            booking=None,
            user=None,
            tutor=None,
            request_subjects=["English"],
        )
        b = services.SingleRequestService(r.slug)
        self.assertTrue(b.has_referral_instance())

    def test_does_not_have_referral_instance(self):
        a = UserFactory(email="a@o.com")
        r = factories.BaseRequestTutorFactory(
            email=a.email,
            slug="ADEDESFESFDS",
            booking=None,
            user=None,
            tutor=None,
            request_subjects=["English"],
        )
        b = services.SingleRequestService(r.slug)
        self.assertFalse(b.has_referral_instance())

    def test_pricing_works_as_expected(self):
        a = UserFactory(email="a@o.com")
        r = factories.BaseRequestTutorFactory(
            email=a.email,
            slug="ADEDESFESFDS",
            booking=None,
            user=None,
            tutor=None,
            hours_per_day=3,
            days_per_week=4,
            available_days=["Monday", "Tuesday"],
            request_subjects=["English"],
        )
        b = services.SingleRequestService(r.slug)
        result = b.determine_prices_for_featured_devices("Island 1")
        descriptions = {
            "Regular": "1-3 years experienced tutor with good credentials and proven track-record",
            "Expert": "2-6 years experienced tutor with strong credentials, relevant training and expert knowledge",
            "Elite": "Seasoned tutor of 3-15 years from a top-most institution with excellent track-record",
        }
        self.assertEqual(
            result,
            [
                {
                    "price": 17700.0,
                    "heading": u"Regular",
                    "description": descriptions["Regular"],
                },
                {
                    "price": 26500.0,
                    "heading": u"Expert",
                    "description": descriptions["Expert"],
                },
                {
                    "price": 35300.0,
                    "heading": u"Elite",
                    "description": descriptions["Elite"],
                },
            ],
        )


class PricingTestCase(TestCase):

    def setUp(self):
        self.price_determinant = PriceDeterminator.objects.create(
            states={"Lagos": 100, "Abuja": 95},
            plans={"Plan 1": 100, "Plan 2": 150, "Plan 3": 250},
        )

    def test_get_pricing_for_request_for_lagos(self):
        a = UserFactory(email="a@o.com")
        r = factories.BaseRequestTutorFactory(
            email=a.email,
            slug="ADEDESFESFDS",
            booking=None,
            user=None,
            tutor=None,
            hours_per_day=3,
            days_per_week=4,
            available_days=["Monday", "Tuesday"],
            state="Lagos",
            request_subjects=["English"],
        )
        b = services.SingleRequestService(r.slug)
        result = b.get_pricing_for_request()


class SingleRequestServiceTestCase(TestCase):
    maxDiff = None

    def setUp(self):
        self.superuser = UserFactory(
            username="super",
            first_name="Peter",
            email="super@example.com",
            is_superuser=True,
            is_staff=True,
        )
        self.superuser.set_password("secret")
        self.superuser.save()

        self.request = factories.BaseRequestTutorFactory(
            status=BaseRequestTutor.ISSUED,
            slug="ABCDEFGH",
            booking=None,
            tutor=None,
            days_per_week=2,
            no_of_students=1,
            hours_per_day=1,
            available_days=["Monday"],
            user=self.superuser,
            budget=5000,
            request_subjects=["Elementary English"],
        )
        self.tutor = UserFactory(
            first_name="Peter", last_name="Parker", email="peter@yahoo.com"
        )
        PhoneNumberFactory(owner=self.tutor, number="+2348124450294")
        LocationFactory(user=self.tutor)
        x = TutorSkillFactory(
            tutor=self.tutor,
            price=4500,
            skill=SkillFactory(
                name="Elementary English", related_with=["elementary english"]
            ),
        )

        self.tutor2 = UserFactory(
            first_name="Moses", last_name="Igbuku", email="moses@yahoo.com"
        )
        PhoneNumberFactory(owner=self.tutor2, number="+2348124450295")
        LocationFactory(user=self.tutor2)
        x = TutorSkillFactory(
            tutor=self.tutor2,
            price=4000,
            skill=SkillFactory(
                name="Elementary English", related_with=["elementary english"]
            ),
        )

        self.request_pool = RequestPool.objects.create(
            req=self.request,
            tutor=self.tutor,
            approved=True,
            cost=5000,
            subjects=["Elementary English"],
        )
        self.request_pool2 = RequestPool.objects.create(
            req=self.request,
            tutor=self.tutor2,
            approved=False,
            cost=3000,
            subjects=["Elementary English"],
        )
        self.service_instance = services.SingleRequestService(slug=self.request.slug)

    def test_get_request_pool_list(self):
        res = self.service_instance.get_request_pool_list()
        expected = [
            {
                "pool_id": self.request_pool.id,
                "full_name": "Peter P",
                "email": "peter@yahoo.com",
                "approved": True,
                "phone_no": "+2348124450294",
                "address": self.request_pool.get_tutor_address.full_address,
                "teaches_all": True,
                "matched_subjects": [
                    {
                        "name": tfs.skill.name,
                        "active": tfs.status == tfs.ACTIVE,
                        "url": tfs.get_absolute_url(),
                    }
                    for tfs in self.request_pool.tutor_found_subjects
                ],
                "default_subject": None,
                "cost": Decimal("5000.00"),
            },
            {
                "pool_id": self.request_pool2.id,
                "full_name": "Moses I",
                "email": "moses@yahoo.com",
                "approved": False,
                "phone_no": "+2348124450295",
                "address": self.request_pool2.get_tutor_address.full_address,
                "teaches_all": True,
                "matched_subjects": [
                    {
                        "name": tfs.skill.name,
                        "active": tfs.status == tfs.ACTIVE,
                        "url": tfs.get_absolute_url(),
                    }
                    for tfs in self.request_pool2.tutor_found_subjects
                ],
                "default_subject": None,
                "cost": Decimal("3000.00"),
            },
        ]
        self.assertEqual(expected, res)

    def test_get_req_pool_for_base_req_selected_tutor(self):
        self.request.tutor = self.tutor
        self.service_instance.instance = self.request
        res = self.service_instance.get_req_pool_for_base_req_selected_tutor()
        rp = self.request_pool
        expected = {
            "full_name": rp.tutor.get_full_name(),
            "email": rp.tutor.email,
            "phone_no": rp.tutor.phonenumber_set.all()[0].number.raw_input,
            "address": rp.get_tutor_address.full_address,
            "subjects": [],
        }
        self.assertEqual(expected, res)

    def test_create_req_pool_and_attach_tutor_to_baserequest(self):
        # remove the current tutor
        self.request.tutor = None
        self.request.save()

        res = self.service_instance.create_req_pool_and_attach_tutor_to_baserequest(
            "peter@yahoo.com"
        )
        rp = self.request_pool
        selected_tutor = {
            "full_name": rp.tutor.get_full_name(),
            "email": rp.tutor.email,
            "phone_no": rp.tutor.phonenumber_set.all()[0].number.raw_input,
            "address": rp.get_tutor_address.full_address,
            "subjects": [],
        }
        self.assertEqual(res, selected_tutor)

        req = BaseRequestTutor.objects.get(pk=self.request.pk)
        tutor = User.objects.get(email="peter@yahoo.com")
        self.assertEqual(req.tutor, tutor)

    def test_create_booking_from_admin(self):
        self.request.tutor = self.tutor
        self.request.save()
        res = self.service_instance.create_booking_from_admin(
            {
                "booking_sessions": [
                    {"start": "2018-10-01 10:00", "price": 1000, "no_of_hours": 2}
                ],
                "remark": "Booking remark",
                "tutor_subject": "Elementary English",
                "client_price": 2000,
                "tutor_email": "peter@yahoo.com",
            }
        )
        self.assertTrue(res)

        booking = Booking.objects.filter(user=self.superuser).first()
        self.assertTrue(booking)
        self.assertEqual(booking.remark, "Booking remark")
        bookingsessions = booking.bookingsession_set.all()

        for bs in bookingsessions:
            self.assertEqual(str(bs.start), "2018-10-01 09:00:00+00:00")
            self.assertEqual(bs.price, 1000)
            self.assertEqual(bs.no_of_hours, 2)
            self.assertEqual(bs.student_no, 1)
