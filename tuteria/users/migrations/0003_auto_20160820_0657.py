# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-08-20 05:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("users", "0002_auto_20160819_1346")]

    operations = [
        migrations.AlterField(
            model_name="userprofile",
            name="description",
            field=models.TextField(blank=True, verbose_name="About Me"),
        )
    ]
