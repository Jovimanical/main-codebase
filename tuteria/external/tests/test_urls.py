from test_plus.test import TestCase
from django.urls import reverse
from django.http.request import HttpRequest
from django.contrib.messages.storage import default_storage
from .factories import UserFactory
from django.contrib.auth.models import Permission
from django.test import override_settings
from config.settings.common import Common


@override_settings(
    INSTALLED_APPS=Common.INSTALLED_APPS, MIDDLEWARE_CLASSES=Common.MIDDLEWARE_CLASSES
)
class ClientAdminURLTestCase(TestCase):
    user_factory = UserFactory

    def setUp(self):
        self.user = self.make_user("james")
        self.user.is_superuser = True
        self.user.is_staff = True
        self.user.save()

    def test_client_admin_url_loads(self):
        with self.login(email=self.user.email, password="password"):
            url = reverse("Client Requests:index")
            self.assertEqual(url, "/we-are-allowed-sales/")

            response = self.get("/we-are-allowed-sales/")

            self.assertEqual(response.status_code, 200)
            self.assertTrue("Site administration" in str(response.content))
