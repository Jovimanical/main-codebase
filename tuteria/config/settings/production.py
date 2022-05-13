# -*- coding: utf-8 -*-
from configurations import values

# See:
# http://django-storages.readthedocs.org/en/latest/backends/amazon-S3.html#settings
try:
    from S3 import CallingFormat

    AWS_CALLING_FORMAT = CallingFormat.SUBDOMAIN
except ImportError:
    # TODO: Fix this where even if in Dev this class is called.
    pass
import os

from .staging import StagingProd as Common


class Production(Common):

    # This ensures that Django will be able to detect a secure connection
    # properly on Heroku.
    ALLOWED_HOSTS = [
        "tuteria.com",
        "www.tuteria.com",
        "app.tuteria.com",
        "web2.tuteria.com",
        "staging.tuteria.com",
        "tutor-search.tuteria.com",
        "vps483971.ovh.net",
        "staging-prod.tuteria.com",
        "dev.tuteria.com",
        "dev-django.tuteria.com",
        "beeola.tuteria.com",
        "app",
        "app-lb",
        "webserver"
        "release-django.tuteria.com"
    ]

    INSTALLED_APPS = ("whitenoise",) + Common.INSTALLED_APPS

    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

    # Your production stuff: Below this line define 3rd party libary settings
    # STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
