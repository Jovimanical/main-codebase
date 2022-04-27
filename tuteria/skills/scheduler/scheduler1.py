import datetime
from dateutil.relativedelta import relativedelta
from django.conf import settings
import pytz


class AvailableDay(object):
    server_timezone = pytz.timezone(settings.TIME_ZONE)

    def __init__(self, date_tuple, hours=None, booking=None):
        self.dates = date_tuple
        self.hour_range = hours
        if booking is None:
            self.booking = []
        else:
            self.booking = booking

    def get_range(self):
        start = self.dates.start.astimezone(self.server_timezone)
        end = self.dates.end.astimezone(self.server_timezone)
        return range(start.hour, end.hour + 1)

    def get_list_of_times(self, day):
        return range(day.start.hour, day.end.hour + 1)

    def get_range_for_booking(self):
        vv = self.dates.start.date()

        def filter_date(dd):
            if dd.start.date() == vv:
                return True
            return False

        new_bookings = filter(filter_date, self.booking)
        temp = [
            range(
                x.start.astimezone(self.server_timezone).hour,
                x.end.astimezone(self.server_timezone).hour + 1,
            )
            for x in new_bookings
        ]
        result = [item for sublist in temp for item in sublist]
        return result

    # def get_new_range(self):
    # result = self.get_range()
    # booking = self.get_range_for_booking()
    # hours = [x.hour for x in booking]
    #
    #     def rr(x):
    #         if x.hour not in hours:
    #             return True
    #
    #     return ifilter(rr, result)

    # def get_day_and_time_slots(self, interval=30):
    #     """
    #     Returns the available timeslots for the specific day
    #     e.g {'day':datetime.date(2015,1,30),
    #     'times':[{'start_time':'8:00AM','end_time':'10:00AM'}]}
    #     """
    #     result = list(self.get_new_range())
    #
    #     def increment(value):
    #         index = result.index(value)
    #         n = 1 + index
    #         if index + 1 < len(result):
    #             if index == 0:
    #                 return value, result[index + 1]
    #             else:
    #                 new_start_time = value + relativedelta(minutes=(interval * n))
    #                 new_end_time = result[index + 1] + relativedelta(minutes=(interval * n))
    #                 return new_start_time, new_end_time
    #
    #     new_result = [x for x in map(increment, result) if x is not None]
    #     if len(new_result) > 0:
    #         if new_result[-1][1] > result[-1]:
    #             del new_result[-1]
    #     return new_result

    def display_result(self, interval=30):
        weekdays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        month_format = "%B"
        day_format = "%d-%m-%Y"  # day-month-year
        time_format = "%I:%M %p"  # time format
        times = self.get_hourly_times()
        weekday = weekdays[self.dates.start.weekday()]
        result = dict(
            date=self.dates.start.strftime(day_format),
            month=self.dates.start.strftime(month_format),
            times=times,
            weekday=weekday,
            cancelled=self.dates.cancelled,
        )
        return result

    def tutor_display(self):
        day_format = "%d-%m-%Y"  # day-month-year
        time_format = "%I:%M %p"  # time format
        return dict(
            event_id=self.dates.event_id,
            date=self.dates.start.strftime(day_format),
            start=self.dates.start.astimezone(self.server_timezone).strftime(
                time_format
            ),
            end=self.dates.end.astimezone(self.server_timezone).strftime(time_format),
            cancelled=self.dates.cancelled,
        )

    def get_hourly_times(self, interval=1):
        hours = self.hour_range or interval
        times = self.get_range()
        booked_hours = self.get_range_for_booking()
        return get_hourly_times(times, booked_hours, hours)


def get_hourly_times(times, booked_hours, interval=1):
    collected_times = sorted(list(set(times).difference(set(booked_hours))))

    def get_tuple_with_difference_of_one(x):
        index = collected_times.index(x)
        result = []
        for i, j in zip(collected_times[index:-1], collected_times[index + 1 :]):
            if j - i == 1:
                result.append([i, j])
            else:
                break
        return result

    arrays_of_array = [
        sorted(list(set(s for st in x for s in st)))
        for x in map(get_tuple_with_difference_of_one, collected_times)
        if len(x) > 0
    ]

    def merge_list(x):
        temp = [True for v in arrays_of_array if set(x).issubset(v)]
        if len(temp) > 1:
            return False
        return True

    result = [
        dict(start_time=min(x), end_time=max(x))
        for x in filter(merge_list, arrays_of_array)
        if max(x) - min(x) >= interval
    ]

    return result
