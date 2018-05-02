from django.http import Http404
from django.shortcuts import redirect, get_object_or_404, render
from django.views.generic import RedirectView

from games.models import Game
from rooms.decorators import login_room_authenticated
from rooms.models import Room


@login_room_authenticated
def game(request, *args, **kwargs):
    pk_game = kwargs['pk_game']
    try:
        this_game = Game.objects.get(pk=pk_game)
        this_room = this_game.room
        context = {
            'game': this_game,
            'object': this_room
        }
    except Game.DoesNotExist:
        raise Http404("Game with such id does not exist!")
    except Room.DoesNotExist:
        raise Http404("Room with such id does not exist!")
    return render(request, 'games/game_view.html', context=context)


class GameRedirectView(RedirectView):
    permanent = False
    query_string = False
    pattern_name = 'room_detail_url'    # where it redirects to

    def get_redirect_url(self, *args, **kwargs):
        room = get_object_or_404(Room, pk=kwargs['pk_room'])
        return super().get_redirect_url(*args, **kwargs)
