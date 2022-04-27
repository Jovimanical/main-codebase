from django.urls import reverse
from django.utils.functional import cached_property


class AllUserRequirements(object):
    STEPS = ()

    def __init__(self, user, profile=None):
        self.user = user
        self.profile = profile or self.user.profile

    @property
    def has_completed_profile(self):
        root_attr = ["first_name", "last_name", "phone_number_details", "home_address"]
        attr = ["dob", "gender"]
        for x in root_attr:
            if getattr(self.user, x) is None:
                return False
        for y in attr:
            if getattr(self.profile, y) is None:
                return False
        return True

    @property
    def has_uploaded_profile_picture(self):
        if self.profile.image:
            return True
        return False

    @property
    def has_uploaded_a_verified_ID(self):
        return self.user.identity is not None

    @property
    def has_verified_email_address(self):
        return self.user.email_verified

    @property
    def has_connected_social_media(self):
        return (
            self.user.facebook_verified
            or self.user.twitter_verified
            or self.user.google_verified
            or self.user.linkedin_verified
        )

    @property
    def has_completed_verification(self):
        return (
            self.has_uploaded_a_verified_ID
            and self.has_verified_email_address
            and self.has_connected_social_media
        )

    @property
    def complete_profile(self):
        profile = self.user.profile
        return all(
            [
                self.user.first_name,
                self.user.last_name,
                self.user.home_address,
                profile.gender,
                profile.dob,
            ]
        )

    @property
    def phone_verified(self):
        """Phone number belonging to tutor is verified"""
        return self.user.phonenumber_set.filter(verified=True).exists()


class PreRegistration(AllUserRequirements):

    @property
    def has_requirements(self):
        return self.complete_profile and self.phone_verified

    @property
    def has_completed_credentials(self):
        return self.user.profile.registration_level == 1

    @property
    def tutor_verification_passed(self):
        return self.user.profile.registration_level == 0 and self.user.tutor_intent

    @property
    def has_completed_preference(self):
        return self.user.profile.registration_level == 2

    @property
    def has_completed_interview(self):
        from users.models import UserProfile

        pp = UserProfile.objects.get(user=self.user)
        return pp.registration_level == 3

    @property
    def has_added_subjects(self):
        p_s = self.user.profile.potential_subjects
        return p_s is not None and len(p_s) > 0

    @property
    def completed_all_steps(self):
        if self.user.tutor_intent:
            return all(
                [
                    self.has_completed_profile,
                    self.has_uploaded_profile_picture,
                    self.has_completed_preference,
                    self.has_completed_credentials,
                ]
            )
        return all([self.has_completed_profile, self.has_uploaded_profile_picture])

    def get_next_url(self):
        if self.has_completed_profile and self.has_completed_interview:
            # if self.has_completed_profile:
            if self.has_added_subjects:
                if self.has_uploaded_profile_picture:
                    if self.has_completed_verification:
                        if self.user.tutor_intent:
                            return reverse("registration:how_tutoring_works")
                        return reverse("users:dashboard")
                    else:
                        return reverse("registration:how_tutoring_works")
                        # return reverse("users:edit_verification")
                else:
                    return reverse("users:edit_media")
            else:
                return reverse("users:select_subjects")
        return reverse("users:edit_profile")

    def percentage(self):
        counter = 0
        if self.has_completed_profile:
            counter += 3
        if self.has_uploaded_profile_picture:
            counter += 1
        if self.has_verified_email_address:
            counter += 1
        if self.has_uploaded_a_verified_ID:
            counter += 1
        if self.has_connected_social_media:
            counter += 1
        if self.profile.application_status in [
            self.profile.PENDING,
            self.profile.VERIFIED,
        ]:
            counter += 2
        if self.profile.application_status == self.profile.VERIFIED:
            counter += 2
        counters = self.user.tutorskill_set.active().count()
        if counters > 0:
            counter += 2
        if counters >= 2:
            counter += 4
        if self.user.get_referral_instance().referred_someone:
            counter += 3

        if self.profile.application_status > 0:
            return counter * 5
        return counter * 10
