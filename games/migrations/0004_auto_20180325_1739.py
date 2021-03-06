# Generated by Django 2.0.3 on 2018-03-25 17:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_auto_20180324_1838'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fieldwithchesspiece',
            name='chessPiece',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='games.AbstractChessPiece'),
        ),
        migrations.AlterField(
            model_name='game',
            name='chessBoard',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='games.ChessBoard'),
        ),
    ]
