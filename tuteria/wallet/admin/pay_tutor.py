import requests
import json
from django.conf import settings


def get_value(val):
    if isinstance(val, str):
        return val
    return val.get("value")


def as_valid_graphql(value):
    result = json.dumps(value)
    if type(value) == str:
        return result
    return convert_list(value)


def convert(val, remove_inner=False):
    new_string = json.dumps(val).replace("\\", "")
    if type(val) == dict:
        for x in val.keys():
            new_string = new_string.replace(json.dumps(x), x)
    return new_string


def convert_list(val):
    result = {}
    if type(val) == dict:
        for key, value in val.items():
            if type(value) == list:
                result.update({key: [convert(v, True) for v in value]})
            elif type(value) == dict:
                result.update({key: convert(value)})

            else:
                result.update({key: value})
    else:
        result = [convert(v, True) for v in val]
    return (
        convert(result)
        .replace('["', "[")
        .replace('"]', "]")
        .replace('"{', "{")
        .replace('}"', "}")
    )


def construct_key_value_pair(key, value):
    if type(key) == str:
        return "%s:%s" % (key, as_valid_graphql(value))
    return ",".join(
        construct_key_value_pair(key[x], value[x]) for x, y in enumerate(key)
    )


def resolve_graphql_field(field, value=None):
    if isinstance(field, str):
        return "%s,\n" % field
    # assuming it is a dict
    base = "%s{\n" % field["name"]
    if value:
        base = "%s(%s){\n" % (
            field["name"],
            construct_key_value_pair(field["key"], field["value"]),
        )
    for f in field["fields"]:
        base += resolve_graphql_field(f, get_value(f))
    base += "}\n"
    return base


def construct_graphql_query(dict_object):
    """
    {"name": "wallet",
    "key": "username",
    "fields": ["owner", "upcoming_earnings",
    {'name': "transactions",
    'key': None,
    "fields": ["display", "type"] }]}
    :returns
        query{
            wallet(username:""){
                total_earned,
                total_withdrawn,
                total_credit_used_to_hire,
                total_used_to_hire,
                total_payed_to_tutor,
                upcoming_earnings,
                transactions{
                    total,
                    type,
                    display,
                    to_string,
                    amount
                }
            }
        }
    """
    base = resolve_graphql_field(dict_object, dict_object.get("value"))
    return "query{\n%s}\n" % base


def construct_graphql_mutation(dict_object):
    # import pdb; pdb.set_trace()
    base = resolve_graphql_field(dict_object, dict_object.get("value"))
    result = "mutation{\n%s}\n" % base
    return result.replace('"', '"')


def get_field_value(value):
    if isinstance(value, str):
        return value
    return construct_graphql_dict(
        value["name"], value["fields"], key=value.get("key"), value=value.get("value")
    )


def construct_graphql_dict(name, fields, key=None, value=None):
    options = {"name": name, "key": key, "fields": [get_field_value(x) for x in fields]}
    if value:
        options.update(value=value)
    return options


class BaseClient(object):

    def __init__(self, base_url):
        self.base_url = base_url

    def _response(self, new_query):
        response = requests.post(
            self.base_url, json={"query": new_query, "variables": None}, verify=False
        )
        response.raise_for_status()
        return response.json()["data"]

    def _mutation_graphql_server(self, mutation):
        new_query = construct_graphql_mutation(mutation)
        return self._response(new_query)

    def pay_tutor(self, payments):
        data = {
            "name": "payTutor",
            "key": ["implementation", "params"],
            "value": [
                "live",
                [
                    dict(
                        accountNumber=x["account_name"],
                        bank=x["bank"],
                        amount=str(x["amount"]),
                    )
                    for x in payments
                ],
            ],
            "fields": [
                "status",
                {
                    "name": "data",
                    "fields": [
                        "status",
                        {"name": "data", "fields": ["responsecode", "responsemessage"]},
                    ],
                },
            ],
        }
        query = get_field_value(data)
        response = self._mutation_graphql_server(query)
        return response["payTutor"]


api_caller = BaseClient(settings.PAYMENT_URL)
