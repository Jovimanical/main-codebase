from django import template
from django.urls import reverse

register = template.Library()


@register.filter(name="month_price")
def month_price(field):
    result = 0
    for x in field:
        result += x.price
    return result


@register.filter(name="week_price")
def week_price(field):
    result = 0
    for x in field:
        result += x.price
    return result


@register.filter(name="week_start_time")
def week_start_time(field):
    return field[0].start


@register.filter(name="week_duration")
def week_duration(field):
    return field[0].duration
