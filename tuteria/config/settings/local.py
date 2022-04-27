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
import socket


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
    ALLOWED_HOSTS = [
        "*",
        u"localhost",
        u"localhost:8000",
        "backup.tuteria.com",
        "b3dfefdd.ngrok.io",
    ]
    # django-debug-toolbar
    MIDDLEWARE_CLASSES = Common.MIDDLEWARE_CLASSES + (
        "debug_toolbar.middleware.DebugToolbarMiddleware",
        # 'whitenoise.middleware.WhiteNoiseMiddleware',
    )
    MIDDLEWARE = list(MIDDLEWARE_CLASSES)
    # MIDDLEWARE_CLASSES = Common.MIDDLEWARE_CLASSES + ('debug_panel.middleware.DebugPanelMiddleware',
    # 'devserver.middleware.DevServerMiddleware',
    # )
    INSTALLED_APPS = (
        "debug_toolbar",
        # 'whitenoise.runserver_nostatic',
        # 'devserver',
        # 'debug_panel','template_timings_panel',
        # 'debug_toolbar_line_profiler','pympler'
    ) + Common.INSTALLED_APPS
    #
    INTERNAL_IPS = [
        "127.0.0.1",
        "10.0.2.2",
        "192.168.56.101",
        "localhost",
        "backup.tuteria.com",
    ]
    # ALLOWED_HOSTS = INTERNAL_IPS
    # tricks to have debug toolbar when developing with docker
    if os.environ.get("USE_DOCKER") == "yes":
        ip = socket.gethostbyname(socket.gethostname())
        INTERNAL_IPS += [ip[:-1] + "1"]

    def custom_show_toolbar(self):
        # return False
        return True

    DEBUG_TOOLBAR_CONFIG = {
        "DISABLE_PANELS": ["debug_toolbar.panels.redirects.RedirectsPanel"],
        "SHOW_TEMPLATE_CONTEXT": True,
        "SHOW_TOOLBAR_CALLBACK": custom_show_toolbar,
        # 'SHOW_TOOLBAR_CALLBACK': 'ddt_request_history.panels.request_history.allow_ajax',
    }
    DEBUG_TOOLBAR_PANELS = [
        # 'ddt_request_history.panels.request_history.RequestHistoryPanel',  # Here it is
        "debug_toolbar.panels.versions.VersionsPanel",
        "debug_toolbar.panels.timer.TimerPanel",
        "debug_toolbar.panels.settings.SettingsPanel",
        "debug_toolbar.panels.headers.HeadersPanel",
        "debug_toolbar.panels.request.RequestPanel",
        "debug_toolbar.panels.sql.SQLPanel",
        "debug_toolbar.panels.staticfiles.StaticFilesPanel",
        "debug_toolbar.panels.templates.TemplatesPanel",
        "cachalot.panels.CachalotPanel",
        "debug_toolbar.panels.cache.CachePanel",
        # 'debug_toolbar.panels.signals.SignalsPanel',
        "debug_toolbar.panels.logging.LoggingPanel",
        # 'debug_toolbar.panels.redirects.RedirectsPanel',
        # 'template_timings_panel.panels.TemplateTimings.TemplateTimings',
        # 'debug_toolbar.panels.profiling.ProfilingPanel',
        # 'debug_toolbar_line_profiler.panel.ProfilingPanel',
        "debug_toolbar.panels.timer.TimerDebugPanel",
        # 'pympler.panels.MemoryPanel',
    ]

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
    # DATABASES = values.DatabaseURLValue(
    #     'postgres://vagrant:punnisher@192.168.33.10/tuteria')
    GRAPH_MODELS = {
        # 'all_applications': True,
        # 'group_models': True,
    }
    GRAPHENE = Common.GRAPHENE
    GRAPHENE["MIDDLEWARE"] = ("graphene_django.debug.DjangoDebugMiddleware",)
    CELERY_ALWAYS_EAGER = True
    CELERY_TASK_ALWAYS_EAGER = True
    TASK_ALWAYS_EAGER = True
    task_always_eager = True
