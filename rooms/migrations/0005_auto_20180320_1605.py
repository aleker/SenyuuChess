# Generated by Django 2.0.3 on 2018-03-20 16:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0002_auto_20180320_1550'),
        ('rooms', '0004_auto_20180320_1605'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='game',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='games.Game'),
        ),
        migrations.AddField(
            model_name='room',
            name='password',
            field=models.CharField(blank=True, max_length=30),
        ),
    ]