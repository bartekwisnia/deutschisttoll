from django.db import models
from django.urls import reverse
from django.contrib.auth import get_user_model

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


class WordLearning(models.Model):
    student = models.ForeignKey(User, related_name='student_words', on_delete=models.CASCADE)
    word = models.ForeignKey(Word, related_name='learned', on_delete=models.CASCADE)
    level = models.IntegerField(blank=True, default=0)

    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "{}:{}".format(self.student, self.word)

    class Meta:
        unique_together = ('student', 'word')
