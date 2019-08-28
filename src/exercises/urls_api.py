from django.urls import path
from .views import ExerciseListCreate, ExerciseSearch, ExerciseRetrieveUpdateDestroy, exercise_config, \
   ExerciseSetListCreate, ExerciseSetSearch, ExerciseSetRetrieveUpdateDestroy, exercise_set_config, ExerciseTags, \
    WordInExerciseListCreate, WordInExerciseRetrieveUpdateDestroy

app_name = 'exercises'

urlpatterns = [
    path('exercise/', ExerciseListCreate.as_view(), name='exercise'),
    path('exercise/search', ExerciseSearch.as_view(), name='exercise-search'),
    path('exercise/<int:pk>', ExerciseRetrieveUpdateDestroy.as_view(), name='exercise-object'),
    path('exercise/config', exercise_config, name='exercise-config'),
    path('exercise/tags', ExerciseTags.as_view(), name='exercise-tags'),
    path('exercise-set/', ExerciseSetListCreate.as_view(), name='exercise-set'),
    path('exercise-set/search', ExerciseSetSearch.as_view(), name='exercise-set-search'),
    path('exercise-set/<int:pk>', ExerciseSetRetrieveUpdateDestroy.as_view(), name='exercise-set-object'),
    path('exercise-set/config', exercise_set_config, name='exercise-set-config'),
    path('word-in-exercise/', WordInExerciseListCreate.as_view(), name='word-in-exercise'),
    path('word-in-exercise/<int:pk>', WordInExerciseRetrieveUpdateDestroy.as_view(), name='word-in-exercise-object'),
]
