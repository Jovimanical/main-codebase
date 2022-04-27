import os

from configurations import values

from .common import Common


class Test(Common):
    # INSTALLED_APPS
    INSTALLED_APPS = Common.INSTALLED_APPS + (
        # 'test_without_migrations','django_nose'
    )
    # END INSTALLED_APPS

    # Mail settings
    EMAIL_HOST = "localhost"
    EMAIL_PORT = 1025
    EMAIL_BACKEND = values.Value("django.core.mail.backends.console.EmailBackend")
    STATIC_ROOT = os.getenv("STATIC_ROOT", "")
    # EMAIL_BACKEND = "djrill.mail.backends.djrill.DjrillBackend"
    # MANDRILL_API_KEY = values.Value('9uLNNKKwdIcbbvOGB1JubA')
    # End mail settings
    DEBUG = values.BooleanValue(True)
    TEMPLATE_DEBUG = DEBUG

    MANDRILL_API_KEY = values.Value("9uLNNKKwdIcbbvOGB1JubA")
    # DATABASES = values.DatabaseURLValue('postgres://zpnoefaeelopcv:4koekuQ91V5fqURYYHk9I4hFkY@ec2-23-21-234-160.compute-1.amazonaws.com:5432/d1t88p8nc3njqg')
    DATABASES = {
        "default": {
            "HOST": "ec2-54-235-250-156.compute-1.amazonaws.com",
            "ENGINE": "django.db.backends.postgresql_psycopg2",
            "USER": "trhipywhzzytzy",
            "NAME": "d50lstmshg0d6o",
            "PASSWORD": "VePxSyZiUakflRmyEX2rRZAQ6o",
            "TEST": {"NAME": "d50lstmshg0d6o"},
        }
    }
    # TEST_RUNNER = 'django_behave.runner.DjangoBehaveTestSuiteRunner'
    # Django twilio
    TWILIO_ACCOUNT_SID = os.getenv(
        "TWILIO_ACCOUNT_SID", "ACef6d08bb2f59296441c8fbe6083c49ec"
    )
    TWILIO_AUTH_TOKEN = os.getenv(
        "TWILIO_AUTH_TOKEN", "e12d287fd63396e305bb1c762d00ea43"
    )
    TWILIO_DEFAULT_CALLERID = os.getenv("TWILIO_DEFAULT_CALLERID", "+15005550006")

    INTERNAL_IPS = ("127.0.0.1", "192.168.33.10", "0.0.0.0")
    #

    CACHES = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}
