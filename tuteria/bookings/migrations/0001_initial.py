# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-08-12 07:05
from __future__ import unicode_literals

import bookings.mixins
import config.utils
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django_extensions.db.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("skills", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Booking",
            fields=[
                (
                    "created",
                    django_extensions.db.fields.CreationDateTimeField(
                        auto_now_add=True, verbose_name="created"
                    ),
                ),
                (
                    "modified",
                    django_extensions.db.fields.ModificationDateTimeField(
                        auto_now=True, verbose_name="modified"
                    ),
                ),
                (
                    "order",
                    models.CharField(
                        db_index=True, max_length=12, primary_key=True, serialize=False
                    ),
                ),
                (
                    "booking_type",
                    models.IntegerField(
                        choices=[(1, b"hourly"), (2, b"monthly")], default=1
                    ),
                ),
                (
                    "status",
                    models.IntegerField(
                        choices=[
                            (0, b"initialized"),
                            (1, b"scheduled"),
                            (2, b"pending"),
                            (3, b"completed"),
                            (4, b"cancelled"),
                            (6, b"bank_transfer"),
                            (7, b"delivered"),
                        ],
                        default=0,
                    ),
                ),
                ("paid_tutor", models.BooleanField(default=False)),
                ("message_to_tutor", models.TextField(blank=True, null=True)),
                ("first_session", models.DateTimeField(blank=True, null=True)),
                ("last_session", models.DateTimeField(blank=True, null=True)),
                ("reviewed", models.BooleanField(default=False)),
                ("calendar_updated", models.BooleanField(default=False)),
                ("cancellation_message", models.TextField(blank=True, null=True)),
                (
                    "wallet_amount",
                    models.DecimalField(decimal_places=2, default=0, max_digits=10),
                ),
                ("made_payment", models.BooleanField(default=False)),
                ("delivered_on", models.DateTimeField(blank=True, null=True)),
                (
                    "cancel_initiator",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bookings_cancelled",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "ts",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bookings",
                        to="skills.TutorSkill",
                    ),
                ),
                (
                    "tutor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="t_bookings",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="orders",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ("-modified", "-created"),
                "abstract": False,
                "get_latest_by": "modified",
            },
            bases=(
                config.utils.BookingDetailMixin,
                bookings.mixins.BookingMixin,
                models.Model,
            ),
        ),
        migrations.CreateModel(
            name="BookingSession",
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
                    django_extensions.db.fields.CreationDateTimeField(
                        auto_now_add=True, verbose_name="created"
                    ),
                ),
                (
                    "modified",
                    django_extensions.db.fields.ModificationDateTimeField(
                        auto_now=True, verbose_name="modified"
                    ),
                ),
                ("start", models.DateTimeField()),
                ("price", models.DecimalField(decimal_places=2, max_digits=10)),
                ("student_no", models.IntegerField(default=1)),
                ("no_of_hours", models.DecimalField(decimal_places=2, max_digits=5)),
                (
                    "issue",
                    models.CharField(
                        blank=True,
                        choices=[
                            (b"", b"Select Issue"),
                            (b"more_hours", b"I taught more than the booked hours"),
                            (b"client_not_cooperative", b"Client was not cooperative"),
                            (b"late_lesson", b"Lesson did not start on time"),
                        ],
                        default=b"",
                        max_length=15,
                    ),
                ),
                (
                    "status",
                    models.IntegerField(
                        choices=[
                            (1, b"not started"),
                            (2, b"started"),
                            (3, b"completed"),
                            (5, b"cancelled"),
                        ],
                        default=1,
                    ),
                ),
                (
                    "cancellation_reason",
                    models.CharField(
                        blank=True,
                        choices=[
                            (b"", b"Select Reason"),
                            (b"change_location", b"Changing Location"),
                            (b"no_need_for_lesson", b"Don't need lesson anymore"),
                            (b"dislike_tutor", b"Didn't like the tutor"),
                            (
                                b"family_inconvenience",
                                b"Family Inconvenience (e.g Illness)",
                            ),
                            (b"tutor_no_showing_up", b"Tutor didn't show up"),
                        ],
                        max_length=20,
                        null=True,
                    ),
                ),
                (
                    "booking",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="bookings.Booking",
                    ),
                ),
            ],
            options={"ordering": ["start"]},
            bases=(bookings.mixins.BookingSessionMixin, models.Model),
        ),
        migrations.CreateModel(
            name="LetterInvite",
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
                    django_extensions.db.fields.CreationDateTimeField(
                        auto_now_add=True, verbose_name="created"
                    ),
                ),
                (
                    "modified",
                    django_extensions.db.fields.ModificationDateTimeField(
                        auto_now=True, verbose_name="modified"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ("-modified", "-created"),
                "abstract": False,
                "get_latest_by": "modified",
            },
        ),
        migrations.CreateModel(
            name="BookingNotClosed",
            fields=[],
            options={"proxy": True},
            bases=("bookings.booking",),
        ),
    ]
