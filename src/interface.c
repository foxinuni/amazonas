#include "interface.h"
#include "moves.h"

#include <stdio.h>
#include <stdlib.h>

static game_t game;

/* General */
WASM_EXPORT void* wasm_malloc(size_t size) {
    return malloc(size);
}

WASM_EXPORT void wasm_free(void* ptr) {
    free(ptr);
}

/* Game */
WASM_EXPORT void wasm_reset_game() {
    printf("Resetting game...\n");
    reset_game(&game);
}

WASM_EXPORT game_state_t wasm_get_game_state() {
    return get_game_state(&game);
}

WASM_EXPORT player_t wasm_get_current_player() {
    return get_current_player(&game);
}

WASM_EXPORT piece_t* wasm_get_board() {
    return get_board(&game);
}

/* Moves */
WASM_EXPORT position_t* wasm_get_moves(int x, int y, int* count) {
    position_t* moves = calculate_moves(&game, x, y, count);
    debug("Found %d moves for (%d, %d)\n", *count, x, y);
    return moves;
}