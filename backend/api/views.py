from rest_framework import viewsets, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Track
from .serializers import TrackSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner_id == getattr(request.user, "id", None)

class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all().order_by("-created_at")
    serializer_class = TrackSerializer
    parser_classes = [MultiPartParser, FormParser]

    # 🔓 Let anyone list/retrieve/create; restrict update/delete to owners
    def get_permissions(self):
      if self.action in ["list", "retrieve", "create"]:
          return [permissions.AllowAny()]
      return [permissions.IsAuthenticatedOrReadOnly(), IsOwnerOrReadOnly()]

    def perform_create(self, serializer):
        user = getattr(self.request, "user", None)
        serializer.save(owner=user if getattr(user, "is_authenticated", False) else None)
