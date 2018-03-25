from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import *
from django.contrib import messages

from rooms.models import Room


class RoomListView(ListView):
    model = Room
    paginate_by = 10

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        return context


class RoomCreate(CreateView):
    model = Room
    template_name_suffix = '_create_form'
    fields = ['id', 'password']

    def get_success_url(self):
        context = {
            'pk_room': self.object.pk,
            'pk_game': self.object.game.pk
        }
        return reverse('game_url', kwargs=context)


class RoomDetailView(DetailView):
    model = Room
    template_name_suffix = '_detail_view_form'
    fields = ['id', 'password']
    pk_url_kwarg = "pk_room"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
