import os
from django.core.exceptions import ValidationError

def validate_audio_file(file):
    ext = os.path.splitext(file.name)[1].lower()
    valid_audio_extensions = ['.mp3', '.wav', '.m4a']
    if ext not in valid_audio_extensions:
        raise ValidationError(f"Unsupported audio format: {ext}. Allowed: {', '.join(valid_audio_extensions)}")
