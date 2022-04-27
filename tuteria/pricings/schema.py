import graphene
from graphene_django.types import DjangoObjectType
from .models import Region


class RegionNode(DjangoObjectType):
    phone_number = graphene.String()

    class Meta:
        model = Agent

    def resolve_phone_number(self, args, context, info):
        return str(self.phone_number)


class Query(object):
    agent = graphene.Field(AgentNode)
    regions = graphene.List(RegionNode, sub_category=graphene.String())

    def resolve_agent(self, args, context, info):
        return Agent.get_agent()

    def resolve_agents(self, args, context, info):
        return Agent.objects.all()

    def resolve_regions(self, args, context, info):
