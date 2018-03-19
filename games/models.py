from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
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
from django.db.models.signals import post_save
from django.dispatch import receiver

from rooms.models import Room


class AbstractChessPiece(models.Model):
    COLOR = (
        ('w', 'white'),
        ('b', 'black'),
    )

    TYPE = (
        ('K', 'king'),
        ('Q', 'queen'),
        ('r', 'rook'),      # x2, wieża
        ('k', 'knight'),    # x2
        ('b', 'bishop'),    # x2, hetman
        ('p', 'pawn'),      # x8
    )
    color = models.CharField(max_length=1, choices=COLOR, null=False, blank=False, default='w')
    type = models.CharField(max_length=1, choices=TYPE, null=False, blank=False, default='p')
    no = models.IntegerField(validators=[
            MaxValueValidator(8),
            MinValueValidator(1)
        ], blank=False, null=False, default=1)

    class Meta:
        ordering = ["color", "type", "no"]
        unique_together = (("color", "type", "no"),)

    def __str__(self):
        return '%s %s%d(%d)' % (self.color, self.type, self.no, self.id)


class AbstractField(models.Model):
    x = models.IntegerField(validators=[
            MaxValueValidator(7),
            MinValueValidator(0)
        ])
    y = models.IntegerField(validators=[
            MaxValueValidator(7),
            MinValueValidator(0)
        ])

    class Meta:
        ordering = ["x", "y"]
        unique_together = (("x", "y"),)

    def __str__(self):
        return 'Field (%d, %d)' % (self.x, self.y)


class FieldWithChessPiece(models.Model):
    id = models.AutoField(primary_key=True)
    field = models.ForeignKey('AbstractField', on_delete=models.CASCADE, null=True, blank=False)
    chessPiece = models.ForeignKey('AbstractChessPiece', on_delete=models.SET_NULL, null=True, blank=True)
    chessBoard = models.ForeignKey('ChessBoard', on_delete=models.CASCADE, null=False, blank=False)

    def __str__(self):
        return 'Field (%d, %d)' % (self.field.x, self.field.y)


class ChessBoard(models.Model):
    id = models.AutoField(primary_key=True)

    def __str__(self):
        return 'Board %d' % self.id


class Game(models.Model):
    """
    Model representing one instance of the game.
    """
    turn = (('w', 'White Player'), ('b', 'Black Player'))
    chessBoard = models.OneToOneField('ChessBoard', on_delete=models.SET_NULL, null=True, blank=False, unique=True)
    points = ArrayField(models.IntegerField(null=False, blank=False, default=0), size=2) # first - white, second - black

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        chessboard = ChessBoard.objects.create()
        self.create_fields_with_pieces(chessboard)
        self.chessBoard = chessboard

    @staticmethod
    def create_fields_with_pieces(chessboard):
        # TODO create fields with pieces
        abstract_fields_list = AbstractField.objects.all()
        abstract_chess_pieces_list = AbstractChessPiece.objects.all()
        #game = FieldWithChessPiece.objects.create(chessBoard=chessboard...)
        