import pytest
import datetime
import json
from django.test import Client
from users.models import User, Location, PhoneNumber, UserIdentification, UserProfile
from external.models import BaseRequestTutor
from external.services import SingleRequestService
from django.core.signing import b64_encode
from registration.models import Education, WorkExperience


@pytest.mark.django_db
def test_group_login_from_existing_request(client: Client, create_admin):
    base_request = BaseRequestTutor.objects.create(
        email="james@example.com",
        first_name="aloiba",
        last_name="olodo",
        number="+2347035209976",
        home_address="",
        state="Lagos",
        country="NG",
        slug="ABDCDESFESF",
    )
    # create user record
    instance = SingleRequestService(base_request.slug)
    user, password = instance.create_user_instance_in_form()
    # try login in with user created this way.
    response = client.post(
        "/new-flow/login",
        json.dumps(
            {
                "email": user.email,
                "password": f"{user.first_name.lower()}{user.last_name.lower()}",
            }
        ),
        "application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "personal_info": {
                "email": "james@example.com",
                "first_name": "aloiba",
                "last_name": "olodo",
            },
            "profile_info": {"phone": "+2347035209976", "preferredComms": {}},
            "location": {"country": "Nigeria", "state": "Lagos"},
        },
    }
    admin = create_admin()
    # loggin in as an admin on behalf of a user.
    response = client.post(
        "/new-flow/login",
        json.dumps(
            {
                "email": user.email,
                # "password": f"{user.first_name.lower()}{user.last_name.lower()}",
            }
        ),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "personal_info": {
                "email": "james@example.com",
                "first_name": "aloiba",
                "last_name": "olodo",
            },
            "profile_info": {"phone": "+2347035209976", "preferredComms": {}},
            "location": {"country": "Nigeria", "state": "Lagos"},
        },
    }



@pytest.mark.django_db
def test_group_lesson_login(client: Client, create_user):
    response = client.post(
        "/new-flow/login",
        json.dumps({"email": "james@example.com", "password": "password101"}),
        "application/json",
    )
    assert response.status_code == 400
    assert response.json() == {"status": False, "errors": "Invalid email or password"}
    sample_user = create_user()
    response = client.post(
        "/new-flow/login",
        json.dumps({"email": "james@example.com", "password": "password101"}),
        "application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "personal_info": {
                "email": "james@example.com",
                "first_name": "GB",
                "last_name": "shola",
            },
            "profile_info": {"phone": None, "preferredComms": {}},
            "location": {"country": "Nigeria", "state": None},
        },
    }
    # with location and phone number
    PhoneNumber.objects.create(
        owner=sample_user, number="+23470358823323", primary=True
    )
    Location.objects.create(state="Lagos", address="", user=sample_user)
    response = client.post(
        "/new-flow/login",
        json.dumps({"email": "james@example.com", "password": "password101"}),
        "application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "personal_info": {
                "email": "james@example.com",
                "first_name": "GB",
                "last_name": "shola",
            },
            "profile_info": {"phone": "+23470358823323", "preferredComms": {}},
            "location": {"country": "Nigeria", "state": "Lagos"},
        },
    }


@pytest.mark.django_db
def test_reset_password(client: Client, create_user, mocker):
    mock_mail = mocker.patch("external.new_group_flow.views.magic_link_password.delay")
    sample_user = create_user()
    # when email exists, sends the email.
    response = client.post(
        "/new-flow/reset-password",
        json.dumps(
            {"email": sample_user.email, "callback_url": "http://www.google.com"}
        ),
        "application/json",
    )
    assert response.status_code == 200
    assert response.json() == {"status": True, "msg": "Password sent to email"}
    # get request also works
    response = client.get(
        "/new-flow/reset-password",
        {"email": sample_user.email, "callback_url": "http://www.google.com"},
    )
    assert response.status_code == 200
    assert response.json() == {"status": True, "msg": "Password sent to email"}
    mock_mail.assert_called_with(
        sample_user.email,
        "http://testserver/new-flow/magic-link?callback_url={}&hash={}".format(
            "http://www.google.com",
            b64_encode(sample_user.email.encode()).decode("utf-8"),
        ),
    )
    # when email does not exist
    response = client.get("/new-flow/reset-password", {"email": "doe@example.com"})
    assert response.status_code == 400
    assert response.json() == {
        "status": False,
        "errors": {"email": ["The e-mail address is not assigned to any user account"]},
    }


def assert_request_user(base_request, password="password101", no_skip=True):
    user = base_request.user
    location = user.home_address
    # check user properties
    if no_skip:
        assert user.check_password(password)
    assert user.first_name == "Godwin"
    assert user.last_name == "Benson"
    assert user.email == "busybenson@example.com"
    assert str(user.primary_phone_no.number) == "+2347035209976"
    assert location.address == "20 Agede Street"
    assert location.state == "Lagos"
    assert location.vicinity == "Agungi"
    # assert location.region == "Lekki"
    assert user.country.name == "Nigeria"


def assert_request_fields(request, sample_obj, callback=lambda: None):
    assert request.email == "busybenson@example.com"
    assert request.no_of_students == 1
    assert request.first_name == "Godwin"
    assert request.last_name == "Benson"
    assert str(request.number) == "+2347035209976"
    assert request.state == "Lagos"
    # assert request.region == "Lekki"
    # assert request.vicinity == "Agungi"
    assert request.where_you_heard == "18"
    assert not request.is_parent_request
    assert request.request_subjects == ["IELTS"]
    assert request.status == BaseRequestTutor.PENDING
    assert request.country.name == "Nigeria"
    assert request.request_info == sample_obj
    assert request.request_type == 5
    assert request.budget == 40000
    callback()


@pytest.fixture
def g_sheet_mocker(mocker):
    g_sheet = mocker.patch(
        "external.new_group_flow.services.GoogleSheetHelper.get_summary_info"
    )
    g_sheet.return_value = {"summary": {"venue": "Agungi", "is_online": True}}
    return g_sheet


def logic_housing_new_request(sample_obj, client):
    # when the user didn't exist before
    response = client.post(
        "/new-flow/initialize-request", json.dumps(sample_obj), "application/json"
    )
    request = BaseRequestTutor.objects.filter(email="busybenson@example.com").first()
    # request = BaseRequestTutor.objects.filter(email="busybenson@example.com").last()
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "classSelected": "YorubaClass2",
            "bookingID": request.slug,
            "status": "pending",
            "registrationInfo": {
                "venue": "offline",
                "students": [],
                "children": [],
                "upsell": {},
                "medium": "From a friend",
                "paymentMethod": "",
                "paymentOption": "",
            },
        },
    }
    # check user properties
    assert_request_user(request, "password101", False)
    # check request properties
    assert_request_fields(
        request,
        {
            **sample_obj,
            "admin_info": {
                "payment_info": {},
                "summary": {"is_online": True, "venue": "Agungi"},
            },
        },
    )


@pytest.mark.django_db
def test_create_completed_request_booking_record(
    client: Client, class_info, request_info, create_admin, mocker, g_sheet_mocker,create_agent
):
    create_agent()
    # when the user didn't exist before
    sample_obj = {
        "personalInfo": {
            "firstName": "Godwin",
            "lastName": "Benson",
            "email": "busybenson@example.com",
            "phone": "2347035209976",
            "preferredComms": {"channel": "whatsapp", "number": "2347035209976"},
            "address": "20 Agede Street",
            "vicinity": "Agungi",
            "region": "Lekki",
            "state": "Lagos",
            "country": "NG",
        },
        "classInfo": class_info("course11", "YorubaClass2"),
        "requestInfo": request_info(),
    }
    response = client.post(
        "/new-flow/initialize-request", json.dumps(sample_obj), "application/json"
    )
    request = BaseRequestTutor.objects.filter(email="busybenson@example.com").first()
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "classSelected": "YorubaClass2",
            "bookingID": request.slug,
            "status": "pending",
            "registrationInfo": {
                "venue": "offline",
                "students": [],
                "children": [],
                "upsell": {},
                "medium": "From a friend",
                "paymentMethod": "",
                "paymentOption": "",
            },
        },
    }
    # check user properties
    assert_request_user(request, "password101", False)
    # check request properties
    assert_request_fields(
        request,
        {
            **sample_obj,
            "admin_info": {
                "payment_info": {},
                "summary": {"is_online": True, "venue": "Agungi"},
            },
        },
    )
    # when the user previously exists but did not have any pending request matching one passed
    # admin credentials needs to be supplied to let this request pass
    new_sample_obj = sample_obj = {
        "email": "busybenson@example.com",
        "classInfo": class_info("course22", "YorubaClass27"),
        "requestInfo": request_info(),
    }
    # without admin credentials
    # create admin user
    admin = create_admin()
    response = client.post(
        "/new-flow/initialize-request", json.dumps(new_sample_obj), "application/json"
    )
    assert response.status_code == 403
    # with credentials
    response = client.post(
        "/new-flow/initialize-request",
        json.dumps(new_sample_obj),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    assert BaseRequestTutor.objects.filter(email="busybenson@example.com").count() == 2
    last_instance = BaseRequestTutor.objects.last()
    assert response.json() == {
        "status": True,
        "data": {
            "classSelected": "YorubaClass27",
            "bookingID": last_instance.slug,
            "status": "pending",
            "registrationInfo": {
                "venue": "offline",
                "students": [],
                "children": [],
                "upsell": {},
                "medium": "From a friend",
                "paymentMethod": "",
                "paymentOption": "",
            },
        },
    }
    assert_request_user(last_instance, no_skip=False)

    def callback():
        assert last_instance.user.email == "busybenson@example.com"
        assert (
            last_instance.request_info["classInfo"]["classSelected"] == "YorubaClass27"
        )

    # check request properties
    nj = {
        **new_sample_obj,
        # "status":"pending",
        "admin_info": {
            "payment_info": {},
            "summary": {"is_online": True, "venue": "Agungi"},
        },
    }
    nj.pop("email")
    assert_request_fields(last_instance, nj, callback)

    # when the user previously exists but had a previous courseID matching the one passed.
    third_obj = {
        "email": "busybenson@example.com",
        "classInfo": class_info("course22", "YorubaClass29"),
        "requestInfo": request_info(venue="online"),
    }
    response = client.post(
        "/new-flow/initialize-request",
        json.dumps(third_obj),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    assert BaseRequestTutor.objects.filter(email="busybenson@example.com").count() == 2
    last_instance = BaseRequestTutor.objects.last()
    assert response.json() == {
        "status": True,
        "data": {
            "classSelected": "YorubaClass29",
            "bookingID": last_instance.slug,
            "status": "pending",
            "registrationInfo": {
                "venue": "online",
                "students": [],
                "children": [],
                "upsell": {},
                "medium": "From a friend",
                "paymentMethod": "",
                "paymentOption": "",
            },
        },
    }
    assert_request_user(last_instance, no_skip=False)

    def callback():
        assert last_instance.user.email == "busybenson@example.com"
        assert last_instance.request_info["requestInfo"]["venue"] == "online"

    nj = {
        **third_obj,
        "admin_info": {
            "payment_info": {},
            "summary": {"is_online": True, "venue": "Agungi"},
        },
    }
    nj.pop("email")
    assert_request_fields(last_instance, nj, callback)
    # without password should just work well if all request data is passed
    sample_obj_7 = {
        "personalInfo": {
            "firstName": "Godwin",
            "lastName": "Benson",
            "email": "busybenson@example.com",
            "phone": "2347035209976",
            "preferredComms": {"channel": "whatsapp", "number": "2347035209976"},
            "address": "20 Agede Street",
            "vicinity": "Agungi",
            "region": "Lekki",
            "state": "Lagos",
            "country": "NG",
        },
        "classInfo": class_info("course11", "YorubaClass2"),
        "requestInfo": request_info(),
    }
    logic_housing_new_request(sample_obj_7, client)
    # when user exists but personalInfo is still passed, request should be marked as issues and and error displayed.
    mock_email = mocker.patch(
        "external.new_group_flow.services.magic_link_password.delay"
    )
    sample_obj = {
        "personalInfo": {
            "firstName": "Godwin",
            "lastName": "Benson",
            "email": "busybenson@example.com",
            "phone": "2347035209976",
            "preferredComms": {"channel": "whatsapp", "number": "2347035209976"},
            "address": "20 Agede Street",
            "vicinity": "Agungi",
            "region": "Lekki",
            "state": "Lagos",
            "country": "NG",
            "password": "password101",
        },
        "classInfo": class_info("course21", "YorubaClass33"),
        "requestInfo": request_info(),
        "redirect_url": "http://google.com",
    }
    response = client.post(
        "/new-flow/initialize-request", json.dumps(sample_obj), "application/json"
    )
    assert response.status_code == 400
    assert response.json() == {
        "status": False,
        "errors": {
            "msg": f"An account with busybenson@example.com already exists. An email has been sent to log in."
        },
    }
    assert BaseRequestTutor.objects.count() == 3
    # assert BaseRequestTutor.objects.count() == 4
    ist = BaseRequestTutor.objects.filter(status=BaseRequestTutor.ISSUED).last()
    mock_email.assert_called_with(
        "busybenson@example.com",
        "http://testserver/new-flow/magic-link?callback_url={}&slug={}&hash={}".format(
            "http://google.com",
            ist.slug,
            b64_encode("busybenson@example.com".encode()).decode("utf-8"),
        ),
    )
    # when the user previously exists and has similar subject but different group course
    # fourth_obj = {
    #     "email": "busybenson@example.com",
    #     "classInfo": class_info("course22","YorubaClass29"),
    #     "requestInfo": request_info(venue="online"),
    # }


# @pytest.mark.django_db
# def test_create_completed_request_booking_record(
#     client: Client, class_info, request_info, create_admin, mocker, g_sheet_mocker
# ):

#     # when the user didn't exist before
#     sample_obj = {
#         "personalInfo": {
#             "firstName": "Godwin",
#             "lastName": "Benson",
#             "email": "busybenson@example.com",
#             "phone": "2347035209976",
#             "preferredComms": {"channel": "whatsapp", "number": "2347035209976"},
#             "address": "20 Agede Street",
#             "vicinity": "Agungi",
#             "region": "Lekki",
#             "state": "Lagos",
#             "country": "NG",
#             "password": "password101",
#         },
#         "classInfo": class_info("course11", "YorubaClass2"),
#         "requestInfo": request_info(),
#     }
#     response = client.post(
#         "/new-flow/initialize-request", json.dumps(sample_obj), "application/json"
#     )
#     request = BaseRequestTutor.objects.filter(email="busybenson@example.com").first()
#     assert response.status_code == 200
#     assert response.json() == {
#         "status": True,
#         "data": {
#             "classSelected": "YorubaClass2",
#             "bookingID": request.slug,
#             "status": "pending",
#             "registrationInfo": {
#                 "venue": "offline",
#                 "students": [],
#                 "children": [],
#                 "upsell": {},
#                 "medium": "From a friend",
#                 "paymentMethod": "",
#                 "paymentOption": "",
#             },
#         },
#     }
#     # check user properties
#     assert_request_user(request, "password101")
#     # check request properties
#     assert_request_fields(
#         request, {**sample_obj, "admin_info": {"payment_info": {}, "summary": {"is_online":True, "venue":"Agungi"}}}
#     )

#     # when the user previously exists but did not have any pending request matching one passed
#     # admin credentials needs to be supplied to let this request pass
#     new_sample_obj = sample_obj = {
#         "email": "busybenson@example.com",
#         "classInfo": class_info("course22", "YorubaClass27"),
#         "requestInfo": request_info(),
#     }
#     # without admin credentials
#     # create admin user
#     admin = create_admin()
#     response = client.post(
#         "/new-flow/initialize-request", json.dumps(new_sample_obj), "application/json"
#     )
#     assert response.status_code == 403
#     # with credentials
#     response = client.post(
#         "/new-flow/initialize-request",
#         json.dumps(new_sample_obj),
#         "application/json",
#         HTTP_ADMIN_EMAIL=admin.email,
#         HTTP_ADMIN_PASSWORD="password101",
#     )
#     assert response.status_code == 200
#     assert BaseRequestTutor.objects.filter(email="busybenson@example.com").count() == 2
#     last_instance = BaseRequestTutor.objects.last()
#     assert response.json() == {
#         "status": True,
#         "data": {
#             "classSelected": "YorubaClass27",
#             "bookingID": last_instance.slug,
#             "status": "pending",
#             "registrationInfo": {
#                 "venue": "offline",
#                 "students": [],
#                 "children": [],
#                 "upsell": {},
#                 "medium": "From a friend",
#                 "paymentMethod": "",
#                 "paymentOption": "",
#             },
#         },
#     }
#     assert_request_user(last_instance)

#     def callback():
#         assert last_instance.user.email == "busybenson@example.com"
#         assert (
#             last_instance.request_info["classInfo"]["classSelected"] == "YorubaClass27"
#         )

#     # check request properties
#     nj = {
#         **new_sample_obj,
#         # "status":"pending",
#         "admin_info": {
#             "payment_info": {},
#             "summary": {"is_online": True, "venue": "Agungi"},
#         },
#     }
#     nj.pop("email")
#     assert_request_fields(last_instance, nj, callback)

#     # when the user previously exists but had a previous courseID matching the one passed.
#     third_obj = {
#         "email": "busybenson@example.com",
#         "classInfo": class_info("course22", "YorubaClass29"),
#         "requestInfo": request_info(venue="online"),
#     }
#     response = client.post(
#         "/new-flow/initialize-request",
#         json.dumps(third_obj),
#         "application/json",
#         HTTP_ADMIN_EMAIL=admin.email,
#         HTTP_ADMIN_PASSWORD="password101",
#     )
#     assert response.status_code == 200
#     assert BaseRequestTutor.objects.filter(email="busybenson@example.com").count() == 2
#     last_instance = BaseRequestTutor.objects.last()
#     assert response.json() == {
#         "status": True,
#         "data": {
#             "classSelected": "YorubaClass29",
#             "bookingID": last_instance.slug,
#             "status": "pending",
#             "registrationInfo": {
#                 "venue": "online",
#                 "students": [],
#                 "children": [],
#                 "upsell": {},
#                 "medium": "From a friend",
#                 "paymentMethod": "",
#                 "paymentOption": "",
#             },
#         },
#     }
#     assert_request_user(last_instance)

#     def callback():
#         assert last_instance.user.email == "busybenson@example.com"
#         assert last_instance.request_info["requestInfo"]["venue"] == "online"

#     nj = {
#         **third_obj,
#         "admin_info": {
#             "payment_info": {},
#             "summary": {"is_online": True, "venue": "Agungi"},
#         },
#     }
#     nj.pop("email")
#     assert_request_fields(last_instance, nj, callback)
#     # when user exists but personalInfo is still passed, request should be marked as issues and and error displayed.
#     mock_email = mocker.patch(
#         "external.new_group_flow.services.magic_link_password.delay"
#     )
#     sample_obj = {
#         "personalInfo": {
#             "firstName": "Godwin",
#             "lastName": "Benson",
#             "email": "busybenson@example.com",
#             "phone": "2347035209976",
#             "preferredComms": {"channel": "whatsapp", "number": "2347035209976"},
#             "address": "20 Agede Street",
#             "vicinity": "Agungi",
#             "region": "Lekki",
#             "state": "Lagos",
#             "country": "NG",
#             "password": "password101",
#         },
#         "classInfo": class_info("course21", "YorubaClass33"),
#         "requestInfo": request_info(),
#         "redirect_url": "http://google.com",
#     }
#     response = client.post(
#         "/new-flow/initialize-request", json.dumps(sample_obj), "application/json"
#     )
#     assert response.status_code == 400
#     assert response.json() == {
#         "status": False,
#         "errors": {
#             "msg": f"An account with busybenson@example.com already exists. An email has been sent to log in."
#         },
#     }
#     assert BaseRequestTutor.objects.count() == 3
#     ist = BaseRequestTutor.objects.filter(status=BaseRequestTutor.ISSUED).first()
#     mock_email.assert_called_with(
#         "busybenson@example.com",
#         "http://testserver/new-flow/magic-link?callback_url={}&slug={}&hash={}".format(
#             "http://google.com",
#             ist.slug,
#             b64_encode("busybenson@example.com".encode()).decode("utf-8"),
#         ),
#     )
#     # when the user previously exists and has similar subject but different group course
#     # fourth_obj = {
#     #     "email": "busybenson@example.com",
#     #     "classInfo": class_info("course22","YorubaClass29"),
#     #     "requestInfo": request_info(venue="online"),
#     # }


@pytest.mark.django_db
def test_magic_link_verification(create_user, client: Client):
    user = create_user()
    request = client.get(
        "/new-flow/magic-link?callback_url=http://google.com&hash={}".format(
            b64_encode(user.email.encode()).decode("utf-8")
        )
    )
    assert request.status_code == 302
    assert request.url == "http://google.com?admin-login=true&email={}".format(
        "james@example.com"
    )
    request = client.get(
        "/new-flow/magic-link?callback_url=http://google.com&hash={}".format(
            b64_encode("olodo".encode()).decode("utf-8")
        )
    )
    assert request.status_code == 302
    assert request.url == "/"
    # with_slug
    rq = BaseRequestTutor.objects.create(
        slug="ABDESDESDES", email="james@example.com", status=BaseRequestTutor.ISSUED
    )
    request = client.get(
        "/new-flow/magic-link?callback_url=http://google.com&hash={}&slug={}".format(
            b64_encode(user.email.encode()).decode("utf-8"), rq.slug
        )
    )
    assert request.status_code == 302
    assert request.url == "http://google.com?admin-login=true&email={}&slug={}".format(
        "james@example.com", rq.slug
    )
    assert BaseRequestTutor.objects.filter(status=BaseRequestTutor.ISSUED).count() == 0
    assert (
        BaseRequestTutor.objects.filter(status=BaseRequestTutor.COMPLETED).count() == 1
    )


@pytest.mark.django_db
def test_update_booking_request_information(
    client: Client, create_request, create_admin, create_agent
):
    create_agent()
    rq: BaseRequestTutor = create_request()
    assert rq.user.email == "busybenson@example.com"
    assert rq.request_info["requestInfo"]["venue"] == "offline"
    sample_obj = {
        "requestInfo": {
            "venue": "online",
            "students": [{}],
            "children": [],
            "upsell": {},
            "medium": "From a friend",
            "paymentMethod": "card",
            "paymentOption": "paystack",
        },
        "paymentInfo": {"accountNo": "0003453332", "bank": "Test Bank"},
    }
    response = client.post(
        f"/new-flow/update-request/{rq.slug}",
        json.dumps(sample_obj),
        "application/json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "classSelected": "YorubaClass2",
            "bookingID": rq.slug,
            "status": "pending",
            "registrationInfo": {
                "venue": "online",
                "students": [{}],
                "children": [],
                "upsell": {},
                "medium": "From a friend",
                "paymentMethod": "card",
                "paymentOption": "paystack",
            },
            "paymentInfo": {"accountNo": "0003453332", "bank": "Test Bank"},
        },
    }
    rq = BaseRequestTutor.objects.get(slug=rq.slug)
    assert rq.request_info["requestInfo"]["venue"] == "online"
    # when `status` exists in the flow and admin credentials provided
    admin = create_admin()
    response = client.post(
        f"/new-flow/update-request/{rq.slug}",
        json.dumps({"madePayment": True}),
        "application/json",
        HTTP_ADMIN_EMAIL=admin.email,
        HTTP_ADMIN_PASSWORD="password101",
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "classSelected": "YorubaClass2",
            "bookingID": rq.slug,
            "status": "payed",
            "registrationInfo": {
                "venue": "online",
                "students": [{}],
                "children": [],
                "upsell": {},
                "medium": "From a friend",
                "paymentMethod": "card",
                "paymentOption": "paystack",
            },
            "paymentInfo": {"accountNo": "0003453332", "bank": "Test Bank"},
        },
    }


@pytest.mark.django_db
def test_get_booking_information(
    client: Client, create_request, class_info, request_info, create_agent
):
    create_agent()
    rq = create_request()
    response = client.get(f"/new-flow/booking-info/{rq.slug}")
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "bookingID": rq.slug,
            "status": "pending",
            "classInfo": class_info("course11", "YorubaClass2"),
            "registrationInfo": request_info(),
            "paymentInfo": None,
        },
    }
    response = client.get(
        f"/new-flow/booking-with-class/YorubaClass2", {"email": rq.email}
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": True,
        "data": {
            "bookingID": rq.slug,
            "status": "pending",
            "classInfo": class_info("course11", "YorubaClass2"),
            "registrationInfo": request_info(),
            "paymentInfo": None,
        },
    }
