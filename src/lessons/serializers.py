from django.contrib.auth import get_user_model

from rest_framework import serializers
from .models import Homework, Lesson, ExerciseInLesson, Schedule
from exercises.serializers import ExerciseSerializer
from exercises.models import Exercise
from user_profile.models import Profile
from user_profile.serializers import ProfileSerializer, UserSerializer

User = get_user_model()


class HomeworkTeacherSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.exercise.title

    def get_student_name(self, obj):
        name = obj.student.first_name + " " + obj.student.last_name \
            if obj.student.first_name and obj.student.last_name \
            else obj.student.username
        return name

    class Meta:
        model = Homework
        fields = '__all__'
        # exclude = ('owner', )
        extra_kwargs = {'teacher': {'read_only': True, 'required': False},
                        'name': {'read_only': True, 'required': False},
                        'student_name': {'read_only': True, 'required': False}}

    def validate_student(self, value):
        """
        Check that you assign Exercise to your student
        """
        user_profile = User.objects.get(username=self.context['request'].user)
        teacher_profile = Profile.objects.get(user=user_profile)
        if value not in teacher_profile.students.all():
            raise serializers.ValidationError("You can only assign Exercises to your students")
        return value

    def validate_exercise(self, value):
        """
        Check that you assign your Exercise or public Exercise if you are student
        """
        user_object = User.objects.get(username=self.context['request'].user)
        if value.owner != user_object:
            raise serializers.ValidationError("You can only assign your own Exercises")
        return value


class HomeworkStudentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.exercise.title

    class Meta:
        model = Homework
        fields = '__all__'
        # exclude = ('owner', )
        extra_kwargs = {'teacher': {'read_only': True, 'required': False},
                        'name': {'read_only': True, 'required': False},
                        'student': {'read_only': True, 'required': False}}

    def validate_exercise(self, value):
        """
        Check that you assign public Exercise if you are student
        """
        if not value.public:
            raise serializers.ValidationError("As a student you can only learn public Exercises")
        return value


class LessonSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)
    exercises_id = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all(), source='exercises', many=True, required=False)
    exercises_status = serializers.SerializerMethodField(read_only=True)
    exercises_result = serializers.SerializerMethodField(read_only=True)
    student = UserSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='student')
    teacher = UserSerializer(read_only=True, required=False)
    id = serializers.ReadOnlyField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_exercises_status(self, obj):
        exercises_in_lesson = ExerciseInLesson.objects.filter(lesson=obj)
        # print(exercises_in_lesson)
        return exercises_in_lesson.values_list('status', flat=True)

    def get_exercises_result(self, obj):
        exercises_in_lesson = ExerciseInLesson.objects.filter(lesson=obj)
        return exercises_in_lesson.values_list('result', flat=True)

    def validate_student(self, value):
        """
        Check that you assign lesson to your student
        """
        user_profile = User.objects.get(username=self.context['request'].user)
        teacher_profile = Profile.objects.get(user=user_profile)
        if value not in teacher_profile.students.all():
            raise serializers.ValidationError("You can only assign lessons to your students")
        return value

    def validate_exercises(self, value):
        """
        Check that you assign your Exercise
        """
        user_object = User.objects.get(username=self.context['request'].user)
        for exercise in value:
            if exercise.owner != user_object:
                raise serializers.ValidationError("You can only assign your own Exercises")
        return value


class ScheduleSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    student = UserSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='student')
    teacher = UserSerializer(read_only=True, required=False)

    class Meta:
        model = Schedule
        fields = '__all__'

    def validate_student(self, value):
        """
        Check that you assign scheduled lesson to your student
        """
        user_profile = User.objects.get(username=self.context['request'].user)
        teacher_profile = Profile.objects.get(user=user_profile)
        if value not in teacher_profile.students.all():
            raise serializers.ValidationError("You can only assign scheduled lessons to your students")
        return value
