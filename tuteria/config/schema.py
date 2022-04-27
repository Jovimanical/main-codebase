import users.schema
import external.schema
import skills.schema
import graphene
from django.conf import settings

if settings.DEBUG:
    from graphene_django.debug import DjangoDebug

    class DebugClass(object):
        debug = graphene.Field(DjangoDebug, name="__debug")


else:

    class DebugClass(object):
        pass


class Mutation(users.schema.Mutation, external.schema.Mutation, graphene.ObjectType):
    pass


class Query(
    DebugClass,
    users.schema.Query,
    external.schema.Query,
    skills.schema.Query,
    graphene.ObjectType,
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=False)
