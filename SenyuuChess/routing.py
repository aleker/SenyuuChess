from channels.http import AsgiHandler
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.conf.urls import url

import games.routing as game_routing

application = ProtocolTypeRouter({
    # 'http': AsgiHandler,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            game_routing.websocket_urlpatterns
        )
    ),
})
