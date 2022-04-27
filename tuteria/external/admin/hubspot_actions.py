from django.db import transaction
from django.shortcuts import reverse
from django.utils.functional import cached_property

from external.models import Agent, BaseRequestTutor
from hubspot import HubspotAPI
from hubspot.models import HubspotContact


class HubspotSpecificActions(object):
    h_actions = [
        "add_to_hubspot",
        "update_ids_from_hubspot",
        "create_deals",
        "update_hubspot_contact",
        "update_hubspot_deal",
        "save_hubspot_contacts",
    ]

    @cached_property
    def h_instance(self):
        return HubspotAPI(reverse("hubspot:hubspot_code"))

    def add_to_hubspot(self, request, queryset):

        def callback_func(xx):
            with transaction.atomic():
                for o in xx:
                    BaseRequestTutor.objects.filter(email=o["email"]).update(
                        hubspot_contact_id=o["vid"]
                    )

        self.h_instance.create_bulk_contacts(
            queryset.all(), bulk_callback=callback_func
        )

    def update_ids_from_hubspot(self, request, queryset):
        emails = queryset.values_list("email", flat=True)
        results = self.h_instance.get_bulk_contact_ids(list(emails))
        with transaction.atomic():
            for o in results:
                BaseRequestTutor.objects.filter(email__iexact=o["email"]).update(
                    hubspot_contact_id=o["vid"]
                )

    def update_hubspot_deal(self, request, queryset):
        queryset.async_action(
            lambda x: self.h_instance.update_deal(x, field="hubspot_deal_id"),
            thread_count=4,
        )

    def update_hubspot_contact(self, request, queryset):
        queryset.async_action(
            lambda x: self.h_instance.update_contact(x, field="hubspot_contact_id"),
            thread_count=4,
        )

    def create_deals(self, request, queryset):

        def callback(x):
            x.agent = x.get_agent
            result = self.h_instance.create_deal(x, "hubspot_contact_id")
            if result:
                x.hubspot_deal_id = result
                x.save()

        queryset.async_action(callback, thread_count=4)

    def save_hubspot_contacts(self, request, queryset):
        HubspotContact.bulk_update_record(queryset, field="hubspot_contact_id")
        self.message_user(request, "Contacts successfully added")
