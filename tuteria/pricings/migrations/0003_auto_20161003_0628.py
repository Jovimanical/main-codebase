# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-10-03 05:28
from __future__ import unicode_literals

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("pricings", "0002_auto_20160926_1513")]

    operations = [
        migrations.AlterField(
            model_name="region",
            name="areas",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.CharField(max_length=50),
                blank=True,
                null=True,
                size=None,
            ),
        )
    ]
