from django.urls import path
from .views import check_training, get_coches, get_expo_state, get_expos, get_coches_expo, foto_maria, get_items_expo, login_admin, create_item_admin, edit_item_admin, get_my_expos, edit_expo_admin, login_maria_training, save_historial, get_historial, train_expo, train_log, classify_item_api


urlpatterns = [
    path('coches/', get_coches, name='get_coches'),
    path('expo/', get_expos, name='get_expo'),
    path('foto/', foto_maria, name='foto_maria'),
    path('coches_expo/',get_coches_expo, name='get_coches_expo'),
    path('save_historial/', save_historial, name='save_historial'),
    path('get_historial/', get_historial, name='get_historial'),
    path('items_expo/<str:name_expo>/', get_items_expo),
    path("admin-login/", login_admin),
    path('items/create/', create_item_admin, name='create_item_admin'),
    path('edit-item-admin/', edit_item_admin, name='edit_item_admin'),
    path("my-expos/", get_my_expos),
    path('expos/<int:expo_id>/edit/', edit_expo_admin, name='edit_expo_admin'),
    path('classify_item_api/', classify_item_api, name='classify_item_api'),
    path('login_maria_training/', login_maria_training),
    path('train-expo/<int:expo_id>/', train_expo),
    path('train/check/', check_training),
    path('train/log/', train_log),
    path('expo/<int:expo_id>/state/', get_expo_state),
    

]