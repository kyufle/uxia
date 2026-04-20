from django.contrib import admin

from django.utils.html import format_html

from .models import Expo, Item, Image, Tag, Tried

#inline de imagenes con preview
class ImageInline(admin.TabularInline):
    model = Image
    extra = 1
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.path:
            return format_html('<img src="{}" width="100"/>', obj.path.url)
        return "-"

#inline de intentos tmb cn preview de imagen
class TriedInline(admin.TabularInline):
    model = Tried
    fk_name = "item" #usamos esto para remarcar y que sepa cual es el fk a usar (pq hay 2 fk en el modelo)
    extra = 1
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100"/>', obj.image.url)
        return "-"

#inline de tags
class ItemTagInline(admin.TabularInline):
    model = Item.tags.through
    extra = 1

# asi es como se muestran los items en el admin, con sus imagenes, tags e intentos relacionados
@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    inlines = [ImageInline, ItemTagInline, TriedInline]

    # lo que se muestra en la lista del admin!!! solo lectura*
    list_display = ("name", "expo", "featured_image_preview")
    readonly_fields = ("featured_image_preview",)

    # preview de imagen destacada
    def featured_image_preview(self, obj):
        if obj.featured_image:
            return format_html('<img src="{}" width="120"/>', obj.featured_image.url)
        return "-"


#inline de items para el admin de expo
class ItemInline(admin.TabularInline):
    model = Item
    extra = 1


@admin.register(Expo)
class ExpoAdmin(admin.ModelAdmin):
    inlines = [ItemInline]

admin.site.register(Tag)