from test_plus.test import TestCase, APITestCase
from django.test import override_settings
from external.models import PriceDeterminator
from users.services import CustomerService
from ..factories import BaseRequestTutorFactory, UserFactory
import json
from django.contrib.admin.helpers import ACTION_CHECKBOX_NAME
from django.urls import reverse
from config.settings.common import Common


@override_settings(
    CELERY_ALWAYS_EAGER=True,
    INSTALLED_APPS=Common.INSTALLED_APPS,
    MIDDLEWARE_CLASSES=Common.MIDDLEWARE_CLASSES,
)
class PriceDeterminantAdminTestCase(TestCase):

    def create_superuser(self):
        self.superuser = UserFactory(
            username="super",
            first_name="Peter",
            email="super@example.com",
            is_superuser=True,
            is_staff=True,
        )
        self.superuser.set_password("secret")
        self.superuser.save()

    def setUp(self):
        # create superuser
        self.create_superuser()
        self.price_determinant = PriceDeterminator.objects.create()

    def login(self):
        self.client.login(username=self.superuser.email, password="secret")

    def make_api_call(self, post_params):
        return self.client.post(
            reverse("admin:external_pricedeterminator_changelist"), post_params
        )

    def assertNewValue(self, key, assertion):
        new_instance = PriceDeterminator.objects.get(pk=self.price_determinant.pk)
        self.assertEqual(getattr(new_instance, key), assertion)

    def test_updating_state_price_factors(self):
        action_data = {
            ACTION_CHECKBOX_NAME: self.price_determinant.pk,
            "action": "update_pricing_record",
            "index": 0,
        }
        self.login()
        response = self.make_api_call(
            {"state": "Lagos", "state_percentage": 100, **action_data}
        )
        self.assertNewValue("states", {"Lagos": 100})
        response = self.make_api_call(
            {"state": "Abuja", "state_percentage": 90, **action_data}
        )
        self.assertNewValue("states", {"Lagos": 100, "Abuja": 90})
        variations = [
            {"no_of_hours": 1, "hour_percentage": 150},
            {"no_of_hours": 1.5, "hour_percentage": 125},
            {"plan": "Plan 1", "plan_percentage": 100},
            {"plan": "Plan 2", "plan_percentage": 150},
        ]
        for o in variations:
            response = self.make_api_call({**o, **action_data})
        self.assertNewValue("states", {"Lagos": 100, "Abuja": 90})
        self.assertNewValue("hour_factor", {"1": 150, "1.5": 125})
        self.assertNewValue("plans", {"Plan 1": 100, "Plan 2": 150})
