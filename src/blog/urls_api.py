from django.urls import path
from .views import EntryListCreate, EntryRetrieveUpdateDestroy

app_name = 'blog'

urlpatterns = [
    path('blog/', EntryListCreate.as_view(), name='blog'),
    path('blog/<int:pk>', EntryRetrieveUpdateDestroy.as_view(), name='blog-entry'),
]
