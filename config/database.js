const mongoose = require('mongoose');

// MongoDB connection setup
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/battleship', {
      useNewUrlParser: true,       // Parse MongoDB connection strings
      useUnifiedTopology: true,   // Use the new server discovery and monitoring engine
      useCreateIndex: true,       // Ensure indexes are created properly
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
