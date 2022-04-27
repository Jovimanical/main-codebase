from decimal import Decimal
import json

from test_plus.test import TestCase
from . import utils as test_utils
from users.models import User
from external.models import BaseRequestTutor, Agent
from config.utils import generate_code
from django.conf import settings
from skills.tests import factories as skill_factory

mutation_data = {
    # "kind" : "exams",
    "request_details": {
        "student_no": 3,
         "selections": ["Writing", "Reading"],
        "exam_type": "Knowledge (F1 - F3)",
        "exam_date": "2018-03-03T02:07:30.000Z",
        "purpose": "Pass multiple",
        "targeted_score": {
            "Writing": {"score": "5.6"},
            "Reading": {"score": "7.2"},
        },
        "exam_type" : "Knowledge (F1 - F3)",
        # "date_of_exam" : "2018-03-03T02:07:30.000Z",
        "exam_date" : "2018-03-03T02:07:30.000Z",
        "purpose" : "Pass multiple",
        # "targeted_score" : ['7.8'],
        "online_lesson" : "No",
        "expectations" : "I look forward to passing all my subjects",
        "gender": "Male",
        "online_lesson": "Yes",
        "exam": "gre",
    },
    "personal_info": {
        "first_name": "Danny",
        "last_name": "Novak",
        "email": "danny@example.com",
        "phone_number": "2347035208822",
        "how_you_heard": "12",
    },
    "location": {
        "address": "23, Local Street",
        "vicinity": "Ibeju-Ilupeju",
        "area": "Ilupeju",
        "state": "Lagos",
        "latitude": 2.3223222,
        "longitude": 3.3489671,
    },
}

class ExamRequestTutorTestCase(TestCase):
    maxDiff = None
    email = "danny@example.com"

    def setUp(self):
        self.agent = Agent.objects.create(
            image="shola1.png",
            phone_number="+2348033222233",
            email="agent1@example.com",
            name="Agent 1",
            title="Mr",
        )

    def create_existing_user_with_request(self, create_user=True):
        if create_user:
            self.user = User(email=self.email, first_name="Danny", last_name="Novak")
            self.user.save()
        self.br = BaseRequestTutor.objects.create(
            first_name="Danny",
            last_name="Novak",
            slug=generate_code(BaseRequestTutor, "slug"),
            email=self.email,
        )
        self.br.number = "+2347035208822"
        self.br.request_info = mutation_data
        if create_user:
            self.br.user = self.user
        self.br.save()
        return self.br.slug

    def graphql_query(self, query, **kwargs):
        return self.client.get(test_utils.url_string(query=query, **kwargs))

    def graphql_mutation(self, **data):
        # data["variables"] = test_utils.j(**data["variables"])
        return self.client.post(
            test_utils.url_string(), test_utils.j(**data), "application/json"
        )

    def assert_response(self, response, callback):
        # import pdb; pdb.set_trace()
        data = response.json().get("data")
        user = User.objects.filter(email=self.email).first()
        callback(data, user)

    def make_mutation_call(self, mutation_data, mutation, mutationName, callback):
        response = self.graphql_mutation(
            operationName=mutationName, query=mutation, variables=mutation_data
        )

        def assert_callback(json_data, user):
            data = json_data[mutationName]
            callback(data, user)

        self.assert_response(response, assert_callback)

    def user_details(self):
        return {
            key: str(getattr(self.user, key))
            for key in ["first_name", "last_name", "email"]
        }

    def save_initial_request_mutation(self, w_mutation_data):
        mutationName = "saveRequest"
        mutation = """
         mutation %s($request_details: RequestInput!, $personal_info: UserDetailInput,  $location: UserLocationInput!){
            %s(request_details: $request_details, personal_info: $personal_info,  location:$location){ request_dump }
        }
        """ % (
            mutationName,
            mutationName,
        )

        def callback(json_data, user):
            personal_info = w_mutation_data["personal_info"]
            location_info = w_mutation_data["location"]
            # request_info = w_mutation_data["request_details"]
            json_request_detail = json_data["request_dump"]["request_details"]
            base_request = BaseRequestTutor.objects.get(
                slug=json_data["request_dump"]["slug"]
            )
            for key in ["longitude", "latitude", "state", "vicinity"]:
                if type(getattr(base_request, key)) == Decimal:
                    self.assertEqual(
                        round(float(getattr(base_request, key)),6), round(location_info[key], 6)
                    )
                else:
                    self.assertEqual(getattr(base_request, key), location_info[key])
            self.assertEqual(base_request.home_address, location_info["address"])
            for key in ["first_name", "last_name", "email"]:
                self.assertEqual(getattr(base_request, key), personal_info[key])
            self.assertEqual(
                base_request.no_of_students, json_request_detail["student_no"]
            )
            if personal_info["how_you_heard"]:
                self.assertEqual(
                    base_request.where_you_heard, personal_info["how_you_heard"]
                )
            else:
                self.assertEqual(base_request.where_you_heard, "")
            self.assertEqual(
                str(base_request.number), f"+{personal_info['phone_number']}"
            )
            self.assertEqual(base_request.status, BaseRequestTutor.ISSUED)
            self.assertFalse(base_request.is_parent_request)
            self.assertEqual(base_request.classes, None)
            self.assertEqual(base_request.curriculum, "")
            self.assertEqual(
                base_request.expectation,
                "purpose: Pass multiple\nsection: Knowledge (F1 - F3)\nselections: Writing(5.6), Reading(7.2)\nonline lessons: Yes\nother information: I look forward to passing all my subjects\n\n",
            )
            self.assertEqual(
                json_request_detail["processing_fee"], settings.PROCESSING_FEE
            )
            self.assertEqual(base_request.request_subjects, ["GRE"])
            self.assertEqual(base_request.gender, "M")
            base_request.request_info.pop("slug")
            base_request.request_info.pop("status")

        self.make_mutation_call(w_mutation_data, mutation, mutationName, callback)

    def complete_request_mutation(self, slug):
        query = """ query get_request($slug: String!){ 
                    get_request(slug: $slug)
                } """

        def callback(json_data, user):
            slug = json_data["request_dump"]["slug"]
            # if slug:
            #     slug = json_data["request_dump"]['slug']
            processing_fee = json_data["request_dump"]["request_details"].get(
                "processing_fee"
            )
            if processing_fee:
                json_data["request_dump"]["request_details"].pop("processing_fee")
            for key in ["request_details", "personal_info", "location"]:
                self.assertEqual(json_data["request_dump"][key], mutation_data[key])

        self.make_mutation_call({"slug": slug}, query, "get_request", callback)
        self.assertEqual(BaseRequestTutor.objects.count(), 1)

        agent_fields = """
        agent
        """
        mutationName = "completeRequest"
        mutation = """
        mutation %s($request_details: RequestInput!, $slug: String!){
            %s(request_details: $request_details, slug: $slug){ %s request_dump }
        }
        """ % (
            mutationName,
            mutationName,
            agent_fields,
        )
        new_data = {
            "request_details": {
                **mutation_data["request_details"],
                "days": ["Monday", "Thursday", "Friday"],
                "hours": 2,
                "no_of_teachers": 1,
                "start_date": "2018-08-01T11:00:00.000Z",
                "end_date": "2018-08-05T11:00:00.000Z",
                "no_of_weeks": 8,
                "per_hour": 2500.0,
                "processing_fee": 3000,
                "transport_fee": 0,
                "discount": 0,
                "shared": True,
                "coupon": "1001",
                "budget": 20000.0,
                "no_of_lessons": 10,
                "plan" : "Plan 1",
                # "tutor_level": "1",
            },
            "slug": slug,
        }

        def callback(json_data, user):
            request_details = new_data["request_details"]
            base_request = BaseRequestTutor.objects.get(slug=slug)
            personal_info = mutation_data["personal_info"]
            # location_info = mutation_data["location"]
            for key in request_details.keys():
                self.assertEqual(
                    base_request.request_info["request_details"][key],
                    request_details[key],
                )
            for key in ["first_name", "last_name", "email"]:
                self.assertEqual(getattr(base_request.user, key), personal_info[key])
            self.assertEqual(
                str(base_request.user.primary_phone_no.number),
                f"+{personal_info['phone_number']}",
            )

            self.assertEqual(base_request.class_urgency, "immediately")
            self.assertEqual(base_request.user.email, "danny@example.com")
            self.assertEqual(base_request.hours_per_day, 2)
            self.assertEqual(base_request.budget, 20000)
            self.assertEqual(base_request.days_per_week, 8)
            self.assertEqual(base_request.available_days, request_details["days"])
            self.assertEqual(base_request.status, BaseRequestTutor.COMPLETED)
            self.assertEqual(base_request.agent, self.agent)

            for key in ["email", "name", "phone_number", "title", "image_url"]:
                self.assertEqual(
                    getattr(base_request.agent, key), getattr(self.agent, key)
                )
            self.assertEquals(
                json_data["agent"]["image_url"], "/static/img/gallery/shola1.png"
            )
            self.assertCountEqual(
                base_request.request_info["personal_info"],
                mutation_data["personal_info"],
            )
            self.assertCountEqual(
                base_request.request_info["request_details"],
                new_data["request_details"],
            )
            # self.assertEqual(
            #     base_request.request_info["request_details"]["tutor_level"], "1"
            # )
            self.assertEqual(
                base_request.request_info["request_details"]["plan"], "Plan 1"
            )
            self.assertCountEqual(
                base_request.request_info["location"], mutation_data["location"]
            )

        self.make_mutation_call(new_data, mutation, mutationName, callback)

    def test_flow_for_new_user_placing_request(self):
        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(BaseRequestTutor.objects.count(), 0)
        self.save_initial_request_mutation(mutation_data)
        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(BaseRequestTutor.objects.count(), 1)
        request = BaseRequestTutor.objects.first()
        self.complete_request_mutation(request.slug)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(BaseRequestTutor.objects.count(), 1)

    def test_when_some_of_the_unnecessary_fields_are_empty(self):
        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(BaseRequestTutor.objects.count(), 0)
        new_mutation_data = {**mutation_data}
        new_mutation_data["personal_info"]["how_you_heard"] = None
        # new_mutation_data["how_you_heard"] = ""
        self.save_initial_request_mutation(new_mutation_data)
        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(BaseRequestTutor.objects.count(), 1)

    def test_flow_for_existing_user_placing_request(self):
        slug = self.create_existing_user_with_request()
        self.assertEqual(User.objects.count(), 1)
        self.save_initial_request_mutation(mutation_data)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(BaseRequestTutor.objects.count(), 1)
        request = BaseRequestTutor.objects.first()
        self.complete_request_mutation(request.slug)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(BaseRequestTutor.objects.count(), 1)
