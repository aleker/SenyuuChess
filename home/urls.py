from django.conf.urls import url

from home.views import HomeRedirectView
from . import views

urlpatterns = [
    url(r'$', views.home, name='home_url'),
    url(r'^.*$', HomeRedirectView.as_view(), name='redirect_to_home_url'),

]
