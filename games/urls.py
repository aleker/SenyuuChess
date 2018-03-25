from django.conf.urls import url

from games.views import GameRedirectView
from . import views

urlpatterns = [
    url(r'(?P<pk_game>\d+)$', views.game, name='game_url'),
    url(r'^.*$', GameRedirectView.as_view(), name='redirect_to_room_url'),

]
