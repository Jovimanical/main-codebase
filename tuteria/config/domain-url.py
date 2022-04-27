import os
from django.http.response import FileResponse
from django.conf import settings
from django.conf.urls import include, url


def apple_pay(request, order):
    BASE_DIR = os.path.dirname(__file__)
    file = open(os.path.join(BASE_DIR, order), "rb")
    return FileResponse(file)


app_name = "help"
urlpatterns = (
    # '',
    url(r"^(?P<order>[\w.@+-]+)$", apple_pay, name="apple_pay"),
)
