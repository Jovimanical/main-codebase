from django import template
from django.contrib.admin.views.main import SEARCH_VAR
from django.contrib.sites.models import Site

from users.models import UserProfile

register = template.Library()


@register.filter(name="add_attributes")
def add_attr(field, css):
    attrs = {}
    definition = css.split(",")

    for d in definition:
        if ":" not in d:
            attrs["class"] = d
        else:
            t, v = d.split(":")
            attrs[t] = v

    if field:
        return field.as_widget(attrs=attrs)
    return ""


@register.filter(name="percentof")
def percentof(field, total):
    return field * 100 / total


@register.filter(name="requested_before")
def requested_before(field, ts):
    if field.request_meetings.has_hired_tutor_before(ts.tutor):
        return True
    if not field.request_meetings.permitted_to_request_tutor_skill(ts):
        return True
    return False


# @register.filter(name="evaluate_method")
# def evaluate_method(field,)


@register.filter(name="gender_display")
def gender_display(field):
    if field == UserProfile.MALE:
        return "He"
    return "She"


@register.filter
# capitalise the first letter of each sentence in a string
def capsentence(value):
    value = value.lower()
    return ". ".join([sentence.capitalize() for sentence in value.split(". ")])


@register.filter
def get_full_url(value):
    return "https://{}{}".format(Site.objects.get_current(), value.get_absolute_url())


@register.inclusion_tag("admin/search_form.html", takes_context=True)
def advanced_search_form(context, cl):
    """
    Displays a search form for searching the list.
    """
    return {
        "asf": context.get("asf"),
        "cl": cl,
        "show_result_count": cl.result_count != cl.full_result_count,
        "search_var": SEARCH_VAR,
    }


@register.filter(name="user_in_group")
def in_group(field, value):
    groups = field.groups.values_list("name", flat=True)
    return value in groups
