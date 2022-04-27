from django.conf.urls import include, url
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = (
    url(
        regex=r"^admin/update-remark/?$",
        view=csrf_exempt(views.update_remark),
        name="update_applicant_remark",
    ),
    url(
        regex=r"^admin/verify-identity-video/?$",
        view=csrf_exempt(views.update_video_identity_status),
        name="update_applicant_video_identity",
    ),
    url(
        regex=r"^admin/update-guarantors/?$",
        view=csrf_exempt(views.update_guarantors),
        name="update_applicant_guarantors",
    ),
    url(
        regex=r"^admin/approve-guarantors/?$",
        view=csrf_exempt(views.approve_guarantors),
        name="approve_applicant_guarantors",
    ),
)
