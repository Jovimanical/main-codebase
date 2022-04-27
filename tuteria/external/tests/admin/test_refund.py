from test_plus.test import TestCase, APITestCase
from external.models import BaseRequestTutor
from users.services import CustomerService
from ..factories import BaseRequestTutorFactory
import json


class RefundTutorViewTestCase(APITestCase):

    def setUp(self):
        # create request.
        self.rq = BaseRequestTutorFactory(
            first_name="John",
            last_name="Doe",
            email="j@example.com",
            booking=None,
            status=BaseRequestTutor.COMPLETED,
        )
        # create account for request
        user, _ = CustomerService.create_user_instance(
            email=self.rq.email,
            first_name=self.rq.first_name,
            last_name=self.rq.last_name,
            number=self.rq.number,
        )
        self.rq.user = user
        self.rq.save()
        # trigger payment of processing fee
        self.rq.pay_processing_fee()
        pass

    def post_request(self):
        response = self.post(
            f"/admin/userpayout/{self.rq.pk}/",
            data={
                "account_id": "0003335555",
                "account_name": "Tundu Wada",
                "bank": "Guaranty Trust Bank",
            },
            extra={"format": "json"},
        )
        self.payout = self.rq.user.userpayout_set.first()

    def test_initial_request_has_paid_processing_fee(self):
        self.assertIsNotNone(self.rq.user)
        self.assertEqual(self.rq.user.email, self.rq.email)
        self.assertEqual(self.rq.status, BaseRequestTutor.COMPLETED)
        self.assertTrue(self.rq.paid_fee)
        self.assertEqual(self.rq.user.wallet.transactions.processing_fee().count(), 1)

    def test_payout_record_is_created(self):
        self.post_request()
        self.assertEqual(self.payout.account_id, "0003335555")
        self.assertEqual(self.payout.bank, "Guaranty Trust Bank"),
        self.assertEqual(self.payout.account_name, "Tundu Wada")

    def test_old_processing_fee_record_is_removed(self):
        self.post_request()
        self.assertEqual(self.rq.user.wallet.transactions.processing_fee().count(), 0)

    def test_transaction_record_for_withdrawal_is_created(self):
        self.post_request()
        rw = self.payout.requesttowithdraw_set.first()
        self.assertEqual(rw.amount, 2600)

    def test_request_is_updated(self):
        self.post_request()
        self.rq = BaseRequestTutor.objects.get(pk=self.rq.pk)
        self.assertEqual(self.rq.status, BaseRequestTutor.COLD)
        self.assertFalse(self.rq.paid_fee)
