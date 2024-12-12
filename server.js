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

    socket.on("rejoinGame", async ({ gameID, playerNumber }) => {
        try {
            console.log(`Client ${socket.id} attempting to rejoin lobby ${gameID} as Player ${playerNumber}`);
            let currGame = await getLobbyById(gameID);

            if (!currGame) {
                socket.emit("error", "Lobby not found");
                return;
            }

            // Ensure the player slot matches the playerNumber
            const playerIndex = playerNumber - 1; // Player 1 maps to index 0
            if (currGame.players[playerIndex] && currGame.players[playerIndex] !== socket.id) {
                currGame.players[playerIndex] = socket.id; // Update to the new socket ID
                await currGame.save();
            }

            socket.join(gameID);
            console.log(`Player ${playerNumber} (${socket.id}) rejoined game ${gameID}`);

            // Send the current game state to the rejoining player
            socket.emit("gameState", { message: "Welcome back to the game!" });
        } catch (error) {
            console.error(`Error in rejoinGame for ${socket.id}:`, error);
            socket.emit("error", "Failed to rejoin the game");
        }
    });

    // Handle joining a game
    socket.on("joinGame", async (gameID) => {
        try {
            console.log(`Client ${socket.id} attempting to join lobby ${gameID}`);
            let currGame = await getLobbyById(gameID);

            if (!currGame) {
                console.log("Lobby is not found");
                socket.emit("error", "Lobby not found");
                return;
            }

            if (currGame.players.length >= 2) {
                console.log("Lobby is full");
                socket.emit("error", "Lobby is full");
                return;
            }

            // Assign player slot if not already in the game
            if (!currGame.players.includes(socket.id)) {
                currGame.players.push(socket.id);
                await currGame.save();
            }

            socket.join(gameID);

            const playerNumber = currGame.players.indexOf(socket.id) + 1; // Get player's slot
            socket.emit("playerAssigned", { playerNumber });

            console.log(`Player ${playerNumber} (${socket.id}) joined lobby ${gameID}`);

            // Notify when the room is ready
            if (currGame.players.length === 2) {
                io.to(gameID).emit("gameReady", { gameID });
            }
        } catch (error) {
            console.error(`Error in joinGame for ${socket.id}:`, error);
            socket.emit("error", "Failed to join the game");
        }
    });

    // Handle placing ships
    socket.on('placeShips', async (gameID) => {
        try {
            let currGame = await getLobbyById(gameID);

            if (!currGame) {
                socket.emit('error', 'Lobby not found');
                return;
            }

            const pIndx = currGame.players.indexOf(socket.id);
            if (pIndx === -1) {
                socket.emit('error', 'Player not in lobby');
                return;
            }

            // Mark this player as ready
            currGame.ready[pIndx] = true;
            await currGame.save();

            // Check if both players are ready
            if (currGame.ready.every((status) => status)) {
                io.to(gameID).emit('gameStart', { message: 'Game is starting!' });
            }
        } catch (error) {
            console.error(`Error in placeShips for ${socket.id}:`, error);
            socket.emit('error', 'Failed to place ships');
        }
    });

    // Handle attacks
    socket.on('attack', async ({ gameID, x, y }) => {
        try {
            console.log(`Attack from ${socket.id} in game ${gameID} at coords (${x}, ${y})`);

            let currGame = await getLobbyById(gameID);

            if (!currGame) {
                socket.emit('error', 'Lobby not found');
                return;
            }

            const player = currGame.players.indexOf(socket.id) + 1;
            if (player !== currGame.currentTurn) {
                socket.emit('error', 'Not your turn');
                return;
            }

            // Send attack to the opponent
            socket.to(gameID).emit('receiveAttack', { x, y });
        } catch (error) {
            console.error(`Error in attack for ${socket.id}:`, error);
            socket.emit('error', 'Failed to process attack');
        }
    });

    // Handle attack results
    socket.on('attackResult', async ({ gameID, hit }) => {
        try {
            console.log(`Attack result from ${socket.id} in game ${gameID}, hit: ${hit}`);

            let currGame = await getLobbyById(gameID);

            if (!currGame) {
                socket.emit('error', 'Lobby not found');
                return;
            }

            // Notify opponent of the attack result
            socket.to(gameID).emit('receiveResult', { hit });

            // Switch turn
            currGame.currentTurn = currGame.currentTurn === 1 ? 2 : 1;
            await currGame.save();
        } catch (error) {
            console.error(`Error in attackResult for ${socket.id}:`, error);
            socket.emit('error', 'Failed to process attack result');
        }
    });

    // Handle player disconnection
    // socket.on('disconnect', async () => {
    //     try {
    //         console.log(`Client disconnected: ${socket.id}`);
    //         let currGame = await findGameByPlayer(socket.id);

    //         if (currGame) {
    //             currGame.players = currGame.players.filter((player) => player !== socket.id);
    //             await currGame.save();

    //             io.to(currGame.lobbyId).emit('playerDisconnected', { playerID: socket.id });
    //             console.log(`Removed player ${socket.id} from game ${currGame.lobbyId}`);
    //         }
    //     } catch (error) {
    //         console.error(`Error handling disconnect for ${socket.id}:`, error);
    //     }
    // });
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

    });
});

PORT = 5000; // comment out after other items are uncommented

// Start listening for incoming requests
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

