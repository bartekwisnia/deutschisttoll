from django.shortcuts import render

from rest_framework import generics, exceptions, status
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.db.utils import IntegrityError
from django.core.exceptions import NON_FIELD_ERRORS
from .models import WordLearning, Word, Translation, WordIcon
from. serializers import WordLearningSerializer, WordSerializer, TranslationSerializer, WordIconSerializer
from exercises.models import Exercise, WordInExercise
from user_profile.serializers import UserSerializer
import json
# Create your views here.


class IsSafe(BasePermission):
    message = 'Read only'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return True
        else:
            # Check permissions for write request
            return request.user.is_authenticated()


class IsStudent(BasePermission):
    message = 'Only author can change the entry'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return True
        else:
            # Check permissions for write request
            return request.user == obj.student or request.user.profile.teacher


class WordListCreate(generics.ListCreateAPIView):
    queryset = Word.objects.all()
    serializer_class = WordSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = Word.objects.all().order_by('text')
        if query:
            qs = qs.filter(text=query)
        return qs

    def create(self, request, *args, **kwargs):
        print(request.data)
        try:
            return super(WordListCreate, self).create(request, *args, **kwargs)
        except exceptions.ValidationError:
            obj = Word.objects.get(text=request.data["text"], preposition=request.data["preposition"])
            serializer = WordSerializer(obj)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST, headers=headers)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # print(response.data)
        return response


class WordRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Word.objects.all()
    serializer_class = WordSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def update(self, request, *args, **kwargs):
        # print(request.data)
        try:
            return super(WordRetrieveUpdateDestroy, self).update(request, *args, **kwargs)
        except exceptions.ValidationError:
            obj = Word.objects.get(text=request.data["text"], preposition=request.data["preposition"])
            serializer = WordSerializer(obj)
            return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)


class TranslationListCreate(generics.ListCreateAPIView):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        word = self.request.GET.get('word')
        qs = Translation.objects.all().order_by('text')
        if query:
            qs = qs.filter(text=query)
        if word:
            qs = qs.filter(word=word)
        return qs


class TranslationRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)


class WordLearningListCreate(generics.ListCreateAPIView):
    queryset = WordLearning.objects.all()
    serializer_class = WordLearningSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        student = self.request.GET.get('student')
        if not student:
            student = self.request.user
        qs = WordLearning.objects.filter(student=student)
        learn = self.request.GET.get('learn')
        if learn:
            qs = qs.words_to_learn()
        return qs.order_by('level', '-updated', 'word__text')

    def perform_create(self, serializer):
        # print(self.request.data)
        serializer.save(student=self.request.user)


class WordLearnExercise(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, request, format=None):
        words = WordLearning.objects.filter(student=self.request.user).words_to_learn()
        words_list = []
        for w in words:
            words_list.append({"word": w.word.id, "translation": w.word.translations.all().first().text})
        exercise = {'type': 'SEL_TRANS', 'title': 'Nauka słów', 'owner': UserSerializer(self.request.user).data, 'words': words_list}
        return Response(exercise, status=status.HTTP_200_OK)

    def put(self, request, format=None):
        words = json.loads(request.data["words"])
        print(words)
        results = json.loads(request.data["result"])
        print(results)
        index = len(results) - 1
        print(index)
        word = words[index]['word']
        print(word)
        result = results[-1]
        print(result)

        obj, created = WordLearning.objects.get_or_create(student=self.request.user, word=word)
        if not created:
            if result and obj.level < 5:
                obj.level += 1
            elif obj.level > 0:
                obj.level -= 1
            obj.save()
        return Response(obj.level, status=status.HTTP_200_OK)


class WordLearningRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = WordLearning.objects.all()
    serializer_class = WordLearningSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)


class WordIconListCreate(generics.ListCreateAPIView):
    queryset = WordIcon.objects.all()
    serializer_class = WordIconSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = WordIcon.objects.all()
        if query:
            qs = qs.filter(description__icontains=query)
        return qs


class WordIconRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = WordIcon.objects.all()
    serializer_class = WordIconSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
