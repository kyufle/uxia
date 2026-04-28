import os
import random
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from django.contrib.auth.models import User, Group

from faker import Faker
from catalog.models import Expo, Item, Image


class Command(BaseCommand):
    help = "Seeder 2: Genera Expo usando fotos de Internet_coches con usuarios y owner"

    def handle(self, *args, **kwargs):
        fake = Faker("es_ES")

        base_dir = Path(settings.BASE_DIR)
        source_dir = os.path.join(base_dir, "Internet_coches")

        if not os.path.exists(source_dir):
            self.stdout.write(
                self.style.ERROR(f"No encuentro la carpeta en: {source_dir}")
            )
            return

        # --------------------------------------------------
        # 1. GRUPO UXIAADMIN
        # --------------------------------------------------
        group, _ = Group.objects.get_or_create(name="uxiaAdmin")
        self.stdout.write("Grupo uxiaAdmin verificado")

        # --------------------------------------------------
        # 2. USUARIOS ALEATORIOS
        # --------------------------------------------------
        nombres_base = ["marcos", "lucas", "sergio", "daniel", "adrian", "pablo"]

        users = []

        for name in nombres_base:
            username = name[:4]  # asegurar >= 4 letras base
            username = username + str(random.randint(10, 99))  # evitar colisiones

            user, created = User.objects.get_or_create(username=username)

            if created:
                password = username + "12345"
                user.set_password(password)
                user.save()

                self.stdout.write(f"Usuario creado: {username} / {password}")
            else:
                self.stdout.write(f"Usuario ya existe: {username}")

            user.groups.add(group)
            users.append(user)

        # --------------------------------------------------
        # 3. IMÁGENES
        # --------------------------------------------------
        image_files = []
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                if file.lower().endswith((".jpg", ".jpeg", ".png", ".heic")):
                    image_files.append(os.path.join(root, file))

        if not image_files:
            self.stdout.write(
                self.style.ERROR("No se encontraron imágenes dentro de Internet_coches")
            )
            return

        # --------------------------------------------------
        # 4. EXPO CON OWNER
        # --------------------------------------------------
        expo = Expo.objects.create(
            name=f"{fake.city()} Expo",
            state="DISPONIBLE",
            creationDate=fake.date_this_year(),
            owner=random.choice(users),
        )

        self.stdout.write(f"Expo creada: {expo.name} (owner: {expo.owner.username})")

        # --------------------------------------------------
        # 5. ITEMS
        # --------------------------------------------------
        marcas = ["Seat", "Ford", "Toyota", "Renault", "Volkswagen", "Tesla", "BMW", "Audi", "Peugeot", "Kia"]
        modelos = ["Leon", "Focus", "Corolla", "Clio", "Golf", "Model 3", "Serie 3", "A3", "208", "Sportage"]

        for i in range(6):
            featured_img = random.choice(image_files)
            nombre_coche = f"{random.choice(marcas)} {random.choice(modelos)}"

            item = Item.objects.create(
                name=nombre_coche,
                description=f"Un espectacular {nombre_coche} disponible para la expo.",
                expo=expo,
            )

            try:
                # featured image
                with open(featured_img, "rb") as f:
                    item.featured_image.save(
                        f"int_{os.path.basename(featured_img)}", File(f), save=True
                    )

                # imágenes extra
                for _ in range(2):
                    extra_img = random.choice(image_files)
                    with open(extra_img, "rb") as f:
                        img = Image.objects.create(item=item, isPublic=True)
                        img.path.save(
                            f"int_extra_{os.path.basename(extra_img)}",
                            File(f),
                            save=True,
                        )

            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f"Error al procesar {nombre_coche}: {e}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"¡Éxito! Expo '{expo.name}' creada correctamente.")
        )