import json

from django.contrib import messages
from django.http import JsonResponse

from wallet.forms import UserPayoutForm
from wallet.models import UserPayout


def generate_refund_button(
    user_id,
    condition,
    display_secondary=None,
    url="/admin/userpayout/",
    kind="processing",
    b_text="Refund Tutor",
):
    html = (
        f'<div class="pfee" data-user-id="{user_id}"'
        f' data-url="{url}" data-kind="{kind}" data-button-text="{b_text}">'
        '<a href="" class="button toggle-row" '
        'style="cursor: pointer;padding: 7px;margin-right: 10px;">'
        "Refund Fee</a></div>"
    )
    if condition:
        return html
    return display_secondary


def process_payout_form(request, payout, callback):
    if request.is_ajax and request.method == "POST":
        data = json.loads(str(request.body, encoding="utf-8"))
        payment_form = UserPayoutForm({**data, "payout_type": 1}, instance=payout)
        if payment_form.is_valid():
            ff = payment_form.save(commit=False)
            callback(ff)
            messages.info(request, "Refund successfully initiated")
            return JsonResponse({"success": True})
    data = {"banks": UserPayout.BANKS}
    if payout:
        return JsonResponse(
            {
                **data,
                "bank": payout.bank,
                "accont_name": payout.account_name,
                "account_id": payout.account_id,
            }
        )

    return JsonResponse(data)
