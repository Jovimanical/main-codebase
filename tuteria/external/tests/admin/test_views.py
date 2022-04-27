from django.test import override_settings
from test_plus import TestCase
from mock import patch
from config.settings.common import Common
from users.tests import factories as user_factories
from django.urls import reverse
from external.models import BaseRequestTutor
from ..factories import BaseRequestTutorFactory
from skills.tests.factories import TutorSkillFactory, SkillFactory
from skills.models import TutorSkill
from connect_tutor.models import RequestPool
import json
from decimal import Decimal
from mock import patch
from external.models import PriceDeterminator
from bookings.models import Booking


@override_settings(
    INSTALLED_APPS=Common.INSTALLED_APPS, MIDDLEWARE_CLASSES=Common.MIDDLEWARE_CLASSES
)
class AdminViewsTestCase(TestCase):
    maxDiff = None

    def setUp(self):
        self.superuser = user_factories.UserFactory(
            username="super",
            first_name="Peter",
            email="super@example.com",
            is_superuser=True,
            is_staff=True,
        )
        self.superuser.set_password("secret")
        self.superuser.save()

        PriceDeterminator.objects.create(use_hubspot=False)

        self.request = BaseRequestTutorFactory(
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
        self.tutor = user_factories.UserFactory(
            first_name="Peter", last_name="Parker", email="peter@yahoo.com"
        )
        user_factories.PhoneNumberFactory(owner=self.tutor)
        user_factories.LocationFactory(user=self.tutor)
        x = TutorSkillFactory(
            tutor=self.tutor,
            skill=SkillFactory(name="Elementary English", related_with=["English"]),
        )

        self.tutor2 = user_factories.UserFactory(first_name="Moses", last_name="Igbuku")
        user_factories.PhoneNumberFactory(owner=self.tutor2)
        user_factories.LocationFactory(user=self.tutor2)
        x = TutorSkillFactory(
            tutor=self.tutor2,
            skill=SkillFactory(name="Elementary English", related_with=["English"]),
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
            subjects=["English"],
        )

    def test_views_for_admin_required(self):
        error_msg = {"msg": "You are not permitted to access this data"}
        urls = [
            "/admin/request/rrr/request-pool-list/",
            "/admin/request/rrr/update-budget/",
            "/admin/request/rrr/add-tutors-client-pool/",
            "/admin/request-pool/333/update-details/",
            "/admin/request/rrr/booking/create/",
            "/admin/request/rrr/attach-tutor/",
        ]
        # all views should return 401 for non admin user
        for x in urls:
            res = self.client.get(
                x + f"?user_id={self.tutor.pk}", content_type="application/javascript"
            )
            self.assertEqual(json.loads(res.content), error_msg)

    def test_baserequest_tutor_list(self):
        res = self.client.get(
            "/admin/request/{}/request-pool-list/".format(self.request.slug),
            {"user_id": self.superuser.pk},
            content_type="application/javascript",
        )
        exp_result = {
            "tutors": [
                {
                    "pool_id": self.request_pool.pk,
                    "full_name": "Peter P",
                    "email": self.tutor.email,
                    "default_subject": None,
                    "approved": True,
                    "matched_subjects": [],
                    "cost": "5000.00",
                    "phone_no": self.request_pool.tutor.phonenumber_set.all()[
                        0
                    ].number.raw_input,
                    "address": self.request_pool.get_tutor_address.full_address,
                    "teaches_all": True,
                },
                {
                    "pool_id": self.request_pool2.pk,
                    "full_name": "Moses I",
                    "email": self.tutor2.email,
                    "default_subject": None,
                    "approved": False,
                    "matched_subjects": [],
                    "cost": "3000.00",
                    "phone_no": self.request_pool2.tutor.phonenumber_set.all()[
                        0
                    ].number.raw_input,
                    "address": self.request_pool2.get_tutor_address.full_address,
                    "teaches_all": False,
                },
            ]
        }
        self.assertEqual(res.status_code, 200)
        self.assertEqual(json.loads(res.content), exp_result)

    @patch("connect_tutor.admin.send_profile_to_client.delay")
    def test_add_tutors_to_client_pool(self, mock_send):
        res = self.client.get(
            "/admin/request/{}/add-tutors-client-pool/".format(self.request.slug),
            {"user_id": self.superuser.pk},
            content_type="application/javascript",
        )

        mock_send.assert_called_with(self.request.pk)
        exp_result = {"msg": "Approved tutors added to client pool"}

        # test if the base_req is updated to pending
        base_req = BaseRequestTutor.objects.get(pk=self.request.pk)
        self.assertEqual(base_req.status, BaseRequestTutor.PENDING)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(json.loads(res.content), exp_result)

    @patch("connect_tutor.admin.send_profile_to_client.delay")
    def test_add_tutors_to_client_pool_does_not_adds_tutor_to_client_pool_when_no_approved_tutors_are_found(
        self, mock_send
    ):
        # change all the request pools' approve status to False
        RequestPool.objects.filter(req=self.request).update(approved=False)
        res = self.client.get(
            "/admin/request/{}/add-tutors-client-pool/".format(self.request.slug),
            {"user_id": self.superuser.pk},
            content_type="application/javascript",
        )

        mock_send.assert_not_called()
        exp_result = {"msg": "There are no approved tutors for this request"}

        self.assertEqual(res.status_code, 400)
        self.assertEqual(json.loads(res.content), exp_result)

    def test_update_client_budget(self):
        self.assertEqual(self.request.budget, 5000)
        res = self.client.post(
            "/admin/request/{}/update-budget/".format(self.request.slug),
            json.dumps({"user_id": self.superuser.pk, "new_budget": 4500}),
            content_type="application/javascript",
        )

        base_req = BaseRequestTutor.objects.get(pk=self.request.pk)

        # test if the base_req budget is updated
        self.assertEqual(base_req.budget, 4500)

    def test_request_pool_update_updates_tutor_price(self):
        self.assertEqual(self.request_pool2.cost, 3000)
        self.assertEqual(self.request_pool2.approved, False)

        res = self.client.post(
            "/admin/request-pool/{}/update-details/".format(self.request_pool2.pk),
            json.dumps({"cost": "4000", "user_id": self.superuser.pk}),
            content_type="application/javascript",
        )

        self.assertEqual(res.status_code, 200)
        req_pool = RequestPool.objects.get(pk=self.request_pool2.pk)

        self.assertEqual(req_pool.approved, False)
        self.assertEqual(req_pool.cost, Decimal(4000))

    def test_request_pool_update_updates_approve_status(self):
        self.assertEqual(self.request_pool2.approved, False)

        res = self.client.post(
            "/admin/request-pool/{}/update-details/".format(self.request_pool2.pk),
            json.dumps({"approved": True, "user_id": self.superuser.pk}),
            content_type="application/javascript",
        )

        self.assertEqual(res.status_code, 200)
        req_pool = RequestPool.objects.get(pk=self.request_pool2.pk)

        self.assertEqual(req_pool.approved, True)

        res = self.client.post(
            "/admin/request-pool/{}/update-details/".format(self.request_pool2.pk),
            json.dumps({"approved": False, "user_id": self.superuser.pk}),
            content_type="application/javascript",
        )

        req_pool = RequestPool.objects.get(pk=self.request_pool2.pk)

        self.assertEqual(req_pool.approved, False)

    def test_request_pool_update_updates_default_subject(self):
        self.assertEqual(self.request_pool2.default_subject, None)

        res = self.client.post(
            "/admin/request-pool/{}/update-details/".format(self.request_pool2.pk),
            json.dumps(
                {"default_subject": "Mathematics", "user_id": self.superuser.pk}
            ),
            content_type="application/javascript",
        )

        self.assertEqual(res.status_code, 200)
        req_pool = RequestPool.objects.get(pk=self.request_pool2.pk)

        self.assertEqual(req_pool.default_subject, "Mathematics")

    def test_create_booking_view(self):
        self.request.tutor = self.tutor
        self.request.save()
        res = self.client.post(
            "/admin/request/{}/booking/create/".format(self.request.slug),
            json.dumps(
                {
                    "user_id": self.superuser.pk,
                    "booking_sessions": [
                        {"start": "2018-10-01 10:00", "price": 1000, "no_of_hours": 2}
                    ],
                    "remark": "Booking remark",
                    "tutor_subject": "Elementary English",
                    "client_price": 2000,
                    "tutor_email": "peter@yahoo.com",
                }
            ),
            content_type="application/javascript",
        )
        self.assertEqual(res.status_code, 200)
        booking = Booking.objects.filter(user=self.superuser).first()
        self.assertTrue(booking)
        self.assertEqual(booking.remark, "Booking remark")
        bookingsessions = booking.bookingsession_set.all()

        for bs in bookingsessions:
            self.assertEqual(str(bs.start), "2018-10-01 09:00:00+00:00")
            self.assertEqual(bs.price, 1000)
            self.assertEqual(bs.no_of_hours, 2)
            self.assertEqual(bs.student_no, 1)

    def test_client_phone_number_renders_properly_for_user_with_phone_number(self):
        with self.login(email=self.superuser.email, password='secret'):
            res = self.client.get(
                "/we-are-allowed/external/baserequesttutor/"
            )
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.context['results'][0][1],
                             f'<th class="field-the_number"><a href="/we-are-allowed/external/baserequesttutor/{self.request.id}/change/">+2347035209976</a></th>')

    def test_client_phone_number_renders_properly_for_user_without_phone_number(self):
        self.request.number = '+NoneNone'
        self.request.email = self.superuser.email
        self.request.save()
        with self.login(email=self.superuser.email, password='secret'):
            res = self.client.get(
                "/we-are-allowed/external/baserequesttutor/"
            )
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.context['results'][0][1],
                             f'<th class="field-the_number"><a href="/we-are-allowed/external/baserequesttutor/{self.request.id}/change/">{self.superuser.email}</a></th>')

    def test_client_phone_number_renders_properly_for_user_phone_number_from_request_info(self):
        self.request.number = '+NoneNone'
        self.request.request_info = dict(personal_info=dict(phone_number="+2348064779197"))
        self.request.save()
        with self.login(email=self.superuser.email, password='secret'):
            res = self.client.get(
                "/we-are-allowed/external/baserequesttutor/"
            )
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.context['results'][0][1],
                             f'<th class="field-the_number"><a href="/we-are-allowed/external/baserequesttutor/{self.request.id}/change/">+2348064779197</a></th>')
