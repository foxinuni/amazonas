#ifndef AMAZONS_GAME_H
#define AMAZONS_GAME_H

#define arr_len(a) (sizeof(a) / sizeof(a[0]))
#define BOARD_SIZE 10

typedef enum piece {
    EMPTY = 0,
    ARROW,
    BLACK,
    WHITE
} piece_t;

typedef enum player {
    PLAYER_WHITE,
    PLAYER_BLACK
} player_t;

typedef enum game_state {
    GAME_RUNNING,
    GAME_OVER
} game_state_t;

typedef struct game {
    game_state_t state;
    player_t current_player;
    piece_t board[BOARD_SIZE][BOARD_SIZE];
} game_t;

void reset_game(game_t* g);

game_state_t get_game_state(game_t* g);
player_t get_current_player(game_t* g);
piece_t* get_board(game_t* g);

#endif //AMAZONS_GAME_H