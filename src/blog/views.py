from django.shortcuts import render


from rest_framework import generics, exceptions
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS

from .models import Entry
from. serializers import EntrySerializer

# Create your views here.


class IsTeacher(BasePermission):
    message = 'Only teacher can make entries'

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return True
        else:
            return request.user.profile.teacher


class IsAuthor(BasePermission):
    message = 'Only author can change the entry'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            # Check permissions for read only request
            return True
        else:
            # Check permissions for write request
            return request.user == obj.author


class EntryListCreate(generics.ListCreateAPIView):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    permission_classes = (IsAuthor, IsTeacher)

    def get_queryset(self):
        query = self.request.GET.get('query')
        qs = Entry.objects.all().order_by('-updated')
        if query:
            qs = qs.search(query)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class EntryRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
    permission_classes = (IsAuthor, IsTeacher)

    def put(self, request, *args, **kwargs):
        kwargs['partial'] = True
        print(request.data)
        if 'exercise_id' in request.data and request.data['exercise_id'] == '0':
            request.data._mutable = True
            request.data.pop('exercise_id')
            entry = super(EntryRetrieveUpdateDestroy, self).get_object()
            entry.exercise = None
            entry.save()
            print(request.data)
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        return super(EntryRetrieveUpdateDestroy, self).update(request, *args, **kwargs)
