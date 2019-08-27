from django.db import models
from jsonfield import JSONField
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db.models.signals import post_save

from operator import __or__ as OR
from functools import reduce

User = get_user_model()
# Create your models here.


def exercise_get_config():
    types = {}
    for item in Exercise.TYPES:
        types[item[0]] = item[1]
    config = {"type_choices": types}
    return config


def query_choices(query, choices):
    # returns choice reference name with part of readable name given
    for c in choices:
        type_ref = c[0]
        type_name = c[1]
        if query in type_name:
            return type_ref
    return ''


def clean_queries(queries):
    cleaned = []
    for q in queries:
        if q:
            if q[0] == ' ':
                q = q[1:]
            cleaned.append(q)
    return cleaned


class ExerciseQuerySet(models.query.QuerySet):
    def search(self, query):
        if query:
            queries = clean_queries(query.split(','))
            print(queries)
            for q in queries:
                choice_found = query_choices(q, Exercise.TYPES)
                print(choice_found)
                if choice_found:
                    queries.append(choice_found)
            print(queries)
            q_list = [(Q(title__icontains=q) |
                       Q(type__icontains=q) |
                       Q(categories__icontains=q) |
                       Q(level__icontains=q) |
                       Q(content__icontains=q))for q in queries]
            return self.filter(reduce(OR, q_list)).distinct()
        else:
            return self


class ExerciseSetQuerySet(models.query.QuerySet):
    def search(self, query):
        if query:
            queries = clean_queries(query.split(','))
            q_list = [(Q(title__icontains=q) |
                       Q(categories__icontains=q) |
                       Q(level__icontains=q))for q in queries]
            return self.filter(reduce(OR, q_list)).distinct()
        else:
            return self

# # Normal Usage with the | operator
# from django.db.models import Q
# qs = MyModel.objects.filter(Q(cond1=1) | Q(cond2="Y"))
#
# #but given a list of Q conditions
# from operator import __or__ as OR
# lst = [Q(...), Q(...), Q(...)]
# qs = MyModel.objects.filter(reduce(OR, lst))


class ExerciseManager(models.Manager):
    def get_queryset(self):
        return ExerciseQuerySet(self.model, using=self._db)

    def search(self, query):
        return self.get_queryset().search(query)


class Exercise(models.Model):
    DESCRIBE_PICTURE = 'DES_PIC'
    SELECT_TRANSLATION = 'SEL_TRANS'
    TYPES = ((DESCRIBE_PICTURE, "Opisz zdjęcie"), (SELECT_TRANSLATION, "Wybierz tłumaczenie"))

    title = models.CharField(max_length=30)
    type = models.CharField(max_length=30, choices=TYPES, default=DESCRIBE_PICTURE)
    owner = models.ForeignKey(User, related_name='exercises', on_delete=models.CASCADE)
    public = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
    picture = models.ImageField(null=True, blank=True, upload_to='pictures')
    content = JSONField(blank=True, null=True)
    categories = models.TextField(null=True, blank=True, help_text="gramatyka, czas przeszły")
    level = models.TextField(null=True, blank=True, help_text="A1, A2")

    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    objects = ExerciseManager()

    def __str__(self):
        return self.title

    def get_absolute_url(self):  # get_absolute_url
        return reverse('lessons:exercise-detail', kwargs={'pk': self.pk})

    def get_categories(self):
        return self.categories.split(",")


def exercise_set_get_config():
    config = {}
    return config


class ExerciseSetManager(models.Manager):
    def get_queryset(self):
        return ExerciseSetQuerySet(self.model, using=self._db)

    def search(self, query):
        return self.get_queryset().search(query)


class ExerciseSet(models.Model):
    title = models.CharField(max_length=30)
    owner = models.ForeignKey(User, related_name='lessons', on_delete=models.CASCADE)
    public = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
    exercises = models.ManyToManyField(Exercise, related_name='lesson', blank=True)
    categories = models.TextField(null=True, blank=True, help_text="gramatyka, czas przeszły", default='')
    level = models.TextField(null=True, blank=True, help_text="A1, A2", default='')

    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    objects = ExerciseSetManager()

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def get_absolute_url(self):  # get_absolute_url
        return reverse('exercises:exercise-set-detail', kwargs={'pk': self.pk})

# class ExerciseCategory(models.Model):
#     name = models.CharField(max_length=30, unique=True)
#
#     def __str__(self):
#         return self.name
#
#     def get_absolute_url(self):  # get_absolute_url
#         return reverse('lessons:category-detail', kwargs={'pk': self.pk})
