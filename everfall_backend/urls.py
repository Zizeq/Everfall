# everfall_backend/urls.py
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from game_data import views # Assuming you have a view for index.html

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'), # Serves your index.html
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)