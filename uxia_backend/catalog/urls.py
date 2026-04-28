from django.urls import path
from .views import get_coches, get_expos, get_coches_expo, foto_maria, get_items_expo, login_admin, create_item_admin, edit_item_admin

urlpatterns = [
    path('coches/', get_coches, name='get_coches'),
    path('expo/', get_expos, name='get_expo'),
    path('foto/', foto_maria, name='foto_maria'),
    path('coches_expo/',get_coches_expo, name='get_coches_expo'),
    #path('save_historial/', views.save_historial, name='save_historial'),
    #path('get_historial/', views.get_historial, name='get_historial'),
    path('items_expo/<str:name_expo>/', get_items_expo),
    path("admin-login/", login_admin),
    path('items/create/', create_item_admin, name='create_item_admin'),
    path('edit-item-admin/', edit_item_admin, name='edit_item_admin'),
]