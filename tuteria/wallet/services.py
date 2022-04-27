from decimal import Decimal
import json
import time
import multiprocessing
import pdb
import datetime
from django.conf import settings
from django.utils.functional import cached_property
import requests
from wallet.models import WalletTransaction, WalletTransactionType, Wallet, UserPayout
from skills.services import PaginatorObject
from bookings.tasks import notify_admin_to_make_payment_to_tutor


class WalletService(object):

    def __init__(self, user_id):
        self.instance = Wallet.objects.filter(owner__id=user_id).first()
        if not self.instance:
            self.instance, _ = Wallet.objects.get_or_create(owner_id=user_id)
        if self.instance:
            self.user = self.instance.owner

    def withdrawable_balance(self):
        return self.instance.simple_withrawable

    def trigger_payment(self, payment_type, ch=False, auto_withdraw=False):
        amount_to_withdraw = self.withdrawable_balance()
        if payment_type:
            if payment_type == "Bank":
                payout = self.user.bank_payout
                charge = 200 if amount_to_withdraw > 100000 else 100
            else:
                payout = None
                charge = (amount_to_withdraw * 1 / 100) + 70
            if ch:
                charge = 0
            self.instance.initiate_withdrawal(
                payout=payout, charge=charge, amount=amount_to_withdraw
            )
            notify_admin_to_make_payment_to_tutor.delay(self.instance.owner.email)
        if auto_withdraw:
            self.instance.auth_withdraw = True
            self.instance.save()

    def update_paystack_auth_code(self, auth_code):
        self.instance.authorization_code = auth_code
        self.instance.save()

    def update_amount_available(self, deducted_amount, default="-"):
        actions = {
            # '+': lambda x: self.instance.amount_available + x,
            "-": lambda x: self.instance.amount_available - x,
            # '=': lambda x: x
        }
        wallet_amount = self.instance.amount_available
        if 0 < wallet_amount < deducted_amount:
            self.instance.amount_available = actions[default](wallet_amount)
            self.instance.save()
            return wallet_amount
        return 0

    def can_use_credit(self, amount):
        return self.instance.amount_available > amount

    @classmethod
    def total_tutor_earnings(self):
        x = Wallet.objects.first()
        return str(int(x.total_amount_earned_by_tutors))

    def construct_service_dict(self):
        user_fields = ["email", "first_name", "last_name"]
        user_dict = {x: evaluate_decimal(self.user, x) for x in user_fields}
        user_dict.update(username=self.user.slug)
        wallet_fields = [
            "credits",
            "amount_available",
            "amount_in_session",
            "credit_in_session",
            "previous_available_balance",
            "wallet_type",
            "authorization_code",
            "auto_withdraw",
        ]
        wallet_dict = {x: evaluate_decimal(self.instance, x) for x in wallet_fields}
        wallet_dict.update(owner=user_dict)
        return wallet_dict

    def save_wallet_to_service(self):
        url = settings.PAYMENT_SERVICE_URL + "/wallet/"
        response = requests.post(url, json=self.construct_service_dict())
        return response

    @classmethod
    def save_all_wallet_instances(self):
        w = Wallet.objects.all()
        gen = (
            WalletService(o.owner_id)
            for o in w
            if o.owner.email != "gbozee@gmail.com" and o.transactions.count() > 0
        )
        for t in gen:
            response = t.save_wallet_to_service()
            if response.status_code >= 400:
                pass
            yield t

    @classmethod
    def save_all_payout_instances(self):
        url = settings.PAYMENT_SERVICE_URL + "/userpayout/"
        gen = (
            dict(
                user=dict(
                    email=w.user.email,
                    username=w.user.slug,
                    first_name=w.user.first_name,
                    last_name=w.user.last_name,
                ),
                payout_type=w.payout_type,
                account_id=w.account_id,
                bank=w.bank,
                account_name=w.account_name,
            )
            for w in UserPayout.objects.all()
        )
        for t in gen:
            response = requests.post(url, json=t)
            if response.status_code >= 400:
                pass
            yield t


def evaluate_decimal(obj, field):
    v = getattr(obj, field)
    if isinstance(v, Decimal):
        v = int(v)
    if isinstance(v, datetime.datetime):
        v = v.isoformat()
    return v


class WalletTransactionService(object):

    def __init__(self, email):
        self.transactions = WalletTransaction.objects.filter(wallet__owner__email=email)
        if self.transactions.first():
            self.user = self.transactions.first().wallet.owner
            self.booking_transactions = WalletTransaction.objects.filter(
                booking__user=self.user
            )
        else:
            self.user = None

    def orders(self, filter_by):
        if filter_by == "payed":
            return self.booking_transactions.payed_to_tutor()
        if filter_by == "in_session":
            return self.transactions.in_session()
        return self.transactions.used_to_hire()

    def revenues(self, filter_by):
        queryset = WalletTransaction.objects.for_tutor(self.user)
        queryset2 = self.transactions.exclude(
            credit=0, type=WalletTransactionType.TUTOR_HIRE
        )
        if filter_by == "earned":
            return queryset2.earned()
        if filter_by == "withdrawn":
            return queryset2.withdrawn()
        if filter_by == "used_to_hire":
            return queryset2.earnings_used_to_hire()
        if filter_by == "pending":
            return queryset.pending()
        return queryset2

    @cached_property
    def used_to_hire(self):
        return self.transactions.used_to_hire().sum_up_all_transactions()

    @cached_property
    def total_used_to_hire(self):
        return sum(self.used_to_hire.values())

    def orders_display(self, filter_by=""):
        if not self.user:
            return []
        total_payed_to_tutor = sum(
            self.transactions.payed_to_tutor().sum_up_all_transactions().values()
        )
        total_in_session = self.user.wallet.amount_in_session
        total_walled_used_to_hire = self.used_to_hire["t_credit"]
        current_balance = self.total_used_to_hire - (
            total_in_session + total_payed_to_tutor
        )
        pagination, result = PaginatorObject().paginate(_list=self.orders(filter_by))
        return {
            "total_used_to_hire": self.total_used_to_hire,
            "total_in_session": total_in_session,
            "total_paid_to_tutor": total_payed_to_tutor,
            "total_credit_used": total_walled_used_to_hire,
            "current_balance": current_balance,
            "object_list": result,
            "page_obj": result,
        }

    def revenue_display(self, filter_by="", page=None):
        if not self.user:
            return []
        total_earned = sum(
            self.transactions.earned().sum_up_all_transactions().values()
        )
        total_withdrawn = sum(self.transactions.withdrawn().aggregate_amount().values())
        total_credit_used_to_hire = self.used_to_hire["t_credit"]
        user_wallet = self.user.wallet
        total_payed_to_tutor = sum(
            self.transactions.payed_to_tutor().sum_up_all_transactions().values()
        )
        wallet_balance = self.total_used_to_hire - (
            user_wallet.amount_in_session + total_payed_to_tutor
        )
        # withdrawable_balance = total_earned + wallet_balance - (total_withdrawn + total_credit_used_to_hire)
        withdrawable_balance = user_wallet.simple_withrawable
        upcoming_earnings = sum(
            self.booking_transactions.upcoming().sum_up_all_transactions().values()
        )
        pagination, result = PaginatorObject().paginate(
            _list=self.revenues(filter_by), page=page
        )

        return {
            "total_earned": total_earned,
            "total_withdrawn": total_withdrawn,
            "total_used_to_hire": total_credit_used_to_hire,
            "wallet_balance": wallet_balance,
            "withdrawable_balance": withdrawable_balance,
            "upcoming_earnings": upcoming_earnings,
            "my_transactions": self.transactions.count() > 0,
            "object_list": result,
            "page_obj": result,
        }

    def construct_service_dict(self):
        user_fields = ["email", "first_name", "last_name"]
        booking_fields = ["order", "wallet_amount", "total_price", "status"]
        transaction_fields = [
            "type",
            "amount",
            "transaction_type",
            "credit",
            "amount_paid",
            "total",
            "extra_message",
            "created",
            "modified",
        ]
        response = []
        for tt in self.transactions:
            transaction = {a: evaluate_decimal(tt, a) for a in transaction_fields}
            if tt.booking:
                bk = tt.booking
                booking = {b: evaluate_decimal(bk, b) for b in booking_fields}
                user = {c: getattr(bk.user, c) for c in user_fields}
                user.update(username=bk.user.slug)
                tutor = {d: getattr(bk.tutor, d) for d in user_fields}
                tutor.update(username=bk.tutor.slug)
                booking.update(user=user, tutor=tutor)
                transaction.update(booking=booking)
            transaction.update(email=self.user.email)
            response.append(transaction)
        return response

    def save_transactions_to_service(self):
        url = settings.PAYMENT_SERVICE_URL + "/wallettransaction/"
        for transaction in self.construct_service_dict():
            response = requests.post(url, json=transaction)
            if response.status_code >= 400:
                pass

    @classmethod
    def save_all_transactions(cls):
        saved_wallets = (
            cls(o.user.email) for o in WalletService.save_all_wallet_instances()
        )
        for wallet in saved_wallets:
            wallet.save_transactions_to_service()


class WalletTransactionServiceMixin(object):

    def __init__(self, user):
        self.user = user
        self.api_client = ApiClient(self.user.slug)

    def update_pagination(self, data):
        pagination, r = PaginatorObject().paginate(_list=data["object_list"])
        data.update({"object_list": r, "page_obj": r})
        return data

    def revenue_display(self, filter_by="all_tutor"):
        """result from gateway consist of
         {
            'total_earned': total_earned,
            'total_withdrawn': total_withdrawn,
            'total_used_to_hire': total_credit_used_to_hire,
            'wallet_balance': wallet_balance,
            'withdrawable_balance': withdrawable_balance,
            'upcoming_earnings': upcoming_earnings,
        }
        """
        result = self.api_client.get_revenue_details(filter_by)
        result = self.update_pagination(result)
        result.update({"my_transactins": result["count"] > 0})
        return result

    def order_display(self, filter_by="all_client"):
        """result from gateway consist of
        {
            'total_used_to_hire': self.total_used_to_hire,
            'total_in_session': total_in_session,
            'total_paid_to_tutor': total_payed_to_tutor,
            'total_credit_used': total_walled_used_to_hire,
            'current_balance': current_balance,
        }
        """
        result = self.api_client.get_order_details(filter_by)
        result = self.update_pagination(result)
        return result

    def trigger_payment(self, payment_type, ch=False, auto_withdraw=False):
        self.api_client.trigger_payment(payment_type, ch=False, auto_withdraw=False)
        if payment_type:
            notify_admin_to_make_payment_to_tutor.delay()
