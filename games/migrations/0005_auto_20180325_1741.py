# Generated by Django 2.0.3 on 2018-03-25 17:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0004_auto_20180325_1739'),
    ]

    operations = [
        migrations.DeleteModel(
            name='AbstractChessPiece',
        ),
        migrations.RemoveField(
            model_name='fieldwithchesspiece',
            name='chessPiece',
        ),
    ]
