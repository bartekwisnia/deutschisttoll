from django.urls import path

from .views import (
    ExerciseCreateView,
    ExerciseListView,
    ExerciseDetailView,
    ExerciseUpdateView,
    LessonCreateView,
    LessonListView,
    LessonDetailView,
    LessonUpdateView
)

app_name = 'lesson'

urlpatterns = [
    path('exercise-list', ExerciseListView.as_view(), name='exercise-list'),
    path('exercise-create', ExerciseCreateView.as_view(), name='exercise-create'),
    path('exercise/<int:pk>/update', ExerciseUpdateView.as_view(), name='exercise-update'),
    path('exercise/<int:pk>', ExerciseDetailView.as_view(), name='exercise-detail'),
    path('lesson-list', LessonListView.as_view(), name='lesson-list'),
    path('lesson-create', LessonCreateView.as_view(), name='lesson-create'),
    path('lesson/<int:pk>/update', LessonUpdateView.as_view(), name='lesson-update'),
    path('lesson/<int:pk>', LessonDetailView.as_view(), name='lesson-detail'),
]

# path('category-list', ExerciseCategoryListView.as_view(), name='category-list'),
# path('category-create', ExerciseCategoryCreateView.as_view(), name='category-create'),
# path('category/<int:pk>/update', ExerciseCategoryUpdateView.as_view(), name='category-update'),
# path('category/<int:pk>', ExerciseCategoryDetailView.as_view(), name='category-detail'),
