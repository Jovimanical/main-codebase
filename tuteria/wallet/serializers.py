from rest_framework import serializers
from .models import WalletTransaction


class WalletTransactionSerializer(serializers.ModelSerializer):
    total = serializers.SerializerMethodField()
    last_session = serializers.SerializerMethodField()
    first_session = serializers.SerializerMethodField()

    class Meta:
        model = WalletTransaction
        fields = [
            "created",
            "modified",
            "amount_paid",
            "last_session",
            "total",
            "first_session",
        ]

    def get_total(self, obj):
        return obj["amount"] + obj["credit"]

    def get_last_session(self, obj):
        return obj["booking__last_session"]

    def get_first_session(self, obj):
        return obj["booking__first_session"]
