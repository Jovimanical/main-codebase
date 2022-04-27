# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-09-26 14:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("pricings", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="region",
            name="for_parent",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="pricing",
            name="status",
            field=models.IntegerField(
                choices=[(1, "Basic"), (2, "Premium"), (3, "Superstar")], default=1
            ),
        ),
        migrations.AlterField(
            model_name="region",
            name="prices",
            field=models.ManyToManyField(
                blank=True,
                related_name="region_set",
                related_query_name="region",
                to="pricings.Pricing",
            ),
        ),
    ]
