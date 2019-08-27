from django.urls import path
from .views import HomeworkTeacherListCreate, HomeworkTeacherRetrieveUpdateDestroy, HomeworkStudentListCreate, \
    HomeworkStudentRetrieveUpdateDestroy, LessonTeacherListCreate, LessonTeacherRetrieveUpdateDestroy, \
    LessonStudentList, LessonStudentRetrieveUpdate


app_name = 'lessons'

urlpatterns = [
    path('teacher/homework/', HomeworkTeacherListCreate.as_view(), name='teacher-homework'),
    path('student/homework/', HomeworkStudentListCreate.as_view(), name='exercise-instance-student'),
    path('teacher/homework/<int:pk>', HomeworkTeacherRetrieveUpdateDestroy.as_view(),
         name='teacher-homework-object'),
    path('student/homework/<int:pk>', HomeworkStudentRetrieveUpdateDestroy.as_view(),
         name='student-homework-object'),
    path('teacher/lesson/', LessonTeacherListCreate.as_view(), name='lesson-teacher'),
    path('teacher/lesson/<int:pk>', LessonTeacherRetrieveUpdateDestroy.as_view(),
         name='teacher-lesson-object'),
    path('student/lesson/', LessonStudentList.as_view(), name='learning-class-student'),
    path('student/lesson/<int:pk>', LessonStudentRetrieveUpdate.as_view(),
         name='student-lesson-object'),
]
