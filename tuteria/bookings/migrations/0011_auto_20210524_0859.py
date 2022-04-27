# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2021-05-24 08:59
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0010_auto_20210524_0857"),
    ]

    operations = [
        migrations.AlterField(
            model_name="booking",
            name="tutor_discount",
            field=models.DecimalField(
                decimal_places=2, default=0, max_digits=10, null=True
            ),
        ),
    ]
