// STYLE
// board:
NUMBER_OF_ROWS = 8;
BLOCK_SIZE = null;
IMG_BLOCK_SIZE = null;
COLOUR_WHITE = 'white';
COLOUR_BLACK = 'black';

// pieces:
whiteImgName = 'SenyuuChess_white.png';
blackImgName = 'SenyuuChess_black.png';

// piece selection:
SELECT_LINE_WIDTH = '3px';
HIGHLIGHT_COLOUR = 'blue';

// PIECES
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
var currentPiecePositions = null;

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
    chessCanvas.addEventListener('click', board_click, false);

}, false);

/****************
* BOARD
*****************/

function drawBoard() {
    ctx.clearRect(0, 0, chessCanvas.width, chessCanvas.height);
    // Draw Rows
    for(var rowNo = 0; rowNo < NUMBER_OF_ROWS; rowNo++) {
        drawRow(rowNo);
    }

    // Draw chessboard border
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, NUMBER_OF_ROWS * BLOCK_SIZE, NUMBER_OF_ROWS * BLOCK_SIZE);
}

function drawRow(rowNo) {
    for(var fieldNo = 0; fieldNo < NUMBER_OF_ROWS; fieldNo++) {
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
        color = (fieldNo % 2 ? COLOUR_BLACK : COLOUR_WHITE);
    else
        color = (fieldNo % 2 ? COLOUR_WHITE : COLOUR_BLACK);
    return color;
}

/****************
* PIECES
*****************/

function prepareImages() {
    // Prepare white pieces
    white_pieces = new Image();
    white_pieces.src = DJANGO_IMAGE_URL + whiteImgName + '';
    // white_pieces.width = chessCanvas.width;
    white_pieces.onload = function() {
        IMG_BLOCK_SIZE = white_pieces.width / NUMBER_OF_ROWS;
    };

    // Prepare black pieces
    black_pieces = new Image();
    black_pieces.src = DJANGO_IMAGE_URL + blackImgName + '';
}

function drawPieces() {
    drawTeamOfPieces(currentPiecePositions.white, false, true);
    drawTeamOfPieces(currentPiecePositions.black, true, true);
}

function updateCurrentPiecesPositions(newPiecePositionsJson) {
    currentPiecePositions = newPiecePositionsJson;
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

/****************
* SELECT AND MOVE
*****************/

var selectedPiece = null;
var currentTurn = COLOUR_WHITE;

function board_click(ev) {
    var x, y;
    if (ev.pageX || ev.pageY) {
        x = ev.pageX;
        y = ev.pageY;
    }
    else {
        x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= chessCanvas.offsetLeft;
    y -= chessCanvas.offsetTop;

    var clickedBlock = canvasToBlockNo(x, y);

    if(selectedPiece == null) {
        checkIfPieceClicked(clickedBlock);
    }
    else {
        processMove(clickedBlock);
    }
}

function canvasToBlockNo(pos_x, pos_y) {
    var blockSize = (chessCanvas.clientWidth / NUMBER_OF_ROWS);
    var column = parseInt(pos_x / blockSize);
    var row = parseInt(pos_y / blockSize);
    return {'col': column, 'row': row}
}

function checkIfPieceClicked(clickedBlock) {
    var pieceAtBlock = getPieceAtBlock(clickedBlock, currentTurn);

    if (pieceAtBlock !== null) {
        selectPiece(pieceAtBlock);
    }
}

function getPieceAtBlock(clickedBlock, teamColor) {
    var pieceAtBlock = null;

    if (teamColor === false) {
        pieceAtBlock = getPieceAtBlock(clickedBlock, COLOUR_WHITE);
        if (pieceAtBlock === null)
            pieceAtBlock = getPieceAtBlock(clickedBlock, COLOUR_BLACK);
    }
    else {
        var team = (currentTurn === COLOUR_BLACK ?
        currentPiecePositions.black : currentPiecePositions.white);

        for (var iPieceCounter = 0; iPieceCounter < team.length; iPieceCounter++) {
            var curPiece = team[iPieceCounter];
            if (curPiece.status === IN_PLAY &&
                curPiece.col === clickedBlock.col &&
                curPiece.row === clickedBlock.row) {

                pieceAtBlock = curPiece;
                pieceAtBlock.color = teamColor;
                pieceAtBlock.id = iPieceCounter;
                break;
            }
        }
    }
    return pieceAtBlock;
}

function selectPiece(pieceAtBlock) {
    // Draw outline
    ctx.lineWidth = SELECT_LINE_WIDTH;
    ctx.strokeStyle = HIGHLIGHT_COLOUR;
    ctx.strokeRect((pieceAtBlock.col * BLOCK_SIZE) + SELECT_LINE_WIDTH,
        (pieceAtBlock.row * BLOCK_SIZE) + SELECT_LINE_WIDTH,
        BLOCK_SIZE - (SELECT_LINE_WIDTH * 2),
        BLOCK_SIZE - (SELECT_LINE_WIDTH * 2));

    selectedPiece = pieceAtBlock;
}

function deselectPiece() {
    // TODO
}


function processMove(clickedBlock) {
    var pieceAtBlock = getPieceAtBlock(clickedBlock, false);

    if (pieceAtBlock !== null) {
        if (isMyAlly(pieceAtBlock.color)) {
            changeSelectedPiece(pieceAtBlock);
            return;
        }
    }
    tryToMove(clickedBlock, pieceAtBlock);
}

function tryToMove(clickedBlock, enemyPiece) {
    if (canSelectedMoveToBlock(selectedPiece, clickedBlock, enemyPiece) === true) {
        movePiece(clickedBlock, enemyPiece);
    }
}

function isMyAlly(clickedPieceColor) {
    return (clickedPieceColor === currentTurn)
}

function changeSelectedPiece(newPieceToSelect) {
    deselectPiece();
    selectPiece(newPieceToSelect)
}

function canSelectedMoveToBlock(selectedPiece, clickedBlock, enemyPiece)
{
    var bCanMove = false;

    switch (selectedPiece.piece)
    {
        case PIECE_PAWN:
            // TODO
        break;

        case PIECE_CASTLE_1 || PIECE_CASTLE_2:

            // TODO

        break;

        case PIECE_ROUKE:

            // TODO

        break;

        case PIECE_BISHOP_1 || PIECE_BISHOP_2:

            // TODO

        break;

        case PIECE_QUEEN:

            // TODO

        break;

        case PIECE_KING:

            // TODO

        break;
    }

    bCanMove = true;
    return bCanMove;
}

function movePiece(clickedBlock, enemyPiece) {
    // Clear the block in the original position
    drawField(selectedPiece.col, selectedPiece.row);

    var teamColor = (currentTurn === COLOUR_WHITE ? 'white' : 'black');
    var oppositeColor = (currentTurn !== COLOUR_WHITE ? 'white' : 'black');

    // REMOVE ENEMY
    if (enemyPiece !== null) {
        // Clear beaten piece
        drawField(enemyPiece.col, enemyPiece.row);
        currentPiecePositions[oppositeColor][enemyPiece.id].status = RIP;
    }

    // DRAW PIECE IN NEW POSITION
    currentPiecePositions[teamColor][selectedPiece.id].col = clickedBlock.col;
    currentPiecePositions[teamColor][selectedPiece.id].row = clickedBlock.row;
    drawPiece(selectedPiece, (currentTurn === COLOUR_BLACK));

    // CLEAR TURN AND SELECTED PIECE
    currentTurn = (currentTurn === COLOUR_WHITE ? COLOUR_BLACK : COLOUR_WHITE);
    selectedPiece = null;
}


/*
* based on https://geeksretreat.wordpress.com/2012/06/01/html-5-canvas-chess-board/
*/