from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = ("id", "email", "display_name", "is_staff", "date_joined")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("email", "password", "display_name")}),
        ("Permissions", {"fields": ("is_active","is_staff","is_superuser","groups","user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email","password1","password2","is_staff","is_superuser"),
        }),
    )
    search_fields = ("email",)
