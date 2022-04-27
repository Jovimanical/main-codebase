# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import include, url
from django.views.decorators.cache import cache_control
from django.views.decorators.http import last_modified
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from registration.views import update_calendar
from rest_framework import routers
from skills.views import TutorSkillPublicView, ClientRequestView
from users.decorators import tuteria_agreement_requirement

from .. import views
from ..autocomplete_light_registry import UserAutocomplete


def profile_last_modified(request):
    active_user = request.user
    if active_user.is_authenticated:
        if not active_user.flagged:
            if hasattr(active_user, "profile"):
                return active_user.profile.modified
    return None


router = routers.DefaultRouter()
router.register(r"users", views.AdminUserViewSet)
app_name = "users"
urlpatterns = (
    # '',
    # Uncomment the next line to enable the admin:
    url(
        "^prime-application/$",
        views.PrimeApplicationView.as_view(),
        name="prime-application",
    ),
    url(r"^user-autocomplete/$", UserAutocomplete.as_view(), name="user-autocomplete"),
    url(
        r"^not-interested-in-tutoring/$",
        views.NotInterestedInTutoringView.as_view(),
        name="not_interested_in_tutoring",
    ),
    url(
        regex=r"^mailing-signup/$",
        view=views.MailingListSignUpView.as_view(template_name="account/signup.html"),
        name="mailing_signup",
    ),
    url(
        regex=r"^confirm-subscription/$",
        view=views.ConfirmMailingSubscription.as_view(),
        name="mailing_subscription_confirm",
    ),
    url(regex=r"^resend-email/$", view=views.resend_email, name="resend_mail"),
    url(
        regex=r"^validate-email/$",
        view=views.UserEmailValidationView.as_view(),
        name="validate_email",
    ),
    url(
        regex=r"^check-duplicate-number/$",
        view=views.UserPhoneNumberValidationView.as_view(),
        name="check_duplicate_number",
    ),
    url(
        regex=r"^users/validate-number/$",
        view=views.LoggedInUserPhoneValidation.as_view(),
        name="user_phone_verifcation_process",
    ),
    url(
        regex=r"^validate-primary-number",
        view=views.verify_primary_phone_number,
        name="verify_primary_number",
    ),
    url("^api/", include("django_quiz.urls")),
    url(
        regex=r"^~redirect/$",
        view=views.UserRedirectView.as_view(),
        # view=views.after_login',
        name="redirect",
    ),
    url(
        r"^dashboard/$",
        cache_control(private=True)(
            last_modified(profile_last_modified)(
                tuteria_agreement_requirement(views.UserDashboardView.as_view())
            )
        ),
        name="dashboard",
    ),
    # views.UserDashboardView.as_view(),
    # name='dashboard'),
    # URL pattern for the UserDetailView
    url(
        regex=r"^users/edit/$",
        view=cache_control(private=True)(
            tuteria_agreement_requirement(views.UserEditView.as_view())
        ),
        name="edit_profile",
    ),
    url(regex=r"^users/get_regions/$", view=views.get_regions, name="get_region"),
    url(
        regex=r"^users/edit_tutor/$",
        view=views.TutorProfileEditView.as_view(),
        name="edit_tutor_profile",
    ),
    url(r"update-calendar/$", update_calendar, name="update_calendar"),
    url(
        r"the-region/(?P<state>[\w.@+-]+)/$",
        view=views.RegionView,
        name="the_region_view",
    ),
    url(
        regex=r"^users/edit-media/$",
        view=views.UserEditMediaView.as_view(
            template_name="users/edit_profile/edit_media.html"
        ),
        name="edit_media",
    ),
    url(
        regex=r"^users/upload/(?P<doc_type>[\w.@+-]+)/$",
        view=views.UserUploadView.as_view(
            template_name="users/edit_profile/edit_verification.html"
        ),
        name="identification_upload",
    ),
    url(
        regex=r"^users/new-path/(?P<slug>[\w.@+-]+)/(?P<path>[\w.@+-]+)/$",
        view=views.TutorJobRedirectView.as_view(),
        name="tutor_path_redirect",
    ),
    url(
        regex=r"^users/authenticate/(?P<pk>[\w.@+-]+)/(?P<slug>[\w.@+-]+)/$",
        view=views.ExistingTutorRedirectView.as_view(),
        name="auth_existing_tutor",
    ),
    url(
        regex=r"^users/edit-verification/$",
        view=views.UserVerificationView.as_view(
            template_name="users/edit_profile/edit_verification.html"
        ),
        name="edit_verification",
    ),
    url(
        regex=r"^users/account/$",
        view=views.UserPayoutView.as_view(template_name="users/account/payout.html"),
        name="account",
    ),
    url(
        regex=r"^users/select-subjects/$",
        view=views.SubjectPopulateView.as_view(),
        name="select_subjects",
    ),
    url(
        regex=r"^users/select-subjects/(?P<slug>[\w.@+-]+)/update/$",
        view=views.SubjectCreateView.as_view(),
        name="update_select_subjects",
    ),
    url(
        regex=r"^promote/$",
        view=TemplateView.as_view(template_name="skills/promote.html"),
        name="promote",
    ),
    url(
        regex=r"^users/requests-made/$",
        view=ClientRequestView.as_view(),
        name="requests",
    ),
    url(
        regex=r"^users/jobs/$",
        view=views.JobsView.as_view(),
        name="user_jobs",
    ),
    url(
        regex=r"^users/jobs/(?P<request_slug>[\w.@+-]+)$",
        view=views.JobsDetailView.as_view(),
        name="user_jobs_detail",
    ),
    url(
        regex=r"^users/post-application/$",
        view=views.PostApplication.as_view(),
        name="user_post_application",
    ),
    url(
        regex=r"^users/edit/education/$",
        view=views.EducationHistoryView.as_view(),
        name="user_education_history",
    ),
    url(
        regex=r"^users/edit/location/$",
        view=views.LocationInfoView.as_view(),
        name="user_location",
    ),
    url(
        regex=r"^users/edit/profile-pic/$",
        view=views.ProfilePictureView.as_view(),
        name="user_profile_pic",
    ),
    url(
        regex=r"^users/edit/schedule/$",
        view=views.ScheduleView.as_view(),
        name="user_schedule",
    ),
    url(
        regex=r"^users/edit/teaching-profile/$",
        view=views.TeachingProfileView.as_view(),
        name="user_teaching_profile",
    ),
    url(
        regex=r"^users/edit/verification/$",
        view=views.VerificationView.as_view(),
        name="user_new_verifications",
    ),
    url(
        regex=r"^users/edit/guarantors/$",
        view=views.GuarantorView.as_view(),
        name="user_guarantors",
    ),
    url(
        regex=r"^users/edit/upload-proof/$",
        view=views.UploadProofView.as_view(),
        name="user_edu_work_proof",
    ),
    url(
        regex=r"^users/edit/work-history/$",
        view=views.WorkHistoryView.as_view(),
        name="user_work_history",
    ),
    url(
        regex=r"^users/new-flow-post/?$",
        view=csrf_exempt(views.new_flow_post),
        name="new_flow_post",
    ),
    url(
        r"^i/(?P<slug>[\w.@+-]+)/$",
        views.ReferralSignupView.as_view(template_name="pages/referral.html"),
        name="referral_signup",
    ),
    # url(r'^',include('reviews.urls')),
    url(
        r"^update/tutor-address/$",
        views.NewUpdateAvailability.as_view(),
        # views.UpdateHomeAddress.as_view(),
        name="update_addr",
    ),
    url(
        r"^update/tutor-details/$",
        views.NewUpdateAvailability.as_view(),
        # views.UpdateCalendarView.as_view(),
        name="update_tutor_details",
    ),
    url(r"^users/$", view=views.AngularUserView.as_view(), name="angular_user_app"),
    url(r"^subjects/", include("skills.urls")),
    url(r"^new-subject-flow/", include("skills.urls.urls2")),
    url(r"^users/", include("bookings.urls")),
    url(r"^", include("bookings.admin.urls")),
    url(
        # regex=r"$",
        regex=r"^(?P<slug>[\w.@+-]+)/$",
        view=views.UserProfileView.as_view(),
        name="profile",
    ),
    url(
        regex=r"^ng/(?P<user_slug>[\w.@+-]+)/(?P<slug>[\w.@+-]+)/$",
        view=TutorSkillPublicView.as_view(),
        name="tutor_public_skill_profile",
    ),
    url(
        regex=r"^(?P<slug>[\w.@+-]+)/request/second-step/(?P<request_slug>[\w.@+-]+)/$",
        view=views.TutorSecondStepRequestView.as_view(),
        name="request_second_step",
    ),
    url(
        regex=r"^(?P<slug>[\w.@+-]+)/request/(?P<skill_id>\d+)/second-step/(?P<request_slug>[\w.@+-]+)/$",
        view=views.RequestTutorRedirectView.as_view(),
        name="with_skill_in_url",
    ),
    url(r"^custom-admin-api/", include(router.urls)),
    url(
        r"^admin-analytics/(?P<kind>[\w.@+-]+)",
        view=views.analytics_csv,
        name="customer_insight",
    ),
    url(
        r"^admin/tutor-statistics/all/(?P<state>[\w.@+-]+)$",
        view=views.tutors_stats,
        name="tutor-stats",
    ),
    url(
        r"^redirect_user/(?P<email>[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4})/$",
        views.RedirectLogin.as_view(),
        name="redirect-user",
    ),
)
