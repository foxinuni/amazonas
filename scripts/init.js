const loading_element = document.querySelector('#loading-page');
const main_element = document.querySelector('#game-page');
const board_element = document.querySelector('#board');

// Start overlay
const overlay_element = document.querySelector('#game-overlay');
const start_local_button = document.querySelector('#overlay-local-start');
const start_bot_button = document.querySelector('#overlay-bot-start');

// Winner overlay
const winner_overlay_element = document.querySelector('#winner-overlay');
const winner_text = document.querySelector('#winner-text');

// Controls
const game_state = document.querySelector('#game-state');
const current_player = document.querySelector('#current-player');
const moves_table_element = document.querySelector('#moves-table');

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
        make_decision: Module.cwrap('wasm_make_decision', 'number', []),
    };

    const board = new Board({
        board: board_element, 
        moves_table: moves_table_element,
        winner_overlay: winner_overlay_element,
        winner_text: winner_text,
        game_state: game_state,
        current_player: current_player,
    }, 10);

    const bot = new Bot(api);
    const game = new Game(board, bot, api);

    game.setup(false);

    start_local_button.addEventListener('click', () => {
        game.setup(false);
        overlay_element.style.display = 'none';
    });

    start_bot_button.addEventListener('click', () => {
        game.setup(true);
        overlay_element.style.display = 'none';
    });

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