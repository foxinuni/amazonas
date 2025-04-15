const loading_element = document.querySelector('#loading-page');
const main_element = document.querySelector('#game-page');
const board_element = document.querySelector('#board');

function show_game() {
    loading_element.style.display = 'none';
    main_element.style.display = 'flex';
}

function load_game() {
    const api = {
        malloc: Module.cwrap('wasm_malloc', 'number', ['number']),
        free: Module.cwrap('wasm_free', null, ['number']),
        reset_game: Module.cwrap('wasm_reset_game', null, []),
        get_game_state: Module.cwrap('wasm_get_game_state', 'number', []),
        get_current_player: Module.cwrap('wasm_get_current_player', 'number', []),
        get_board: Module.cwrap('wasm_get_board', 'number', []),
        next_player: Module.cwrap('wasm_next_player', null, []),
        calculate_moves: Module.cwrap('wasm_get_moves', 'number', ['number', 'number', 'number']),
        move_piece: Module.cwrap('wasm_move_piece', null, ['number', 'number', 'number', 'number']),
        throw_arrow: Module.cwrap('wasm_throw_arrow', null, ['number', 'number']),
        check_winner: Module.cwrap('wasm_check_winner', 'number', []),
        get_areas: Module.cwrap('wasm_get_areas', 'number', []),
    };

    const board = new Board(board_element, 10);
    const game = new Game(board, api);
    game.setup(); // Set up the game

    show_game();
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