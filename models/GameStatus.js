const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
    lobbyId: { type: String, required: true, unique: true },
    players: { type: Number, required: true, default: 1, min: 1, max: 2 },
    state: { type: String, required: true, enum: ['waiting', 'ready'], default: 'waiting' },
    createdAt: { type: Date, default: Date.now, expires: '1h' }
});

module.exports = mongoose.model('Lobby', lobbySchema);