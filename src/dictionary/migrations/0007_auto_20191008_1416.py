# Generated by Django 2.1.1 on 2019-10-08 12:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dictionary', '0006_auto_20190828_2335'),
    ]

    operations = [
        migrations.AlterField(
            model_name='word',
            name='preposition',
            field=models.CharField(blank=True, max_length=5, null=True),
        ),
    ]
