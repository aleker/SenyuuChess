# Generated by Django 2.0.3 on 2018-03-18 23:44

import django.contrib.postgres.fields
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AbstractChessPiece',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('color', models.CharField(choices=[('w', 'white'), ('b', 'black')], default='w', max_length=1)),
                ('type', models.CharField(choices=[('K', 'king'), ('Q', 'queen'), ('r', 'rook'), ('k', 'knight'), ('b', 'bishop'), ('p', 'pawn')], default='p', max_length=1)),
                ('no', models.IntegerField(default=1, validators=[django.core.validators.MaxValueValidator(8), django.core.validators.MinValueValidator(1)])),
            ],
            options={
                'ordering': ['color', 'type', 'no'],
            },
        ),
        migrations.CreateModel(
            name='AbstractField',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('x', models.IntegerField(validators=[django.core.validators.MaxValueValidator(7), django.core.validators.MinValueValidator(0)])),
                ('y', models.IntegerField(validators=[django.core.validators.MaxValueValidator(7), django.core.validators.MinValueValidator(0)])),
            ],
            options={
                'ordering': ['x', 'y'],
            },
        ),
        migrations.CreateModel(
            name='ChessBoard',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
            ],
        ),
        migrations.CreateModel(
            name='FieldWithChessPiece',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('chessPiece', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='games.AbstractChessPiece')),
                ('field', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='games.AbstractField')),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(default=0), size=2)),
                ('chessBoard', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='games.ChessBoard')),
            ],
        ),
        migrations.AddField(
            model_name='chessboard',
            name='fields',
            field=models.ManyToManyField(related_name='parent_board', to='games.FieldWithChessPiece'),
        ),
        migrations.AlterUniqueTogether(
            name='abstractfield',
            unique_together={('x', 'y')},
        ),
        migrations.AlterUniqueTogether(
            name='abstractchesspiece',
            unique_together={('color', 'type', 'no')},
        ),
    ]
