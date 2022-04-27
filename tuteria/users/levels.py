from decimal import Decimal
class TuteriaLevel(object):
    ROOKIE = 0
    AMATEUR = 1
    SEMI_PRO = 2
    VETERAN = 3
    MASTER = 4

    ADMIN_CUT = {
        10: 90,
        15: 85,
        20: 80,
        25: 75,
        30: 70,
        35: 65,
        40: 60,
        45: 55,
        50: 50,
        55: 45,
        60: 40,
        70: 30,
        75: 25,
        80: 20,
        85: 15,
        ROOKIE: 35,
        AMATEUR: 30,
        SEMI_PRO: 25,
        VETERAN: 20,
        MASTER: 15,
    }

    def __init__(self, option, booking=None):
        """
        Class Responsible for determining amount to be paid to tutor based on his level
        Keyword arguments:
        option -- the penalty option the tutor chose
        booking -- The booking instance (default None)
        """
        self.option = option
        self.booking = booking

    def admin_cut(self, custom_amount=0):
        """Determines amount to be deducted from amount to be paid to tutor"""
        if custom_amount > 0:
            return custom_amount * self.admin_percent() / 100
        if self.booking:
            return (
                self.booking.amount_to_be_paid_with_penalty()
                * self.admin_percent()
                / 100
            )

    def admin_actual_cut(self):
        """Determines amount to be deducted from amount to be paid to tutor"""
        try:
            admin_cut = self.ADMIN_CUT[self.option]
        except KeyError:
            admin_cut = 100 - Decimal(self.option)
        return self.booking.total_price * admin_cut / 100

    def admin_cut_raw(self):
        try:
            admin_cut = self.ADMIN_CUT[self.option]
        except KeyError:
            admin_cut = 100 - Decimal(self.option)
        return self.amount_earned_without_penalty() * admin_cut / 100

    def amount_earned(self):
        return self.booking.amount_to_be_paid_with_penalty() - self.admin_cut()

    def tutor_earning(self):
        return self.booking.total_price - self.admin_actual_cut()

    def admin_percent(self):
        try:
            admin_cut = self.ADMIN_CUT[self.option]
        except KeyError:
            admin_cut = 100 - Decimal(self.option)
        return admin_cut

    def amount_earned_without_penalty(self):
        return self.booking.total_price - self.booking.cancelled_class_cost()

    def amount_earned2(self):
        return self.amount_earned_without_penalty() - self.admin_cut_raw()

    def cancelled_cost(self):
        v = 100 - self.admin_percent()
        return v * self.booking.cancelled_class_cost() / 100

    @classmethod
    def get_percent(cls, level):
        return 100 - cls.admin_cut[level]


def level_one_requirements(user):
    """
    Complete at least 20 hours of tutoring
    Receive at least 1 repeat booking
    Maintain a 4 star rating or above
    Have a low cancellation rate
    """
    valid1 = user.t_bookings.get_no_of_hours_taught() >= 20
    valid2 = user.t_bookings.repeat_booking_count() >= 1
    # valid3 = user.ratings >= 4.0
    return all([valid1, valid2])


def level_two_requirements(user):
    """
    Complete at least 100 hours of tutoring
    Receive at least 5 repeat bookings
    Upload a personal video to your profile
    Maintain a 4.2 star rating or above
    Have a low cancellation rate
    """

    valid1 = user.t_bookings.get_no_of_hours_taught() >= 100
    valid2 = user.t_bookings.repeat_booking_count() >= 5
    # valid3 = user.ratings >= 4.0
    valid4 = True if user.profile.video else False
    return all([valid1, valid2, valid4])


def level_three_requirements(user):
    """
    Complete at least 250 hours of tutoring
    Receive at least 15 repeat bookings
    Teach at least 10 different clients
    Pass the Tuteria Tutor Certification
    Maintain a 4.5 star rating or above
    Have a low cancellation rate
    """
    valid1 = user.t_bookings.get_no_of_hours_taught() >= 250
    valid2 = user.t_bookings.repeat_booking_count() >= 15
    # valid3 = user.ratings >= 4.0
    valid4 = user.t_bookings.different_client_count() >= 10
    return all([valid1, valid2, valid4])


def level_four_requirements(user):
    """
    Complete at least 500 hours of tutoring
    Receive at least 40 repeat bookings
    Teach at least 25 different clients
    Maintain 4.7 star rating or above
    Have a low cancellation rate
    """
    valid1 = user.t_bookings.get_no_of_hours_taught() >= 500
    valid2 = user.t_bookings.repeat_booking_count() >= 40
    # valid3 = user.ratings >= 4.0
    valid4 = user.t_bookings.different_client_count() >= 25
    return all([valid1, valid2])
