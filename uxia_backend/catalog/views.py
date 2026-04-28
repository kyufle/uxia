import tempfile
import ollama
import os
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import ItemCardSerializer
from .models import Item, Expo, Image
from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import ItemCardSerializer

@api_view(['GET'])
def get_coches(request):
    items = Item.objects.all().select_related('expo').prefetch_related('image_set')
    return devolver_json_coches(items)



@api_view(['GET'])
def get_expos(request):
    print("\n--- [BACKEND] Recopilando datos unificados ---")
    try:
        items = Item.objects.select_related('expo').prefetch_related('image_set').all()
        coches_data = devolver_json_coches(items).data 
        expos_data = []
        exposiciones = Expo.objects.all()
        for e in exposiciones:
            expos_data.append({
                "id": f"expo-{e.id}",
                "name": "",        # Vacío para que el carrusel los ignore
                "description": "", 
                "expo": e.name,
                "image": None,
                "images": []
            })
        resultado_final = coches_data + expos_data
        return Response(resultado_final)
    except Exception as e:
        print(f"--- [BACKEND] ERROR: {str(e)} ---")
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def get_expo_items(request):
    expo_query = request.query_params.get('search', None)
    try:
        if not expo_query:
            return Response({"error": "No se proporcionó el nombre de la exposición"}, status=400)
        nombre_limpio = expo_query.replace('-', ' ')
        items = Item.objects.select_related('expo').prefetch_related('image_set').filter(
            expo__name__iexact=nombre_limpio
        )
        if not items.exists():
            return Response([], status=200)
        coches_data = devolver_json_coches(items).data 
        return Response(coches_data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def get_items_expo(request, name_expo):
    items = Item.objects.none()

    if name_expo.isdigit():
        items = Item.objects.filter(expo_id=int(name_expo))
    else:
        expo_name = name_expo.replace('-', ' ').strip()
        items = Item.objects.filter(expo__name__iexact=expo_name)

    items = items.select_related('expo').prefetch_related('image_set')
    serializer = ItemCardSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_expo(request):
    query = request.GET.get('search', '')

    if query:
        items = Item.objects.filter(
            Q(expo__name__icontains=query) | 
            Q(name__icontains=query)
        ).distinct()
    else:
        items = Item.objects.all()

    return devolver_json_coches(items)

@api_view(['GET'])
def get_coches_expo(request):
    query = request.GET.get('expo', '')
    if query:
        items = Item.objects.filter(expo__name__iexact=query)
    else:
        items = Item.objects.none()
    return devolver_json_coches(items)

def devolver_json_coches(items):
    data = []
    for item in items:
        carrusel = [img.path.url for img in item.image_set.all()]

        data.append({
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "image": item.featured_image.url if item.featured_image else None,
            "images": carrusel,
            "expo": item.expo.name
        })
    return Response(data)

@api_view(['POST'])
def foto_maria(request):
    if 'image' not in request.FILES:
        return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
    image_file = request.FILES['image']
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
            for chunk in image_file.chunks():
                temp.write(chunk)
            temp_path = temp.name
        client = ollama.Client(host='http://192.168.1.24:11434')
        response = client.chat(
            model='qwen3-vl:30b',
            messages=[{
                'role': 'user',
                'content': 'Descriu aquesta imatge en menys de cinc lineas, en catalá y sense negrita ni formats especials tan sols text.',
                'images': [temp_path]
            }]
        )
        res_ia = response['message']['content']
        return Response({
            "descripcio": res_ia,
            "usuari": request.user.username if request.user.is_authenticated else "convidat"
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"ERROR CRÍTIC: {e}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

#api de login comprueba que el usuario esta en el grupo uxiaAdmin + token JWT para autenticacion en el front.
@api_view(['POST'])
def login_admin(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Credencials invàlides"},
            status=401
        )

    # comprovació de grup (permís admin)
    if not user.groups.filter(name="uxiaAdmin").exists():
        return Response(
            {"error": "No pertany al grup uxiaAdmin"},
            status=403
        )

    # 🔐 generar tokens JWT
    refresh = RefreshToken.for_user(user)

    return Response({
        "ok": True,
        "user": user.username,
        "groups": list(user.groups.values_list("name", flat=True)),
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })

@api_view(['POST'])
def create_item_admin(request):
    """
    Crea un nuevo Item. 
    Si se sube una imagen, el estado de la Expo cambia a 'ACTUALIZABLE'.
    """
    try:
        data = request.data
        
        # 1. Buscar la Expo (por ID o por Nombre)
        expo_val = data.get('expo')
        if not expo_val:
            return Response({"error": "Falta el camp 'expo'"}, status=400)
            
        try:
            if str(expo_val).isdigit():
                expo_obj = Expo.objects.get(id=int(expo_val))
            else:
                expo_obj = Expo.objects.get(name__iexact=expo_val.replace('-', ' '))
        except Expo.DoesNotExist:
            return Response({"error": "L'exposició no existeix"}, status=404)

        # 2. Obtener la imagen (si existe)
        imagen = request.FILES.get('featured_image')

        # 3. Crear el Item (featured_image será None si no se sube nada)
        nuevo_item = Item.objects.create(
            name=data.get('name'),
            description=data.get('description', ''),
            expo=expo_obj,
            featured_image=imagen 
        )

        # 4. Lógica de estado de la Expo: si hay imagen, cambia a ACTUALIZABLE
        if imagen:
            expo_obj.state = "ACTUALIZABLE"
            expo_obj.save()

        # 5. Imágenes adicionales de galería
        extra_images = request.FILES.getlist('images')
        for img in extra_images:
            Image.objects.create(path=img, item=nuevo_item, isPublic=True)

        return Response({
            "message": "Item creat amb èxit",
            "id": nuevo_item.id,
            "name": nuevo_item.name,
            "expo_state": expo_obj.state
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['POST'])
def edit_item_admin(request):
    try:
        item_id = request.data.get('id')
        if not item_id:
            return Response({"error": "Falta el ID del item"}, status=400)

        try:
            # Seleccionamos expo para evitar queries extra al cambiar el estado
            item = Item.objects.select_related('expo').get(id=item_id)
        except Item.DoesNotExist:
            return Response({"error": "Item no trobat"}, status=404)

        # --- 1. ACTUALIZAR CAMPOS DE TEXTO ---
        if 'name' in request.data:
            item.name = request.data.get('name')
        if 'description' in request.data:
            item.description = request.data.get('description')

        # --- 2. CAPTURAR ARCHIVOS ---
        new_featured = request.FILES.get('featured_image') # Del input simple
        new_gallery = request.FILES.getlist('images')     # Del input multiple

        # --- 3. LÓGICA DE ESTADO (EXPO) ---
        # Si sube CUALQUIER imagen, la expo pasa a ACTUALIZABLE
        if new_featured or new_gallery:
            expo_obj = item.expo
            if expo_obj.state != "ACTUALIZABLE":
                expo_obj.state = "ACTUALIZABLE"
                expo_obj.save()

        # --- 4. GUARDAR IMAGEN DESTACADA EN ITEM ---
        if new_featured:
            item.featured_image = new_featured
        
        item.save()

        # --- 5. GUARDAR IMÁGENES EN MODELO IMAGE (GALERÍA) ---
        if new_gallery:
            for img in new_gallery:
                # Según tus modelos: path, isPublic, item
                Image.objects.create(
                    path=img,
                    item=item,
                    isPublic=True # Por defecto las ponemos públicas al subir desde admin
                )

        return Response({
            "message": "Item i galeria actualitzats",
            "id": item.id,
            "expo_state": item.expo.state
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error edit_item: {e}")
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_expos(request):
    if not request.user.is_authenticated:
        return Response({"error": "No autenticat"}, status=401)
    
    expos = Expo.objects.filter(owner=request.user).prefetch_related('item_set__image_set')
    
    data = []
    for expo in expos:
        items_preview = []
        for item in expo.item_set.all()[:4]:  # primeros 4 items
            items_preview.append({
                "id": item.id,
                "name": item.name,
                "featured_image": item.featured_image.url if item.featured_image else None,
            })
        data.append({
            "id": expo.id,
            "name": expo.name,
            "state": expo.state,
            "creationDate": expo.creationDate,
            "items_preview": items_preview,
        })
    
    return Response(data)

