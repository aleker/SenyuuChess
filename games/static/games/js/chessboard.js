NUMBER_OF_ROWS = 8;
NUMBER_OF_COLS = 8;
BLOCK_SIZE = null;

BLOCK_COLOUR_WHITE = 'white';
BLOCK_COLOUR_BLACK = 'black';

PIECE_PAWN = 0;
PIECE_CASTLE = 1;
PIECE_ROUKE = 2;
PIECE_BISHOP = 3;
PIECE_QUEEN = 4;
PIECE_KING = 5;

IN_PLAY = 0;
RIP = 1;

var chessCanvas = null;
var ctx = null;
var defaultChessPositions = null;


document.addEventListener('DOMContentLoaded', function () {
    chessCanvas = document.getElementById("chess-canvas");
    ctx = chessCanvas.getContext("2d");
    if (!ctx) {
        alert("Canvas not supported!");
        return;
    }
    BLOCK_SIZE = chessCanvas.height / NUMBER_OF_ROWS;
    draw();

}, false);

function draw() {
    drawBoard();

    defaultChessPositions = defaultPositions();

    // Draw pieces
    // var pieces = new Image();
    // pieces.src = 'sciagi/circle.png';
    // pieces.onload = drawPieces;
    //
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

function defaultPositions() {
    var json = {
        "white": [
            {
                "piece": PIECE_CASTLE,
                "row": 0,
                "col": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_ROUKE,
                "row": 0,
                "col": 1,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_BISHOP,
                "row": 0,
                "col": 2,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_KING,
                "row": 0,
                "col": 3,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_QUEEN,
                "row": 0,
                "col": 4,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_BISHOP,
                "row": 0,
                "col": 5,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_ROUKE,
                "row": 0,
                "col": 6,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CASTLE,
                "row": 0,
                "col": 7,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 1,
                "col": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 1,
                "col": 1,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 1,
                "col": 2,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 1,
                "col": 3,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 1,
                "col": 4,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 1,
                "col": 5,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 1,
                "col": 6,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 1,
                "col": 7,
                "status": IN_PLAY
            }
        ],
        "black": [
            {
                "piece": PIECE_CASTLE,
                "row": 7,
                "col": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_ROUKE,
                "row": 7,
                "col": 1,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_BISHOP,
                "row": 7,
                "col": 2,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_KING,
                "row": 7,
                "col": 3,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_QUEEN,
                "row": 7,
                "col": 4,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_BISHOP,
                "row": 7,
                "col": 5,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_ROUKE,
                "row": 7,
                "col": 6,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_CASTLE,
                "row": 7,
                "col": 7,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 6,
                "col": 0,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 6,
                "col": 1,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 6,
                "col": 2,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 6,
                "col": 3,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 6,
                "col": 4,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 6,
                "col": 5,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 6,
                "col": 6,
                "status": IN_PLAY
            },
            {
                "piece": PIECE_PAWN,
                "row": 6,
                "col": 7,
                "status": IN_PLAY
            }
        ]
    };
    return json;
}

/*
* based on https://geeksretreat.wordpress.com/2012/06/01/html-5-canvas-chess-board/
*/