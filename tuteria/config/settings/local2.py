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


class Local(Common):
    # DEBUG
    DEBUG = values.BooleanValue(True)
    # END DEBUG

    # INSTALLED_APPS
    # END INSTALLED_APPS

    # # Mail settings
    # EMAIL_HOST = "localhost"
    # EMAIL_PORT = 1025
    # EMAIL_BACKEND = values.Value('django.core.mail.backends.console.EmailBackend')
    # EMAIL_HOST_USER = 'gbozee@gmail.com'
    # EMAIL_HOST_PASSWORD = '9uLNNKKwdIcbbvOGB1JubA'
    # EMAIL_USE_TLS = True
    # EMAIL_BACKEND = "djrill.mail.backends.djrill.DjrillBackend"
    MANDRILL_API_KEY = values.Value("9uLNNKKwdIcbbvOGB1JubA")
    # End mail settings
    # ALLOWED_HOSTS = values.ListValue(['*'])
    # django-debug-toolbar
    # MIDDLEWARE_CLASSES = Common.MIDDLEWARE_CLASSES + ('debug_panel.middleware.DebugPanelMiddleware',
    # 'devserver.middleware.DevServerMiddleware',
    # )
    #
    INTERNAL_IPS = ("127.0.0.1", "192.168.33.10", "0.0.0.0")
    #

    # end django-debug-toolbar
    # DEVSERVER_DEFAULT_PORT = '8002'

    # Your local stuff: Below this line define 3rd party libary settings
    #
    # CACHES = values.CacheURLValue(default="memcached://192.168.33.10:11211")
    # CACHES = {
    #     'default': {
    #         'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    #     }
    # }
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
        # 'debug-panel': {
        #     'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        #     # 'LOCATION': '/var/tmp/debug-panel-cache',
        #     'LOCATION': 'F:/debug-panel-cache',
        #     'OPTIONS': {
        #         'MAX_ENTRIES': 200
        #     }
        # }
    }
    GRAPH_MODELS = {
        # 'all_applications': True,
        # 'group_models': True,
    }
    GRAPHENE = Common.GRAPHENE
