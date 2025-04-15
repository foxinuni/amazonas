#include <iostream>
#include <vector>

#include "interface.hpp"

static Game game;

/* General */
WASM_EXPORT void* wasm_malloc(size_t size) {
    return malloc(size);
}

WASM_EXPORT void wasm_free(void* ptr) {
    free(ptr);
}

/* Game */
WASM_EXPORT void wasm_reset_game() {
    game.reset_game();
    std::cout << "Resetting game..." << std::endl;
}

WASM_EXPORT GameState wasm_get_game_state() {
    return game.get_game_state();
}

WASM_EXPORT Player wasm_get_current_player() {
    return game.get_current_player();

}

WASM_EXPORT PieceType* wasm_get_board() {
    static PieceType board[BOARD_SIZE * BOARD_SIZE];
    const auto& game_board = game.get_board();
    std::copy(game_board.begin(), game_board.end(), board);

    return board;
}

WASM_EXPORT void wasm_next_player() {
    game.next_player();
    std::cout << "Next player: " << game.get_current_player() << std::endl;
}

/* Moves */
WASM_EXPORT Position* wasm_get_moves(int x, int y, int* count) {
    static Position moves[BOARD_SIZE * BOARD_SIZE];

    // Check if the count pointer is valid
    std::vector<Position> valid_moves = game.calculate_moves(x, y);
    *count = valid_moves.size();

    // Copy the valid moves to the output array
    for (int i = 0; i < *count; ++i) {
        moves[i] = valid_moves[i];
    }

    return moves;
}

WASM_EXPORT void wasm_move_piece(int from_x, int from_y, int to_x, int to_y) {
    game.move_piece(from_x, from_y, to_x, to_y);
}

WASM_EXPORT void wasm_throw_arrow(int x, int y) {
    game.throw_arrow(x, y);
}

/* Logic */
WASM_EXPORT Winner wasm_check_winner() {
    Winner winner = game.check_winner();
    std::cout << "Winner: " << winner << std::endl;
    return winner;
}

WASM_EXPORT bool* wasm_get_areas() {
    static bool areas[BOARD_SIZE * BOARD_SIZE] = {false};
    std::array<bool, BOARD_SIZE * BOARD_SIZE> area_flags = game.get_areas();

    for (size_t i = 0; i < area_flags.size(); ++i) {
        areas[i] = area_flags[i];
    }
    
    return areas;
}