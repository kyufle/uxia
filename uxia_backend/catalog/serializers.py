from rest_framework import serializers
from .models import Item, Tried

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'description', 'featured_image', 'expo', 'tags']

class TriedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tried
        fields = "__all__"
        read_only_fields = ("identifiedItem", "isIdentificate")