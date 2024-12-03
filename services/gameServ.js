const Game = require('../models/Game');
const shortid = require('shortid');

// Function to create a new game
const createGame = async (player1, player2, player1Board, player2Board) => {
  const customGameId = shortid.generate();

  try {
    const game = new Game({
      gameId: customGameId,
      players: [
        { userId: player1._id, username: player1.username, board: player1Board },
        { userId: player2._id, username: player2.username, board: player2Board },
      ],
      currentTurn: player1._id,
    });

    await game.save();
    console.log('Game created:', game);
    return game;
  } catch (err) {
    console.error('Error creating game:', err.message);
    throw err;
  }
};

module.exports = { createGame };
