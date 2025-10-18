from django.conf import settings
from django.db import models
from .validators import validate_audio_file

class Track(models.Model):
    MOOD_CHOICES = [
        ("happy", "Happy"),
        ("chill", "Chill"),
        ("focus", "Focus"),
        ("sad", "Sad")
    ]

    # who uploaded (optional but useful)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="tracks"
    )
    title = models.CharField(max_length=200)
    mood = models.CharField(max_length=10, choices=MOOD_CHOICES)
    cover = models.ImageField(upload_to="covers/")
    audio = models.FileField(upload_to="audio/", validators=[validate_audio_file])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.mood})"
