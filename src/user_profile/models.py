from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save


# Create your models here.

User = get_user_model()


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    teacher = models.BooleanField(verbose_name="Konto nauczyciela")
    students = models.ManyToManyField(User, related_name='my_teacher', blank=True)

    def __str__(self):
        return self.user.username


def post_save_user_receiver(sender, instance, created, *args, **kwargs):
    if created:
        pass
        # profile, is_created = Profile.objects.get_or_create(user=instance)
        # default_user_profile = Profile.objects.get_or_create(user__id=1)[0]
        # default_user_profile.followers.add(instance)
        # profile.followers.add(default_user_profile.user)
        # profile.followers.add(2)

post_save.connect(post_save_user_receiver, sender=User)
