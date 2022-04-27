from django.conf.urls import url
from django.contrib import admin
from django.http import HttpResponse


def my_view(request):
    return HttpResponse("Hello!")
