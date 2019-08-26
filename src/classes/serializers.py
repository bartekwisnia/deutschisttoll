from django.contrib.auth import get_user_model

from rest_framework import serializers
from .models import LearningClass, LessonInstance, ExerciseInstance, LessonAsActivity, ExerciseAsActivity
from user_profile.serializers import ProfileSerializer
from user_profile.models import Profile
from lesson.models import Lesson, Exercise

User = get_user_model()


class ExerciseInstanceTeacherSerializer(serializers.ModelSerializer):
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
        model = ExerciseInstance
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


class ExerciseInstanceStudentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.exercise.title

    class Meta:
        model = ExerciseInstance
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


class LessonInstanceTeacherSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.lesson.title

    class Meta:
        model = LessonInstance
        fields = '__all__'
        # exclude = ('owner', )
        extra_kwargs = {'teacher': {'read_only': True, 'required': False},
                        'name': {'read_only': True, 'required': False},
                        'student_name': {'read_only': True, 'required': False}}

    def validate_student(self, value):
        """
        Check that you assign lesson to your student
        """
        user_profile = User.objects.get(username=self.context['request'].user)
        teacher_profile = Profile.objects.get(user=user_profile)
        if value not in teacher_profile.students.all():
            raise serializers.ValidationError("You can only assign lessons to your students")
        return value

    def validate_lesson(self, value):
        """
        Check that you assign your lesson or public lesson if you are student
        """
        user_object = User.objects.get(username=self.context['request'].user)
        if value.owner != user_object:
            raise serializers.ValidationError("You can only assign your own lessons")
        return value


class LessonInstanceStudentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.lesson.title

    class Meta:
        model = LessonInstance
        fields = '__all__'
        # exclude = ('owner', )
        extra_kwargs = {'teacher': {'read_only': True, 'required': False},
                        'name': {'read_only': True, 'required': False},
                        'student': {'read_only': True, 'required': False}}

    def validate_lesson(self, value):
        """
        Check that you assign public lesson if you are student
        """
        if not value.public:
            raise serializers.ValidationError("As a student you can only learn public lessons")
        return value


class LearningClassSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    activities = serializers.SerializerMethodField()
    id = serializers.ReadOnlyField()

    def get_student_name(self, obj):
        name = obj.student.first_name + " " + obj.student.last_name \
            if obj.student.first_name and obj.student.last_name \
            else obj.student.username
        return name

    def get_activities(self, obj):
        activities = []
        for l in obj.lessons.all():
            activity = LessonAsActivity.objects.get(lesson=l, learning_class=obj)
            activities.append({"lesson": 1, "id": l.id, "title": l.title, "type": "",
                               "categories": l.categories, "level": l.level, "order": activity.order,
                               "result": activity.result, "ex_status": activity.ex_status, "status": activity.status})
            print(activity.ex_status)
        for e in obj.exercises.all():
            a = ExerciseAsActivity.objects.filter(exercise=e, learning_class=obj)[0]
            activities.append({"lesson": 0, "id": e.id, "title": e.title, "type": e.type,
                               "categories": e.categories, "level": e.level, "order": a.order,
                               "result": a.result, "ex_status": [0, 0], "status": a.status})

        def sort_func(item):
            return item['order']

        activities.sort(key=sort_func)
        # const

        # print(obj.lessons)
        # print(obj.exercises)
        return activities

    class Meta:
        model = LearningClass
        # fields = '__all__'
        exclude = ('lessons', 'exercises')
        extra_kwargs = {'teacher': {'read_only': True, 'required': False},
                        'student_name': {'read_only': True, 'required': False},
                        'activities': {'read_only': True, 'required': False},
                        }

    def validate_student(self, value):
        """
        Check that you assign lesson to your student
        """
        user_profile = User.objects.get(username=self.context['request'].user)
        teacher_profile = Profile.objects.get(user=user_profile)
        if value not in teacher_profile.students.all():
            raise serializers.ValidationError("You can only assign lessons to your students")
        return value

    def validate_lessons(self, value):
        """
        Check that you assign your lesson
        """
        # print('lessons to validate in learning class: {}'.format(value))
        user_object = User.objects.get(username=self.context['request'].user)
        for lesson in value:
            if lesson.owner != user_object:
                raise serializers.ValidationError("You can only assign your own lessons")
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


#         .values_list("type", "student", "student__first_name", "student__last_name", "student__username",
#                      "lesson", "lesson__title", "result", "status", "timestamp", "updated").union(
#
# class HomeworkSerializer(serializers.Serializer):
#     type = serializers.IntegerField(read_only=True)
#     student = serializers.PrimaryKeyRelatedField(read_only=True)
#
#     title = serializers.CharField(required=False, allow_blank=True, max_length=100)
#     code = serializers.CharField(style={'base_template': 'textarea.html'})
#     linenos = serializers.BooleanField(required=False)
#     language = serializers.ChoiceField(choices=LANGUAGE_CHOICES, default='python')
#     style = serializers.ChoiceField(choices=STYLE_CHOICES, default='friendly')
