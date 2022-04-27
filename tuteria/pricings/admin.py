from django.contrib import admin
from .models import Region, Pricing
from django.contrib.admin.helpers import ActionForm
from django import forms

# Register your models here.


class FForm2(ActionForm):
    state = forms.ChoiceField(choices=Region.NIGERIAN_STATES, required=False)
    for_parent = forms.BooleanField(required=False)
    price = forms.IntegerField(required=False)


class CategoryFilter(admin.SimpleListFilter):
    title = "Category"
    parameter_name = "category"

    def lookups(self, request, model_admin):
        xx = set(list(Region.objects.values_list("category", flat=True)))
        return [[x, x] for x in xx]
        # return (('last_month', _('Last Month')), ('two_month', _('2 Months')),
        #         ('three_month', _('3 Months')), ('four_month',
        #                                          _('4 months')), )

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(category=self.value())
        return queryset


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_filter = [CategoryFilter, "for_parent", "state"]
    search_fields = ("name", "state", "category")
    action_form = FForm2
    list_display = ("name", "state", "category", "for_parent", "low", "medium", "high")
    actions = ["update_base_rates", "update_state", "update_is_parent_pricing"]
    fieldsets = [
        (None, {"fields": ["state", "name", "areas", "base_price", "region_factor"]})
    ]
    # # excludes = ('prices',)
    # # inlines = [PricingInline]
    # filter_horizontal = ['prices']

    def low(self, obj):
        return obj.rates["Plan 1"]

    def medium(self, obj):
        return obj.rates["Plan 2"]

    def high(self, obj):
        return obj.rates["Plan 3"]

    def update_state(self, request, queryset):
        state = request.POST.get("state")
        if state:
            queryset.update(state=state)

    def update_is_parent_pricing(self, request, queryset):
        for_parent = request.POST.get("for_parent")
        if for_parent:
            queryset.update(for_parent=True)

    def update_base_rates(self, request, queryset):
        price = request.POST.get("price")
        if price:
            queryset.update(base_price=int(price))
            self.message_user(request, "Base rate successfully updated")
