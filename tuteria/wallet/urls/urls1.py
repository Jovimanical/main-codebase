# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json

from django.conf import settings
from django.conf.urls import include, url
from .. import views
from django.views.decorators.csrf import csrf_exempt
from ..autocomplete_light_registry import (
    UserPayoutAutoComplete,
    WalletAutoComplete,
    WalletTransactionAutocomplete,
)
from ..admin.chart import LineChartView

urlpatterns = (
    # '',
    url(r"^chart-data/sss/$", views.cecil_data, name="cecil"),
    # Uncomment the next line to enable the admin:
    url(
        r"^wallet-autocomplete/$",
        WalletAutoComplete.as_view(),
        name="wallet-autocomplete",
    ),
    url(r"^charts/bar_chart/$", LineChartView, name="transaction_chart"),
    url(
        r"^wallettransaction-autocomplete/$",
        WalletTransactionAutocomplete.as_view(),
        name="wallettransaction-autocomplete",
    ),
    url(
        r"^userpayout-autocomplete/$",
        UserPayoutAutoComplete.as_view(),
        name="userpayout-autocomplete",
    ),
    url(
        regex=r"^transactions/orders$",
        view=views.OrderTransactionView.as_view(),
        name="transactions",
    ),
    # Uncomment the next line to enable the admin:
    url(
        regex=r"^transactions/revenue$",
        view=views.RevenueTransactionView.as_view(),
        name="revenue_transactions",
    ),
)
