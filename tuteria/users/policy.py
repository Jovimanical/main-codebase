from django.urls import reverse
import math


def generic_price(session, percent=0):
    if session.no_of_hours == 1:
        return session.price
    first_booking_price = session.price / session.no_of_hours
    remaining_amount = session.price - first_booking_price
    return first_booking_price + (percent * remaining_amount / 100)


class Policy(object):
    FLEXIBLE = "Flexible"
    MEDIUM = "Moderate"
    HARSH = "Strict"
    LONG_TERM = "Long Term"

    CONDITIONS = {FLEXIBLE: 6, MEDIUM: 12, HARSH: 24, LONG_TERM: 24}
    URLS = {FLEXIBLE: "", MEDIUM: "", HARSH: "", LONG_TERM: ""}

    PENALTY = {FLEXIBLE: 0, MEDIUM: 10, HARSH: 20, LONG_TERM: 30}

    BOOKING_PENALTY = {FLEXIBLE: 10, MEDIUM: 15, HARSH: 20, LONG_TERM: 30}

    def __init__(self, option, booking=None):
        """
        Keyword arguments:
        option -- the penalty option the tutor chose
        booking -- The booking instance (default 0.0)
        """
        self.option = option
        self.booking = booking

    @property
    def hours(self):
        return self.CONDITIONS[self.option]

    @property
    def penalty(self):
        return self.PENALTY[self.option]

    @property
    def booking_penalty(self):
        return self.BOOKING_PENALTY[self.option]

    def get_absolute_url(self):
        return reverse("cancellation") + self.URLS[self.option]

    @property
    def condition(self):
        if self.option != self.LONG_TERM:
            return "you cancel at least {} hours ahead".format(self.hours)
        return "you cancel well ahead"

    def can_activate_long_term_booking(self):
        """Checks if long term booking should be triggered"""
        return self.booking.total_hours >= 24

    def booking_cancelled(self):
        booking_count = self.booking.bookingsession_set.count()
        # return booking_count == self.booking.bookingsession_set.cancelled().count() and booking_count > 1
        return booking_count == self.booking.bookingsession_set.cancelled().count()

    def complied(self, bs):
        """Checks if session passes the condition to prevent penalty charge.
        Ensures this only applies to session of cancelled or rescheduled"""
        # pdb.set_trace()
        if bs.status == bs.CANCELLED:
            duration = bs.start - bs.modified
            return self.activate_compilation_status(duration)
        return True

    def activate_compilation_status(self, duration):
        hours = duration.total_seconds() / 3600.0
        return math.ceil(hours) > self.CONDITIONS[self.option]

    def booking_cancellation_complied(self):
        last_session = self.booking.bookingsession_set.order_by("modified").last()
        duration = last_session.start - last_session.modified
        return self.activate_compilation_status(duration)

    def new_amount_with_penalty_deducted(self):
        """Amount to be paid to tutor after all deductions have been made."""
        total = 0
        tuteria_penalty = 0
        if not self.can_activate_long_term_booking():
            # if booking is cancelled and sessions are greater than one

            if self.booking_cancelled():
                total += (
                    self.booking.total_price * self.BOOKING_PENALTY[self.option] / 100
                )
            else:
                all_sessions = self.booking.bookingsession_set.valid_for_payment()
                for session in all_sessions:
                    if self.complied(session):
                        # also considers the case when booking is missed, tutor doesn't gt paid
                        if session.status == session.CANCELLED:
                            total += 0
                        else:
                            total += session.price
                    else:
                        total += generic_price(
                            session, percent=self.PENALTY[self.option]
                        )
        else:
            total = self.long_term_cancellation_of_all_sessions()
        return total

    def long_term_cancellation_of_all_sessions(self):
        """Amount to be paid to a tutor in the case of cancellation of a booking greater than 24 hours
        Rescheduling fee is free in this case
        70% is deducted for the case where all booking sessions where cancelled.
        50% is deducted for the individual sessions in a long term booking
        """
        if (
            self.booking.bookingsession_set.cancelled().count()
            == self.booking.bookingsession_set.count()
        ):
            return self.booking.total_price * self.BOOKING_PENALTY[self.LONG_TERM] / 100
        total = 0
        for session in self.booking.bookingsession_set.valid_for_payment():
            if session.status == session.CANCELLED:
                total += session.price * self.PENALTY[self.LONG_TERM] / 100
            else:
                total += session.price
        return total
