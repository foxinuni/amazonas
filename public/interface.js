function load_game() {
    /* Constants */
    const board_size = 10;
    const player_enum = ['PLAYER_WHITE', 'PLAYER_BLACK'];
    const game_state_enum = ['GAME_RUNNING', 'GAME_OVER'];
    const pieces_enum = ['EMPTY', 'ARROW', 'BLACK', 'WHITE'];

    /* Interface */
    const malloc = Module.cwrap('wasm_malloc', 'number', ['number']);
    const free = Module.cwrap('wasm_free', null, ['number']);

    const reset_game = Module.cwrap('wasm_reset_game', null, []);
    const get_game_state = Module.cwrap('wasm_get_game_state', 'number', []);
    const get_current_player = Module.cwrap('wasm_get_current_player', 'number', []);
    const get_board = Module.cwrap('wasm_get_board', 'number', []);

    const calculate_moves = Module.cwrap('wasm_get_moves', 'number', ['number', 'number', 'number']);

    /* Elements */
    const loading_element = document.querySelector('#loading-page');
    const main_element = document.querySelector('#game-page');
    const board_element = document.querySelector('.board');

    /* Game state */
    let selected_piece = null;
    const possible_moves_cache = [];

    /* Functions */

    // Returns a 2d array of moves (helper function for calculate_moves)
    function get_moves(x, y) {
        /*
         * This is overly complicated really, but it's literally
         * the only way to pass a dynamically sized array from wasm
         * to javascript.
         */
        const count_ptr = malloc(4); // allocate 4 bytes for an Int32
        const moves_ptr = calculate_moves(x, y, count_ptr);

        // translate array
        const moves = [];
        const count = new Int32Array(Module.HEAPU8.buffer, count_ptr, 1)[0];

        for (let i = 0; i < count; i++) {
            const move = new Int32Array(Module.HEAPU8.buffer, moves_ptr + i * 8, 2);
            moves.push([move[0], move[1]]);
        }

        // free the memory
        free(moves_ptr);
        free(count_ptr);

        return moves;
    }

    function show_game() {
        loading_element.style.display = 'none';
        main_element.style.display = 'flex';
    }

    function setup_board() {
        const cell_element = document.createElement('div');
        cell_element.classList.add('cell');

        for (let i = 0; i < board_size; i++) {
            for (let j = 0; j < board_size; j++) {
                const element = cell_element.cloneNode();

                if ((i + j) % 2 === 0) {
                    element.classList.add('black');
                } else {
                    element.classList.add('white');
                }

                board_element.appendChild(element);
            }
        }
    }

    function clear_board() {
        for (let i = 0; i < board_size * board_size; i++) {
            board_element.children[i].innerHTML = '';
        }
    }

    function draw_board() {
        // get board 
        const board_ptr = get_board();
        const board = new Uint32Array(Module.HEAPU8.buffer, board_ptr, board_size * board_size);

        // get current player
        const current_player = player_enum[get_current_player()];

        // create default piece element
        const piece_element = document.createElement('div');

        for (let i = 0; i < board_size; i++) {
            for (let j = 0; j < board_size; j++) {
                const index = i * board_size + j;
                const piece = pieces_enum[board[index]];
                const cell = board_element.children[index];

                // create new piece
                const element = piece_element.cloneNode()
                switch (piece) {
                    case 'EMPTY':
                        continue;
                    case 'ARROW':
                        element.classList.add('arrow');
                        break;
                    case 'WHITE':
                        element.classList.add('piece', 'player-white');
                        if (current_player === 'PLAYER_WHITE') {
                            setup_piece(element, cell, i, j);
                        }

                        break;
                    case 'BLACK':
                        element.classList.add('piece', 'player-black');

                        // setup piece
                        if (current_player === 'PLAYER_BLACK') {
                            setup_piece(element, cell, i, j);
                        }
                        
                        break;
                }

                cell.appendChild(element);
            }
        }
    }

    function setup_piece(element, cell, i, j) {
        const index = i * board_size + j;

        element.classList.add('enabled');
        element.addEventListener('click', () => {
            if (selected_piece) {
                selected_piece.classList.remove('selected');
            }

            selected_piece = element;
            selected_piece.classList.add('selected');
            
            // clear possible moves
            for (const index of possible_moves_cache) {
                const element = board_element.children[index];
                element.classList.remove('possible-move');
            }

            possible_moves_cache.length = 0;

            // calculate possible moves
            const moves = get_moves(i, j);
            for (const move of moves) {
                const index = move[0] * board_size + move[1];
                const element = board_element.children[index];

                element.classList.add('possible-move');
                possible_moves_cache.push(index);
            }

            cell.classList.add('possible-move');
            possible_moves_cache.push(index);
        })
    }

    function show_game_state() {
        const game_state = game_state_enum[get_game_state()];
        const current_player = player_enum[get_current_player()];

        document.querySelector('#game-state').textContent = (game_state === 'GAME_RUNNING') ? 'Running' : 'Over';
        document.querySelector('#current-player').textContent = (current_player === 'PLAYER_WHITE') ? 'White' : 'Black';
    }

    function setup() {
        reset_game();
        setup_board();
        show_game();
    }

    function update() {
        show_game_state();
        clear_board();
        draw_board();
    }

    setup();
    update();
}

/* 
 * The following code is to load and await for WebAssembly to load.
 * I actually hate that everything needs to be wrapped inside two event
 * listeners, but there's nothing I could figure out that would work.
 * This will do for now...
 */

/* Load WebAssembly */
const script = document.createElement('script');
script.src = 'amazons.js';

/* Wait for WebAssembly to load */
script.addEventListener('load', () => {
    Module.onRuntimeInitialized = load_game;
});

document.body.appendChild(script);