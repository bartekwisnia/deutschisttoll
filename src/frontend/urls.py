from django.urls import path, include
from .views import index
urlpatterns = [
    path('', index, name='home'),
    path('api/', include('exercises.urls_api')),
    path('api/', include('lessons.urls_api')),
    path('api/', include('dictionary.urls_api')),
    path('api/', include('blog.urls_api')),
    path('api/', include('user_profile.urls_api')),
]
