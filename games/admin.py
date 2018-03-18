from django.contrib import admin

from games.models import *

admin.site.register(AbstractChessPiece)
admin.site.register(AbstractField)
admin.site.register(FieldWithChessPiece)
admin.site.register(ChessBoard)
admin.site.register(Game)
