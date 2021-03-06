# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2021-05-16 19:41
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("connect_tutor", "0002_auto_20210411_0747"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="tutorjobresponse",
            name="comment",
        ),
        migrations.RemoveField(
            model_name="tutorjobresponse",
            name="reason",
        ),
        migrations.AddField(
            model_name="tutorjobresponse",
            name="data_dump",
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="tutorjobresponse",
            name="response_time",
            field=models.IntegerField(default=0),
        ),
    ]
