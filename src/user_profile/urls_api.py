from django.urls import path
from .views import MyProfileRetrieveUpdate, ProfileListCreate, ProfileRetrieveUpdateDestroy, StudentListCreate, \
    StudentRetrieveUpdateDestroy

app_name = 'user_profile'

urlpatterns = [
    path('my_profile/', MyProfileRetrieveUpdate.as_view(), name='my-profile'),
    path('profile/', ProfileListCreate.as_view(), name='profile-list'),
    path('profile/<int:pk>', ProfileRetrieveUpdateDestroy.as_view(), name='profile-details'),
    path('student/', StudentListCreate.as_view(), name='student-list'),
    path('student/<int:pk>', StudentRetrieveUpdateDestroy.as_view(), name='student-details'),
]
