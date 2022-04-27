from rest_framework import serializers
from rest_framework.fields import ReadOnlyField

from . import models
from registration.api import (
    EducationSerializer,
    AdminEducationSerializer,
    AdminWorkExperienceSerializer,
)
from skills.api import AdminTutorSkillSerializer


class LocationSerializer(serializers.ModelSerializer):
    address_type = ReadOnlyField(source="get_addr_type_display")

    class Meta:
        model = models.Location
        fields = (
            "vicinity",
            "state",
            "address_type",
            "addr_type",
            "longitude",
            "latitude",
            "address",
        )


class TutorScheduleSerializer(serializers.ModelSerializer):
    booked = ReadOnlyField(source="booked_days")
    free = ReadOnlyField(source="available_days")

    class Meta:
        model = models.User
        fields = ("booked", "free")


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.UserProfile
        fields = ("gender", "dob", "public_id")


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()
    education_set = EducationSerializer(many=True)
    location_set = LocationSerializer(many=True)

    class Meta:
        model = models.User
        fields = ("education_set", "profile", "location_set", "first_name")


class AdminUserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.UserProfile
        fields = (
            "description",
            "gender",
            "dob",
            "image",
            "tutoring_address",
            "tutoring_distance",
            "address_reason",
            "tutor_description",
            "years_of_teaching",
            "classes",
            "curriculum_used",
            "curriculum_explanation",
        )


class AdminUserSerializer(serializers.HyperlinkedModelSerializer):
    location_set = LocationSerializer(many=True)
    profile = AdminUserProfileSerializer()
    education_set = AdminEducationSerializer(many=True)
    workexperience_set = AdminWorkExperienceSerializer(many=True)
    tutorskill_set = AdminTutorSkillSerializer(many=True)

    class Meta:
        model = models.User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "slug",
            "profile",
            "location_set",
            "education_set",
            "workexperience_set",
            "tutorskill_set",
        )


class ApiUserSerializer(serializers.HyperlinkedModelSerializer):
    primary_phone_no = serializers.SerializerMethodField()

    class Meta:
        model = models.User
        fields = ("id", "email", "slug", "first_name", "last_name", "primary_phone_no")

    def get_primary_phone_no(self, obj):
        return str(obj.primary_phone_no.number)


class ApiUserWithLocationSerializer(ApiUserSerializer):
    location_set = LocationSerializer(many=True)
    phone_number = ReadOnlyField(source="the_number")

    class Meta(ApiUserSerializer.Meta):
        fields = ApiUserSerializer.Meta.fields + ("location_set", "phone_number")
