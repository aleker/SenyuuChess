from django.shortcuts import render


def home(request, *args, **kwargs):
    return render(request, 'home.html')
