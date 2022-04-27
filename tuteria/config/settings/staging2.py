# -*- coding: utf-8 -*-
"""
Local Configurations

- Runs in Debug mode
- Uses console backend for emails
- Use Django Debug Toolbar
"""
import os
from configurations import values
from .local import Local as Common


class StagingDev(Common):
    # INSTALLED_APPS
    # SECRET_KEY = 'biolaoye'
    # END INSTALLED_APPS

    # Mail settings
    EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
    EMAIL_PORT = 1025
    EMAIL_BACKEND = values.Value("django.core.mail.backends.console.EmailBackend")
    STATIC_ROOT = os.getenv("STATIC_ROOT", os.path.join(Common.BASE_DIR, "staticfiles"))
    MEDIA_ROOT = os.getenv("MEDIA_ROOT", "")
    # EMAIL_BACKEND = "djrill.mail.backends.djrill.DjrillBackend"
    # MANDRILL_API_KEY = values.Value('9uLNNKKwdIcbbvOGB1JubA')
    # End mail settings

    # django-debug-toolbar
    # MIDDLEWARE_CLASSES = Common.MIDDLEWARE_CLASSES + ('debug_toolbar.middleware.DebugToolbarMiddleware',)
    # INSTALLED_APPS = Common.INSTALLED_APPS + (
    #     # 'debug_toolbar', 
    #     'raven.contrib.django.raven_compat',)
    #
    # INTERNAL_IPS = ('127.0.0.1',)
    #
    # DEBUG_TOOLBAR_CONFIG = {
    # 'DISABLE_PANELS': [
    #         'debug_toolbar.panels.redirects.RedirectsPanel',
    #     ],
    #     'SHOW_TEMPLATE_CONTEXT': True,
    # }
    # end django-debug-toolbar

    # Your local stuff: Below this line define 3rd party libary settingsALLOWED_HOSTS = ["*"]
    # END SITE CONFIGURATION
    ALLOWED_HOSTS = [
        "tuteria.com",
        "tuteria.ngrok.com",
        "192.168.99.100",
        "web.tuteria.com",
        "localhost",
        "ci.tuteria.com",
        "backup.tuteria.com",
        "b3dfefdd.ngrok.io",
        "vps483971.ovh.net",
        "127.0.0.1"
    ]
    STATIC_HOST = os.getenv("STATIC_HOST", "")
    # STATIC_HOST = ""
    STATIC_URL = STATIC_HOST + "/static/"
    # STATICFILES_FINDERS = Common.STATICFILES_FINDERS
    # STATICFILES_FINDERS += ("pipeline.finders.PipelineFinder",)

    # STATICFILES_STORAGE = DEFAULT_FILE_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'
    # STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
    # STATICFILES_STORAGE = DEFAULT_FILE_STORAGE = 'config.storages.GzipManifestPipelineStorage'
    # END SITE CONFIGURATION
    # STATICFILES_STORAGE = 'config.GzipManifestPipelineStorage'
