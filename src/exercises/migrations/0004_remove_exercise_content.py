# Generated by Django 2.1.1 on 2019-08-28 15:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0003_auto_20190828_1611'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exercise',
            name='content',
        ),
    ]
