import graphene
from .utils import createGrapheneClass, createGrapheneInputClass


LocationNode1 = createGrapheneClass(
    "Location",
    [
        ("address", str),
        ("state", str),
        ("area", str),
        ("vicinity", str),
        ("latitude", float),
        ("longitude", float),
    ],
)
shared = [("first_name", str), ("last_name", str), ("email", str)]
PersonalInfoNode = createGrapheneClass(
    "PersonalInfo", [*shared, ("phone_number", str), ("how_you_heard", str)]
)

SingleChildRequest = createGrapheneInputClass(
    "SingleChild",
    [
        ("class", str),
        ("goal", "json"),
        ("subjects", graphene.List(graphene.String)),
        ("expectation", str),
    ],
)
UserDetailInput = createGrapheneInputClass(
    "UserDetailInput",
    [
        ("first_name", str, {"required": True}),
        ("last_name", str, {"required": True}),
        ("email", str, {"required": True}),
        ("phone_number", str, {"required": True}),
        ("how_you_heard", str),
    ],
)
RequestInput = createGrapheneInputClass(
    "RequestInput",
    [
        ("classes", "json"),
        ("curriculum", "json"),
        ("gender", str),
        ("days", "json"),
        ("hours", float),
        ("no_of_teachers", int),
        ("start_date", str),
        ("end_date", str),
        ("per_hour", float),
        ("processing_fee", int),
        ("transport_fee", int),
        ("transport_fare", int),
        ("discount", int),
        ("budget", float),
        ("shared", bool),
        ("coupon", str),
        ("slug", str),
        ("totalPrice", float),
        ("lessonCount", int),
        ("startTime", str),
        ("online_lesson", str),
        ("no_of_lessons", int),
        ("no_of_weeks", int),
        ("student_no", int),
        ("exam", str),
        ("exam_before", bool),
        ("selections", "json"),
        ("exam_type", str),
        ("date_of_exam", str),
        ("exam_date", str),
        ("purpose", str),
        ("targeted_score", "json"),
        ("expectations", str),
        # ("tutor_level", str),
        ("online_lessons", str),
        ("plan", str),
        ("time_of_lesson", str),
        ("discount_info", "json"),
    ],
)
UserNode1 = createGrapheneClass(
    "UserRequestData",
    [
        ("personal_info", graphene.Field(PersonalInfoNode)),
        ("location", graphene.Field(LocationNode1)),
        ("request_details", "json"),
    ],
)

AgentNode = createGrapheneClass(
    "RequestAgent",
    [
        ("email", str),
        ("name", str),
        ("phone_number", str),
        ("title", str),
        ("image_url", str),
    ],
)

RequestNode = createGrapheneClass(
    "BaseRequestData",
    [("request_dump", graphene.Field(UserNode1)), ("agent", graphene.Field(AgentNode))],
)
