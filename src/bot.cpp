#include "bot.hpp"
#include "game.hpp"

#include <climits>
#include <stdexcept>

Bot::Bot(int depth) : minimax_depth(depth) {
    if (depth < 1) {
        throw std::invalid_argument("Minimax depth must be at least 1");
    }
}

std::map<Position, std::vector<Position>> Bot::get_all_moves(const Game& game, Player bot) const {
    std::map<Position, std::vector<Position>> moves;

    const auto& board = game.get_board();
    for (int x = 0; x < BOARD_SIZE; ++x) {
        for (int y = 0; y < BOARD_SIZE; ++y) {
            size_t index = game.translate_position(x, y);
            PieceType piece = board[index];

            if ((bot == Player::PLAYER_WHITE && piece == PieceType::WHITE) ||
                (bot == Player::PLAYER_BLACK && piece == PieceType::BLACK)) {
                auto valid_moves = game.calculate_moves(x, y);

                if (!valid_moves.empty()) {
                    moves[{x, y}] = valid_moves;
                }
            }
        }
    }

    return moves;
}

int Bot::evaluate_player(const Game& game, Player player) const {
    int score = 0;
    const auto& board = game.get_board();

    for (int x = 0; x < BOARD_SIZE; ++x) {
        for (int y = 0; y < BOARD_SIZE; ++y) {
            size_t index = game.translate_position(x, y);
            PieceType piece = board[index];

            if (piece == PieceType::EMPTY || piece == PieceType::ARROW) {
                continue; // Skip empty squares and arrows
            }

            if ((player == Player::PLAYER_WHITE && piece == PieceType::WHITE) ||
                (player == Player::PLAYER_BLACK && piece == PieceType::BLACK)) {
                score += game.calculate_moves(x, y).size(); // Positive score for own pieces
            } else {
                score -= game.calculate_moves(x, y).size(); // Negative score for opponent's pieces
            }
        }
    }

    return score;
}

int Bot::minimax(Game& game, int depth, bool maximizing_player, Player bot, int alpha, int beta) const {
    if (depth == 0 || game.check_winner() != Winner::WINNER_NONE) {
        return this->evaluate_player(game, bot);
    }

    Player oponent = (bot == Player::PLAYER_WHITE) ? Player::PLAYER_BLACK : Player::PLAYER_WHITE;
    auto moves = this->get_all_moves(game, maximizing_player ? bot : oponent);

    int best_value = maximizing_player ? INT_MIN : INT_MAX;

    for (const auto& [from, move_list] : moves) {
        for (const auto& move : move_list) {
            game.move_piece(from.x, from.y, move.x, move.y); // Apply the move

            for (const auto& arrow : game.calculate_moves(move.x, move.y)) {
                game.throw_arrow(arrow.x, arrow.y); // Apply the arrow

                // Recursively call minimax on the next game state
                int value = this->minimax(game, depth - 1, !maximizing_player, bot, alpha, beta);
                if (maximizing_player) {
                    best_value = std::max(best_value, value);
                    alpha = std::max(alpha, best_value);
                } else {
                    best_value = std::min(best_value, value);
                    beta = std::min(beta, best_value);
                }

                game.set_piece(arrow.x, arrow.y, PieceType::EMPTY); // Undo the arrow
            
                if (beta <= alpha) {
                    break; // Alpha-beta pruning
                }
            }

            game.move_piece(move.x, move.y, from.x, from.y);

            if (beta <= alpha) {
                break; // Alpha-beta pruning
            }
        }
    }

    return best_value;
}

BotDecision Bot::make_decision(const Game& game, Player bot) const {
    BotDecision best_decision;
    int best_value = INT_MIN;
    Game game_clone = game;

    auto moves = this->get_all_moves(game, bot);

    for (const auto& [from, move_list] : moves) {
        for (const auto& move : move_list) {
            game_clone.move_piece(from.x, from.y, move.x, move.y); // Apply the move

            for (const auto& arrow : game_clone.calculate_moves(move.x, move.y)) {
                game_clone.throw_arrow(arrow.x, arrow.y); // Apply the arrow

                int value = this->minimax(game_clone, minimax_depth - 1, false, bot, INT_MIN, INT_MAX);
                if (value > best_value) {
                    best_value = value;
                    best_decision = {from, move, arrow};
                }

                game_clone.set_piece(arrow.x, arrow.y, PieceType::EMPTY); // Undo the arrow
            }

            game_clone.move_piece(move.x, move.y, from.x, from.y); // Undo the move
        }
    }

    if (best_value == INT_MIN) {
        throw std::runtime_error("No valid moves found for the bot");
    }

    return best_decision;
}