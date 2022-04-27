# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2021-12-22 00:01
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django_extensions.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('skills', '0007_auto_20211013_1630'),
    ]

    operations = [
        # migrations.AlterField(
        #     model_name='skill',
        #     name='quiz',
        #     field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='quiz.Quiz'),
        # ),
        # migrations.AlterField(
        #     model_name='skill',
        #     name='testifier',
        #     field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        # ),
        # migrations.AlterField(
        #     model_name='skillwithstate',
        #     name='state',
        #     field=models.CharField(blank=True, choices=[('', 'Select State'), ('Abia', 'Abia'), ('Abuja', 'Abuja'), ('Adamawa', 'Adamawa'), ('Akwa Ibom', 'Akwa Ibom'), ('Anambra', 'Anambra'), ('Bayelsa', 'Bayelsa'), ('Bauchi', 'Bauchi'), ('Benue', 'Benue'), ('Borno', 'Borno'), ('Cross River', 'Cross River'), ('Delta', 'Delta'), ('Edo', 'Edo'), ('Ebonyi', 'Ebonyi'), ('Ekiti', 'Ekiti'), ('Enugu', 'Enugu'), ('Gombe', 'Gombe'), ('Imo', 'Imo'), ('Jigawa', 'Jigawa'), ('Kaduna', 'Kaduna'), ('Kano', 'Kano'), ('Katsina', 'Katsina'), ('Kebbi', 'Kebbi'), ('Kogi', 'Kogi'), ('Kwara', 'Kwara'), ('Lagos', 'Lagos'), ('Nassarawa', 'Nassarawa'), ('Niger', 'Niger'), ('Ogun', 'Ogun'), ('Ondo', 'Ondo'), ('Osun', 'Osun'), ('Oyo', 'Oyo'), ('Plateau', 'Plateau'), ('Rivers', 'Rivers'), ('Sokoto', 'Sokoto'), ('Taraba', 'Taraba'), ('Yobe', 'Yobe'), ('Zamfara', 'Zamfara')], max_length=20, null=True),
        # ),
        migrations.AlterField(
            model_name='tutorskill',
            name='heading',
            field=models.CharField(db_index=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='tutorskill',
            name='slug',
            field=django_extensions.db.fields.AutoSlugField(blank=True, editable=False, max_length=100, populate_from='heading'),
        ),
    ]
