#include "moves.h"
#include "game.h"

#include <stdlib.h>

bool inside_board(int x, int y) {
    return (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE);
}

position_t* calculate_moves(game_t* g, int x, int y, int* count) {
    static position_t directions[] = {
        { 1,  0},
        {-1,  0},
        { 0,  1},
        { 0, -1},
        { 1,  1},
        { 1, -1},
        {-1,  1},
        {-1, -1},
    };


    position_t* moves = malloc(sizeof(position_t) * BOARD_SIZE * BOARD_SIZE);
    *count = 0;

    for (int i = 0; i < arr_len(directions); i++) {
        int current_x = x, current_y = y;
        int direction_x = directions[i].x, direction_y = directions[i].y;

        while (inside_board(current_x += direction_x, current_y += direction_y)) {
            if (g->board[current_x][current_y] == EMPTY) {
                moves[*count] = (position_t) { current_x, current_y };
                *count += 1;
            } else {
                break;
            }
        }
    }

    return moves;
}