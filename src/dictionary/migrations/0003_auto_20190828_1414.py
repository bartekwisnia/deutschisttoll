# Generated by Django 2.1.1 on 2019-08-28 12:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('dictionary', '0002_auto_20190828_1410'),
    ]

    operations = [
        migrations.AlterField(
            model_name='wordlearning',
            name='word',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='learned', to='dictionary.Word'),
        ),
    ]
