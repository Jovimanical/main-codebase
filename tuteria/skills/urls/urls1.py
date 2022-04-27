# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

from django.conf import settings
from django.conf.urls import include, url

from users.decorators import tuteria_agreement_requirement
from .. import views
from ..autocomplete_light_registry import TutorSkillAutocomplete, SkillAutocomplete

urlpatterns = (
    # '',
    # Uncomment the next line to enable the admin:
    url(
        regex=r"^$",
        # view=views.tutor_subjects',
        # view=views.TutorSubjectRedirectView.as_view(),
        view=tuteria_agreement_requirement(views.TutorSubjectsView.as_view()),
        name="tutor_subjects",
    ),
    url(
        r"^tutorskill-autocomplete/$",
        TutorSkillAutocomplete.as_view(),
        name="skill-autocomplete",
    ),
    url(
        r"^skill-autocomplete/$",
        SkillAutocomplete.as_view(),
        name="sskill-autocomplete",
    ),
    url(
        r"^found-subjects/(?P<slug>[\w.@+-]+)/$",
        views.found_subject,
        name="found_subjects",
    ),
    url(
        regex=r"^portal/$",
        view=views.EnhancedSubjectsView.as_view(),
        name="subject-portal",
    ),
    url(
        regex=r"^new/$",
        view=views.SubjectLandingView.as_view(),
        name="subject_creation_landing",
    ),
    url(
        regex=r"^(?P<slug>[\w.@+-]+)/edit",
        view=views.TutorSubjectUpdateView.as_view(),
        name="edit_subject",
    ),
    url(
        regex=r"^exam/(?P<quiz_url>[\w.@+-]+)/started$",
        view=views.quiz_started,
        name="quiz_started",
    ),
    url(
        regex=r"^exam/(?P<quiz_url>[\w.@+-]+)/completed$",
        view=views.exam_result,
        name="quiz_completed",
    ),
    url(
        regex=r"^exam/(?P<quiz_url>[\w.@+-]+)/non-testable$",
        view=views.add_tutor_skill,
        name="non_testable",
    ),
    url(
        regex=r"^verify-skill/(?P<quiz_url>[\w.@+-]+)/$",
        view=views.verify_skill,
        name="verify_skill_taken",
    ),
    url(
        regex=r"^delete/(?P<slug>[\w.@+-]+)/$",
        view=views.SubjectDeleteView.as_view(),
        name="delete_subject",
    ),
    url(
        regex=r"^pricing-on-subject/$",
        view=views.pricing_on_subject,
        name="pricing_on_subject",
    ),
    url(
        regex=r"^validate_skill/(?P<pk>[\w.@+-]+)/$",
        view=views.ValidateSkillView.as_view(),
        name="validate_skill",
    ),
    # url(regex=r'^update-wallet-booking/(?P<order>[\w.@+-]+)/$',view=views.UpdateBookingView.as_view(),
    #     name='update_wallet_booking_price'),
    # new subject-flow endpoints
    url(
        regex=r"^new-subject-flow/update-quiz$",
        view=views.ValidateSkillView.as_view(),
        name="validate_skill",
    ),
)
