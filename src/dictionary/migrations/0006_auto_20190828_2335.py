# Generated by Django 2.1.1 on 2019-08-28 21:35

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('dictionary', '0005_wordicon_description'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='translation',
            unique_together={('text', 'word')},
        ),
        migrations.AlterUniqueTogether(
            name='word',
            unique_together={('text', 'preposition')},
        ),
        migrations.AlterUniqueTogether(
            name='wordlearning',
            unique_together={('student', 'word')},
        ),
    ]
