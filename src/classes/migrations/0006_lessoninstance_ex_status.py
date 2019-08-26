# Generated by Django 2.1.1 on 2019-05-26 13:39

from django.db import migrations
import jsonfield.encoder
import jsonfield.fields


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0005_auto_20190513_1712'),
    ]

    operations = [
        migrations.AddField(
            model_name='lessoninstance',
            name='ex_status',
            field=jsonfield.fields.JSONField(blank=True, dump_kwargs={'cls': jsonfield.encoder.JSONEncoder, 'separators': (',', ':')}, load_kwargs={}, null=True),
        ),
    ]