from decimal import Decimal
import json
import datetime
from unittest.mock import patch, call
from test_plus.test import TestCase
from . import utils as test_utils
from django.test import override_settings
from users.models import User
from external.models import BaseRequestTutor, Agent
from config.utils import generate_code
from django.conf import settings
from skills.tests import factories as skill_factory
from config.settings.common import Common

mutation_data = {
    # "kind" : "exams",
    "lesson_info": {
        "exam": "ielts",
        "lesson_plan": "Extended",
        "amount": "58000",
        "schedule": {
            "start_date": "October 24, 2018",
            "date_summary": "October 24, 2018 - October 30, 2018",
            "summary": "November Weekend Morning Class",
            "duration": "10am - 2pm",
        },
        "state": "Lagos",
        "location": "Surulere",
        "curriculum_link": "//assets.ctfassets.net/tp6rlg4xcwsc/1rN7EyhShS8K48…8f1f933c092b9f/IELTS_Extended_Plan_Curriculum.pdf",
        "venue": "Event Center Surulere Lagos",
        "tutor": {
            "first_name": "Shola",
            "last_name": "Shope",
            "phone_no": "+234023232323",
            "email": "shola@example.com",
        },
    },
    "personal_info": {
        "first_name": "Danny",
        "last_name": "Novak",
        "email": "danny@example.com",
        "phone_number": "2347035208822",
        "how_you_heard": "12",
    },
}
payment_details = {
    "amount": 58000,
    "order": "MCYN9OWEOBWA",
    "currency": "ngn",
    "base_country": "NG",
    "description": "Gold Flower",
    "discount": 0,
    "user_details": {
        "first_name": "Danny",
        "last_name": "Novac",
        "country": "Nigeria",
        "email": "danny@example.com",
        "phone_number": "2347035208822",
        "key": "pk_test_3f76b7ddac49c6e97f490292425c14708df96c68",
        "redirect_url": "https://payment.careerlyft.com/paystack/verify-payment/MCYN9OWEOBWA/?amount=400000",
        "kind": "paystack",
        "js_script": "https://js.paystack.co/v1/inline.js",
    },
    # paid: false,
}


@override_settings(
    CELERY_ALWAYS_EAGER=True,
    INSTALLED_APPS=Common.INSTALLED_APPS,
    MIDDLEWARE_CLASSES=Common.MIDDLEWARE_CLASSES,
)
class GroupLessonTestCase(TestCase):
    maxDiff = None
    email = "danny@example.com"

    def setUp(self):
        self.patch = patch("external.tasks.tasks1.email_and_sms_helper")
        self.mocker = self.patch.start()
        self.create_tutor()

        self.agent = Agent.objects.create(
            image="shola1.png",
            type=Agent.GROUP,
            phone_number="+2348033222233",
            email="tunji@tuteria.com",
            name="Tunji",
            title="Mr",
        )

    def tearDown(self):
        self.patch.stop()

    def create_existing_user_with_request(self, create_user=True):
        if create_user:
            self.user = User(email=self.email, first_name="Danny", last_name="Novak")
            self.user.save()
        self.br = BaseRequestTutor.objects.create(
            first_name="Danny",
            last_name="Novak",
            email=self.email,
            slug=generate_code(BaseRequestTutor, "slug"),
        )
        self.br.number = "+2347035208822"
        self.br.request_info = mutation_data
        if create_user:
            self.br.user = self.user
        self.br.save()
        return self.br.slug

    def graphql_mutation(self, **data):
        # data["variables"] = test_utils.j(**data["variables"])
        return self.client.post(
            test_utils.url_string(), test_utils.j(**data), "application/json"
        )

    def assert_response(self, response, callback):
        data = response.json().get("data")
        if not data:
            import pdb

            pdb.set_trace()
        user = User.objects.filter(email=self.email).first()
        return callback(data, user)

    def make_mutation_call(self, mutation_data, mutation, mutationName, callback):
        response = self.graphql_mutation(
            operationName=mutationName, query=mutation, variables=mutation_data
        )

        def assert_callback(json_data, user):
            data = json_data[mutationName]
            return callback(data, user)

        return self.assert_response(response, assert_callback)

    def user_details(self):
        return {
            key: str(getattr(self.user, key))
            for key in ["first_name", "last_name", "email"]
        }

    def create_tutor(self):
        User.objects.create(
            email="shola@example.com", first_name="Shola", last_name="Shope"
        )

    def initial_mutation(self, callback):
        mutationName = "createGroupLessonRecord"
        mutation = """
         mutation %s($lesson_info: LessonInfoType!, $personal_info: UserDetailInput!){
            %s(lesson_info: $lesson_info, personal_info: $personal_info){ 
                slug
                payment_details
             }
        }
        """ % (
            mutationName,
            mutationName,
        )
        return self.make_mutation_call(mutation_data, mutation, mutationName, callback)

    def test_save_initial_request_mutation(self):
        def callback(json_data, user):
            personal_info = mutation_data["personal_info"]
            slug = json_data["slug"]
            payment_record = json_data["payment_details"]
            base_request = BaseRequestTutor.objects.get(slug=slug)
            self.assertEqual(base_request.state, mutation_data["lesson_info"]["state"])
            self.assertEqual(
                base_request.vicinity, mutation_data["lesson_info"]["location"]
            )

            for key in ["first_name", "last_name", "email"]:
                self.assertEqual(getattr(base_request, key), personal_info[key])
            if personal_info["how_you_heard"]:
                self.assertEqual(
                    base_request.where_you_heard, personal_info["how_you_heard"]
                )
            else:
                self.assertEqual(base_request.where_you_heard, "")
            self.assertEqual(
                str(base_request.number), f"+{personal_info['phone_number']}"
            )
            lesson_info = mutation_data["lesson_info"]
            schedule = lesson_info["schedule"]
            self.assertEqual(
                base_request.expectation,
                f"Plan:{lesson_info['lesson_plan']}\nSummary:{schedule['summary']}\nduration:{schedule['duration']}",
            )
            self.assertEqual(base_request.status, BaseRequestTutor.PENDING)
            self.assertEqual(base_request.request_type, 5)
            self.assertEqual(base_request.tutor.email, "shola@example.com")
            # self.assertEqual(base_request.request_info, {**mutation_data,"slug":base_request.slug,
            # 'status':'issued'})
            self.assertEqual(
                base_request.expectation,
                "Plan:Extended\nSummary:November Weekend Morning Class\nduration:10am - 2pm",
            )
            self.assertEqual(base_request.request_subjects, ["IELTS"])

        self.initial_mutation(callback)

    def test_group_lesson_issued_request(self):
        def callback(json_data, user):
            return json_data["slug"]

        slug = self.initial_mutation(callback)
        mutationName = "getGroupLesson"
        mutation = """
         mutation %s($slug: String!){
            %s(slug: $slug){ 
                slug
                request_details
                payment_details
             }
        }
        """ % (
            mutationName,
            mutationName,
        )

        def callback(json_data, user):
            self.assertEqual(slug, json_data["slug"])
            payment_record = json_data["payment_details"]
            self.assertEqual(payment_record["description"], "Payment for group lessons")
            base_request = BaseRequestTutor.objects.get(slug=slug)
            self.assertEqual(base_request.status, BaseRequestTutor.PENDING)
            self.assertEqual(base_request.request_type, 5)
            self.assertEqual(base_request.budget, 58000)
            self.assertEqual(base_request.request_subjects, ["IELTS"])
            self.assertEqual(payment_record["amount"], payment_details["amount"])
            self.assertEqual(base_request.budget, payment_details["amount"])
            budget = int(base_request.budget) * 100
            self.assertEqual(
                payment_record["user_details"]["redirect_url"],
                f"/paystack/verify-payment/{slug}/",
            )
            # self.assertEqual(json_data["request_details"], mutation_data)

        self.make_mutation_call({"slug": slug}, mutation, mutationName, callback)

    def create_slots(self):
        def generate_request_info(kls, _type="Extended"):
            return BaseRequestTutor.objects.create(
                request_type=5,
                first_name="Danny",
                last_name="Novak",
                email="danny@example.com",
                status=BaseRequestTutor.PAYED,
                slug=generate_code(BaseRequestTutor, "slug"),
                request_info={
                    "request_details": {
                        "exam": "ielts",
                        "lesson_plan": _type,
                        "amount": "58000",
                        "schedule": {
                            "start_date": "October 24, 2018",
                            "date_summary": "October 24, 2018 - October 30, 2018",
                            "summary": kls,
                            "duration": "10am - 2pm",
                        },
                        "state": "Lagos",
                        "location": "Surulere",
                        "curriculum_link": "//assets.ctfassets.net/tp6rlg4xcwsc/1rN7EyhShS8K48…8f1f933c092b9f/IELTS_Extended_Plan_Curriculum.pdf",
                        "venue": "Event Center Surulere Lagos",
                        "tutor": {
                            "first_name": "Shola",
                            "last_name": "Shope",
                            "phone_no": "+234023232323",
                            "email": "shola@example.com",
                        },
                    },
                    "personal_info": {
                        "first_name": "Danny",
                        "last_name": "Novak",
                        "email": "danny@example.com",
                        "phone_number": "2347035208822",
                        "how_you_heard": "12",
                    },
                },
            )

        generate_request_info("December class")
        generate_request_info("January class")
        generate_request_info("Week 1", "Weekend")
        BaseRequestTutor.objects.all().update(created=datetime.datetime(2018, 11, 10))

    def test_get_slot(self):
        self.create_slots()
        mutationName = "getSlot"
        mutation = """
         mutation %s($kind: String!, $location:String!){
            %s(kind: $kind, location: $location){ 
                schedule
             }
        }
        """ % (
            mutationName,
            mutationName,
        )

        def callback(json_data, user):
            schedule = json_data["schedule"]
            self.assertCountEqual(
                schedule,
                [
                    {
                        "type": "Extended",
                        "name": "December class",
                        "created": "11-2018",
                    },
                    {"type": "Extended", "name": "January class", "created": "11-2018"},
                    {"type": "Weekend", "name": "Week 1", "created": "11-2018"},
                ],
            )

        self.make_mutation_call(
            {"kind": "Ielts", "location": "Surulere"}, mutation, mutationName, callback
        )

    @patch("external.models.models1.slots.update_entry")
    @patch("external.schema.payments.PaystackAPI")
    def test_payment_processing(self, mock_paystack, mock_update_entry):
        mock_inst = mock_paystack.return_value
        mock_inst.verify_payment.return_value = (True, "vv")

        def callback(json_data, user):
            return json_data

        response = self.initial_mutation(callback)
        payment_record = response["payment_details"]
        slug = response["slug"]
        self.client.get(
            f'{payment_record["user_details"]["redirect_url"]}?amount={int(payment_record["amount"]*100)}&txtref=1001'
        )
        self.mocker.assert_has_calls(
            [
                call(
                    booking={
                        "to": "danny@example.com",
                        "template": "group_lesson_to_client",
                        "context": {
                            "skill": "IELTS",
                            "lesson_plan": "Extended",
                            "schedule": {
                                "summary": "November Weekend Morning Class",
                                "duration": "10am - 2pm",
                                "start_date": "October 24, 2018",
                                "date_summary": "October 24, 2018 - October 30, 2018",
                            },
                            "no_of_student": 1,
                            "client": {
                                "full_name": "Danny Novak",
                                "phone_no": "+2347035208822",
                            },
                            "venue": "Event Center Surulere Lagos",
                            "tutor": {
                                "name": "Shola Shope",
                                "phone_no": "+234023232323",
                            },
                            "curriculum_link": "//assets.ctfassets.net/tp6rlg4xcwsc/1rN7EyhShS8K48…8f1f933c092b9f/IELTS_Extended_Plan_Curriculum.pdf",
                        },
                    },
                    from_mail="Tuteria <info@tuteria.com>",
                    url=settings.NOTIFICATION_SERVICE_URL,
                ),
                call(
                    booking={
                        "to": "shola@example.com",
                        "template": "group_lesson_to_tutor",
                        "context": {
                            "skill": "IELTS",
                            "lesson_plan": "Extended",
                            "schedule": {
                                "summary": "November Weekend Morning Class",
                                "duration": "10am - 2pm",
                                "start_date": "October 24, 2018",
                                "date_summary": "October 24, 2018 - October 30, 2018",
                            },
                            "no_of_student": 1,
                            "client": {
                                "full_name": "Danny Novak",
                                "phone_no": "+2347035208822",
                            },
                            "venue": "Event Center Surulere Lagos",
                            "tutor": {
                                "name": "Shola Shope",
                                "phone_no": "+234023232323",
                            },
                            "curriculum_link": "//assets.ctfassets.net/tp6rlg4xcwsc/1rN7EyhShS8K48…8f1f933c092b9f/IELTS_Extended_Plan_Curriculum.pdf",
                        },
                    },
                    from_mail="Tuteria <info@tuteria.com>",
                    url=settings.NOTIFICATION_SERVICE_URL,
                ),
            ]
        )
        inst = BaseRequestTutor.objects.get(slug=slug)
        self.assertEqual(inst.status, BaseRequestTutor.PAYED)
        self.assertEqual(inst.agent, self.agent)
        mock_update_entry.assert_called_once_with(
            "November Weekend Morning Class", {"slots": 1}
        )

