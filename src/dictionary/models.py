from django.db import models
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()
# Create your models here.


class Word(models.Model):
    text = models.CharField(max_length=30)
    preposition = models.CharField(max_length=5)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text


class Translation(models.Model):
    text = models.CharField(max_length=30)
    word = models.ForeignKey(Word, related_name='translations', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text


class WordLearning(models.Model):
    student = models.ForeignKey(User, related_name='student_words', on_delete=models.CASCADE)
    word = models.ForeignKey(Word, related_name='learned', on_delete=models.CASCADE)
    level = models.IntegerField(blank=True, default=0)

    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "{}:{}".format(self.student, self.word)
