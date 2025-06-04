const PlayerType = Object.freeze({ WHITE: 'PLAYER_WHITE', BLACK: 'PLAYER_BLACK' });
const GameState = Object.freeze({ RUNNING: 'GAME_RUNNING', GAME_OVER: 'GAME_OVER' });
const Piece = Object.freeze({ EMPTY: 'EMPTY', ARROW: 'ARROW', BLACK: 'BLACK', WHITE: 'WHITE' });
const Winner = Object.freeze({ NONE: 'NONE', WHITE: 'WHITE', BLACK: 'BLACK' });

class Game {
    constructor(board, bot, api) {
        this.board = board;
        this.bot = bot;
        this.api = api;
        this.moves = [];
        this.use_bot = false;
        this.selected_piece = null;
        this.cached_move = { from: [0, 0], move: [0, 0], arrow: [0, 0] };
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
        this.board.display_moves_table(this.moves);
        this.board.display_game_state(
            this.get_game_state() == GameState.RUNNING ? CurrentState.RUNNING : CurrentState.GAME_OVER,
            this.get_current_player() === PlayerType.WHITE ? CurrentPlayer.WHITE : CurrentPlayer.BLACK
        );
    }

    select_piece(x, y, color) {
        console.log("Selecting piece at (" + x + ", " + y + ") with color " + color);
        this.cached_move.from = [x, y];

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
        this.cached_move.to = [x, y];

        this.move_piece(this.selected_piece[0], this.selected_piece[1], x, y);
        this.refresh_board(false);

        // show targets
        const moves = this.calculate_moves(x, y);
        this.board.possible_targets = moves.map(move => move[1] * this.board.board_size + move[0]);
        this.board.draw_board();
    }

    select_arrow(x, y) {
        console.log("Throwing arrow to (" + x + ", " + y + ")");
        this.cached_move.arrow = [x, y];

        this.throw_arrow(x, y);
        this.refresh_board(false);

        // show possible moves for the next player
        this.moves.push({
            from: this.cached_move.from,
            to: this.cached_move.to,
            arrow: this.cached_move.arrow
        });

        this.next_player();
        this.next_turn();
    }

    setup(use_bot = false) {
        this.use_bot = use_bot;
        this.moves = [];

        console.log('Setting up the game... with bot:', use_bot);

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

        if (this.use_bot && this.get_current_player() === PlayerType.BLACK) {
            console.log('Bot is making a decision...');
            this.refresh_board(false);

            const decesion = this.bot.make_decision();
            this.move_piece(
                decesion.from[0], 
                decesion.from[1], 
                decesion.move[0], 
                decesion.move[1]
            );
            
            this.throw_arrow(decesion.arrow[0], decesion.arrow[1]);
            
            this.moves.push({
                from: decesion.from,
                to: decesion.move,
                arrow: decesion.arrow
            });

            this.next_player();
            this.next_turn();
            return;
        }

        if (this.check_winner() !== Winner.NONE) {
            this.refresh_board(false);

            const winner = this.check_winner();
            this.board.display_winner(winner === Winner.WHITE ? CurrentPlayer.WHITE : CurrentPlayer.BLACK)

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
        /*
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
        */
    }
}

class Bot {
    constructor(api) {
        this.api = api;
    }

    make_decision() {
        const decision_ptr = this.api.make_decision();

        const decision = new Uint32Array(Module.HEAPU8.buffer, decision_ptr, 6);
        const from_x = decision[0];
        const from_y = decision[1];

        const move_x = decision[2];
        const move_y = decision[3];

        const arrow_x = decision[4];
        const arrow_y = decision[5];

        return {
            from: [from_x, from_y],
            move: [move_x, move_y],
            arrow: [arrow_x, arrow_y]
        };
    }
}