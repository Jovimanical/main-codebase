from .schema1 import Query as Schema1Query
from .mutation import Mutation as Schema1Mutation
from .payments import verify_payment
from .admin_schema import Query as AdminQuery, Mutation as AdminMutation


class Query(Schema1Query, AdminQuery):
    pass


class Mutation(Schema1Mutation, AdminMutation):
    pass
