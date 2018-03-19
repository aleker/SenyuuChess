from django.urls import reverse
from django.views.generic import *
from django.contrib import messages

from rooms.models import Room


def create_session_key(request):
    if not request.session.exists(request.session.session_key):
        request.session.create()


class RoomListView(ListView):
    model = Room
    paginate_by = 10

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        # TODO remove creating session key from this place
        create_session_key(self.request)
        return context


class RoomCreate(CreateView):
    model = Room
    template_name_suffix = '_create_form'
    fields = ['id', 'password']

    def get_success_url(self):
        messages.add_message(self.request, messages.SUCCESS, "Room added.")
        return reverse('rooms_url')
