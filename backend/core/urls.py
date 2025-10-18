# core/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView  # ✅ correct import
from api.views import TrackViewSet

router = DefaultRouter()
router.register("tracks", TrackViewSet, basename="track")

urlpatterns = [
    path("admin/", admin.site.urls),

    # your API
    path("api/", include(router.urls)),
     path("api/", include("api.urls")), 

    # your accounts endpoints (register/me)
    path("api/auth/", include("accounts.urls")),

    # ✅ simplejwt endpoints
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# (dev) media files
from django.conf import settings
from django.conf.urls.static import static
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
