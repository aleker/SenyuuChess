from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from django.db import models

from games.models import Game


class Room(models.Model):
    """
    Model representing rooms for one instance of the game (one rooms for two players).
    """
    id = models.AutoField(primary_key=True)
    password = models.CharField(max_length=30, null=False, blank=True)
    game = models.OneToOneField('games.Game', on_delete=models.SET_NULL, null=True, blank=True)
    # playersSessionKeys = ArrayField(models.IntegerField(null=True, blank=True, default=0), size=2)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        """
        String for representing the Model object
        """
        if self.id is None:
            return 'Room without id'
        else:
            return 'Room #%s' % self.id

    def __init__(self, password, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.password = password
        game = Game.objects.create()
        self.game = game

    def clean(self):
        if self.password is None:
            raise ValidationError('You have to set password!')
