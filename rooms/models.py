from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from django.db import models


class Room(models.Model):
    """
    Model representing room for one instance of the game (one room for two players).
    """
    id = models.AutoField(primary_key=True)
    password = models.CharField(max_length=30, null=False, blank=True)
    game = models.OneToOneField('games.Game', on_delete=models.SET_NULL, null=True, blank=True)
    playersSessionKeys = ArrayField(models.IntegerField(null=True, blank=True), size=2)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        """
        String for representing the Model object
        """
        if self.id is None:
            return 'Room without id'
        else:
            return '%s' % self.id

    def clean(self):
        if self.password is None:
            raise ValidationError('You have to set password!')
