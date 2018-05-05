from channels.generic.websocket import AsyncWebsocketConsumer
import json

from games.game_rules import *
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
        color = self.choose_player_if_free_spot()
        # inform socket about chosen color
        if color is not None:
            await self.send(text_data=json.dumps({
                'type': 'player_color',
                'color': color
            }))
        # send broadcast info about free spots
        await self.channel_layer.group_send(self.game_group_name, {
            'type': 'free_spots_list',
            'color': self.get_free_spots()
        })

    async def disconnect(self, close_code):
        color = self.remove_player_when_disconnected()
        # send broadcast info about new free spot
        if color is not None:
            await self.channel_layer.group_send(self.game_group_name, {
                'type': 'new_free_spot',
                'color': color
            })
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
                'type': 'start_positions',
                'positions': json.loads(self.game_object.piecesPositions)
            }))
        elif message_type == 'new_move':
            if is_my_turn(self.game_name, self.channel_name):
                updated_positions = calculate_new_positions(self.game_name,
                                                            text_data_json["selectedPiece"],
                                                            text_data_json["clickedBlock"],
                                                            text_data_json["enemyPiece"])
                if updated_positions is not False:
                    await self.channel_layer.group_send(self.game_group_name, {
                        'type': 'updated_positions_broadcast',
                        'updatedPositions': updated_positions,
                    })
        else:
            print("Strange message type!")

    # Receive message from game group
    async def updated_positions_broadcast(self, text_data_json):
        print("Send positions.")
        await self.send(text_data=json.dumps(text_data_json))

    async def free_spots_list(self, text_data_json):
        # update game object
        self.game_object = Game.objects.get(pk=self.game_name)
        print("Send free spots list.")
        await self.send(text_data=json.dumps(text_data_json))

    async def new_free_spot(self, text_data_json):
        # update game object
        self.game_object = Game.objects.get(pk=self.game_name)
        print("Send info about new free spot.")
        await self.send(text_data=json.dumps(text_data_json))

    # Free spots checking
    def get_free_spots(self):
        free_spots = {"white": 0, "black": 0}
        if not self.is_color_spot_free('white'):
            free_spots["white"] = 1
        if not self.is_color_spot_free('black'):
            free_spots["black"] = 1
        return free_spots

    def is_color_spot_free(self, color):
        # update game object
        self.game_object = Game.objects.get(pk=self.game_name)
        if color == 'white':
            if self.game_object.white_player_socket_name is None:
                return True
        elif color == 'black':
            if self.game_object.black_player_socket_name is None:
                return True
        return False

    def set_spot(self, color):
        if color == 'white':
            self.game_object.white_player_socket_name = self.channel_name
        elif color == 'black':
            self.game_object.black_player_socket_name = self.channel_name
        self.game_object.save()

    def choose_player_if_free_spot(self):
        if self.is_color_spot_free('white'):
            self.set_spot('white')
            return 'white'
        elif self.is_color_spot_free('black'):
            self.set_spot('black')
            return 'black'
        return None

    def remove_player_when_disconnected(self):
        if self.game_object.white_player_socket_name == self.channel_name:
            self.game_object.white_player_socket_name = None
            self.game_object.save()
            return 'white'
        if self.game_object.black_player_socket_name == self.channel_name:
            self.game_object.black_player_socket_name = None
            self.game_object.save()
            return 'black'
        return None
