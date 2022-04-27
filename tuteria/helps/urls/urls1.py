from django.conf.urls import url
from django.views.generic import TemplateView
from .. import views
from ..getting_started import HOW_IT_WORKS, HOW_TO_HIRE, HOW_TO_TUTOR
app_name = "help"
urlpatterns = (
    # '',
    url(regex=r"^$", view=views.HelpHome.as_view(), name="home"),
    url(regex=r"^search$", view=views.HelpSearch.as_view(), name="search"),
    url(r"^article-ajax", views.ArticleList.as_view(), name="article_ajax"),
    url(r"^helpers/$", views.helpers, name="helpers"),
    url(
        r"^how_it_works/$",
        views.HelpHome.as_view(
            template_name="helps/includes/getting-started.html",
            page_detail=HOW_IT_WORKS,
        ),
        name="how_it_works",
    ),
    # url(r'^how_it_works/$',views.HelpHome.as_view(template_name='helps/how_it_works.html',page_detail=HOW_IT_WORKS),name='how_it_works'),
    url(
        r"^how_to_hire/$",
        views.HelpHome.as_view(
            template_name="helps/includes/getting-started.html", page_detail=HOW_TO_HIRE
        ),
        name="how_to_hire",
    ),
    url(
        r"^how_to_tutor/$",
        views.HelpHome.as_view(
            template_name="helps/includes/getting-started.html",
            page_detail=HOW_TO_TUTOR,
        ),
        name="how_to_tutor",
    ),
    # Uncomment the next line to enable the admin:
    url(
        regex=r"^topic/(?P<pk>\d+)/$",
        view=views.HelpArticleDetailView.as_view(),
        name="article_detail",
    ),
    url(
        regex="^categories/(?P<slug>[\w.@+-]+)/$",
        view=views.HelpCategoryView.as_view(),
        name="article_list",
    ),
)
