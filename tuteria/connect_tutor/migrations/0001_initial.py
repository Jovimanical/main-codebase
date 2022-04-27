# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-08-12 07:05
from __future__ import unicode_literals

from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import django_extensions.db.fields
import model_utils.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("andablog", "0005_auto_20151017_1747"),
        ("external", "__first__"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="BlogArticle",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("image", models.ImageField(upload_to=b"")),
                (
                    "background_color",
                    models.CharField(blank=True, max_length=10, null=True),
                ),
                ("featured", models.BooleanField(default=False)),
                (
                    "article",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="link",
                        to="andablog.Entry",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="BlogCategory",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "slug",
                    django_extensions.db.fields.AutoSlugField(
                        blank=True, editable=False, populate_from=b"name"
                    ),
                ),
                ("name", models.CharField(max_length=70)),
            ],
        ),
        migrations.CreateModel(
            name="RequestPool",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "created",
                    model_utils.fields.AutoCreatedField(
                        default=django.utils.timezone.now,
                        editable=False,
                        verbose_name="created",
                    ),
                ),
                (
                    "modified",
                    model_utils.fields.AutoLastModifiedField(
                        default=django.utils.timezone.now,
                        editable=False,
                        verbose_name="modified",
                    ),
                ),
                (
                    "subjects",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.CharField(max_length=50),
                        blank=True,
                        null=True,
                        size=None,
                    ),
                ),
                (
                    "cost",
                    models.DecimalField(
                        blank=True, decimal_places=2, default=0, max_digits=10
                    ),
                ),
                ("approved", models.BooleanField(default=False)),
                ("recommended", models.BooleanField(default=False)),
                ("remarks", models.TextField(blank=True, max_length=255, null=True)),
                (
                    "default_subject",
                    models.CharField(blank=True, max_length=50, null=True),
                ),
                (
                    "request_status",
                    models.IntegerField(choices=[(1, b"New"), (2, b"Old")], default=2),
                ),
                (
                    "req",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="request",
                        to="external.BaseRequestTutor",
                        verbose_name=b"pool_of_tutors",
                    ),
                ),
                (
                    "tutor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="applications",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"abstract": False},
        ),
        migrations.AddField(
            model_name="blogarticle",
            name="category",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="articles",
                to="connect_tutor.BlogCategory",
            ),
        ),
    ]
