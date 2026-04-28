import os
from datetime import date

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from django.db import transaction

from django.contrib.auth.models import User, Group

from catalog.models import Expo, Item, Image


class Command(BaseCommand):
    help = "Carga inicial segura de la Expo IETI CAR SHOW"

    def handle(self, *args, **kwargs):
        coches_source_path = os.path.join(settings.BASE_DIR, "coches")

        if not os.path.exists(coches_source_path):
            self.stderr.write(
                f"ERROR: No encuentro la carpeta 'coches' en {coches_source_path}"
            )
            return

        self.stdout.write("Iniciando carga de datos...")

        try:
            with transaction.atomic():

                # --------------------------------------------------
                # 1. GRUPO UXIAADMIN
                # --------------------------------------------------
                group, _ = Group.objects.get_or_create(name="uxiaAdmin")
                self.stdout.write("Grupo uxiaAdmin verificado/creado")

                # --------------------------------------------------
                # 2. USUARIO DEFAULT
                # --------------------------------------------------
                user, created = User.objects.get_or_create(
                    username="user"
                )

                if created:
                    user.set_password("user12345")
                    user.save()
                    self.stdout.write("Usuario 'user' creado")
                else:
                    self.stdout.write("Usuario 'user' ya existía")

                # añadir al grupo
                user.groups.add(group)

                # --------------------------------------------------
                # 3. EXPO
                # --------------------------------------------------
                expo, _ = Expo.objects.get_or_create(
                    name="IETI CAR SHOW",
                    defaults={
                        "creationDate": date.today(),
                        "state": "INIT",
                        "owner": user,
                    },
                )

                # si ya existía pero no tenía owner
                if not expo.owner:
                    expo.owner = user
                    expo.save()

                self.stdout.write(f"Expo creada/asignada: {expo.name}")

                # --------------------------------------------------
                # 4. ITEMS + IMÁGENES
                # --------------------------------------------------
                for folder_name in os.listdir(coches_source_path):
                    folder_path = os.path.join(coches_source_path, folder_name)

                    if os.path.isdir(folder_path):
                        item, _ = Item.objects.get_or_create(
                            name=folder_name,
                            expo=expo,
                            defaults={
                                "description": f"Coche de la serie {folder_name}"
                            },
                        )

                        self.stdout.write(f"Procesando: {item.name}")

                        for filename in os.listdir(folder_path):
                            if filename.lower().endswith(
                                (".png", ".jpg", ".jpeg", ".heic")
                            ):
                                file_path = os.path.join(folder_path, filename)

                                try:
                                    with open(file_path, "rb") as f:
                                        django_file = File(f, name=filename)

                                        Image.objects.create(
                                            item=item,
                                            path=django_file,
                                            isPublic=True,
                                        )

                                        if not item.featured_image:
                                            item.featured_image.save(
                                                filename, django_file, save=False
                                            )
                                            item.save()

                                except Exception as e:
                                    self.stderr.write(
                                        f"   -> Error en {filename}: {e}"
                                    )

            self.stdout.write(
                self.style.SUCCESS("¡ÉXITO! Seeding completado correctamente.")
            )

        except Exception as e:
            self.stderr.write(
                self.style.ERROR(f"Error crítico en la transacción: {e}")
            )