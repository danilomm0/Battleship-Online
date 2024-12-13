const mongoose = require('mongoose');

// mongodb connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/battleship');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); // failure to connect just terminate project
  }
};

module.exports = connectDB;
