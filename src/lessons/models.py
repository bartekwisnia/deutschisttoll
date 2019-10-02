import datetime

from django.db import models
from django.urls import reverse
from django.contrib.auth import get_user_model

from jsonfield import JSONField

from exercises.models import Exercise

User = get_user_model()
# Create your models here.


class Homework(models.Model):
    student = models.ForeignKey(User, related_name='student_homework', on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, related_name='homework_given', blank=True, null=True, on_delete=models.SET_NULL)
    exercise = models.ForeignKey(Exercise, related_name='used_as_homework', on_delete=models.CASCADE)
    result = JSONField(blank=True, null=True)
    # 0 - not started, 1 - started, 2 - finished with faults, 3 - finished without faults
    status = models.IntegerField(blank=True, null=True, default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "{}:{}".format(self.student, self.exercise)


class Lesson(models.Model):
    start = models.DateTimeField()
    length = models.IntegerField(blank=True, default=60)  # Length in minutes (45, 60, 90, 120 ...)
    teacher = models.ForeignKey(User, related_name='lessons_taught', on_delete=models.CASCADE)
    student = models.ForeignKey(User, related_name='lessons_learned', on_delete=models.CASCADE)
    exercises = models.ManyToManyField(Exercise, related_name='used_in_lessons', blank=True,
                                       through="ExerciseInLesson")
    prepared = models.BooleanField(blank=True, default=False)
    taken = models.BooleanField(blank=True, default=False)
    paid = models.BooleanField(blank=True, default=False)
    rate = models.FloatField(blank=True, default=0.0)  # PLN / h
    status = models.IntegerField(blank=True, null=True, default=0)
    # 0 - not started, 1 - started, 2 - finished with faults, 3 - finished without faults
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (("start", "teacher", "student"),)

    def __str__(self):
        return "{}:{}:{}".format(self.teacher, self.student, self.start)


class ExerciseInLesson(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    order = models.IntegerField()
    result = JSONField(blank=True, null=True)
    # 0 - not started, 1 - started, 2 - finished with faults, 3 - finished without faults
    status = models.IntegerField(blank=True, null=True, default=0)


class Schedule(models.Model):
    start = models.DateTimeField()
    length = models.IntegerField(blank=True, default=60)  # Length in minutes (45, 60, 90, 120 ...)
    teacher = models.ForeignKey(User, related_name='teachers_scheduled_lessons', on_delete=models.CASCADE)
    student = models.ForeignKey(User, related_name='students_scheduled_lessons', on_delete=models.CASCADE)
    rate = models.FloatField(blank=True, default=0.0)  # PLN / h
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (("start", "teacher", "student"),)

    def make_lesson(self):
        act = datetime.datetime.now()
        act_day = act.weekday()  # 0 = monday
        scheduled = self.start
        act = act.replace(tzinfo=scheduled.tzinfo)
        print(act)
        print(scheduled)
        if scheduled > act:
            next_day = scheduled
        else:
            scheduled_day = scheduled.weekday()
            act = act.replace(hour=scheduled.hour, minute=scheduled.minute, second=scheduled.second,
                              microsecond=scheduled.microsecond, tzinfo=scheduled.tzinfo)
            next_day_in = (scheduled_day - act_day)
            print(next_day_in)
            if next_day_in < 0:
                next_day_in = next_day_in + 7
            next_day = act + datetime.timedelta(days=next_day_in)
        print(next_day)
        l = Lesson(start=next_day, length=self.length, teacher=self.teacher, student=self.student, rate=self.rate)
        l.save()
        return l

    def __str__(self):
        return "{}:{}:{}".format(self.teacher, self.student, self.start)
