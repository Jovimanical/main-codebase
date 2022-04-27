import datetime
from mock import patch, call
from test_plus.test import TestCase
from external import tasks
from users.context_processors import TuteriaDetail
from skills.tests.factories import TutorSkillFactory
from bookings.tests.factories import BookingFactory, BookingSessionFactory
from users.tests.factories import UserFactory, PhoneNumberFactory
from .factories import BaseRequestTutorFactory, AgentFactory, DepositFactory
from referrals.models import Referral


class ExternalTasksTestCase(TestCase):

    def setUp(self):
        self.patcher = patch("external.tasks.tasks1.email_and_sms_helper")
        self.mock_helper = self.patcher.start()
        self.user = UserFactory(first_name="Biola", last_name="James")
        PhoneNumberFactory(owner=self.user, number="+2347035209988")
        self.agent = AgentFactory(
            user=self.user, name="agent1", title="agent3", email="agent4@gmail.com"
        )
        self.booking = BookingFactory(
            user=self.user, tutor=self.user, order="ABCDEFGHIJKL"
        )
        BookingSessionFactory(booking=self.booking, price=3000)
        BookingSessionFactory(booking=self.booking, price=5000)
        self.skills = TutorSkillFactory.create_5_skills(self.user)

        self.requests = BaseRequestTutorFactory(
            agent=self.agent,
            email="b@example.com",
            tutor=self.user,
            booking=self.booking,
            user=self.user,
            number="+234705356870",
            no_of_students=3,
            hours_per_day=4,
            days_per_week=2,
            payment_date=datetime.datetime.now(),
            ts=self.skills[0],
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
        self.deposit = DepositFactory(
            request=self.requests, amount=5000, user=self.user, order="ABDESFESFESS"
        )

    def tearDown(self):
        self.patcher.stop()

    def test_email_sent_after_completing_request(self):
        tasks.email_sent_after_completing_request(self.requests.pk)
        self.mock_helper.assert_called_once_with(
            {
                "to": self.requests.email,
                "title": "Thanks {}, we've received your request".format(
                    self.requests.first_name
                ),
                "template": "request_tutor_completed",
                "context": {
                    "request_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "state": self.requests.state,
                        "slug": self.requests.slug,
                        "email": self.requests.email,
                        "agent": {
                            "first_name": self.requests.agent.user.first_name,
                            "last_name": self.requests.agent.user.last_name,
                            "title": self.requests.agent.title,
                            "email": self.requests.agent.email,
                            "phone_number": self.requests.get_agent.phone_number,
                        },
                    },
                    "password": self.requests.first_name.lower()
                    + self.requests.last_name.lower(),
                    "same_password": False,
                },
            },
            sms_options={
                "sender": str(self.requests.number),
                "body": (
                    "Hi {}, ! We've received your request for "
                    "{} Lessons in {}. Expect our "
                    "response shortly. Got questions? Call us: {}. Thank you!"
                ).format(
                    self.requests.first_name,
                    self.requests.request_subjects[0],
                    self.requests.state,
                    # "s",
                    self.requests.get_agent.phone_number,
                ),
                "receiver": str(self.requests.number),
            },
            backend="mandrill_backend",
            from_mail="Tuteria <automated@tuteria.com>",
        )

    def test_send_email_notification_to_tutor_on_request(self):
        tasks.send_email_notification_to_tutor_on_request(self.requests)
        self.mock_helper.assert_called_with(
            {
                "to": self.requests.tutor.email,
                "title": "New Client Request",
                "template": "tutor_notify_request",
                "context": {
                    "request_instance": {
                        "slug": self.requests.slug,
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "get_vicinity": self.requests.get_vicinity(),
                        "tutor": {
                            "first_name": self.requests.tutor.first_name,
                            "email": self.requests.tutor.email,
                        },
                        "request_subjects": self.requests.request_subjects,
                    }
                },
            },
            backend="mandrill_backend",
            from_mail="Tuteria <automated@tuteria.com>",
        )

    def test_email_on_large_deposit(self):
        tasks.email_on_large_deposit(self.deposit.pk)
        self.mock_helper.assert_called_once_with(
            {
                "to": self.deposit.user.email,
                "title": "Receipt for Discount Lesson Purchase",
                "template": "large_deposits",
                "context": {
                    "deposit": {
                        "user": {
                            "first_name": self.deposit.user.first_name,
                            "last_name": self.deposit.user.last_name,
                            "wallet": {
                                "amount_available": float(
                                    self.deposit.user.wallet.amount_available
                                )
                            },
                        },
                        "discount_used": float(self.deposit.discount_used()),
                        "amount_top_up": float(self.deposit.amount_top_up()),
                        "order": self.deposit.order,
                        "created": self.deposit.created.isoformat(),
                    }
                },
            },
            backend="mandrill_backend",
        )

    def test_generic_email_send(self):
        tasks.generic_email_send(self.requests.pk)
        self.mock_helper.assert_called_with(
            {
                "to": self.requests.email,
                "title": "Is your Child Prepared for the New Academic Year?",
                "template": "school_resume",
                "context": {
                    "user": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                    }
                },
            },
            backend="mandrill_backend",
        )

    def test_send_notification_to_client(self):
        tasks.send_notification_to_client(self.requests.pk)
        self.mock_helper.assert_called_with(
            {
                "to": self.requests.email,
                "title": "Payment Invoice for Lesson Request {}".format(
                    self.requests.booking.order
                ),
                "template": "booking_payment_request_to_client",
                "context": {
                    "request_instance": {
                        "get_absolute_url": self.requests.get_absolute_url(),
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "ts": {"skill": {"name": self.requests.ts.skill.name}},
                        "hours_per_day": self.requests.hours_per_day,
                        "tutor": {
                            "first_name": self.requests.tutor.first_name,
                            "last_name": self.requests.tutor.last_name,
                        },
                        "booking": {
                            "total_price": float(self.requests.booking.total_price),
                            "bookingsession_set": list(
                                self.requests.booking.bookingsession_set.values_list(
                                    "pk", flat=True
                                )
                            ),
                        },
                    }
                },
            },
            backend="mandrill_backend",
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_mail_to_client_and_admin_to_pay(self):
        tasks.mail_to_client_and_amdin_to_pay(self.requests)
        request_instance = {
            "slug": self.requests.slug,
            "first_name": self.requests.first_name,
            "last_name": self.requests.last_name,
            "number": str(self.requests.number),
            "email": self.requests.email,
            "payment_date": self.requests.payment_date.isoformat(),
            "booking": {
                "total_price": float(self.requests.booking.total_price),
                "order": self.requests.booking.order,
            },
        }

        self.mock_helper.assert_any_call(
            {
                "to": self.requests.email,
                "title": "Re: Lesson Payment Notice",
                "template": "client_reminder_to_make_payment",
                "context": {"request_instance": request_instance},
            },
            sms_options={
                "sender": self.requests.number,
                "body": (
                    "Hi {}! We've just sent you an email to see the recommended "
                    "tutors. Please check right away or call Godwin on 09094526878 if "
                    "you didn't get it."
                ).format(self.requests.first_name),
                "receiver": str(self.requests.number),
            },
            backend="mandrill_backend",
            from_mail="Tuteria <info@tuteria.com>",
        )
        self.mock_helper.assert_any_call(
            {
                "to": "info@tuteria.com",
                "title": "PaymentTime: {}, N{}".format(
                    self.requests.first_name, self.requests.booking.total_price
                ),
                "template": "admin_reminder_to_make_payment",
                "context": {"request_instance": request_instance},
            },
            backend="mandrill_backend",
        )

    def test_send_phone_number_to_client(self):
        tuteria_details = TuteriaDetail()
        tasks.send_phone_numbers_to_clients(self.requests.pk)
        self.mock_helper.assert_called_with(
            sms_options={
                "sender": self.requests.number,
                "body": (
                    "Here's our bank details. "
                    "GTB: Tuteria Limited, {} "
                    "UBA: Tuteria Limited, {}."
                    "Zenith: Tuteria Limited, {}"
                ).format(
                    tuteria_details.gt["account"],
                    tuteria_details.uba["account"],
                    tuteria_details.zenith["account"],
                ),
                "receiver": str(self.requests.number),
            }
        )

    def test_send_email_on_new_booking(self):
        tasks.send_email_on_new_booking(self.deposit.pk)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.deposit.request.email,
                "title": "Recurrent Lesson Payment",
                "template": "reschedule_class",
                "context": {
                    "deposit": {
                        "order": self.deposit.order,
                        "request": {
                            "first_name": self.requests.first_name,
                            "last_name": self.requests.last_name,
                            "email": self.requests.email,
                        },
                    },
                    "same_password": False,
                    "password": self.requests.first_name.lower()
                    + self.requests.last_name.lower(),
                },
            },
            sms_options={
                "sender": self.requests.number,
                "body": "Hi {}, we've scheduled lessons for the next period and sent you an email link. Please check your email to confirm. Thanks. 09094526878".format(
                    self.requests.first_name
                ),
                "receiver": str(self.requests.number),
            },
        )

    def test_send_notification_of_processing_fee_to_cllient(self):
        tasks.send_notification_of_processing_fee_to_client(self.requests.pk)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Processing Fee Payment for Request ID: %s" % self.requests.id,
                "template": "processing_fee_notice",
                "context": {
                    "request_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "slug": self.requests.slug,
                        "processing_fee": 3000,
                        "created": self.requests.created.isoformat(),
                    }
                },
            },
            sms_options={
                "sender": self.requests.number,
                "body": "Processing Fee notification notice {}".format(
                    self.requests.first_name
                ),
                "receiver": str(self.requests.number),
            },
        )

    def test_second_processing_fee_notification_notice(self):
        tasks.send_second_processing_fee_notification_notice(self.requests.pk)
        a = TuteriaDetail()
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Processing Fee Payment to Get a Tutor",
                "template": "email-to-pay-processing-fee",
                "context": {
                    "user": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                    },
                    "settings": {"PROCESSING_FEE": float(a.processing_fee)},
                },
            },
            sms_options={
                "sender": self.requests.number,
                "body": "Hi {}, pls be reminded to pay the N{} processing fee so we can proceed to get your tutor: GTB, {}, {}. Helpline: {}".format(
                    self.requests.first_name,
                    float(a.processing_fee),
                    a.gt["name"],
                    a.gt["account"],
                    a.mobile_number,
                ),
                "receiver": str(self.requests.number),
            },
        )

    def test_follow_up_mail_after_finding_tutors(self):
        tasks.follow_up_mail_after_finding_tutors(self.requests.pk)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Re: I need your feedback. What do you think?",
                "template": "follow_up",
                "context": {
                    "request_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "slug": self.requests.slug,
                    }
                },
            }
        )

    def test_first_email_drip_for_pending_requests(self):
        tasks.email_drip_for_pending_request(self.requests, 4)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "{}, here's 10% off your lesson cost!".format(
                    self.requests.first_name
                ),
                "template": "request_pending_first_drip",
                "context": {
                    "req_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "request_subjects": self.requests.request_subjects,
                        "get_absolute_url": self.requests.get_absolute_url(),
                    }
                },
            },
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_second_email_drip_for_pending_requests(self):
        tasks.email_drip_for_pending_request(self.requests, 5)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Don't procrastinate - take 15% off lesson fee",
                "template": "request_pending_second_drip",
                "context": {
                    "req_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "request_subjects": self.requests.request_subjects,
                        "get_absolute_url": self.requests.get_absolute_url(),
                    }
                },
            },
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_third_email_drip_for_pending_request(self):
        tasks.email_drip_for_pending_request(self.requests, 6)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Last Chance - Take 20% Off!",
                "template": "request_pending_third_drip",
                "context": {
                    "req_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "request_subjects": self.requests.request_subjects,
                        "get_absolute_url": self.requests.get_absolute_url(),
                    }
                },
            },
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_first_email_drip_for_request_not_is_parent(self):
        self.requests.is_parent_request = False
        self.requests.save()
        tasks.email_drip_for_request(self.requests, 1)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Need a tutor for {} in your area?".format(
                    self.requests.request_subjects[0]
                ),
                "template": "request_first_drip",
                "context": {
                    "req_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "is_parent_request": self.requests.is_parent_request,
                        "request_subjects": self.requests.request_subjects,
                        "slug": self.requests.slug,
                    }
                },
            },
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_first_email_drip_for_request_is_parent(self):
        self.requests.is_parent_request = True
        self.requests.save()
        tasks.email_drip_for_request(self.requests, 1)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Need a home tutor in {}?".format(
                    self.requests.get_vicinity()
                ),
                "template": "request_first_drip",
                "context": {
                    "req_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "is_parent_request": self.requests.is_parent_request,
                        "request_subjects": self.requests.request_subjects,
                        "slug": self.requests.slug,
                    }
                },
            },
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_second_email_drip_for_request(self):
        tasks.email_drip_for_request(self.requests, 2)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Get N1500 off your first lesson!",
                "template": "request_second_drip",
                "context": {
                    "req_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "is_parent_request": self.requests.is_parent_request,
                        "request_subjects": self.requests.request_subjects,
                        "slug": self.requests.slug,
                    }
                },
            },
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_third_email_drip_for_request(self):
        tasks.email_drip_for_request(self.requests, 3)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Get THE BEST tutors in your area!",
                "template": "request_third_drip",
                "context": {
                    "req_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "is_parent_request": self.requests.is_parent_request,
                        "request_subjects": self.requests.request_subjects,
                        "slug": self.requests.slug,
                    }
                },
            },
            from_mail="Tuteria <info@tuteria.com>",
        )

    def test_email_to_former_customers(self):
        tasks.emails_to_former_customers(self.requests.pk)
        self.mock_helper.assert_called_with(
            booking={
                "to": self.requests.email,
                "title": "Hi %s, how are your kids performing now?"
                % (self.requests.first_name,),
                "template": "re-engage-old-clients",
                "context": {
                    "req_instance": {
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                    }
                },
            },
            from_mail="Info <info@tuteria.com>",
        )

    # mail_sender(user, subject, approved_tutors, multiple, title, tutor=None)
    def test_send_profile_to_client(self):
        Referral.get_instance(self.requests.user)
        tasks.mail_sender(
            self.requests,
            "Mathematic, English, French",
            ["Moses", "Fejiro", "Clement"],
            True,
            "Re: Please review English, Home Tutors around Lekki",
        )
        # tutors = self.requests.approved_tutors()
        # tutor_names = [x.tutor.first_name for x in tutors]
        # tutor = tutors[0]
        # subjects = tutor.subjects

        self.mock_helper.assert_called_with(
            {
                "to": self.requests.email,
                "title": "Re: Please review English, Home Tutors around Lekki",
                "template": "tutor_profile_to_client",
                "context": {
                    "subjects": "Mathematic, English, French",
                    "same_password": False,
                    "password": self.requests.first_name.lower()
                    + self.requests.last_name.lower(),
                    "request_instance": {
                        "get_agent": {
                            "name": self.requests.get_agent.name,
                            "phone_number": self.requests.get_agent.phone_number,
                        },
                        "no_of_students": self.requests.no_of_students,
                        "budget": float(self.requests.budget),
                        "no_of_month_to_display": self.requests.no_of_month_to_display(),
                        "user": {
                            "ref_instance": {
                                "percent_discount": self.requests.user.ref_instance.percent_discount
                            }
                        },
                        "first_name": self.requests.first_name,
                        "last_name": self.requests.last_name,
                        "get_vicinity": self.requests.vicinity,
                        "get_hours_per_day_display": self.requests.hours_per_day,
                        "available_days": self.requests.available_days,
                        "request": {"approved_tutors": ["Moses", "Fejiro", "Clement"]},
                        "get_absolute_url": self.requests.get_absolute_url(),
                        "email": self.requests.email,
                    },
                    "multiple": True,
                },
            },
            backend="mandrill_backend",
            client_type="twilio",
            from_mail="Tuteria <info@tuteria.com>",
            sms_options={
                "sender": self.requests.number,
                "body": "Hi {}! Pls click here to view the tutors we got for you: {}. Check your mail for details or call {}".format(
                    self.requests.first_name,
                    "http://www.tuteria.com%s" % (self.requests.get_absolute_url()),
                    self.requests.get_agent.phone_number,
                ),
                "receiver": str(self.requests.number),
            },
        )
