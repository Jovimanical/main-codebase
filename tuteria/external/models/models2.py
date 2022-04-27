import datetime
import time
from django.db import models, connection
from django.contrib.postgres.fields import JSONField

from users.models import User


class CombinedTutorData(models.Model):
    # user = models.OneToOneField(
    #     User,
    #     primary_key=True,
    #     db_column="id",
    #     verbose_name="user",
    #     related_name="combined_data",
    #     on_delete=models.CASCADE,
    # )
    # id = models.IntegerField(primary_key=True)
    combined = models.TextField(null=True, blank=True)
    data_dump = JSONField(null=True)
    loc = models.TextField(null=True, blank=True)
    phone_numbers = models.TextField(null=True, blank=True)
    skills = JSONField(null=True)
    location = JSONField(null=True)
    work_experiences = JSONField(null=True)
    educations = JSONField(null=True)

    class Meta:
        managed = False
        db_table = "combined_tutor_data"

    def __str__(self):
        return str(self.user.email)

    def __repr__(self) -> str:
        return f"<TutorData: {self.user.email}>"

    @classmethod
    def refresh(cls):
        start_time = time.monotonic()
        with connection.cursor() as cursor:
            cursor.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY combined_tutor_data")
        end_time = time.monotonic()
        difference = datetime.timedelta(seconds=end_time - start_time)
        return difference
