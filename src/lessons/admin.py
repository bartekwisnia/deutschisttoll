from django.contrib import admin
from .models import Homework, Lesson, ExerciseInLesson, Schedule

# Register your models here.
admin.site.register(Homework)
admin.site.register(Lesson)
admin.site.register(ExerciseInLesson)
admin.site.register(Schedule)
