import os
import random
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from faker import Faker
from catalog.models import Expo, Item, Image

class Command(BaseCommand):
    help = 'Seeder 2: Genera Expo usando fotos de Internet_coches con nombres de coches reales'

    def handle(self, *args, **kwargs):
        fake = Faker('es_ES')
        
        # Ruta base desde uxia_backend
        base_dir = Path(settings.BASE_DIR)
        source_dir = os.path.join(base_dir, 'coches', 'Internet_coches')
        
        # Verificación de la carpeta
        if not os.path.exists(source_dir):
            self.stdout.write(self.style.ERROR(f"No encuentro la carpeta en: {source_dir}"))
            return

        # Listas de marcas y modelos para nombres realistas
        marcas = ["Seat", "Ford", "Toyota", "Renault", "Volkswagen", "Tesla", "BMW", "Audi", "Peugeot", "Kia"]
        modelos = ["Leon", "Focus", "Corolla", "Clio", "Golf", "Model 3", "Serie 3", "A3", "208", "Sportage"]

        # Recopilar imágenes
        image_files = []
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                if file.lower().endswith(('.jpg', '.jpeg', '.png', '.heic')):
                    image_files.append(os.path.join(root, file))

        if not image_files:
            self.stdout.write(self.style.ERROR("No se encontraron imágenes dentro de Internet_coches"))
            return

        # Crear Expo
        ciudades = ["Madrid", "Barcelona", "Valencia", "Sevilla"]
        expo = Expo.objects.create(
            name=f"{random.choice(ciudades)} Expo",
            state="DISPONIBLE",
            creationDate=fake.date_this_year()
        )

        # Crear 6 items
        for i in range(6):
            # Elegir foto destacada al azar
            featured_img = random.choice(image_files)
            
            # Nombre de coche aleatorio
            nombre_coche = f"{random.choice(marcas)} {random.choice(modelos)}"
            
            item = Item.objects.create(
                name=nombre_coche,
                description=f"Un espectacular {nombre_coche} disponible para la expo.",
                expo=expo
            )

            try:
                # Guardar imagen destacada
                with open(featured_img, 'rb') as f:
                    item.featured_image.save(f"int_{os.path.basename(featured_img)}", File(f), save=True)

                # Asignar 2 imágenes extra
                for _ in range(2):
                    extra_img = random.choice(image_files)
                    with open(extra_img, 'rb') as f:
                        new_img = Image.objects.create(item=item, isPublic=True)
                        new_img.path.save(f"int_extra_{os.path.basename(extra_img)}", File(f), save=True)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Error al procesar imagen para {nombre_coche}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"¡Éxito! Expo '{expo.name}' creada con 6 coches."))