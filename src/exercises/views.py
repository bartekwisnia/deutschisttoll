from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse
from django.views.generic import CreateView, ListView, DetailView, UpdateView
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse

from rest_framework import generics, exceptions
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions

from .models import Exercise, ExerciseSet, exercise_get_config, exercise_set_get_config, WordInExercise

from dictionary.models import Translation
from .forms import ExerciseForm, ExerciseSetForm
from. serializers import ExerciseSerializer, ExerciseSetSerializer, WordInExerciseSerializer

from dictionary.models import Word

# -----------------
# API views:
# -----------------


class IsOwner(BasePermission):
    message = 'Only owner can change this object'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return True
        else:
            # Check permissions for write request
            return request.user == obj.owner


class IsPublic(BasePermission):
    message = 'Only owner can change this object'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return obj.public
        else:
            # Check permissions for write request
            return False


class IsSafe(BasePermission):
    message = 'Read only'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return True
        else:
            # Check permissions for write request
            return False


class ExerciseListCreate(generics.ListCreateAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = (IsAuthenticated | IsPublic,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        lesson_id = self.request.GET.get('lesson')
        # print(self.request.GET)
        qs = Exercise.objects.filter(owner=self.request.user)
        if lesson_id:
            qs = qs.exclude(lesson__id=lesson_id)
        if query:
            qs = qs.search(query)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ExerciseSearch(generics.ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = (IsAuthenticated | IsPublic,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = Exercise.objects.exclude(owner=self.request.user).filter(public=True)
        if query:
            qs = qs.search(query)
        return qs


class ExerciseRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = (IsAuthenticated | IsPublic, IsOwner)

    def put(self, request, *args, **kwargs):
        print(request.data)
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


@api_view(['GET'])
def exercise_config(request):
    if request.method == 'GET':
        return JsonResponse(exercise_get_config())


def get_tags(model, user, field_name):
    objects_tags = model.objects.filter(owner=user).values_list(field_name).distinct()
    tags = dict()
    for ot in objects_tags:
        if ot[0] is not None:
            for t in ot[0].split(', '):
                if t:
                    if t in tags:
                        tags[t] += 1
                    else:
                        tags[t] = 1
    tags = sorted(tags, key=tags.get, reverse=True)[0:5]
    return tags


class ExerciseTags(APIView):
    """
    View to list all tags for logged user
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """
        Return a list of all exercises tags (categories and levels)
        """
        categories = get_tags(Exercise, request.user, 'categories')
        levels = get_tags(Exercise, request.user, 'level')
        return Response({'categories': categories, 'levels': levels})


class ExerciseSetListCreate(generics.ListCreateAPIView):
    queryset = ExerciseSet.objects.all()
    serializer_class = ExerciseSetSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = ExerciseSet.objects.filter(owner=self.request.user)
        if query:
            qs = qs.search(query)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        print(request.data)
        if request.data['public'] == '':
            request.data['public'] = False
        if request.data['favourite'] == '':
            request.data['favourite'] = False
        response = super(ExerciseSetListCreate, self).create(request)
        return response


class ExerciseSetRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExerciseSet.objects.all()
    serializer_class = ExerciseSetSerializer
    permission_classes = (IsAuthenticated, IsOwner)

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        return response

    def put(self, request, *args, **kwargs):
        print(request.data)
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        print(request.data)
        if 'public' in request.data and request.data['public'] == '':
            request.data['public'] = False
        if 'favourite' in request.data and request.data['favourite'] == '':
            request.data['favourite'] = False
        return super(ExerciseSetRetrieveUpdateDestroy, self).update(request, *args, **kwargs)


class ExerciseSetSearch(generics.ListAPIView):
    queryset = ExerciseSet.objects.all()
    serializer_class = ExerciseSetSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = ExerciseSet.objects.exclude(owner=self.request.user).filter(public=True)
        if query:
            qs = qs.search(query)
        return qs


@api_view(['GET'])
def exercise_set_config(request):
    if request.method == 'GET':
        return JsonResponse(exercise_set_get_config())


class WordInExerciseListCreate(generics.ListCreateAPIView):
    queryset = WordInExercise.objects.all()
    serializer_class = WordInExerciseSerializer
    permission_classes = (IsAuthenticated|IsSafe,)

    def get_queryset(self):
        return WordInExercise.objects.all()

    def create(self, request, *args, **kwargs):
        try:
            word = Word.objects.get(id=request.data['word'])
            if request.data['translation']:
                trans, created = Translation.objects.get_or_create(
                    text=request.data['translation'],
                    word=word
                )
        except ObjectDoesNotExist as e:
            print(e)

        return super(WordInExerciseListCreate, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save()


class WordInExerciseRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = WordInExercise.objects.all()
    serializer_class = WordInExerciseSerializer
    permission_classes = (IsAuthenticated|IsSafe,)

    def put(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        try:
            word = Word.objects.get(id=request.data['word'])
            if request.data['translation']:
                trans, created = Translation.objects.get_or_create(
                    text=request.data['translation'],
                    word=word
                )
        except ObjectDoesNotExist as e:
            print(e)

        return super(WordInExerciseListCreate, self).update(request, *args, **kwargs)