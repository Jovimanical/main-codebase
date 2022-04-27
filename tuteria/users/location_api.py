import logging
import time

# from itertools import ifilter
import pdb
from googleplaces import GooglePlaces, types, GooglePlacesError
from django.conf import settings
from django.utils.functional import cached_property
from geopy.distance import vincenty
from urllib.error import HTTPError

logger = logging.getLogger(__name__)
ifilter = filter
url = "MAPS_API_WEBSERVICE_URL"


class DistanceCalculator(object):
    ALLOWED_TYPES = ["neighborhood", "sublocality"]

    def __init__(self, location, key=None, distance=5000, lat_lng=None):
        if not key:
            key = settings.GOOGLE_API_KEY
        self.google_places = GooglePlaces(key)
        self.location = location
        self.distance = distance
        self.lat_lng = lat_lng
        attempts = 0
        success = False

        while success != True and attempts < 3:
            attempts += 1
            try:
                self.query_result = self.get_query_result()
                success = True
                if success:
                    break
            except GooglePlacesError as e:
                logger.error("Failed to get places")
                status = e.message.split()[-1]
                if status == "OVER_QUERY_LIMIT":
                    time.sleep(2)
                    continue
        if attempts == 3:
            # send an alert as this means that the daily limit has been reached
            logger.error("Google API Daily limit has been reached")

    def get_query_result(self):
        logger.info(self.lat_lng)
        query = self.google_places.nearby_search(
            location=self.location.address,
            lat_lng=self.lat_lng,
            radius=self.distance,
            types=[types.TYPE_POLICE],
        )
        response = []
        for place in query.places:
            try:
                place.get_details()
            except HTTPError as e:
                logger.error(e)
                raise
            for section in place.details["address_components"]:
                if True in (x in self.ALLOWED_TYPES for x in section["types"]):
                    response.append(
                        dict(
                            name=section["long_name"],
                            types=section["types"][0],
                            distance=self.calculate_distance(
                                (place.geo_location["lat"], place.geo_location["lng"])
                            ).meters,
                        )
                    )
        return response

    def get_filter_func(self):
        if self.distance <= 5000:
            return lambda x: x["distance"] < 5000
        if 9000 < self.distance <= 10000:
            return lambda x: 9000 < x["distance"] <= 10000
        if 10000 < self.distance <= 15000:
            return lambda x: 10000 < x["distance"] <= 15000
        if 15000 < self.distance <= 20000:
            return lambda x: 15000 < x["distance"] <= 20000
        if self.distance > 20000:
            return lambda x: x["distance"] > 20000

    def calculate_distance(self, address):
        return vincenty((self.location.latitude, self.location.longitude), address)

    def results(self):
        r = {v["name"]: v for v in self.query_result}.values()
        return list(ifilter(self.get_filter_func(), r))

    @staticmethod
    def distance_calculator(location, lat_lng=None):
        re5km = DistanceCalculator(location, lat_lng=lat_lng)
        logger.info("distances less than 5000 fetched")
        re10km = DistanceCalculator(location, distance=10000, lat_lng=lat_lng)
        logger.info("distances between 5000 and 10000 fetched")
        re15km = DistanceCalculator(location, distance=15000, lat_lng=lat_lng)
        logger.info("distances between 10000 and 15000 fetched")
        re20km = DistanceCalculator(location, distance=20000, lat_lng=lat_lng)
        logger.info("distances between 15000 and 20000 fetched")
        re25km = DistanceCalculator(location, distance=25000, lat_lng=lat_lng)
        logger.info("distances greater than 20000 fetched")
        result = {
            "near": re5km.results(),
            "not far": re10km.results(),
            "quite far": re15km.results(),
            "far": re20km.results(),
            "very far": re25km.results(),
        }
        return result
