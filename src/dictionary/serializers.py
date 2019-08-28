from rest_framework import serializers

from django.contrib.auth import get_user_model

from .models import Word, Translation, WordLearning, WordIcon

User = get_user_model()


class WordIconSerializer(serializers.ModelSerializer):

    class Meta:
        model = WordIcon
        fields = '__all__'


class TranslationSerializer(serializers.ModelSerializer):
    word = serializers.PrimaryKeyRelatedField(queryset=Word.objects.all(), many=False)

    class Meta:
        model = Translation
        fields = '__all__'
        depth = 1


class WordSerializer(serializers.ModelSerializer):
    translations = TranslationSerializer(many=True, read_only=True)
    add_translation = serializers.CharField(write_only=True, required=False)
    icon_id = serializers.IntegerField(write_only=True, required=False)
    icon = WordIconSerializer()

    class Meta:
        model = Word
        fields = '__all__'
        depth = 1

    def create(self, validated_data):
        print(validated_data)
        # create picture
        if "add_translation" in list(validated_data.keys()):
            add_translation = validated_data.pop('add_translation')
        else:
            add_translation = None
        if "icon_id" in list(validated_data.keys()):
            icon_id = validated_data.pop('icon_id')
        else:
            icon_id = None
        icon_data = validated_data.pop('icon')
        picture = icon_data['picture']
        description = icon_data['description']
        try:
            validated_data['icon'] = WordIcon.objects.get(id=icon_id)
        except WordIcon.DoesNotExist:
            if picture:
                obj, created = WordIcon.objects.get_or_create(picture=picture, defaults={'description': description})
                obj.description = description
                obj.save()
                validated_data['icon'] = obj
            else:
                validated_data['icon'] = None
        w = super(WordSerializer, self).create(validated_data)
        # create translation
        if add_translation:
            t = Translation.objects.create(text=add_translation, word=w)
        return w

    def update(self, instance, validated_data):
        if "add_translation" in list(validated_data.keys()):
            add_translation = validated_data.pop('add_translation')
        else:
            add_translation = None
        if "icon_id" in list(validated_data.keys()):
            icon_id = validated_data.pop('icon_id')
        else:
            icon_id = None
        icon_data = validated_data.pop('icon')
        picture = icon_data['picture']
        description = icon_data['description']
        try:
            validated_data['icon'] = WordIcon.objects.get(id=icon_id)
        except WordIcon.DoesNotExist:
            if picture:
                obj, created = WordIcon.objects.get_or_create(picture=picture, defaults={'description': description})
                obj.description = description
                obj.save()
                validated_data['icon'] = obj
            else:
                validated_data['icon'] = None
        w = super(WordSerializer, self).update(instance, validated_data)
        if add_translation:
            t = Translation.objects.get_or_create(text=add_translation, word=instance)
        return w


class WordLearningSerializer(serializers.ModelSerializer):
    word_id = serializers.PrimaryKeyRelatedField(queryset=Word.objects.all(), source='word', many=False)
    word = WordSerializer(many=False, read_only=True)

    class Meta:
        model = WordLearning
        fields = '__all__'
        extra_kwargs = {'student': {'read_only': True, 'required': False}}
        depth = 2
