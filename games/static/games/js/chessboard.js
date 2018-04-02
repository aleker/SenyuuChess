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
var white_pieces = null;
var black_pieces = null;

document.addEventListener('DOMContentLoaded', function () {
    chessCanvas = document.getElementById("chess-canvas");
    ctx = chessCanvas.getContext("2d");
    if (!ctx) {
        alert("Canvas not supported!");
        return;
    }
    BLOCK_SIZE = chessCanvas.height / NUMBER_OF_ROWS;
    drawBoard();
    prepareImages();
    // draw();
    // chessCanvas.addEventListener('click', board_click, false);

}, false);

function prepareImages() {
    // Prepare white pieces
    white_pieces = new Image();
    white_pieces.src = DJANGO_IMAGE_URL + 'SenyuuChess_white.png';
    // white_pieces.width = chessCanvas.width;
    white_pieces.onload = function() {
        IMG_BLOCK_SIZE = white_pieces.width / NUMBER_OF_COLS;
    };

    // Prepare black pieces
    black_pieces = new Image();
    black_pieces.src = DJANGO_IMAGE_URL + 'SenyuuChess_black.png';
}

function draw(piecePositionsJson) {
    // ctx.clearRect(0, 0, chessCanvas.width, chessCanvas.height);
    drawTeamOfPieces(piecePositionsJson.white, false, true);
    drawTeamOfPieces(piecePositionsJson.black, true, true);
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
        color = (fieldNo % 2 ? BLOCK_COLOUR_BLACK : BLOCK_COLOUR_WHITE);
    else
        color = (fieldNo % 2 ? BLOCK_COLOUR_WHITE : BLOCK_COLOUR_BLACK);
    return color;
}

function drawTeamOfPieces(team, isBlackTeam, isHappy) {
    var pieceNo;
    for (pieceNo = 0; pieceNo < team.length; pieceNo++) {
        drawPiece(team[pieceNo], isBlackTeam, isHappy);
    }
}

function drawPiece(curPiece, isBlackTeam, isHappy) {
    var imageCoords = getImageCoords(curPiece.piece, isHappy);

    // Draw the piece onto the canvas
    // ctx.drawImage(white_pieces,
    //     imageCoords.x, imageCoords.y, BLOCK_SIZE, BLOCK_SIZE,
    //     curPiece.col * BLOCK_SIZE, curPiece.row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    // context.drawImage(
        // img,
        // x_gdzie zaczac_na_rysunku,
        // y_gdzie_zaczac_na_rysunku,
        // swidth_ile_z_szerokosci_obrazu,
        // sheight_ile_z_wysokosci_obrazu,
        // x_na_canvasie,
        // y_na_canvasie,
        // width_ile_ma_zajac_na_planszy,
        // height_ile_ma_zajac_na_planszy);
    if (isBlackTeam) {
        ctx.drawImage(black_pieces,
        imageCoords.x, imageCoords.y, IMG_BLOCK_SIZE, IMG_BLOCK_SIZE,
        curPiece.col * BLOCK_SIZE, curPiece.row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
    else {
        ctx.drawImage(white_pieces,
            imageCoords.x, imageCoords.y, IMG_BLOCK_SIZE, IMG_BLOCK_SIZE,
            curPiece.col * BLOCK_SIZE, curPiece.row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
}

function getImageCoords(pieceCode, isHappy) {
    return {
        "x": pieceCode * IMG_BLOCK_SIZE,
        "y": (isHappy ? 0 : IMG_BLOCK_SIZE)
    };
}

/*
* based on https://geeksretreat.wordpress.com/2012/06/01/html-5-canvas-chess-board/
*/