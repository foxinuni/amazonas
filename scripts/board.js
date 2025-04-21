const CellState = Object.freeze({
    EMPTY: 'EMPTY',
    PLAYER_WHITE: 'PLAYER_WHITE',
    PLAYER_BLACK: 'PLAYER_BLACK',
    ARROW: 'OBSTACLE',
});

class Board {
    constructor(element, board_size) {
        this.element = element;
        this.board_size = board_size;

        // Initialize the board with empty cells
        this.board = new Array(board_size * board_size).fill(CellState.EMPTY);
        this.areas = new Array(board_size * board_size).fill(0);

        this.allow_selection = true;
        this.current_player = CellState.PLAYER_WHITE;
        this.possible_moves = [];
        this.possible_targets = [];
        this.selected_piece = null;

        // Callbacks
        this.select_piece_callback = () => {};
        this.select_move_callback = () => {};
        this.select_arrow_callback = () => {};

        this.init_board();
    }

    init_board() {
        this.element.innerHTML = '';

        for (let y = 0; y < this.board_size; y++) {
            for (let x = 0; x < this.board_size; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell', ((y + x) % 2 === 0) ? 'black' : 'white');
                cell.dataset.row = y;
                cell.dataset.col = x;
                cell.dataset.index = y * this.board_size + x;
                this.element.appendChild(cell);
            }
        }
    }

    clear_board() {
        this.board.fill(CellState.EMPTY);
        this.allow_selection = true;
        this.possible_moves = [];
        this.possible_targets = [];
        this.selected_piece = null;

        for (const cell of this.element.children) {
            cell.innerHTML = '';
            cell.classList.remove('marked');
        }
    }

    draw_board() {
        for (let y = 0; y < this.board_size; y++) {
            for (let x = 0; x < this.board_size; x++) {
                const index = y * this.board_size + x;
                const cell = this.element.children[index];
                const piece = this.board[index];
                const marked = this.areas[index] > 0;

                cell.innerHTML = '';

                if (marked) {
                    cell.classList.add('marked');
                }

                if (piece !== CellState.EMPTY) {
                    const piece_element = document.createElement('div');

                    switch (piece) {
                        case CellState.PLAYER_WHITE:
                            piece_element.classList.add('piece', 'player-white');
                            break;
                        case CellState.PLAYER_BLACK:
                            piece_element.classList.add('piece', 'player-black');
                            break;
                        case CellState.ARROW:
                            piece_element.classList.add('arrow');
                            break;
                    }

                    // Add event listeners for piece selection and move
                    const is_player =
                        (this.current_player === CellState.PLAYER_WHITE && piece === CellState.PLAYER_WHITE) ||
                        (this.current_player === CellState.PLAYER_BLACK && piece === CellState.PLAYER_BLACK);

                    if (this.allow_selection && is_player) {
                        piece_element.classList.add('selectable');
                        piece_element.addEventListener('click', () => { this.select_piece(x, y, piece) });
                    }

                    // Add event listeners for possible moves
                    cell.appendChild(piece_element);
                } else if (this.possible_moves.includes(index)) {
                    const move_element = document.createElement('div');
                    move_element.classList.add('possible-move');

                    move_element.addEventListener('click', () => { this.select_move(x, y) });
                    cell.appendChild(move_element);
                } else if (this.possible_targets.includes(index)) {
                    const target_element = document.createElement('div');
                    target_element.classList.add('possible-target');

                    target_element.addEventListener('click', () => { this.select_arrow(x, y) });
                    cell.appendChild(target_element);
                }
            }
        }
    }

    setup_callbacks(select_piece_callback, select_move_callback, select_arrow_callback) {
        this.select_piece_callback = select_piece_callback;
        this.select_move_callback = select_move_callback;
        this.select_arrow_callback = select_arrow_callback;
    }

    select_piece(x, y, color) {
        const index = y * this.board_size + x;
        const cell = this.element.children[index];
        this.selected_piece = cell;

        this.select_piece_callback(x, y, color);
    }

    select_move(x, y) {
        this.select_move_callback(x, y);
    }

    select_arrow(x, y) {
        this.select_arrow_callback(x, y);
    }
}