#ifndef AMAZONS_MOVES_H
#define AMAZONS_MOVES_H

#include <stdbool.h>
#include "game.h"
#include "pragma.h"

typedef struct position {
    int x;
    int y;
} position_t;

bool inside_board(int x, int y);
position_t* calculate_moves(game_t* g, int x, int y, int* count);

#endif // AMAZONS_MOVES_H