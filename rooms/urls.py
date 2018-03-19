from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.RoomListView.as_view(), name='rooms_url'),
    url(r'create/$', views.RoomCreate.as_view(), name='room_create_url'),
]
