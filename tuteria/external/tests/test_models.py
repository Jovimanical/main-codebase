import datetime
import pdb
from decimal import Decimal
from dateutil.relativedelta import relativedelta
from mock import patch, call
from test_plus.test import TestCase, RequestFactory
from bookings.tests.utils import setup_dummy_booking_data
from . import factories
from .admin.test_analytics import ClientAgentAnalyticsTestCase
from users.tests.factories import UserFactory
from external import forms, models
from pricings.models import Region
from unittest.mock import patch
from django.utils.timezone import now as ts_now

# from types import Dict


class PricingDeterminantTestCase(TestCase):

    def test_price_rate_is_as_functional_as_ever(self):
        calculate = models.PriceDeterminator.calculate
        self.assertEqual(1500 * calculate(0), 1995)
        self.assertEqual(1500 * calculate(1), 1995)
        self.assertEqual(1500 * calculate(2), 1500)
        self.assertEqual(1500 * calculate(3), 1380)

    def test_no_of_hours_work_as_expected(self):
        calculate_hrs = models.PriceDeterminator.calculate_hrs
        self.assertEqual(calculate_hrs(0), 1)
        self.assertEqual(calculate_hrs(1), 1)
        self.assertEqual(calculate_hrs(2), 2)
        self.assertEqual(calculate_hrs(1.5), Decimal(1.5))
        self.assertEqual(calculate_hrs(2.5), 2)
        self.assertEqual(float(calculate_hrs(3)), 2.4)
        self.assertEqual(float(calculate_hrs(4)), 3.2)

    def test_no_of_students_rate_work_as_expected(self):
        calculate_rate = models.PriceDeterminator.calculate_rate
        self.assertEqual(calculate_rate(0), 1)
        self.assertEqual(calculate_rate(1), 1)
        self.assertEqual(calculate_rate(2), 1.5)
        self.assertEqual(calculate_rate(3), 2.25)
        self.assertEqual(calculate_rate(4), 3)

    def test_total_price_returns_the_correct_result(self):
        get_new_price = models.PriceDeterminator.get_new_price
        self.assertEqual(get_new_price(1500, 3, 1, 3), 13500)
        self.assertEqual(get_new_price(2000, 1, 1, 1), 2700)


class DeterminePriceEarnableTestCase(TestCase):

    def setUp(self):
        self.base_tutor = factories.BaseRequestTutorFactory(
            state="Lagos",
            hours_per_day=2,
            plan="Plan 1",
            days_per_week=4,
            no_of_students=1,
            available_days=["Monday", "Tuesday", "Wednesday"],
        )
        state_plans = {"Lagos": 100, "Abuja": 95, "Rivers": 95, "Others": 70}
        plan_rates = {"Plan 1": 90, "Plan 2": 150, "Plan 3": 250}
        hour_factors = {"1": 150, "1.5": 125}
        self.price_determinator = factories.PriceDeterminatorFactory(
            states=state_plans,
            plans=plan_rates,
            price_base_rate=1500,
            hour_factor=hour_factors,
        )

    def get_state_results(self, lagos_price, abuja_price, river_price, other_prices):
        with_plans = lambda dicto: {
            "Plan 1": dicto[0],
            "Plan 2": dicto[1],
            "Plan 3": dicto[2],
        }
        return {
            "Lagos": with_plans(lagos_price),
            "Abuja": with_plans(abuja_price),
            "Rivers": with_plans(river_price),
            "Others": with_plans(other_prices),
        }

    def update_tutor_fields(self, **kwargs):
        self.base_tutor.plan = kwargs.get("plan")
        self.base_tutor.state = kwargs.get("state")
        self.base_tutor.save()

    def test_hour_prime_returns_valid_result_when_no_hour_factor_is_passed(self):
        self.price_determinator.hour_factor = {}
        self.price_determinator.save()
        real_hour = self.price_determinator.real_hour_func(1, 3)
        self.assertEqual(real_hour, 3.0)

    def test_client_booking_quote(self):
        price = self.base_tutor.get_booking_quote(self.price_determinator)
        self.assertEqual(price, {"price": 32400})

    def test_booking_quote_prices(self):
        self.prices = self.get_state_results(
            (32400, 54000, 90000),
            (30780, 51300, 85500),
            (30780, 51300, 85500),
            (22680, 37800, 63000),
        )
        for state, value in self.prices.items():
            for plan, price in value.items():
                self.update_tutor_fields(state=state, plan=plan)
                earnable = self.base_tutor.get_booking_quote(self.price_determinator)

                self.assertEqual(earnable, {"price": price})

    def test_booking_quote_prices_func(self):
        params = {
            "days_per_week": 4,
            "hours_per_day": 2,
            "no_of_students": 1,
            "available_days": 3,
        }
        self.prices = self.get_state_results(
            (32400, 54000, 90000),
            (30780, 51300, 85500),
            (30780, 51300, 85500),
            (22680, 37800, 63000),
        )
        for state, value in self.prices.items():
            for plan, price in value.items():
                earnable = self.price_determinator.determine_client_quote(
                    state=state, plan=plan, **params
                )
                self.assertEqual(earnable, {"price": price})

    def test_real_price_func(self):
        test_data = self.get_state_results(
            (1350, 2250, 3750),
            (1282.5, 2137.5, 3562.5),
            (1282.5, 2137.5, 3562.5),
            (945, 1575, 2625),
        )

        for state, value in test_data.items():
            for plan, price in value.items():
                real_price = self.price_determinator.get_real_price(plan, state)

                self.assertEqual(real_price, price)


class ClientAgentDailyReportTestCase(ClientAgentAnalyticsTestCase):

    def setUp(self):
        super(AgentDailyReportTestCase, self).setUp()
        self.booking = setup_dummy_booking_data(order="1234567890")
        self.user = self.booking.user
        self.tutor = self.booking.tutor
        new_date = datetime.datetime.now() - relativedelta(days=1)
        self.agent = factories.AgentFactory(
            name="Peter", email="peterolayinka@example.com", type=models.Agent.CLIENT
        )
        self.base_request = factories.BaseRequestTutorFactory(
            agent=self.agent,
            booking=self.booking,
            tutor=self.tutor,
            status=models.BaseRequestTutor.COMPLETED,
            created=new_date,
        )

    def test_get_agent_daily_report_successfully(self):
        new_date = ts_now() - relativedelta(days=1)
        self.assertEquals(
            self.agent_1.generate_agent_stat_string(self.agent_1.get_stats(new_date)),
            "Agent Name: Agent 1\n Number of Requests: 6 \n Worked: 2 \n Calls/Sms/Activity Logged: 2 \n Amount Closed: 20000.00 \n Number of request closed: 1 \n\n",
        )
        self.assertEquals(
            self.agent.generate_agent_stat_string(self.agent.get_stats(new_date)),
            "Agent Name: Peter\n Number of Requests: 1 \n Worked: 0 \n Calls/Sms/Activity Logged: 0 \n Amount Closed: 0 \n Number of request closed: 0 \n\n",
        )
        self.assertIsNone(models.Agent.daily_upload())


class AgentTypeTestCase(TestCase):

    def setUp(self):
        self.agent_1 = factories.AgentFactory(
            name="Client Agent 1", email="agent1@example.com"
        )
        self.agent_2 = factories.AgentFactory(
            name="Tutor Agent 1", email="agent2@example.com", type=models.Agent.TUTOR
        )
        self.agent_3 = factories.AgentFactory(
            name="Client Agent 2", email="agent3@example.com"
        )
        self.agent_4 = factories.AgentFactory(
            name="Tutor Agent 2", email="agent4@example.com", type=models.Agent.TUTOR
        )
        self.agent_5 = factories.AgentFactory(
            name="Client Agent 3", email="agent5@example.com"
        )

    def test_get_next_client_agent_when_next_agent_is_set(self):
        self.agent_3.next_agent = self.agent_1
        self.agent_3.is_last_agent = True
        self.agent_3.save()
        agent1 = models.Agent.get_agent()
        self.agent_5.next_agent = self.agent_3
        self.agent_5.save()
        agent2 = models.Agent.get_agent()
        self.agent_3.next_agent = self.agent_1
        self.agent_3.save()
        agent3 = models.Agent.get_agent()
        self.agent_1.next_agent = self.agent_1
        self.agent_1.save()
        agent4 = models.Agent.get_agent()
        agent5 = models.Agent.get_agent()

        self.assertEqual(agent1.email, "agent1@example.com")
        self.assertEqual(agent2.email, "agent5@example.com")
        self.assertEqual(agent3.email, "agent1@example.com")
        self.assertEqual(agent4.email, "agent1@example.com")
        self.assertEqual(agent5.email, "agent3@example.com")

    def test_get_next_client_agent_sequencially_when_no_agent_is_last_agent(self):
        agent1 = models.Agent.get_agent()
        agent2 = models.Agent.get_agent()
        agent3 = models.Agent.get_agent()
        agent4 = models.Agent.get_agent()
        agent5 = models.Agent.get_agent()
        self.assertEqual(agent1.email, "agent5@example.com")
        self.assertEqual(agent2.email, "agent5@example.com")
        self.assertEqual(agent3.email, "agent1@example.com")
        self.assertEqual(agent4.email, "agent3@example.com")
        self.assertEqual(agent5.email, "agent5@example.com")

    def test_get_next_client_agent_sequencially_when_is_last_agent_is_set(self):
        self.agent_1.is_last_agent = True
        self.agent_1.save()

        agent1 = models.Agent.get_agent()
        agent2 = models.Agent.get_agent()
        agent3 = models.Agent.get_agent()
        agent4 = models.Agent.get_agent()
        agent5 = models.Agent.get_agent()

        self.assertEqual(agent1.email, "agent3@example.com")
        self.assertEqual(agent2.email, "agent5@example.com")
        self.assertEqual(agent3.email, "agent1@example.com")
        self.assertEqual(agent4.email, "agent3@example.com")
        self.assertEqual(agent5.email, "agent5@example.com")
