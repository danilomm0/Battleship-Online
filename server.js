const http = require("http");
const app = require("./app");
const socketIo = require("socket.io");
const connectDB = require("./config/database"); 
const { getLobbyById } = require("./routes/middleware/fetchData.js");
const Lobby = require("./models/GameStatus.js");
const GlobalChat = require("./models/Chat.js");
// dbconnection
connectDB();
// http server and sio server
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // getting 50 most recent chat items.
  socket.on("getChatHistory", () => {
    try {
      console.log("Requesting message history.");
      GlobalChat.find({})
        .sort({ timestamp: -1 })
        .limit(50)
        .then((messages) => {
          socket.emit("chatHistory", messages.reverse());
        });
    } catch (error) {
      console.log(`Error getting chat history ${error}`)
    }
  });

  // sending a message to the global chat
  socket.on("sendGlobalMsg", async (data) => {
    try {
      const { sender, message } = data;
      const newMsg = new GlobalChat({ sender, message });
      await newMsg.save();

      console.log(`Recieved message ${message} from sender ${sender}`);

      io.emit("receiveGlobalMsg", newMsg);
    } catch (error) {
      console.log(`Error sending global message ${error}`)
    }
  });

  // rejoining a game room from when you reload the page
  socket.on("rejoinGame", async ({ gameID, playerNumber }) => {
    try {
      console.log(
        `Client ${socket.id} attempting to rejoin lobby ${gameID} as player ${playerNumber}`
      );
      let currGame = await getLobbyById(gameID);

      if (!currGame) {
        console.log("Curr game not found")
        return;
      }

      const playerIndex = playerNumber - 1;
      if (
        currGame.players[playerIndex] &&
        currGame.players[playerIndex] !== socket.id
      ) {
        currGame.players[playerIndex] = socket.id; 
        await currGame.save();
      }

      socket.join(gameID);
      console.log(
        `Player ${playerNumber} (${socket.id}) rejoined game ${gameID}`
      );

      // Send the current game state to the rejoining player
      socket.emit("gameState", { message: "Rejoined gamestate" });
    } catch (error) {
      console.error(`Error in rejoinGame for ${socket.id}:`, error);
    }
  });

  // joining a game
  socket.on("joinGame", async (gameID) => {
    try {
      console.log(`Client ${socket.id} attempting to join lobby ${gameID}`);
      let currGame = await getLobbyById(gameID);

      if (!currGame) {
        console.log("Lobby is not found");
        return;
      }

      if (currGame.players.length >= 2) {
        console.log("Lobby is full");
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

      console.log(
        `Player ${playerNumber} (${socket.id}) joined lobby ${gameID}`
      );

      // Notify when the room is ready
      if (currGame.players.length === 2) {
        io.to(gameID).emit("gameReady", { gameID });
      }
    } catch (error) {
      console.error(`Error in joinGame for ${socket.id}:`, error);
    }
  });

  // handle placing ships being ready
  socket.on("placeShips", async ({ gameID, playerID }) => {
    try {
      let currGame = await getLobbyById(gameID);
      console.log(`${gameID} finished placing ships!`);
      if (!currGame) {
        socket.emit("error", "Lobby not found");
        return;
      }

      // mark this player as ready
      currGame.players[playerID - 1] = socket.id;
      currGame.ready[playerID - 1] = true;
      await currGame.save();
      console.log(currGame);
      // check if both players are ready
      if (currGame.ready.every((status) => status)) {
        io.to(gameID).emit("gameStart", { message: "Game starting" });
      }
    } catch (error) {
      console.error(`Error in placeShips for ${socket.id}:`, error);
    }
  });

  // handle incoming attacks
  socket.on("attack", async ({ gameID, playerID, x, y }) => {
    try {
      playerID = parseInt(playerID);
      let currGame = await getLobbyById(gameID);

      if (!currGame) {
        console.log("lobby not found");
        return;
      }

      if (currGame.players[playerID - 1] !== socket.id) {
        currGame.players[playerID - 1] = socket.id;
        await currGame.save();
      }

      if (playerID !== currGame.currentTurn) {
        console.log("not this players turn");
        return;
      }

      console.log(
        `Attack from ${socket.id} in game ${gameID} at coords (${x}, ${y}) by player ${playerID}`
      );

      currGame.currentTurn = currGame.currentTurn === 1 ? 2 : 1;
      await currGame.save();

      // sending attack over socket for opponent
      const recivedPlayerID = playerID;
      socket.to(gameID).emit("receiveAttack", { x, y, recivedPlayerID });
    } catch (error) {
      console.error(`Error in attack for ${socket.id}:`, error);
    }
  });

  // handle attack results
  socket.on("attackResult", async ({ gameID, playerID, list }) => {
    try {
      console.log(`Attack result from ${socket.id} in game ${gameID}`);

      let currGame = await getLobbyById(gameID);

      if (!currGame) {
        socket.emit("error", "Lobby not found");
        return;
      }

      // tell other person back what was the result of this attack
      const recivedPlayerID = playerID;
      socket.to(gameID).emit("receiveResult", { list, recivedPlayerID });
    } catch (error) {
      console.error(`Error in attackResult for ${socket.id}:`, error);
    }
  });

  // socket disconnect
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

PORT = 5000;

// Start listening for incoming requests
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
