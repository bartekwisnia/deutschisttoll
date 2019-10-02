from django.urls import path
from .views import HomeworkTeacherListCreate, HomeworkTeacherRetrieveUpdateDestroy, HomeworkStudentListCreate, \
    HomeworkStudentRetrieveUpdateDestroy, LessonTeacherListCreate, LessonTeacherRetrieveUpdateDestroy, \
    LessonStudentList, LessonStudentRetrieveUpdate, ScheduleTeacherListCreate, ScheduleTeacherRetrieveUpdateDestroy, \
    ScheduleStudentList, ScheduleStudentRetrieveUpdate, MakeLesson


app_name = 'lessons'

urlpatterns = [
    path('teacher/homework/', HomeworkTeacherListCreate.as_view(), name='teacher-homework'),
    path('student/homework/', HomeworkStudentListCreate.as_view(), name='student-homework'),
    path('teacher/homework/<int:pk>', HomeworkTeacherRetrieveUpdateDestroy.as_view(),
         name='teacher-homework-object'),
    path('student/homework/<int:pk>', HomeworkStudentRetrieveUpdateDestroy.as_view(),
         name='student-homework-object'),
    path('teacher/lesson/', LessonTeacherListCreate.as_view(), name='teacher-lesson'),
    path('teacher/lesson/<int:pk>', LessonTeacherRetrieveUpdateDestroy.as_view(),
         name='teacher-lesson-object'),
    path('student/lesson/', LessonStudentList.as_view(), name='student-lesson'),
    path('student/lesson/<int:pk>', LessonStudentRetrieveUpdate.as_view(),
         name='student-lesson-object'),
    path('teacher/schedule/', ScheduleTeacherListCreate.as_view(), name='teacher-schedule'),
    path('teacher/schedule/<int:pk>', ScheduleTeacherRetrieveUpdateDestroy.as_view(),
         name='teacher-schedule-object'),
    path('make-lesson/<int:pk>', MakeLesson.as_view(),
         name='make-lesson'),
    path('student/schedule/', ScheduleStudentList.as_view(), name='student-schedule'),
    path('student/schedule/<int:pk>', ScheduleStudentRetrieveUpdate.as_view(),
         name='student-schedule-object'),
]
