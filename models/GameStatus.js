const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
    lobbyId: { type: String, required: true, unique: true }, 
    players: { type: [String] }, // socket ids
    currentTurn: { type: Number, enum: [1, 2], default: 1 }, 
    createdAt: { type: Date, default: Date.now, expires: '1h' } 
});

module.exports = mongoose.model('Lobby', lobbySchema);
