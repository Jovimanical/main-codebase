import logging

from django.shortcuts import render
from rest_framework import generics

from ..api import ArticleSerializer

# Create your views here.
from django.views.generic import DetailView, TemplateView
from django.db.models import Q
from ..models import Article, Category

logger = logging.getLogger(__name__)


def helpers(request):
    return render(request, "helps/helpers.html")


class HelpMixin(object):
    page_detail = {}

    def get_context_data(self, **kwargs):
        context = super(HelpMixin, self).get_context_data(**kwargs)
        context["parents"] = Category.objects.with_children()
        context.update(page_detail=self.page_detail)
        return context


class HelpHome(HelpMixin, TemplateView):
    model = Category
    template_name = "helps/home.html"


class HelpSearch(HelpMixin, TemplateView):
    template_name = "helps/search.html"

    def get_context_data(self, **kwargs):
        context = super(HelpSearch, self).get_context_data(**kwargs)
        if "query" in self.request.GET:
            logger.info(self.request.GET)
            new_search = self.request.GET["query"].lower().replace("how to", "")
            q1 = Q(body__icontains=new_search)
            q2 = Q(question__icontains=new_search)
            articles = Article.objects.filter(q1 | q2)
        else:
            articles = []
        context.update(articles=articles, search_text=self.request.GET.get("query"))
        return context


class HelpArticleDetailView(HelpMixin, DetailView):
    model = Article
    template_name = "helps/detail.html"


class HelpCategoryView(HelpMixin, DetailView):
    model = Category
    template_name = "helps/list.html"


class ArticleList(generics.ListAPIView):
    model = Article
    serializer_class = ArticleSerializer
    queryset = Article.objects.all()

    # def get_queryset(self):
    #     queryset = Article.objects.all()
    #     q = self.request.QUERY_PARAMS.get('query', None)
    #     if q is not None:
    #         queryset = queryset.filter(question__icontains=q)
    #     return queryset
