function start() {
    gameState.playerBoard = placedShips;
    placeRandom();
    gameState.enemyBoard = placedShips;

    gameState.difficulty = JSON.parse(sessionStorage.getItem("difficulty"));

    const serializableGameState = {
        ...gameState,
        playerBoard: Array.from(gameState.playerBoard),
        enemyBoard: Array.from(gameState.enemyBoard),
    };
    
    localStorage.setItem("battleshipGame", JSON.stringify(serializableGameState));
    
    window.location.href = "game.html";

    // d3.select("#difficulty").text(DIFFICULTY[gameState.difficulty]);
    // d3.select("#enemyName").text(DIFFICULTY[gameState.difficulty] + " AI's");
    // console.log(d3.select("#playerBoard2").node());
    // createBoard("#playerBoard2");
    // createBoard("#enemyBoard2");

}

function handleShot(event) {
    // Implementation for handling player shots
}

/////////////////////////////////////////////////////////////////
// I do not know if we need these but they are here if we do
/////////////////////////////////////////////////////////////////

// Saves the current game state to local storage
function saveGameState() {
    localStorage.setItem("battleshipGame", JSON.stringify(gameState));
}

/**
 * Retrieves the game state from local storage
 * @returns {Object|null} Game state object or null if no saved state exists
 */
function loadGameState() {
    const savedState = localStorage.getItem("battleshipGame");
    return savedState ? JSON.parse(savedState) : null;
}
