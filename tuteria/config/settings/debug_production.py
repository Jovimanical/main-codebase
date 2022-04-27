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
    DEBUG = True

    # This ensures that Django will be able to detect a secure connection
    # properly on Heroku.
    ALLOWED_HOSTS = ["*"]

    INSTALLED_APPS = ("whitenoise",) + Common.INSTALLED_APPS

    # Your production stuff: Below this line define 3rd party libary settings
    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"
