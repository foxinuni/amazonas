#ifndef AMAZONS_INTERFACE_H
#define AMAZONS_INTERFACE_H

#include <emscripten/emscripten.h>
#include "game.h"
#include "moves.h"

#ifdef __cplusplus
#define EXTERN extern "C"
#else
#define EXTERN
#endif

#define WASM_EXPORT EXTERN EMSCRIPTEN_KEEPALIVE

/* General */
WASM_EXPORT void* wasm_malloc(size_t size);
WASM_EXPORT void wasm_free(void* ptr);

/* Game */
WASM_EXPORT void wasm_reset_game();
WASM_EXPORT game_state_t wasm_get_game_state();
WASM_EXPORT player_t wasm_get_current_player();
WASM_EXPORT piece_t* wasm_get_board();

/* Moves */
WASM_EXPORT position_t* wasm_get_moves(int x, int y, int* count);

#endif // AMAZONS_INTERFACE_H