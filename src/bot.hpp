#pragma once

#include <map>
#include "game.hpp"

struct BotDecision {
    Position from;
    Position move;
    Position arrow;
};

class Bot {
private:
    int minimax_depth = 3;

    std::map<Position, std::vector<Position>> get_all_moves(const Game& game, Player bot) const;
    int evaluate_player(const Game& game, Player player) const;
    int minimax(Game& game, int depth, bool maximizing_player, Player bot, int alpha, int beta) const;
public:
    Bot(int depth = 3);

    BotDecision make_decision(const Game& game, Player bot) const;
    int get_minimax_depth() const { return minimax_depth; }
};