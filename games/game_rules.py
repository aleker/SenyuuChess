from games.models import Game
import json

WHITE_TEAM = 'white'
BLACK_TEAM = 'black'

IN_PLAY = 0
RIP = 1


def is_my_turn(game_pk, channel_name):
    game_object = Game.objects.get(pk=game_pk)
    pieces_positions = json.loads(game_object.piecesPositions)
    current_turn_color = pieces_positions["currentTurn"]
    if current_turn_color == "white":
        current_session_turn = game_object.white_player_socket_name
    else:
        current_session_turn = game_object.black_player_socket_name
    return channel_name == current_session_turn


def calculate_new_positions(game_pk, selected_piece, clicked_block, enemy_piece):
    # check if allowable move
    # if not check_if_allowable_move(selected_piece, clicked_block, enemy_piece):
    #     return False

    game_object = Game.objects.get(pk=game_pk)
    pieces_positions = json.loads(game_object.piecesPositions)

    team_color = pieces_positions["currentTurn"]
    opposite_color = BLACK_TEAM if team_color == WHITE_TEAM else WHITE_TEAM

    # remove enemy if any
    if enemy_piece is not None:
        pieces_positions[opposite_color][enemy_piece["id"]]["status"] = RIP

    # update selected_piece position
    pieces_positions[team_color][selected_piece["id"]]["col"] = clicked_block["col"]
    pieces_positions[team_color][selected_piece["id"]]["row"] = clicked_block["row"]

    # change turn
    pieces_positions["currentTurn"] = BLACK_TEAM if pieces_positions["currentTurn"] == WHITE_TEAM else WHITE_TEAM

    # SAVE
    game_object.piecesPositions = json.dumps(pieces_positions)
    game_object.save()

    # check if checkmate
    is_checkmate()
    return pieces_positions


def is_checkmate():
    # TODO!! checkmate
    pass


def check_if_allowable_move(selected_piece, clicked_block, enemy_piece):
    # TODO!! allowable move
    pass
