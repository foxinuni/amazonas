#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

#ifdef __cplusplus
#define EXTERN extern "C"
#else
#define EXTERN
#endif

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

typedef struct value_container {
    int value;
} value_container_t;

value_container_t* generate_container() {
    value_container_t* container = malloc(sizeof(value_container_t));
    container->value = 42;
    return container;
}

EXTERN EMSCRIPTEN_KEEPALIVE int set_value(value_container_t* container, int value) {
    container->value = value;
    return 0;
}

EXTERN EMSCRIPTEN_KEEPALIVE int get_value(value_container_t* container) {
    return container->value;
}

EXTERN EMSCRIPTEN_KEEPALIVE void print_value(value_container_t* container) {
    printf("%d\n", container->value);
}

EXTERN EMSCRIPTEN_KEEPALIVE void free_container(value_container_t* container) {
    free(container);
}

EXTERN EMSCRIPTEN_KEEPALIVE void myFunction(int argc, char ** argv) {
    printf("MyFunction Called\n");
}

int main() {
    printf("Hello, World!\n");
    return 0;
}