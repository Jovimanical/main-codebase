# -*- coding: utf-8 -*-

from __future__ import division
from collections import Counter
import pdb
from decimal import Decimal


def mean(x):
    return sum(x) / len(x)


def median(v):
    """finds the 'middle-most' value of v"""
    n = len(v)
    sorted_v = sorted(v)
    midpoint = n // 2
    if n % 2 == 1:
        # if odd, return the middle value
        return sorted_v[midpoint]
    else:
        # if even, return the average of the middle values
        lo = midpoint - 1
        hi = midpoint
        return (sorted_v[lo] + sorted_v[hi]) / 2


def quantile(x, p):
    """returns the pth-percentile value in x"""
    p_index = int(p * len(x))
    return sorted(x)[p_index]


def mode(x):
    """returns a list, might be more than one mode"""
    counts = Counter(x)
    max_count = max(counts.values())
    return [x_i for x_i, count in counts.iteritems() if count == max_count]
    mode(num_friends)


def de_mean(x):
    """translate x by subtracting its mean (so the result has mean 0)"""
    x_bar = mean(x)
    return [x_i - x_bar for x_i in x]


def variance(x):
    """assumes x has at least two elements"""
    n = len(x)
    deviations = de_mean(x)
    return sum_of_squares(deviations) / (n - 1)


def interquartile_range(x):
    return quantile(x, 0.75) - quantile(x, 0.25)


class PriceStat:

    def __init__(
        self, list_, hrs_per_day=1, no_of_weeks=1, days_per_week=1, no_of_subject=1
    ):
        self.list_ = sorted(list_)
        self.length = len(list_)
        self.hrs_per_day = hrs_per_day
        self.no_of_weeks = no_of_weeks
        self.days_per_week = days_per_week
        self.no_of_subject = no_of_subject

    def mean(self):
        return sum(self.list_) / self.length

    def mode(self):
        """returns a list, might be more than one mode"""
        counts = Counter(self.list_)
        max_count = max(counts.values())
        return [x_i for x_i, count in counts.iteritems() if count == max_count]

    def median(self):
        midpoint = self.length // 2
        if self.length % 2 == 1:
            # if odd, return the middle value
            return self.list_[midpoint]
        else:
            # if even, return the average of the middle values
            lo = midpoint - 1
            hi = midpoint
            return (self.list_[lo] + self.list_[hi]) / 2

    def previous_min(self):
        return (self.mean() + min(self.list_)) / 2

    def previous_max(self):
        return (self.mean() + max(self.list_)) / 2

    def percentile(self, ratio=0.75):
        return quantile(self.list_, ratio)

    def original_max(self):
        return max(self.list_)

    @property
    def get_prices(self):
        value = []
        if self.length == 0:
            value.extend([Decimal(800), Decimal(1000), Decimal(1500), Decimal(2000)])
        else:
            minimum = min(self.list_)
            maximum = max(self.list_)
            value.extend(self.mode())
            value.extend([self.median(), self.mean()])
            if maximum < Decimal(2000):
                value.extend(maximum)
            else:
                value.extend([self.previous_max()])
        return sorted(value)

    def response(self):
        multiplier = self.days_per_week * self.hrs_per_day * self.no_of_subject
        if self.no_of_weeks > 3:
            result = map(lambda x: x * 4 * multiplier, self.get_prices)
        else:
            result = map(lambda x: x * multiplier * self.no_of_weeks, self.get_prices)
        return [(x, "₦%s" % int(x)) for x in result]


def prices_for_states(state, lga):
    lagos = {
        "Eti-Osa": 2500,
        "Ibeju/Lekki": 2500,
        "Surulere": 2000,
        "Mainland": 2000,
        "Ikeja": 2000,
        "Shomolu": 2000,
        "Apapa": 2000,
        "AbujaMun": 2500,
        "Gwagwala": 1500,
    }
