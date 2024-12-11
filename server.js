const http = require("http");
const app = require("./app");
const socketIo = require('socket.io'); // scockets
const connectDB = require("./config/database"); // MongoDB connection function

// dbconnection
connectDB();

// Create an HTTP server
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Join a game room
  socket.on('joinGame', ({ gameId, userId }) => {
    socket.join(gameId);
    console.log(`User ${userId} joined game ${gameId}`);
    io.to(gameId).emit('playerJoined', { userId });
  });

  // Make a move
  socket.on('makeMove', async ({ gameId, userId, move }) => {
    try {
      const game = await Game.findOne({ gameId });

      if (!game) {
        return socket.emit('error', { message: 'Game not found.' });
      }

      if (game.currentTurn.toString() !== userId) {
        return socket.emit('error', { message: 'Not your turn.' });
      }

      // Process the move and update the board
      const player = game.players.find((p) => p.userId.toString() === userId);
      if (!player) {
        return socket.emit('error', { message: 'Player not found in game.' });
      }

      // Update game state (you'd replace this with your move logic)
      player.board = move.updatedBoard;

      // Check for game end conditions (e.g., all ships sunk)
      const opponent = game.players.find((p) => p.userId.toString() !== userId);
      if (opponent && opponent.board.every((row) => row.every((cell) => cell !== 'ship'))) {
        game.gameState = 'completed';
        player.status = 'won';
        opponent.status = 'lost';
      } else {
        // Switch turn
        game.currentTurn = opponent.userId;
      }

      await game.save();
      io.to(gameId).emit('gameStateUpdated', game);
    } catch (err) {
      console.error(err);
      socket.emit('error', { message: 'Failed to make move.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('A player disconnected:', socket.id);
  });
});


PORT = 5000; // comment out after other items are uncommented

// Start listening for incoming requests
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
