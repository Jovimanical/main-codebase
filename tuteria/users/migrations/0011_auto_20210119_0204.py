# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2021-01-19 01:04
from __future__ import unicode_literals

import cloudinary.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_auto_20180322_1312'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='image',
            field=cloudinary.models.CloudinaryField(blank=True, default='', max_length=500, null=True, verbose_name='image'),
        ),
    ]
