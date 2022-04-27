from django.contrib import admin, messages
from django.contrib.admin.helpers import ActionForm
from django.utils import timezone
from django.utils.translation import ugettext as _
from config import utils
from users.models import User
from django.db import models
from django.urls import reverse
from django.http import JsonResponse, StreamingHttpResponse, HttpResponseRedirect
from django.contrib.admin.templatetags.admin_modify import (
    register,
    submit_row as original_submit_row,
)
from django.conf.urls import url
from .utils import PayRoll
from functools import update_wrapper

from .forms import PayrollForm

# from config import admin_utils

from .views import my_view


class PayrollAdminSite(admin.AdminSite):
    site_header = "Payroll Administration"


payroll_admin = PayrollAdminSite(name="Payroll Admin")


@register.inclusion_tag("admin/submit_line.html", takes_context=True)
def submit_row(context):

    """ submit buttons context change """
    ctx = original_submit_row(context)
    ctx.update(
        {
            "show_save_and_add_another": context.get(
                "show_save_and_add_another", ctx["show_save_and_add_another"]
            ),
            "show_save_and_continue": context.get(
                "show_save_and_continue", ctx["show_save_and_continue"]
            ),
            "show_save": context.get("show_save", ctx["show_save"]),
            "show_delete_link": context.get(
                "show_delete_link", ctx["show_delete_link"]
            ),
        }
    )
    return ctx


class PayrollModel(models.Model):

    class Meta:
        verbose_name = "Payroll"


class PayrollAdmin(admin.ModelAdmin):
    change_form_template = "payroll.html"
    list_display = ("upload_doc",)
    form = PayrollForm

    def get_queryset(self, request):
        return User.objects.filter(id=request.user.id)

    def get_urls(self):
        urls = super(PayrollAdmin, self).get_urls()
        my_urls = [url(r"^my_view/$", my_view, name="payroll")] + urls
        return my_urls

    def upload_doc(self, request):
        return "Upload Doc!"

    @classmethod
    def has_add_permission(cls, request):
        """ remove add and save and add another button """
        return False

    def change_view(self, request, object_id, extra_context=None):
        """ customize add/edit form """
        extra_context = extra_context or {}
        extra_context["show_save_and_continue"] = False
        extra_context["show_save"] = False
        extra_context["show_delete_link"] = False
        return super(PayrollAdmin, self).change_view(
            request, object_id, extra_context=extra_context
        )

    def response_change(self, request, obj):
        if "upload_payroll_doc" in request.POST:
            payroll = PayRoll(request.FILES.get("document"))
            if payroll.send_mail():
                self.message_user(request, "Payroll emails has been sent")
            else:
                self.message_user(
                    request, "An error occured, mail could not be sent", messages.ERROR
                )
            return HttpResponseRedirect(".")
        return super().response_change(request, obj)


utils.create_modeladmin(
    PayrollAdmin, PayrollModel, name="payroll", admin_var=payroll_admin
)
