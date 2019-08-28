from django.urls import path
from .views import WordLearningListCreate, WordLearningRetrieveUpdateDestroy, WordListCreate, WordRetrieveUpdateDestroy,\
    TranslationListCreate, TranslationRetrieveUpdateDestroy

app_name = 'dictionary'

urlpatterns = [
    path('word-learn/', WordLearningListCreate.as_view(), name='word-learn'),
    path('word-learn/<int:pk>', WordLearningRetrieveUpdateDestroy.as_view(), name='word-learn-object'),
    path('word/', WordListCreate.as_view(), name='word'),
    path('word/<int:pk>', WordRetrieveUpdateDestroy.as_view(), name='word-object'),
    path('translation/', TranslationListCreate.as_view(), name='translation'),
    path('translation/<int:pk>', TranslationRetrieveUpdateDestroy.as_view(), name='translation-object'),
]
