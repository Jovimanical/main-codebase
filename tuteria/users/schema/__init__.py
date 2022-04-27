from .schema1 import Query as Schema1Query, Mutation as Schema1Mutation
from .schema2 import Query as Schema2Query


class Query(Schema1Query, Schema2Query):
    pass


class Mutation(Schema1Mutation):
    pass
