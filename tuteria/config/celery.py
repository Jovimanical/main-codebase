from __future__ import absolute_import
import logging
import os
from celery import Celery
from django.conf import settings
from celery.schedules import crontab, timedelta

logger = logging.getLogger(__name__)
# set the default Django settings module for the 'celery' program.
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
os.environ.setdefault("DJANGO_CONFIGURATION", "Local")

from configurations import importer

importer.install()

# from opbeat.contrib.django.models import client, logger, register_handlers
# from opbeat.contrib.celery import register_signal

# instantiate Celery object
app = Celery("config")
# import celery config file
# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True)
def debug_task(self):
    print("Request: {0!r}".format(self.request))


# if __name__ == '__main__':
#     celery.start()

# try:
#     register_signal(client)
# except Exception as e:
#     logger.exception('Failed installing celery hook: %s' % e)

# if 'opbeat.contrib.django' in settings.INSTALLED_APPS:
#     register_handlers()
