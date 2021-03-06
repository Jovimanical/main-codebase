# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2021-04-11 07:47
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import django_extensions.db.fields
import model_utils.fields


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
         ('external', '0017_auto_20200411_0808'),
        ('connect_tutor', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TutorJobResponse',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('status', models.IntegerField(choices=[(1, 'pending'), (2, 'accepted'), (3, 'rejected'), (4, 'no_response'), (5, 'applied')], default=1)),
                ('reason', models.TextField(blank=True, max_length=500, null=True)),
                ('comment', models.TextField(blank=True, max_length=500, null=True)),
                ('req', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='req_instance', to='external.BaseRequestTutor')),
                ('tutor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='responses', to=settings.AUTH_USER_MODEL)),
            ],
        ),
       
    ]
