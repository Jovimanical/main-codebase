import re
from . import mdetect
from django.utils.deprecation import MiddlewareMixin


class ReferralAttachmentMiddleware(MiddlewareMixin):
    """
    Middleware that attachs referral code to request object
    """

    def process_request(self, request):
        #     if hasattr(request,'user'):
        #         if not request.user.is_authenticated:
        request.referral_code = request.GET.get("referral_code")


class MobileDetectionMiddleware(MiddlewareMixin):
    """
    Useful middleware to detect if the user is
    on a mobile device.
    """

    def process_request(self, request):
        is_tablet = False  # detectTierTablet
        is_phone = False  # detectTierIphone
        is_css_rich = False  # detectTierRichCss
        is_poor = False  # detectTierOtherPhones
        is_windows_phone = False
        is_bb = False
        is_bb_low = False
        is_bb_webkit = False
        is_bb_high = False
        is_bb_touch = False
        is_bb_10 = False
        is_ie = False

        if "HTTP_USER_AGENT" in request.META:
            # if request.META.has_key('HTTP_USER_AGENT'):
            user_agent = request.META["HTTP_USER_AGENT"].lower()
            if "trident" in user_agent or "msie" in user_agent:
                is_ie = True
            else:
                is_ie = False

        user_agent = request.META.get("HTTP_USER_AGENT")
        http_accept = request.META.get("HTTP_ACCEPT")

        if user_agent and http_accept:
            agent = mdetect.UAgentInfo(userAgent=user_agent, httpAccept=http_accept)
            is_tablet = agent.detectTierTablet()
            is_phone = agent.detectTierIphone()
            is_css_rich = agent.detectTierRichCss()
            is_poor = agent.detectTierOtherPhones()
            is_windows_phone = agent.detectWindowsPhone()
            is_bb = agent.detectBlackBerry()
            is_bb_high = agent.detectBlackBerryHigh()
            is_bb_webkit = agent.detectBlackBerryWebKit()
            is_bb_10 = agent.detectBlackBerry10Phone()
            is_bb_touch = agent.detectBlackBerryTouch()
            is_bb_low = agent.detectBlackBerryLow()

        requirements = is_bb and is_bb_webkit
        conditions = is_css_rich or is_bb_high or is_bb_low or is_bb_touch

        request.is_smart = is_tablet or is_phone
        request.is_smart_phone = is_phone
        request.is_featured = is_poor
        request.is_css_rich = is_css_rich
        request.is_phone = is_phone or is_css_rich or is_poor
        request.bad_phones = is_poor or is_css_rich
        request.is_windows = is_windows_phone
        request.is_bb_low = is_bb_low
        request.is_bb_featured = conditions and not is_bb_10
        request.is_ie = is_ie
