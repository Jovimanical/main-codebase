from test_plus.test import TestCase

# from connect_tutor import tasks
from django.urls import reverse
from users.tests.factories import UserFactory, PhoneNumberFactory
from external.tests.factories import BaseRequestTutorFactory
import pytest


class ConnectTutorTaskTestCase(TestCase):
    def setUp(self):
        self.user = UserFactory(first_name="Biola", last_name="James")
        self.client = UserFactory(first_name="Clark", last_name="Kent")
        PhoneNumberFactory(owner=self.user, number="+2347035209988")
        self.requests = BaseRequestTutorFactory(
            user=self.client,
            booking=None,
            tutor=None,
            first_name="Clark",
            last_name="Kent",
            slug="ADEDSFESDESF",
            is_parent_request=True,
            expectation="A Professional",
            budget=40000,
            state="Lagos",
            vicinity="Ajah",
            request_subjects=["English Language"],
        )

    def test_request_pool_detail_view(self):
        resp = self.post(reverse("job-details", args=[self.requests.slug]))


