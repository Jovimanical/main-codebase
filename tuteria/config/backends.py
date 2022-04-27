import os
from django.core.mail.backends.smtp import EmailBackend

send_grid_host = "smtp.sendgrid.net"
sendgrid_port = 587
sendgrid_username = os.getenv("SENDGRID_USERNAME", "")
sendgrid_password = os.getenv("SENDGRID_PASSWORD", "")
mandrill_use_tls = True

mailgun_host = "smtp.mailgun.org"
mailgun_port = 587
mailgun_username = os.getenv("MAILGUN_USERNAME", "")
mailgun_password = os.getenv("MAILGUN_PASSWORD", "")
mailgun_use_tls = True

mandrill_host = "smtp.mandrillapp.com"
mandrill_port = 587
mandrill_username = os.getenv("MANDRILL_USERNAME", "")
mandrill_password = os.getenv("MANDRILL_PASSWORD", "")


class BaseBackend(EmailBackend):
    host = ""
    port = 587
    username = ""
    password = ""
    use_tls = True

    def __init__(self, fail_silently=False):
        super(BaseBackend, self).__init__(
            host=self.host,
            port=self.port,
            username=self.username,
            password=self.password,
            use_tls=self.use_tls,
            fail_silently=fail_silently,
        )


class SendGridBackend(BaseBackend):
    host = send_grid_host
    password = sendgrid_password
    username = sendgrid_username


class MailGunBackend(BaseBackend):
    host = mailgun_host
    password = mailgun_password
    username = mailgun_username


class MandrillBackend(BaseBackend):
    host = mandrill_host
    password = mandrill_password
    username = mandrill_username


class GmailBackend(BaseBackend):
    host = "smtp.gmail.com"
    username = os.getenv("GMAIL_USERNAME", "")
    password = os.getenv("GMAIL_PASSWORD", "")
