from django_quiz.api import QuestionSerializer
from rest_framework import serializers
from rest_framework.fields import Field
from rest_framework.fields import ReadOnlyField
from taggit.models import Tag
from skills import models
from reviews.models import SkillReview
from users.models import User
from registration.models import Education, WorkExperience, UserCalendar, CalendarDay


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("name",)


class SkillCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SkillCertificate
        fields = ("award_name", "award_institution")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Category
        fields = ("id", "name", "slug")


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Skill
        fields = (
            "name",
            "testable",
            "quiz_url",
            "id",
            "slug",
            "passmark",
            "duration",
            "is_new",
        )


class SkillWithQuizSerializer(SkillSerializer):
    questions = QuestionSerializer(many=True)

    class Meta(SkillSerializer.Meta):
        fields = SkillSerializer.Meta.fields + ("questions",)


class TutorSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TutorSkill
        fields = ("tutor_details", "calendar")


class TutorPublicSkillSerializer(serializers.ModelSerializer):
    calendar = ReadOnlyField(source="calendar_client")

    class Meta:
        model = models.TutorSkill
        fields = ("tutor_details", "calendar")


class SearchSkillRequired(serializers.ModelSerializer):
    class Meta:
        model = models.Skill
        fields = ("name",)


class AdminTutorSkillCertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SkillCertificate
        fields = ("award_name", "award_institution")


class AdminTutorSkillExhibitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SubjectExhibition
        fields = ("image",)


class AdminTutorSkillSerializer(serializers.ModelSerializer):
    skill = SearchSkillRequired()
    exhibitions = AdminTutorSkillExhibitionSerializer(many=True)
    skillcertificate_set = AdminTutorSkillCertificationSerializer(many=True)

    class Meta:
        model = models.TutorSkill
        fields = (
            "skill",
            "description",
            "price",
            "image_url",
            "heading",
            "status",
            "exhibitions",
            "skillcertificate_set",
        )


class ReviewSerializer(serializers.ModelSerializer):
    image = ReadOnlyField(source="reviewer_image")
    date = ReadOnlyField(source="modified")

    class Meta:
        model = SkillReview
        fields = ("review", "date", "reviewer", "image", "location")


class CalendarDaysSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarDay
        fields = ("weekday", "time_slot")


class CalendarSerializer(serializers.ModelSerializer):
    days = CalendarDaysSerializer(many=True)

    class Meta:
        model = UserCalendar
        fields = ("days", "id")


class TutorSerializer(serializers.ModelSerializer):
    gender = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()
    curriculum = serializers.SerializerMethodField()
    levels_taught = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    curriculum_text = serializers.SerializerMethodField()
    about = serializers.SerializerMethodField()
    user_calendar = CalendarSerializer()
    educations = serializers.SerializerMethodField()
    work_experiences = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    lesson_location = serializers.SerializerMethodField()
    lesson_location_text = serializers.SerializerMethodField()
    hours_taught = serializers.SerializerMethodField()
    other_subjects = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "gender",
            "video",
            "curriculum",
            "about",
            "educations",
            "work_experiences",
            "location",
            "lesson_location",
            "lesson_location_text",
            "other_subjects",
            "levels_taught",
            "image",
            "user_calendar",
            "curriculum_text",
            "hours_taught",
        )

    def get_gender(self, obj):
        return obj.profile.gender

    def get_other_subjects(self, obj):
        ss = [y.skill.name for y in obj.tutorskill_set.all() if y.status == 2]
        return ss

    def get_hours_taught(self, obj):
        s = obj.t_bookings.all()
        return sum(
            [
                s.no_of_hours
                for t in obj.t_bookings.all()
                for s in t.bookingsession_set.all()
                if s.status == 3
            ]
        )

    def get_lesson_location(self, obj):
        return obj.travel_policy

    def get_lesson_location_text(self, obj):
        s = self.get_loc(obj)
        text = "When you book lessons, {} will usually travel anywhere {} from {} to deliver lessons (e.g from {} to {})"
        state, vicinity = s.state, s.vicinity
        # home_address = self.home_address
        distance = obj.profile.get_tutoring_distance_display()
        try:
            td = obj.profile.tutoring_distance
            hd = s.distances
            destination = hd[td][0]["name"]
        except IndexError as e:
            destination = ""
        except KeyError as e:
            destination = ""
        if vicinity and destination:
            return text.format(
                obj.first_name, distance, vicinity, vicinity, destination
            )
        return "When you book lessons, {} will usually travel anywhere {} from {} to deliver lessons.".format(
            obj.first_name, distance, vicinity
        )

    def get_loc(self, obj):
        w = obj.location_set.all()
        if len(w) == 1:
            s = w[0]
        else:
            s = [v for v in w if v.addr_type == 2][0]
        return s

    def get_location(self, obj):
        s = self.get_loc(obj)
        return {
            "latitude": s.latitude,
            "longitude": s.longitude,
            "state": s.state,
            "vicinity": s.vicinity,
        }

    def get_educations(self, obj):
        return [
            "%s in %s, %s" % (x.degree, x.course, x.school)
            for x in obj.education_set.all()
        ]

    def get_work_experiences(self, obj):
        return [
            dict(display="%s, %s" % (x.role, x.name), currently_work=x.currently_work)
            for x in obj.workexperience_set.all()
        ]

    def get_about(self, obj):
        return obj.profile.description.rendered

    def get_image(self, obj):
        return obj.profile_pic.url

    def get_video(self, obj):
        return obj.profile.video

    def get_curriculum(self, obj):
        return obj.profile.curriculum_used

    def get_levels_taught(self, obj):
        return obj.profile.classes

    def get_curriculum_text(self, obj):
        return obj.profile.curriculum_explanation


class TutorSkillSearchSerializer(serializers.ModelSerializer):
    exhibitions = ReadOnlyField(source="exhibition_display")
    rating = serializers.DecimalField(max_digits=3, decimal_places=1)
    tutor = TutorSerializer()
    valid_reviews = ReviewSerializer(many=True)
    skill_name = serializers.SerializerMethodField()

    class Meta:
        model = models.TutorSkill
        fields = (
            "description",
            "heading",
            "id",
            "price",
            "exhibitions",
            "rating",
            "valid_reviews",
            "discount",
            "tutor",
            "skill_name",
        )

    def get_skill_name(self, obj):
        return obj.skill.name


class SubCategorySerializer(serializers.ModelSerializer):
    subjects = ReadOnlyField(source="skill_names")

    class Meta:
        model = models.SubCategory
        fields = ["name", "subjects", "questions"]


class CategorySerializer2(serializers.ModelSerializer):
    subjects = serializers.SerializerMethodField()

    class Meta:
        model = models.Category
        fields = ["name", "subjects"]

    def get_subjects(self, obj):
        return [x.name for x in obj.skill_set.all()]


class GraphTutorSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.ReadOnlyField(source="skill.name")

    class Meta:
        model = models.TutorSkill
        fields = ["get_absolute_url", "skill_name"]
