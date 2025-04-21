const PlayerType = Object.freeze({ WHITE: 'PLAYER_WHITE', BLACK: 'PLAYER_BLACK' });
const GameState = Object.freeze({ RUNNING: 'GAME_RUNNING', GAME_OVER: 'GAME_OVER' });
const Piece = Object.freeze({ EMPTY: 'EMPTY', ARROW: 'ARROW', BLACK: 'BLACK', WHITE: 'WHITE' });
const Winner = Object.freeze({ NONE: 'NONE', WHITE: 'WHITE', BLACK: 'BLACK' });

class Game {
    constructor(board, api) {
        this.board = board;
        this.api = api;
        this.selected_piece = null;
    }

    reset_game() {
        this.api.reset_game();
    }

    get_game_state() {
        switch (this.api.get_game_state()) {
            case 0:
                return GameState.RUNNING;
            case 1:
                return GameState.GAME_OVER;
            default:
                throw new Error('Invalid game state');
        }
    }

    get_current_player() {
        switch (this.api.get_current_player()) {
            case 0:
                return PlayerType.WHITE;
            case 1:
                return PlayerType.BLACK;
            default:
                throw new Error('Invalid player type');
        }
    }

    get_board() {
        const board_size = 10; // Assuming a fixed size for simplicity
        const board_arr = new Uint32Array(Module.HEAPU8.buffer, this.api.get_board(), board_size * board_size);
        const board = new Array(board_size * board_size).fill(Piece.EMPTY);

        for (let i = 0; i < board_size; i++) {
            for (let j = 0; j < board_size; j++) {
                const index = i * board_size + j;
                
                switch (board_arr[index]) {
                    case 0:
                        board[index] = Piece.EMPTY;
                        break;
                    case 1:
                        board[index] = Piece.ARROW;
                        break;
                    case 2:
                        board[index] = Piece.BLACK;
                        break;
                    case 3:
                        board[index] = Piece.WHITE;
                        break;
                    default:
                        throw new Error('Invalid piece type');
                }
            }
        }

        return board;
    }

    next_player() {
        this.api.next_player();
    }

    calculate_moves(x, y) {
        const count_ptr = this.api.malloc(4);
        const moves_ptr = this.api.calculate_moves(x, y, count_ptr);

        const moves = [];
        const count = new Uint32Array(Module.HEAPU8.buffer, count_ptr, 1)[0];

        for (let i = 0; i < count; i++) {
            const move = new Uint32Array(Module.HEAPU8.buffer, moves_ptr + i * 2 * 4, 2);
            moves.push([move[0], move[1]]);
        }

        this.api.free(moves_ptr);
        this.api.free(count_ptr);

        return moves;
    }

    move_piece(from_x, from_y, to_x, to_y) {
        this.api.move_piece(from_x, from_y, to_x, to_y);
    }

    throw_arrow(x, y) {
        this.api.throw_arrow(x, y);
    }

    check_winner() {
        const winner = this.api.check_winner();
        switch (winner) {
            case 0:
                return Winner.NONE;
            case 1:
                return Winner.WHITE;
            case 2:
                return Winner.BLACK;
            default:
                throw new Error('Invalid winner type');
        }
    }

    get_areas() {
        const board_size = 10; // Assuming a fixed size for simplicity
        const board_arr = new Uint8Array(Module.HEAPU8.buffer, this.api.get_areas(), board_size * board_size);
        const board = new Array(board_size * board_size).fill(0);

        for (let i = 0; i < board_size; i++) {
            for (let j = 0; j < board_size; j++) {
                const index = i * board_size + j;
                board[index] = board_arr[index];
            }
        }

        return board;
    }

    refresh_board(selection = true) {
        const board = this.get_board();
        this.debug_print_board(board);
        this.board.clear_board();
        
        // Update the board with the new state
        this.board.allow_selection = selection;
        this.board.areas = this.get_areas();
        this.board.board = board.map(piece => {
            switch (piece) {
                case Piece.EMPTY:
                    return CellState.EMPTY;
                case Piece.ARROW:
                    return CellState.ARROW;
                case Piece.BLACK:
                    return CellState.PLAYER_BLACK;
                case Piece.WHITE:
                    return CellState.PLAYER_WHITE;
                default:
                    throw new Error('Invalid piece type');
            }
        });
        
        this.board.draw_board();
    }

    select_piece(x, y, color) {
        console.log("Selecting piece at (" + x + ", " + y + ") with color " + color);

        const current_player = this.get_current_player();
        const is_player = 
            (current_player === PlayerType.WHITE && color === CellState.PLAYER_WHITE) ||
            (current_player === PlayerType.BLACK && color === CellState.PLAYER_BLACK);

        if (is_player) {
            this.selected_piece = [x, y];

            const moves = this.calculate_moves(x, y);        
            this.board.possible_moves = moves.map(move => move[1] * this.board.board_size + move[0]);
            this.board.draw_board();
        }
    }

    select_move(x, y) {
        // move the piece to the selected position
        console.log("Moving piece from (" + this.selected_piece[0] + ", " + this.selected_piece[1] + ") to (" + x + ", " + y + ")");
        this.move_piece(this.selected_piece[0], this.selected_piece[1], x, y);
        this.refresh_board(false);

        // show targets
        const moves = this.calculate_moves(x, y);
        this.board.possible_targets = moves.map(move => move[1] * this.board.board_size + move[0]);
        this.board.draw_board();
    }

    select_arrow(x, y) {
        this.throw_arrow(x, y);
        this.refresh_board(false);

        // show possible moves for the next player
        this.next_player();
        this.next_turn();
    }

    setup() {
        console.log('Setting up the game...');

        // Set up the board with the initial state
        this.board.setup_callbacks(
            (x, y, color) => this.select_piece(x, y, color),
            (x, y) => this.select_move(x, y),
            (x, y) => this.select_arrow(x, y)
        );

        // Set up the game state
        this.reset_game();
        this.next_turn();
    }

    next_turn() {
        this.board.possible_moves = [];
        this.board.possible_targets = [];
        this.selected_piece = null;

        if (this.check_winner() !== Winner.NONE) {
            alert('Game Over!');
            this.refresh_board(false);
            return;
        }

        // Update the current player
        this.board.current_player = 
            this.get_current_player() === PlayerType.WHITE 
            ? CellState.PLAYER_WHITE 
            : CellState.PLAYER_BLACK;

        this.refresh_board();
    }

    debug_print_board(board = this.get_board()) {
        // Print the board as a 10x10 table
        for (let i = 0; i < 10; i++) {
            const row = board.slice(i * 10, (i + 1) * 10).map(piece => {
                switch (piece) {
                    case Piece.EMPTY:
                        return '.';
                    case Piece.ARROW:
                        return 'A';
                    case Piece.BLACK:
                        return 'B';
                    case Piece.WHITE:
                        return 'W';
                    default:
                        return '?';
                }
            }).join(' ');
            console.log(row);
        }        
    }
}