# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.conf.urls import include, url
from .. import views
from ..autocomplete_light_registry import TutorSkillAutocomplete, SkillAutocomplete

urlpatterns = (
    url(
        regex=r"^update-quiz/?$",
        view=csrf_exempt(views.update_quiz),
        name="update_new_quiz",
    ),
    url(
        regex=r"^select-subjects/?$",
        view=csrf_exempt(views.user_select_subjects),
        name="add-subjects-to_teach",
    ),
    url(
        regex=r"^retake-quiz/?$",
        view=csrf_exempt(views.update_retake_status),
        name="add-subjects-to_teach",
    ),
    url(
        regex=r"^begin-quiz/?$",
        view=csrf_exempt(views.begin_quiz),
        name="begin_quiz",
    ),
    url(
        regex=r"^login/?$",
        view=csrf_exempt(views.login_tutor),
        name="new-tutor-flow-login",
    ),
    url(
        regex=r"^complete-application/?$",
        view=csrf_exempt(views.complete_tutor_application),
        name="complete_tutor_application",
    ),
    url(
        regex=r"^delete-subject/?$",
        view=csrf_exempt(views.delete_tutor_subjects),
        name="delete_tutor_subjects",
    ),
    url(
        regex=r"^validate-personal-info/?$",
        view=csrf_exempt(views.validate_personal_info),
        name="validate-personal-info",
    ),
    url(
        regex=r"^non-testable-subjects/?$",
        view=csrf_exempt(views.get_non_testable_subjects),
        name="non_testable_subjects",
    ),
    url(
        regex=r"^update-non-testable-subjects/?$",
        view=csrf_exempt(views.update_non_testable_subjects_with_quizes),
        name="update_non_testable_subjects_with_quizes",
    ),
    
    url(
        regex=r"^get-related-subjects/?$",
        view=csrf_exempt(views.get_related_subjects),
        name="request_related_subjects",
    ),
    
)
