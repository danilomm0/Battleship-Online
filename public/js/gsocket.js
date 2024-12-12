const socket = io();

// Handle reconnection
socket.on("connect", () => {
    const gameID = sessionStorage.getItem("gameID");
    const playerNumber = sessionStorage.getItem("playerNumber");
    console.log("Included?");
    if (gameID && playerNumber) {
        console.log(`Rejoining game ${gameID} as Player ${playerNumber}`);
        socket.emit("rejoinGame", { gameID, playerNumber });
    } else {
        console.log("No game state found in sessionStorage.");
    }
});

window.globalSocket = socket;
