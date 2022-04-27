from unittest import mock
import pytz
import datetime
from test_plus import TestCase
from ..factories import BaseRequestTutorFactory, AgentFactory

from unittest.mock import patch
from external.models import BaseRequestTutor, Agent
from skills.models import TutorSkill
from skills.tests.factories import TutorSkillFactory
from users.tests import factories as user_factories
from users.models import UserProfile
from users.mixins import TutorProfileMixin
import datetime
from config.settings.common import Common
from django.test import override_settings
from dateutil.relativedelta import relativedelta
from django.utils.timezone import localtime, now as ts_now

unaware_yestarday_date = datetime.datetime.now() - relativedelta(days=1)
yestarday_date = pytz.utc.localize(unaware_yestarday_date)


class ClientAgentAnalyticsTestCase(TestCase):

    def setUp(self):
        # create agent
        self.agent_1 = AgentFactory(
            name="Agent 1", email="agent@example.com", type=Agent.CLIENT
        )
        # create requests assigned to agent
        remarks = [
            {
                "remarks": "",
                "modified": yestarday_date,
                "created": yestarday_date,
                "agent": self.agent_1,
                "status": BaseRequestTutor.ISSUED,
            },
            {
                "remarks": "Sent profile to client",
                "modified": yestarday_date,
                "created": yestarday_date,
                "agent": self.agent_1,
                "status": BaseRequestTutor.PENDING,
            },
            {
                "remarks": "Activity Log",
                "modified": yestarday_date,
                "created": yestarday_date,
                "agent": self.agent_1,
                "status": BaseRequestTutor.PENDING,
            },
            {
                "remarks": "To contact client on 12-01-2018",
                "agent": self.agent_1,
                "status": BaseRequestTutor.TO_BE_BOOKED,
            },
            {
                "remarks": "Activity Log",
                "modified": yestarday_date,
                "created": yestarday_date,
                "agent": self.agent_1,
                "status": BaseRequestTutor.COMPLETED,
            },
            {
                "remarks": "",
                "modified": yestarday_date,
                "created": yestarday_date,
                "agent": self.agent_1,
                "status": BaseRequestTutor.PAYED,
            },
            {
                "remarks": "To contact client on 12-01-2017",
                "modified": yestarday_date,
                "created": yestarday_date,
                "agent": self.agent_1,
                "status": BaseRequestTutor.PROSPECTIVE_CLIENT,
            },
            {
                "remarks": "To contact client on 12-01-2018",
                "modified": datetime.datetime(2018, 1, 11),
                "agent": self.agent_1,
                "status": BaseRequestTutor.PENDING,
            },
            {
                "remarks": "Sent profile to client",
                "modified": yestarday_date,
                "created": yestarday_date,
                "agent": self.agent_1,
                "status": BaseRequestTutor.MEETING,
            },
        ]
        for request in remarks:
            instance = BaseRequestTutorFactory(
                agent=self.agent_1, budget=20000, booking=None, modified=ts_now()
            )
            BaseRequestTutor.objects.filter(pk=instance.pk).update(**request)

    def populate_stats(self):
        # self.mocker.return_value = datetime.datetime(2018,1,12)
        self.stats = self.agent_1.get_stats()

    def test_get_number_of_requests_assigned_to_agent(self):
        self.populate_stats()
        self.assertEqual(self.stats["no_of_requests"], 2)

    def test_get_number_of_requests_worked_by_agent(self):
        self.populate_stats()
        self.assertEqual(self.stats["worked"], 0)

    def test_get_number_of_calls_made_by_agent(self):
        self.populate_stats()
        self.assertEqual(self.stats["calls_made"], 0)

    def test_get_number_of_request_missed_by_agent(self):
        self.populate_stats()
        self.assertEqual(self.stats["request_missed"], 0)

    def test_get_total_amount_closed_by_agent(self):
        self.populate_stats()
        self.assertEqual(self.stats["amount_closed"], 20000)


class TutorAgentAnalyticsTestCase(TestCase):

    def setUp(self):
        self.user1 = user_factories.UserFactory(
            username="super", first_name="Peter", email="super@example.com"
        )
        self.user2 = user_factories.UserFactory(
            first_name="Arinola", email="middle@example.com"
        )
        self.user3 = user_factories.UserFactory(
            first_name="Banke", email="dundun@example.com"
        )
        # self.user3 = user_factories.UserFactory(
        #     first_name="Banke", email='dundun@example.com')
        self.agent1 = AgentFactory(
            name="Chinedu nwani", user=self.user1, type=Agent.TUTOR
        )
        self.agent2 = AgentFactory(name="GeeBee", user=self.user2, type=Agent.TUTOR)
        self.agent3 = AgentFactory(name="Banke", user=self.user3, type=Agent.CLIENT)
        tutor_applicant = [
            {
                "user": "Simple",
                "email": "simple@example.com",
                "agent": self.agent1,
                "application_status": TutorProfileMixin.VERIFIED,
                "tutor_skill_modified": yestarday_date,
            },
            {
                "user": "Classic",
                "email": "classic@example.com",
                "agent": self.agent2,
                "application_status": TutorProfileMixin.DENIED,
                "tutor_skill_modified": yestarday_date,
            },
            {
                "user": "Style",
                "email": "style@example.com",
                "agent": self.agent1,
                "application_status": TutorProfileMixin.DENIED,
                "tutor_skill_modified": yestarday_date,
            },
            {
                "user": "Life",
                "email": "life@example.com",
                "agent": self.agent2,
                "application_status": TutorProfileMixin.VERIFIED,
                "tutor_skill_modified": yestarday_date,
            },
            {
                "user": "Calm",
                "email": "calm@example.com",
                "agent": self.agent1,
                "application_status": TutorProfileMixin.DENIED,
                "tutor_skill_modified": yestarday_date,
            },
            {
                "user": "Wealth",
                "email": "wealth@example.com",
                "agent": self.agent1,
                "application_status": TutorProfileMixin.NOT_APPLIED,
            },
            {
                "user": "Love",
                "email": "love@example.com",
                "agent": self.agent1,
                "agent": self.agent1,
                "application_status": TutorProfileMixin.BEGAN_APPLICATION,
            },
            {
                "user": "Children",
                "email": "children@example.com",
                "agent": self.agent1,
                "agent": self.agent2,
                "application_status": TutorProfileMixin.VERIFIED,
                "tutor_skill_modified": yestarday_date,
            },
        ]

        tutor_details = [
            {
                "tutor": self.user1,
                "status": TutorSkill.DENIED,
                "agent": self.agent1,
                "modified": yestarday_date,
                "created": yestarday_date,
            },
            {
                "tutor": self.user2,
                "status": TutorSkill.ACTIVE,
                "agent": self.agent2,
                "modified": yestarday_date,
                "created": yestarday_date,
            },
            {
                "tutor": self.user1,
                "status": TutorSkill.FREEZE,
                "agent": self.agent1,
                "modified": yestarday_date,
                "created": yestarday_date,
            },
            {
                "tutor": self.user2,
                "agent": self.agent2,
                "status": TutorSkill.PENDING,
                "modified": yestarday_date,
                "created": yestarday_date,
                "image_denied_on": yestarday_date,
            },
            {
                "tutor": self.user1,
                "agent": self.agent1,
                "status": TutorSkill.PENDING,
                "modified": yestarday_date,
                "created": yestarday_date,
                "image_denied_on": yestarday_date,
            },
            {
                "tutor": self.user2,
                "status": TutorSkill.ACTIVE,
                "agent": self.agent1,
                "modified": yestarday_date,
                "created": yestarday_date,
            },
            {
                "tutor": self.user1,
                "status": TutorSkill.DENIED,
                "agent": self.agent1,
                "modified": yestarday_date,
                "created": yestarday_date,
            },
            {
                "tutor": self.user2,
                "status": TutorSkill.MODIFICATION,
                "agent": self.agent2,
                "modified": yestarday_date,
                "created": yestarday_date,
            },
            {"tutor": self.user1, "status": TutorSkill.DENIED, "agent": self.agent1},
            {
                "tutor": self.user2,
                "status": TutorSkill.MODIFICATION,
                "agent": self.agent2,
            },
        ]

        for tutor_data in tutor_details:
            tutor_skill_instance = TutorSkillFactory()
            TutorSkill.objects.filter(pk=tutor_skill_instance.pk).update(**tutor_data)

        for applicant in tutor_applicant:
            name = applicant.pop("user")
            email = applicant.pop("email")
            applicant_instance = user_factories.TutorApplicantFactory(
                first_name=name, email=email
            )
            UserProfile.objects.filter(pk=applicant_instance.pk).update(**applicant)

    class post_analytics_status_code(object):

        def __init__(self):
            self.__dict__ = {"status_code": 200}

    @mock.patch("requests.post", return_value=post_analytics_status_code())
    def test_tutor_applicant_status_return_expected_data(self, post_analytics):
        new_date = ts_now() - relativedelta(days=1)
        data1 = self.agent1.generate_agent_stat_string(new_date)
        data2 = self.agent2.generate_agent_stat_string(new_date)
        string1 = Agent.get_all_agent_activity(new_date)
        self.maxDiff = None
        self.assertEquals(
            data1,
            "*Agent Name:* Chinedu nwani\n Skills Approved: 1\n Skills Denied: 2\n Skills Freezed: 1\n Request To Modify Skills: 0\n Rejected Skill Image: 1\n Denied Applicant: 2\n Approved Applicant: 1\n\n",
        )
        self.assertEquals(
            data2,
            "*Agent Name:* GeeBee\n Skills Approved: 1\n Skills Denied: 0\n Skills Freezed: 0\n Request To Modify Skills: 1\n Rejected Skill Image: 1\n Denied Applicant: 1\n Approved Applicant: 2\n\n",
        )
        self.assertEqual(
            string1,
            {
                "skills_detail": "\n\n*Tutor Skill Report:*\n Peter L (skill-0) denied by Chinedu nwani \n Arinola L (skill-1) activated by GeeBee \n Peter L (skill-2) freezed by Chinedu nwani \n Arinola L (skill-3) image rejected by GeeBee \n Peter L (skill-4) image rejected by Chinedu nwani \n Arinola L (skill-5) activated by Chinedu nwani \n Peter L (skill-6) denied by Chinedu nwani \n Arinola L (skill-7) modification requested by GeeBee\n",
                "tutor_applicant_detail": "\n\n*Tutor Applicant Report:*\n Children L verified by GeeBee \n Calm L denied by Chinedu nwani \n Life L verified by GeeBee \n Style L denied by Chinedu nwani \n Classic L denied by GeeBee \n Simple L verified by Chinedu nwani\n",
            },
        )
        self.assertIsNone(Agent.daily_upload(tutor_agent=True))
        post_analytics.assert_called()
