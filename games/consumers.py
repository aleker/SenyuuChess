from channels.generic.websocket import AsyncWebsocketConsumer
import json

from games.models import Game

# A channel is a mailbox where messages can be sent to. Each channel has a name.
# Anyone who has the name of a channel can send a message to the channel.

# A group is a group of related channels. A group has a name.
# Anyone who has the name of a group can add/remove a channel to the group by name and send a message to
# all channels in the group. It is not possible to enumerate what channels are in a particular group.


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, scope):
        super().__init__(scope)
        self.game_name = self.scope['url_route']['kwargs']['pk_game']
        self.game_group_name = 'game_%s' % self.game_name
        self.game_object = Game.objects.get(pk=self.game_name)

    async def connect(self):
        # Join room group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']

        if message_type == 'onOpen':
            await self.send(text_data=json.dumps({
                'type': 'startPositions',
                'positions': json.loads(self.game_object.piecesPositions)
            }))
        else:
            print("Strange message type!")


