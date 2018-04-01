NUMBER_OF_ROWS = 8;
NUMBER_OF_COLS = 8;
BLOCK_SIZE = null;
IMG_BLOCK_SIZE = null;

BLOCK_COLOUR_WHITE = 'white';
BLOCK_COLOUR_BLACK = 'black';

PIECE_PAWN = 0;
PIECE_CASTLE_1 = 1;
PIECE_CASTLE_2 = 2;
PIECE_ROUKE = 3;
PIECE_BISHOP_1 = 4;
PIECE_BISHOP_2 = 5;
PIECE_QUEEN = 6;
PIECE_KING = 7;

IN_PLAY = 0;
RIP = 1;

var chessCanvas = null;
var ctx = null;

document.addEventListener('DOMContentLoaded', function () {
    chessCanvas = document.getElementById("chess-canvas");
    ctx = chessCanvas.getContext("2d");
    if (!ctx) {
        alert("Canvas not supported!");
        return;
    }
    BLOCK_SIZE = chessCanvas.height / NUMBER_OF_ROWS;
    drawBoard();
    // draw();

}, false);
var white_pieces = null;
function draw(piecePositionsJson) {
    // drawBoard();
    // var chessPositions = getPiecePositions();

    // Draw white pieces
    white_pieces = new Image();
    // var path = '../../../static/games/img/SenyuuChess_white.png';
    var path = DJANGO_IMAGE_URL + 'SenyuuChess_white.png';
    white_pieces.src = path;
    // white_pieces.width = chessCanvas.width;
    white_pieces.onload = function() {
        // IMG_BLOCK_SIZE = white_pieces.width / NUMBER_OF_COLS;
        drawTeamOfPieces(piecePositionsJson.white, false);
    };

    // Draw black pieces
    // var black_pieces = new Image();
    // var path = DJANGO_STATIC_URL + '/img/SenyuuChess_black.png';
    // black_pieces.src = path;
    // black_pieces.onload = function() {
    //     drawTeamOfPieces(piecePositionsJson.black, true);
    // };

    // chessCanvas.addEventListener('click', board_click, false);
}

function drawBoard() {
    // Draw Rows
    for(var rowNo = 0; rowNo < NUMBER_OF_ROWS; rowNo++) {
        drawRow(rowNo);
    }

    // Draw chessboard border
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, NUMBER_OF_ROWS * BLOCK_SIZE, NUMBER_OF_COLS * BLOCK_SIZE);
}

function drawRow(rowNo) {
    for(var fieldNo = 0; fieldNo < NUMBER_OF_COLS; fieldNo++) {
        drawField(rowNo, fieldNo);
    }
}

function drawField(rowNo, fieldNo) {
    ctx.fillStyle = getBlockColour(rowNo, fieldNo);
    ctx.fillRect(rowNo * BLOCK_SIZE, fieldNo * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.stroke();
}

function getBlockColour(rowNo, fieldNo) {
    var color;
    if (rowNo % 2)
        color = (fieldNo % 2 ? BLOCK_COLOUR_WHITE : BLOCK_COLOUR_BLACK);
    else
        color = (fieldNo % 2 ? BLOCK_COLOUR_BLACK : BLOCK_COLOUR_WHITE);
    return color;
}

function drawTeamOfPieces(team, isBlackTeam) {
    var pieceNo;
    for (pieceNo = 0; pieceNo < team.length; pieceNo++) {
        drawPiece(team[pieceNo], isBlackTeam);
    }
}

function drawPiece(curPiece, isBlackTeam) {
    var imageCoords = getImageCoords(curPiece.piece, isBlackTeam);

    // Draw the piece onto the canvas
    // ctx.drawImage(white_pieces,
    //     imageCoords.x, imageCoords.y, BLOCK_SIZE, BLOCK_SIZE,
    //     curPiece.col * BLOCK_SIZE, curPiece.row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.drawImage(white_pieces,
        imageCoords.x, imageCoords.y, BLOCK_SIZE, BLOCK_SIZE,
        curPiece.col * BLOCK_SIZE, curPiece.row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    // TODO if black draw in reverse order

}

function getImageCoords(pieceCode, isBlackTeam) {
    return {
        "x": pieceCode * BLOCK_SIZE,
        "y": (isBlackTeam ? 0 : BLOCK_SIZE)
    };
}

/*
* based on https://geeksretreat.wordpress.com/2012/06/01/html-5-canvas-chess-board/
*/