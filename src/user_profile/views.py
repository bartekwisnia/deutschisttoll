from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
# from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import User
from django.views.generic import CreateView, UpdateView

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission
from rest_framework.response import Response

from .models import Profile
from .forms import RegisterForm, ProfileForm, ProfileFormSet, PasswordChangeForm
from. serializers import ProfileSerializer, UserSerializer


# Create your views here.


# -----------------
# API views:
# -----------------
class MyProfileRetrieveUpdate(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        try:
            return self.request.user.profile
        except Profile.DoesNotExist:
            return None

    def update(self, request, *args, **kwargs):
        print("update")
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        request_data = request.data.copy()
        print(request_data)
        if 'user.username' in request_data:  # from API html version
            if instance.user.username == request_data['user.username']:
                request_data.pop('user.username')
        elif 'user' in request_data:  # from API React
            if 'username' in request.data['user']:
                if instance.user.username == request.data['user']['username']:
                    request_data['user'].pop('username')

        serializer = self.get_serializer(instance, data=request_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        print("put")
        print(request.data)

        # instance = self.get_object()
        # if 'user.username' in request.data:
        #     if instance.user.username == request.data['user.username']:
        #         print(request.data)
        #         new_request_data = request.data.copy()
        #         print(new_request_data)
        #         new_request_data.pop('user.username')
        #         request.data = new_request_data
        return super().put(request, args, kwargs)


class ProfileListCreate(generics.ListCreateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated, IsAdminUser)


class ProfileRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated, IsAdminUser)


class StudentListCreate(generics.ListCreateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated,)

    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, args, kwargs)

    def get_queryset(self):
        teacher_profile = self.request.user.profile
        qs = Profile.objects.filter(user__in=teacher_profile.students.all())
        return qs

    def post(self, request, *args, **kwargs):
        print(request.data)
        return super().post(request, args, kwargs)

    def create(self, request, *args, **kwargs):
        print('creating')
        serializer = self.get_serializer(data=request.data)
        print(serializer)
        is_valid = serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.profile.teacher


class StudentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (IsAuthenticated, IsTeacher)

    def delete(self, request, *args, **kwargs):
        teacher_profile = self.request.user.profile
        student_user = teacher_profile.students.get(pk=kwargs['pk'])
        print(student_user)
        teacher_profile.students.remove(student_user)
        return Response(status=status.HTTP_202_ACCEPTED)


# -----------------
# Django views:
# -----------------
# class RegisterView(CreateView):
#     form_class = RegisterForm
#     template_name = 'registration/register.html'
#     success_url = '/'
#
#     def dispatch(self, request, *args, **kwargs):
#         if self.request.user.is_authenticated:
#             return redirect("/logout")
#         return super(RegisterView, self).dispatch(request, *args, **kwargs)
    

class RegisterView(CreateView):
    template_name = 'registration/register.html'
    form_class = RegisterForm
    # second_form_class = ProfileForm
    success_url = '/login'

    def get_context_data(self, **kwargs):
        data = super(RegisterView, self).get_context_data(**kwargs)
        if self.request.POST:
            data['profile'] = ProfileFormSet(self.request.POST)
        else:
            data['profile'] = ProfileFormSet()
        return data

    def form_valid(self, form):
        context = self.get_context_data()
        profile = context['profile']
        self.object = form.save()
        if profile.is_valid():
            profile.instance = self.object
            profile.save()
        return super(RegisterView, self).form_valid(form)


# class PasswordChangeView(View):
#     template_name = 'registration/change_password.html'
#     form_class = PasswordChangeForm
#     model = User
#     # second_form_class = ProfileForm
#     success_url = '/'


#
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Important!
            messages.success(request, 'Your password was successfully updated!')
            return redirect('/')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'registration/change_password.html', {
        'form': form
    })

    # def get_context_data(self, **kwargs):
    #     context = super(RegisterView, self).get_context_data(**kwargs)
    #     context['form2'] = self.second_form_class()
    #     print(context)
    #     # if 'form' not in context:
    #     #     context['form'] = self.form_class(request=self.request)
    #     # if 'form2' not in context:
    #     #     context['form2'] = self.second_form_class(request=self.request)
    #     return context

    # def post(self, request, *args, **kwargs):
    #     response = super(RegisterView, self).post(request, *args, *kwargs)
    #     print(request.POST.get('teacher'))
    #     return response

    # def form_valid(self, form):
    #     instance = form.save(commit=False)
    #     teacher = self.request.POST.get('teacher')
    #
    #     return super(RegisterView, self).form_valid(form)

    # def form_valid(self, form):
    #     instance = form.save(commit=False)
    #     instance.user = self.request.user
    #     return super(ItemCreateView, self).form_valid(form)

    # def form_invalid(self, profile_form, register_form, **kwargs):
    #     profile_form.prefix='profile_form'
    #     register_form.prefix='register_form'
    #     return self.render_to_response(self.get_context_data('profile_form':profile_form, 'register_form':register_form ))