import pdb


class MailChimpAPI(object):

    def __init__(self, api_caller, list_id):
        self.m = api_caller
        self.list_id = list_id

    @property
    def grouping(self):
        return self.m.lists.interest_groupings(self.list_id)[0]

    def get_country_from_group(self, country):
        for group in self.grouping["groups"]:
            if group.get("name") == country:
                return group
        return None

    def add_to_mailing_list(self, instance):
        country = instance.country.name
        country_group = self.get_country_from_group(country)
        if not country_group:
            self.create_group_for_country(instance)
            country_group = self.get_country_from_group(country)
        self.add_user_to_group(country_group, instance)

    def add_user_to_group(self, country_group, user):
        merge_vars = dict(
            FNAME=user.first_name,
            LNAME=user.last_name,
            GROUPINGS=[dict(id=self.grouping["id"], groups=(country_group["name"],))],
        )
        self.m.lists.subscribe(
            self.list_id, {"email": user.email}, merge_vars, update_existing=True
        )

    def create_group_for_country(self, user):
        country = user.country.name
        self.m.lists.interest_group_add(self.list_id, country)
