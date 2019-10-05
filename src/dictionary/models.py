from django.db import models
from django.db.models import Q
from django.urls import reverse
from django.contrib.auth import get_user_model

from datetime import datetime, timedelta

User = get_user_model()
# Create your models here.


class WordIcon(models.Model):
    picture = models.ImageField(null=True, blank=True, upload_to='pictures')
    description = models.CharField(max_length=30, blank=True, null=True)

    def __str__(self):
        return self.description


class Word(models.Model):
    text = models.CharField(max_length=30)
    preposition = models.CharField(max_length=5)
    icon = models.ForeignKey(WordIcon, related_name='words', on_delete=models.SET_NULL, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text

    class Meta:
        unique_together = ('text', 'preposition')


class Translation(models.Model):
    text = models.CharField(max_length=30)
    word = models.ForeignKey(Word, related_name='translations', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text

    class Meta:
        unique_together = ('text', 'word')


class WordLearningQuerySet(models.query.QuerySet):
    def words_to_learn(self):
        d0 = datetime.today() - timedelta(days=1)
        d1 = datetime.today() - timedelta(days=3)
        d2 = datetime.today() - timedelta(days=7)
        d3 = datetime.today() - timedelta(days=10)
        d4 = datetime.today() - timedelta(days=14)
        d5 = datetime.today() - timedelta(days=30)
        qs = WordLearning.objects.filter((Q(updated__gte=d0) & Q(level=0)) |
                                         (Q(updated__gte=d1) & Q(level=1)) |
                                         (Q(updated__gte=d2) & Q(level=2)) |
                                         (Q(updated__gte=d3) & Q(level=3)) |
                                         (Q(updated__gte=d4) & Q(level=4)) |
                                         (Q(updated__gte=d5) & Q(level=5))).order_by('level', '-updated')
        return qs


class WordLearningManager(models.Manager):
    def get_queryset(self):
        return WordLearningQuerySet(self.model, using=self._db)

    def words_to_learn(self):
        return self.get_queryset().words_to_learn()


class WordLearning(models.Model):
    student = models.ForeignKey(User, related_name='student_words', on_delete=models.CASCADE)
    word = models.ForeignKey(Word, related_name='learned', on_delete=models.CASCADE)
    level = models.IntegerField(blank=True, default=0)

    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    objects = WordLearningManager()

    def __str__(self):
        return "{}:{}".format(self.student, self.word)

    class Meta:
        unique_together = ('student', 'word')
