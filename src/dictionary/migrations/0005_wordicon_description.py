# Generated by Django 2.1.1 on 2019-08-28 14:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dictionary', '0004_auto_20190828_1610'),
    ]

    operations = [
        migrations.AddField(
            model_name='wordicon',
            name='description',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
    ]
