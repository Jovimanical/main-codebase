from courses.services import to_places
from users.models.models1 import User
import json
from django.http.response import HttpResponse
from courses.models import CourseUser
import pytest
from django.test import Client


def test_fetch_course_user(client: Client):
    # a course user is and instance of the course class that hasn't been paid for yet.
    pass


@pytest.fixture
def json_post(client: Client):
    def _json_post(url, data) -> HttpResponse:
        return client.post(url, json.dumps(data), content_type="application/json")

    return _json_post


@pytest.fixture
def create_sample_user(json_post):
    def _create_sample_user(data, create_user=False):
        xx = json_post("/course-flow/initialize", data)
        if create_user:
            personalInfo = data["personalInfo"]
            u = User.objects.create(
                email=personalInfo["email"],
                first_name=personalInfo["firstName"],
                last_name=personalInfo["lastName"],
            )
            connect = CourseUser.objects.get(email=personalInfo["email"])
            connect.user = u
            connect.save()
        return xx

    return _create_sample_user


@pytest.fixture
def build_json_post_response(json_post):
    def build_response(
        post_data, status, callback, assertion, url="/course-flow/initialize"
    ):
        response = json_post(url, post_data)
        assert response.status_code == status
        result = response.json()
        if callback:
            callback(assertion)
        assert result == assertion

    return build_response


COURSE_SAMPLE_DATA = {
    "firstName": "James",
    "lastName": "Novak",
    "phone": "2347032230023",
    "country": "Nigeria",
    "state": "Lagos",
    "email": "james@example.com",
    "medium": "",
}


@pytest.mark.django_db
def test_create_new_course_user(json_post, build_json_post_response):
    # only one instance of an unpaid user can exist at any point in time.
    data = {**COURSE_SAMPLE_DATA}
    post_data = {
        "personalInfo": data,
        "plan": {"type": "Bundle 1", "amount": 40000, "details": {}},
        "exam": "ielts",
    }

    assert CourseUser.objects.filter(email=data["email"]).count() == 0

    def callback(result):
        instance: CourseUser = CourseUser.objects.first()
        assert instance.country == data["country"]
        assert instance.state == data["state"]
        assert instance.full_name == f"{data['firstName']} {data['lastName']}"
        assert instance.amount == post_data["plan"]["amount"]
        assert instance.where_you_heard == data["medium"]
        assert instance.exam == post_data["exam"]
        assert instance.user is None
        assert instance.status == CourseUser.UNPAID
        result["data"]["slug"] = instance.slug
        result["data"]["personalInfo"]["referral_credit"] = instance.referral_credit
        result["data"]["paymentInfo"] = {
            "status": instance.get_status_display(),
            "amount": instance.amount,
            "amount_paid": instance.amount_paid,
            "discount": instance.discount,
        }

    build_json_post_response(
        post_data,
        200,
        callback,
        {
            "status": True,
            "data": {
                "personalInfo": {
                    "email": data["email"],
                    "firstName": data["firstName"],
                    "lastName": data["lastName"],
                    "phone": data["phone"],
                    "state": data["state"],
                    "country": data["country"],
                    "medium": data["medium"],
                },
                "plan": post_data["plan"],
            },
        },
    )


@pytest.mark.django_db
def test_create_course_user_from_existing_course(
    build_json_post_response, create_sample_user
):
    assert CourseUser.objects.count() == 0
    data = {**COURSE_SAMPLE_DATA}
    post_data = {
        "personalInfo": data,
        "plan": {"type": "Bundle 1", "amount": 40000, "details": {}},
        "exam": "ielts",
    }
    create_sample_user(post_data)
    assert CourseUser.objects.count() == 1
    instance: CourseUser = CourseUser.objects.first()
    assert instance.course_info == {"info": post_data}
    new_plan = {"type": "Bundle 3", "amount": 30000, "details": {}}

    def callback(result):
        assert CourseUser.objects.count() == 1
        instance: CourseUser = CourseUser.objects.first()
        assert instance.country == data["country"]
        assert instance.state == data["state"]
        assert instance.full_name == f"{data['firstName']} {data['lastName']}"
        assert instance.amount == 30000
        # assert instance.course_info == {"info": {**post_data, "plan": new_plan}}
        result["data"]["slug"] = instance.slug
        assert instance.status == CourseUser.UNPAID
        result["data"]["paymentInfo"] = {
            "status": instance.get_status_display(),
            "amount": instance.amount,
            "amount_paid": instance.amount_paid,
            "discount": instance.discount,
        }

    build_json_post_response(
        {**post_data, "plan": {**new_plan}},
        200,
        callback,
        {
            "status": True,
            "data": {
                "personalInfo": {
                    "email": data["email"],
                    "firstName": data["firstName"],
                    "lastName": data["lastName"],
                    "phone": data["phone"],
                    "state": data["state"],
                    "country": data["country"],
                    "medium": data["medium"],
                    "referral_credit": 0,
                },
                "plan": new_plan,
            },
        },
    )


@pytest.mark.django_db
def test_login_existing_user(create_sample_user, json_post, mocker):
    mocked_random = mocker.patch("courses.services.get_random_string")
    data = {**COURSE_SAMPLE_DATA}
    post_data = {
        "personalInfo": data,
        "plan": {"type": "Bundle 1", "amount": 40000, "details": {}},
        "exam": "ielts",
    }
    create_sample_user(post_data)
    # when course user doesn't have a user account and does not exists
    response = json_post("/course-flow/login", {"email": "james4@example.com"})
    assert response.status_code == 400
    assert response.json() == {
        "status": False,
        "errors": {"msg": "Could not find user"},
    }
    # when course user exists but no user account
    mocked_random.return_value = "AjcDw"
    response = json_post("/course-flow/login", {"email": "james@example.com"})
    assert response.status_code == 200
    course_instance: CourseUser = CourseUser.objects.first()
    assert course_instance.login_code == "AjcDw"
    assert response.json() == {
        "status": True,
        "data": {"code": "AjcDw", "email": "james@example.com"},
    }
    ## verifying the code sent to the email.
    response = json_post(
        "/course-flow/authenticate", {"email": "james@example.com", "code": "acdef"}
    )
    assert response.status_code == 400
    assert response.json() == {"status": False, "errors": {"msg": "Invalid code"}}
    response = json_post(
        "/course-flow/authenticate", {"email": "james@example.com", "code": "AjcDw"}
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "personalInfo": {
                "email": course_instance.email,
                "firstName": course_instance.first_name,
                "lastName": course_instance.last_name,
                "phone": str(course_instance.phone).replace("+", ""),
                "state": course_instance.state,
                "country": course_instance.country,
                "medium": "",
                "referral_credit": course_instance.referral_credit,
            },
            "courses": [
                {
                    "exam": "ielts",
                    "slug": course_instance.slug,
                    "plan": course_instance.plan,
                    "paymentInfo": {
                        "status": course_instance.get_status_display(),
                        "amount": to_places(course_instance.amount),
                        "amount_paid": to_places(course_instance.amount_paid),
                        "discount": course_instance.discount,
                    },
                }
            ],
            "referrers": [],
            "url": "",
        },
    }
    # when the user has made payment and has a user account.
    user = User.objects.create(
        email=course_instance.email,
        first_name=course_instance.first_name,
        last_name=course_instance.last_name,
    )
    course_instance.user = user
    course_instance.save()
    mocked_random.return_value = "oXUvy"
    response = json_post("/course-flow/login", {"email": "james@example.com"})
    assert response.status_code == 200
    assert (
        User.objects.filter(email=course_instance.email).first().login_code == "oXUvy"
    )
    response = json_post(
        "/course-flow/authenticate", {"email": "james@example.com", "code": "oXUvy"}
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "personalInfo": {
                "email": course_instance.email,
                "firstName": course_instance.first_name,
                "lastName": course_instance.last_name,
                "phone": str(course_instance.phone).replace("+", ""),
                "state": course_instance.state,
                "medium": "",
                "country": course_instance.country,
                "referral_credit": course_instance.referral_credit,
            },
            "courses": [
                {
                    "exam": "ielts",
                    "slug": course_instance.slug,
                    "plan": course_instance.plan,
                    "paymentInfo": {
                        "status": course_instance.get_status_display(),
                        "amount": to_places(course_instance.amount),
                        "amount_paid": to_places(course_instance.amount_paid),
                        "discount": course_instance.discount,
                    },
                }
            ],
            "referrers": [],
            "url": "",
        },
    }


@pytest.mark.django_db
def test_update_course_payment_info(json_post, create_sample_user):
    data = {**COURSE_SAMPLE_DATA}
    post_data = {
        "personalInfo": data,
        "plan": {"type": "Bundle 1", "amount": 40000, "details": {}},
        "exam": "ielts",
    }
    create_sample_user(post_data)
    course_user: CourseUser = CourseUser.objects.first()
    assert course_user.user is None
    assert len(course_user.additional_users) == 0
    response = json_post(
        "/course-flow/update",
        {
            "slug": course_user.slug,
            "additional_users": [
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john@example.com",
                    "plan": {"type": "Bundle 2", "amount": 35000, "details": {}},
                }
            ],
            "amount": 75000,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "slug": course_user.slug,
            "personalInfo": {
                "email": data["email"],
                "firstName": data["firstName"],
                "lastName": data["lastName"],
                "phone": data["phone"],
                "state": data["state"],
                "country": data["country"],
                "medium": data["medium"],
                "referral_credit": 0,
            },
            "courses": [
                {
                    "slug": course_user.slug,
                    "plan": course_user.plan,
                    "paymentInfo": {
                        "status": course_user.get_status_display(),
                        "amount": to_places(course_user.amount),
                        "amount_paid": to_places(course_user.amount_paid),
                        "discount": course_user.discount,
                    },
                }
            ],
            "url": "",
            "referrers": [
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john@example.com",
                    "plan": {"type": "Bundle 2", "amount": 35000, "details": {}},
                }
            ],
        },
    }
    # account for the actual action that happens on the model
    course_user: CourseUser = CourseUser.objects.filter(pk=course_user.pk).first()

    assert len(course_user.additional_users) == 1
    assert course_user.user_referred.count() == 0

    # when course_user makes payment
    response = json_post(
        "/course-flow/update",
        {
            "slug": course_user.slug,
            "paymentInfo": {
                "amount_paid": 75000,
                "payment_medium": "online",
                "amount": 75000,
            },
        },
    )
    # refetch user
    course_user: CourseUser = CourseUser.objects.get(pk=course_user.pk)
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "slug": course_user.slug,
            "url": "",
            "courses": [
                {
                    "slug": course_user.slug,
                    "plan": course_user.plan,
                    "paymentInfo": {
                        "status": course_user.get_status_display(),
                        "amount": to_places(course_user.amount),
                        "amount_paid": to_places(course_user.amount_paid),
                        "discount": course_user.discount,
                    },
                }
            ],
            "referrers": [
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john@example.com",
                    "plan": {"type": "Bundle 2", "amount": 35000, "details": {}},
                }
            ],
            "personalInfo": {
                "email": data["email"],
                "firstName": data["firstName"],
                "lastName": data["lastName"],
                "phone": data["phone"],
                "state": data["state"],
                "country": data["country"],
                "medium": data["medium"],
                "referral_credit": 0,
            },
        },
    }
    course_user: CourseUser = CourseUser.objects.filter(pk=course_user.pk).first()
    assert course_user.status == CourseUser.PAID
    assert course_user.user_referred.count() == 1
    assert CourseUser.objects.count() == 2
    referred_user: CourseUser = course_user.user_referred.first()
    assert referred_user.status == CourseUser.PAID
    assert referred_user.first_name == "John"
    assert referred_user.last_name == "Doe"
    assert referred_user.email == "john@example.com"
    assert referred_user.plan == {"type": "Bundle 2", "amount": 35000, "details": {}}
    # when updating the backend with thinkific info. should only update a paid record
    response = json_post(
        "/course-flow/update",
        {
            "slug": course_user.slug,
            "thinkific": [
                {"email": "james@example.com", "id": 1023232},
                {"email": "john@example.com", "id": 7323242},
            ],
        },
    )
    assert response.status_code == 200
    referred_user: CourseUser = course_user.user_referred.first()
    assert referred_user.user.thinkific_user_id == 7323242
    assert referred_user.referrer_email == "james@example.com"
    assert referred_user.email != referred_user.referrer_email
    assert referred_user.payer_email == "james@example.com"
    # referral credit implementation not done yet.
    assert response.json() == {
        "status": True,
        "data": {
            "slug": course_user.slug,
            "personalInfo": {
                "email": data["email"],
                "firstName": data["firstName"],
                "lastName": data["lastName"],
                "phone": data["phone"],
                "state": data["state"],
                "country": data["country"],
                "medium": data["medium"],
                "referral_credit": 0,
            },
            "url": "https://courses.tuteria.com/users/sign_in?q=ZW1haWw9amFtZXNAZXhhbXBsZS5jb20mcGFzc3dvcmQ9dGhpc2lzYWNvbXBsaWNhdGVkcGFzczIzNzIzMg==",
            "courses": [
                {
                    "slug": course_user.slug,
                    "plan": course_user.plan,
                    "paymentInfo": {
                        "status": course_user.get_status_display(),
                        "amount": to_places(course_user.amount),
                        "amount_paid": to_places(course_user.amount_paid),
                        "discount": course_user.discount,
                    },
                }
            ],
            "referrers": [
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john@example.com",
                    "plan": {"type": "Bundle 2", "amount": 35000, "details": {}},
                }
            ],
        },
    }


@pytest.mark.django_db
def test_with_referral_code(json_post, create_sample_user):
    data = {**COURSE_SAMPLE_DATA}
    post_data = {
        "personalInfo": data,
        "plan": {"type": "Bundle 1", "amount": 40000, "details": {}},
        "exam": "ielts",
    }
    create_sample_user(post_data, True)
    # create second user that was referred by the first user
    new_data = {
        **COURSE_SAMPLE_DATA,
        "email": "danny@example.com",
        "phone": "2348033002233",
    }
    post_data = {
        "personalInfo": new_data,
        "plan": {"type": "Bundle 1", "amount": 40000, "details": {}},
        "exam": "ielts",
    }
    create_sample_user(post_data)
    assert CourseUser.objects.count() == 2
    danny_user: CourseUser = CourseUser.objects.get(email="danny@example.com")
    response = json_post(
        "/course-flow/update",
        {"slug": danny_user.slug, "referral": {"code": data["phone"], "discount": 500}},
    )
    assert response.status_code == 200
    danny_user: CourseUser = CourseUser.objects.get(email="danny@example.com")
    parent_user: CourseUser = CourseUser.objects.get(email="james@example.com")
    assert parent_user.referral_credit == 500
    assert response.json() == {
        "status": True,
        "data": {
            "slug": danny_user.slug,
            "personalInfo": {
                "email": new_data["email"],
                "firstName": new_data["firstName"],
                "lastName": new_data["lastName"],
                "phone": new_data["phone"],
                "state": new_data["state"],
                "country": new_data["country"],
                "medium": new_data["medium"],
                "referral_credit": 0,
            },
            "courses": [
                {
                    "slug": danny_user.slug,
                    "plan": danny_user.plan,
                    "paymentInfo": {
                        "status": danny_user.get_status_display(),
                        "amount": to_places(39500),
                        "amount_paid": to_places(danny_user.amount_paid),
                        "discount": 500,
                    },
                }
            ],
            "url": "",
            "referrers": [],
        },
    }
