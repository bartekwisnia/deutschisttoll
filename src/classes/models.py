from django.db import models
from django.urls import reverse
from django.contrib.auth import get_user_model

from jsonfield import JSONField

from exercises.models import ExerciseSet, Exercise

User = get_user_model()
# Create your models here.


class ExerciseInstance(models.Model):
    student = models.ForeignKey(User, related_name='my_exercises', on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, related_name='exercises_given', blank=True, null=True, on_delete=models.SET_NULL)
    exercise = models.ForeignKey(Exercise, related_name='exercise_instances', on_delete=models.CASCADE)
    result = JSONField(blank=True, null=True)
    # 0 - not started, 1 - started, 2 - finished with faults, 3 - finished without faults
    status = models.IntegerField(blank=True, null=True, default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "{}:{}".format(self.student, self.exercise)


class LearningClass(models.Model):
    start = models.DateTimeField()
    length = models.IntegerField(blank=True, default=60)  # Length in minutes (45, 60, 90, 120 ...)
    teacher = models.ForeignKey(User, related_name='classes_prepared', on_delete=models.CASCADE)
    student = models.ForeignKey(User, related_name='classes_taken', on_delete=models.CASCADE)
    exercises = models.ManyToManyField(Exercise, related_name='exercises_classes', blank=True,
                                       through="ExerciseAsActivity")

    # 0 - not started, 1 - started, 2 - finished with faults, 3 - finished without faults

    status = models.IntegerField(blank=True, null=True, default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "{}:{}:{}".format(self.teacher, self.student, self.start)


class ExerciseAsActivity(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    learning_class = models.ForeignKey(LearningClass, on_delete=models.CASCADE)
    order = models.IntegerField()
    result = JSONField(blank=True, null=True)
    ex_status = JSONField(blank=True, null=True)  # exercises status (only for consistency, not used)
    # 0 - not started, 1 - started, 2 - finished with faults, 3 - finished without faults
    status = models.IntegerField(blank=True, null=True, default=0)
