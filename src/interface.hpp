#ifndef AMAZONS_INTERFACE_H
#define AMAZONS_INTERFACE_H

#include <emscripten/emscripten.h>
#include "game.hpp"


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
WASM_EXPORT GameState wasm_get_game_state();
WASM_EXPORT Player wasm_get_current_player();
WASM_EXPORT PieceType* wasm_get_board();
WASM_EXPORT void wasm_next_player();

/* Moves */
WASM_EXPORT Position* wasm_get_moves(int x, int y, int* count);
WASM_EXPORT void wasm_move_piece(int from_x, int from_y, int to_x, int to_y);
WASM_EXPORT void wasm_throw_arrow(int x, int y);

/* Logic */
WASM_EXPORT Winner wasm_check_winner();
WASM_EXPORT bool* wasm_get_areas();

#endif // AMAZONS_INTERFACE_H