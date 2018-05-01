// STYLE
// board:
NUMBER_OF_ROWS = 8;
COLOUR_WHITE = '#ffffff';
COLOUR_BLACK = '#000000';

// pieces:
whiteImgName = 'SenyuuChess_white.png';
blackImgName = 'SenyuuChess_black.png';

// piece selection:
SELECT_LINE_WIDTH = 3;
HIGHLIGHT_COLOUR = '#31add3';

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

let setOfPieces = null;
let chessboard = null;
let gameSocket = null;

document.addEventListener('DOMContentLoaded', function () {
    chessboard = new Chessboard(document.getElementById("chess-canvas"), document.getElementById("select-canvas"));
    setOfPieces = new SetOfPieces();
    setOfPieces.white_pieces.onload = function () {
        setOfPieces.IMG_BLOCK_SIZE = setOfPieces.white_pieces.width / NUMBER_OF_ROWS;
        gameSocket = new WebSocket('ws://' + window.location.host + '/ws/games/' + PK_GAME);
        setSocket();
    };
    chessboard.draw();

    chessboard.selectCanvas.addEventListener('click', function (ev) {
        let clickCoordinates = computeClickCoordinates(ev);
        let clickedField = chessboard.findField(clickCoordinates.x, clickCoordinates.y);

        if (setOfPieces.selectedPiece == null)
            processSelection(clickedField);
        else
            processMove(clickedField);
    }, false);

}, false);

/****************
* GAMESOCKET
*****************/
function setSocket() {
    gameSocket.onopen = function (e) {
        gameSocket.send(JSON.stringify({
            'type': "onOpen"
        }));
        console.log("SOCKET CONNECTION.");
    };

    gameSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const type = data['type'];
        switch(type) {
            case 'startPositions':
                console.log("Received positions.");
                setOfPieces.updateCurrentPiecesPositions(data['positions']);
                setOfPieces.drawPieces();
                break;
            case 'positions_update':
                let positions = data['message'];
                break;
            default:
                console.log("Strange message from server!");
        }
    };

    gameSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };
}

function computeClickCoordinates(ev) {
    let x, y;
    if (ev.pageX || ev.pageY) {
        x = ev.pageX;
        y = ev.pageY;
    }
    else {
        x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= chessboard.chessCanvas.offsetLeft;
    y -= chessboard.chessCanvas.offsetTop;
    return {"x": x, "y": y};
}

function processSelection(clickedField) {
    const clickedPiece = setOfPieces.checkIfPieceClicked(clickedField);
    if (clickedPiece !== false) {
        chessboard.selectField(clickedPiece);
    }
}

function processMove(clickedBlock) {
    let pieceAtBlock = setOfPieces.getPieceAtBlock(clickedBlock, false);

    if (pieceAtBlock !== null) {
        if (setOfPieces.isMyAlly(pieceAtBlock.color)) {
            console.log("my ally");
            chessboard.changeSelectedPiece(pieceAtBlock);
            return;
        }
    }
    tryToMove(clickedBlock, pieceAtBlock);
}

function tryToMove(clickedBlock, enemyPiece) {
    if (SetOfPieces.isMovePermitted(setOfPieces.selectedPiece, clickedBlock, enemyPiece) === true) {
        movePiece(clickedBlock, enemyPiece);
    }
}

function movePiece(clickedBlock, enemyPiece) {
    // Clear the block in the original position
    chessboard.drawField(setOfPieces.selectedPiece.col, setOfPieces.selectedPiece.row);

    let teamColor = setOfPieces.currentTurn;
    let oppositeColor = (setOfPieces.currentTurn !== COLOUR_WHITE ? COLOUR_WHITE : COLOUR_BLACK);

    // REMOVE ENEMY
    if (enemyPiece !== null) {
        // Clear beaten piece
        chessboard.drawField(enemyPiece.col, enemyPiece.row);
        setOfPieces.currentPiecePositions[oppositeColor][enemyPiece.id].status = RIP;
    }

    // DRAW PIECE IN NEW POSITION
    setOfPieces.currentPiecePositions[teamColor][setOfPieces.selectedPiece.id].col = clickedBlock.col;
    setOfPieces.currentPiecePositions[teamColor][setOfPieces.selectedPiece.id].row = clickedBlock.row;
    setOfPieces.drawPiece(setOfPieces.selectedPiece, (setOfPieces.currentTurn === COLOUR_BLACK), true);
    chessboard.deselectField();

    // CLEAR TURN AND SELECTED PIECE
    setOfPieces.currentTurn = (setOfPieces.currentTurn === COLOUR_WHITE ? COLOUR_BLACK : COLOUR_WHITE);
}

/****************
* CHESSBOARD
*****************/

class Chessboard {
    constructor(chessCanvas, selectCanvas) {
        this.chessCanvas = chessCanvas;
        this.ctx = this.chessCanvas.getContext("2d");
        this.selectCanvas = selectCanvas;
        this.ctxSel = this.selectCanvas.getContext("2d");
        this.BLOCK_SIZE = chessCanvas.height / NUMBER_OF_ROWS;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.chessCanvas.width, this.chessCanvas.height);
        // Draw Rows
        for(let rowNo = 0; rowNo < NUMBER_OF_ROWS; rowNo++) {
            this.drawRow(rowNo);
        }
        // Draw chessboard border
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, NUMBER_OF_ROWS * this.BLOCK_SIZE, NUMBER_OF_ROWS * this.BLOCK_SIZE);
    };

    drawRow(rowNo) {
        for(let fieldNo = 0; fieldNo < NUMBER_OF_ROWS; fieldNo++) {
            this.drawField(rowNo, fieldNo);
        }
    };

    drawField(rowNo, fieldNo) {
        this.ctx.fillStyle = Chessboard.getBlockColour(rowNo, fieldNo);
        this.ctx.fillRect(rowNo * this.BLOCK_SIZE, fieldNo * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        this.ctx.stroke();
    };

    static getBlockColour(rowNo, fieldNo) {
        let color;
        if (rowNo % 2)
            color = (fieldNo % 2 ? COLOUR_BLACK : COLOUR_WHITE);
        else
            color = (fieldNo % 2 ? COLOUR_WHITE : COLOUR_BLACK);
        return color;
    };

    findField(pos_x, pos_y) {
        let blockSize = (this.chessCanvas.clientWidth / NUMBER_OF_ROWS);
        let column = parseInt(pos_x / blockSize);
        let row = parseInt(pos_y / blockSize);
        return {'col': column, 'row': row}
    }

    selectField(pieceAtBlock) {
        setOfPieces.selectedPiece = pieceAtBlock;
        // Draw outline
        this.ctxSel.lineWidth = SELECT_LINE_WIDTH;
        this.ctxSel.strokeStyle = HIGHLIGHT_COLOUR;
        this.ctxSel.strokeRect((pieceAtBlock.col * this.BLOCK_SIZE) + SELECT_LINE_WIDTH,
            (pieceAtBlock.row * this.BLOCK_SIZE) + SELECT_LINE_WIDTH,
            this.BLOCK_SIZE - (SELECT_LINE_WIDTH * 2),
            this.BLOCK_SIZE - (SELECT_LINE_WIDTH * 2));
    }

    deselectField() {
        setOfPieces.selectedPiece = null;
        this.ctxSel.clearRect(0, 0, this.selectCanvas.width, this.selectCanvas.height);
    }

    changeSelectedPiece(newPieceToSelect) {
        this.deselectField();
        this.selectField(newPieceToSelect);
    }
}

/****************
* PIECES
*****************/

class SetOfPieces {
    constructor() {
        // white pieces
        let white_pieces = new Image();
        white_pieces.src = DJANGO_IMAGE_URL + whiteImgName + '';
        this.white_pieces = white_pieces;
        // black pieces
        let black_pieces = new Image();
        black_pieces.src = DJANGO_IMAGE_URL + blackImgName + '';
        this.black_pieces = black_pieces;

        this.IMG_BLOCK_SIZE = 70;
        this.currentPiecePositions = null;
        this.selectedPiece = null;
        this.currentTurn = COLOUR_WHITE;
    };

    updateCurrentPiecesPositions(newPiecePositionsJson) {
        this.currentPiecePositions = newPiecePositionsJson;
    };

    drawPieces() {
        this.drawTeamOfPieces(this.currentPiecePositions.white, false, true);
        this.drawTeamOfPieces(this.currentPiecePositions.black, true, true);
    };

    drawTeamOfPieces(team, isBlackTeam, isHappy) {
        for (let pieceNo = 0; pieceNo < team.length; pieceNo++) {
            this.drawPiece(team[pieceNo], isBlackTeam, isHappy);
        }
    }

    drawPiece(curPiece, isBlackTeam, isHappy) {
        let imageCoords = this.getImageCoords(curPiece.piece, isHappy);
        if (isBlackTeam) {
            chessboard.ctx.drawImage(this.black_pieces,
                imageCoords.x, imageCoords.y, this.IMG_BLOCK_SIZE, this.IMG_BLOCK_SIZE,
                curPiece.col * chessboard.BLOCK_SIZE, curPiece.row * chessboard.BLOCK_SIZE,
                chessboard.BLOCK_SIZE, chessboard.BLOCK_SIZE);
        }
        else {
            chessboard.ctx.drawImage(this.white_pieces,
                imageCoords.x, imageCoords.y, this.IMG_BLOCK_SIZE, this.IMG_BLOCK_SIZE,
                curPiece.col * chessboard.BLOCK_SIZE, curPiece.row * chessboard.BLOCK_SIZE,
                chessboard.BLOCK_SIZE, chessboard.BLOCK_SIZE);
        }
    };

    getImageCoords(pieceCode, isHappy) {
        return {
            "x": pieceCode * this.IMG_BLOCK_SIZE,
            "y": (isHappy ? 0 : this.IMG_BLOCK_SIZE)
        };
    };

    /****************
    * SELECT AND MOVE
    *****************/

    checkIfPieceClicked(clickedField) {
        let pieceOnField = this.getPieceAtBlock(clickedField, this.currentTurn);
        if (pieceOnField !== null) return pieceOnField;
        else return false;
    };

    getPieceAtBlock(clickedBlock, teamColor) {
        let pieceAtBlock = null;

        if (teamColor === false) {
            pieceAtBlock = this.getPieceAtBlock(clickedBlock, COLOUR_WHITE);
            if (pieceAtBlock === null)
                pieceAtBlock = this.getPieceAtBlock(clickedBlock, COLOUR_BLACK);
        }
        else {
            let team = (teamColor === COLOUR_BLACK ?
            this.currentPiecePositions.black : this.currentPiecePositions.white);

            for (let iPieceCounter = 0; iPieceCounter < team.length; iPieceCounter++) {
                let curPiece = team[iPieceCounter];
                if (curPiece.status === IN_PLAY &&
                    curPiece.col === clickedBlock.col &&
                    curPiece.row === clickedBlock.row) {

                    pieceAtBlock = curPiece;
                    pieceAtBlock.id = iPieceCounter;
                    break;
                }
            }
        }
        return pieceAtBlock;
    };

    isMyAlly(clickedPieceColor) {
        return (clickedPieceColor === this.currentTurn)
    };

    static isMovePermitted(selectedPiece, clickedBlock, enemyPiece) {
        let bCanMove = false;

        switch (selectedPiece.piece) {
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
}


/*
* based on https://geeksretreat.wordpress.com/2012/06/01/html-5-canvas-chess-board/
*/