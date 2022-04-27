from __future__ import unicode_literals

from django.db import models
from django.utils.functional import cached_property
from django.contrib.postgres.fields import ArrayField
from skills import models as skill_models

states = {
    "Abia",
    "Abuja",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bayelsa",
    "Bauchi",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Edo",
    "Ebonyi",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nassawara",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
}

# Create your models here.


class Pricing(models.Model):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    STATUS = ((LOW, "Plan 1"), (MEDIUM, "Plan 2"), (HIGH, "Plan 3"))
    status = models.IntegerField(default=LOW, choices=STATUS)
    base_price = models.DecimalField(
        default=0, blank=True, max_digits=10, decimal_places=2
    )

    def __str__(self):
        return "%s (%s)" % (self.base_price, self.get_status_display())

    @classmethod
    def bulk_pricing_update(cls):
        pricings = [
            {"base_price": 1250, "status": cls.LOW},
            {"base_price": 1750, "status": cls.MEDIUM},
            {"base_price": 2500, "status": cls.HIGH},
            {"base_price": 1500, "status": cls.LOW},
            {"base_price": 2000, "status": cls.MEDIUM},
            {"base_price": 3000, "status": cls.HIGH},
            {"base_price": 750, "status": cls.LOW},
            {"base_price": 1250, "status": cls.MEDIUM},
            {"base_price": 2000, "status": cls.HIGH},
            {"base_price": 700, "status": cls.LOW},
            {"base_price": 1000, "status": cls.MEDIUM},
            {"base_price": 1500, "status": cls.HIGH},
            {"base_price": 2000, "status": cls.LOW},
            {"base_price": 3000, "status": cls.MEDIUM},
            {"base_price": 4000, "status": cls.HIGH},
        ]
        for p in pricings:
            cls.objects.get_or_create(**p)

    # def save(self, *args, **kwargs):
    #     Pricing.objects.filter(status=self.status, base_price=self.base_price).delete()
    #     return super(Pricing, self).save(*args, **kwargs)


class RegionManager(models.Manager):
    def get_queryset(self):
        return super(RegionManager, self).get_queryset()


class Region(models.Model):
    NIGERIAN_STATES = [("", "Select State")] + [(x, x) for x in states]
    state = models.CharField(
        max_length=50, choices=NIGERIAN_STATES, blank=True, db_index=True
    )
    name = models.CharField(max_length=70)
    areas = ArrayField(models.CharField(max_length=50), blank=True, null=True)
    for_parent = models.BooleanField(default=False)
    base_price = models.DecimalField(
        default=1500, blank=True, max_digits=10, decimal_places=2
    )
    category = models.CharField(max_length=70, blank=True, null=True)
    region_factor = models.DecimalField(
        default=100, blank=True, max_digits=10, decimal_places=2
    )
    # objects = RegionManager()

    class Meta:
        verbose_name = "Skill Pricing"

    def __str__(self):
        return self.name

    def __repr__(self):
        return "<Region: %s %s>" % (self.name, self.state)

    @classmethod
    def create_instance(cls, name, low, medium, high):
        d, _ = cls.objects.get_or_create(name=name)
        d.prices.clear()

    @classmethod
    def get_areas_as_dict(cls, state):
        val = (
            cls.objects.filter(state=state, for_parent=True)
            .order_by("pk")
            .values("name", "areas")
        )

        def update(x):
            x.update(selected=False, title=x["name"])
            x.pop("name")
            return x

        return list(map(update, val))

    @classmethod
    def default_pricing(cls, name=None, state=None, is_parent=False, **kwargs):
        if is_parent:
            default = Region.objects.filter(name=name).first()
            if not default:
                default, _ = Region.objects.get_or_create(
                    name="default pricing", for_parent=True
                )
        else:
            default = Region.objects.filter(name__icontains=name).first()

        return [
            {
                "heading": value[0],
                "perHour": int(value[1]),
                "status": x + 1,
                "selected": False,
                "factor": 1,
            }
            for x, value in enumerate(default.get_rates(state).items())
        ]

    @classmethod
    def validate_region(cls, name, state, is_parent=True):
        if cls.objects.filter(name=name).exists():
            return True
        return cls.objects.filter(name=name, state=state, for_parent=is_parent).exists()

    @classmethod
    def get_areas(cls, state, name=None):
        query = models.Q(state=state)
        if name:
            query &= models.Q(name=name)
        return list(
            cls.objects.filter(query).order_by("name").values_list("name", "name")
        )

    def determine_rates(self, plan, state=None):
        from external.models import PriceDeterminator

        st = state or self.state
        price_determinant = PriceDeterminator.get_rates()
        state_factor = price_determinant.get_state_factor(st, others=self.for_parent)
        plan_percent = price_determinant.get_plan_percent(plan)
        return self.base_price * plan_percent * state_factor * self.region_factor // 100

    @property
    def rates(self):
        return self.get_rates(None)

    def get_rates(self, state):
        options = dict(Pricing.STATUS)
        return {
            "Plan 1": self.determine_rates(options[Pricing.LOW], state),
            "Plan 2": self.determine_rates(options[Pricing.MEDIUM], state),
            "Plan 3": self.determine_rates(options[Pricing.HIGH], state),
        }

    @classmethod
    def bulk_update_skills(cls):
        from skills.models import Category

        for category in Category.objects.only("name"):
            category_name = category.name
            instances = [
                cls(category=category_name, name=skill.name)
                for skill in category.skill_set.only("name")
            ]
            cls.objects.bulk_create(instances)
