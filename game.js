/* Constants */
const boardElement = document.querySelector('.board');

/* Game constants */
const boardSize = 10;

/* Game state */
const pieces = {
    a: [[0, 6], [3, 9], [6, 9], [9, 6]],
    b: [[0, 3], [3, 0], [6, 0], [9, 3]]
}

const board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));

/* Graphics */
function clearBoard() {
    while (boardElement.firstChild) {
        boardElement.removeChild(boardElement.firstChild);
    }
}

function drawBoard() {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const newCell = cell.cloneNode();
            if ((i + j) % 2 === 0) {
                newCell.classList.add('black');
            } else {
                newCell.classList.add('white');
            }

            boardElement.appendChild(newCell);
        }
    }
}

function drawPieces() {
    const piece = document.createElement('div');
    piece.classList.add('piece');

    for (let key in pieces) {
        pieces[key].forEach(position => {
            const [x, y] = position;
            const index = y * boardSize + x;
            const cell = boardElement.children[index];
            const newPiece = piece.cloneNode();

            if (key === 'a') {
                newPiece.classList.add('player-a');
            } else {
                newPiece.classList.add('player-b');
            }

            cell.appendChild(newPiece);
        });
    }
}

function update() {
    clearBoard();   
    drawBoard();
    drawPieces();
}

/* Game logic */
function insideBoard(x, y) {
    return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

function calculateMoves(piece) {
    const vectors = [
         [-1, 0],  [1, 0],
         [0, -1],  [0, 1],
        [ 1, -1],  [1, 1],
        [-1, -1], [-1, 1],
    ];

    const moves = [];
    const [x, y] = piece;

    console.table(board);

    for (let vector of vectors) {
        const [dx, dy] = vector;
        const newX = x + dx;
        const newY = y + dy;

        if (insideBoard(newX, newY) && board[newY][newX] === 0) {
            moves.push([newX, newY]);
        }
    }

    return moves;
}

update();

calculateMoves(pieces.a[0]);