from paystack.utils import PaystackAPI
# , get_js_script as p_get_js_scripts
from paystack import signals as p_signals
from django.http import JsonResponse
from external.models import BaseRequestTutor
from django.dispatch import receiver
from decimal import Decimal


def verify_payment(request, order):
    amount = request.GET.get("amount")
    txrf = request.GET.get("trxref")
    paystack_instance = PaystackAPI()
    response = paystack_instance.verify_payment(txrf, amount=int(amount))
    # if response[0]:
    p_signals.payment_verified.send(
        sender=PaystackAPI, ref=txrf, amount=int(amount), order=order
        )
    return JsonResponse({"success": True})
    # return JsonResponse({"success": False}, status=400)


@receiver(p_signals.payment_verified)
def on_payment_verified(sender, ref, amount, order, **kwargs):
    record = BaseRequestTutor.objects.filter(slug=order).first()
    amount = Decimal(amount / 100)
    budget = record.budget
    if amount >= budget:
        record.budget = amount
        record.no_of_students = int(amount / budget)
        record.save()
        record.group_lesson_paid()
    # record.budget = Decimal(amount) / 100
    # process to quickbooks
    # record.create_sales_receipt()
    # record.add_to_mailing_list()
    # return record
