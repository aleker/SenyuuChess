from games.models import Game, PIECE
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
    if check_if_allowable_move(game_pk, selected_piece, clicked_block, enemy_piece) is False:
        return False

    game_object = Game.objects.get(pk=game_pk)
    pieces_positions = json.loads(game_object.piecesPositions)

    team_color = pieces_positions["currentTurn"]
    opposite_color = BLACK_TEAM if team_color == WHITE_TEAM else WHITE_TEAM

    # remove enemy if any
    if not is_none(enemy_piece):
        pieces_positions[opposite_color][enemy_piece["id"]]["status"] = RIP

    # update selected_piece position
    pieces_positions[team_color][selected_piece["id"]]["col"] = clicked_block["col"]
    pieces_positions[team_color][selected_piece["id"]]["row"] = clicked_block["row"]

    check = is_check(game_pk, pieces_positions[team_color][selected_piece["id"]])

    # change turn
    pieces_positions["currentTurn"] = BLACK_TEAM if pieces_positions["currentTurn"] == WHITE_TEAM else WHITE_TEAM

    # SAVE
    game_object.piecesPositions = json.dumps(pieces_positions)
    game_object.save()

    # check if checkmate
    is_checkmate()
    return pieces_positions, check


def is_checkmate():
    # TODO!! checkmate
    pass


def is_check(game_pk, selected_piece_on_new_position):
    opponents_color = WHITE_TEAM if selected_piece_on_new_position["color"] == BLACK_TEAM else BLACK_TEAM
    opponents_king = find_piece(game_pk, opponents_color, PIECE.KING.value)
    if check_if_allowable_move(game_pk, selected_piece_on_new_position, opponents_king, opponents_king):
        return opponents_color
    return None


def check_if_allowable_move(game_pk, selected_piece, clicked_block, enemy_piece):
    available_move = True
    piece_type = selected_piece["piece"]
    if piece_type is PIECE.PAWN.value:
        available_move = check_pawn(selected_piece, clicked_block, enemy_piece)
    elif (piece_type is PIECE.CASTLE_1.value) or (piece_type is PIECE.CASTLE_2.value):
        available_move = check_castle(game_pk, selected_piece, clicked_block)
    elif piece_type is PIECE.ROUKE.value:
        available_move = check_rouke(selected_piece, clicked_block)
    elif (piece_type is PIECE.BISHOP_1.value) or (piece_type is PIECE.BISHOP_2.value):
        available_move = check_bishop(game_pk, selected_piece, clicked_block)
    elif piece_type is PIECE.QUEEN.value:
        available_move = check_queen(game_pk, selected_piece, clicked_block)
    elif piece_type is PIECE.KING.value:
        available_move = check_king(selected_piece, clicked_block)

    return available_move


def check_pawn(selected_piece, clicked_block, enemy_piece):
    turn_to_go = get_turn_to_go(selected_piece)
    # 1) can go 2 fields ahead
    if is_black_team(selected_piece) and is_in_col(selected_piece, 1):
        if is_in_col(clicked_block, 2) or is_in_col(clicked_block, 3):
            if is_in_row(clicked_block, selected_piece["row"]):
                if is_none(enemy_piece):
                    return True
    if not is_black_team(selected_piece) and is_in_col(selected_piece, 6):
        if is_in_col(clicked_block, 5) or is_in_col(clicked_block, 4):
            if is_in_row(clicked_block, selected_piece["row"]):
                if is_none(enemy_piece):
                    return True
    # 2) can go 1 field ahead
    if is_the_same_field(clicked_block, {"row": selected_piece["row"], "col": selected_piece["col"] + turn_to_go}):
        if is_none(enemy_piece):
            return True
    # 3) can beat diagonally
    if is_the_same_field(clicked_block, {"row": selected_piece["row"] + 1, "col": selected_piece["col"] + turn_to_go}):
        if not is_none(enemy_piece):
            return True
    if is_the_same_field(clicked_block, {"row": selected_piece["row"] - 1, "col": selected_piece["col"] + turn_to_go}):
        if not is_none(enemy_piece):
            return True
    return False


def check_castle(game_pk, selected_piece, clicked_block):
    # 1) Move |
    if is_in_col(selected_piece, clicked_block["col"]):
        between = get_all_field_coords_between(selected_piece["row"], clicked_block["row"])
        for field_row in between:
            if check_if_any_piece_on_field(game_pk, {"row": field_row, "col": clicked_block["col"]}):
                return False
        return True
    # 2) Move __
    if is_in_row(selected_piece, clicked_block["row"]):
        between = get_all_field_coords_between(selected_piece["col"], clicked_block["col"])
        for field_col in between:
            if check_if_any_piece_on_field(game_pk, {"col": field_col, "row": clicked_block["row"]}):
                return False
        return True
    return False


def check_rouke(selected_piece, clicked_block):
    col_difference = abs(selected_piece["col"] - clicked_block["col"])
    row_difference = abs(selected_piece["row"] - clicked_block["row"])
    if col_difference == 2 and row_difference == 1:
        return True
    if col_difference == 1 and row_difference == 2:
        return True
    return False


def check_bishop(game_pk, selected_piece, clicked_block):
    col_difference = abs(selected_piece["col"] - clicked_block["col"])
    row_difference = abs(selected_piece["row"] - clicked_block["row"])
    if col_difference == row_difference:
        between = get_all_field_between(selected_piece, clicked_block)
        for field in between:
            if check_if_any_piece_on_field(game_pk, field):
                return False
        return True
    return False


def check_queen(game_pk, selected_piece, clicked_block):
    result = check_castle(game_pk, selected_piece, clicked_block)
    if not result:
        return check_bishop(game_pk, selected_piece, clicked_block)


def check_king(selected_piece, clicked_block):
    col_difference = abs(selected_piece["col"] - clicked_block["col"])
    row_difference = abs(selected_piece["row"] - clicked_block["row"])
    if col_difference <= 1 and row_difference <= 1:
        return True
    return False


def is_the_same_field(field_a, field_b):
    if field_a["col"] is field_b["col"] and field_a["row"] == field_b["row"]:
        return True
    return False


def is_enemy_on_field(enemy, field):
    if enemy is None:
        return False
    return is_the_same_field(enemy, field)


def check_if_any_piece_on_field(game_pk, field):
    game_object = Game.objects.get(pk=game_pk)
    pieces_positions = json.loads(game_object.piecesPositions)
    colors = ["white", "black"]
    for color in colors:
        for piece in pieces_positions[color]:
            if is_the_same_field(piece, field):
                return True
    return False


def is_black_team(piece):
    return piece["color"] == BLACK_TEAM


def is_in_row(piece, row_no):
    return piece["row"] is row_no


def is_in_col(piece, col_no):
    return piece["col"] is col_no


def is_none(structure):
    if structure is None:
        return True
    return False


def get_turn_to_go(piece):
    return 1 if piece["color"] == BLACK_TEAM else -1


def get_all_field_coords_between(col_1, col_2):
    if col_1 < col_2:
        return list(range(col_1 + 1, col_2))
    elif col_1 > col_2:
        return list(range(col_2 + 1, col_1))
    return []


def get_all_field_between(field_1, field_2):
    difference = abs(field_1["row"] - field_2["row"])
    if difference <= 1:
        return []
    area_chart_data = []
    if field_1["col"] < field_2["col"]:
        if field_1["row"] < field_2["row"]:
            col_list = list(range(field_1["col"] + 1, field_2["col"]))
            row_list = list(range(field_1["row"] + 1, field_2["row"]))
            for col, row in zip(col_list, row_list):
                area_chart_data.append({"col": col, "row": row})
            return area_chart_data
        if field_1["row"] > field_2["row"]:
            col_list = list(range(field_1["col"] + 1, field_2["col"]))
            row_list = list(range(field_2["row"] + 1, field_1["row"]))
            for col, row in zip(col_list, reversed(row_list)):
                area_chart_data.append({"col": col, "row": row})
            return area_chart_data
    if field_1["col"] > field_2["col"]:
        if field_1["row"] < field_2["row"]:
            col_list = list(range(field_2["col"] + 1, field_1["col"]))
            row_list = list(range(field_1["row"] + 1, field_2["row"]))
            for col, row in zip(col_list, reversed(row_list)):
                area_chart_data.append({"col": col, "row": row})
            return area_chart_data
        if field_1["row"] > field_2["row"]:
            col_list = list(range(field_2["col"] + 1, field_1["col"]))
            row_list = list(range(field_2["row"] + 1, field_1["row"]))
            for col, row in zip(col_list, row_list):
                area_chart_data.append({"col": col, "row": row})
            return area_chart_data
    return []


def find_piece(game_pk, color, piece_type):
    game_object = Game.objects.get(pk=game_pk)
    pieces_positions = json.loads(game_object.piecesPositions)
    for piece in pieces_positions[color]:
        if piece["piece"] == piece_type:
            return piece
    return None
