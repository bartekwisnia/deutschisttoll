from rest_framework import serializers
from .models import Entry
from lesson.serializers import ExerciseSerializer
from lesson.models import Exercise
from user_profile.serializers import ProfileSerializer


class EntrySerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all(), source='exercise')

    class Meta:
        model = Entry
        fields = '__all__'
        extra_kwargs = {'author': {'read_only': True, 'required': False},
                        'exercise_id': {'required': False}}
        depth = 1
