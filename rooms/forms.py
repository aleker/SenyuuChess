from django.forms import ModelForm
from rooms.models import Room


class LoginRoomForm(ModelForm):
    class Meta:
        model = Room
        fields = ['password']
