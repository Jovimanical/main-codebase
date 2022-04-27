import os
from django.core.mail import get_connection, send_mail
from django.core.mail.message import EmailMessage

smtp_backend = get_connection("django.core.mail.backends.smtp.EmailBackend")
sendgrid_backend = get_connection("config.backends.SendGridBackend")
mailgun_backend = get_connection("config.backends.MailGunBackend")
# mandrill_backend = get_connection('config.backends.MandrillBackend')
mandrill_backend = mailgun_backend
gmail_backend = get_connection("config.backends.GmailBackend")
console_backend = get_connection("django.core.mail.backends.console.EmailBackend")
locmem_backend = get_connection("django.core.mail.backends.locmem.EmailBackend")
