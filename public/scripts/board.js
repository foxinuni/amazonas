const CellState = Object.freeze({
    EMPTY: 'EMPTY',
    PLAYER_WHITE: 'PLAYER_WHITE',
    PLAYER_BLACK: 'PLAYER_BLACK',
    ARROW: 'OBSTACLE',
});

const CurrentPlayer = Object.freeze({
    WHITE: 'white',
    BLACK: 'black',
});

const CurrentState = Object.freeze({
    RUNNING: 'running',
    GAME_OVER: 'game over',
});

class Board {
    constructor(element_set, board_size) {
        this.element = element_set.board;
        this.moves_table_element = element_set.moves_table;
        this.winner_overlay_element = element_set.winner_overlay;
        this.winner_text_element = element_set.winner_text;
        this.game_state_element = element_set.game_state;
        this.current_player_element = element_set.current_player;

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

    display_moves_table(moves) {
        if (moves.length === 0) {
            this.moves_table_element.innerHTML = '<tr id="no-moves-message"><td colspan="4" style="text-align:center;">No move has been made.</td></tr>';
            return;
        }

        const white_icon = document.createElement('div');
        white_icon.classList.add('icon-white');

        const black_icon = document.createElement('div');
        black_icon.classList.add('icon-black');

        function position_to_code(x, y) {
            return `${String.fromCharCode(65 + x)}${y + 1}`;
        }

        // color, from, to, arrow
        this.moves_table_element.innerHTML = '';

        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const row = document.createElement('tr');

            const color_cell = document.createElement('td');
            color_cell.classList.add('center');
            if (i % 2 === 0) {
                color_cell.appendChild(white_icon.cloneNode());
            } else {
                color_cell.appendChild(black_icon.cloneNode());
            }
            row.appendChild(color_cell);

            const from_cell = document.createElement('td');
            from_cell.textContent = position_to_code(move.from[0], move.from[1]);
            row.appendChild(from_cell);

            const to_cell = document.createElement('td');
            to_cell.textContent = position_to_code(move.to[0], move.to[1]);
            row.appendChild(to_cell);

            const arrow_cell = document.createElement('td');
            arrow_cell.textContent = position_to_code(move.arrow[0], move.arrow[1]);
            row.appendChild(arrow_cell);

            this.moves_table_element.appendChild(row);
        }
    }

    display_game_state(state, current_player) {
        this.game_state_element.textContent = state;
        this.current_player_element.textContent = current_player;
    }

    display_winner(winner) {
        this.winner_overlay_element.style.display = 'flex';
        this.winner_text_element.textContent = winner;
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