import logging

from allauth.utils import (
    generate_unique_username,
    _generate_unique_username_base,
    get_username_max_length,
)
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import MultipleObjectsReturned
from django.template.loader import render_to_string
from django.conf import settings
from django.template import TemplateDoesNotExist
from django.core.mail import EmailMultiAlternatives, EmailMessage
from users import tasks

try:
    from django.utils.encoding import force_text
except ImportError:
    from django.utils.encoding import force_unicode as force_text

from allauth.account.adapter import DefaultAccountAdapter
from config.mail_servers import mailgun_backend

logger = logging.getLogger(__name__)


def generate_unique_username2(txts, regex=None):
    username = _generate_unique_username_base(txts, regex)
    User = get_user_model()
    max_length = get_username_max_length()
    i = 0
    while True:
        try:
            if i:
                pfx = str(i + 1)
            else:
                pfx = ""
            ret = username[0 : max_length - len(pfx)] + pfx
            query = {"username__iexact": ret}
            User.objects.filter(**query).all()[0]
            i += 1
        except IndexError:
            return ret

    def generate_unique_username(self, txts, regex=None):
        return generate_unique_username(txts, regex)


class TuteriaAccountAdapter(DefaultAccountAdapter):

    def generate_unique_username(self, txts, regex=None):
        try:
            return generate_unique_username(txts, regex)
        except MultipleObjectsReturned:
            return generate_unique_username2(txts, regex)

    def format_email_subject(self, subject):
        return force_text(subject)

    # def authenticate(self, request, **credentials):
    #    """Only authenticates, does not actually login. See `login`"""
    #    self.pre_authenticate(request, **credentials)
    #    user = authenticate(**credentials)
    #    if user:
    #        cache_key = self._get_login_attempts_cache_key(
    #            request, **credentials)
    #        cache.delete(cache_key)
    #    else:
    #        self.authentication_failed(request, **credentials)
    #    return user

    def render_mail(self, template_prefix, email, context):
        """
        Renders an e-mail to `email`.  `template_prefix` identifies the
        e-mail that is to be sent, e.g. "account/email/email_confirmation"
        """

        subject = render_to_string("{0}_subject.txt".format(template_prefix), context)
        # remove superfluous line breaks
        subject = " ".join(subject.splitlines()).strip()
        subject = self.format_email_subject(subject)
        bodies = {}
        for ext in ["html", "txt"]:
            try:
                template_name = "{0}_message.{1}".format(template_prefix, ext)
                bodies[ext] = render_to_string(template_name, context).strip()
            except TemplateDoesNotExist:
                if ext == "txt" and not bodies:
                    # We need at least one body
                    raise
        if "txt" in bodies:
            msg = EmailMultiAlternatives(
                subject,
                bodies["txt"],
                settings.DEFAULT_FROM_EMAIL,
                [email],
                connection=mailgun_backend,
            )
            if "html" in bodies:
                msg.attach_alternative(bodies["html"], "text/html")
        else:
            msg = EmailMessage(
                subject,
                bodies["html"],
                settings.DEFAULT_FROM_EMAIL,
                [email],
                connection=mailgun_backend,
            )
            msg.content_subtype = "html"  # Main content is now text/html
        return msg

    def send_mail(self, template_prefix, email, context):
        logger.info(template_prefix)
        logger.info(email)
        logger.info(context)
        context2 = {"user": {"first_name": context["user"].first_name}}

        if context.get("activate_url"):
            context2.update(activate_url=context["activate_url"])
        if context.get("password_reset_url"):
            context2.update(password_reset_url=context["password_reset_url"])
        tasks.email_confirmation_signup.delay(email, context2)
        # import pdb; pdb.set_trace()
        # msg = self.render_mail(template_prefix, email, context)
        # msg.send()
