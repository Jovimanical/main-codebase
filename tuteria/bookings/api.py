from rest_framework import serializers
from rest_framework.fields import Field
from bookings.models import BookingSession


class BookingSessionSerializer(serializers.ModelSerializer):
    # end = Field(source='end')

    class Meta:
        model = BookingSession
        fields = ("start", "end", "price", "no_of_hours", "id")
