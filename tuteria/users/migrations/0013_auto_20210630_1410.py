# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2021-06-30 14:10
from __future__ import unicode_literals

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_auto_20210328_0834'),
    ]

    operations = [
        migrations.CreateModel(
            name='TutorRevamp',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
            },
            bases=('users.user',),
        )
    ]
