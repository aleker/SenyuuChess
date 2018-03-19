from django.urls import reverse
from django.views.generic import *
from django.contrib import messages

from rooms.models import Room


class RoomListView(ListView):
    model = Room
    paginate_by = 10


class RoomCreate(CreateView):
    model = Room
    template_name_suffix = '_create_form'
    fields = ['id', 'password']

    def get_success_url(self):
        messages.add_message(self.request, messages.SUCCESS, "Room added.")
        return reverse('rooms_url')
