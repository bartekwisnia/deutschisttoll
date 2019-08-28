from django.shortcuts import render

from rest_framework import generics, exceptions
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS

from .models import WordLearning, Word, Translation, WordIcon
from. serializers import WordLearningSerializer, WordSerializer, TranslationSerializer, WordIconSerializer
# Create your views here.


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
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = Word.objects.all().order_by('text')
        if query:
            qs = qs.filter(text=query)
        return qs


class WordRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Word.objects.all()
    serializer_class = WordSerializer
    permission_classes = (IsAuthenticated,)


class TranslationListCreate(generics.ListCreateAPIView):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = Translation.objects.all().order_by('text')
        if query:
            qs = qs.filter(text=query)
        return qs


class TranslationRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Translation.objects.all()
    serializer_class = TranslationSerializer
    permission_classes = (IsAuthenticated,)


class WordLearningListCreate(generics.ListCreateAPIView):
    queryset = WordLearning.objects.all()
    serializer_class = WordLearningSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = WordLearning.objects.all().order_by('-updated')
        if query:
            qs = qs.filter(word__text=query)
        return qs

    def perform_create(self, serializer):
        print(self.request.data)
        serializer.save(student=self.request.user)


class WordLearningRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = WordLearning.objects.all()
    serializer_class = WordLearningSerializer
    permission_classes = (IsStudent,)


class WordIconListCreate(generics.ListCreateAPIView):
    queryset = WordIcon.objects.all()
    serializer_class = WordIconSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = WordIcon.objects.all()
        if query:
            qs = qs.filter(description=query)
        return qs


class WordIconRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = WordIcon.objects.all()
    serializer_class = WordIconSerializer
    permission_classes = (IsAuthenticated,)