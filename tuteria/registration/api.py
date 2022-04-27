from rest_framework import serializers
from rest_framework.fields import ReadOnlyField
from registration import models


class AdminEducationSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Education
        fields = ("school", "course", "degree")


class AdminWorkExperienceSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.WorkExperience
        fields = ("name", "role", "currently_work")


class EducationSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Education
        fields = ("degree",)
