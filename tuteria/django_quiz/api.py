from rest_framework import serializers
from .multichoice.models import Answer, MCQuestion
from .quiz.models import Quiz, Question


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ("correct", "content")


class QuestionSerializer(serializers.ModelSerializer):
    answer_set = AnswerSerializer(many=True)

    class Meta:
        model = MCQuestion
        fields = (
            "id",
            "content",
            "answer_set",
            "comprehension",
            "image",
            "options_layout",
            "is_latex",
        )


class TutorQuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = (
            "title",
            "description",
            "answers_at_end",
            "pass_mark",
            "success_text",
            "fail_text",
        )
