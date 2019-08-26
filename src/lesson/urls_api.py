from django.urls import path
from .views import ExerciseListCreate, ExerciseSearch, ExerciseRetrieveUpdateDestroy, exercise_config, \
    LessonListCreate, LessonSearch, LessonRetrieveUpdateDestroy, lesson_config, ExerciseTags

app_name = 'lesson'

urlpatterns = [
    path('exercise/', ExerciseListCreate.as_view(), name='exercise'),
    path('exercise/search', ExerciseSearch.as_view(), name='exercise-search'),
    path('exercise/<int:pk>', ExerciseRetrieveUpdateDestroy.as_view(), name='exercise-object'),
    path('exercise/config', exercise_config, name='exercise-config'),
    path('exercise/tags', ExerciseTags.as_view(), name='exercise-tags'),
    path('lesson/', LessonListCreate.as_view(), name='lesson'),
    path('lesson/search', LessonSearch.as_view(), name='lesson-search'),
    path('lesson/<int:pk>', LessonRetrieveUpdateDestroy.as_view(), name='lesson-object'),
    path('lesson/config', lesson_config, name='lesson-config'),
]
