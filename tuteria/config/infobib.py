import requests
import base64
import json
import pdb


class INFOLIBAPI:
    base_url = "https://api.infobip.com"
    headers = {"content-type": "application/json"}
    version = "1"

    def __init__(self, credentials, credential_type="basic"):
        if credential_type == "basic":
            value = "Basic {}".format(base64.b64encode(bytes(credentials, "utf-8")))
        else:
            value = "App {}".format(credentials)
        self.headers.update(authorization=value)

    def _construct_request(
        self, url, sub_url="sms", params=None, data=None, request_type="post"
    ):
        full_url = "{}/{}/{}{}".format(self.base_url, sub_url, self.version, url)
        headers = self.headers
        response = getattr(requests, request_type)(
            full_url, headers=headers, data=json.dumps(data), params=params
        )
        if response.status_code >= 500:
            response.raise_for_status()
        return response.json()

    def send_sms(self, to=None, message=None, from_=None, **kwargs):
        url = "/text/single"
        return self._construct_request(
            url, data={"from": from_, "to": to, "text": message}
        )

    # @classmethod
    # def get_inbox(cls, limit=10):
    #     url = '/inbox/reports'
    #     return cls.construct_request(url, params=dict(limit=limit),
    #                                  request_type='get')

    # @classmethod
    # def two_factor_construct(cls, url, **kwargs):
    #     return cls.construct_request(url, sub_url='2fa', **kwargs)

    # @classmethod
    # def create_api_key(cls):
    #     url = '/api-key'
    #     return cls.two_factor_construct(url)

    # @classmethod
    # def create_2fa_application(cls):
    #     url = '/applications'
    #     return cls.two_factor_construct(url)

    # @classmethod
    # def get_2fa_application(cls):
    #     url = '/applications'
    #     response = cls.two_factor_construct(url, request_type='get')
    #     return [o for o in response if o['enabled'] is True]

    # @classmethod
    # def create_2fa_message(cls):
    #     applicationId = cls.get_2fa_application()['applicationId']
    #     data = {
    #         'pinType': "NUMERIC",
    #         "pinPlaceholder": "<pin>",
    #         "messageText": "Your pin is <pin>",
    #         "pinLength": 6,
    #         "senderId": "Tuteria 2FA",
    #         "language": "en"
    #     }
    #     url = '/applications/{}/messages'.format(applicationId)
    #     return cls.two_factor_construct(url, data=data)

    # @classmethod
    # def get_2fa_message(cls):
    #     applicationId = cls.get_2fa_application()['applicationId']
    #     url = "/applications/{}/messages".format(applicationId)
    #     response = cls.two_factor_construct(url, request_type='get')
    #     return response[0]

    # @classmethod
    # def construct_pin_params(cls, to):
    #     applicationId = cls.get_2fa_application()['applicationId']
    #     messageId = cls.get_2fa_message()['messageId']
    #     data = {
    #         "applicationId": applicationId,
    #         "messageId": messageId,
    #         "from": cls._from,
    #         "to": to
    #     }
    #     authorization = cls.create_api_key()
    #     return data, authorization

    # @classmethod
    # def send_pin(cls, to):
    #     url = "/pin?ncNeeded=true"
    #     data, authorization = cls.construct_pin_params(to)
    #     return cls.two_factor_construct(url, data=data,
    #                                     authorization=authorization)

    # @classmethod
    # def send_pin_as_voice(cls, to):
    #     url = "/pin/voice"
    #     data, authorization = cls.construct_pin_params(to)
    #     return cls.two_factor_construct(url, data=data,
    #                                     authorization=authorization)

    # @classmethod
    # def verify_pin(cls, pinId, pin):
    #     url = "/pin/{}/verify".format(pinId)
    #     data = dict(pin=pin)
    #     authorization = cls.create_api_key()
    #     return cls.two_factor_construct(url, data=data,
    #                                     authorization=authorization)

    # @classmethod
    # def resend_pin_as_sms(cls, pinId):
    #     url = '/pin/{}/resend'.format(pinId)
    #     authorization = cls.create_api_key()
    #     return cls.two_factor_construct(url, authorization=authorization)

    # @classmethod
    # def resend_pin_as_voice(cls, pinId):
    #     url = '/pin/{}/resend/voice'.format(pinId)
    #     authorization = cls.create_api_key()
    #     return cls.two_factor_construct(url, authorization=authorization)

    # @classmethod
    # def get_pin_status(cls, pinId):
    #     url = '/pin/{}/status'
    #     authorization = cls.create_api_key()
    #     return cls.two_factor_construct(url, authorization=authorization,
    #                                     request_type='get')

    # @classmethod
    # def checked_number_is_verified(cls, phone_no):
    #     applicationId = cls.get_2fa_application()['applicationId']
    #     url = '/applications/{}/verified?msisdn={}'.format(
    #         applicationId, phone_no)
    #     authorization = cls.create_api_key()
    #     return cls.two_factor_construct(url, authorization=authorization,
    #                                     request_type='get')
