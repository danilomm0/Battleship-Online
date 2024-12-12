const mongoose = require('mongoose');

const globalChat = new mongoose.Schema({
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('GlobalChat', globalChat);
