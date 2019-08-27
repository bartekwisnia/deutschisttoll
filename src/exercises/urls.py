from django.urls import path

from .views import (
    ExerciseCreateView,
    ExerciseListView,
    ExerciseDetailView,
    ExerciseUpdateView,
    ExerciseSetCreateView,
    ExerciseSetListView,
    ExerciseSetDetailView,
    ExerciseSetUpdateView
)

app_name = 'exercises'

urlpatterns = [
    path('exercise-list', ExerciseListView.as_view(), name='exercise-list'),
    path('exercise-create', ExerciseCreateView.as_view(), name='exercise-create'),
    path('exercise/<int:pk>/update', ExerciseUpdateView.as_view(), name='exercise-update'),
    path('exercise/<int:pk>', ExerciseDetailView.as_view(), name='exercise-detail'),
    path('exercise-set-list', ExerciseSetListView.as_view(), name='exercise-set-list'),
    path('exercise-set-create', ExerciseSetCreateView.as_view(), name='exercise-set-create'),
    path('exercise-set/<int:pk>/update', ExerciseSetUpdateView.as_view(), name='exercise-set-update'),
    path('exercise-set/<int:pk>', ExerciseSetDetailView.as_view(), name='exercise-set-detail'),
]

# path('category-list', ExerciseCategoryListView.as_view(), name='category-list'),
# path('category-create', ExerciseCategoryCreateView.as_view(), name='category-create'),
# path('category/<int:pk>/update', ExerciseCategoryUpdateView.as_view(), name='category-update'),
# path('category/<int:pk>', ExerciseCategoryDetailView.as_view(), name='category-detail'),
