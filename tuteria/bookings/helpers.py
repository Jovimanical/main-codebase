import operator
from collections import defaultdict
import datetime


def get_weekdays_object(arr, no_of_weeks=12, starts=0):
    d = defaultdict(list)
    for v in arr:
        # pdb.set_trace()
        key = v.get("weekday")
        d[key].append(v)
    weekdays = [Weekday(key, value, no_of_weeks, starts) for key, value in d.items()]
    return weekdays


def get_weekday(arr, no_of_weeks=12):
    return [x.name for x in get_weekdays_object(arr, no_of_weeks)]


def group_by_weekdays(arr, wk, no_of_weeks=4, starts=0):
    weekdays = get_weekdays_object(arr, no_of_weeks, starts)
    result = [v for v in weekdays if v.name == wk]
    return result[0]


def get_weekday_instance(arr, wk, no_of_weeks=4, starts=0):
    return group_by_weekdays(arr, wk, no_of_weeks, starts)


def get_time_range(list_):
    result = []
    for i in list_:
        result.extend(range(i["start_time"], i["end_time"]))
    return sorted(result)


class Weekday(object):

    def __init__(self, name, list_, no_of_weeks=4, starts=0):
        self.name = name
        self.list_ = list_[starts : no_of_weeks + starts]

    def get_durations(self):
        times = (
            set(get_time_range(v))
            for v in map(operator.itemgetter("times"), self.list_)
        )
        return list(set.intersection(*times))

    def get_start_times(self):
        return [
            (x, datetime.datetime.strptime(str(x), "%H").strftime("%I %p").lower())
            for x in self.get_durations()
        ]

    def __repr__(self):
        return "<Weekday: %s>" % self.name


def generate_response(arr, response):
    weekdays = [
        get_weekday_instance(arr, v, response["no_of_weeks"], response["starts"])
        for v in response["weekdays"]
    ]
    days = [
        dict(date=x["date"], start=response["start_times"][i])
        for i, v in enumerate(weekdays)
        for x in v.list_
    ]
    discount = response.get("discount") or 0
    result = dict()
    for index, v in enumerate(days):
        u = datetime.datetime.strptime(v["date"], "%d-%m-%Y").strftime("%Y-%m-%d")
        # u = v['date']
        result["session-%s-start" % index] = "%s %s:00" % (u, v["start"])
        result["session-%s-no_of_hours" % index] = response["no_of_hours"]
        result["session-%s-student_no" % index] = response["student_no"]
        dis_cal = 100 * int(response["student_no"])
        dis_per_student = discount * int(response["student_no"])
        result["session-%s-price" % index] = (
            float(response["price"])
            * int(response["no_of_hours"])
            * (dis_cal - dis_per_student + discount)
            / 100
        )

    result["session-TOTAL_FORMS"] = len(days)
    result["session-INITIAL_FORMS"] = 0
    result["session-MIN_NUM_FORMS"] = ""
    result["session-MAX_NUM_FORMS"] = ""
    return result
