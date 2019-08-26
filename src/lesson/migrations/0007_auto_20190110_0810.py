# Generated by Django 2.1.1 on 2019-01-10 07:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lesson', '0006_lesson_categories'),
    ]

    operations = [
        migrations.AddField(
            model_name='exercise',
            name='level',
            field=models.TextField(blank=True, help_text='A1, A2', null=True),
        ),
        migrations.AddField(
            model_name='lesson',
            name='level',
            field=models.TextField(blank=True, default='', help_text='A1, A2', null=True),
        ),
        migrations.AlterField(
            model_name='exercise',
            name='categories',
            field=models.TextField(blank=True, help_text='gramatyka, czas przeszły', null=True),
        ),
        migrations.AlterField(
            model_name='lesson',
            name='categories',
            field=models.TextField(blank=True, default='', help_text='gramatyka, czas przeszły', null=True),
        ),
    ]