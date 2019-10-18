from django.db import models
from jsonfield import JSONField
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db.models.signals import post_save

from operator import __or__ as OR
from functools import reduce

from dictionary.models import Word, WordLearning, WordIcon

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
    TRANSLATION = 'SEL_TRANS'
    PUZZLES = 'PUZ'
    CLICK = 'CLICK'
    SORT = 'SORT'
    SELECT_OPTION = 'SEL_OPT'
    CONJUGATION = 'CONJ'
    TYPES = ((DESCRIBE_PICTURE, "Opisz zdjęcie"), (TRANSLATION, "Tłumaczenie"), (PUZZLES, "Puzzle"),
             (CLICK, "Naciśnij i zapamiętaj"), (SORT, "Sortowanie"), (SELECT_OPTION, "Wybierz opcję"),
             (CONJUGATION, "Odmiana czasownika"))

    title = models.CharField(max_length=30)
    type = models.CharField(max_length=30, choices=TYPES, default=DESCRIBE_PICTURE)
    variant = models.IntegerField(default=0, blank=True)
    owner = models.ForeignKey(User, related_name='exercises', on_delete=models.CASCADE)
    public = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
    picture = models.ImageField(null=True, blank=True, upload_to='pictures')
    words = models.ManyToManyField(Word, through="WordInExercise", related_name='used_in_exercises', blank=True)
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

    def update_words(self, user, results):
        print("update words")

        words_set = self.words.all()
        print(words_set)
        if self.type == 'SORT':
            words_set.exclude(comment='group')
        print(words_set)
        print(results)
        allowed_types = ('DES_PIC', 'SEL_TRANS', 'PUZ', 'CLICK', 'SORT')
        if self.type in allowed_types:
            if words_set:
                word_idx = 0
                for word in words_set:
                    print("update word")
                    print(word)
                    obj, created = WordLearning.objects.get_or_create(student=user, word=word)
                    if not created and len(results) > word_idx:
                        print(obj.level)
                        print(results[word_idx])
                        if results[word_idx] and obj.level < 5:
                            obj.level += 1
                        elif obj.level > 0:
                            obj.level -= 1
                        print(obj.level)
                        obj.save()
                    else:
                        print("new word or no result")
                    word_idx += 1


class Sentence(models.Model):
    sentence = models.CharField(max_length=100)
    translation = models.CharField(max_length=100, default='')
    gap = models.IntegerField(default=0, blank=True)
    exercise = models.ForeignKey(Exercise, related_name='sentences', on_delete=models.CASCADE)
    correct = models.CharField(max_length=100)
    false1 = models.CharField(max_length=100)
    false2 = models.CharField(max_length=100)

    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.sentence


class WordInExercise(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    translation = models.CharField(max_length=30, blank=True, null=True)
    comment = models.CharField(max_length=100, blank=True, null=True)
    group = models.CharField(max_length=100, blank=True, null=True)
    highlight_start = models.IntegerField(default=0, blank=True)
    highlight_end = models.IntegerField(default=0, blank=True)
    icon = models.ForeignKey(WordIcon, related_name='words_in_exercises', on_delete=models.SET_NULL, blank=True, null=True)


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
    exercises = models.ManyToManyField(Exercise, related_name='member_of_sets', blank=True)
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
