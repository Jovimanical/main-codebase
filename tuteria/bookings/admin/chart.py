from jchart import Chart
from jchart.config import rgba


class LineChart(Chart):
    chart_type = "bar"
    summary_data = []

    def get_labels(self, **kwargs):
        return [x["period"].strftime("%d/%m/%Y") for x in self.summary_data]

    def get_datasets(self, **kwargs):
        colors = [rgba(121, 174, 200) for x in self.summary_data]
        data = [x["total"] for x in self.summary_data]
        return [
            {
                "label": "Booking Summary over Time",
                "data": data,
                "backgroundColor": colors,
            }
        ]
