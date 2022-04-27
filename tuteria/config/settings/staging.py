# -*- coding: utf-8 -*-
"""
Local Configurations

- Runs in Debug mode
- Uses console backend for emails
- Use Django Debug Toolbar
"""
import os
from configurations import values
from .common import Common

# from .with_services import MCommon as Common


class StagingProd(Common):

    # This ensures that Django will be able to detect a secure connection
    # properly on Heroku.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

    # INSTALLED_APPS
    # INSTALLED_APPS = Common.INSTALLED_APPS + \
    #     (
    #         # 'django_bitly',
    #      'django_celery_beat',
    #         'elasticapm.contrib.django', )
    # # END INSTALLED_APPS
    # #
    # MIDDLEWARE_CLASSES = (
    #     'elasticapm.contrib.django.middleware.TracingMiddleware',
    #     'elasticapm.contrib.django.middleware.Catch404Middleware',

    #                       'whitenoise.middleware.WhiteNoiseMiddleware',
    #                       ) + Common.MIDDLEWARE_CLASSES
    INSTALLED_APPS = Common.INSTALLED_APPS + (
        # 'django_bitly',
        # 'opbeat.contrib.django',
        # 'elasticapm.contrib.django',
        "django_celery_beat",
        "raven.contrib.django.raven_compat",
    )
    # END INSTALLED_APPS
    #
    MIDDLEWARE_CLASSES = (
        "whitenoise.middleware.WhiteNoiseMiddleware",
        # 'elasticapm.contrib.django.middleware.TracingMiddleware',
        # 'elasticapm.contrib.django.middleware.Catch404Middleware',
        # 'opbeat.contrib.django.middleware.OpbeatAPMMiddleware',
    ) + Common.MIDDLEWARE_CLASSES
    MIDDLEWARE = list(MIDDLEWARE_CLASSES)
    STATIC_ROOT = os.getenv(
        "STATIC_ROOT", os.path.join(os.path.dirname(Common.BASE_DIR), "staticfiles")
    )
    MEDIA_ROOT = os.getenv(
        "MEDIA_ROOT", os.path.join(os.path.dirname(Common.BASE_DIR), "media")
    )
    # SECRET KEY
    # SECRET_KEY = values.SecretValue()
    SECRET_KEY = os.getenv("SECRET_KEY")
    # OPBEAT = {
    #     'ORGANIZATION_ID': 'f077189cab044c75b53ec8de6eca105f',
    #     'APP_ID': 'd83429cd42',
    #     'SECRET_TOKEN': '598244a4e1b1fb617ef2bb989c137c0d465fcf85',
    # }
    # END SECRET KEY

    # set this to 60 seconds and then to 518400 when you can prove it works
    SECURE_HSTS_SECONDS = 60
    SECURE_HSTS_INCLUDE_SUBDOMAINS = values.BooleanValue(True)
    SECURE_FRAME_DENY = values.BooleanValue(True)
    SECURE_CONTENT_TYPE_NOSNIFF = values.BooleanValue(True)
    SECURE_BROWSER_XSS_FILTER = values.BooleanValue(True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = values.BooleanValue(True)
    # SECURE_SSL_REDIRECT = values.BooleanValue(True)
    # SECURE_SSL_HOST = values.Value('192.168.33.15')
    # end django-secure

    # SITE CONFIGURATION
    # Hosts/domain names that are valid for this site
    # See https://docs.djangoproject.com/en/1.6/ref/settings/#allowed-hosts

    USE_X_FORWARDED_HOST = True
    MY_SITE_DOMAIN = os.environ.get("SITE_DOMAIN")
    HOSTNAME = os.getenv("HOSTNAME", "")
    DOMAIN_NAME = os.getenv("DOMAIN_NAME", "")
    # if MY_SITE_DOMAIN:
    #     ALLOWED_HOSTS = [MY_SITE_DOMAIN,HOSTNAME,DOMAIN_NAME]

    ALLOWED_HOSTS = ["*"]
    # END SITE CONFIGURATION

    # STORAGE CONFIGURATION
    # See: http://django-storages.readthedocs.org/en/latest/index.html
    # INSTALLED_APPS += (
    #     'storages',
    # )

    # See: http://django-storages.readthedocs.org/en/latest/backends/amazon-S3.html#settings
    # STATICFILES_STORAGE = DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
    # STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
    # STATICFILES_STORAGE = DEFAULT_FILE_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'

    # See: http://django-storages.readthedocs.org/en/latest/backends/amazon-S3.html#settings
    # AWS_ACCESS_KEY_ID = values.SecretValue()
    # AWS_SECRET_ACCESS_KEY = values.SecretValue()
    # AWS_STORAGE_BUCKET_NAME = values.SecretValue()
    # AWS_AUTO_CREATE_BUCKET = True
    # AWS_QUERYSTRING_AUTH = False

    # # see: https://github.com/antonagestam/collectfast
    # AWS_PRELOAD_METADATA = True
    # INSTALLED_APPS += ("collectfast", )

    # AWS cache settings, don't change unless you know what you're doing:
    # AWS_EXPIREY = 60 * 60 * 24 * 7
    # AWS_HEADERS = {
    #     'Cache-Control': 'max-age=%d, s-maxage=%d, must-revalidate' % (
    #         AWS_EXPIREY, AWS_EXPIREY)
    # }

    # See: https://docs.djangoproject.com/en/dev/ref/settings/#static-url
    STATIC_HOST = os.getenv("STATIC_HOST", "")
    STATIC_URL = STATIC_HOST + "/static/"
    # STATICFILES_STORAGE = DEFAULT_FILE_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'
    # STATICFILES_STORAGE = DEFAULT_FILE_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
    # STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

    # STATIC_URL = 'https://s3.amazonaws.com/%s/' % AWS_STORAGE_BUCKET_NAME
    # END STORAGE CONFIGURATION

    # EMAIL
    EMAIL_HOST = os.getenv("EMAIL_HOST")
    EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
    # EMAIL_HOST_USER = values.SecretValue(environ_prefix="", environ_name="SENDGRID_USERNAME")
    # EMAIL_PORT = values.IntegerValue(587, environ_prefix="", environ_name="EMAIL_PORT")
    # EMAIL_SUBJECT_PREFIX = values.Value('[Tuteria] ', environ_name="EMAIL_SUBJECT_PREFIX")
    # EMAIL_USE_TLS = True
    # SERVER_EMAIL = EMAIL_HOST_USER
    # END EMAIL

    # Your production stuff: Below this line define 3rd party libary settings

    # DEBUG
    DEBUG = values.BooleanValue(False)
    # TEMPLATE_DEBUG = DEBUG
    # END DEBUG

    # INTERNAL_IPS = ('127.0.0.1',)
    #

    # Your local stuff: Below this line define 3rd party libary settingsALLOWED_HOSTS = ["*"]
    # END SITE CONFIGURATION

    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": os.getenv("CACHE_URL", ""),
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "COMPRESS_MIN_LEN": 10,
                "PARSER_CLASS": "redis.connection.HiredisParser",
                "IGNORE_EXCEPTIONS": True,
            },
        }
    }
    PAYPAL_TEST = False
    PAYPAL_SANDBOX_IMAGE = (
        "https://www.paypalobjects.com/webstatic/en_US/btn/btn_pponly_142x27.png"
    )
    # DATABASES = {
    #     'default': {
    #         'ENGINE': 'django.db.backends.postgresql_psycopg2',
    #         'NAME': 'tuteria',
    #         'USER': os.getenv('DB_USER'),
    #         'PASSWORD': os.getenv('DB_PASSWORD'),
    #         'HOST': os.getenv('DB_HOST'),
    #         # 'OPTIONS': {
    #         #     'sslmode': 'require',
    #         # },
    #     },
    # }

    # LOGGING = {
    #     'version': 1,
    #     'disable_existing_loggers': False,
    #     'formatters': {
    #         'verbose': {
    #             'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
    #         },
    #         'simple': {
    #             'format': '%(levelname)s %(message)s'
    #         },
    #     },
    #     'filters': {
    #         'require_debug_true': {
    #             '()': 'django.utils.log.RequireDebugTrue',
    #         },
    #     },
    #     'handlers': {
    #         'console': {
    #             'level': 'INFO',
    #             'filters': ['require_debug_true'],
    #             'class': 'logging.StreamHandler',
    #             'formatter': 'simple'
    #         },
    #     },
    #     'loggers': {
    #         'django': {
    #             'handlers': ['console'],
    #             'propagate': True,
    #         },
    #         'django.request': {
    #             'handlers': ['console'],
    #             'level': 'DEBUG',
    #             'propagate': False,
    #         },
    #     }
    # }

    # Added in the advent of implementing Elastic APM Stack
    LOGGING = {
        "version": 1,
        "disable_existing_loggers": True,
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
            # 'elasticapm': {
            #     'level': 'WARNING',
            #     'class': 'elasticapm.contrib.django.handlers.LoggingHandler',
            # },
            # "mail_admins": {
            #     "level": "ERROR",
            #     "filters": ["require_debug_false"],
            #     "class": "django.utils.log.AdminEmailHandler",
            # },
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
            "django.db.backends": {
                "level": "ERROR",
                "handlers": ["console"],
                "propagate": False,
            },
            # 'mysite': {
            #     'level': 'WARNING',
            #     'handlers': ['elasticapm'],
            #     'propagate': False,
            # },
            # Log errors from the Elastic APM module to the console (recommended)
            # 'elasticapm.errors': {
            #     'level': 'ERROR',
            #     'handlers': ['console'],
            #     'propagate': False,
            # },
        },
    }
    # END LOGGING CONFIGURATION
    # Elastic APM Configuration
    ELASTIC_APM = {
        "SERVICE_NAME": os.getenv("ELASTIC_APM_SERVICE_NAME", "tuteria"),
        "SECRET_TOKEN": os.getenv("ELASTIC_APM_SECRET_TOKEN", ""),
        "SERVER_URL": os.getenv("ELASTIC_APM_SERVER_URL", "http://localhost:8200"),
        "MAX_QUEUE_SIZE": 100,
        "DEBUG": Common.DEBUG,
    }
    RAVEN_CONFIG = {
        "dsn": "https://bec66e852b214b09a30f065c4a546907:d6e57e9912b945a491a78d90f29d3f79@sentry.io/1248132",
        # "dsn": "https://bbd840b69b0a4fa09f4045cbc09f5fde:fc4690765e454f438828e6e974760950@sentry.io/293221",
        # If you are using git, you can also automatically configure the
        # release based on the git info.
    }
    MEDIA_FORMAT = 'tuteria'
