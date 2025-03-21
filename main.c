#include <stdio.h>

#define BOARD_SIZE 10

typedef enum piece {
    EMPTY,
    ARROW,
    BLACK,
    WHITE
} piece_t;

static piece_t board[BOARD_SIZE][BOARD_SIZE];

void init_board() {
    for (int i = 0; i < BOARD_SIZE; i++) {
        for (int j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = EMPTY;
        }
    }
}

int main() {
    printf("Hello, World!\n");
    return 0;
}