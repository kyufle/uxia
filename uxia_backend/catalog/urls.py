from django.urls import path
from .views import get_coches, get_expo, get_coches_expo, foto_maria, get_items_expo

urlpatterns = [
    path('coches/', get_coches, name='get_coches'),
    path('expo/', get_expo, name='get_expo'),
    path('foto/', foto_maria, name='foto_maria'),
    path('coches_expo/',get_coches_expo, name='get_coches_expo'),
    path('items_expo/<str:name_expo>/', get_items_expo)
]