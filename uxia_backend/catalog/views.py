from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Item

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

def devolver_json_coches(items):
    data = []
    for item in items:
        data.append({
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "image": item.featured_image.url if item.featured_image else None,
            "expo": item.expo.name
        })
    return Response(data)