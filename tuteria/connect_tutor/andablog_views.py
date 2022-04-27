from django.db.models import Q
from django.views.generic import ListView, DetailView

from andablog import models
from .models import BlogArticle


class EntriesList(ListView):
    model = models.Entry
    template_name = "andablog/entry_list.html"
    context_object_name = "entries"
    paginate_by = 6
    paginate_orphans = 5

    def get_queryset(self):
        queryset = (
            super(EntriesList, self)
            .get_queryset()
            .filter(
                Q(is_published=True)
                | Q(author__isnull=False, author=self.request.user.id)
            )
            .exclude(link__category__name__istartswith="referral")
        )
        return queryset.order_by(
            "is_published", "-published_timestamp"
        )  # Put 'drafts' first.


class EntryDetail(DetailView):
    model = models.Entry
    template_name = "andablog/entry_detail.html"
    context_object_name = "entry"
    slug_field = "slug"

    def get_queryset(self):
        category = self.kwargs.get("category_slug")
        queryset = (
            super(EntryDetail, self)
            .get_queryset()
            .filter(
                Q(is_published=True)
                | Q(author__isnull=False, author=self.request.user.id)
            )
        )
        if category:
            return queryset.filter(link__category__slug=category)
        return queryset
