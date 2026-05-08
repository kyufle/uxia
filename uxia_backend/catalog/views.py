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
from .models import Historial
from django.core.files.base import ContentFile
import base64
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import ItemCardSerializer
import requests 
import threading



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
    
    idioma_recibido = request.data.get('lang', 'ca')
    nombres_idiomas = {
        'ca': 'català',
        'es': 'castellano',
        'en': 'english',
        'fr': 'français'
    }
    idioma_final = nombres_idiomas.get(idioma_recibido[:2], 'català')

    image_file = request.FILES['image']
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
            for chunk in image_file.chunks():
                temp.write(chunk)
            temp_path = temp.name
        client = ollama.Client(host='http://192.168.1.24:11434')
        prompt_dinamico = (
            f"Identifica el cotxe d'aquesta imatge. Indica marca, model, color i any aproximat. "
            f"Afegeix característiques tècniques rellevants del vehicle. "
            f"No descriguis el fons ni l'entorn. Respon només en {idioma_final}, "
            f"en menys de cinc línies i sense negretes ni formats."
        )
        response = client.chat(
            model='qwen3-vl:30b',
            messages=[{
                'role': 'user',
                'content': prompt_dinamico,
                'images': [temp_path]
            }]
        )
        res_ia = response['message']['content']
        return Response({
            "descripcio": res_ia,
            "idioma": idioma_recibido,
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
        import json

        item_id = request.data.get('id')
        if not item_id:
            return Response({"error": "Falta el ID"}, status=400)

        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({"error": "Item no encontrado"}, status=404)

        # ✅ CAMPOS
        if 'name' in request.data:
            item.name = request.data.get('name')

        if 'description' in request.data:
            item.description = request.data.get('description')

        if 'expo' in request.data:
            expo_val = request.data.get('expo')
            if expo_val:
                try:
                    item.expo = Expo.objects.get(name__iexact=expo_val.replace('-', ' '))
                except Expo.DoesNotExist:
                    item.expo = None
            else:
                item.expo = None

        # ✅ FEATURED IMAGE
        if 'featured_image' in request.FILES:
            item.featured_image = request.FILES['featured_image']

        elif 'featured_image_id' in request.data:
            try:
                img_obj = Image.objects.get(id=request.data['featured_image_id'], item=item)
                item.featured_image = img_obj.path
                img_obj.delete()
            except Image.DoesNotExist:
                pass

        elif request.data.get('featured_image') == 'null':
            item.featured_image = None

        item.save()

        # ✅ ESTADO EXPO
        if item.expo:
            item.expo.state = "ACTUALIZABLE"
            item.expo.save()

        # 🔥 SINCRONIZAR IMÁGENES EXISTENTES
        if 'existing_images' in request.data:
            try:
                ids = json.loads(request.data.get('existing_images'))

                Image.objects.filter(item=item).exclude(id__in=ids).delete()
            except Exception as e:
                print("Error existing_images:", e)

        # 🔥 AÑADIR NUEVAS
        for img in request.FILES.getlist('images'):
            Image.objects.create(path=img, item=item, isPublic=True)

        return Response({
            "message": "Item actualizado correctamente",
            "id": item.id
        }, status=200)

    except Exception as e:
        print("ERROR:", str(e))
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
            "language": expo.language,
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
    if 'language' in request.data:
        expo.language = request.data.get('language')
    expo.save()

    return Response({
        "ok": True,
        "id": expo.id,
        "name": expo.name,
        "state": expo.state,
        "language": expo.language,
    }, status=200)

#como funciona el token de la IA en sesión:
# Backend guarda el token en sesión → se queda en el servidor, la sesion es un identificador único que el navegador guarda como cookie (sessionid) 
# → el navegador solo ve esa cookie, no el token real de la IA.
# El navegador solo recibe una cookie de sesión (sessionid)
# En cada llamada siguiente el navegador envía esa cookie → el backend la usa para recuperar el token de la IA internamente


IA_URL = "http://localhost:8765"


def get_ia_token(request):
    return request.session.get("IA_TOKEN")


@api_view(['POST'])
@permission_classes([AllowAny])
def login_maria_training(request):
    try:
        login_res = requests.post(f"{IA_URL}/auth/login", json={
            "username": "uxiaweb2",
            "password": "uxiaweb314",
            "device": "web_browser"
        }, timeout=10)
        data = login_res.json()
        token = data.get("token")
        if not token:
            return Response({"error": "No token received"}, status=500)
        request.session["IA_TOKEN"] = token
        return Response(data, status=login_res.status_code)
    except requests.exceptions.RequestException as e:
        return Response({"error": "No es pot connectar amb la IA", "details": str(e)}, status=502)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_expo(request, expo_id):
    try:
        ia_token = get_ia_token(request)
        if not ia_token:
            return Response({"error": "IA no inicialitzada"}, status=401)

        expo = Expo.objects.get(id=expo_id, owner=request.user)

        threading.Thread(
            target=run_training,
            args=(expo_id, ia_token, request.user.id)
        ).start()

        return Response({"status": "started"}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_training(request):
    try:
        ia_token = get_ia_token(request)
        if not ia_token:
            return Response({"error": "IA no inicialitzada"}, status=401)

        response = requests.get(
            f"{IA_URL}/train/check",
            headers={"Authorization": f"Bearer {ia_token}"}
        )
        data = response.json()
        print(f"[CHECK] Status: {data.get('status')} — {data}")  # ← añade esto

        expo_id = request.query_params.get("expo_id")
        if expo_id and data.get("status") == "OK":
            try:
                expo = Expo.objects.get(id=expo_id, owner=request.user)
                expo.state = "DISPONIBLE"
                expo.save()
            except Expo.DoesNotExist:
                pass

        return Response(data, status=response.status_code)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def train_log(request):
    try:
        ia_token = get_ia_token(request)
        if not ia_token:
            return Response({"error": "IA no inicialitzada"}, status=401)

        response = requests.get(
            f"{IA_URL}/train/log",
            headers={"Authorization": f"Bearer {ia_token}"}
        )
        return Response(response.json(), status=response.status_code)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


#FUNCION que hace todo el proceso de entrenamiento, se puede llamar desde un worker o similar para no bloquear el hilo principal del servidor durante el proceso.
def run_training(expo_id, ia_token, user_id):
    try:
        expo = Expo.objects.get(id=expo_id, owner_id=user_id)
        estado_anterior = expo.state

        # 1. DELETE dataset
        del_res = requests.delete(
            f"{IA_URL}/dataset/default",
            headers={"Authorization": f"Bearer {ia_token}"}
        )
        print(f"[DELETE] Status: {del_res.status_code} — {del_res.json()}")

        runtime_res = requests.get(
            f"{IA_URL}/runtime",
            headers={"Authorization": f"Bearer {ia_token}"}
        )
        print(f"[RUNTIME] Después del DELETE: {runtime_res.json()}")

        # 2. Preparar imágenes
        items = Item.objects.filter(expo=expo).prefetch_related('image_set')
        files_payload = []
        labels_payload = []

        for item in items:
            images_to_upload = []
            if item.featured_image:
                images_to_upload.append(item.featured_image)
            for img in item.image_set.all():
                images_to_upload.append(img.path)
            for img_field in images_to_upload:
                try:
                    img_field.open('rb')
                    files_payload.append(
                        ("files", (os.path.basename(img_field.name), img_field.read(), "image/jpeg"))
                    )
                    labels_payload.append(("labels", item.name))
                    img_field.close()
                except Exception as e:
                    print(f"[TRAIN] Error llegint imatge {img_field.name}: {e}")
                    continue

        print(f"[TRAIN] Total imatges: {len(files_payload)} — Labels: {[l[1] for l in labels_payload]}")

        if not files_payload:
            print("[TRAIN] No hi ha imatges, cancel·lant entrenament")
            expo.state = estado_anterior
            expo.save()
            return

        # 3. UPLOAD
        upload_res = requests.post(
            f"{IA_URL}/dataset/images",
            headers={"Authorization": f"Bearer {ia_token}"},
            files=files_payload,
            data=labels_payload
        )
        print(f"[UPLOAD] Status: {upload_res.status_code} — {upload_res.text}")

        if not upload_res.ok and upload_res.status_code != 409:
            print(f"[UPLOAD] Error fatal: {upload_res.text}")
            expo.state = estado_anterior
            expo.save()
            return

        # 4. TRAIN
        train_res = requests.post(
            f"{IA_URL}/train",
            headers={"Authorization": f"Bearer {ia_token}"}
        )
        print(f"[TRAIN] Status: {train_res.status_code} — {train_res.text}")

        if not train_res.ok:
            print(f"[TRAIN] Error: {train_res.text}")
            expo.state = estado_anterior
            expo.save()
            return

        # ✅ Solo aquí ponemos RUNNING — el train realmente arrancó
        expo.state = "RUNNING"
        expo.save()

        # 5. POLLING en el thread hasta OK o ERROR
        import time
        while True:
            time.sleep(5)
            check_res = requests.get(
                f"{IA_URL}/train/check",
                headers={"Authorization": f"Bearer {ia_token}"}
            )
            check_data = check_res.json()
            ia_status = check_data.get("status")
            print(f"[THREAD CHECK] IA status: {ia_status} — {check_data.get('global_percentage', '?')}")

            if ia_status == "OK":
                expo.state = "DISPONIBLE"
                expo.save()
                print(f"[THREAD] Entrenament completat — expo {expo_id} → DISPONIBLE")
                break
            elif ia_status in ["ERROR", "CANCELLED"]:
                expo.state = estado_anterior
                expo.save()
                print(f"[THREAD] Entrenament fallat — expo {expo_id} → {estado_anterior}")
                break

    except Exception as e:
        print(f"[THREAD] ERROR CRÍTIC: {str(e)}")
        try:
            expo = Expo.objects.get(id=expo_id, owner_id=user_id)
            expo.state = estado_anterior
            expo.save()
        except:
            pass

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_expo_state(request, expo_id):
    try:
        expo = Expo.objects.get(id=expo_id, owner=request.user)
        return Response({"state": expo.state})
    except Expo.DoesNotExist:
        return Response({"error": "Expo no trobada"}, status=404)
        