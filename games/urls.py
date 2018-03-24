from django.conf.urls import url
from django.views.generic import RedirectView

from . import views

urlpatterns = [
    url(r'(?P<pk_game>\d+)$', views.game, name='game_url'),
    url(r'^.*$', RedirectView.as_view(url='home_url', permanent=False), name='index'),

]
