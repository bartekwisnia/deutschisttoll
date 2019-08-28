from django.contrib import admin
from .models import Word, Translation, WordLearning

# Register your models here.
admin.site.register(Word)
admin.site.register(Translation)
admin.site.register(WordLearning)