import tempfile
import ollama
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Item, Expo, Image
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['GET'])
def get_coches(request):
    items = Item.objects.all()
    return devolver_json_coches(items)

@api_view(['GET'])
def get_expo(request):
    query = request.GET.get('expo', '')
    if query:
        items = Item.objects.filter(expo__name__icontains=query)
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