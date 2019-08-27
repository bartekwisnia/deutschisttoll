from rest_framework import serializers
from .models import Exercise, ExerciseSet


class ExerciseSerializer(serializers.ModelSerializer):
    type = serializers.ChoiceField(choices=Exercise.TYPES)
    # type_choices = serializers.JSONField(source='get_types', read_only=True)

    class Meta:
        model = Exercise
        fields = '__all__'
        # exclude = ('owner', )
        extra_kwargs = {'owner': {'read_only': True, 'required': False}}


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
        print('serializer create: {}'.format(validated_data))
        (validated_data['categories'], validated_data['level']) = get_tags(validated_data['exercises'])
        return super(ExerciseSetSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        if 'exercises' in validated_data:
            print('serializer update: {}'.format(validated_data))
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
