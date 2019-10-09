# Generated by Django 2.1.1 on 2019-10-08 09:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0009_auto_20191008_1100'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exercise',
            name='type',
            field=models.CharField(choices=[('DES_PIC', 'Opisz zdjęcie'), ('SEL_TRANS', 'Tłumaczenie'), ('PUZ', 'Puzzle'), ('CLICK', 'Naciśnij i zapamiętaj'), ('SORT', 'Sortowanie'), ('SEL_OPT', 'Wybierz opcję'), ('CONJ', 'Odmiana czasownika')], default='DES_PIC', max_length=30),
        ),
    ]
