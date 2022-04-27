import datetime
from decimal import Decimal
import mock
from django.test import override_settings
from test_plus import TestCase
from config.settings.common import Common
from users.tests import factories as user_factories
from reviews.tests.factories import SkillReviewFactory
from django.contrib.admin.helpers import ACTION_CHECKBOX_NAME

# from skills.tasks import email_to_modify_skill
from django.urls import reverse
from external.models import BaseRequestTutor
from ..factories import BaseRequestTutorFactory
from skills.tests.factories import TutorSkillFactory
from skills.models import TutorSkill
from wallet.models import WalletTransaction, WalletTransactionType
from bookings.models import Booking
from bookings.tests import factories, utils
from wallet.tests.factories import WalletTransactionFactory

from mock import patch


@override_settings(
    CELERY_ALWAYS_EAGER=True,
    CELERY_TASK_ALWAYS_EAGER=True,
    TASK_ALWAYS_EAGER=True,
    task_always_eager=True,
    INSTALLED_APPS=Common.INSTALLED_APPS,
    MIDDLEWARE_CLASSES=Common.MIDDLEWARE_CLASSES,
)
class AdminActionTestCase(TestCase):

    def setUp(self):
        self.patcher = patch("external.tasks.tasks1.email_and_sms_helper")
        self.mock_helper = self.patcher.start()
        self.superuser = user_factories.UserFactory(
            username="super",
            first_name="Peter",
            email="super@example.com",
            is_superuser=True,
            is_staff=True,
        )
        self.superuser.set_password("secret")
        self.superuser.save()
        self.booking = utils.setup_dummy_booking_data("ABCDEFGHI", 4)
        self.user_wallet = self.booking.user.wallet
        self.booking.when_payment_is_made(self.booking.total_price)
        self.request = BaseRequestTutorFactory(
            status=BaseRequestTutor.PAYED,
            booking=self.booking,
            tutor=self.booking.get_tutor,
            user=self.booking.user,
            request_subjects=["English"],
            number="+2348090547843",
        )
        self.base_url = "admin:external_baserequesttutor_changelist"

    def login(self, **credentials):
        """ Login a user """
        return self.client.login(**credentials)

    def implement_action(self, callback, location=None, *args, **kwargs):
        # with self.login(username=self.superuser.email, password='secret'):
        self.login(username=self.superuser.email, password="secret")
        if location:
            response = self.client.post(reverse(location), *args, **kwargs)
        else:
            response = self.client.post(reverse(self.base_url), *args, **kwargs)
        callback(response)

    def make_action_call(self, action_name, baserequest, callback):
        """Helper method to make post requests to test actions"""
        action_data = {
            ACTION_CHECKBOX_NAME: [baserequest.pk],
            "action": action_name,
            "index": 0,
        }
        self.client.login(username=self.superuser.email, password="secret")
        self.client.post(reverse(self.base_url), action_data)
        request = BaseRequestTutor.objects.filter(pk=baserequest.pk).first()
        callback(request)

    def test_penalty_for_bookings_cancelled_before_commencement(self):
        """custom admin action to penalize tutors who cancelled bookings before lessons started"""
        self.assertEqual(BaseRequestTutor.objects.count(), 1)
        self.assertEqual(Booking.objects.scheduled().count(), 1)
        self.assertEqual(self.booking.tutor.wallet.transactions.count(), 0)
        self.assertEqual(self.request.tutor.wallet.transactions.count(), 0)
        old_amount_available = self.booking.tutor.wallet.amount_available
        old_user_balance = self.user_wallet.amount_available

        def callback(request1):
            tutor_wallet = request1.tutor.wallet
            self.assertEqual(
                (old_amount_available - 5000), tutor_wallet.amount_available
            )
            wallet_transactions = tutor_wallet.transactions
            self.assertEqual(wallet_transactions.count(), 1)
            self.assertEqual(
                wallet_transactions.first().type, WalletTransactionType.ABSCONDED
            )
            self.assertEqual(wallet_transactions.first().amount, 5000)
            booking = Booking.objects.filter(pk=self.booking.pk).exists()
            self.assertFalse(booking)
            self.assertEqual(
                WalletTransaction.objects.filter(
                    wallet=self.user_wallet, type=WalletTransactionType.TUTOR_HIRE
                ).count(),
                0,
            )
            self.assertEqual(
                WalletTransaction.objects.filter(
                    wallet=self.user_wallet, type=WalletTransactionType.REFUND
                ).count(),
                1,
            )
            self.assertEqual(old_user_balance, self.user_wallet.amount_available)

        self.make_action_call(
            "penalize_tutor_for_cancelling_before_commencement", self.request, callback
        )

    def test_penalty_works_on_request_with_no_booking(self):
        # add more users and bookings
        user = factories.UserFactory(
            email="em@ya.com",
            first_name="Obi2",
            last_name="Uchenna2",
            username="othree2",
        )
        tutor = factories.UserFactory(
            email="name@domain.com",
            first_name="Tutor2",
            last_name="LastName",
            username="tutor2",
        )
        tutor_phone_number = factories.PhoneNumberFactory(
            owner=tutor,
            primary=True,
            # number="+234657899876"
        )
        user_phone_number = factories.PhoneNumberFactory(
            owner=user, number="+234657899876"
        )
        request2 = BaseRequestTutorFactory(
            status=BaseRequestTutor.PAYED, booking=None, tutor=tutor, user=user
        )
        self.assertEqual(request2.booking, None)
        old_amount_available = request2.tutor.wallet.amount_available

        def callback(request2):
            tutor_wallet = request2.tutor.wallet
            self.assertEqual(
                (old_amount_available - 5000), tutor_wallet.amount_available
            )
            wallet_transactions = tutor_wallet.transactions
            self.assertEqual(wallet_transactions.count(), 1)
            self.assertEqual(
                wallet_transactions.first().type, WalletTransactionType.ABSCONDED
            )
            self.assertEqual(wallet_transactions.first().amount, 5000)

        self.make_action_call(
            "penalize_tutor_for_cancelling_before_commencement", request2, callback
        )

    def test_send_issued_email_sends_an_email_to_client(self):

        def callback(request1):
            pass

        self.make_action_call("send_issued_email", self.request, callback)
        self.mock_helper.assert_called_once_with(
            {
                "to": "daviduchenna@outlook.com",
                "title": "You made a booking on tuteria?",
                "template": "issued_request_reminder",
                "context": {
                    "user": {"first_name": "Obi", "requested_subject": "English"}
                },
            },
            sms_options={
                "sender": "+2348090547843",
                "body": (
                    "Looking for a very good tutor near you?"
                    "Call Tuteria on 09094526878 or chat with us here: bit.ly/WhatsappTuteria"
                ),
                "receiver": "+2348090547843",
            },
            backend="sendgrid_backend",
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_send_issued_email_sends_an_email_to_client_with_no_first_name(self):

        def callback(request1):
            pass

        self.request.first_name = ""
        self.request.email = "daviduchenna@outlook.com"
        self.request.user = None
        self.request.save()
        self.make_action_call("send_issued_email", self.request, callback)
        self.mock_helper.assert_called_once_with(
            {
                "to": "daviduchenna@outlook.com",
                "title": "You made a booking on tuteria?",
                "template": "issued_request_reminder",
                "context": {
                    "user": {"first_name": "Friend", "requested_subject": "English"}
                },
            },
            sms_options={
                "sender": "+2348090547843",
                "body": (
                    "Looking for a very good tutor near you?"
                    "Call Tuteria on 09094526878 or chat with us here: bit.ly/WhatsappTuteria"
                ),
                "receiver": "+2348090547843",
            },
            backend="sendgrid_backend",
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_send_issued_email_sends_an_email_to_client_with_empty_request_subjects(
        self
    ):

        def callback(request1):
            pass

        self.request.request_subjects = []
        self.request.save()
        self.make_action_call("send_issued_email", self.request, callback)
        self.mock_helper.assert_called_once_with(
            {
                "to": "daviduchenna@outlook.com",
                "title": "You made a booking on tuteria?",
                "template": "issued_request_reminder",
                "context": {
                    "user": {"first_name": "Obi", "requested_subject": "a subject"}
                },
            },
            sms_options={
                "sender": "+2348090547843",
                "body": (
                    "Looking for a very good tutor near you?"
                    "Call Tuteria on 09094526878 or chat with us here: bit.ly/WhatsappTuteria"
                ),
                "receiver": "+2348090547843",
            },
            backend="sendgrid_backend",
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_send_issued_email_sends_an_email_to_client_with_no_request_subjects(self):

        def callback(request1):
            pass

        self.request.request_subjects = None
        self.request.save()
        self.make_action_call("send_issued_email", self.request, callback)
        self.mock_helper.assert_called_once_with(
            {
                "to": "daviduchenna@outlook.com",
                "title": "You made a booking on tuteria?",
                "template": "issued_request_reminder",
                "context": {
                    "user": {"first_name": "Obi", "requested_subject": "a subject"}
                },
            },
            sms_options={
                "sender": "+2348090547843",
                "body": (
                    "Looking for a very good tutor near you?"
                    "Call Tuteria on 09094526878 or chat with us here: bit.ly/WhatsappTuteria"
                ),
                "receiver": "+2348090547843",
            },
            backend="sendgrid_backend",
            from_mail="Tuteria <info@tuteria.com>",
        )


@override_settings(
    CELERY_ALWAYS_EAGER=True,
    CELERY_TASK_ALWAYS_EAGER=True,
    TASK_ALWAYS_EAGER=True,
    task_always_eager=True,
    INSTALLED_APPS=Common.INSTALLED_APPS,
    MIDDLEWARE_CLASSES=Common.MIDDLEWARE_CLASSES,
)
class TutorSkillAdminTestCase(TestCase):

    def setUp(self):
        self.superuser = user_factories.UserFactory(
            username="super",
            first_name="Peter",
            email="super@example.com",
            is_superuser=True,
            is_staff=True,
        )
        self.superuser.save()
        self.user = user_factories.UserFactory()
        self.tutor_skill = TutorSkillFactory(tutor=self.user)

    @mock.patch("skills.tasks.email_to_modify_skill.delay")
    def test_reqire_modification_action_works(self, modify_skill_call):
        with self.login(email=self.superuser.email, password="password"):
            action_data = {
                ACTION_CHECKBOX_NAME: [self.tutor_skill.pk],
                "action": "require_modiication",
                "index": 0,
            }
            response = self.client.post(
                reverse("admin:skills_tutorskill_changelist"), action_data
            )
            modify_skill_call.assert_called()
            self.tutor_skill = TutorSkill.objects.get(pk=self.tutor_skill.pk)
            self.assertEqual(self.tutor_skill.status, TutorSkill.MODIFICATION)
