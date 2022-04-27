import logging

# from hijack.admin import HijackUserAdmin
import cloudinary


from skills.services import TutorSkillService
from rewards.models import Milestone
from users.admin import filters
from users.admin.forms import CalculateDistanceForm
from ..models import UserProfile, UserIdentification, UserMilestone, User
from django.contrib import admin, messages

logger = logging.getLogger(__name__)

from registration.tasks.tasks1 import sms_to_tutors_to_apply, verify_id_to_new_tutors


class identificationMixin(object):

    def get_queryset(self, request):
        return (
            super(identificationMixin, self)
            .get_queryset(request)
            .prefetch_related("user__socialaccount_set")
        )

    def mark_id_as_verified(self, request, queryset):
        public_ids = [x.identity.public_id for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        users = [x.user for x in queryset.all()]
        UserIdentification.objects.filter(
            pk__in=queryset.values_list("pk", flat=True)
        ).update(verified=True, identity=None)
        # queryset.update(verified=True, identity=None)
        reward2 = Milestone.get_milestone(Milestone.VERIFIED_ID)
        for user in users:
            if user.tuteria_verified:
                UserMilestone.objects.get_or_create(user=user, milestone=reward2)

    def mark_id_as_rejected(self, request, queryset):
        public_ids = [x.identity.public_id for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        queryset.delete()

    def mark_user_profile_as_rejected(self, request, queryset):
        from users.tasks import re_upload_profile_pic

        user_ids = [x.user_id for x in queryset.all()]
        profiles = UserProfile.objects.filter(user_id__in=user_ids)
        public_ids = [x.image.public_id for x in profiles.all()]
        cloudinary.api.delete_resources(public_ids)
        profiles.update(image=None, image_approved=False)
        for x in user_ids:
            re_upload_profile_pic.delay(x)

    def remove_verification_images_for_verified_users(self, request, queryset):
        public_ids = [x.identity.public_id for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        queryset.update(identity=None)


class DistanceMixin(admin.ModelAdmin):
    list_display2 = ("distance",)
    actions = [
        "send_emails_to_tutors_on_request",
        "send_mail_to_verify_id",
        "send_mail_to_reupload_profile_picture",
        "sms_to_tutors_to_apply",
        "sms_to_tutors_to_create_subjects",
        "set_tutor_ability_to_teach_online",
        "remove_tutor_ability_to_teach_online",
        "update_price_for_selected_tutor",
        #    'tutor_statistics',
        #    'send_emails_to_tutors_on_request2'
    ]
    action_form = CalculateDistanceForm

    def tutor_location(self, obj):
        return obj.location_set.actual_tutor_address()

    def update_price_for_selected_tutor(self, request, queryset):
        price = request.POST.get("price")
        TutorSkillService.update_prices_for_tutors(
            list(queryset.values_list("pk", flat=True)), int(price)
        )
        self.message_user(request, "Tutor's price updated successfully")

    def sms_to_tutors_to_apply(self, request, queryset):
        request_pk = request.POST.get("request_pk")
        for x in queryset.values_list("pk", flat=True):
            sms_to_tutors_to_apply.delay(x, request_pk)

    def set_tutor_ability_to_teach_online(self, request, queryset):
        queryset.update(teach_online=True)

    def remove_tutor_ability_to_teach_online(self, request, queryset):
        queryset.update(teach_online=False)

    def sms_to_tutors_to_create_subjects(self, request, queryset):
        from registration.tasks import sms_to_create_subjects

        for x in queryset.values_list("pk", flat=True):
            sms_to_create_subjects.delay(x)

    def send_emails_to_tutors_on_request(self, request, queryset):
        from connect_tutor.tasks import mail_to_tutor_on_request_application

        request_pk = request.POST.get("request_pk")

        if request_pk:
            for x in queryset.all():
                mail_to_tutor_on_request_application.delay(request_pk, x.pk)

    # def send_emails_to_tutors_on_request2(self, request, queryset):
    #     from connect_tutor.tasks import mail_to_tutor_on_request_application
    #     request_pk = queryset.first()
    #     if request_pk.request_info:
    #         for x in queryset.all():
    #             mail_to_tutor_on_request_application.delay(
    #                 x.request_info_id, x.pk)

    def send_mail_to_verify_id(self, request, queryset):
        for x in queryset.all():
            verify_id_to_new_tutors.delay(x.pk)

    # def tutor_statistics(self, request, queryset):
    #     state = request.GET.get('state')
    # return HttpResponseRedirect(reverse('users:tutor-stats', args=[state]))

    def send_mail_to_reupload_profile_picture(self, request, queryset):
        for x in queryset.all():
            verify_id_to_new_tutors.delay(x.pk, False)

    def distance(self, obj):
        loc = self.tutor_location(obj)
        if loc:
            return loc.calculate_distance(self.latitude, self.longitude)

    def get_list_display(self, request):
        if hasattr(self, "latitude") and hasattr(self, "longitude"):
            return self.list_display + self.list_display2
        return super(DistanceMixin, self).get_list_display(request)

    def changelist_view(self, request, *args, **kwargs):
        if request.session.get("admin_latitude") and request.session.get(
            "admin_longitude"
        ):
            self.latitude = request.session["admin_latitude"]
            self.longitude = request.session["admin_longitude"]
        return super(DistanceMixin, self).changelist_view(request, *args, **kwargs)


class AdminMixins(DistanceMixin):
    list_display = ("tutor", "classes")
    list_filter = (
        filters.StateFilter,
        filters.NotVerifiedFilter,
        filters.GenderFilter,
        filters.OnlyVerifiedTutorFilter,
    )

    def mark_as_verified(self, request, queryset):
        queryset.update(verified=True)

    mark_as_verified.description = "Mark as Verified"

    def classes(self, obj):
        return obj.tutor.profile.classes

    def tutor_location(self, obj):
        return obj.tutor.location_set.actual_tutor_address()


class identificationMixin(object):

    def get_queryset(self, request):
        return (
            super(identificationMixin, self)
            .get_queryset(request)
            .prefetch_related("user__socialaccount_set")
        )

    def mark_id_as_verified(self, request, queryset):
        public_ids = [x.identity.public_id for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        users = [x.user for x in queryset.all()]
        UserIdentification.objects.filter(
            pk__in=queryset.values_list("pk", flat=True)
        ).update(verified=True, identity=None)
        # queryset.update(verified=True, identity=None)
        reward2 = Milestone.get_milestone(Milestone.VERIFIED_ID)
        for user in users:
            if user.tuteria_verified:
                UserMilestone.objects.get_or_create(user=user, milestone=reward2)

    def mark_id_as_rejected(self, request, queryset):
        public_ids = [x.identity.public_id for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        queryset.delete()

    def mark_user_profile_as_rejected(self, request, queryset):
        from users.tasks import re_upload_profile_pic

        user_ids = [x.user_id for x in queryset.all()]
        profiles = UserProfile.objects.filter(user_id__in=user_ids)
        public_ids = [x.image.public_id for x in profiles.all()]
        cloudinary.api.delete_resources(public_ids)
        profiles.update(image=None, image_approved=False)
        for x in user_ids:
            re_upload_profile_pic.delay(x)

    def remove_verification_images_for_verified_users(self, request, queryset):
        public_ids = [x.identity.public_id for x in queryset.all()]
        logger.debug("Move to celery task")
        cloudinary.api.delete_resources(public_ids)
        queryset.update(identity=None)
