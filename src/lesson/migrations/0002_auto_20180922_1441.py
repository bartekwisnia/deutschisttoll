# Generated by Django 2.1.1 on 2018-09-22 12:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lesson', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exercise',
            name='categories',
        ),
        migrations.AddField(
            model_name='exercise',
            name='categories',
            field=models.TextField(blank=True, help_text='gramatyka, B2, odmiana czasownika...', null=True),
        ),
    ]