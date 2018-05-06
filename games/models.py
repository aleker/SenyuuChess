import json

import os
from enum import Enum

from django.db import models

# https://docs.djangoproject.com/en/2.0/ref/models/fields/
# *null:
# If True, Django will store empty values as NULL in the database. Default is False.
# Avoid using null on string-based fields such as CharField and TextField.
# One exception is when a CharField has both unique=True and blank=True set.
# blank:
# If True, the field is allowed to be blank. Default is False.
# Note that this is different than null.
# null is purely database-related, whereas blank is validation-related.
# If a field has blank=True, form validation will allow entry of an empty value.
# If a field has blank=False, the field will be required.
# help_text:
# Extra “help” text to be displayed with the form widget.
# It’s useful for documentation even if your field isn’t used on a form.
# primary_key:
# If you don’t specify primary_key=True for any field in your model, Django will automatically add an AutoField
# to hold the primary key, so you don’t need to set primary_key=True on any of your fields
# unless you want to override the default primary-key behavior.
# unique:
# If True, this field must be unique throughout the table.
# This is enforced at the database level and by model validation.
# If you try to save a model with a duplicate value in a unique field, a django.db.IntegrityError will be raised
# by the model’s save() method.
# editable:
# ForeignKey:
# A many-to-one relationship.
# ForeignKey.on_delete - decide what happens when an object referenced by a ForeignKey is deleted


class PIECE(Enum):
    PAWN = 0
    CASTLE_1 = 1
    CASTLE_2 = 2
    ROUKE = 3
    BISHOP_1 = 4
    BISHOP_2 = 5
    QUEEN = 6
    KING = 7


class Game(models.Model):
    """
    Model representing one instance of the game.
    """
    PLAYERS_COLORS = (('w', 'White Player'), ('b', 'Black Player'))
    turn = models.CharField(max_length=15, choices=PLAYERS_COLORS, default="w")
    white_points = models.IntegerField(blank=False, null=False, default=0)
    black_points = models.IntegerField(blank=False, null=False, default=0)
    piecesPositions = models.CharField(max_length=500, null=True, blank=True)
    white_player_socket_name = models.CharField(max_length=500, null=True, blank=True, default=None)
    black_player_socket_name = models.CharField(max_length=500, null=True, blank=True, default=None)

    def __str__(self):
        return 'Game #%s' % self.pk

    def clean(self):
        if self.piecesPositions is None:
            module_dir = os.path.dirname(__file__)              # get current directory
            json_file_path = os.path.join(module_dir, 'static/games/default_setting.json')
            json_data = open(json_file_path)
            json_struct = json.load(json_data)                  # deserialises it (JSON)
            json_string = json.dumps(json_struct)               # json formatted STRING
            json_data.close()
            self.piecesPositions = json_string
            self.save()

# you need parse json to string and save with CharField using json.dumps(data).
# To recovery data, use json string to dict with json.loads(json_string)
