#include "game.h"

#include <string.h>

void reset_game(game_t* g) {
    static piece_t default_board[BOARD_SIZE][BOARD_SIZE] = {
        {EMPTY, EMPTY, EMPTY, BLACK, EMPTY, EMPTY, BLACK, EMPTY, EMPTY, EMPTY},
        {EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY},
        {EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY},
        {BLACK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BLACK},
        {EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY},
        {EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY},
        {WHITE, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WHITE},
        {EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY},
        {EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY},
        {EMPTY, EMPTY, EMPTY, WHITE, EMPTY, EMPTY, WHITE, EMPTY, EMPTY, EMPTY},
    };

    // set board to default
    memcpy(g->board, default_board, sizeof(default_board));

    // set current player to white
    g->current_player = PLAYER_WHITE;
}

game_state_t get_game_state(game_t* g) {
    return g->state;
}

player_t get_current_player(game_t* g) {
    return g->current_player;
}

piece_t* get_board(game_t* g) {
    return (piece_t*) g->board;
}