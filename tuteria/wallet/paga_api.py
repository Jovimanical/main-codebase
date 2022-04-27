import hashlib


def hash_string(val):
    return hash_times(val, 1000)


def get_hashed(has_val, val):
    new_hashed = hash_times(val, 1000)
    return has_val == new_hashed


def hash_times(string, iteration):
    has_val = hashlib.sha512(string.encode()).hexdigest()
    for x in range(iteration - 1):
        has_val = hashlib.sha512(has_val).hexdigest()
    return has_val


BASE_URL = "https://mypaga.com/paga-webservices/business-rest/secured"
