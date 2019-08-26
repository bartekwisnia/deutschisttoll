from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Q

from functools import reduce
from operator import __or__ as OR

from lesson.models import Exercise

User = get_user_model()

# Create your models here.


def clean_queries(queries):
    cleaned = []
    for q in queries:
        if q:
            if q[0] == ' ':
                q = q[1:]
            cleaned.append(q)
    return cleaned


class EntryQuerySet(models.query.QuerySet):
    def search(self, query):
        if query:
            queries = clean_queries(query.split(','))
            print(queries)
            q_list = [(Q(title__icontains=q) |
                       Q(subtitle__icontains=q) |
                       Q(text__icontains=q))for q in queries]
            return self.filter(reduce(OR, q_list)).distinct()
        else:
            return self


class EntryManager(models.Manager):
    def get_queryset(self):
        return EntryQuerySet(self.model, using=self._db)

    def search(self, query):
        return self.get_queryset().search(query)


class Entry(models.Model):
    author = models.ForeignKey(User, related_name='my_entries', on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, related_name='published', null=True, blank=True, on_delete=models.CASCADE)

    title = models.CharField(max_length=30, help_text="tytuł")
    subtitle = models.CharField(null=True, blank=True, max_length=30, help_text="podtytuł")
    picture = models.ImageField(null=True, blank=True, upload_to='pictures')
    text = models.TextField(help_text="zawartość wpisu", null=True, blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Blog entry {} written by {} at {}".format(self.title, self.author, self.timestamp)
