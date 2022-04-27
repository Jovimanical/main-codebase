import os

# import sentry_sdk
# from sentry_sdk.integrations.django import DjangoIntegration

# -*- coding: utf-8 -*-
from .local import Local  # noqa
from .production import Production  # noqa
from .test import Test
from .staging import StagingProd
from .staging2 import StagingDev
from .staging4 import StagingDev as StagingDev4
from .staging3 import StagingDev as StagingDev2
from .godwin import Godwin as GodwinLocal
from .api import Common as Api
from .debug_production import Production as DebugProduction

# add following lines to the end of settings.py
# import djcelery
# djcelery.setup_loader()

# from .celery import app as celery_app

# sentry_sdk.init(
#   dsn=StagingProd.SENTRY_DSN,
#   integrations=[DjangoIntegration()],
#   send_default_pii=True,
#   traces_sample_rate=1.0,
# )