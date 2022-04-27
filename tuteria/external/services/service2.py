# -*- coding: utf-8 -*-
import users as u
import copy
import logging
import os
from decimal import Decimal
from gateway_client.client_requests import RequestService
from django.conf import settings
from django.urls import reverse
from external.forms import remote_forms as ex_forms
import requests
from skills.models import Skill
from django.http import Http404
from pricings.models import Region
import json
import referrals as r
from django.utils import timezone
from django.utils.functional import cached_property
import wallet as w
from django.conf import settings
import bookings as b
from external import models as ex_models
from paypal.standard.forms import PayPalPaymentsForm
from config import signals, utils

request_service = RequestService(url=settings.REQUEST_SERVICE_URL)

logger = logging.getLogger(__name__)


def copy_request(request):
    req_copy = copy.copy(request)
    req_copy.POST = request.POST.copy()
    return req_copy


def get_phone_number(previous_number):
    if previous_number.startswith("+234"):
        previous_number = previous_number[4:]
    if previous_number.startswith("0"):
        previous_number = previous_number[1:]
    return "+234{}".format(previous_number)


def user_as_json(user):
    result = {"email": user.email}
    home_address = user.home_address
    phone_number = user.primary_phone_no.number if user.primary_phone_no else None
    if home_address:
        addr = home_address
        state = addr.state or ""
        dicto = dict(
            address=addr.address,
            state=state,
            latitude=addr.latitude,
            longitude=addr.longitude,
            vicinity=addr.vicinity,
        )
    else:
        dicto = dict()
    result.update(home_address=dicto)
    result.update(
        first_name=user.first_name or "",
        last_name=user.last_name or "",
        number=str(phone_number),
        gender=user.profile.gender or "",
    )
    return result


class ExternalService(object):
    service = request_service

    def __init__(self, email=None, create=False, **kwargs):
        if create and email:
            self.user_service = u.services.UserService(email)
            self.instance = self.create_new_request(self.user_service)

    @classmethod
    def create_new_request(cls, user_service):
        # import pdb; pdb.set_trace()
        return cls.service.create_new_request(user_as_json(user_service.user))

    @classmethod
    def form_params(cls, request, ts=None, **kwargs):
        """
        Takes the request, an instance of the userservice
        and other passed parameters to populate the form
        """
        from skills.models import Category

        initial = {}
        new_instance = None
        if ts:
            initial["opts_choices"] = ts.form_params()
        if kwargs.get("region"):
            initial.update(initial=dict(state=kwargs["region"]))
        if request.user.is_authenticated:
            new_instance = cls(email=request.user.email, create=True)
            init_data = new_instance.get_initial_data()
            init_data.update(**kwargs)
            if kwargs.get("referral_code"):
                init_data.update(referral_code=kwargs["referral_code"])
            initial["instance"] = new_instance.instance
            initial["initial"] = init_data
        if kwargs.get("online"):
            nigerian_category, _ = Category.objects.get_or_create(
                name=kwargs["the_category"]
            )
            initial["category"] = nigerian_category
        # import pdb; pdb.set_trace()
        return initial

    @classmethod
    def populate_form(cls, request, ts=None, passed_form=None, **kwargs):
        """Initial Form to be filled on subject profile page"""
        context = {}
        form_params = cls.form_params(request, ts=ts, **kwargs)
        if ts:
            the_form = ex_forms.TutorRequestForm1(**form_params)
        else:
            the_form = passed_form(**form_params)
        context["form"] = the_form
        if form_params.get("instance"):
            context["instance_pk"] = form_params["instance"]["id"]
        return context

    def get_initial_data(self):
        """Data to initialize request_form"""
        fields = ["age", "class_of_child"]
        result = {}
        if self.instance:
            result = {x: self.instance.get(x) for x in fields}
            result.update(
                {"number": self.user_service.actual_number.replace("+234", "0")}
            )
        return result

    @classmethod
    def create_user_from_email(cls, instance):
        """Create user's instance after completing first forms
        for online clients'"""
        user, new = u.models.User.objects.get_or_create(email=instance["email"])
        user.country = instance["country"]
        user.first_name = instance["first_name"]
        user.save()
        # action can be asynchronous
        cls.service.update_request_with_user(instance["id"], user.pk)

    @classmethod
    def extra_form_actions(
        cls, form, tutor=None, online=None, commit=True, area=None, **kwargs
    ):
        new_kwargs = {}
        if tutor:
            new_kwargs.update(request_type=2, tutor_slug=tutor.slug)
        if kwargs.get("is_parent"):
            new_kwargs.update(is_parent_request=True)
        if kwargs.get("request_subjects"):
            new_kwargs.update(request_subjects=kwargs["request_subjects"])
        if online:
            new_kwargs.update(request_type=3, status=2, class_urgency="immediately")
        if area:
            region = u.models.Constituency.objects.get_region(area)
            new_kwargs.update(region=region)

        instance = form.save(**new_kwargs)

        if online:
            cls.create_user_from_email(instance)
            # check if there are tutors
            inst_ = SingleRequestService(instance["slug"])
            if inst_.check_skill_support(
                inst_.instance["request_subjects"][0], None, True
            ):
                return reverse("request_tutor_skill_online", args=[instance["slug"]])
            return reverse("online_request_completed", args=[instance["slug"]])
        if tutor:
            return reverse(
                "users:request_second_step", args=[tutor.slug, instance["slug"]]
            )
        if area:
            # check if tutors exist and if they do, redirect to the page to
            # view them else just continue
            return reverse("tutor_selection", args=[instance["slug"]])

        return reverse("request_tutor_skill", args=[instance["slug"]])

    @classmethod
    def admin_actions_on_profile_page(cls, ts, request_pk=None, action=3):
        new_ts = {}
        if ts:
            new_ts = {"slug": ts.tutor.slug, "price": ts.price}

        cls._admin_actions_on_profile_page(new_ts, request_pk, action)

    @classmethod
    def _admin_actions_on_profile_page(cls, ts, request_pk, action):
        cls.service.admin_actions_on_profile_page(ts, request_pk, action)

    @classmethod
    def get_opts_choices(cls, request, ts=None, **kwargs):
        from skills.models import Category

        if ts:
            return {
                "opts_choices": cls.form_params(request, ts, **kwargs).get(
                    "opts_choices"
                )
            }
        if kwargs.get("online"):
            nigerian_category, _ = Category.objects.get_or_create(
                name=kwargs["the_category"]
            )
            return {"category": nigerian_category}
        return {}

    @classmethod
    def save_first_form(cls, request, ts=None, passed_form=None, **kwargs):
        req_copy = copy_request(request)
        area = request.POST.get("area")
        if not kwargs.get("online"):
            req_copy.POST["number"] = get_phone_number(request.POST["number"])
        initials = cls.get_opts_choices(request, ts, **kwargs)
        if request.user.is_authenticated:
            z = request.POST.get("pk")
            if z:
                initials["instance"] = SingleRequestService(pk=z).instance
        if ts:
            form = ex_forms.TutorRequestForm1(req_copy.POST, **initials)
        if passed_form:
            form = passed_form(req_copy.POST, **initials)
        if form.is_valid():
            user = None
            if ts:
                user = ts.user
            return cls.extra_form_actions(form, tutor=user, area=area, **kwargs), None
        return None, form


class SingleRequestService(object):

    def __init__(self, slug=None, tutor_slug=None, pk=None):
        try:
            self.instance, self.selected_tutor = request_service.get_instance(
                slug=slug, pk=pk, tutor_slug=tutor_slug
            )
            if self.instance.get("tutor_slug"):
                self.instance.update(
                    tutor=u.services.UserService(slug=self.instance["tutor_slug"]).user
                )
            if not self.instance:
                raise requests.exceptions.RequestException()
        except requests.exceptions.RequestException:
            raise Http404("BaseRequest not found")

    def is_online(self):
        return self.instance["request_type"] == 3

    def get_user(self):
        if self.instance["user"]:
            return u.models.User.objects.filter(pk=self.instance["user"]).first()
        return None

    @property
    def has_paid_fee(self):
        return self.instance["paid_fee"]

    @property
    def slug(self):
        return self.instance["slug"]

    def get_first_subject(self):
        return self.instance["request_subjects"][0]

    @classmethod
    def check_skill_support(self, skill_name, supported_state, online=False):
        """Checks if the skill searched for has the state supported"""
        skill = Skill.objects.filter(name=skill_name).first()
        if skill:
            return skill.with_states.filter(
                state=supported_state, online=online
            ).exists()
        return False

    def second_request_form_context(
        self, referral_code=None, condition=True, param=False, **kwargs
    ):
        selected_skill = kwargs.get("selected_skill", None)
        state = self.instance["state"]
        last_5_request = request_service.get_completed_requests(state=state, number=5)
        regions = []
        if self.instance["is_parent_request"]:
            regions = Region.get_areas_as_dict(state)
        else:
            if selected_skill:
                self.instance = request_service.update_request_with_subject(
                    self.instance["id"], selected_skill
                )

            if len(self.instance["request_subjects"]) > 0:
                subject = self.instance["request_subjects"][0]
                can_use_parent = subject in list(Skill.all_parent_subjects())
                if can_use_parent and not param:
                    regions = Region.get_areas_as_dict(state)
        # check if the subject has been activated for the state
        if self.instance["request_subjects"]:
            if len(self.instance["request_subjects"]) == 1:
                has_state = SingleRequestService.check_skill_support(
                    self.instance["request_subjects"][0], state
                )
                if has_state:
                    regions = []
                    # regions = Region.get_areas_as_dict(self.instance.state)
        response = {
            "last_5_request": last_5_request,
            "object": self.instance,
            "levels": request_service.get_levels_of_students(),
            "regions": json.dumps(regions),
            "miniRegion": regions,
            "displayRegion": len(regions) > 0,
            "request_instance": self.instance,
            "rates": request_service.get_rates(),
        }
        if kwargs.get("user_service"):
            response["weekdays"] = kwargs["user_service"].week_day_with_times()
        if self.instance["request_type"] == 2:
            response["request_instance"] = self.instance
        if condition:
            if kwargs.get("user_service"):
                response["cost_of_booking"] = kwargs[
                    "user_service"
                ].get_price_for_subject(self.instance["request_subjects"][0])
            initial = {
                "number": self.instance["number"].replace("+234", "")
                if self.instance["number"]
                else "",
                "referral_code": referral_code,
            }
            a = {}
            if "user_service" in kwargs:
                initial.update(possible_subjects=self.instance["request_subjects"])
                a = kwargs["user_service"].request_form_params()
            response["form"] = self.get_form_instance(param=param)(
                instance=self.instance, initial=initial, **a
            )
        return response

    def get_form_instance(self, param=None):
        """Get the form instance, differentiate between parentrequest form and regular request"""
        if self.instance["is_parent_request"]:
            return ex_forms.ParentRequestForm

        if self.instance["request_type"] == 2:
            return ex_forms.TutorRequestForm2
        if param:
            return ex_forms.TutorRequestForm2
        else:
            return ex_forms.SecondRequestForm

    def save_second_form(self, request, **kwargs):
        """Action to save form"""
        extra = {}
        if kwargs.get("user_service"):
            extra = kwargs["user_service"].request_form_params()
        form = self.get_form_instance(kwargs.get("param", False))(
            request.POST, instance=self.instance, **extra
        )
        if form.is_valid():
            extra_actions = {}
            # import pdb; pdb.set_trace()

            if kwargs.get("user_service"):
                # import pdb; pdb.set_trace()
                user_instance = kwargs["user_service"]
                usss = user_instance.user
                if not form.cleaned_data["other_tutors"]:
                    extra_actions.update(
                        remarks="Only wants {} {}({})".format(
                            usss.first_name, usss.last_name, usss.email
                        )
                    )
                tutor_price = int(
                    user_instance.get_price_for_subject(
                        self.instance["request_subjects"][0]
                    )
                )
                extra_actions.update(budget=tutor_price, tutor_slug=usss.slug)
            self.instance = form.save(**extra_actions)
            return self.instance["slug"], None
        return None, form

    def tutors_exists(self):
        """Checks if we are going to be displaying tutors to the client"""
        if len(self.instance["request_subjects"]) == 1:
            has = self.check_skill_support(
                self.instance["request_subjects"][0], self.instance["state"]
            )
            return has
        return False

    def get_pricing_form(self, request):
        if request.is_featured:
            return ex_forms.PriceMiniForm
        return ex_forms.PriceAdjustForm

    def third_request_form_context(self, request):
        referral_code = request.referral_code
        plan = request.POST.get("plan", "")
        pricingvalues = request_service.get_pricings(self.instance["id"], plan)
        pricing = pricingvalues["real"]
        pricingParams = request_service.get_rates()
        operaMiniPlans = pricingvalues["featured"]
        r = ""
        if referral_code:
            if referral_code == "None":
                r = ""
            else:
                r = referral_code
        return {
            "object": self.instance,
            "p_params": pricingParams,
            "pricing_options": json.dumps(pricing),
            "basic": [o for o in pricing if o["status"] == 1][0],
            "medium": [o for o in pricing if o["status"] == 2][0],
            "high": [o for o in pricing if o["status"] == 3][0],
            "referral_code": r,
            "toggle_referral": self.has_referral_instance(),
            "operaMiniPlans": operaMiniPlans,
        }

    def has_referral_instance(self):
        return r.models.Referral.objects.filter(
            owner__email=self.instance["email"]
        ).exists()

    def save_third_form(self, request, **kwargs):
        req_copy = copy_request(request)
        req_copy.POST["primary_phone_no1"] = get_phone_number(
            request.POST["primary_phone_no1"]
        )
        req_copy.POST["number"] = get_phone_number(request.POST["number"])
        data = req_copy.POST
        form = self.get_pricing_form(request)(data, instance=self.instance)
        if form.is_valid():
            w = request.POST.get("referral_code")
            self.instance = form.save(referal_code=w)
            return None
        return form

    # Todo: Refractor and remove
    def create_user_instance_in_form(self, request, update=True):
        # import pdb; pdb.set_trace()
        user, password = u.services.CustomerService.create_user_instance(
            email=self.instance["email"],
            first_name=self.instance["first_name"],
            last_name=self.instance["last_name"],
        )
        return user, password

    @cached_property
    def get_ts_skills(self):
        return self.preload_tutors(self.instance["region"], self.is_online())

    def preload_tutors(self, area=None, online=False):
        """Fetches the list of tutors to be displayed to the client"""
        subject = self.instance["request_subjects"][0]
        tutors = u.services.TutorService.get_tutors_teaching_skill(
            subject, area, online
        )
        return [
            MockClass(x, subject, online=online, req_instance=self.instance)
            for x in tutors
        ]

    @classmethod
    def update_urgency(self, instance):
        request_service.generic_update_of_request(
            instance["id"], {"class_urgency": "immediately"}
        )

    def get_tutor_select_context_data(self, **kwargs):
        from skills.services import PaginatorObject

        page = kwargs.get("page")
        skills = self.get_ts_skills
        paginator, result = PaginatorObject().paginate(3, page, _list=skills)
        return {
            "object": self.instance,
            "teach_all_subject": True,
            "ts_skills": result,
            # 'currency': "₦" if self.instance.region else "$",
            "currency": "₦",
            "count": len(skills),
            "the_tutor_list": True,
        }

    def get_per_hour_price(self, ts):
        from users.models import User

        try:
            ts_price = ts.price
        except Exception:
            raise Http404("Request not found or has already been place.")
        if self.is_online():
            ts_price = request_service.get_rates()["online_prices"]
            # new_inst = User.objects.filter(
            #     pk=ts.pk).with_online_requests().first()
            # if new_inst.online_requests >= 4:
            #     ts_price = 50
        return ts_price

    def create_booking(self, user=None):
        attr = {}
        if user:
            attr.update(tutor_slug=user.slug)
        if self.selected_tutor:
            attr.update(
                tutor_slug=self.selected_tutor["tutor_slug"],
                budget=self.selected_tutor["ttp"],
            )
        booking = request_service.create_new_booking(self.instance["id"], **attr)
        return booking["order"]

    def create_online_booking(self, tutor_id):
        from users.models import User

        new_inst = User.objects.filter(slug=tutor_id).first()
        attr = {}
        if new_inst:
            price_as_naira = request_service.get_rates()["online_prices"]
            attr.update(
                {
                    "tutor_slug": new_inst.slug,
                    "hours_per_day": 1,
                    "days_per_week": 1,
                    "available_days": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                    ],
                }
            )
            attr.update(budget=price_as_naira * len(attr["available_days"]))

        # create_user_instance
        user, new = User.objects.get_or_create(
            email=self.instance["email"],
            defaults=dict(first_name=self.instance["first_name"]),
        )
        attr.update(user=user.pk, class_urgency="immediately")
        booking_order = request_service.generic_update_of_request(
            self.instance["id"], attr, update_pool=True, create_booking=True
        )
        return booking_order["order"]

    @property
    def plan(self):
        return self.instance.get("plan")

    def pay_processing_fee(self, deduct=False):
        user_service = u.services.UserService(pk=self.instance["user"])
        user_service.update_wallet_with_processing_fee(
            self.instance["slug"], deduct=deduct
        )
        request_service.paid_processing_fee(self.instance["id"])

    @property
    def paid_fee(self):
        return self.instance["paid_fee"]

    def process_paystack_payment(self, request):
        slug = self.instance["slug"]
        result = request_service.get_authorization_url(
            slug,
            email=request.user.email,
            callback_url=build_full_urls(
                request, reverse("callback_paystack", args=[slug])
            ),
            _type="processing_fee",
        )
        return result["authorization_url"]

    def paystack_payment_outcome(self, request):
        error = False
        try:
            auth_url = self.process_paystack_payment(request)
        except utils.HTTPError as e:
            logger.error(e)
            auth_url = reverse("client_request_completed", args=[self.instance["slug"]])
            error = True
        finally:
            return auth_url, error

    def paypal_payment_outcome(self, amount, custom=True):
        return True

    def update_payment_and_notify_admin(self, total):
        self.pay_processing_fee()

    def paga_payment_outcome(self, request):
        return True

    @classmethod
    def generic_payment_outcome(cls, request, **kwargs):
        v = request.POST
        paypal = True
        transaction_message = "Transaction Payment Successful!"
        status_message = ("", "")
        if (
            v.get("payment_status") == "Completed"
            and v.get("business") == settings.PAYPAL_RECEIVER_EMAIL
        ):
            slug = v["invoice"]
        else:
            slug = kwargs["slug"]
            paypal = False
        client_request = cls(slug)
        if paypal:
            status = client_request.paypal_payment_outcome(v["payment_gross"])
        else:
            status, status_message = client_request.paga_payment_outcome(request)
            transaction_message = "Processing Fee Payment Successful!"
        if not status:
            transaction_message = "Processing Fee Payment Failed. {}".format(
                status_message[1]
            )
        return status, transaction_message

    def get_paystack_form_parameters(self, request):
        """acounts for percentage discount to be incorporated when client pays online"""
        original_amount = settings.PROCESSING_FEE * 100
        return construct_paystack_params(
            request.user.email, original_amount, self.instance["slug"]
        )

    def get_paypal_form(self, request):
        pk = self.instance["slug"]
        others = {
            "custom": "Processing Fee Payment",
            "item_name": "Processing Fee for request {}".format(pk),
        }
        urls = ["processing_fee_redirect", "processing_fee_cancelled"]
        return get_paypal_form(
            request.build_absolute_uri, pk, settings.PROCESSING_FEE, urls, others
        )

    def get_payment_data(self, request):
        return {
            "paypal_form": self.get_paypal_form(request),
            "paystack": self.get_paystack_form_parameters(request),
            "object": self.instance,
            "todays_request": [],
            "processing_fee": settings.PROCESSING_FEE,
        }


class MockClass:

    def __init__(self, tutor, language, online=False, req_instance=None):
        self.tutor = tutor
        self.language = language
        self.online = online
        self.instance = req_instance

    def get_ts(self):
        return (
            self.tutor.tutorskill_set.active()
            .with_ratings()
            .with_reviews()
            .filter(skill__name=self.language)
            .first()
        )

    def get_absolute_url(self):
        if self.online:
            return reverse(
                "dollar_online_payment", args=[self.tutor.slug, self.instance["slug"]]
            )
        return reverse(
            "users:with_skill_in_url",
            args=[self.tutor.slug, self.get_skill_id, self.instance["slug"]],
        )

    @property
    def get_skill_id(self):
        return self.get_ts().pk

    def ttp(self):
        if self.online:
            rates = request_service.get_rates()["online_prices"]
            # if self.tutor.online_requests >= 4:
            #     return rates * 2
            return rates
        return self.get_ts().price

    def no_of_hours_taught(self):
        return self.tutor.no_of_hours_taught()


class DepositMoneyService(object):

    def __init__(self, order):
        self.instance = request_service.get_booking_order(order)
        self.rq_service = SingleRequestService(pk=self.instance["request_id"])
        self.u_service = u.services.UserService(pk=self.rq_service.instance["user"])
        self.payer = self.u_service.user
        self.payer_wallet = w.services.WalletService(self.payer.id)

    def paystack_validation(self, full_payment, update_wallet=True):
        processing_fee = 0
        if not self.rq_service.paid_fee:
            processing_fee = int(settings.PROCESSING_FEE)
        new_amount = full_payment - processing_fee
        if update_wallet:
            self.u_service.top_up_wallet_with_amount_paid(new_amount)
        self.instance = request_service.update_wallet_and_notify_admin(
            self.instance["order"], new_amount
        )

    def process_paystack_payment(self, request):
        slug = self.instance["order"]
        result = request_service.get_authorization_url(
            slug,
            email=request.user.email,
            callback_url=build_full_urls(
                request, reverse("callback_paystack", args=[slug])
            ),
        )
        return result["authorization_url"]

    def reprocess_paystack_payment(self):
        self.instance = request_service.change_order(self.instance["order"])

    def paystack_payment_outcome(self, request):
        error = False
        access_code = self.instance["paystack_access_code"]
        if access_code:
            return access_code, False
        try:
            auth_url = self.process_paystack_payment(request)
        except utils.HTTPError as e:
            logger.error(e)
            self.reprocess_paystack_payment()
            auth_url = reverse("request_payment_page", args=[self.instance["order"]])
            error = True
        finally:
            return auth_url, error

    def paypal_payment_outcome(self, amount, custom=True):
        status = False
        full_payment = Decimal(
            round(Decimal(amount) * int(ex_models.get_dollar_rate()["USDNGN"]), -1)
        )
        if self.instance["status"] == ex_models.DepositMoney.ISSUED:
            self.paystack_validation(full_payment)
            status = True
        return status

    def update_payment_and_notify_admin(self, total):
        self.paystack_validation(total)

    def paga_payment_outcome(self, request):
        return paga_payment_outcome(request.POST, self.update_payment_and_notify_admin)

    @classmethod
    def generic_payment_outcome(cls, request, **kwargs):
        v = request.POST
        paypal = True
        transaction_message = "Transaction Payment Successful!"
        status_message = ("", "")
        if (
            v.get("payment_status") == "Completed"
            and v.get("business") == settings.PAYPAL_RECEIVER_EMAIL
        ):
            slug = v["invoice"]
        else:
            slug = kwargs["order"]
            paypal = False
        client_request = cls(slug)
        if paypal:
            status = client_request.paypal_payment_outcome(v["payment_gross"])
        else:
            status, status_message = client_request.paga_payment_outcome(request)
        if not status:
            transaction_message = "Request Payment Failed. {}".format(status_message[1])
        return status, transaction_message

    @property
    def can_use_credit(self):
        return self.payer_wallet.can_use_credit(self.instance["amount_to_be_paid"])

    def update_wallet_amount(self, amount, default="+"):
        self.instance = request_service.update_wallet_amount(
            self.instance["order"], amount=amount, default=default
        )
        return self

    @cached_property
    def get_amount(self):
        amount_to_be_paid = self.instance["amount"]
        deduction = self.u_service.use_referral_credit(Decimal(amount_to_be_paid))
        self.update_wallet_amount(int(deduction), "=")
        wallet_amount = self.payer_wallet.update_amount_available(
            Decimal(self.instance["amount_to_be_paid"])
        )
        result = self.update_wallet_amount(int(wallet_amount), "=")
        return result.instance["amount_to_be_paid"]

    def get_payment_return_url(self, request):
        return build_full_urls(
            request, reverse("request_complete_redirect", args=[self.instance["order"]])
        )

    def get_paypal_form(self, request):
        pk = self.instance["order"]
        others = {"item_name": "Payment for lesson", "custom": "Request Payment"}
        urls = ["request_complete_redirect", "request_cancelled_redirect"]
        return get_paypal_form(
            request.build_absolute_uri, pk, self.get_amount, urls, others
        )

    def has_been_paid(self):
        return self.instance["status"] == ex_models.DepositMoney.PAYED

    def notify_admin_of_payments_made(self, condition=None, **kwargs):
        if not condition:
            if self.can_use_credit:
                self.paystack_validation(
                    self.instance["amount_to_be_paid"], update_wallet=False
                )
                return True
            return False
        amount_paid = kwargs.get("amount_paid")
        self.paystack_validation(amount_paid, update_wallet=False)
        self.payer_wallet.update_paystack_auth_code(kwargs.get("authorization_code"))

    def get_paystack_form_parameters(self, request):
        """acounts for percentage discount to be incorporated when client pays online"""

        original_amount = self.get_amount - self.instance["discounted"]
        return construct_paystack_params(
            request.user.email, original_amount, self.instance["order"]
        )

    def get_payment_form(self, request):
        return get_paga_form(
            request.build_absolute_uri,
            request.user.email,
            request.user.id,
            self.get_amount,
            "Payment for lesson",
            self.instance["order"],
            "request_complete_redirect",
        )

    def get_payment_data(self, request):
        new_data = self.instance.copy()
        new_data.update(wallet_amount=Decimal(new_data["wallet_amount"]))
        response = {
            "paga_form": self.get_payment_form(request),
            "paypal_form": self.get_paypal_form(request),
            "can_use_credit": self.can_use_credit,
            "amount_to_be_paid": self.instance["amount_to_be_paid"],
            "paystack": self.get_paystack_form_parameters(request),
            "object": new_data,
            "req_instance": self.rq_service.instance,
            "processing_fee": settings.PROCESSING_FEE,
        }
        response.update(request_service.pricing_data(self.instance["order"]))
        return response


def build_full_urls(request, url):
    return request.build_absolute_uri(url)


def get_paypal_form(func, pk, amount, urls, others):
    u = ex_models.get_dollar_rate()["USDNGN"]
    new_amount = amount / int(u)
    others.update(
        {
            "business": settings.PAYPAL_RECEIVER_EMAIL,
            "invoice": pk,
            "amount": round(new_amount, 2),
            "notify_url": func(reverse("paypal-ipn")),
            "image": "https://www.paypalobjects.com/en_US/i/btn/x-click-but6.gif",
            "return_url": func(reverse(urls[0], args=[pk])),
            "cancel_return": func(reverse(urls[1], args=[pk])),
        }
    )
    return PayPalPaymentsForm(initial=others)


def construct_paystack_params(email, amount, pk):
    return {
        "key": settings.PAYSTACK_PUBLIC_KEY,
        "email": email,
        "amount": amount,
        "ref": pk,
    }


def get_paga_form(func, email, user_id, amount, description, invoice, return_url):
    initial = {}
    production = os.getenv("DJANGO_CONFIGURATION", "")
    TEST = False if production == "Production" else True
    initial = {
        "email": email,
        "account_number": user_id,
        "subtotal": amount,
        "phoneNumber": "",
        "description": description,
        "surcharge": 0,
        "surcharge_description": "Booking Fee",
        "product_code": "",
        "quantity": "",
        "invoice": invoice,
        "test": TEST,
        "return_url": func(reverse(return_url, args=[invoice])),
    }
    return b.forms.PagaPaymentForm(initial=initial)


def paga_payment_outcome(data, func):
    status = data.get("status")
    valid = False
    status_message = get_status_message(status)
    logger.info(data)
    form = b.forms.PagaResponseForm(data)
    if form.is_valid():
        func(form.cleaned_data["total"])
        valid = True
    return valid, status_message


def get_status_message(status):
    if status == "SUCCESS":
        return "Transaction Successful", "Reason: Your payment completed successfully"
    if status == "ERROR_TIMEOUT":
        return "Transaction Failed", "Reason: The transaction timed out."
    if status == "ERROR_INSUFFICIENT_BALANCE":
        return (
            "Transaction Failed",
            "Reason: Insufficient Funds.  Please Fund account and Try again",
        )
    if status == "ERROR_INVALID _CUSTOMER_ACCOUNT":
        return (
            "Transaction Failed",
            "Reason: Transaction could not be authorised. Please contact Paga customer service or send a mail to service@mypaga.com",
        )
    if status == "ERROR_CANCELLED":
        return "Transaction Failed", "Reason: No transaction record"
    if status == "ERROR_BELOW_MINIMUM":
        return (
            "Transaction Failed",
            "Reason: Your transaction amount is below the required minimum transaction amount of N100",
        )
    if status == "ERROR_ABOVE_MAXIMUM":
        return (
            "Transaction Failed",
            "Reason: Your transaction amount is above the maximum transaction amount of N300000",
        )
    if status == "ERROR_AUTHENTICATION":
        return (
            "Transaction Failed",
            "Reason: Authentication Error. Please try again with valid credentials",
        )
    # ERROR_UNKNOWN
    return ("Transaction Failed", "Reason: Error processing transaction. ")


def error_exception():
    from requests import HTTPError

    return HTTPError
