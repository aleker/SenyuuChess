from django.shortcuts import render
from django.views.generic import RedirectView


def home(request, *args, **kwargs):
    return render(request, 'home.html')


class HomeRedirectView(RedirectView):
    permanent = False
    query_string = False
    pattern_name = 'home_url'    # where it redirects to
