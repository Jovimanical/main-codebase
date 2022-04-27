from external.models import BaseRequestTutor
from import_export import resources


class BaseRequestTutorResource(resources.ModelResource):
    where_you_heard = resources.Field()
    agent = resources.Field()

    class Meta:
        model = BaseRequestTutor
        exclude = ("user", "ts", "booking", "valid_request", "related_request")

    def dehydrate_where_you_heard(self, book):
        return book.get_where_you_heard_display()

    def dehydrate_agent(self, rrr):
        if rrr.agent:
            return rrr.agent.name
