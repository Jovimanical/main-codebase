from .account import Query as AccountQuery, Mutation as AccountMutation
from .tutor import Query as TutorQuery, Mutation as TutorMutation


class Query(TutorQuery, AccountQuery):
    pass


class Mutation(AccountMutation, TutorMutation):
    pass
