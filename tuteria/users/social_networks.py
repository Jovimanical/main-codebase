import json
from allauth.socialaccount.models import SocialApp
import datetime
from dateutil.relativedelta import relativedelta
import facebook
import pytz
import requests

base_url = u"https://graph.facebook.com/v2.2"
facebook_url = base_url + "/oauth"


class FacebookProvider(object):

    def __init__(self):
        self.social_app = SocialApp.objects.filter(name="Facebook").first()

    def get_code(self, sociallogin):
        r = requests.get(
            facebook_url
            + "/access_token?client_secret={}&client_id={}&grant_type=fb_exchange_token&fb_exchange_token={}".format(
                self.social_app.secret, self.social_app.client_id, sociallogin.token
            )
        )
        """
        u'access_token=CAALGcH4oOP8BAM4M76b7mGTRbbVcx3AILmNk6yfgKOQqytAkvccBUsP8hYZBZAox2hZCyABU6b1pbm7HaG2pkf0CBmiu09KwAHOtQbxnmPKXvBbTvfT9ByrhP3bG7LEriFMiH7SdHLnCSTZCnXrb6KxNZBs3Wnr1GVg3MucjFIOhoGlE1vsiBdHJLRCNdVPwZD&expires=5184000'
        """
        return r.text

    def upgrade_token(self, social_token):
        result = self.get_code(social_token)
        access_token, expires_at = tuple(result.split("&"))
        access_token = access_token.split("=")[1]
        expires_at = expires_at.split("=")[1]
        social_token.expires_at = datetime.datetime.now(pytz.utc) + relativedelta(
            seconds=int(expires_at)
        )
        social_token.token = access_token
        social_token.save()

    def get_token_status(self, social_token):
        r = requests.get(
            facebook_url
            + "/access_token?grant_type=client_credentials&client_id={client_id}&client_secret={client_secret}".format(
                client_id=self.social_app.client_id,
                client_secret=self.social_app.secret,
            )
        )
        app_token = r.text.split("=")[1]
        r = requests.get(
            base_url
            + "/debug_token?input_token={}&access_token={}".format(
                social_token.token, app_token
            )
        )
        return r.text


class FacebookSharer(object):

    def __init__(self, redirect_url="http://localhost:8002/facebook/redirect/"):
        self.social_app = SocialApp.objects.filter(name="Facebook").first()
        self.graph = facebook.GraphAPI()
        self.redirect_url = redirect_url
        self.fetched = False
        self.expired_check = False
        self.app_token = self.get_app_token()

    def get_app_token(self):
        if self.fetched:
            return self.app_token
        r = requests.get(
            facebook_url
            + "/access_token?grant_type=client_credentials&client_id={client_id}&client_secret={client_secret}".format(
                client_id=self.social_app.client_id,
                client_secret=self.social_app.secret,
            )
        )
        self.fetched = True
        return r.text.split("=")[1]

    def has_expired(self, sociallogin):
        r = requests.get(
            base_url
            + "/debug_token?input_token={}&access_token={}".format(
                sociallogin.token, self.app_token
            )
        )
        response = json.loads(r.text)
        return response["is_valid"]
