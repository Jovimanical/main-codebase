import datetime
from dateutil.relativedelta import relativedelta
from django.contrib.sessions.backends.db import SessionStore as DbSessionStore
from django.contrib.sessions.models import Session
import logging
from bookings.models import Booking

logger = logging.getLogger(__name__)


class SessionStore(DbSessionStore):

    def cycle_key(self):
        old_session_key = self.session_key
        old_session = Session.objects.get(session_key=old_session_key)
        try:
            cart = Booking.objects.get(session=old_session)
            super(SessionStore, self).cycle_key()
            new_session_key = self.session_key
            new_session = Session.objects.get(session_key=new_session_key)
            cart.session = new_session
            cart.save()
            logger.debug(
                "Migrated booking from session %s to %s"
                % (old_session_key, new_session_key)
            )
        except Booking.DoesNotExist:
            logger.debug(
                "Session %s does not have a cart to migrate" % (old_session_key)
            )
