import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import SaveSlot

# 1. The Home Page
def index(request):
    return render(request, 'index.html')

# 2. Save Game API (Receives JSON from browser)
@require_http_methods(["POST"])
def save_game_api(request):
    try:
        # Parse the JSON sent by JavaScript
        data = json.loads(request.body)
        
        slot_index = data.get('slot_index')
        save_data = data.get('save_data')

        # Create or Update the save slot in the database
        obj, created = SaveSlot.objects.update_or_create(
            slot_index=slot_index,
            defaults={
                'name': save_data.get('name', 'Untitled'),
                'data': save_data,
                'thumbnail': save_data.get('thumbnail', '')
            }
        )
        return JsonResponse({'status': 'success', 'message': 'Game saved to database.'})
    except Exception as e:
        print(f"Error saving game: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

# 3. Load Game API (Sends JSON to browser)
@require_http_methods(["GET"])
def load_game_api(request):
    try:
        # Get all save slots
        saves = SaveSlot.objects.all().order_by('slot_index')
        
        # Convert them into a dictionary format your JS expects
        save_list = {}
        for save in saves:
            save_list[save.slot_index] = save.data
        
        return JsonResponse({'status': 'success', 'slots': save_list})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)