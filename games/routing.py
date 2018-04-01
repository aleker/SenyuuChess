from django.conf.urls import url

from games import consumers

websocket_urlpatterns = [
    url(r'ws/games/(?P<pk_game>\d+)$', consumers.GameConsumer),
]
