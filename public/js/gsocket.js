// Initialize the socket connection
const socket = io(); // Add server URL if needed (e.g., io("http://localhost:3000"))

// Create a BroadcastChannel for cross-tab communication
const channel = new BroadcastChannel("socketChannel");

// Notify other tabs when the socket connects
socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    channel.postMessage({ event: "connect", id: socket.id });
});

// Listen for `gameReady` event from the server
socket.on("gameReady", ({ gameID }) => {
    console.log(`Game ${gameID} is ready.`);
    channel.postMessage({ event: "gameReady", gameID });
});

// Listen for `playerAssigned` event
socket.on("playerAssigned", ({ playerNumber }) => {
    console.log(`You are Player ${playerNumber}`);
    channel.postMessage({ event: "playerAssigned", playerNumber });
});

// Listen for `gameStart` event
socket.on("gameStart", ({ message }) => {
    console.log(message);
    channel.postMessage({ event: "gameStart", message });
});

// Listen for `receiveAttack` event
socket.on("receiveAttack", ({ x, y }) => {
    console.log(`Attack received at (${x}, ${y})`);
    channel.postMessage({ event: "receiveAttack", x, y });
});

// Listen for `receiveResult` event
socket.on("receiveResult", ({ hit }) => {
    console.log(`Attack result: ${hit ? "Hit" : "Miss"}`);
    channel.postMessage({ event: "receiveResult", hit });
});

// Listen for messages from other tabs
channel.onmessage = (message) => {
    const { event, data } = message.data;

    switch (event) {
        case "placeShips":
            socket.emit("placeShips", data.gameID);
            break;
        case "joinLobby":
            socket.emit("joinGame", data.gameID);
            break;
        case "attack":
            socket.emit("attack", { gameID: data.gameID, x: data.x, y: data.y });
            break;
        case "attackResult":
            socket.emit("attackResult", { gameID: data.gameID, hit: data.hit });
            break;
    }
};

// Expose functions for other scripts
window.socketHandler = {
    joinLobby: (gameID) => channel.postMessage({ event: "joinLobby", data: { gameID } }),
    placeShips: (gameID) => channel.postMessage({ event: "placeShips", data: { gameID } }),
    attack: (gameID, x, y) =>
        channel.postMessage({ event: "attack", data: { gameID, x, y } }),
    attackResult: (gameID, hit) =>
        channel.postMessage({ event: "attackResult", data: { gameID, hit } }),
};
