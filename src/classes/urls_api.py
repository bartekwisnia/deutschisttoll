from django.urls import path
from .views import LessonInstanceTeacherListCreate, LessonInstanceStudentListCreate, \
    LessonInstanceTeacherRetrieveUpdateDestroy, LessonInstanceStudentRetrieveUpdateDestroy, \
    ExerciseInstanceTeacherListCreate, ExerciseInstanceStudentListCreate, \
    ExerciseInstanceTeacherRetrieveUpdateDestroy, ExerciseInstanceStudentRetrieveUpdateDestroy, \
    LearningClassTeacherListCreate, LearningClassTeacherRetrieveUpdateDestroy, LearningClassStudentList, \
    LearningClassStudentRetrieveUpdate, TeacherHomeworkList, StudentHomeworkList

app_name = 'classes'

urlpatterns = [
    path('teacher/exercise/', ExerciseInstanceTeacherListCreate.as_view(), name='exercise-instance-teacher'),
    path('student/exercise/', ExerciseInstanceStudentListCreate.as_view(), name='exercise-instance-student'),
    path('teacher/exercise/<int:pk>', ExerciseInstanceTeacherRetrieveUpdateDestroy.as_view(),
         name='exercise-instance-teacher-object'),
    path('student/exercise/<int:pk>', ExerciseInstanceStudentRetrieveUpdateDestroy.as_view(),
         name='exercise-instance-student-object'),
    path('teacher/lesson/', LessonInstanceTeacherListCreate.as_view(), name='lesson-instance-teacher'),
    path('student/lesson/', LessonInstanceStudentListCreate.as_view(), name='lesson-instance-student'),
    path('teacher/lesson/<int:pk>', LessonInstanceTeacherRetrieveUpdateDestroy.as_view(),
         name='lesson-instance-teacher-object'),
    path('student/lesson/<int:pk>', LessonInstanceStudentRetrieveUpdateDestroy.as_view(),
         name='lesson-instance-student-object'),
    path('teacher/learning-class/', LearningClassTeacherListCreate.as_view(), name='learning-class-teacher'),
    path('teacher/learning-class/<int:pk>', LearningClassTeacherRetrieveUpdateDestroy.as_view(),
         name='learning-class-teacher-object'),
    path('student/learning-class/', LearningClassStudentList.as_view(), name='learning-class-student'),
    path('student/learning-class/<int:pk>', LearningClassStudentRetrieveUpdate.as_view(),
         name='learning-class-student-object'),
    path('teacher/homework/', TeacherHomeworkList.as_view(), name='homework-list-teacher'),
    path('student/homework/', StudentHomeworkList.as_view(), name='homework-list-student'),
]
