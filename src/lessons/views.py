from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse
from django.views.generic import CreateView, ListView, DetailView, UpdateView
from django.http import JsonResponse
from django.db.models import Value, IntegerField

from rest_framework import generics, exceptions
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions
from rest_framework.pagination import LimitOffsetPagination
from rest_framework import status

from .models import Homework, Lesson, ExerciseInLesson
from exercises.models import ExerciseSet, Exercise

from. serializers import HomeworkTeacherSerializer, HomeworkStudentSerializer, LessonSerializer
from user_profile.models import Profile

from itertools import chain

import json
import datetime

# Create your views here.


class IsInvolved(BasePermission):
    message = 'Only student or teacher can change results'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return True
        elif request.method == 'DELETE':
            'Only teacher can delete lesson instance or student if self learning'
            return request.user == obj.teacher or (request.user == obj.student and obj.teacher is None)
        else:
            # Check permissions for write request
            return request.user == obj.student or request.user == obj.teacher


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.profile.teacher


class HomeworkTeacherListCreate(generics.ListCreateAPIView):
    queryset = Homework.objects.all()
    serializer_class = HomeworkTeacherSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def get_queryset(self):
        qs = Homework.objects.filter(teacher=self.request.user).order_by('-updated')
        student_id = self.request.GET.get('student')
        if student_id:
            qs = qs.filter(student=student_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def create(self, request, *args, **kwargs):
        print(request.data)
        response = super(HomeworkTeacherListCreate, self).create(request)
        return response


class HomeworkTeacherRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Homework.objects.all()
    serializer_class = HomeworkTeacherSerializer
    permission_classes = (IsAuthenticated, IsInvolved)

    def put(self, request, *args, **kwargs):
        print(request.data)
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class HomeworkStudentListCreate(generics.ListCreateAPIView):
    queryset = Homework.objects.all()
    serializer_class = HomeworkStudentSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        started = Homework.objects.filter(student=self.request.user, status=1).order_by('-updated')
        not_started = Homework.objects.filter(student=self.request.user, status=0).order_by('timestamp')
        rest = Homework.objects.filter(student=self.request.user, status__gte=1).order_by('status', '-updated')
        qs = list(chain(started, not_started, rest))
        return qs

    def perform_create(self, serializer):
        serializer.save(teacher=None, student=self.request.user)

        # def create(self, request, *args, **kwargs):
        #     print(request.data)
        #     response = super(HomeworkStudentCreate, self).create(request)
        #     return response


class HomeworkStudentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Homework.objects.all()
    serializer_class = HomeworkStudentSerializer
    permission_classes = (IsAuthenticated, IsInvolved)

    def put(self, request, *args, **kwargs):
        print(request.data)
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class LessonTeacherListCreate(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def get_queryset(self):
        qs = Lesson.objects.filter(teacher=self.request.user)
        student_id = self.request.GET.get('student')
        incoming = self.request.GET.get('incoming')
        old = self.request.GET.get('old')
        start_date = datetime.date.today()
        if student_id:
            qs = qs.filter(student=student_id)
        if incoming:
            qs = qs.filter(start__gte=start_date)
        elif old:
            qs = qs.filter(start__lt=start_date)
        return qs.order_by('-start')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_lesson = serializer.save(teacher=self.request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class LessonTeacherRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def put(self, request, *args, **kwargs):
        # print(request.data)
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # print(request.data)

        if 'exercises' in list(request.data.keys()):
            new_exercises_ids = [a['id'] for a in request.data['activities'] if not a['lesson']]
            new_exercises = Exercise.objects.filter(id__in=new_exercises_ids)
            # Clear deleted lessons
            ExerciseInLesson.objects.filter(learning_class=instance).exclude(exercise__in=new_exercises).delete()
            # Update or create new lessons
            for a in request.data['activities']:
                exercise_object = Exercise.objects.get(id=a['id'])
                obj, created = ExerciseInLesson.objects.get_or_create(learning_class=instance, exercise=exercise_object,
                                                                        defaults={'order': a['order']})
                obj.order = a['order']
                obj.save()

        response = super(LessonTeacherRetrieveUpdateDestroy, self).update(request, *args, **kwargs)
        return response


class LessonStudentList(generics.ListAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        incoming = self.request.GET.get('incoming')
        old = self.request.GET.get('old')
        start_date = datetime.date.today()
        qs = Lesson.objects.filter(student=self.request.user)
        if incoming:
            qs = qs.filter(start__gte=start_date)
        elif old:
            qs = qs.filter(start__lt=start_date)
        return qs.order_by('-start')


class LessonStudentRetrieveUpdate(generics.RetrieveUpdateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated, IsInvolved)

    def get(self, request, *args, **kwargs):
        response = super(LessonStudentRetrieveUpdate, self).get(request, *args, **kwargs)
        # print(response.data)
        return response

    def put(self, request, *args, **kwargs):
        # print(request.data)
        kwargs['partial'] = True
        obj = self.get_object()
        res = json.loads(request.data['result'])
        stat = json.loads(request.data['act_status'])

        for e in obj.exercises.all():
            a = ExerciseInLesson.objects.get(exercise=e, learning_class=obj)
            a.result = res[a.order]
            a.status = stat[a.order]
            a.save()

        return self.update(request, *args, **kwargs)

