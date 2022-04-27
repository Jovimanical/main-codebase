import copy
import math
from external.models import BaseRequestTutor
from config import utils
import pdb

subjects = [
    {
        "subjects": (
            "Literacy & Numeracy",
            "Phonics",
            "Elementary Mathematics",
            "Elementary English",
            "General Nursery",
        ),
        "name": "Nursery",
        "id": "nursery",
        "class_of_child": ["Nursery 1", "Nursery 2"],
    },
    {
        "subjects": (
            "Basic Mathematics",
            "Quantitative Reasoning",
            "Basic Sciences",
            "English Language",
            "Verbal Reasoning",
            "Computer Education",
        ),
        "name": "Primary",
        "id": "primary",
        "class_of_child": [
            "Primary 1",
            "Primary 2",
            "Primary 3",
            "Primary 4",
            "Primary 5",
            "Primary 6",
        ],
    },
    {
        "subjects": (
            "General Mathematics",
            "Basic Science",
            "English Language",
            "Business Studies",
            "Computer Science",
            "Basic Technology",
        ),
        "name": "JSS",
        "id": "jss",
        "class_of_child": ["JSS 1", "JSS 2", "JSS 3"],
    },
    {
        "subjects": (
            "General Mathematics",
            "Physics",
            "Further Mathematics",
            "Chemistry",
            "English Language",
            "Literature in English",
            "Biology",
            "Agricultural Science",
            "Geography",
            "Economics",
            "Accounting",
            "Government",
            "Commerce",
            "Technical Drawing",
            "Computer Science",
        ),
        "name": "SSS",
        "id": "sss",
        "class_of_child": ["SSS 1", "SSS 2", "SSS 3"],
    },
    {
        "subjects": (
            "French",
            "Spanish",
            "Piano",
            "Drums",
            "Guitar",
            "Saxophone",
            "Yoruba",
            "Hausa",
            "Igbo",
        ),
        "name": "Music and Languages",
        "id": "music_and_language",
        "class_of_child": ["Beginner", "Intermediate", "Advanced"],
    },
]
levels_of_student = [
    "Nursery 1",
    "Nursery 2",
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SSS 1",
    "SSS 2",
    "SSS 3",
    "Beginner",
    "Intermediate",
    "Advanced",
]

related_subjects = {
    "nursery": {
        "nursery_Literacy & Numeracy",
        "nursery_Phonics",
        "nursery_Elementary Mathematics",
        "nursery_Elementary English",
        "nursery_General Nursery",
    },
    "primary": {
        "primary_Basic Mathematics",
        "primary_Quantitative Reasoning",
        "primary_Basic Sciences",
        "primary_English Language",
        "primary_Verbal Reasoning",
        "primary_Computer Education",
    },
    "jss_math": {"jss_General Mathematics", "jss_Basic Sciences"},
    "sss_math": {
        "sss_General Mathematics",
        "sss_Physics",
        "sss_Further Mathematics",
        "sss_Chemistry",
    },
    "primary_jss_sss_math": {
        "primary_Basic Mathematics",
        "jss_General Mathematics",
        "primary_Quantitative Reasoning",
        "sss_General Mathematics",
        "sss_Further Mathematics",
        "sss_Physics",
        "sss_Chemistry",
    },
    "primary_english": {"primary_English Language", "primary_Verbal Reasoning"},
    "jss_english": {"jss_English Language", "jss_Business Studies"},
    "primary_jss_sss_english": {
        "jss_English Language",
        "sss_Literature in English",
        "sss_English Language",
        "primary_Verbal Reasoning",
        "primary_English Language",
    },
    "jss_sss_commercial": {"jss_Business Studies", "sss_Economics", "sss_Accounting"},
    "sss_commercial": {"sss_Government", "sss_Commerce"},
    "primary_jss_sss_computer": {
        "primary_Computer Education",
        "jss_Computer Science",
        "sss_Computer Science",
    },
    "jss_sss_td": {"jss_Basic Technology", "sss_Technical Drawing"},
    "primary_jss_sss_science": {
        "sss_Biology",
        "sss_Agricultural Science",
        "jss_Agricultural Science",
        "jss_Basic Sciences",
        "sss_Geography",
        "primary_Basic Sciences",
    },
}
languages = [
    "French Language",
    "Spanish Language",
    "Piano",
    "Drums",
    "Guitar",
    "Saxophone",
    "Yoruba Language",
    "Hausa Language",
    "Igbo Language",
]


def get_intersection(input_from_user):
    # returned =  filter(lambda x: len(x.keys()[0]) > 0, ({i:x.intersection(set(input_from_user))} for i,x in related_subjects.items()))
    returned = [
        {i: x.intersection(set(input_from_user))}
        for i, x in related_subjects.items()
        if len(x.intersection(set(input_from_user))) > 0
    ]
    return returned


def get_tutors(input_from_user):
    sorted_result = sorted(
        get_intersection(input_from_user),
        key=lambda x: len(list(x.values())[0]),
        reverse=True,
    )
    result_set = []
    x = my_reduce(sorted_result)
    for y in x:
        for z in x:
            if list(y.keys())[0] != list(z.keys())[0] and list(y.values())[0] == list(z.values())[0]:
                x.remove(y)
    return x


def my_reduce(arr):
    duplicate = copy.copy(arr)
    for u in arr:
        length = list(u.values())[0]
        for v in arr:
            v_length = list(v.values())[0]
            y = v_length.intersection(length)
            if y == v_length and length != v_length:
                if v in duplicate:
                    duplicate.remove(v)
    return duplicate


# def parse_get_tutors(input_from_user):
# 	required_tutors = get_tutors(input_from_user)
# 	tutor_classes_subjects = []
# 	for i in range(len(required_tutors)):
# 		subjects_and_class = required_tutors[i][required_tutors[i].keys()[0]]
# 		classes = []
# 		subjects = []
# 		class_subject = {}
# 		for j in range(len(subjects_and_class)):
# 			classes.append(list(subjects_and_class)[j].split('_')[0])
# 			subjects.append(list(subjects_and_class)[j].split('_')[1])

# 		class_subject['cls'] = list(set(classes))
# 		class_subject['subject'] = list(set(subjects))
# 		tutor_classes_subjects.append(class_subject)

# 	return tutor_classes_subjects


def parse_get_tutor(input_from_user):
    required_tutors = get_tutors(input_from_user)
    subjects_alone = [x for w in required_tutors for x in w.values()]
    new_arr = [[tuple(y.split("_")) for y in x] for x in subjects_alone]
    second_arr = [list(zip(*x)) for x in new_arr for y in zip(*x)]
    zz = [dict(cls=list(set(x[0])), subject=list(set(x[1]))) for x in second_arr]
    return [i for n, i in enumerate(zz) if i not in zz[n + 1 :]]


def get_levels(arr):
    working_levels = [dict(id=x["id"], levels=x["class_of_child"]) for x in subjects]
    groupings = [[y for y in working_levels if y["id"] == x] for x in arr]
    return [x["levels"] for w in groupings for x in w]


def get_filtered_levels(arr, from_user):
    result = [list(set(x).intersection(set(from_user))) for x in get_levels(arr)]

    return [x for y in result for x in y]


def create_requests_from_response(input_from_user, class_of_child, base_request):
    result = parse_get_tutor(input_from_user)
    wp = get_price(result, len(base_request.available_days), base_request.hours_per_day)
    days = splitted_days(wp, base_request.available_days)
    # if len(result) > 1:
    for i, r in enumerate(result):
        # v = BaseRequestTutor()
        v = populate_content(base_request, r, class_of_child, len(result))
        # pdb.set_trace()
        v.available_days = days[i]
        v.hours_per_day = wp[i][1]
        # v.budget = v.price_calculator2(base_request.per_hour())
        v.save()

    my_languages = set(languages).intersection(set(input_from_user))
    level_s = list(
        {"Beginner", "Intermediate", "Advanced"}.intersection(set(class_of_child))
    )
    if len(my_languages) > 0:
        for w in my_languages:
            v = copy.copy(base_request)
            v.classes = level_s
            v.class_of_child = ""
            v.valid_request = False
            v.status = BaseRequestTutor.COMPLETED
            v.request_subjects = [w]
            v.slug = utils.generate_code(BaseRequestTutor, "slug")
            v.is_split = True
            v.pk = None
            v.related_request = base_request
            v.save()


def populate_content(base_request, r, class_of_child, default_s=True):
    v = copy.copy(base_request)
    v.classes = get_filtered_levels(r["cls"], class_of_child)
    v.class_of_child = ""
    v.valid_request = False
    v.status = BaseRequestTutor.COMPLETED
    v.request_subjects = r["subject"]
    v.slug = utils.generate_code(BaseRequestTutor, "slug")
    v.is_split = True
    v.pk = None
    v.related_request = base_request
    v.save()
    return v

def clone_base_request(base_request, params):
    pass

def get_price(tutors, no_of_days, no_of_hours):
    """Function that determines the number of days and hours for
    each tutor. If a tutor teaches a nursery subject, then he/she teaches
    for the whole duration"""
    new_tutors = list(filter(lambda y: "nursery" not in y["cls"], tutors))
    nursery = False
    no_of_new_tutors = len(list(new_tutors)) or 1
    single_day = no_of_days / no_of_new_tutors
    reminder = no_of_days % no_of_new_tutors
    if len(tutors) == len(list(new_tutors)):
        result = [[single_day, no_of_hours] for x in new_tutors]
    else:
        nursery = True
        result = [[single_day, no_of_hours - 1] for x in new_tutors]
    if len(result) > 0:
        result[0][0] = result[0][0] + reminder
    else:
        result = []
    if nursery:
        index = [i for i, v in enumerate(tutors) if "nursery" in v["cls"]][0]
        result.insert(index, [no_of_days, 1])
    return result


def splitted_days(rr, available_days):
    """Splits the days between the tutors based on the subjects they teach.
    """
    result = []
    cummulative = []
    for i, x in enumerate(rr):
        if len(available_days) == x[0]:
            v = available_days[: math.floor(x[0])]
        else:
            n = [w for w in available_days if w not in cummulative]
            v = n[: math.floor(x[0])]
            cummulative.extend(v)
        result.append(v)
    return result
