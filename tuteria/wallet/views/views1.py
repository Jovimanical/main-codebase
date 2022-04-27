from braces.views import LoginRequiredMixin
from django.contrib import messages
from django.urls import reverse
from django.shortcuts import redirect
from django.views.generic import TemplateView
from ..services import WalletTransactionService, WalletService
from ..serializers import WalletTransactionSerializer
from django.http import JsonResponse

# Create your views here.


class OrderTransactionView(LoginRequiredMixin, TemplateView):
    template_name = "wallet/orders.html"

    def get_filter_to_display(self):
        q = self.request.GET.get("filter_by", "")
        if q == "payed":
            return "Payment"
        if q == "in_session":
            return "In Session"
        return "All"

    def get_context_data(self, **kwargs):
        user = self.request.user
        wallet_service = WalletTransactionService(user.email)
        context = super(OrderTransactionView, self).get_context_data(**kwargs)
        filter_by = self.request.GET.get("filter_by", "")
        filtering_optins = [
            dict(name="All", url=reverse("users:transactions")),
            dict(name="In Session", url="?filter_by=in_session"),
            dict(name="Paid", url="?filter_by=payed"),
        ]
        context.update(wallet_service.orders_display(filter_by=filter_by))
        context.update(
            filtering_options=filtering_optins, filter_val=self.get_filter_to_display()
        )
        return context


class RevenueTransactionView(LoginRequiredMixin, TemplateView):
    template_name = "wallet/revenue.html"

    def post(self, request, *args, **kwargs):
        payment_type = request.POST.get("payment_type")
        auto_withdraw = request.POST.get("auto_withdraw")
        self.wallet_service = WalletService(request.user.id)
        self.wallet_service.trigger_payment(payment_type, True, auto_withdraw)
        if payment_type:
            messages.info(
                request,
                "Request to Withdraw successfully received. You should receive payment in the next 24 hours",
            )
        return redirect(reverse("users:revenue_transactions"))

    def get_filter_to_display(self):
        q = self.request.GET.get("filter_by", "")
        if q == "earned":
            return "Earned"
        if q == "withdrawn":
            return "Withdrawals"
        if q == "used_to_hire":
            return "Used to hire tutors"
        if q == "pending":
            return "Pending Clearance"
        return "Everything"

    def get_context_data(self, **kwargs):
        context = super(RevenueTransactionView, self).get_context_data(**kwargs)
        wallet_service = WalletTransactionService(self.request.user.email)
        filtering_optins = [
            dict(name="Everything", url=reverse("users:revenue_transactions")),
            dict(name="Withdrawals", url="?filter_by=withdrawn"),
            dict(name="Used to hire tutors", url="?filter_by=used_to_hire"),
            dict(name="Earned", url="?filter_by=earned"),
        ]
        filter_by = self.request.GET.get("filter_by", "")
        page = self.request.GET.get("page")
        context.update(wallet_service.revenue_display(filter_by, page))
        context.update(
            filtering_options=filtering_optins, filter_val=self.get_filter_to_display()
        )
        return context


def cecil_data(request):
    from ..models import Wallet

    email = request.GET.get("email", "Cecille15ph@gmail.com")
    aa = Wallet.objects.get(owner__email=email)
    data = aa.get_details_for_chart()
    return JsonResponse(WalletTransactionSerializer(data, many=True).data, safe=False)
