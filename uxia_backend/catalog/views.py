import tempfile
import ollama
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Item, Expo, Image
from django.db.models import Q
from .models import Historial
import locale

@api_view(['GET'])
def get_coches(request):
    items = Item.objects.all()
    return devolver_json_coches(items)

@api_view(['GET'])
def get_expo(request):
    query = request.GET.get('search', '')

    if query:
        items = Item.objects.filter(
            Q(expo__name__icontains=query) | 
            Q(coche__nombre__icontains=query)
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

@api_view(['GET'])
def get_items_expo(request, name_expo):
    items = Item.objects.filter(expo__name__iexact=name_expo)
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

@api_view(['POST'])
def save_historial(request):
    try:
        # Extraiem dades del JSON (ja que enviem Base64)
        has_consent = request.data.get('cookie', False)
        answers = request.data.get('answers', '')
        photo_base64 = request.data.get('car_photo', '')

        nuevo_historial = Historial(
            cookie=has_consent,
            maria_answers=answers
        )

        if photo_base64 and ';base64,' in photo_base64:
            format, imgstr = photo_base64.split(';base64,')
            ext = format.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name=f"camera_shot.{ext}")
            nuevo_historial.car_photo.save(f"shot_{datetime.datetime.now().timestamp()}.{ext}", data, save=False)

        nuevo_historial.save()
        return Response(status=status.HTTP_201_CREATED)
    except Exception as e:
        print(f"Error save_historial: {e}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_historial(request):
    try:
        locale.setlocale(locale.LC_TIME, "ca_ES.UTF-8")
    except:
        pass

    registros = Historial.objects.all().order_by('created_at')
    data = []
    
    for r in registros:
        data.append({
            "id": r.id,
            "car_photo": r.car_photo.url if r.car_photo else None,
            "maria_answers": r.maria_answers,
            "fecha_separador": r.created_at.strftime("%A, %d d'%B %Y").capitalize(),
            "hora": r.created_at.strftime("%H:%M"),
        })
        
    return Response(data)