from jchart import Chart
from jchart.config import Axes, DataSet, rgba
from jchart.views import ChartView
from ..models import WalletTransaction
import logging

logger = logging.getLogger(__name__)


class LineChart(Chart):
    chart_type = "bar"
    summary_data = []

    def get_labels(self, **kwargs):
        return [x.created.strftime("%d/%b/%Y") for x in self.summary_data]

    def get_datasets(self, **kwargs):
        colors = [rgba(121, 174, 200) for x in self.summary_data]
        evd = lambda x: x if x > 0 else 0
        return [
            {
                "label": "last class to payment made",
                "data": [evd(x.ltp.days) for x in self.summary_data],
                "backgroundColor": colors,
            },
            {
                "label": "Booking duration (days)",
                "data": [evd(x.bd.days) for x in self.summary_data],
                "backgroundColor": [rgba(121, 144, 200) for x in self.summary_data],
            },
            {
                "label": "From booking to payment (days)",
                "data": [evd(x.btp.days) for x in self.summary_data],
                "backgroundColor": [rgba(150, 144, 140) for x in self.summary_data],
            },
        ]


class SimpleChartView(ChartView):

    def get(self, request, *args, **kwargs):
        email = request.GET.get("email")
        logger.info(email)
        if email:
            data = WalletTransaction.objects.filter(
                wallet__owner__email=email
            ).booking_times()
            logger.info(data)
            self.chart_instance.summary_data = data
        return super(SimpleChartView, self).get(request, *args, **kwargs)


LineChartView = SimpleChartView.from_chart(LineChart())
