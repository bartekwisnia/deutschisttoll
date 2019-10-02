from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.urls import reverse
from django.views.generic import CreateView, ListView, DetailView, UpdateView
from django.http import JsonResponse
from django.db.models import Value, IntegerField
from django.db.utils import IntegrityError

from rest_framework import generics, exceptions
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions
from rest_framework.pagination import LimitOffsetPagination
from rest_framework import status

from .models import Homework, Lesson, ExerciseInLesson, Schedule
from exercises.models import ExerciseSet, Exercise

from .serializers import HomeworkTeacherSerializer, HomeworkStudentSerializer, LessonSerializer, ScheduleSerializer
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


class IsOwner(BasePermission):
    message = 'You can generate only your lessons'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return True
        else:
            # Check permissions for write request
            return request.user == obj.teacher


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
        response = super(HomeworkTeacherListCreate, self).create(request)
        return response


class HomeworkTeacherRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Homework.objects.all()
    serializer_class = HomeworkTeacherSerializer
    permission_classes = (IsAuthenticated, IsInvolved)

    def put(self, request, *args, **kwargs):
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
        start_date = self.request.GET.get('start_date')
        end_date = self.request.GET.get('end_date')
        today = datetime.date.today()
        if student_id:
            qs = qs.filter(student=student_id)
        if incoming:
            qs = qs.filter(start__gte=today)
        elif old:
            qs = qs.filter(start__lt=today)
        if start_date:
            qs = qs.filter(start__gte=start_date)
        if end_date:
            qs = qs.filter(start__lte=end_date)
        return qs.order_by('-start')

    def create(self, request, *args, **kwargs):
        new_data = request.data
        new_exercises_ids = new_data.get('exercises_id')
        del new_data['exercises_id']
        serializer = self.get_serializer(data=new_data)
        serializer.is_valid(raise_exception=True)
        new_lesson = serializer.save(teacher=self.request.user)

        # if 'exercises_id' in list(request.data.keys()):
        if new_exercises_ids:
            new_exercises = Exercise.objects.filter(id__in=new_exercises_ids)
            order = 0
            for ex in new_exercises_ids:
                exercise_object = Exercise.objects.get(id=ex)
                obj, created = ExerciseInLesson.objects.get_or_create(lesson=new_lesson, exercise=exercise_object,
                                                                      defaults={'order': order})
                obj.order = order
                obj.save()
                order += 1
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class LessonTeacherRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def put(self, request, *args, **kwargs):

        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_data = request.data
        new_exercises_ids = new_data.get('exercises_id')
        # print(request.data)
        if 'exercises_id' in list(request.data.keys()):
            print("updating exercises")
            for ex in new_exercises_ids:
                print(ex)
            new_exercises = Exercise.objects.filter(id__in=new_exercises_ids)
            # Clear deleted lessons
            ExerciseInLesson.objects.filter(lesson=instance).exclude(exercise__in=new_exercises).delete()
            # Update or create new lessons
            order = 0
            for ex in new_exercises_ids:
                exercise_object = Exercise.objects.get(id=ex)
                obj, created = ExerciseInLesson.objects.get_or_create(lesson=instance, exercise=exercise_object,
                                                                      defaults={'order': order})
                obj.order = order
                obj.save()
                order += 1
        del new_data['exercises_id']
        response = super(LessonTeacherRetrieveUpdateDestroy, self).update(request, *args, **kwargs)
        return response


class LessonStudentList(generics.ListAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        incoming = self.request.GET.get('incoming')
        old = self.request.GET.get('old')
        start_date = self.request.GET.get('start_date')
        end_date = self.request.GET.get('end_date')
        today = datetime.date.today()
        qs = Lesson.objects.filter(student=self.request.user)
        if incoming:
            qs = qs.filter(start__gte=today)
        elif old:
            qs = qs.filter(start__lt=today)
        if start_date:
            qs = qs.filter(start__gte=start_date)
        if end_date:
            qs = qs.filter(start__lte=end_date)
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
        stat = json.loads(request.data['ex_status'])

        for e in obj.exercises.all():
            ex = ExerciseInLesson.objects.get(exercise=e, learning_class=obj)
            ex.result = res[ex.order]
            ex.status = stat[ex.order]
            ex.save()

        return self.update(request, *args, **kwargs)


class ScheduleTeacherListCreate(generics.ListCreateAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def get_queryset(self):
        qs = Schedule.objects.filter(teacher=self.request.user)
        student_id = self.request.GET.get('student')
        if student_id:
            qs = qs.filter(student=student_id)

        return qs.order_by('-start')

    def create(self, request, *args, **kwargs):
        print(request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_schedule = serializer.save(teacher=self.request.user)
        new_schedule.make_lesson()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ScheduleTeacherRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def get(self, request, *args, **kwargs):
        obj = self.get_object()
        return super(ScheduleTeacherRetrieveUpdateDestroy, self).get(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        # print(request.data)
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        response = super(ScheduleTeacherRetrieveUpdateDestroy, self).update(request, *args, **kwargs)
        return response


class MakeLesson(APIView):
    permission_classes = (IsAuthenticated, IsTeacher, IsOwner)

    def get(self, request, format=None):
        """
        Method not allowed
        """
        return Response("", status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def put(self, request, *args, **kwargs):
        """
        Create a lesson from a schedule
        """
        print(request.data)
        try:
            obj = Schedule.objects.get(id=self.kwargs['pk'])
            new_lesson = obj.make_lesson()
            lesson_serializer = LessonSerializer(new_lesson)
            return Response(lesson_serializer.data, status=status.HTTP_201_CREATED)
        except ObjectDoesNotExist as e:
            print(e)
            return Response("", status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            print(e)
            return Response("", status=status.HTTP_400_BAD_REQUEST)


class ScheduleStudentList(generics.ListAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        qs = Schedule.objects.filter(student=self.request.user)
        return qs.order_by('-start')


class ScheduleStudentRetrieveUpdate(generics.RetrieveUpdateAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = (IsAuthenticated, IsInvolved)

    def get(self, request, *args, **kwargs):
        response = super(ScheduleStudentRetrieveUpdate, self).get(request, *args, **kwargs)
        # print(response.data)
        return response

    def put(self, request, *args, **kwargs):
        # print(request.data)
        kwargs['partial'] = True

        return self.update(request, *args, **kwargs)