import graphene
from .. import utils
from wallet import models
from django.db.models import Q
import datetime


class AccountDeleteMutation(utils.BaseMutation):
    fields = [("status", bool), ("errors", "json")]
    form_fields = {
        "order": graphene.String(required=True),
        "action": graphene.String(required=True),
        "test": graphene.Boolean(required=False)
    }

    def callback(self, **kwargs):
        order = kwargs["order"]
        options = {
            "delete_withdrawal": lambda: models.RequestToWithdraw.objects.filter(
                order=order
            ).delete_withdrawal(),
            "delete_transaction": lambda: models.WalletTransaction.objects.filter(
                pk=int(order)
            ).delete(),
        }
        should_test = kwargs.get('test')
        action = options[kwargs.get("action")]
        if not should_test:
            action()

        return {"status": True}


class MakePaymentMutation(utils.BaseMutation):
    fields = [("status", bool), ("errors", "json")]
    form_fields = {
        "order": graphene.String(required=True),
        "test": graphene.Boolean()
    }

    def callback(self, **kwargs):
        if kwargs.get('test'):
            pass
        else:
            models.RequestToWithdraw.objects.filter(
                order=kwargs["order"]).after_transfer_has_been_made(True)

        return {"status": True}


PhoneNumberType = utils.createGrapheneClass("PhoneNumberType",
                                            [("number", str)])
WalletType = utils.createGrapheneClass("WalletType",
                                       [("amount_available", float)])
UserType = utils.createGrapheneClass(
    "UserType",
    [
        ("email", str),
        ("primary_phone_no", graphene.Field(PhoneNumberType)),
        ("first_name", str),
        ("last_name", str),
        ("wallet", graphene.Field(WalletType)),
    ],
)
PayoutType = utils.createGrapheneClass(
    "PayoutType", [("account_id", str), ("account_name", str), ("bank", str),
                   ('recipient_code', str)])
SkillType = utils.createGrapheneClass("SkillType", [("name", str)])
TutorSkillType = utils.createGrapheneClass(
    "TutorSkillType",
    [("skill", graphene.Field(SkillType)),
     ("tutor", graphene.Field(UserType))],
)
BookingWalletTransactionType = utils.createGrapheneClass(
    "BookingWalletTransactionType", [
        ("pk", int),
        ("status", str),
        ("created", str),
        ("modified", str),
        ("amount", float),
        ("transaction_type", str),
        ("credit", str),
        ("amount_paid", float),
        ("total", float),
    ])
BookingType = utils.createGrapheneClass(
    "BookingType",
    [("order", str), ("user", graphene.Field(UserType)),
     ("ts", graphene.Field(TutorSkillType)), ("first_session", str),
     ("last_session", str), ("total_price", str), ("created", str),
     ("status_display", str),
     ("made_payment", graphene.Field(graphene.Boolean),
      lambda x: x.wallet_transactions.first().amount_paid > 0),
     ("transactions", graphene.List(BookingWalletTransactionType),
      lambda x: x.wallet_transactions.all())],
)
WalletTransactionType = utils.createGrapheneClass(
    "WalletTransactionType",
    [("pk", int), ("status", str), ("created", str), ("modified", str),
     ("amount", float), ("transaction_type", str), ("credit", str),
     ("amount_paid", float), ("total", float),
     ("booking", graphene.Field(BookingType)),
     ("made_payment", graphene.Field(graphene.Boolean),
      lambda x: x.amount_paid > 0)],
)


def get_transactions(queryset, **kwargs):
    transactions = queryset
    status = {
        "TUTOR_HIRE": models.WalletTransactionType.TUTOR_HIRE,
        "EARNING": models.WalletTransactionType.EARNING,
        "WITHDRAWAL": models.WalletTransactionType.WITHDRAWAL,
        "WITHDRAWAL_COMPLETED":
        models.WalletTransactionType.WITHDRAWAL_COMPLETED,
        "BANK_CHARGES": models.WalletTransactionType.BANK_CHARGES,
    }
    selected_status = kwargs.get("status")
    if selected_status in status:
        transactions = transactions.filter(type=status[selected_status])

    return transactions


class WithdrawalType(graphene.ObjectType):
    payout = graphene.Field(PayoutType)
    amount = graphene.Float()
    user = graphene.Field(UserType)
    transactions = graphene.List(
        WalletTransactionType, status=graphene.String(required=False))
    order = graphene.String()
    created = graphene.String()

    def resolve_payout(self, info, **kwargs):
        return self.payout

    def resolve_amount(self, info, **kwargs):
        return self.amount

    def resolve_user(self, info, **kwargs):
        return self.user

    def resolve_transactions(self, info, **kwargs):
        email = self.user.email
        transactions = models.WalletTransaction.objects.filter(
            wallet__owner__email=email)
        return get_transactions(transactions, **kwargs)

    def resolve_order(self, info, **kwargs):
        return self.order

    def resolve_created(self, info, **kwargs):
        return self.created


def format_date(date):
    return datetime.datetime.strptime(date, "%Y-%m-%d")


class AccountVerification(graphene.ObjectType):
    all_withdrawals = graphene.List(
        WithdrawalType,
        exclude_orders=graphene.List(graphene.String, required=False))
    booking_transactions = graphene.List(
        WalletTransactionType, order=graphene.String(required=True))
    withdrawal_detail = graphene.Field(
        WithdrawalType, order=graphene.String(required=True))
    transaction_detail = graphene.Field(
        WalletTransactionType, order=graphene.String(required=True))
    all_transactions = graphene.List(
        WalletTransactionType,
        status=graphene.String(required=True),
        _from=graphene.String(required=False),
        to=graphene.String(required=False),
    )
    payout_detail = graphene.Field(
        PayoutType, email=graphene.String(required=True))

    def resolve_payout_detail(self, info, **kwargs):
        return models.UserPayout.objects.filter(
            user__email=kwargs['email']).first()

    def resolve_booking_transactions(self, info, **kwargs):
        return models.WalletTransaction.objects.filter(
            booking__order=kwargs['order'])

    def resolve_all_withdrawals(self, info, **kwargs):
        if kwargs.get('exclude_orders'):
            return models.RequestToWithdraw.objects.exclude(
                order__in=kwargs['exclude_orders'])
        return models.RequestToWithdraw.objects.all()

    def resolve_withdrawal_detail(self, info, **kwargs):
        return models.RequestToWithdraw.objects.filter(
            order=kwargs['order']).first()

    def resolve_all_transactions(self, info, **kwargs):
        transactions = models.WalletTransaction.objects.select_related(
            'booking__user', 'booking__ts__tutor').all()
        filters = Q()
        anded = False
        ragne = []
        if kwargs.get("_from") and kwargs.get("to"):
            ragne = [kwargs["_from"], kwargs["to"]]
            transactions = transactions.filter(created__range=ragne)

        return get_transactions(transactions, **kwargs)

    def resolve_transaction_detail(self, info, **kwargs):
        return models.WalletTransaction.objects.filter(
            pk=kwargs["order"]).first()


class Query(object):
    accountant_endpoint = graphene.Field(AccountVerification)

    def resolve_accountant_endpoint(self, info, **kwargs):
        return AccountVerification()


class Mutation(object):
    account_delete_actions = AccountDeleteMutation.Field()
    make_tutor_payment = MakePaymentMutation.Field()
