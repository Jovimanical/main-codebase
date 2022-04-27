# -*- coding: utf-8 -*-

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
from os.path import join

from configurations import Configuration, values

from .. import BASE_DIR


class Common(Configuration):
    BASE_DIR = BASE_DIR
    # APP CONFIGURATION
    DJANGO_APPS = (
        # Default Django apps:
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sites",
        "django.contrib.staticfiles",
    )
    THIRD_PARTY_APPS = (
        "allauth",  # registration
        "allauth.account",  # registration
        "allauth.socialaccount",  # registration
        "allauth.socialaccount.providers.facebook",  # facebook login
        "allauth.socialaccount.providers.google",
        "allauth.socialaccount.providers.linkedin_oauth2",
        # 'rest_auth.registration',
        "registration.apps.RegistrationConfig",
        "phonenumber_field",  # phonenumber
        "django_countries",  # list of countries
        "cloudinary",  # image manipulation
        "django_extensions",  # extensions for django,
        "rest_framework",  # django rest framework
        "rest_framework.authtoken",
        "rest_auth",
        "embed_video",  # youtube and vimeo tags for django
        "taggit",  # tag manager for django,
        # 'django_languages',  # list of languages to use with django model
        "model_utils",  # dependency on django quiz
        "mailchimp",  # mailing list api,
        # 'djrill',  # mandril app api
        # 'anafero',  # referrer app
        "schedule",  # tutor scheduling,
        "geoposition",  # latitude and longitude field
        "djcelery",  # celery,
        "whitenoise",
        "compat",
        # 'devserver',
        # 'sorl.thumbnail',
        # 'django_twilio',
        # 'pipeline'
        "markupfield",
        "paypal.standard.ipn",
        "markitup",
        "pagedown",
    )

    # Apps specific for this project go here.
    LOCAL_APPS = (
        "users",  # user registration model
        "django_quiz.quiz",  # quiz app for tutors to take
        # 'django_quiz.essay',  # quiz app for tutors to take
        "django_quiz.multichoice",  # quiz app for tutors to take
        # 'django_quiz.true_false',  # quiz app for tutors to take
        "registration",
        "skills",
        "config",
        "external",  # front facing pages
        "bookings",
        "rewards",
        "helps",
        "wallet",
        "reviews",
        "referrals",
        "api.v1",
    )

    """ A python-markdown example that allows HTML in the entry content """
    MARKITUP_FILTER = ("markdown.markdown", {"safe_mode": False})
    MARKITUP_SET = "markitup/sets/markdown"
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#installed-apps
    INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS
    # END APP CONFIGURATION
    REST_SESSION_LOGIN = False

    # MIDDLEWARE CONFIGURATION
    MIDDLEWARE_CLASSES = (
        # Make sure djangosecure.middleware.SecurityMiddleware is listed first
        "config.corsheaders.middleware.CorsMiddleware",
        "djangosecure.middleware.SecurityMiddleware",
        "django.middleware.common.CommonMiddleware",
        "django.middleware.csrf.CsrfViewMiddleware",
        # 'cached_auth.Middleware',
        "django.middleware.clickjacking.XFrameOptionsMiddleware",
    )
    # END MIDDLEWARE CONFIGURATION

    # MIGRATIONS CONFIGURATION
    MIGRATION_MODULES = {"sites": "contrib.sites.migrations"}
    # END MIGRATIONS CONFIGURATION
    CORS_ORIGIN_ALLOW_ALL = True
    # DEBUG
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#debug
    DEBUG = values.BooleanValue(True)

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#template-debug
    TEMPLATE_DEBUG = DEBUG
    # END DEBUG

    TEMPLATE_CONTEXT_PROCESSORS = (
        "django.contrib.auth.context_processors.auth",
        "allauth.account.context_processors.account",
        "allauth.socialaccount.context_processors.socialaccount",
        "django.core.context_processors.debug",
        "django.core.context_processors.i18n",
        "django.core.context_processors.media",
        "django.core.context_processors.static",
        "django.core.context_processors.tz",
        "django.contrib.messages.context_processors.messages",
        "django.core.context_processors.request",
    )

    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": os.getenv("CACHE_URL", "redis://127.0.0.1:6379/1"),
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "COMPRESS_MIN_LEN": 10,
                # "PARSER_CLASS": "redis.connection.HiredisParser",
                "IGNORE_EXCEPTIONS": True,
            },
        }
    }

    # SECRET CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
    # Note: This key only used for development and testing.
    # In production, this is changed to a values.SecretValue() setting
    SECRET_KEY = "CHANGEME!!!"
    # END SECRET CONFIGURATION

    # FIXTURE CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-FIXTURE_DIRS
    FIXTURE_DIRS = (join(BASE_DIR, "fixtures"),)
    # END FIXTURE CONFIGURATION

    # EMAIL CONFIGURATION
    EMAIL_BACKEND = values.Value("django.core.mail.backends.smtp.EmailBackend")
    REST_FRAMEWORK = {
        "DEFAULT_AUTHENTICATION_CLASSES": (
            "rest_framework.authentication.TokenAuthentication",
        ),
        # 'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly',),
        "DEFAULT_FILTER_BACKENDS": (
            "django_filters.rest_framework.DjangoFilterBackend",
        ),
        # 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination'
    }
    # MANAGER CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#admins
    ADMINS = (
        ("""Abiola O""", "gbozee@gmail.com"),
        ("""Godwin B""", "busybenson@yahoo.com"),
    )

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#managers
    MANAGERS = ADMINS
    # END MANAGER CONFIGURATION

    # DATABASE CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#databases
    DATABASES = values.DatabaseURLValue(
        "postgres://vagrant:punnisher@127.0.0.1/tuteria"
    )
    # END DATABASE CONFIGURATION

    # GENERAL CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#time-zone
    TIME_ZONE = "Africa/Lagos"
    # TIME_ZONE = 'UTC'

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#language-code
    LANGUAGE_CODE = "en_NG"
    # LANGUAGE_CODE = 'en-us'

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#site-id
    SITE_ID = 1

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#use-i18n
    USE_I18N = True

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#use-l10n
    USE_L10N = True

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#use-tz
    USE_TZ = True
    # END GENERAL CONFIGURATION

    # STATIC FILE CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#static-root
    STATIC_ROOT = join(os.path.dirname(BASE_DIR), "staticfiles")

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#static-url
    STATIC_URL = "/static/"

    # See: https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#std:setting-STATICFILES_DIRS
    STATICFILES_DIRS = (join(BASE_DIR, "static"),)

    # See: https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#staticfiles-finders
    STATICFILES_FINDERS = (
        "django.contrib.staticfiles.finders.AppDirectoriesFinder",
        "django.contrib.staticfiles.finders.FileSystemFinder",
        # 'pipeline.finders.PipelineFinder',
    )
    # END STATIC FILE CONFIGURATION

    # MEDIA CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#media-root
    MEDIA_ROOT = join(BASE_DIR, "media")

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#media-url
    MEDIA_URL = "/media/"
    # END MEDIA CONFIGURATION

    # URL Configuration
    ROOT_URLCONF = "config.api_urls"

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#wsgi-application
    WSGI_APPLICATION = "config.wsgi.application"
    # End URL Configuration

    # mailchimp settings
    MAILCHIMP_API_KEY = os.getenv(
        "MAILCHIMP_API_KEY", "1721d8016fbe7ce0afc760cd7c0aa88e-us9"
    )
    MAILCHIMP_LIST_ID = os.getenv("MAILCHIMP_LIST_ID", "a05e6298c6")

    # END AUTHENTICATION CONFIGURATION

    # Custom user app defaults
    # Select the correct user model
    AUTH_USER_MODEL = "users.User"
    LOGIN_REDIRECT_URL = "users:redirect"
    LOGIN_URL = "account_login"
    # END Custom user app defaults

    # SLUGLIFIER
    AUTOSLUG_SLUGIFY_FUNCTION = "slugify.slugify"
    # END SLUGLIFIER

    # LOGGING CONFIGURATION

    LOGGING = {
        "version": 1,
        "disable_existing_loggers": False,
        "filters": {
            "require_debug_false": {"()": "django.utils.log.RequireDebugFalse"}
        },
        "formatters": {
            "verbose": {
                "format": "%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s"
            },
            "simple": {"format": "%(levelname)s %(message)s"},
        },
        "handlers": {
            "mail_admins": {
                "level": "ERROR",
                "filters": ["require_debug_false"],
                "class": "django.utils.log.AdminEmailHandler",
            },
            "console": {
                "level": "DEBUG",
                "class": "logging.StreamHandler",
                "formatter": "verbose",
            },
        },
        "loggers": {
            "django.request": {
                "handlers": ["console"],
                "level": "ERROR",
                "propagate": True,
            },
            "skills": {
                "handlers": ["console"],
                "level": "INFO",
                "filters": ["require_debug_false"],
            },
            "users": {"handlers": ["console"], "level": "INFO", "formatter": "simple"},
            "registration": {
                "handlers": ["console"],
                "level": "INFO",
                "formatter": "simple",
            },
            "rewards": {
                "handlers": ["console"],
                "level": "INFO",
                "formatter": "simple",
            },
            "external": {
                "handlers": ["console"],
                "level": "INFO",
                "formatter": "simple",
            },
            "helps": {"handlers": ["console"], "level": "INFO", "formatter": "simple"},
        },
    }
    # END LOGGING CONFIGURATION

    BROKER_URL = os.getenv("BROKER_URL", "redis://localhost:6379/0")
    BROKER_TRANSPORT = os.getenv("BROKER_TRANSPORT", "redis")
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost/")
    FILE_TO_USE = os.getenv("FILE_TO_USE", 1)

    CELERY_ACCEPT_CONTENT = ["json"]
    CELERY_TASK_SERIALIZER = "json"
    CELERY_RESULT_SERIALIZER = "json"
    CELERY_TIMEZONE = "UTC"
    # celerybeat

    # Bootstrap admin
    BOOTSTRAP_ADMIN_SIDEBAR_MENU = True

    GOOGLE_API_KEY = os.getenv(
        "GOOGLE_API_KEY", "AIzaSyBRExCXa72a41yeU31TQ1BXXdWIB7erzbc"
    )

    # CELERY_IMPORTS = ["registration.tasks"]
    CELERY_TASK_RESULT_EXPIRES = 7 * 86400  # 7 days
    # needed for worker monitoring
    CELERY_SEND_EVENTS = True
    # where to store periodic tasks (needed for scheduler)

    # Django twilio
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_DEFAULT_CALLERID = os.getenv("TWILIO_DEFAULT_CALLERID", "")
    PAYPAL_RECEIVER_EMAIL = os.getenv(
        "PAYPAL_RECEIVER_EMAIL", "tuteriacorp-facilitator@gmail.com"
    )
    PAYPAL_TEST = values.BooleanValue(True)
    PAYPAL_SANDBOX_IMAGE = (
        "https://www.paypalobjects.com/webstatic/en_US/btn/btn_pponly_142x27.png"
    )
