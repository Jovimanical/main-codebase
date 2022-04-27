from os.path import dirname

BASE_DIR = dirname(dirname(__file__))
from .celery import app as celery_app

__all__ = ["celery_app"]
