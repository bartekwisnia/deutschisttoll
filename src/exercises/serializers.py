from rest_framework import serializers
from .models import Exercise, ExerciseSet, WordInExercise, Sentence
from dictionary.models import Word, WordIcon
from dictionary.serializers import WordSerializer, WordIconSerializer


# class WordInExerciseSerializer(serializers.Serializer):
#     word_id = serializers.PrimaryKeyRelatedField(queryset=Word.objects.all())
#     comment = serializers.CharField(max_length=30)
#     highlight_start = serializers.IntegerField(default=0, blank=True)
#     highlight_end = serializers.IntegerField(default=0, blank=True)
#
#     def create(self, validated_data):
#         return Word(**validated_data)
#
#     def update(self, instance, validated_data):
#         instance.email = validated_data.get('email', instance.email)
#         instance.content = validated_data.get('content', instance.content)
#         instance.created = validated_data.get('created', instance.created)
#         return instance


class WordInExerciseSerializer(serializers.ModelSerializer):
    word = serializers.PrimaryKeyRelatedField(queryset=Word.objects.all())
    exercise = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all())
    text = serializers.SerializerMethodField(read_only=True)
    icon_id = serializers.IntegerField(write_only=True, required=False)
    icon_picture = serializers.ImageField(write_only=True, required=False)
    icon_description = serializers.CharField(write_only=True, required=False)
    icon = WordIconSerializer(read_only=True)

    class Meta:
        model = WordInExercise
        fields = '__all__'

    def get_text(self, obj):
        return obj.word.text

    def create(self, validated_data):
        print(validated_data)
        # create picture
        if "icon_id" in list(validated_data.keys()):
            icon_id = validated_data.pop('icon_id')
        else:
            icon_id = None
        if "icon_picture" in list(validated_data.keys()):
            icon_picture = validated_data.pop('icon_picture')
        else:
            icon_picture = None
        if "icon_description" in list(validated_data.keys()):
            icon_description = validated_data.pop('icon_description')
        else:
            icon_description = None

        try:
            validated_data['icon'] = WordIcon.objects.get(id=icon_id)
            if icon_description:
                validated_data['icon'].description = icon_description;
                validated_data['icon'].save()
        except WordIcon.DoesNotExist:
            if icon_picture:
                obj = WordIcon.objects.create(picture=icon_picture, description=icon_description)
                validated_data['icon'] = obj
            else:
                validated_data['icon'] = None
        w = super(WordInExerciseSerializer, self).create(validated_data)
        return w

    def update(self, instance, validated_data):

        if "icon_id" in list(validated_data.keys()):
            icon_id = validated_data.pop('icon_id')
        else:
            icon_id = None
        if "icon_picture" in list(validated_data.keys()):
            icon_picture = validated_data.pop('icon_picture')
        else:
            icon_picture = None
        if "icon_description" in list(validated_data.keys()):
            icon_description = validated_data.pop('icon_description')
        else:
            icon_description = None

        try:
            validated_data['icon'] = WordIcon.objects.get(id=icon_id)
            if icon_description:
                validated_data['icon'].description = icon_description;
                validated_data['icon'].save()
        except WordIcon.DoesNotExist:
            if icon_picture:
                obj = WordIcon.objects.create(picture=icon_picture, description=icon_description)
                validated_data['icon'] = obj
            else:
                validated_data['icon'] = None
        w = super(WordInExerciseSerializer, self).update(instance, validated_data)
        return w


class ExerciseSerializer(serializers.ModelSerializer):
    type = serializers.ChoiceField(choices=Exercise.TYPES)
    words = serializers.SerializerMethodField(read_only=True)
    sentences = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Exercise
        fields = '__all__'
        extra_kwargs = {'owner': {'read_only': True, 'required': False}}
        depth = 1

    def get_words(self, obj):
        words = WordInExercise.objects.filter(exercise=obj).order_by('comment', 'group', 'word__text')
        return WordInExerciseSerializer(words, many=True).data

    def get_sentences(self, obj):
        sentences = Sentence.objects.filter(exercise=obj)
        return SentenceSerializer(sentences, many=True).data


class ExerciseTagsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Exercise
        fields = ('categories', 'level')
        extra_kwargs = {'categories': {'read_only': True}, 'level': {'read_only': True}}


def get_tags(exercises):
    ex_cat = []
    ex_lev = []
    for ex in exercises:
        if ex.categories:
            cats = ex.categories.split(',')
            for cat in cats:
                if cat[0] == ' ':
                    cat = cat[1:]
                if cat[:-1] == ' ':
                    cat = cat[:-2]
                if cat not in ex_cat:
                    ex_cat.append(cat)
        if ex.level:
            levs = ex.level.split(',')
            for lev in levs:
                if lev[0] == ' ':
                    lev = lev[1:]
                if lev[:-1] == ' ':
                    lev = lev[:-2]
                if lev not in ex_lev:
                    ex_lev.append(lev)
    ex_cat = ", ".join(ex_cat)
    ex_lev = ", ".join(ex_lev)
    return ex_cat, ex_lev


class ExerciseSetSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)
    exercises_id = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all(), source='exercises', many=True)

    class Meta:
        model = ExerciseSet
        fields = '__all__'
        # exclude = ('owner', )
        extra_kwargs = {'owner': {'read_only': True, 'required': False}}

    def create(self, validated_data):
        # print('serializer create: {}'.format(validated_data))
        (validated_data['categories'], validated_data['level']) = get_tags(validated_data['exercises'])
        return super(ExerciseSetSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        if 'exercises' in validated_data:
            # print('serializer update: {}'.format(validated_data))
            (validated_data['categories'], validated_data['level']) = get_tags(validated_data['exercises'])
        return super(ExerciseSetSerializer, self).update(instance, validated_data)


class ExerciseSetTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ('categories', 'level')
        extra_kwargs = {'categories': {'read_only': True}, 'level': {'read_only': True}}

    # def to_representation(self, instance):
    #     response = super().to_representation(instance)
    #     response['exercises'] = ExerciseSerializer(instance.exercises).data
    #     return response

    # def create(self, validated_data):
    #
    #     user = None
    #     request = self.context.get("request")
    #     if request and hasattr(request, "user"):
    #         user = request.user
    #     print(user)
    #     print(validated_data)
    #     validated_data['owner'] = user
    #     print(validated_data)
    #     # exercise = ExerciseSerializer.create(ExerciseSerializer(), validated_data=validated_data)
    #     # print(validated_data)
    #     exercise = ExerciseSerializer.objects.create(validated_data)
    #     print(exercise)
    #     return exercise


class SentenceSerializer(serializers.ModelSerializer):
    exercise = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all())

    class Meta:
        model = Sentence
        fields = '__all__'

    # def create(self, validated_data):
    #
    #     request = self.context.get("request")
    #     print(request)
    #     if request and hasattr(request, "exercise_id"):
    #         exercise = request.exercise_id
    #         print(exercise)
    #     print(validated_data)
    #     validated_data['exercise'] = Exercise.objects.get(id=validated_data['exercise_id'])
    #     print(validated_data)
    #     # exercise = ExerciseSerializer.create(ExerciseSerializer(), validated_data=validated_data)
    #     # print(validated_data)
    #     sentence = super(SentenceSerializer, self).create(validated_data)
    #     print(sentence)
    #     return sentence
