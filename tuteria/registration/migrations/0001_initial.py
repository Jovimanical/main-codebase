# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-08-12 07:08
from __future__ import unicode_literals

import cloudinary.models
from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import model_utils.fields
import phonenumber_field.modelfields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("schedule", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CalendarDay",
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
                    "weekday",
                    models.CharField(
                        blank=True,
                        choices=[
                            (b"Sunday", b"Sunday"),
                            (b"Monday", b"Monday"),
                            (b"Tuesday", b"Tuesday"),
                            (b"Wednesday", b"Wednesday"),
                            (b"Thursday", b"Thursday"),
                            (b"Friday", b"Friday"),
                            (b"Saturday", b"Saturday"),
                        ],
                        max_length=20,
                        null=True,
                    ),
                ),
                (
                    "time_slot",
                    django.contrib.postgres.fields.ArrayField(
                        base_field=models.CharField(
                            choices=[
                                (b"Morning", b"Morning"),
                                (b"Afternoon", b"Afternoon"),
                                (b"Evening", b"Evening"),
                            ],
                            max_length=30,
                        ),
                        blank=True,
                        null=True,
                        size=None,
                    ),
                ),
            ],
            options={"db_table": "calendar_day"},
        ),
        migrations.CreateModel(
            name="Education",
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
                ("school", models.CharField(max_length=50)),
                ("course", models.CharField(max_length=100)),
                (
                    "degree",
                    models.CharField(
                        choices=[
                            (b"", b"Select"),
                            (b"B.Sc.", b"B.Sc."),
                            (b"B.A.", b"B.A."),
                            (b"B.Ed.", b"B.Ed."),
                            (b"B.Eng.", b"B.Eng."),
                            (b"B.Tech.", b"B.Tech."),
                            (b"Diploma", b"Diploma"),
                            (b"HND", b"HND"),
                            (b"OND", b"OND"),
                            (b"M.Sc.", b"M.Sc."),
                            (b"LL.B", b"LL.B"),
                            (b"MBA", b"MBA"),
                            (b"PhD", b"PhD"),
                            (b"N.C.E", b"N.C.E"),
                            (b"S.S.C.E", b"S.S.C.E"),
                        ],
                        max_length=10,
                    ),
                ),
                (
                    "certificate",
                    cloudinary.models.CloudinaryField(
                        blank=True, max_length=100, null=True
                    ),
                ),
                ("verified", models.BooleanField(default=False)),
                (
                    "tutor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "tutors_educations"},
        ),
        migrations.CreateModel(
            name="Guarantor",
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
                    "email",
                    models.EmailField(
                        blank=True,
                        db_index=True,
                        max_length=254,
                        null=True,
                        verbose_name="email address",
                    ),
                ),
                (
                    "first_name",
                    models.CharField(
                        blank=True,
                        db_index=True,
                        max_length=40,
                        null=True,
                        verbose_name="first name",
                    ),
                ),
                (
                    "last_name",
                    models.CharField(
                        blank=True,
                        db_index=True,
                        max_length=40,
                        null=True,
                        verbose_name="last name",
                    ),
                ),
                (
                    "no_of_years",
                    models.IntegerField(
                        blank=True,
                        choices=[
                            (b"", b"Select Option"),
                            (2, b"Less than two years"),
                            (5, b"Between 3 to 5 years"),
                            (10, b"Between 6 to 10 years"),
                            (50, b"10 years +"),
                        ],
                        null=True,
                    ),
                ),
                (
                    "phone_no",
                    phonenumber_field.modelfields.PhoneNumberField(
                        blank=True, max_length=128, null=True
                    ),
                ),
                (
                    "organization",
                    models.CharField(blank=True, max_length=70, null=True),
                ),
                ("verified", models.BooleanField(default=False)),
                (
                    "tutor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "tutor_guarantors"},
        ),
        migrations.CreateModel(
            name="PhishyUser",
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
                    "user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Schedule",
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
                    "calender_type",
                    models.IntegerField(
                        choices=[(1, b"available"), (2, b"booking")], default=1
                    ),
                ),
                ("last_updated", models.DateTimeField(null=True)),
                (
                    "calender",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="schedule.Calendar",
                    ),
                ),
                (
                    "tutor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "tutors_schedules"},
        ),
        migrations.CreateModel(
            name="UserCalendar",
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
                    "tutor",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_calendar",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "calendar"},
        ),
        migrations.CreateModel(
            name="WorkExperience",
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
                    "name",
                    models.CharField(max_length=80, verbose_name="Organization Name"),
                ),
                ("role", models.CharField(max_length=50, verbose_name="Role")),
                ("verified", models.BooleanField(default=False)),
                ("currently_work", models.BooleanField(default=False)),
                (
                    "tutor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "tutor_work_experiences"},
        ),
        migrations.AddField(
            model_name="calendarday",
            name="calendar",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="days",
                to="registration.UserCalendar",
            ),
        ),
        migrations.CreateModel(
            name="VerifiedUserWorkExperience",
            fields=[],
            options={"proxy": True},
            bases=("registration.workexperience",),
        ),
        migrations.AlterUniqueTogether(
            name="schedule", unique_together=set([("tutor", "calender_type")])
        ),
    ]
