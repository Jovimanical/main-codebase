# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2021-07-07 08:46
from __future__ import unicode_literals

from decimal import Decimal
from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('external', '0020_auto_20210630_1800'),
    ]

    operations = [
        migrations.CreateModel(
            name='RequestsWithSplit',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
            },
            bases=('external.baserequesttutor',),
        ),
        
    ]
