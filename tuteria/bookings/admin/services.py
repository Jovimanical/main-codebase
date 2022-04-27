from logging import error
from users.models.models1 import User
from bookings.models import Booking


class Result:
    def __init__(self, msg="", errors=None, data=None, status_code=200):
        self.errors = errors
        self.data = data
        self.msg = msg
        self.status_code = status_code


class BookingAdminService:
    @classmethod
    def get_group_lesson_tutor(cls, email):
        user: User = User.objects.filter(email__iexact=email).first()
        if not user:
            return Result(errors={"msg": "No tutor found"}, status_code=400)
        last_booking = (
            Booking.objects.filter(order__icontains="ielts").order_by("created").last()
        )
        order = None
        if last_booking:
            order = last_booking.order
        return Result(
            data={
                "email": user.email,
                "first_name": user.first_name,
                "order": order,
            }
        )
