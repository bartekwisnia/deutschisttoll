from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from rest_framework import serializers

from .models import Profile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email')
        extra_kwargs = {'password': {'write_only': True, 'required': False}, 'first_name': {'required': False},
                        'last_name': {'required': False}, 'username': {'required': False}}

    def create(self, validated_data):
        print("create user")
        user = User(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        if 'password' not in validated_data:
            validated_data['password'] = User.objects.make_random_password()

            name = validated_data['first_name'] if 'first_name' in validated_data else validated_data['username']
            email_text = """Cześć {}!
Witaj na stronie LernenDe.pl. Twoje konto zostało automatycznie utworzone przez Twojego nauczyciela.
Zaloguj się na sronie www.lernende.pl za pomocą danych:
użytkownik: {}
hasło: {}
""".format(name, validated_data['username'], validated_data['password'])

            send_mail(
                'Herzlich Wilkommen',
                email_text,
                'bartosz.wisniewski.1989@gmail.com',
                (validated_data['email'],),
                fail_silently=False,
            )

        user.set_password(validated_data['password'])
        user.save()
        return user
        # return User.objects.create(validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    teacher_id = serializers.IntegerField(required=False, write_only=True)
    id = serializers.IntegerField(required=False, read_only=True, source='pk')

    def validate(self, data):
        """
        Only teacher can have students
        """
        if 'students' in data:
            if not data['teacher'] and data['students']:
                raise serializers.ValidationError("Only teacher can have students")
        return data

    class Meta:
        model = Profile
        fields = '__all__'

    def create(self, validated_data):
        print("create")
        # create user
        user_data = validated_data.pop('user')
        user_serializer = UserSerializer(data=user_data)
        user = user_serializer.create(validated_data=user_data)
        # create profile for a user
        profile = Profile.objects.create(user=user, teacher=validated_data['teacher'])
        if profile.teacher and 'students' in validated_data:
            profile.students.set(validated_data['students'])
        # if a profile created by other user than add it as its student
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            creating_teacher = Profile.objects.get(user=request.user)
            creating_teacher.students.add(user)

        return profile

    def is_valid(self, raise_exception=False):
        print("is valid")
        print(self.initial_data)
        return super().is_valid(raise_exception)

    def update(self, instance, validated_data):
        print("update")
        print(instance)
        print(validated_data)
        # create user
        user_data = validated_data.pop('user')
        if 'students' in validated_data:
            students = validated_data.pop('students')
        user_serializer = UserSerializer(data=user_data)
        user = user_serializer.update(instance=instance.user, validated_data=user_data)
        # create profile for a user
        return super().update(instance, validated_data)





