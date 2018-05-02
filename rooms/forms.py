from django.forms import ModelForm
from django import forms
from rooms.models import Room


class RoomCreateForm(ModelForm):
    class Meta:
        model = Room
        password = forms.CharField(widget=forms.PasswordInput)
        widgets = {
            'password': forms.PasswordInput(),
        }
        fields = ['id', 'password']


class LoginRoomForm(ModelForm):
    class Meta:
        model = Room
        password = forms.CharField(widget=forms.PasswordInput)
        widgets = {
            'password': forms.PasswordInput(),
        }
        fields = ['password']
