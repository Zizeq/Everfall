from django.db import models
from django.contrib.auth.models import User

class SaveSlot(models.Model):
    # Link to a user (optional for now, so you don't need a login system yet)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Which slot is this? (0-9)
    slot_index = models.IntegerField()
    
    # The name the player gave the save
    name = models.CharField(max_length=100)
    
    # The massive JSON object containing your entire game state
    data = models.JSONField()
    
    # The image data for the save screenshot
    thumbnail = models.TextField(blank=True, null=True)
    
    # When was this saved?
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Prevent duplicate slots for the same user
        unique_together = ('user', 'slot_index')

    def __str__(self):
        return f"{self.name} (Slot {self.slot_index})"