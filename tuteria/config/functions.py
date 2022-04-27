# -*- coding: utf-8 -*-
import datetime
from django.db import models
from django.utils import timezone

class Replace(models.Func):
    function = "REPLACE"

    def __init__(self, expression, text, replacement=models.Value(""), **extra):
        super().__init__(expression, text, replacement, **extra)


class TO_Timestamp(models.Func):
    function = "TO_TIMESTAMP"

    def __init__(
        self, expression, format=models.Value("YYYY-MM-DD HH24:MI:SS"), **extra
    ):
        super().__init__(
            expression, format, output_field=models.DateTimeField(), **extra
        )


class Age(models.Func):
    function = "AGE"

    def __init__(self, expression, current_time: datetime.datetime = None, **extra):
        t = current_time
        if not t:
            t = timezone.now()
        format = models.Value(t.strftime("%Y-%m-%d %H:%M:%S"))
        super().__init__(
            format, expression, output_field=models.DurationField(), **extra
        )


class DatePart(models.Func):
    function = "date_part"

    def __init__(self, expression, interval=models.Value("epoch"), **extra):
        super().__init__(
            interval, expression, output_field=models.FloatField(), **extra
        )

