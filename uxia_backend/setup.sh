#!/bin/bash
echo "Creando entorno virtual..."
python3 -m venv venv

echo "Activando entorno..."
source venv/bin/activate

if [ -f "requirements.txt" ]; then
    echo "Instalando dependencias desde requirements.txt..."
    pip install --upgrade pip
    pip install -r requirements.txt
else
    echo "No se encontró requirements.txt, saltando instalación."
fi

echo "Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate

echo "Ejecutando seeder: seed_expo..."
python manage.py seed_expo

echo "Ejecutando seeder: seed_expo2..."
python manage.py seed_expo2

echo "¡Todo listo! El entorno está configurado y los datos cargados."
python manage.py runserver