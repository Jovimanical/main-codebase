import json

from django.http.response import JsonResponse
from bookings.admin.services import BookingAdminService, Result
from django.core.handlers.wsgi import WSGIRequest
from django.shortcuts import render, get_object_or_404
from bookings.models import Booking
from config import admin_utils


def refund_booking_view(request, pk):
    bk = get_object_or_404(Booking, pk=pk)
    payout = bk.user.userpayout_set.first()

    def callback(ff):
        ff.user = bk.user
        ff.save()
        bk.refund_client_and_tutor(ff)

    return admin_utils.process_payout_form(request, payout, callback)


def find_group_lesson_tutor(request: WSGIRequest):
    if request.method == "POST":
        body = json.loads(request.body)
        email = body.get("email")
        if email:
            result: Result = BookingAdminService.get_group_lesson_tutor(email)
            if result.errors:
                return JsonResponse(
                    {"status": False, "errors": result.errors}, status=400
                )
            return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)


def create_group_booking_instance(request: WSGIRequest):
    pass


def process_withdrawal_for_booking(request: WSGIRequest, slug: str):
    pass
