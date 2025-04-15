#include "game.hpp"

#include <iostream>
#include <queue>
#include <set>
#include <algorithm>
#include <stdexcept>

std::array<PieceType, BOARD_SIZE * BOARD_SIZE> default_board = {
    EMPTY, EMPTY, EMPTY, BLACK, EMPTY, EMPTY, BLACK, EMPTY, EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
    BLACK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BLACK,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
    WHITE, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WHITE,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, WHITE, EMPTY, EMPTY, WHITE, EMPTY, EMPTY, EMPTY,
};

std::array<Position, 8> directions = {
    Position{1, 0}, Position{-1, 0}, Position{0, 1}, Position{0, -1},
    Position{1, 1}, Position{1, -1}, Position{-1, 1}, Position{-1, -1},
};

Game::Game() {
    // Initialize the game state
    reset_game();
}

Game::Game(const Game& other)
    : state(other.state),
      current_player(other.current_player) {
    std::copy(std::begin(other.board), std::end(other.board), std::begin(board));
}

Game::Game(Game&& other) noexcept
    : state(other.state),
      current_player(other.current_player) {
    std::move(std::begin(other.board), std::end(other.board), std::begin(board));
}

Game& Game::operator=(const Game& other) {
    if (this != &other) {
        state = other.state;
        current_player = other.current_player;
        std::copy(std::begin(other.board), std::end(other.board), std::begin(board));
    }
    return *this;
}

Game& Game::operator=(Game&& other) noexcept {
    if (this != &other) {
        state = other.state;
        current_player = other.current_player;
        std::move(std::begin(other.board), std::end(other.board), std::begin(board));
    }

    return *this;
}

void Game::reset_game() {
    std::copy(std::begin(default_board), std::end(default_board), std::begin(board));
    state = GameState::GAME_RUNNING;
    current_player = Player::PLAYER_WHITE;
}

GameState Game::get_game_state() const {
    return state;
}

Player Game::get_current_player() const {
    return current_player;
}

const std::array<PieceType, BOARD_SIZE * BOARD_SIZE>& Game::get_board() const {
    return board;
}

void Game::next_player() {
    current_player = (current_player == Player::PLAYER_WHITE) ? Player::PLAYER_BLACK : Player::PLAYER_WHITE;
}

void Game::move_piece(int from_x, int from_y, int to_x, int to_y) {
    if (!inside_board(from_x, from_y) || !inside_board(to_x, to_y)) {
        throw std::out_of_range("Move is out of board bounds");
    }

    size_t from_index = translate_position(from_x, from_y);
    size_t to_index = translate_position(to_x, to_y);

    if (board[from_index] == PieceType::EMPTY) {
        throw std::invalid_argument("No piece at the source position");
    }
    
    if (board[to_index] != PieceType::EMPTY) {
        throw std::invalid_argument("Destination position is not empty");
    }
    
    std::swap(board[from_index], board[to_index]);
}

void Game::throw_arrow(int x, int y) {
    if (!inside_board(x, y)) {
        throw std::out_of_range("Arrow position is out of board bounds");
    }

    size_t index = translate_position(x, y);

    if (board[index] != PieceType::EMPTY) {
        throw std::invalid_argument("Arrow position is not empty");
    }

    board[index] = PieceType::ARROW;
}

bool Game::inside_board(int x, int y) const {
    return (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE);
}

std::vector<Position> Game::calculate_moves(int x, int y) const {
    if (!inside_board(x, y)) {
        throw std::out_of_range("Position is out of board bounds");
    }

    std::vector<Position> moves;

    for (const auto& dir : directions) {
        int current_x = x, current_y = y;

        while (inside_board(current_x += dir.x, current_y += dir.y)) {
            size_t index = translate_position(current_x, current_y);
            if (board[index] == PieceType::EMPTY) {
                moves.push_back({current_x, current_y});
            } else {
                break; // Stop at the first non-empty square
            }
        }
    }

    return moves;
}

Winner Game::check_winner() const {
    int trapped_counter = 0;
    int white_counter = 0;
    int black_counter = 0;

    for (int x = 0; x < BOARD_SIZE; ++x) {
        for (int y = 0; y < BOARD_SIZE; ++y) {
            size_t index = translate_position(x, y);
            int area = 0;

            if (board[index] == PieceType::WHITE && (area = trapped_area(x, y).size()) > 0) {
                ++trapped_counter;
                white_counter += area;
            } else if (board[index] == PieceType::BLACK && (area = trapped_area(x, y).size()) > 0) {
                black_counter += area;
            }
        }
    }

    if (trapped_counter == 4) {
        return (white_counter > black_counter) ? Winner::WINNER_WHITE : Winner::WINNER_BLACK;
    } else {
        return Winner::WINNER_NONE; // No winner yet
    }
}

std::vector<Position> Game::trapped_area(int x, int y) const {
    if (!inside_board(x, y)) {
        throw std::out_of_range("Position is out of board bounds");
    }

    std::vector<Position> area;
    std::queue<Position> to_visit;
    std::set<Position> visited;

    Position start = {x, y};
    to_visit.push(start);

    PieceType looking_for = (board[translate_position(x, y)] == PieceType::WHITE) ? PieceType::BLACK : PieceType::WHITE;

    while (!to_visit.empty()) {
        Position current = to_visit.front();
        to_visit.pop();

        if (visited.find(current) != visited.end()) {
            continue;
        }

        visited.insert(current);
        area.push_back(current);

        for (const auto& dir : directions) {
            Position next = {current.x + dir.x, current.y + dir.y};

            if (!inside_board(next.x, next.y)) {
                continue; // Out of bounds
            }

            PieceType next_piece = board[translate_position(next.x, next.y)];

            if (next_piece == looking_for) {
                return {}; // Found a piece of the opposite color - not trapped
            } else if (next_piece == PieceType::EMPTY && visited.find(next) == visited.end()) {
                to_visit.push(next); // Found an empty space - continue searching
            }
        }
    }

    return std::move(area); // All reachable spaces are of the same color - trapped
}

std::array<bool, BOARD_SIZE * BOARD_SIZE> Game::get_areas() const {
    std::array<bool, BOARD_SIZE * BOARD_SIZE> areas = {false};

    for (int y = 0; y < BOARD_SIZE; y++) {
        for (int x = 0; x < BOARD_SIZE; x++) {
            size_t index = translate_position(x, y);

            if (board[index] == PieceType::WHITE || board[index] == PieceType::BLACK) {
                std::vector<Position> area = trapped_area(x, y);

                for (const auto& pos : area) {
                    areas[translate_position(pos.x, pos.y)] = true;
                }
            }
        }
    }

    return areas;
}