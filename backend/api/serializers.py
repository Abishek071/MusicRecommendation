from rest_framework import serializers
from .models import Track

class TrackSerializer(serializers.ModelSerializer):
    owner_email = serializers.ReadOnlyField(source="owner.email")

    class Meta:
        model = Track
        fields = ["id", "title", "mood", "cover", "audio", "created_at", "owner_email"]
