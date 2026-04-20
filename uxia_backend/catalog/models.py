from django.db import models

class Expo(models.Model):
    name = models.CharField(max_length=100)
    state = models.CharField(max_length=15, 
        choices=[("INIT","INIT"), ("DISPONIBLE","DISPONIBLE"), 
        ("ACTUALIZABLE","ACTUALIZABLE")], 
        default="INIT")
    creationDate = models.DateField()

    def __str__(self):
        return f"{self.name} ({self.state} - {self.creationDate})"


class Tag(models.Model):
    name = models.CharField(max_length=50)
    parentTag = models.ForeignKey('self', on_delete=models.CASCADE, 
        null=True, blank=True)

    def __str__(self):
        if self.parentTag:
            return f"{self.name} (El tag pare es {self.parentTag.name})"
        return f"{self.name}"


class Item(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    expo = models.ForeignKey(Expo, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag, blank=True)

    def __str__(self):
        return f"{self.name} (pertany a l'expo {self.expo.name})"


class Image(models.Model):
    path = models.ImageField(upload_to='images/')
    isPublic = models.BooleanField(default=False)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)

    def __str__(self):
        typeImage = "Publica" if self.isPublic else "Privada"
        return f"Imatge de {self.item.name} ({typeImage})"


class Tried(models.Model):
    image = models.ImageField(upload_to='intents/')  # ✅ ahora es imagen propia
    dateAttempt = models.DateField()
    isIdentificate = models.BooleanField(default=False)
    identifiedItem = models.ForeignKey(  # ✅ resultado de la IA
        Item, on_delete=models.SET_NULL, 
        null=True, blank=True
    )

    def __str__(self):
        state = "Identificat" if self.isIdentificate else "No identificat"
        return f"Intent del {self.dateAttempt} ({state})"