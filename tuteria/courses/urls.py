from django.views.decorators.csrf import csrf_exempt
from . import views
from django.conf.urls import url, include
from .autocomplete_light_registry import CourseUserAutocomplete

app_name = "courses"
urlpatterns = [
    url(
        r"^courses-autocomplete/$",
        CourseUserAutocomplete.as_view(),
        name="course-autocomplete",
    ),
    url(
        r"^initialize$",
        csrf_exempt(views.initialize_interest),
        name="course-initialize",
    ),
    url(r"^login$", csrf_exempt(views.login), name="course-login"),
    url(
        r"^authenticate",
        csrf_exempt(views.authenticate_login),
        name="course-authenticate",
    ),
    url(r"^update", csrf_exempt(views.update_course_user), name="course-update"),
    url(
        r"^get-course-info/(?P<slug>[\w.@+-]+)$",
        csrf_exempt(views.get_course_info),
        name="get-course-info",
    ),
]
