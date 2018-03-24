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
        messages.add_message(self.request, messages.SUCCESS, "Room added.")
        return reverse('rooms_url')


class RoomDetailView(DetailView):
    model = Room
    template_name_suffix = '_detail_view_form'
    fields = ['id', 'password']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
