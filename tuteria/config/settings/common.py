# -*- coding: utf-8 -*-
"""
Django settings for Tuteria project.

For more information on this file, see
https://docs.djangoproject.com/en/dev/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/dev/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
import decimal
from os.path import join
from datetime import timedelta

from celery.schedules import crontab
from configurations import Configuration, values
import environ
from .. import BASE_DIR

env = environ.Env()


class Common(Configuration):
    BASE_DIR = BASE_DIR
    # APP CONFIGURATION
    DJANGO_APPS = (
        # Default Django apps:
        "django.contrib.auth",
        "django.contrib.contenttypes",
        "django.contrib.sessions",
        "django.contrib.sites",
        "django.contrib.messages",
        "django.contrib.staticfiles",
        "django.contrib.sitemaps",
        "django.contrib.postgres",
        "django.forms",
        # Useful template tags:
        "django.contrib.humanize",
    )
    THIRD_PARTY_APPS = (
        "crispy_forms",  # Form layouts
        "allauth",  # registration
        "allauth.account",  # registration
        "allauth.socialaccount",  # registration
        "allauth.socialaccount.providers.facebook",  # facebook login
        "allauth.socialaccount.providers.twitter",  # twitter login
        "allauth.socialaccount.providers.google",
        "allauth.socialaccount.providers.linkedin_oauth2",
        "phonenumber_field",  # phonenumber
        "django_countries",  # list of countries
        "cloudinary",  # image manipulation
        "django_extensions",  # extensions for django,
        "rest_framework",  # django rest framework
        "embed_video",  # youtube and vimeo tags for django
        "taggit",  # tag manager for django,
        # 'taggit_bootstrap',  # styling for taggit
        # 'django_languages',  # list of languages to use with django model
        "model_utils",  # dependency on django quiz
        "mailchimp",  # mailing list api,
        "bootstrap3",  # bootstrap 3 settings,
        "activelink",  # active links in templates,
        "django_js_reverse",  # django url for javascript files
        "schedule",  # tutor scheduling,
        "geoposition",  # latitude and longitude field
        # 'djcelery',  # celery,
        "bootstrap_pagination",
        # 'mptt',
        # 'tagging',
        # 'django_comments',
        # 'zinnia_bootstrap',
        # 'zinnia',
        # 'zinnia_markitup',
        # 'django_bitly',
        # 'zinnia_twitter',
        "hijack",
        "compat",
        # 'devserver',
        # 'sorl.thumbnail',
        # 'django_twilio',
        "markupfield",
        "cachalot",
        "paypal.standard.ipn",
        "andablog",
        # 'markitup',
        "pagedown",
        # 'ckeditor',
        # 'ckeditor_uploader',
        "webpack_loader",
        # 'haystack',
        # 'fixture_magic',
        "static_sitemaps",
        "import_export",
        # 'easy_select2',
        # "advanced_filters",
        "graphene_django",
        "jchart",
        "hubspot",
        "hijack_admin",
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
        "payroll",
        "wallet",
        "reviews",
        "referrals",
        "connect_tutor",
        "pricings",
        "courses",
        "tutor_management",
    )

    ADMIN_APPS = (
        # 'bootstrap_admin',
        # Admin
        # 'grappelli.dashboard',
        # 'grappelli',
        # 'jet',
        "dal",
        "dal_select2",
        "django.contrib.admin",
    )
    STATICSITEMAPS_ROOT_SITEMAP = "config.sitemaps.my_sitemaps"
    PAYPAL_RECEIVER_EMAIL = os.getenv(
        "PAYPAL_RECEIVER_EMAIL", "tuteriacorp-facilitator@gmail.com"
    )
    PAYPAL_TEST = values.BooleanValue(True)
    PAYPAL_SANDBOX_IMAGE = (
        "https://www.paypalobjects.com/webstatic/en_US/btn/btn_pponly_142x27.png"
    )
    CURRENCY_API_KEY = os.getenv("CURRENCY_API_KEY", "3ba92caf00e0ddfe10eaff24813e3f25")
    CURRENCY_API_URL = "http://apilayer.net/api/live"
    PROCESSING_FEE = decimal.Decimal("3000")
    ABSCONDED_FEE = decimal.Decimal("5000")
    """ A python-markdown example that allows HTML in the entry content """
    MARKITUP_FILTER = ("markdown.markdown", {"safe_mode": False})
    # MARKITUP_SET = 'markitup/sets/markdown'
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#installed-apps
    INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS + ADMIN_APPS
    # END APP CONFIGURATION

    # MIDDLEWARE CONFIGURATION
    MIDDLEWARE_CLASSES = (
        "django.middleware.security.SecurityMiddleware",
        "django.middleware.gzip.GZipMiddleware",
        # 'htmlmin.middleware.HtmlMinifyMiddleware',
        # 'htmlmin.middleware.MarkRequestMiddleware',
        "users.middleware.SetLastVisitMiddleware",
        "users.middleware.FlaggedUserMiddleware",
        "config.corsheaders.middleware.CorsMiddleware",
        "django.contrib.sessions.middleware.SessionMiddleware",
        "django.middleware.common.CommonMiddleware",
        "django.middleware.csrf.CsrfViewMiddleware",
        "django.contrib.auth.middleware.AuthenticationMiddleware",
        # 'cached_auth.Middleware',
        "django.contrib.messages.middleware.MessageMiddleware",
        "django.middleware.clickjacking.XFrameOptionsMiddleware",
        # "anafero.middleware.SessionJumpingMiddleware",
        "config.middleware.MobileDetectionMiddleware",
        "config.middleware.ReferralAttachmentMiddleware",
    )
    MIDDLEWARE = list(MIDDLEWARE_CLASSES)
    # END MIDDLEWARE CONFIGURATION
    GRAPPELLI_ADMIN_TITLE = "Tuteria"

    GRAPPELLI_INDEX_DASHBOARD = {
        "django.contrib.admin.site": "tuteria.dashboard.CustomIndexDashboard",
        # 'yourproject.admin.admin_site': 'tuteria.my_dashboard.CustomIndexDashboard',
    }

    # MIGRATIONS CONFIGURATION
    MIGRATION_MODULES = {"sites": "contrib.sites.migrations"}
    # END MIGRATIONS CONFIGURATION
    CORS_ORIGIN_ALLOW_ALL = True
    # DEBUG
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#debug
    DEBUG = values.BooleanValue(False)

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#template-debug
    # TEMPLATE_DEBUG = DEBUG
    # END DEBUG

    # SECRET CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
    # Note: This key only used for development and testing.
    # In production, this is changed to a values.SecretValue() setting
    SECRET_KEY = "CHANGEME!!!"
    # END SECRET CONFIGURATION

    # FIXTURE CONFIGURATION
    # See:
    # https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-FIXTURE_DIRS
    FIXTURE_DIRS = (join(BASE_DIR, "fixtures"),)
    # END FIXTURE CONFIGURATION

    # EMAIL CONFIGURATION
    EMAIL_BACKEND = values.Value("django.core.mail.backends.smtp.EmailBackend")
    # EMAIL_HOST = 'smpt.mandrillapp.com'
    # EMAIL_HOST_USER = values.Value()
    # EMAIL_HOST_PASSWORD = values.Value()
    # EMAIL_PORT = 587
    # END EMAIL CONFIGURATION
    # REST_FRAMEWORK = {

    # }
    CKEDITOR_IMAGE_BACKEND = "pillow"
    CKEDITOR_CONFIGS = {
        "default": {"toolbar": "full", "height": 300, "width": "100%"},
        "awesome_ckeditor": {"toolbar": "Basic"},
    }
    CKEDITOR_UPLOAD_PATH = "uploads/"
    REST_FRAMEWORK = {
        # Use Django's standard `django.contrib.auth` permissions,
        # or allow read-only access for unauthenticated users.
        # 'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly',),
        "DEFAULT_FILTER_BACKENDS": (
            "rest_framework_filters.backends.DjangoFilterBackend",
        ),
        # 'PAGE_SIZE': 10
    }
    # REST_FRAMEWORK = {
    # 'PAGE_SIZE': 10,
    # 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination'
    # }
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
    # DATABASES = values.DatabaseURLValue(
    #     'postgres://vagrant:punnisher@127.0.0.1/tuteria')
    DATABASES = {
        # Raises ImproperlyConfigured exception if DATABASE_URL not in os.environ
        "default": env.db(
            "DATABASE_URL", default="postgres://vagrant:punnisher@127.0.0.1/tuteria"
        ),
        # 'replica': env.db('REPLICA_DATABASE_URL', default='postgres://tuteria:punnisher@127.0.0.1:5435/tuteria')
    }
    DATABASES["default"]["ATOMIC_REQUESTS"] = True

    # END DATABASE CONFIGURATION

    # CACHING
    # Do this here because thanks to django-pylibmc-sasl and pylibmc
    # memcacheify (used on heroku) is painful to install on windows.
    # CACHES = {
    #     'default': {
    #         'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
    #         # 'BACKEND': 'django.core.cache.backends.memcached.PyLibMCCache',
    #         'LOCATION': os.getenv('DJANGO_CACHE', '127.0.0.1:11211'),
    #         # 'TIMEOUT': 500,
    #         # 'BINARY': True,
    #         # 'OPTIONS': {  # Maps to pylibmc "behaviors"
    #         # 'tcp_nodelay': True,
    #         # 'ketama': True
    #         # }

    #     }
    # }
    # END CACHING

    # GENERAL CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#time-zone
    # TIME_ZONE = "Africa/Lagos"
    TIME_ZONE = "UTC"

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#language-code
    # LANGUAGE_CODE = "en_NG"
    LANGUAGE_CODE = "en-us"

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#site-id
    SITE_ID = 1

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#use-i18n
    USE_I18N = True

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#use-l10n
    USE_L10N = True

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#use-tz
    # USE_TZ = True
    # END GENERAL CONFIGURATION

    # TEMPLATE CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#template-context-processors
    # TEMPLATE_CONTEXT_PROCESSORS = (
    #     'django.contrib.auth.context_processors.auth',
    #     "allauth.account.context_processors.account",
    #     "allauth.socialaccount.context_processors.socialaccount",
    #     'django.core.context_processors.debug',
    #     'django.core.context_processors.i18n',
    #     'django.core.context_processors.media',
    #     'django.core.context_processors.static',
    #     'django.core.context_processors.tz',
    #     'django.contrib.messages.context_processors.messages',
    #     'django.core.context_processors.request',
    #     # 'zinnia.context_processors.version',  # Optional
    #     # Your stuff: custom template context processers go here
    #     'users.context_processors.consts',

    # )

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#template-dirs
    # TEMPLATE_DIRS = (
    #     join(BASE_DIR, 'templates'),
    # )

    TEMPLATES = [
        {
            "BACKEND": "django.template.backends.django.DjangoTemplates",
            "DIRS": [join(BASE_DIR, "templates")],
            "APP_DIRS": True,
            # 'TEMPLATE_DEBUG':DEBUG,
            "OPTIONS": {
                "context_processors": [
                    "django.contrib.auth.context_processors.auth",
                    # "allauth.account.context_processors.account",
                    # "allauth.socialaccount.context_processors.socialaccount",
                    "django.template.context_processors.debug",
                    "django.template.context_processors.i18n",
                    "django.template.context_processors.media",
                    "django.template.context_processors.static",
                    "django.template.context_processors.tz",
                    "django.contrib.messages.context_processors.messages",
                    "django.template.context_processors.request",
                    # 'zinnia.context_processors.version',  # Optional
                    # Your stuff: custom template context processers go here
                    "users.context_processors.consts",
                ],
                # 'loaders': [
                #     ('django.template.loaders.cached.Loader', [
                #         'django.template.loaders.filesystem.Loader',
                #         'django.template.loaders.app_directories.Loader',
                #     ]),
                # ],
            },
        }
    ]

    # TEMPLATE_LOADERS = (
    #     'app_namespace.Loader',
    #     'django.template.loaders.filesystem.Loader',
    #     'django.template.loaders.app_directories.Loader',
    #     # 'django_jinja.loaders.FileSystemLoader',
    #     # 'django_jinja.loaders.AppLoader',

    # )
    DEFAULT_JINJA2_TEMPLATE_EXTENSION = ".jinja"

    # session
    # SESSION_ENGINE = 'bookings.session_backend'
    SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
    SESSION_CACHE_ALIAS = "default"

    # See:
    # http://django-crispy-forms.readthedocs.org/en/latest/install.html#template-packs
    CRISPY_TEMPLATE_PACK = "bootstrap3"
    # END TEMPLATE CONFIGURATION

    # STATIC FILE CONFIGURATION
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#static-root
    STATIC_ROOT = join(os.path.dirname(BASE_DIR), "staticfiles")

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#static-url
    STATIC_URL = "/static/"
    APPLE_PAY_FILE = "apple-developer-merchantid-domain-association"

    # See:
    # https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#std:setting-STATICFILES_DIRS
    STATICFILES_DIRS = (join(BASE_DIR, "static"),)

    WEBPACK_LOADER = {
        "DEFAULT": {
            "BUNDLE_DIR_NAME": "rq/",
            "STATS_FILE": join(BASE_DIR, "static", "webpack-stats.json"),
        }
    }

    # See:
    # https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#staticfiles-finders
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
    ROOT_URLCONF = "config.urls"

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#wsgi-application
    WSGI_APPLICATION = "config.wsgi.application"
    # End URL Configuration

    # AUTHENTICATION CONFIGURATION
    AUTHENTICATION_BACKENDS = (
        "django.contrib.auth.backends.ModelBackend",
        "allauth.account.auth_backends.AuthenticationBackend",
    )

    # Some really nice defaults
    ACCOUNT_EMAIL_REQUIRED = True
    DEFAULT_FROM_EMAIL = "Tuteria <automated@tuteria.com>"
    ACCOUNT_AUTHENTICATION_METHOD = "email"
    ACCOUNT_EMAIL_VERIFICATION = "optional"
    ACCOUNT_LOGOUT_ON_GET = True
    ACCOUNT_USERNAME_REQUIRED = False
    ACCOUNT_SIGNUP_FORM_CLASS = "users.forms.SignupForm"
    ACCOUNT_USER_DISPLAY = "users.models.display_name"
    ACCOUNT_ADAPTER = "users.adapter.TuteriaAccountAdapter"
    ACCOUNT_SIGNUP_PASSWORD_VERIFICATION = False
    ACCOUNT_CONFIRM_EMAIL_ON_GET = True
    SOCIALACCOUNT_QUERY_EMAIL = True
    ACCOUNT_LOGOUT_REDIRECT_URL = "/invite"
    SOCIALACCOUNT_PROVIDERS = {
        "facebook": {
            "SCOPE": ["email", "public_profile", "user_link"],
            "METHOD": "js_sdk",
            "VERSION": "v2.12",
            "FIELDS": [
                "id",
                "email",
                "name",
                "first_name",
                "last_name",
                "verified",
                "locale",
                "timezone",
                "link",
                "gender",
                "updated_time",
            ],
        },
        "google": {
            "SCOPE": ["profile", "email"],
            "AUTH_PARAMS": {"access_type": "online"},
        },
        "linkedin": {
            "SCOPE": ["r_basicprofile", "r_emailaddress"],
            "PROFILE_FIELDS": [
                "id",
                "first-name",
                "last-name",
                "email-address",
                "picture-url",
                "public-profile-url",
            ],
        },
    }

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
    # See: https://docs.djangoproject.com/en/dev/ref/settings/#logging
    # A sample logging configuration. The only tangible logging
    # performed by this configuration is to send an email to
    # the site admins on every HTTP 500 error when DEBUG=False.
    # See http://docs.djangoproject.com/en/dev/topics/logging for
    # more details on how to customize your logging configuration.

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
            # 'logstash': {
            #     'level':'DEBUG' if DEBUG else 'INFO',
            #     'class': 'logging.handlers.SysLogHandler',
            #     'address': (os.environ['SYSLOG_SERVER'],
            #         int(os.environ['SYSLOG_PORT'])),
            #     'socktype': socket.SOCK_STREAM if os.environ['SYSLOG_PROTO'] else socket.SOCK_DGRAM,
            # }
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

    # Your common stuff: Below this line define 3rd party library settings

    # CELERY SETTINGS

    CELERY_BROKER_URL = os.getenv("BROKER_URL", "redis://localhost:6379/0")
    CELERY_BROKER_TRANSPORT = os.getenv("BROKER_TRANSPORT", "redis")
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost/")
    FILE_TO_USE = os.getenv("FILE_TO_USE", 1)

    CELERY_ACCEPT_CONTENT = ["json"]
    CELERY_TASK_SERIALIZER = "json"
    CELERY_RESULT_SERIALIZER = "json"
    CELERY_TIMEZONE = "UTC"
    CELERY_ROUTES = {
        "static_sitemaps.tasks.GenerateSitemap": {"queue": "sitemaps"},
        "connect_tutor.tasks.send_mail_to_tutors_in_state_teaching": {
            "queue": "tutoring_jobs"
        },
        "connect_tutor.tasks.emails_sent_to_tutors_who_fall_in_the_list_of_subjects": {
            "queue": "tutoring_jobs"
        },
        # "external.tasks.task1.drip_messager_pending": {
        #     "queue": "drips"
        # },
        "external.tasks.tasks1.drip_messager": {"queue": "drips"},
    }
    # celerybeat
    # CELERYBEAT_SCHEDULE = {
    CELERY_BEAT_SCHEDULE = {
        "new_request_email": {
            "task": "external.tasks.tasks1.remove_useless_request_from_admin",
            "schedule": timedelta(seconds=3600 * 4),
        },
        "bookings-that-have-been-delivered-and-3-days-have-elapsed": {
            "task": "bookings.tasks.tasks1.update_delivered_bookings_to_completed_after_3_days",
            "schedule": timedelta(seconds=3600 * 3),
        },
        "bookings-to_occur_within-the-hour": {
            "task": "bookings.tasks.tasks1.trigger_email_notification_one_hour",
            "schedule": timedelta(seconds=3600 * 1),
        },
        "verified-id-reward-by-2am-daily": {
            "task": "rewards.tasks.tasks1.verified_id_reward",
            "schedule": crontab(hour=2, minute=00),
        },
        "occurrences-that-have-expired": {
            "schedule": crontab(hour=3, minute=00),
            "task": "registration.tasks.tasks1.remove_occurrences_that_have_expired",
        },
        "events-that-have-expired": {
            "schedule": crontab(hour=3, minute=30),
            "task": "registration.tasks.tasks1.remove_events_that_have_expired",
        },
        "90-days-elapsed-after-failed-tutor-application": {
            "schedule": crontab(hour=4, minute=00),
            # 'task': 'registration.tasks.reactivate_valid_denied_users'
            "task": "registration.tasks.tasks1.update_denied_user_status",
        },
        "email-blast-to-all-tutors-about-request": {
            "schedule": crontab(minute=0, hour="7,13,17"),
            "task": "connect_tutor.tasks.emails_sent_to_tutors_who_fall_in_the_list_of_subjects",
        },
        "update_levels_of_users": {
            "schedule": crontab(hour=14, minute=0),
            "task": "bookings.tasks.tasks1.update_levels_of_users",
        },
        "to-retake-skill": {
            "schedule": crontab(hour=11, minute=00),
            "task": "skills.tasks.tasks1.to_be_retaken",
        },
        "email_on_amount_owed": {
            "schedule": crontab(day_of_week=3, hour=12, minute=00),
            "task": "bookings.tasks.task1.send_mail_to_clients_on_amount_owed",
        },
        "emails_to_make_payments": {
            "schedule": crontab(hour=8, minute=00),
            "task": "external.tasks.task1.send_email_to_client_and_admin_to_make_payment_of_booking",
        },
        "bookings-to-expire-soon": {
            "schedule": crontab(hour=18, minute=00),
            "task": "bookings.tasks.tasks1.booking_to_be_expired_soon",
        },
        "booking_to_be_expired_soon_in_3_days": {
            "schedule": crontab(hour=18, minute=10),
            "task": "bookings.tasks.tasks1.booking_to_be_expired_soon_in_3_days",
        },
        # 'drip_messager_pending': {
        #     'schedule': crontab(hour=8, minute=30),
        #     'task': 'external.tasks.tasks1.drip_messager_pending'
        # },
        "drip_messager": {
            "schedule": timedelta(seconds=3472 * 2),
            "task": "external.tasks.tasks1.drip_messager",
        },
        # "new_request_drip_messenger": {
        #     "schedule": timedelta(seconds=60 * 60),
        #     "task": "external.tasks.tasks1.new_drip_messenger",
        # },
        "drip_messages_to_old_stuck_users": {
            "schedule": crontab(hour=10, minute=00),
            "task": "users.tasks.tasks1.drip_messages_to_old_stuck_users",
        },
        "drip_messages_to_tutors_with_no_subjects": {
            "schedule": crontab(hour=11, minute=00),
            "task": "users.tasks.tasks1.drip_messages_to_tutors_with_no_subjects",
        },
        # 'delete_after_all_email_blast': {
        #     'schedule': crontab(hour=22, minute=00),
        #     'task': 'external.tasks.tasks1.delete_after_all_email_blast'
        # },
        "referral_received_today": {
            "schedule": crontab(hour=23, minute=00),
            "task": "referrals.tasks.referral_recieved_today",
        },
        "tutorskills_with_no_test_taken": {
            "schedule": crontab(hour=3, minute=00),
            "task": "skills.tasks.background_task_to_delete_unquized_subjects",
        },
        "sales_daily_analytics": {
            "schedule": crontab(hour=7, minute=00),
            "task": "external.tasks.tasks1.daily_sales_analytics",
        },
        "reminder_to_contact_clients": {
            "schedule": crontab(hour=7, minute=00),
            "task": "bookings.tasks.tasks1.reminder_to_contact_clients",
        },
        "tutor_success_daily_analytics": {
            "schedule": crontab(hour=7, minute=00),
            "task": "external.tasks.tasks1.daily_tutor_success_analytics",
        },
        "database_view_update": {
            "schedule": timedelta(seconds=3600),
            "task": "external.tasks.tasks1.update_applicant_records",
        },
    }

    # Bootstrap admin
    BOOTSTRAP_ADMIN_SIDEBAR_MENU = True

    GOOGLE_API_KEY = os.getenv(
        "GOOGLE_API_KEY", "AIzaSyBRExCXa72a41yeU31TQ1BXXdWIB7erzbc"
    )

    # CELERY_IMPORTS = ["registration.tasks"]
    CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers.DatabaseScheduler"
    CELERY_TASK_RESULT_EXPIRES = 7 * 86400  # 7 days
    # needed for worker monitoring
    CELERY_SEND_EVENTS = True
    CELERYD_PREFETCH_MULTIPLIER = 1

    BITLY_LOGIN = values.Value("o_6r1qt35of9")
    BITLY_API_KEY = values.Value("R_f72fe50b7d3d22809d61acd523931382")
    BITLY_ACCESS_TOKEN = values.Value("cbc958f2d988bee56f1c878081d2edeedbd15222")
    TWITTER_CONSUMER_KEY = ""
    TWITTER_CONSUMER_SECRET = ""
    TWITTER_ACCESS_KEY = ""
    TWITTER_ACCESS_SECRET = ""

    # Hijack user session
    HIJACK_LOGOUT_REDIRECT_URL = "/we-are-allowed/users/user"
    HIJACK_LOGIN_REDIRECT_URL = "/dashboard/"
    HIJACK_DISPLAY_ADMIN_BUTTON = False
    HIJACK_USE_BOOTSTRAP = True
    HIJACK_ALLOW_GET_REQUESTS = True
    HIJACK_REGISTER_ADMIN = False

    # Django twilio
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_DEFAULT_CALLERID = os.getenv("TWILIO_DEFAULT_CALLERID", "")
    TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+13349541263")

    PAGA_KEY = os.getenv("PAGA_KEY", "")
    # JS_REVERSE_JS_MINIFY = False
    JS_REVERSE_EXCLUDE_NAMESPACES = ["admin", "djdt"]
    GOOGLE_CLIENT_ID = os.getenv(
        "GOOGLE_CLIENT_ID",
        "527492296794-5vgq21fj2cjp9qi92dfdbkdde4eu8efh.apps.googleusercontent.com",
    )
    YAHOO_CLIENT_ID = os.getenv(
        "YAHOO_CLIENT_ID",
        "dj0yJmk9eVk2ZGN4cHhwRlZUJmQ9WVdrOVoyVk5WMWRUTm5NbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1iYQ--",
    )
    CALENDAR_API_URL = os.getenv("CALENDAR_API_URL", "http://localhost:5000/api")
    VICINITY_SERVER = os.getenv("VICINITY_SERVER", "http://localhost:8001")

    PAYSTACK_SECRET_KEY = os.getenv(
        "PAYSTACK_SECRET_KEY", "sk_test_ef74328ecbde1dda03cd2ec844af04a9db121fb0"
    )
    PAYSTACK_PUBLIC_KEY = os.getenv(
        "PAYSTACK_PUBLIC_KEY", "pk_test_3146e297e6d0463fea560139bc122a4aae04fedb"
    )
    PAYSTACK_BASE_URL = "https://api.paystack.co"
    PAYSTACK_SUCCESS_URL = "redirect_func"
    HAYSTACK_CONNECTIONS = {
        "default": {
            "ENGINE": "haystack.backends.elasticsearch_backend.ElasticsearchSearchEngine",
            "URL": os.getenv("ELASTIC_URL", "http://127.0.0.1:9200/"),
            "INDEX_NAME": "haystack",
        }
    }
    INFOBIB_CREDENTIALS = os.getenv("INFOBIB_CREDENTIALS", "TuTeria1:Test123!")
    INFOBIB_DEFAULT_NUMBER = os.getenv("INFOBIB_DEFAULT_NUMBER", "+2348168573886")
    PAYMENT_SERVICE_URL = os.getenv(
        "PAYMENT_SERVICE_URL", "http://localhost:8001/payments"
    )
    BOOKING_SERVICE_URL = os.getenv(
        "BOOKING_SERVICE_URL", "http://localhost:8001/bookings"
    )
    NOTIFICATION_SERVICE_URL = os.getenv("EMAIL_SERVICE_URL", "http://172.21.0.1:5000")
    # Django Countries
    COUNTRIES_ONLY = ["GB", "US", "CA", "NG"]

    PAYMENT_URL = "http://invoice.tuteria.com"

    # Service Endpoints
    REQUEST_SERVICE_URL = os.getenv("REQUEST_SERVICE_URL", "http://localhost:8001/")
    TUTOR_SERVICE_URL = os.getenv("TUTOR_SERVICE_URL", "http://localhost:8002/")
    GRAPHENE = {
        "SCHEMA": "config.schema.schema",
        "SCHEMA_INDENT": 2,
        "MIDDLEWARE": ("graphene_django.debug.DjangoDebugMiddleware",),
    }

    HUBSPOT_CLIENT_ID = os.environ.get("HUBSPOT_CLIENT_ID")
    HUBSPOT_CLIENT_SECRET = os.environ.get("HUBSPOT_CLIENT_SECRET")
    HUBSPOT_SCOPES = "contacts timeline files"
    HUBSPOT_API_KEY = os.environ.get("HUBSPOT_API_KEY")
    HUBSPOT_REDIRECT_URL = ""

    # def createfb_user(cls,**user_date):
    #     import pdb; pdb.set_trace()
    #     return {}

    # FB_URL_ON_SUCCESS = 'users:fb_login:redirect_on_success'

    # GOOGLE_URL_ON_SUCCESS = "users:google_login:redirect_on_success"

    # FB_CREATE_USER_CALLBACK = createfb_user
    GOOGLE_CREATE_USER_CALLBACK = ""

    FACEBOOK_APP_SECRET = os.environ.get("FACEBOOK_APP_SECRET")
    FACEBOOK_APP_ID = os.environ.get("FACEBOOK_APP_ID")
    FACEBOOK_REDIRECT_URL = os.environ.get("FACEBOOK_REDIRECT_URL")

    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")

    ## Tuteria's
    # NOTIFY_ACTIVITY_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/2915629/zb44v0/'
    ## Peter's
    NOTIFY_ACTIVITY_WEBHOOK = "https://hooks.zapier.com/hooks/catch/2993606/zv2wkg/"
    TUTOR_ACTIVITY_WEBHOOK = "https://hooks.zapier.com/hooks/catch/2993606/kzq3dr/"

    ## Tuteria's
    # FOLLOW_UP_NEW_CLIENT_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/2915629/zqkl88/'
    ## Peter's
    FOLLOW_UP_NEW_CLIENT_WEBHOOK = (
        "https://hooks.slack.com/services/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"
    )
    # "https://hooks.zapier.com/hooks/catch/2993606/zv913v/")
    PARENT_REQUEST_URL = os.getenv(
        "PARENT_REQUEST_URL",
        "/hometutors"
        # "/s/hometutors"
        # 'PARENT_REQUEST_URL', "/home-tutors-in-nigeria"
    )
    GROUP_LESSONS_URL = os.getenv("GROUP_LESSONS_URL", "https://classes.tuteria.com")
    SCHEDULER_HOST_URL = os.getenv(
        "SCHEDULER_HOST_URL", "http://email-service.tuteria.com:8020"
    )
    TUTERIA_ACCESS_CODE = os.getenv("TUTERIA_ACCESS_CODE", "TuteriaPermit2233")
    DJANGO_ADMIN_URL = os.getenv("DJANGO_ADMIN_URL", "")
    HIJACK_AUTHORIZE_STAFF = True
    # CDN_SERVICE = "https://api-cdn.tuteria.com"
    CDN_SERVICE = os.getenv("CDN_SERVICE", "https://api-cdn.tuteria.com")
    # CDN_SERVICE = "http://localhost:3000"
    MEDIA_FORMAT = "tuteria"
    # MEDIA_SERVICE = "http://localhost:8000"
    # MEDIA_SERVICE = "http://dev.tuteria.com:8020"
    MEDIA_SERVICE = "http://sheet.tuteria.com:8020"
    # USE_NEW_FLOW = True
    USE_NEW_FLOW = os.getenv("USE_NEW_FLOW") == "True"
    BECOME_TUTOR_URL = os.getenv("BECOME_TUTOR_URL", "https://tutors.tuteria.com")

    SENTRY_DSN = (
        "https://efbc57c8734a4f0ab936eb4718bd3fa3@o1104616.ingest.sentry.io/6133786"
    )
    TEST_EMAIL = os.getenv("TEST_EMAIL")
    NEW_PROFILE_URL = os.getenv("NEW_PROFILE_URL", "https://hometutors.tuteria.com")
    USE_NEW_LAYOUT = os.getenv("USE_NEW_LAYOUT", "").lower() == "true"
    TUTERIA_CDN_URL = os.getenv(
        "TUTOR_CLIENT_CDN", "https://tutor-client-cdn-phi.vercel.app"
    )
    # SILENCED_SYSTEM_CHECKS = ["admin.E127"]
