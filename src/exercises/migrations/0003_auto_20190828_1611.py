# Generated by Django 2.1.1 on 2019-08-28 14:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0002_auto_20190828_1610'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exercise',
            name='words',
            field=models.ManyToManyField(blank=True, related_name='used_in_exercises', through='exercises.WordInExercise', to='dictionary.Word'),
        ),
    ]