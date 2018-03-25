# Generated by Django 2.0.3 on 2018-03-25 17:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0006_auto_20180325_1742'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='fieldwithchesspiece',
            name='chessBoard',
        ),
        migrations.RemoveField(
            model_name='game',
            name='chessBoard',
        ),
        migrations.AddField(
            model_name='game',
            name='piecesPositions',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.DeleteModel(
            name='ChessBoard',
        ),
        migrations.DeleteModel(
            name='FieldWithChessPiece',
        ),
    ]
