const http = require('http'); // For creating an HTTP server
const app = require('./app'); // Import the Express app
const dotenv = require('dotenv'); // For loading environment variables
const connectDB = require('./config/database'); // MongoDB connection function


// dbconnection
connectDB();


// Create an HTTP server
const server = http.createServer(app);

PORT = 5000; // comment out after other items are uncommented

// Start listening for incoming requests
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
