from django.http import Http404
from django.shortcuts import redirect

from games.models import Game


def game(request, *args, **kwargs):
    pk_game = kwargs['pk_game']
    try:
        game = Game.objects.get(pk=pk_game)
    except Game.DoesNotExist:
        raise Http404("Game does not exist")
    return redirect('game_url', pk_game=pk_game)

