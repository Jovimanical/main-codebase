# -*- encoding: utf-8 -*-
from __future__ import unicode_literals

import re
from datetime import date, datetime
from decimal import Decimal

from django import template
from django.conf import settings
from django.template import defaultfilters
from django.utils.encoding import force_text
from django.utils.formats import number_format
from django.utils.safestring import mark_safe
from django.utils.timezone import is_aware, utc
from django.utils.translation import pgettext, ugettext as _, ungettext
from django.urls import reverse

register = template.Library()


@register.filter(name="distance_estimate")
def distance_estimate(model, coordinate):
    return model.get_distance(coordinate)


@register.filter(name="call_method")
def callMethod(obj, methodName):
    method = getattr(obj, methodName)

    if obj.__dict__.has_key("__callArg"):
        ret = method(*obj.__callArg)
        del obj.__callArg
        return ret
    return method()


@register.filter(name="method_args")
def args(obj, arg):
    if not obj.__dict__.has_key("__callArg"):
        obj.__callArg = []

    obj.__callArg += [arg]
    return obj


# A tuple of standard large number to their converters
intword_converters = (
    (
        3,
        lambda number: (
            ungettext("%(value).1f k", "%(value).1f k", number),
            ungettext("%(value)s k", "%(value)s k", number),
        ),
    ),
    (
        6,
        lambda number: (
            ungettext("%(value).1f m", "%(value).1f m", number),
            ungettext("%(value)s m", "%(value)s m", number),
        ),
    ),
)


@register.filter(is_safe=False)
def tintword(value):
    """
    Converts a large integer to a friendly text representation. Works best
    for numbers over 1 million. For example, 1000000 becomes '1.0 million',
    1200000 becomes '1.2 million' and '1200000000' becomes '1.2 b'.
    """
    try:
        value = int(value)
    except (TypeError, ValueError):
        return value

    if value < 1000:
        return value

    if 1000 <= value < 1000000:
        val = value / float(1000)
        return "{}k".format(round(val, 2))
    else:
        return "{}m".format(round(value / float(1000000), 2))

    # def _check_for_i18n(value, float_formatted, string_formatted):
    #     """
    #     Use the i18n enabled defaultfilters.floatformat if possible
    #     """
    #     if settings.USE_L10N:
    #         value = defaultfilters.floatformat(value, 1)
    #         template = string_formatted
    #     else:
    #         template = float_formatted
    #     return template % {'value': value}

    # for exponent, converters in intword_converters:
    #     large_number = 10 ** exponent
    #     if value < large_number * 1:
    #         new_value = value / float(large_number)
    #         return _check_for_i18n(new_value, *converters(new_value))
    # return value


@register.filter(name="get_img")
def get_img(field):
    if field["image"]:
        return field["image"].replace("image/upload/", "")
    return field["user_image"].replace("image/upload/", "")
