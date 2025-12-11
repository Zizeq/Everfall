from django.test import TestCase, Client
import json
from .models import SaveSlot

class SaveLoadTest(TestCase):
    def test_save_and_load(self):
        c = Client()
        game_data = {'currentStoryIndex': 5, 'speaker': 'Willow'}
        
        # 1. Try Saving
        response = c.post('/api/save/', 
                          json.dumps({'slot_index': 1, 'save_data': game_data}), 
                          content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(SaveSlot.objects.filter(slot_index=1).exists())

        # 2. Try Loading
        response = c.get('/api/load/')
        data = response.json()
        self.assertEqual(data['slots']['1']['currentStoryIndex'], 5)