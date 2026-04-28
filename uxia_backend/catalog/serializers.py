from rest_framework import serializers
from .models import Item, Tried, Image

class ImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ['id', 'url', 'isPublic']

    def get_url(self, obj):
        return obj.path.url if obj.path else None

class ItemCardSerializer(serializers.ModelSerializer):
    expo = serializers.CharField(source='expo.name')
    expo_id = serializers.IntegerField(source='expo.id')
    featured_image = serializers.SerializerMethodField()
    images = ImageSerializer(source='image_set', many=True)
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = ['id', 'name', 'description', 'short_description', 'featured_image', 'expo', 'expo_id', 'images']

    def get_featured_image(self, obj):
        return obj.featured_image.url if obj.featured_image else None

    def get_short_description(self, obj):
        if not obj.description:
            return ''
        max_length = 120
        text = obj.description.strip()
        return text if len(text) <= max_length else text[:max_length].rstrip() + '...'

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'name', 'description', 'featured_image', 'expo', 'tags']

class TriedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tried
        fields = "__all__"
        read_only_fields = ("identifiedItem", "isIdentificate")