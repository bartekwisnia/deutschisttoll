from django.contrib import admin
from .models import ExerciseInstance, LessonInstance, LearningClass, LessonAsActivity, ExerciseAsActivity

# Register your models here.
admin.site.register(ExerciseInstance)
admin.site.register(LessonInstance)
admin.site.register(LearningClass)
admin.site.register(LessonAsActivity)
admin.site.register(ExerciseAsActivity)
