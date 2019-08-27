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

from .models import ExerciseInstance, LearningClass, ExerciseAsActivity
from exercises.models import ExerciseSet, Exercise

from. serializers import ExerciseInstanceStudentSerializer, ExerciseInstanceTeacherSerializer, LearningClassSerializer
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


class ExerciseInstanceTeacherListCreate(generics.ListCreateAPIView):
    queryset = ExerciseInstance.objects.all()
    serializer_class = ExerciseInstanceTeacherSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def get_queryset(self):
        qs = ExerciseInstance.objects.filter(teacher=self.request.user).order_by('-updated')
        student_id = self.request.GET.get('student')
        if student_id:
            qs = qs.filter(student=student_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def create(self, request, *args, **kwargs):
        print(request.data)
        response = super(ExerciseInstanceTeacherListCreate, self).create(request)
        return response


class ExerciseInstanceTeacherRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExerciseInstance.objects.all()
    serializer_class = ExerciseInstanceTeacherSerializer
    permission_classes = (IsAuthenticated, IsInvolved)

    def put(self, request, *args, **kwargs):
        print(request.data)
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class ExerciseInstanceStudentListCreate(generics.ListCreateAPIView):
    queryset = ExerciseInstance.objects.all()
    serializer_class = ExerciseInstanceStudentSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        # query = self.request.GET.get('query')
        # lexercise_id = self.request.GET.get('lexercise')
        # print(self.request.GET)
        started = ExerciseInstance.objects.filter(student=self.request.user, status=1).order_by('-updated')
        not_started = ExerciseInstance.objects.filter(student=self.request.user, status=0).order_by('timestamp')
        rest = ExerciseInstance.objects.filter(student=self.request.user, status__gte=1).order_by('status', '-updated')
        qs = list(chain(started, not_started, rest))

        # if lexercise_id:
        #     qs = qs.exclude(lexercise__id=lexercise_id)
        # if query:
        #     qs = qs.search(query)
        return qs

    def perform_create(self, serializer):
        serializer.save(teacher=None, student=self.request.user)

        # def create(self, request, *args, **kwargs):
        #     print(request.data)
        #     response = super(ExerciseInstanceStudentCreate, self).create(request)
        #     return response


class ExerciseInstanceStudentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExerciseInstance.objects.all()
    serializer_class = ExerciseInstanceStudentSerializer
    permission_classes = (IsAuthenticated, IsInvolved)

    def put(self, request, *args, **kwargs):
        print(request.data)
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class LearningClassTeacherListCreate(generics.ListCreateAPIView):
    queryset = LearningClass.objects.all()
    serializer_class = LearningClassSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def get_queryset(self):
        qs = LearningClass.objects.filter(teacher=self.request.user)
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
        new_class = serializer.save(teacher=self.request.user)
        headers = self.get_success_headers(serializer.data)
        # print(request.data)

        if 'activities' in list(request.data.keys()):
            for a in request.data['activities']:
                if a['lesson']:
                    lesson_object = Lesson.objects.get(id=a['id'])
                    LessonAsActivity.objects.create(learning_class=new_class, lesson=lesson_object,
                                                    order=a['order'])
                else:
                    exercise_object = Exercise.objects.get(id=a['id'])
                    ExerciseAsActivity.objects.create(learning_class=new_class, exercise=exercise_object,
                                                      order=a['order'])

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class LearningClassTeacherRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = LearningClass.objects.all()
    serializer_class = LearningClassSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def put(self, request, *args, **kwargs):
        # print(request.data)
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # print(request.data)

        if 'activities' in list(request.data.keys()):
            new_exercises_ids = [a['id'] for a in request.data['activities'] if not a['lesson']]
            new_exercises = Exercise.objects.filter(id__in=new_exercises_ids)
            # Clear deleted lessons
            ExerciseAsActivity.objects.filter(learning_class=instance).exclude(exercise__in=new_exercises).delete()
            # Update or create new lessons
            for a in request.data['activities']:
                exercise_object = Exercise.objects.get(id=a['id'])
                obj, created = ExerciseAsActivity.objects.get_or_create(learning_class=instance, exercise=exercise_object,
                                                         defaults={'order': a['order']})
                obj.order = a['order']
                obj.save()
        else:
            ExerciseAsActivity.objects.filter(learning_class=instance).delete()
            
        response = super(LearningClassTeacherRetrieveUpdateDestroy, self).update(request, *args, **kwargs)
        return response


class LearningClassStudentList(generics.ListAPIView):
    queryset = LearningClass.objects.all()
    serializer_class = LearningClassSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        incoming = self.request.GET.get('incoming')
        old = self.request.GET.get('old')
        start_date = datetime.date.today()
        qs = LearningClass.objects.filter(student=self.request.user)
        if incoming:
            qs = qs.filter(start__gte=start_date)
        elif old:
            qs = qs.filter(start__lt=start_date)
        return qs.order_by('-start')


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


class TeacherHomeworkList(APIView):
    """
    View to list all tags for logged user
    """
    permission_classes = (IsAuthenticated, IsTeacher)

    def get(self, request):
        """
        Return a list of all homeworks (lessons and exercises)
        """

        student_id = self.request.GET.get('student')
        if student_id:
            qs = ExerciseInstance.objects.filter(teacher=request.user, student=student_id).\
                annotate(type=Value(0, IntegerField())).\
                values("id", "type", "student", "student__first_name", "student__last_name", "student__username",
                       "exercise", "exercise__title", "result", "status", "timestamp", "updated").order_by('-updated')
        else:
            qs = ExerciseInstance.objects.filter(teacher=request.user).\
                annotate(type=Value(0, IntegerField())).\
                values("id", "type", "student", "student__first_name", "student__last_name", "student__username",
                       "exercise", "exercise__title", "result", "status", "timestamp", "updated").order_by('-updated')
        paginator = LimitOffsetPagination()
        qs = paginator.paginate_queryset(qs, request)
        return Response({
            'count': paginator.count,
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'results': qs
        })


class LearningClassStudentRetrieveUpdate(generics.RetrieveUpdateAPIView):
    queryset = LearningClass.objects.all()
    serializer_class = LearningClassSerializer
    permission_classes = (IsAuthenticated, IsInvolved)

    def get(self, request, *args, **kwargs):
        response = super(LearningClassStudentRetrieveUpdate, self).get(request, *args, **kwargs)
        # print(response.data)
        return response

    def put(self, request, *args, **kwargs):
        # print(request.data)
        kwargs['partial'] = True
        obj = self.get_object()
        res = json.loads(request.data['result'])
        stat = json.loads(request.data['act_status'])

        for e in obj.exercises.all():
            a = ExerciseAsActivity.objects.get(exercise=e, learning_class=obj)
            a.result = res[a.order]
            a.status = stat[a.order]
            a.save()

        return self.update(request, *args, **kwargs)


class StudentHomeworkList(APIView):
    """
    View to list all tags for logged user
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """
        Return a list of all homeworks (lessons and exercises)
        """
        student_id = self.request.user
        started = ExerciseInstance.objects.filter(student=student_id, status=1).\
            annotate(type=Value(0, IntegerField())).\
            values("id", "type", "exercise", "exercise__title", "result", "status", "timestamp", "updated") \
            .order_by('-updated')
        not_started = ExerciseInstance.objects.filter(student=student_id, status=0).\
            annotate(type=Value(0, IntegerField())).\
            values("id", "type", "exercise", "exercise__title", "result", "status", "timestamp", "updated") \
            .order_by('-updated')
        rest = ExerciseInstance.objects.filter(student=student_id, status__gte=2).\
            annotate(type=Value(0, IntegerField())).\
            values("id", "type", "exercise", "exercise__title", "result", "status", "timestamp", "updated") \
            .order_by('-updated')
        qs = list(chain(started, not_started, rest))
        paginator = LimitOffsetPagination()
        qs = paginator.paginate_queryset(qs, request)
        return Response({
            'count': paginator.count,
            'next': paginator.get_next_link(),
            'previous': paginator.get_previous_link(),
            'results': qs
        })
