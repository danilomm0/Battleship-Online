const http = require("http");
const app = require("./app");
const socketIo = require('socket.io'); // scockets
const connectDB = require("./config/database"); // MongoDB connection function
const { getLobbyById } = require("./routes/middleware/fetchData.js");
const Lobby = require("./models/GameStatus.js")
// dbconnection
connectDB();

// Create an HTTP server
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('joinGame', async (gameID) => {
        console.log(`Client ${socket.id} joined lobby ${lobbyId}`);
        let currGame = await getLobbyById(gameID)

        // if (!currGame) {
        //     cGame = new Lobby({gameID, players: [socket.id]})
        //     await cGame.save()
        //     socket.join(gameID);
        //     // socket.emit('playerAssigned', { playerNumber: 1 });
        //     console.log(`Player 1 (${socket.id}) joined lobby ${gameID}`);
        //     return
        // }

        if (currGame.players.length >= 2) {
            return;
        }

        currGame.players.push(socket.id)
        await currGame.save();
        socket.join(gameID);

        const playerNumber = currGame.players.length; 
        socket.emit('playerAssigned', { playerNumber });

        console.log(`Player ${playerNumber} (${socket.id}) joined lobby ${gameID}`);

        if (currGame.players.length === 2) {
            io.to(gameID).emit('gameReady', {gameID});
        }
  
    });

    socket.on('attack', async ({gameID, x, y}) => {
        console.log(`Attack on socket ${socket.id} in gameID ${gameID} at coords ${x},${y}`)

        let currGame = await getLobbyById(gameID)
        const player = currGame.players.indexOf(socket.id) + 1;

        if (player !== currGame.currentTurn) {
            // socket.emit('error', 'not yo turn boy');
            return;
        }

        socket.to(gameID).emit('receiveAttack', {x,y});
    });

    socket.on('attackResult', async ({gameID, hit}) => {
        console.log(`Attack result on socket ${socket.id} in game ${gameID} hit: ${hit}`)
        
        let currGame = await getLobbyById(gameID)

        socket.to(gameID).emit('receiveResult', {hit});

        currGame.currentTurn = currGame.currentTurn === 1 ? 2 : 1;
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
    });
});

PORT = 5000; // comment out after other items are uncommented

// Start listening for incoming requests
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

