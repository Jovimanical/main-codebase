from config.utils import get_static_data
from django.conf import settings
from requests.api import request


def get_bank_list(target_country="Nigeria"):
    response = get_static_data()
    banks = [("", "Select Bank")]
    if response:
        supported_countries = response["supportedCountries"][0]["banks"]
        banks = banks + [(x["name"], x["name"]) for x in supported_countries]

    return banks
