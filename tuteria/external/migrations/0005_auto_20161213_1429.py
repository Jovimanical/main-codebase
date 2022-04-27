# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-12-13 13:29
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("external", "0004_auto_20161129_1154")]

    operations = [
        migrations.AlterField(
            model_name="baserequesttutor",
            name="country_state",
            field=models.CharField(blank=True, max_length=70, null=True),
        ),
        migrations.AlterField(
            model_name="baserequesttutor",
            name="online_id",
            field=models.CharField(blank=True, max_length=70, null=True),
        ),
        migrations.AlterField(
            model_name="baserequesttutor",
            name="request_type",
            field=models.IntegerField(
                choices=[
                    (1, b"Regular Request"),
                    (2, b"Tutor Request"),
                    (3, b"Online Request"),
                ],
                default=1,
            ),
        ),
        migrations.AlterField(
            model_name="baserequesttutor",
            name="the_timezone",
            field=models.CharField(blank=True, max_length=70, null=True),
        ),
    ]
