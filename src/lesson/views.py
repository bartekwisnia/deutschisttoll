from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse
from django.views.generic import CreateView, ListView, DetailView, UpdateView
from django.http import JsonResponse

from rest_framework import generics, exceptions
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions

from .models import Exercise, Lesson, exercise_get_config, lesson_get_config
from .forms import ExerciseForm, LessonForm
from. serializers import ExerciseSerializer, LessonSerializer

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


class IsAuthenticatedOrPublic(BasePermission):
    message = 'Only owner can change this object'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return obj.public
        else:
            # Check permissions for write request
            return IsAuthenticated.has_object_permission(request, view, obj)


class ExerciseListCreate(generics.ListCreateAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = (IsAuthenticated,)

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

    def create(self, request, *args, **kwargs):
        print(request.data)
        response = super(ExerciseListCreate, self).create(request)
        return response


class ExerciseSearch(generics.ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = Exercise.objects.exclude(owner=self.request.user).filter(public=True)
        if query:
            qs = qs.search(query)
        return qs


class ExerciseRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = (IsAuthenticatedOrPublic, IsOwner)

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


class LessonListCreate(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = Lesson.objects.filter(owner=self.request.user)
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
        response = super(LessonListCreate, self).create(request)
        return response


class LessonRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
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
        return super(LessonRetrieveUpdateDestroy, self).update(request, *args, **kwargs)


class LessonSearch(generics.ListAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = Lesson.objects.exclude(owner=self.request.user).filter(public=True)
        if query:
            qs = qs.search(query)
        return qs


@api_view(['GET'])
def lesson_config(request):
    if request.method == 'GET':
        return JsonResponse(lesson_get_config())

# -----------------
# Standard views:
# -----------------


class ExerciseCreateView(CreateView):
    model = Exercise
    form_class = ExerciseForm

    # def get_object(self, queryset=None):
    #     return Project.objects.get(no=self.kwargs.get('no'))

    def get_success_url(self):
        return reverse('lessons:exercise-list')

    def get_form_kwargs(self):
        words_count = self.request.GET.get('words_count')
        if not words_count:
            words_count = 1
        else:
            words_count = int(words_count)
        # words_count = 1
        kwargs = super(ExerciseCreateView, self).get_form_kwargs()
        kwargs.update({'words_count': words_count})
        return kwargs


class ExerciseListView(LoginRequiredMixin, ListView):
    model = Exercise

    # def get_queryset(self):
    #     return E.objects.order_by('-start')


class ExerciseUpdateView(UpdateView):
    model = Exercise
    form_class = ExerciseForm

    # def get_object(self, queryset=None):
    #     return Project.objects.get(no=self.kwargs.get('no'))

    def get_form_kwargs(self):
        words_count = self.request.GET.get('words_count')
        if not words_count:
            words_count = 1
        else:
            words_count = int(words_count)
        # words_count = 1
        kwargs = super(ExerciseUpdateView, self).get_form_kwargs()
        kwargs.update({'words_count': words_count})
        return kwargs


class ExerciseDetailView(DetailView):
    model = Exercise

    # def get_object(self, queryset=None):
    #     return Project.objects.get(no=self.kwargs.get('no'))


class LessonCreateView(CreateView):
    model = Lesson
    form_class = LessonForm

    # def get_object(self, queryset=None):
    #     return Project.objects.get(no=self.kwargs.get('no'))

    def get_success_url(self):
        return reverse('lessons:lesson-list')


class LessonListView(LoginRequiredMixin, ListView):
    model = Lesson

    # def get_queryset(self):
    #     return E.objects.order_by('-start')


class LessonUpdateView(UpdateView):
    model = Lesson
    form_class = LessonForm

    # def get_object(self, queryset=None):
    #     return Project.objects.get(no=self.kwargs.get('no'))


class LessonDetailView(DetailView):
    model = Lesson

    # def get_object(self, queryset=None):
    #     return Project.objects.get(no=self.kwargs.get('no'))


# class ExerciseCategoryCreateView(CreateView):
#     model = ExerciseCategory
#     form_class = ExerciseCategoryForm
#
#     # def get_object(self, queryset=None):
#     #     return Project.objects.get(no=self.kwargs.get('no'))
#
#     def get_success_url(self):
#         return reverse('lessons:category-list')
#
#
# class ExerciseCategoryListView(LoginRequiredMixin, ListView):
#     model = ExerciseCategory
#
#     # def get_queryset(self):
#     #     return E.objects.order_by('-start')
#
#
# class ExerciseCategoryUpdateView(UpdateView):
#     model = ExerciseCategory
#     form_class = ExerciseCategoryForm
#
#     # def get_object(self, queryset=None):
#     #     return Project.objects.get(no=self.kwargs.get('no'))
#
#
# class ExerciseCategoryDetailView(DetailView):
#     model = ExerciseCategory
#
#     # def get_object(self, queryset=None):
#     #     return Project.objects.get(no=self.kwargs.get('no'))