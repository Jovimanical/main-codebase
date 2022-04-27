from django.core.management.base import BaseCommand, CommandError
from bookings.models import Booking

class Command(BaseCommand):
    def handle(self, **options):
        Booking.reminder_to_contact_clients()
