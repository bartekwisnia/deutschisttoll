from django.contrib import admin
from .models import ExerciseInstance, LearningClass, ExerciseAsActivity

# Register your models here.
admin.site.register(ExerciseInstance)
admin.site.register(LearningClass)
admin.site.register(ExerciseAsActivity)
