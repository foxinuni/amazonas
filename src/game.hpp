#pragma once

#include <vector>
#include <array>

#define BOARD_SIZE 10

enum PieceType {
    EMPTY = 0,
    ARROW = 1,
    BLACK = 2,
    WHITE = 3,
};

enum Player {
    PLAYER_WHITE = 0,
    PLAYER_BLACK = 1
};

enum GameState {
    GAME_RUNNING = 0,
    GAME_OVER = 1
};

enum Winner {
    WINNER_NONE = 0,
    WINNER_WHITE = 1,
    WINNER_BLACK = 2,
};

struct Position {
    int x;
    int y;

    bool operator<(const Position& other) const {
        return (x < other.x) || (x == other.x && y < other.y);
    }

    bool operator==(const Position& other) const {
        return x == other.x && y == other.y;
    }
};

class Game {
private:
    std::array<PieceType, BOARD_SIZE * BOARD_SIZE> board;
    Player current_player;
    GameState state;
public:
    Game();
    Game(const Game& other);
    Game(Game&& other) noexcept;
    Game& operator=(const Game& other);
    Game& operator=(Game&& other) noexcept;

    void reset_game();
    void next_player();
    GameState get_game_state() const;
    Player get_current_player() const;

    const std::array<PieceType, BOARD_SIZE * BOARD_SIZE>& get_board() const;

    void move_piece(int from_x, int from_y, int to_x, int to_y);
    void throw_arrow(int x, int y);
    bool inside_board(int x, int y) const;

    std::vector<Position> calculate_moves(int x, int y) const;
    Winner check_winner() const;
    std::vector<Position> trapped_area(int x, int y) const;
    std::array<bool, BOARD_SIZE * BOARD_SIZE> get_areas() const;

    inline size_t translate_position(int x, int y) const {
        return y * BOARD_SIZE + x;
    }
};