from django.conf import settings

if settings.FILE_TO_USE == 1:
    from .urls1 import *
