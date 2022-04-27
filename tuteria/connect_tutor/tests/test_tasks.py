from mock import patch, call
from test_plus.test import TestCase
from connect_tutor import tasks
from users.tests.factories import UserFactory, PhoneNumberFactory
from external.tests.factories import BaseRequestTutorFactory


class ConnectTutorTaskTestCase(TestCase):

    def setUp(self):
        self.patcher = patch("connect_tutor.tasks.email_and_sms_helper")
        self.mock_helper = self.patcher.start()
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

    def tearDown(self):
        self.patcher.stop()

    def test_email_for_new_tutor_opportunity(self):
        tasks.email_for_new_tutor_opportunity(self.user, [self.requests], "Evening")
        self.mock_helper.assert_called_with(
            {
                "to": self.user.email,
                "title": "New Tutoring Opportunity",
                "template": "request_blast",
                "context": {
                    "user": {
                        "first_name": self.user.first_name,
                        "last_name": self.user.last_name,
                        "earning_percent": self.user.earning_percent(),
                    },
                    "dates": "Evening",
                    "requests": [
                        {
                            "first_name": x.first_name,
                            "last_name": x.last_name,
                            "is_parent_request": x.is_parent_request,
                            "request_subjects": x.request_subjects,
                            "expectation": x.expectation,
                            "get_vicinity": x.get_vicinity(),
                            "budget": float(x.budget),
                            "request_detail_url": x.request_detail_url(),
                            "created": x.created.isoformat(),
                        }
                        for x in [self.requests]
                    ],
                },
            },
            backend="mandrill_backend",
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_mail_to_tutor_on_request_application(self):
        tasks.mail_to_tutor_on_request_application(self.requests.pk, self.user.pk)
        self.mock_helper.assert_called_with(
            {
                "to": self.user.email,
                "title": "Interested in this tutoring opportunity?",
                "template": "manual_email_to_tutors",
                "context": {
                    "user": {
                        "first_name": self.user.first_name,
                        "last_name": self.user.last_name,
                    },
                    "request": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "request_subjects": self.requests.request_subjects,
                        "expectation": self.requests.expectation,
                        "per_hour": self.requests.per_hour(),
                        "get_vicinity": self.requests.get_vicinity(),
                        "state": self.requests.state,
                        "slug": self.requests.slug,
                    },
                },
            },
            backend="mailgun_backend",
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_send_mail_to_update_skills(self):
        tasks.send_mail_to_update_skills(
            self.user.id, self.requests.id, self.requests.request_subjects
        )
        self.mock_helper.assert_called_with(
            {
                "to": self.user.email,
                "title": "Please attend to this urgently",
                "template": "update_skill_tutor",
                "context": {
                    "subjects": self.requests.request_subjects,
                    "user": {
                        "first_name": self.user.first_name,
                        "last_name": self.user.last_name,
                    },
                    "request": {"get_vicinity": self.requests.get_vicinity()},
                },
            },
            sms_options={
                "sender": str(self.user.primary_phone_no.number),
                "body": "Hi {}, we CAN'T send ur profile to the client till you add the needed subjects. Please check ur email right away and treat urgently.".format(
                    self.user.first_name
                ),
                "receiver": str(self.user.primary_phone_no.number),
            },
            backend="mailgun_backend",
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_send_mail_to_tutors_to_update_exhibitions(self):
        tasks.send_mail_to_tutors_to_update_exhibitions(
            self.user.pk, self.requests.pk, self.requests.request_subjects
        )
        self.mock_helper.assert_called_with(
            {
                "to": self.user.email,
                "title": "Please attend to this urgently",
                "template": "update_exhibition_tutor",
                "context": {
                    "subjects": self.requests.request_subjects,
                    "user": {
                        "first_name": self.user.first_name,
                        "last_name": self.user.last_name,
                    },
                    "request": {"get_vicinity": self.requests.get_vicinity()},
                },
            },
            backend="mailgun_backend",
            sms_options={
                "sender": str(self.user.primary_phone_no.number),
                "body": "Hi {}, we CAN'T send your profile to the client till you upload some images. Please check your email right away and treat urgently".format(
                    self.user.first_name
                ),
                "receiver": str(self.user.primary_phone_no.number),
            },
            from_mail="Tuteria <info@tuteria.com>",
        )
