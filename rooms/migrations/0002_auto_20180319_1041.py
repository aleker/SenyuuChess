# Generated by Django 2.0.3 on 2018-03-19 10:41

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='playersSessionKeys',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(blank=True, default=0, null=True), size=2),
        ),
    ]
