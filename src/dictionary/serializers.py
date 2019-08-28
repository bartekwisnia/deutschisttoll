from rest_framework import serializers

from django.contrib.auth import get_user_model

from .models import Word, Translation, WordLearning

User = get_user_model()


class TranslationSerializer(serializers.ModelSerializer):
    word = serializers.PrimaryKeyRelatedField(queryset=Word.objects.all(), many=False)

    class Meta:
        model = Translation
        fields = '__all__'
        depth = 1


class WordSerializer(serializers.ModelSerializer):
    translations = TranslationSerializer(many=True, read_only=True)

    class Meta:
        model = Word
        fields = '__all__'
        depth = 1


class WordLearningSerializer(serializers.ModelSerializer):
    word_id = serializers.PrimaryKeyRelatedField(queryset=Word.objects.all(), source='word', many=False)
    word = WordSerializer(many=False, read_only=True)

    class Meta:
        model = WordLearning
        fields = '__all__'
        extra_kwargs = {'student': {'read_only': True, 'required': False}}
        depth = 2
