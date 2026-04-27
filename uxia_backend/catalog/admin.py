from django.contrib import admin
from django.utils.html import format_html
from .models import Expo, Item, Image, Tag, Tried


# =========================
# IMAGES INLINE (Item)
# =========================
class ImageInline(admin.TabularInline):
    model = Image
    extra = 1
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.path:
            return format_html('<img src="{}" width="100"/>', obj.path.url)
        return "-"


# =========================
# TRIED INLINE (Item)
# =========================
class TriedInline(admin.TabularInline):
    model = Tried
    fk_name = "item"
    extra = 1
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100"/>', obj.image.url)
        return "-"


# =========================
# ITEM ADMIN
# =========================
@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    inlines = [ImageInline, TriedInline]

    list_display = ("name", "expo", "featured_image_preview")
    readonly_fields = ("featured_image_preview",)

    # mejor UX para tags (SIN inline through)
    filter_horizontal = ("tags",)

    def featured_image_preview(self, obj):
        if obj.featured_image:
            return format_html('<img src="{}" width="120"/>', obj.featured_image.url)
        return "-"


# =========================
# EXPO INLINE ITEMS
# =========================
class ItemInline(admin.TabularInline):
    model = Item
    extra = 1
    readonly_fields = ("featured_image_preview",)

    def featured_image_preview(self, obj):
        if obj.featured_image:
            return format_html('<img src="{}" width="80"/>', obj.featured_image.url)
        return "-"


@admin.register(Expo)
class ExpoAdmin(admin.ModelAdmin):
    inlines = [ItemInline]


# =========================
# TAG ADMIN
# =========================
admin.site.register(Tag)


# =========================
# IMAGE ADMIN (preview global)
# =========================
@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ("item", "isPublic", "image_preview")
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.path:
            return format_html('<img src="{}" width="100"/>', obj.path.url)
        return "-"


# =========================
# TRIED ADMIN (preview global)
# =========================
@admin.register(Tried)
class TriedAdmin(admin.ModelAdmin):
    list_display = ("item", "dateAttempt", "isIdentificate", "image_preview")
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100"/>', obj.image.url)
        return "-"