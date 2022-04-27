from django.conf.urls import url

from . import andablog_views as views

urlpatterns = [
    url("^$", views.EntriesList.as_view(), name="entrylist"),
    url(
        r"^(?P<slug>[A-Za-z0-9-_]+)/$", views.EntryDetail.as_view(), name="entrydetail"
    ),
    url(
        r"^(?P<category_slug>[\w.@+-]+)/(?P<slug>[A-Za-z0-9-_]+)/$",
        view=views.EntryDetail.as_view(),
        name="blog_with_category",
    ),
]
