from django.shortcuts import redirect
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.generic import *
from django.contrib import messages

from rooms.decorators import login_room_authenticated
from rooms.forms import LoginRoomForm
from rooms.models import Room


class RoomListView(ListView):
    model = Room
    paginate_by = 10

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        return context


class RoomLogin(FormView):
    template_name = 'room_login.html'
    form_class = LoginRoomForm
    success_url = 'room_detail_url'

    def form_valid(self, form):
        # This method is called when valid form data has been POSTed.
        # It should return an HttpResponse.
        form_password = form.cleaned_data.get('password')
        room = Room.objects.get(id=self.kwargs["pk_room"])
        if room:
            original_password = room.password
            pk_room = self.kwargs["pk_room"]
            if original_password == form_password:
                self.request.session[pk_room] = original_password
                return redirect('room_detail_url', pk_room=pk_room)
            else:
                messages.add_message(self.request, messages.ERROR, 'Incorrect password!')
                return redirect('room_login_url', pk_room=pk_room)

    def form_invalid(self, form):
        pass


class RoomCreate(CreateView):
    model = Room
    template_name_suffix = '_create_form'
    fields = ['id', 'password']

    def get_success_url(self):
        original_password = self.object.password
        self.request.session[self.object.pk] = original_password
        context = {
            'pk_room': self.object.pk,
            'pk_game': self.object.game.pk
        }
        return reverse('game_url', kwargs=context)


@method_decorator(login_room_authenticated, name='dispatch')
class RoomDetailView(DetailView):
    model = Room
    template_name_suffix = '_detail_view_form'
    fields = ['id', 'password']
    pk_url_kwarg = "pk_room"

    def get_context_data(self, **kwargs):
        # TODO assign color (let them choose?), the rest can observe?
        # TODO delete game -> create new game
        context = super().get_context_data(**kwargs)
        return context
