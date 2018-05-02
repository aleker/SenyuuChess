from django.conf.urls import url
from django.urls import include

from . import views
from games import  views as game_views

urlpatterns = [
    url(r'^$', views.RoomListView.as_view(), name='rooms_url'),
    url(r'create/$', views.RoomCreate.as_view(), name='room_create_url'),
    url(r'(?P<pk_room>\d+)/games/', include('games.urls')),
    url(r'(?P<pk_room>\d+)/login$', views.RoomLogin.as_view(), name='room_login_url'),
    url(r'(?P<pk_room>\d+)$', views.RoomDetailView.as_view(), name='room_detail_url'),

]
