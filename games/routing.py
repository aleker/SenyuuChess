from django.conf.urls import url

from games import consumers

websocket_urlpatterns = [
    url(r'rooms/(?P<pk_room>\d+)/games/(?P<pk_game>\d+)$', consumers.GameConsumer),
]