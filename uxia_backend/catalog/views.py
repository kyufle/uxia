import tempfile
import ollama
import os
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from .serializers import ItemCardSerializer
from .models import Item, Expo, Image
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import Historial
from django.core.files.base import ContentFile
import base64
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import ItemCardSerializer
import requests


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
def save_historial(request):
    try:
        user_id = request.data.get('cookie')
        descripcion = request.data.get('answers')
        image_data = request.data.get('car_photo')

        if not image_data:
            return Response({"error": "No hay imagen"}, status=400)
        try:
            format, imgstr = image_data.split(';base64,')
            ext = format.split('/')[-1]
            filename = f"{user_id}_{os.urandom(4).hex()}.{ext}"
            data = ContentFile(base64.b64decode(imgstr), name=filename)
        except Exception as e:
            return Response({"error": f"Error procesando imagen: {str(e)}"}, status=400)
        nuevo = Historial.objects.create(
            cookie=True, 
            car_photo=data,
            maria_answers=descripcion
        )

        return Response({"status": "ok"}, status=201)
    except Exception as e:
        print(f"ERROR CRITICO EN SAVE: {str(e)}")
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def get_historial(request):
    try:
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response([], status=200)
        todos = Historial.objects.all().order_by('created_at')
        resultado = []

        for h in todos:
            if h.car_photo and os.path.basename(h.car_photo.name).startswith(str(user_id)):
                resultado.append({
                    "id": h.id,
                    "maria_answers": h.maria_answers,
                    "car_photo": h.car_photo.url,
                    "fecha_separador": h.created_at.strftime("%d/%m/%Y"),
                    "hora": h.created_at.strftime("%H:%M")
                })

        return Response(resultado, status=200)
    except Exception as e:
        print(f"ERROR CRITICO EN GET: {str(e)}")
        return Response({"error": str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def edit_item_admin(request):
    try:
        item_id = request.data.get('id')
        if not item_id:
            return Response({"error": "Falta el ID para identificar el item"}, status=400)

        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({"error": f"No se ha encontrado el item con ID {item_id}"}, status=404)

        if 'name' in request.data:
            item.name = request.data.get('name')

        if 'description' in request.data:
            item.description = request.data.get('description')

        expo_val = request.data.get('expo')
        if expo_val:
            try:
                expo_obj = Expo.objects.get(name__iexact=expo_val.replace('-', ' '))
                item.expo = expo_obj
            except Expo.DoesNotExist:
                pass

        if 'featured_image' in request.FILES:
            item.featured_image = request.FILES['featured_image']

        # ✅ imagen de galería existente pasa a ser destacada
        if 'featured_image_id' in request.data:
            try:
                img_obj = Image.objects.get(id=request.data['featured_image_id'], item=item)
                item.featured_image = img_obj.path
                img_obj.delete()
            except Image.DoesNotExist:
                pass

        item.save()

        item.expo.state = "ACTUALIZABLE"
        item.expo.save()

        extra_images = request.FILES.getlist('images')
        for img in extra_images:
            Image.objects.create(path=img, item=item, isPublic=True)

        return Response({
            "message": "Item actualizado correctamente",
            "id": item.id,
            "name": item.name
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error en edit_item_admin: {str(e)}")
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

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def edit_expo_admin(request, expo_id):
    try:
        expo = Expo.objects.get(id=expo_id, owner=request.user)
    except Expo.DoesNotExist:
        return Response({"error": "Expo no trobada"}, status=404)

    if 'name' in request.data:
        expo.name = request.data.get('name')
    if 'state' in request.data:
        expo.state = request.data.get('state')

    expo.save()

    return Response({
        "ok": True,
        "id": expo.id,
        "name": expo.name,
        "state": expo.state,
    }, status=200)

@api_view(['POST']) # CAMBIADO A POST: El curl que funciona usa POST
@permission_classes([AllowAny])
def login_maria_training(request):
    """
    POST /auth/login (Intermediaria)
    Recibe las credenciales o usa las de por defecto y pide el token a la IA.
    """
    url_ia = "http://localhost:8765/auth/login"
    
    # Intentamos pillar las credenciales del request, si no, usamos las fijas que te funcionan
    username = request.data.get("username", "uxiaweb2")
    password = request.data.get("password", "uxiaweb314")
    device = request.data.get("device", "web_browser")

    payload = {
        "username": username,
        "password": password,
        "device": device
    }
    
    try:
        # Llamada real a la IA externa
        response_ia = requests.post(url_ia, json=payload, timeout=10)
        data = response_ia.json()
        
        # Retornamos la respuesta de la IA (incluyendo el token) a nuestro frontend
        return Response(data, status=response_ia.status_code)
        
    except requests.exceptions.RequestException as e:
        return Response({
            "error": "No s'ha pogut connectar amb el servei d'IA extern",
            "details": str(e)
        }, status=status.HTTP_502_BAD_GATEWAY)

@api_view(['POST'])
@authentication_classes([]) 
@permission_classes([AllowAny])
def classify_item_id(request):
    image_file = request.FILES.get('image')
    expo_id = request.data.get('expo_id')

    if not image_file:
        return Response({"error": "No s'ha proporcionat cap imatge"}, status=400)

    url_ia = "http://localhost:8765/classify"
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return Response({"error": "Falta el token d'autorització"}, status=401)

    image_file.seek(0)
    files = [('image', (image_file.name, image_file.read(), image_file.content_type))]
    headers = {'Authorization': auth_header, 'accept': 'application/json'}

    try:
        response_ia = requests.post(url_ia, headers=headers, files=files, timeout=60)
        
        # Si la IA devuelve un error (como el 503 de modelo no entrenado)
        if response_ia.status_code != 200:
            return Response({
                "error": "La IA encara no està a punt",
                "status": response_ia.status_code,
                "details": response_ia.json() if response_ia.headers.get('content-type') == 'application/json' else response_ia.text
            }, status=response_ia.status_code)

        ia_data = response_ia.json()
        prediction = ia_data.get('prediction') # Ej: "Tesla Model S"

        # 1. Limpiar el ID de la expo
        clean_expo_id = str(expo_id).replace('expo-', '')
        
        # 2. Búsqueda inteligente: 
        # Buscamos items que pertenezcan a esa expo Y cuyo nombre esté contenido en la predicción 
        # o que la predicción contenga el nombre del item.
        item_match = Item.objects.filter(expo_id=clean_expo_id).filter(
            Q(name__icontains=prediction) | Q(description__icontains=prediction)
        ).first()

        if item_match:
            # Serializamos la respuesta manualmente para asegurar compatibilidad
            return Response({
                "match": True,
                "prediction": prediction,
                "item": {
                    "id": item_match.id,
                    "name": item_match.name,
                    "description": item_match.description,
                    "image": item_match.featured_image.url if item_match.featured_image else None,
                }
            }, status=200)
        
        # Feedback si hay predicción pero no hay match en la BD de esa Expo
        return Response({
            "match": False, 
            "prediction": prediction,
            "message": f"S'ha identificat '{prediction}', però no consta a la base de dades d'aquesta exposició."
        }, status=200)

    except requests.exceptions.ConnectionError:
        return Response({"error": "Servei temporalment no disponible (Túnel offline)."}, status=503)
    except Exception as e:
        return Response({"error": f"Error del sistema: {str(e)}"}, status=500)