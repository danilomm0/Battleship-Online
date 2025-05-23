/**
 * Store the difficulty which is grabbed from the current URL
 */
function storeDifficulty() {
  // url params
  const urlParams = new URLSearchParams(window.location.search);
  const difficulty = urlParams.get("difficulty");
  // store in session cache
  sessionStorage.setItem("gameDifficulty", difficulty);
}

/**
 * Getting current game difficulty from session storage
 *
 * @returns Int -> the game difficulty
 */
function retrieveDifficulty() {
  const difficulty = sessionStorage.getItem("gameDifficulty");
  if (difficulty !== null) {
    return difficulty;
  }
  console.error(
    "Couldnt get the difficulty from session storage :( Returning max difficulty!"
  );
  return 4;
}

/**
 * Storing the playerBoard in the session
 *
 * @param {String} type either pass playerBoard or enemyBoard
 * @param {Map} board the playerboard
 */
function storeGameBoard(type, board) {
  // store board in the session
  sessionStorage.setItem(type, JSON.stringify(Array.from(board)));
}

/**
 * Retriving the game board from the session storage
 *
 * @param {String} type either pass playerBoard or enemyBoard
 * @returns Map of the game board requested
 */
function retrieveGameBoard(type) {
  const storedBoard = sessionStorage.getItem(type);
  if (storedBoard) {
    return new Map(JSON.parse(storedBoard));
  }
  console.error("Couldnt get board from session storage. :(");
  return null;
}

/**
 *
 * @param {*} username The username setting of this user
 */
function writeLoginStatus(username) {
  sessionStorage.setItem("battleShipLogin", username);
}

/**
 * Clears the login status from in the session storage, signifying a logout
 */
function clearLoginStatus() {
  sessionStorage.removeItem("battleShipLogin");
}

/**
 *
 * @returns The username if logged in else null
 */
function getLoginStatus() {
  const username = sessionStorage.getItem("battleShipLogin");
  if (username) {
    return username;
  }
  return null;
}

/**
 * writing a given game id
 *
 * @param {UUID} gameID the game id
 */
function writeGameID(gameID) {
  sessionStorage.setItem("gameID", gameID);
}

/**
 * Writing a given player id
 *
 * @param {Integer} playerID the players id
 */
function writePlayerID(playerID) {
  sessionStorage.setItem("playerNumber", playerID);
}

/**
 * Wiping the current game status
 */
function wipeGameStatus() {
  sessionStorage.removeItem("gameID");
  sessionStorage.removeItem("playerNumber");
}

/**
 * Getting the current gameid
 *
 * @returns the gameID if exists null otherwise
 */
function getGameID() {
  const gameID = sessionStorage.getItem("gameID");
  if (gameID) {
    return gameID;
  }
  return null;
}

/**
 * Getting current players id
 *
 * @returns The playerID if exist null otherwise
 */
function getPlayerID() {
  const playerID = sessionStorage.getItem("playerNumber");
  if (playerID) {
    return playerID;
  }
  return null;
}

/**
 * Sets the chat box state
 *
 * @param {boolean} min true if maximized false otherwise
 */
function setChatBoxState(min) {
  sessionStorage.setItem("CBState", min);
}

/**
 *
 * @returns chat box state
 */
function getChatBoxState() {
  const state = sessionStorage.getItem("CBState");
  return state;
}
