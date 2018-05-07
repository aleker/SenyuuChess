// STYLE
// board:
NUMBER_OF_ROWS = 8;
WHITE_COLOR = '#ffffff';
BLACK_COLOR = '#000000';

// pieces:
whiteImgName = 'SenyuuChess_white.png';
blackImgName = 'SenyuuChess_black.png';
WHITE_TEAM = 'white';
BLACK_TEAM = 'black';

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

// players
let spotStateEnum = {"free":0, "occupied":1, "me":2};
Object.freeze(spotStateEnum);
let spotsList = {"white": spotStateEnum.free, "black": spotStateEnum.free};

/****************
* MAIN
*****************/

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
        if (!isAuthorizedToMove()) return;
        let clickCoordinates = computeClickCoordinates(ev);
        let clickedField = chessboard.findField(clickCoordinates.x, clickCoordinates.y);

        if (setOfPieces.selectedPiece == null)
            setOfPieces.processSelection(clickedField);
        else
            setOfPieces.processMove(clickedField);
    }, false);

}, false);

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
            color = (fieldNo % 2 ? BLACK_COLOR : WHITE_COLOR);
        else
            color = (fieldNo % 2 ? WHITE_COLOR : BLACK_COLOR);
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

    deselect() {
        setOfPieces.selectedPiece = null;
        this.ctxSel.clearRect(0, 0, this.selectCanvas.width, this.selectCanvas.height);
    }

    changeSelectedPiece(newPieceToSelect) {
        this.deselect();
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
    };

    updateCurrentPiecesPositions(newPiecePositionsJson) {
        this.currentPiecePositions = newPiecePositionsJson;
        changePlayersTurnClass(this.currentPiecePositions.currentTurn);
    };

    drawPieces() {
        this.drawTeamOfPieces(this.currentPiecePositions.white, false, true);
        this.drawTeamOfPieces(this.currentPiecePositions.black, true, true);
    };

    drawTeamOfPieces(team, isBlackTeam, isHappy) {
        for (let pieceNo = 0; pieceNo < team.length; pieceNo++) {
            if (team[pieceNo].status === RIP) continue;
            this.drawPiece(team[pieceNo], isBlackTeam, isHappy);
        }
    }

    drawPiece(curPiece, isBlackTeam, isHappy) {
        let imageCoords = this.getImageCoords(SetOfPieces.getPieceNo(curPiece, isBlackTeam), isHappy);
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

    static getPieceNo(pieceCode, isBlackTeam) {
        return (isBlackTeam === true) ? (7 - pieceCode.piece) : pieceCode.piece;
    }
    /****************
    * SELECT AND MOVE
    *****************/

    checkIfPieceClicked(clickedField) {
        let pieceOnField = this.getPieceAtBlock(clickedField, this.currentPiecePositions.currentTurn);
        if (pieceOnField !== null) return pieceOnField;
        else return false;
    };

    getPieceAtBlock(clickedBlock, teamColor) {
        let pieceAtBlock = null;

        if (teamColor === false) {
            pieceAtBlock = this.getPieceAtBlock(clickedBlock, WHITE_TEAM);
            if (pieceAtBlock === null)
                pieceAtBlock = this.getPieceAtBlock(clickedBlock, BLACK_TEAM);
        }
        else {
            let team = (teamColor === BLACK_TEAM ?
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
        return (clickedPieceColor === this.currentPiecePositions.currentTurn)
    };

    processSelection(clickedField) {
        const clickedPiece = this.checkIfPieceClicked(clickedField);
        if (clickedPiece !== false) {
            chessboard.selectField(clickedPiece);
            setOfPieces.displayPermittedMoves(clickedPiece)
        }
    }

    processMove(clickedBlock) {
        let pieceAtBlock = this.getPieceAtBlock(clickedBlock, false);

        if (pieceAtBlock !== null) {
            if (this.isMyAlly(pieceAtBlock.color)) {
                console.log("my ally");
                chessboard.changeSelectedPiece(pieceAtBlock);
                return;
            }
        }
        SetOfPieces.tryToMove(clickedBlock, pieceAtBlock);
    }

    static tryToMove(clickedBlock, enemyPiece) {
        let selected_piece = JSON.parse(JSON.stringify(setOfPieces.selectedPiece));
        sendMessage({
            'type': 'new_move',
            'selectedPiece': selected_piece,
            'clickedBlock': clickedBlock,
            'enemyPiece': enemyPiece,
        });
    }

    updatePiecePositions(updated_positions) {
        const currentColor = this.currentPiecePositions["currentTurn"];
        const enemyColor = currentColor === WHITE_TEAM ? BLACK_TEAM : WHITE_TEAM;
        const colors = [enemyColor, currentColor];
        for (let colorId in colors) {
            for (let i = 0; i < updated_positions[colors[colorId]].length; i++){
                let newVer = updated_positions[colors[colorId]][i];
                let oldVer = this.currentPiecePositions[colors[colorId]][i];
                if (newVer.status !== oldVer.status) {
                    // CLEAR BEATEN PIECE
                    chessboard.drawField(oldVer.col, oldVer.row);
                    // TODO add sound :D
                }
                if (((newVer.col !== oldVer.col) || (newVer.row !== oldVer.row)) && newVer.status === IN_PLAY) {
                    // DRAW PIECE IN NEW POSITION
                    chessboard.drawField(oldVer.col, oldVer.row);
                    this.drawPiece(newVer, (this.currentPiecePositions["currentTurn"] === BLACK_TEAM), true);
                }
            }
        }

        // CLEAR SELECTED PIECE AND CHANGE TURN
        this.currentPiecePositions = updated_positions;
        chessboard.deselect();
        changeTurnClass();
    }

    displayPermittedMoves(selectedPiece) {
        // TODO displayPermittedMoves
        let bCanMove = false;

        switch (SetOfPieces.getPieceNo(selectedPiece, colorOfSelectedPiece)) {
            case PIECE_PAWN:
            break;

            case PIECE_CASTLE_1 || PIECE_CASTLE_2:
            break;

            case PIECE_ROUKE:
            break;

            case PIECE_BISHOP_1 || PIECE_BISHOP_2:
            break;

            case PIECE_QUEEN:
            break;

            case PIECE_KING:
            break;
        }

        bCanMove = true;
        return bCanMove;
    }
}

/****************
* GAMESOCKET
*****************/

function isAuthorizedToMove() {
    let currentTurn = setOfPieces.currentPiecePositions.currentTurn;
    return (spotsList[currentTurn] === spotStateEnum.me);
}

function changeSpotStatus(color, value) {
    if (spotsList[color] === spotStateEnum.me) {
        if (value === 0) throw "Not complete info!";
    }
    else {
        spotsList[color] = value;
    }
    updateNoPlayerClasses();
}

function printSpotStatus() {
    console.log("SpotStatus: white=" + spotsList[WHITE_TEAM] + ", black=" + spotsList[BLACK_TEAM]);
}

function updateNoPlayerClasses() {
    jQuery.each(spotsList, function(key, val) {
        if (val === spotStateEnum.free) setNoPlayerClass(key, true);
        else setNoPlayerClass(key, false);
        if (val === spotStateEnum.me) document.getElementById(key + '-player').textContent = key + ' player (YOU)';
        else document.getElementById(key + '-player').textContent = key + ' player';
    });
}

function changeTurnClass() {
    changePlayersTurnClass(setOfPieces.currentPiecePositions["currentTurn"]);
}

function setNoPlayerClass(playerColor, choice) {
    if (choice === true)
        document.getElementById(playerColor + '-player').classList.add('noPlayer');
    else
        document.getElementById(playerColor + '-player').classList.remove('noPlayer');
}

function changePlayersTurnClass(playerColor) {
    document.getElementById(playerColor + '-player').classList.add('playersTurn');
    let enemyColor = (playerColor === WHITE_TEAM ? BLACK_TEAM : WHITE_TEAM);
    document.getElementById(enemyColor + '-player').classList.remove('playersTurn');
    // TODO inactive chessboard if not your turn
}

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
            case 'start_positions':
                console.log("Received positions.");
                setOfPieces.updateCurrentPiecesPositions(data['positions']);
                setOfPieces.drawPieces();
                break;
            case 'updated_positions_broadcast':
                console.log("Received updated positions.");
                console.log("Update positions.");
                reactOnCheck(data['check']);
                reactOnCheckMate(data['checkmate']);
                setOfPieces.updatePiecePositions(data['updatedPositions']);
                break;
            case 'player_color':
                console.log("Received color info.");
                changeSpotStatus(data["color"], spotStateEnum.me);
                printSpotStatus();
                break;
            case 'free_spots_list':
                console.log("Received free spots list.");
                changeSpotStatus(WHITE_TEAM, data["color"]["white"]);
                changeSpotStatus(BLACK_TEAM, data["color"]["black"]);
                printSpotStatus();
                break;
            case 'new_free_spot':
                console.log("Received free spot.");
                changeSpotStatus(data["color"], spotStateEnum.free);
                printSpotStatus();
                break;
            default:
                console.log("Strange message from server!");
        }
    };

    gameSocket.onclose = function(e) {
        console.error('Game socket closed unexpectedly.');
        $('#socket-alert').show();
    };
}

function sendMessage(jsonMessage) {
    gameSocket.send(JSON.stringify(jsonMessage));
}

function reactOnCheck(check) {
    if (check != null) {
         $('#check-info span').text(check.toUpperCase());
         $('#check-info').show();
    }
    else $('#check-info').hide();
}

function reactOnCheckMate(checkmate) {
    if (checkmate != null) {
         $('#checkmate-info span').text(checkmate.toUpperCase());
         $('#checkmate-info').show();
    }
    else $('#checkmate-info').hide();
}


/*
* based on https://geeksretreat.wordpress.com/2012/06/01/html-5-canvas-chess-board/
*/