const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true }, // Custom Game ID
  players: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: { type: String, required: true },
      board: { type: Array, required: true },
      status: { type: String, default: 'in_progress', enum: ['in_progress', 'lost', 'won'] },
    },
  ],
  currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Whose turn it is
  gameState: { type: String, default: 'in_progress', enum: ['in_progress', 'completed'] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Game', gameSchema);
