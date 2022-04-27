import csv
import logging
import os
import random
from decimal import Decimal
from queue import Queue
import re
from threading import Thread
from urllib import parse as urllib
from datetime import datetime
import mailchimp
import pygeoip
import requests
from django import forms
from django.conf import settings
from django.contrib import admin
from django.contrib.postgres.forms import SimpleArrayField
from django.core.cache import cache
from django.core.cache.utils import make_template_fragment_key
from django.core.mail import EmailMessage, EmailMultiAlternatives, send_mail
from django.http import StreamingHttpResponse
from django.template.loader import render_to_string
from django.utils import timezone
from phonenumber_field.formfields import PhoneNumberField
from requests import HTTPError
from paystack.utils import PaystackAPI

from .infobib import INFOLIBAPI
from .mail_servers import mandrill_backend

logger = logging.getLogger(__name__)

MAX_SLOT_NUMBER = 5


class CustomThread(Thread):
    def __init__(self, queue, func):
        Thread.__init__(self)
        self.queue = queue
        self.func = func
        self.exception = None

    def run(self):
        while True:
            try:
                args = self.queue.get()
                self.func(*args)
            except Exception as e:
                self.exception = e
            finally:
                self.queue.task_done()

    def get_exception(self):
        return self.exception


class Postpone(object):
    # def __init__(self, queue):
    def __init__(self, func, queryset, thread_count=7):
        # pass
        self.queue = Queue()
        self.threads = []
        for o in range(thread_count):
            t = CustomThread(self.queue, func)
            t.daemon = True
            self.threads.append(t)
            t.start()
        self.queryset = queryset

        # self.queue = queue

    def __call__(self, *args, **kwargs):
        # def func(*args, **kwargs):
        # import pdb; pdb.set_trace()
        for booking in self.queryset:
            self.queue.put((booking,))
        # return func
        self.queue.join()
        self.raise_thread_exceptions()

    def raise_thread_exceptions(self):
        for t in self.threads:
            e = t.get_exception()
            if e:
                logger.exception(e)
                raise e


def invalidate_template_fragment(fragment_name, *variables):
    cache_key = make_template_fragment_key(fragment_name, vary_on=variables)
    cache.delete(cache_key)


def get_mailchimp_api():
    return mailchimp.Mailchimp(settings.MAILCHIMP_API_KEY)  # your api key here


def isInt(num):
    try:
        int(num)
        return True
    except ValueError:
        return False


def get_ip(ip_address):
    from . import BASE_DIR

    gi = pygeoip.GeoIP(os.path.join(BASE_DIR, "config", "geo2.dat"))
    # gi = open_database(os.path.join(BASE_DIR, 'config', 'geolitecity.mmdb'))
    # return gi
    return gi.record_by_addr(ip_address)


def generate_code(referral_class, key="order"):
    def _generate_code():
        t = "ABCDEFGHIJKLOMNOPQRSTUVWXYZ1234567890"
        return "".join([random.choice(t) for i in range(12)])

    code = _generate_code()
    if key == "slug":
        kwargs = {"slug": code}
    else:
        kwargs = {"order": code}
    while referral_class.objects.filter(**kwargs).exists():
        code = _generate_code()
    return code


class BookingDetailMixin(object):
    @property
    def gateway_price(self):
        return Decimal(self.total_price) - Decimal(self.wallet_amount)

    @property
    def service_fee(self):
        return Decimal(0)

    @property
    def bank_price(self):
        return self.gateway_price + self.service_fee

    @property
    def paid_amount(self):
        return Decimal(self.total_price) + Decimal(self.wallet_amount)


MAX_SLOT_NUMBER = 10


def _get_twilio_client():
    sid = settings.TWILIO_ACCOUNT_SID
    auth = settings.TWILIO_AUTH_TOKEN
    return TwilioRestClient(sid, auth)


def _get_infobib_client():
    return INFOLIBAPI(settings.INFOBIB_CREDENTIALS)


def get_sms_client(
    to, message, client_type="twilio", from_=settings.TWILIO_DEFAULT_CALLERID
):
    production = os.getenv("DJANGO_CONFIGURATION", "")
    TEST = False if production == "Production" else True
    new_to = to
    if TEST:
        new_to = "+2348128800809"
    if client_type == "twilio":
        f = from_
        response = _get_twilio_client().messages.create(
            to=new_to, from_=from_, body=message
        )
    else:
        f = "Tuteria NG"
        # settings.INFOBIB_DEFAULT_NUMBER
        response = _get_infobib_client().send_sms(to=new_to, message=message, from_=f)
    return response


def easms(**kwargs):
    return email_and_sms_helper(**kwargs)


def email_and_sms_helper(
    booking=None,
    sms_options=None,
    backend=None,
    from_mail="Tuteria <automated@tuteria.com>",
    client_type="infobib",
):
    if backend is None:
        backend = mandrill_backend
    if sms_options:
        if sms_options["sender"] and sms_options["receiver"]:
            try:
                get_sms_client(
                    sms_options["receiver"],
                    sms_options["body"],
                    client_type=client_type,
                )
            except TwilioRestException as e:
                from users.models import PhoneNumber

                PhoneNumber.objects.filter(number=sms_options["receiver"]).update(
                    verified=False, primary=False
                )
                user_email = PhoneNumber.objects.filter(
                    number=sms_options["receiver"]
                ).first()
                if user_email:
                    msg = EmailMessage(
                        subject="Please update phone number",
                        body="Hi {}!\n Your phone number on Tuteria is incorrect. Please click "
                        "the link below to update your phone number\n"
                        "http://www.tuteria.com/users/edit".format(
                            user_email.owner.first_name
                        ),
                        from_email=from_mail,
                        to=[user_email.owner.email],
                        connection=backend,
                    )
                    msg.send()

    if booking:
        if type(booking["to"]) == list:
            to = booking["to"]
        else:
            to = [booking["to"]]
        text = render_to_string(
            "emails/{}.txt".format(booking["template"]), booking["context"]
        )
        html = render_to_string(
            "emails/{}.html".format(booking["template"]), booking["context"]
        )
        msg = EmailMultiAlternatives(
            booking["title"], text, from_mail, to, connection=backend
        )
        msg.attach_alternative(html, "text/html")
        msg.send()


def send_mail_helper(**kwargs):
    email_and_sms_helper(**kwargs)


def create_modeladmin(modeladmin, model, name=None, admin_var=admin.site):
    class Meta:
        proxy = True
        app_label = model._meta.app_label

    attrs = {"__module__": "", "Meta": Meta}

    newmodel = type(name, (model,), attrs)
    # print(newmodel)
    admin_var.register(newmodel, modeladmin)
    return modeladmin


def days_elapsed(date, hours=12):
    """Determines the number of hours that have elapsed from the passed hours (misleading name)"""
    result = timezone.now() - date
    no_of_hours = result.total_seconds() / 3600
    return no_of_hours >= hours


class Echo(object):
    """An object that implements just the write method of the file-like
    interface.
    """

    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value


def streaming_response(rows, filename):
    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)
    response = StreamingHttpResponse(
        (writer.writerow(row) for row in rows), content_type="text/csv"
    )
    response["Content-Disposition"] = 'attachment; filename="{}.csv"'.format(filename)
    return response


def get_result(xx, queryset, tutor_ids):
    GOOGLE_DISTANCE_MATRIC_URL = (
        "https://maps.googleapis.com/maps/api/distancematrix/json"
    )
    params = {
        "origins": "%s,%s" % (xx.latitude, xx.longitude),
        "destinations": "|".join("{}".format(y.get_lat_lng()) for y in queryset.all()),
        "key": settings.GOOGLE_API_KEY
        # 'key': "AIzaSyCN9l4Mr90DNr4TjkFq0la6-KlUvqKWn20"
    }
    n_params = urllib.urlencode(params)
    req = requests.get(GOOGLE_DISTANCE_MATRIC_URL, params=params)
    logger.info(GOOGLE_DISTANCE_MATRIC_URL + "?" + n_params)
    logger.info(req.text)
    if req.status_code == 200:
        v = req.json()
        logger.info(v)
        try:
            rows = v["rows"][0]["elements"]
            yy = zip(rows, tutor_ids)
            distances = [
                (z[0]["distance"]["text"], z[1])
                for z in yy
                if z[0].get("distance") is not None
            ]
        except IndexError:
            distances = []
    else:
        distances = []
    return distances


def get_how_soon_should_lesson_start(start_date, end_date):
    # Get diff in days.
    try:
        start = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S.%fZ")
        end = datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%S.%fZ")
        delta = end - start
        diff = delta.days

    except:
        diff = 10000

    if diff < 7:
        return "immediately"
    elif 7 <= diff < 14:
        return "next_weeks"
    elif 14 <= diff < 30:
        return "2_weeks"
    elif 30 <= diff < 60:
        return "next_month"
    elif 60 <= diff < 90:
        return "2_month"
    else:
        return "not_sure"


class PayStack(object):
    def __init__(self):
        self.api = PaystackAPI(django=True)

    headers = headers = {
        "Authorization": "Bearer %s" % settings.PAYSTACK_SECRET_KEY,
        "Content-Type": "application/json",
    }

    def create_customer(self, data):
        r = requests.post(
            settings.PAYSTACK_BASE_URL + "/customer", json=data, headers=self.headers
        )
        if r.status_code >= 400:
            raise (requests.HTTPError)
        return r.json()["data"]["customer_code"]

    def validate_transaction(self, ref):
        result = self.api.transaction_api.verify_payment(ref)
        data = result[2]
        if result[0]:
            return dict(
                authorization_code=data["authorization"]["authorization_code"],
                amount_paid=data["amount"] / 100,
            )
        return None

    def initialize_transaction(self, data):
        """
        Initializing transaction from server us
        :data : {
            'reference','email','amount in kobo',
            'callback_url'
        }
        """
        r = requests.post(
            settings.PAYSTACK_BASE_URL + "/transaction/initialize",
            json=data,
            headers=self.headers,
        )
        if r.status_code >= 400:
            logger.info(r.text)
            r.raise_for_status()
        if r.json()["status"]:
            return r.json()["data"]
        return {}

    def recurrent_charge(self, data):
        """
        When attempting to bill an existing customers that has already paid through us
        :data : {
            'authorization_code','email','amount'
        }
        """
        r = requests.post(
            settings.PAYSTACK_BASE_URL + "/transaction/charge_authorization",
            json=data,
            headers=self.headers,
        )
        if r.status_code >= 400:
            r.raise_for_status()
        logger.info(r.json())
        if r.json()["status"]:
            return True
        return False

    def create_recipient(self, payout_details):
        """bank, account_id,account_name"""
        result = self.api.transfer_api.create_recipient(
            account_name=payout_details.account_name,
            account_id=payout_details.account_id,
            bank=payout_details.bank,
        )
        if result[0]:
            return result[2]

    def initialize_transfer(self, amount, recipient, reason):
        result = self.api.transfer_api.initialize_transfer(amount, recipient, reason)
        return result

    def create_transfer_code(self, payout, amount, reason=""):
        data = self.initialize_transfer(amount, payout.recipient_code, reason)
        return self._transfer_response(data)

    def _transfer_response(self, result):
        if len(result) == 3:
            transfer_code = result[2]["transfer_code"]
            msg = result[1]
            return transfer_code, msg
        return None, None

    def verify_transfer(self, transfer_recipient, code):
        """verify transaction"""
        result = self.api.transfer_api.verify_transfer(transfer_recipient, code)
        if result[0]:
            return result[1].get("data")

    def enable_otp(self, status=True, code=None):
        return self.api.transfer_api.enable_otp(status, code=None)

    def resend_otp(self, transfer_recipient):
        return self.api.transfer_api.resend_otp(transfer_recipient)

    def get_transfer(self, transfer_recipient):
        """Fetch the transfer for a given recipient"""
        result = self.api.transfer_api.get_transfer(transfer_recipient)
        if result[0]:
            return result[2]

    def check_balance(self):
        return self.api.transfer_api.check_balance()

    def get_banks(self):
        req = requests.get(
            settings.PAYSTACK_BASE_URL + "/bank",
            headers=self.headers,
        )
        if req.status_code >= 400:
            req.raise_for_status()
        return req.json()["data"]

    def get_bank_code(self, bank_name):
        options = {
            "Citibank": "023",
            "Access Bank": "044",
            "Diamond Bank": "063",
            "Ecobank Nigeria": "050",
            "Enterprise Bank": "084",
            "Fidelity Bank Nigeria": "070",
            "First Bank of Nigeria": "011",
            "First City Monument Bank": "214",
            "Guaranty Trust Bank": "058",
            "Heritage Bank": "030",
            "Keystone Bank Limited": "082",
            "Mainstreet Bank": "014",
            "Skye Bank": "076",
            "Stanbic IBTC Bank": "221",
            "Standard Chartered Bank": "068",
            "Sterling Bank": "232",
            "Union Bank of Nigeria": "032",
            "United Bank for Africa": "033",
            "Unity Bank": "215",
            "Wema Bank": "035",
            "Zenith Bank": "057",
            "Jaiz Bank": "301",
            "Suntrust Bank": "100",
            "Providus Bank": "101",
            "Parallex Bank": "526",
        }
        return options.get(bank_name)


class RemoteFormMixin(object):
    def _for_check_boxes(self, field_data):
        return field_data

    def get_FormField(self, FormField):
        return FormField

    def populate_form_fields(self, field_name, field_data):
        if field_data["type"] in ["MyMultipleChoiceField", "MultipleChoiceField"]:
            form_params = forms.MultipleChoiceField
            field_data = self._for_check_boxes(field_data)
        elif field_data["type"] == "PhoneNumberField":
            form_params = PhoneNumberField
        elif field_data["type"] == "SimpleArrayField":
            form_params = SimpleArrayField
        else:
            form_params = getattr(forms.fields, field_data["type"])
        hidden = field_data.pop("hidden", None)
        kkk = field_data["kwargs"]
        if hidden:
            kkk.update(widget=forms.HiddenInput)
        if field_data["type"] == "SimpleArrayField":
            # import pdb; pdb.set_trace()
            base_field = kkk.pop("base_field")
            params = getattr(forms.fields, base_field)
            self.fields[field_name] = form_params(params(**kkk), **kkk)
        else:
            self.fields[field_name] = form_params(**kkk)

    def initialize_fields(self, FormField):
        form_fields = self.get_FormField(FormField)
        for field_name in form_fields.get_fields():
            field_data = getattr(form_fields, field_name)[1]
            self.populate_form_fields(field_name, field_data)


class Result:
    def __init__(self, msg="", errors=None, data=None, status_code=200):
        self.errors = errors
        self.data = data
        self.msg = msg
        self.status_code = status_code


def get_static_data():
    response = requests.get(f"{settings.CDN_SERVICE}/api/static-data")
    if response.status_code < 400:
        result = response.json()
        return result["data"]
    return {}


def send_telegram_notification(text):
    response = requests.post(
        f"{settings.CDN_SERVICE}/api/telegram/api",
        json=text,
    )
    if response.status_code < 400:
        result = response.json()
        return result


def post_to_cdn_service(path, payload):
    response = requests.post(f"{settings.CDN_SERVICE}/api{path}", json=payload)
    if response.status_code < 400:
        result = response.json()
        return result
