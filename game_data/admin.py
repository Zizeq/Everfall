from django.contrib import admin
from .models import SaveSlot

@admin.register(SaveSlot)
class SaveSlotAdmin(admin.ModelAdmin):
    list_display = ('name', 'slot_index', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('name',)
    ordering = ('slot_index',)
    
    # This makes the JSON data look pretty in the admin panel
    def get_readonly_fields(self, request, obj=None):
        return ('updated_at',)