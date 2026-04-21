from django.urls import path
from .views import get_coches
from .views import get_expo
urlpatterns = [
    path('coches/', get_coches, name='get_coches'),
    path('expo/', get_expo, name='get_expo'),
]