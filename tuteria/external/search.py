# a simple interface that gets the search params and spits out the result set.
# an internal method that converts the query
import logging
from django.core.paginator import PageNotAnInteger, EmptyPage, Paginator
from users.models import Location, states, states_long_lat
from skills.models import TutorSkill
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
from _ssl import SSLError

logger = logging.getLogger(__name__)


class Search(object):

    def __init__(self, get_request):
        self.process_request_params(get_request)
        pass

    def get_queryset(self):
        try:
            query = TutorSkill.objects.from_search(
                self.query, region=self.region, **params
            )
        except (GeocoderTimedOut, GeocoderUnavailable, SSLError) as e:
            logger.warn(e)
            query = self.model.objects.from_search(
                self.skill, **self.query_param_location()
            )
            self.location_query = False
            self.region = self.query_param_location().get("region")

    def process_request_params(self, request):
        """Fetches all possible query parameters"""
        if "q" in request:
            self.query = request["q"]
        else:
            self.query = request.get("query", "")
        self.location = SearchLocation(**request)


class SearchLocation(object):

    def __init__(self, **kwargs):
        """A default search radius of 3km"""
        self.location_string = kwargs.get("location", "")
        self.latitude = kwargs.get("latitude", "")
        self.longitude = kwargs.get("longitude", "")
        self.search_radius = kwargs.get("search_radius", 3)
        self.region = kwargs.get("region", "")

    def get_location_for_tutors(self, tutor_ids, coordinate=None):
        coord = self.get_state_coordinate() if self.region else coordinate
        locations = Location.objects.ordered_tutor_locations(
            tutor_ids, coordinate=coord
        )

    def get_state_coordinate(self):
        reg = self.region or "Lagos"
        value = filter(lambda x: x.lower() == reg.lower(), states)
        if len(value) > 0:
            st = value[0]
            index = states.index(st)
            return dict(
                latitude=states_long_lat[index][0], longitude=states_long_lat[index][1]
            )
        return dict(latitude=6.4531, longitude=3.3958)  # Lagos
