# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

from django.conf import settings
from django.conf.urls import include, url
from django_languages.languages import LANGUAGES
from registration import views
from django.views.generic import TemplateView
from users.decorators import tutor_application_completed
app_name = "registration"
urlpatterns = (
    # '',
    # Uncomment the next line to enable the admin:
    url(regex=r"^tutor-landing/$", view=views.tutor_landing, name="tutor_landing"),
    url(
        regex=r"^how-tutoring-works/$",
        view=views.how_tutoring_works,
        name="how_tutoring_works",
    ),
    url(
        regex=r"^how-tutoring-works-terms/$",
        view=views.HowTutoringWorks.as_view(),
        name="how_tutoring_works2",
    ),
    url(
        regex=r"^credentials/$",
        view=views.RedirectCredentials.as_view(),
        name="credentials",
    ),
    # url(regex=r'^tutor-landing/$',
    #     view=views.CredentialView.as_view(),
    #     name="tutor_landing"),
    # url(regex=r'^guarantor/$',
    #     view=views.AgreementView.as_view(),
    #     name="tutor_guarantor"),
    url(
        regex=r"^application-completed/$",
        view=tutor_application_completed(
            TemplateView.as_view(template_name="registration/tutor/step6.html")
        ),
        name="appliation_completed",
    ),
    url(
        regex=r"^begin-registration/$",
        view=views.BeginRegistrationView.as_view(),
        name="begin_registration",
    ),
    url(
        regex=r"^milestone-check/$",
        view=views.MileStoneCheck.as_view(),
        name="milestone_check",
    ),
)
