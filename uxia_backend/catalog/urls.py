from django.urls import path
from .views import get_coches, get_expo, foto_maria

urlpatterns = [
    path('coches/', get_coches, name='get_coches'),
    path('expo/', get_expo, name='get_expo'),
    path('foto/', foto_maria, name='foto_maria'),
]