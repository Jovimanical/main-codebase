from autoslug.utils import slugify
from django.urls import reverse
from django.db import models
from django_extensions.db.fields import AutoSlugField


class CategoryManager(models.Manager):
    def with_children(self):
        return (
            self.get_queryset()
            .filter(parent=None)
            .select_related("parent")
            .prefetch_related("sub_categories")
        )


class Category(models.Model):
    name = models.CharField(max_length=70, db_index=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        related_name="sub_categories",
        blank=True,
        on_delete=models.SET_NULL,
    )
    slug = AutoSlugField(populate_from="name")
    objects = CategoryManager()

    def __str__(self):
        return self.name

    def parent_cat(self):
        if self.parent:
            return self.parent
        return self

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        if not self.slug:
            self.slug = slugify(self.name)
        super(Category, self).save(force_insert, force_update, using, update_fields)

    def get_absolute_url(self):
        return reverse("help:article_list", args=[self.slug])

    def content(self):
        categories = self.sub_categories.all()
        return [categories[i : i + 2] for i in range(0, len(categories), 2)]


class Article(models.Model):
    question = models.CharField(max_length=100)
    body = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        verbose_name = "Help Article"
        verbose_name_plural = "Help Articles"

    def __str__(self):
        return self.question

    def get_absolute_url(self):
        return reverse("help:article_detail", args=[self.id])
