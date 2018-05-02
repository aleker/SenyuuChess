from django.http import HttpResponseForbidden
from django.shortcuts import redirect

from rooms.models import Room


def login_room_authenticated(function):
    def wrapper(request, *args, **kwargs):
        pk_room = kwargs["pk_room"]
        try:
            if pk_room in request.session:
                room = Room.objects.get(id=pk_room)
                original_password = room.password
                if original_password == request.session[pk_room]:
                    return function(request, *args, **kwargs)
        except:
            return HttpResponseForbidden()
        return redirect('room_login_url', pk_room=pk_room)

    wrapper.__doc__ = function.__doc__
    wrapper.__name__ = function.__name__
    return wrapper
