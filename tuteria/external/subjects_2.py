import copy
import math
from external.models import BaseRequestTutor
from config import utils
import pdb

mapping = {
    "Literacy & Numeracy": ["Literacy & Numeracy"],
    "Creative Writing": ["Creative Writing"],
    "Phonics": ["Phonics"],
    "Basic Mathematics": [
        "Primary Math",
        "School Entrance Math",
        "11+ Math",
        "11+ Non-verbal",
        "Primary Checkpoint Math",
    ],
    "Handwriting Improvement": ["handwriting"],
    "History": [
        "13+ History",
        "History",
        "IGCSE History",
        "Edexcel History",
        "IB History",
    ],
    "Spanish Language": [
        "13+ Spanish",
        "Spanish",
        "IGCSE Spanish",
        "Edexcel Spanish",
        "SAT Spanish",
        "AP Spanish",
    ],
    "French Language": [
        "French",
        "13+ French",
        "IGCSE French",
        "Edexcel French",
        "SAT French",
        "AP French",
    ],
    "German Language": [
        "13+ German",
        "German",
        "IGCSE German",
        "Edexcel German",
        "SAT German",
        "AP German",
    ],
    "English Language": [
        "Primary English",
        "11+ English",
        "School Entrance English",
        "IGCSE English",
        "11+ Verbal",
        "Primary Checkpoint English",
        "JSS English",
        "Checkpoint English",
        "SSS English",
        "13+ English",
        "IB English",
        "Edexcel English",
        "AP English",
    ],
    "Basic Sciences": [
        "Primary Science",
        "Primary Checkpoint Science",
        "JSS Science",
        "Checkpoint Science",
        "13+ Science",
    ],
    "Geography": [
        "Geography",
        "13+ Geography",
        "IGCSE Geography",
        "Edexcel Geography",
        "IB Geography",
        "AP Geography",
    ],
    "Computer Science": [
        "ICT",
        "IGCSE Computer",
        "Edexcel Applied ICT",
        "IB Computer",
        "AP Computer",
        "Edexcel ICT",
    ],
    "Social Studies": ["General Knowledge"],
    "Basic Technology": ["Technology"],
    "Agricultural Science": ["Agric. Science"],
    "General Mathematics": [
        "JSS Math",
        "SSS Math",
        "Checkpoint Math",
        "13+ Math",
        "IGCSE Math",
        "Edexcel Math",
        "IB Math",
    ],
    "Physics": [
        "Physics",
        "IB Physics",
        "IGCSE Physics",
        "Edexcel Physics",
        "SAT Physics",
        "AP Physics",
        "ACT Science",
    ],
    "Chemistry": [
        "Chemistry",
        "IB Chemistry",
        "IGCSE Chemistry",
        "Edexcel Chemistry",
        "SAT Chemistry",
        "AP Chemistry",
        "ACT Science",
    ],
    "Biology": [
        "Biology",
        "IB Biology",
        "IGCSE Biology",
        "Edexcel Biology",
        "SAT Biology",
        "ACT Science",
    ],
    "Technical Drawing": ["Technical Drawing"],
    "Commerce": ["Commerce"],
    "Government": ["Government"],
    "Economics": ["Economics", "IB Economics", "Edexcel Economics", "IGCSE Business"],
    "Further Mathematics": [
        "F/Math",
        "SAT Math I",
        "SAT Math II",
        "AP Calculus",
        "AP Statistics",
    ],
    "Principles of Accounting": ["Accounting", "Edexcel Accounting"],
    "Literature in English": [
        "Literature",
        "IGCSE Literature",
        "Edexcel English Literature",
        "SAT Literature",
        "AP Literature",
        "Edexcel Literature",
    ],
    "TOEFL": ["TOEFL"],
    "IELTS": ["IELTS"],
    "SAT Math": ["SAT Math", "ACT Math"],
    "SAT Reading": ["SAT Reading", "ACT English", "ACT Reading"],
    "SAT Writing": ["SAT Writing", "ACT Writing"],
    # "PTE",
    "Arabic Language": ["Arabic Language", "Edexcel Arabic Language", "Edexcel Arabic"],
    "Business Studies": [
        "Business Studies",
        "Edexcel Business Studies",
        "Edexcel Business",
    ],
    "World History": ["SAT U.S. History", "SAT History", "AP U.S. History"],
    "Chinese Language": ["SAT Chinese", "Chinese Language", "AP Chinese"],
    "Music Theory": ["AP Music"],
}
subjects = [
    {
        "subjects": ("Literacy & Numeracy", "Phonics", "Handwriting"),
        "name": "Nursery",
        "id": "nursery",
        "class_of_child": ["Preschool" "Nursery 1", "Nursery 2"],
    },
    {
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
    {"name": "JSS", "id": "jss", "class_of_child": ["JSS 1", "JSS 2", "JSS 3"]},
    {
        "subjects": (),
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
    "Preschool",
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
            if (
                list(y.keys())[0] != list(z.keys())[0]
                and list(y.values())[0] == list(z.values())[0]
            ):
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


def create_requests_from_response(splitRequests, main_request, base_request):
    lesson_schedule = (main_request.get("lessonDetails") or {}).get("lessonSchedule")

    for jj, rq in enumerate(splitRequests):
        v = copy.copy(base_request)
        v.is_split = True
        v.pk = None
        v.valid_request = True
        v.slug = BaseRequestTutor.generate_slug()
        v.status = BaseRequestTutor.ISSUED
        v.request_subjects = rq["subjectGroup"]
        v.classes = rq["class"]
        v.no_of_students = len(rq["names"])
        v.expectation = construct_expectation(rq, lesson_schedule.get("lessonPlan"))
        v.request_info["names"] = rq[
            "names"
        ]  # names exists outside of the request object
        v.request_info["tutor_info_index"] = jj
        v.related_request = base_request
        v.save()


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
    """Splits the days between the tutors based on the subjects they teach."""
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


def parse_child_detail(single_child):
    class_details = single_child["classDetail"]
    special_needs = single_child["special_needs"]
    s_string = f"specialNeeds: {special_needs}\n " if special_needs else ""
    return (
        f"class: {class_details['class']}\n name: {single_child['firstName']}\n gender: {single_child['gender']}\n {s_string}"
        f"goal: {class_details['purpose']}\n expectation: {single_child['expectation']}\n"
    )


def construct_expectation(sampleSplit, lessonPlan=""):
    premium = " PREMIUM TUTOR REQUEST\n" if lessonPlan.lower() == "premium" else ""
    teacher_options = sampleSplit["teacherOption"]
    child_details = "\n ".join(
        [parse_child_detail(x) for x in sampleSplit["forTeacher"]]
    )
    learning_need = sampleSplit.get("learningNeed") or []
    learning_need = ", ".join(
        [x for x in learning_need if x not in [None, "", "null", "undefined"]]
    )

    return f"TeacherOption: {teacher_options}\n{premium} {child_details}\nLearning Needs:{learning_need}"


def update_schedule_info(request: BaseRequestTutor, lessonSchedule, split_data=None):
    available_days = (
        split_data["lessonDays"]
        if split_data
        else lessonSchedule.get("lessonDays") or []
    )
    newSchedule = split_data or {}
    hours_per_day = (
        newSchedule.get("lessonHours") or lessonSchedule.get("lessonHours") or 1
    )
    days_per_week = newSchedule.get("lessonDuration") or lessonSchedule.get(
        "lessonDuration"
    )
    time_of_lesson = newSchedule.get("lessonTime") or lessonSchedule.get("lessonTime")
    request.available_days = available_days
    request.hours_per_day = hours_per_day
    request.days_per_week = days_per_week
    request.time_of_lesson = time_of_lesson


def clean_value(string: str):
    split_first = string.split("_")
    if len(split_first) > 1:
        r = split_first[0]
        try:
            jj = int(r)
        except ValueError as e:
            jj = 1
        return r
    return 1


def parse_subjects(request_subjects):
    keys = list(mapping.values())
    cleaned = []
    for key, value in mapping.items():
        lowered = [x.lower() for x in value]
        current = [x.lower() for x in request_subjects]
        if set(lowered).intersection(current):
            cleaned.append(key)
    return cleaned
