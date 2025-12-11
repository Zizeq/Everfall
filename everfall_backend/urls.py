# everfall_backend/urls.py
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from game_data import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'), # Serves your game
    
    # --- New API Endpoints ---
    path('api/save/', views.save_game_api, name='save_game_api'),
    path('api/load/', views.load_game_api, name='load_game_api'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)